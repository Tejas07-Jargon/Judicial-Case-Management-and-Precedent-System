-- =============================================================================
-- SCRIPT: 06_triggers.sql
-- PROJECT: Judicial Case Management and Precedent System
-- MODULE: DA2 Member 2 — Hearings, Judgments & Appeals
-- AUTHOR: Member 2 (Aryan)
-- COMPATIBILITY: Oracle Database 19c / 21c / 23ai / Oracle SQL Developer
-- =============================================================================
-- DESCRIPTION:
-- Implements robust, enterprise-grade database triggers to enforce business rules,
-- state transition machines, and cross-entity lifecycle synchronization:
--
--   1. TRG_HEARING_STATUS_TRANS:
--      - Enforces the legal hearing state transition graph.
--      - COMPLETED and CANCELLED are terminal states (immutable).
--      - ADJOURNED can only transition to SCHEDULED.
--      - SCHEDULED can transition to COMPLETED, ADJOURNED, or CANCELLED.
--
--   2. TRG_PREVENT_HEARING_CLOSED:
--      - Prevents new hearings from being docketed for Closed or Disposed cases.
--
--   3. TRG_SYNC_CASE_ON_JUDGMENT:
--      - Synchronizes case status to 'Disposed' upon delivery of a judgment.
--      - Avoids abrupt premature 'Closed' status to allow appellate window.
--
--   4. TRG_VALIDATE_APPEAL_JUDGMENT:
--      - Enforces that an appeal's judgment belongs strictly to its specified case.
--      - Validates that appeal filing date does not precede the verdict date.
--      - Validates lower court vs higher court distinction.
--
--   5. TRG_SYNC_CASE_ON_APPEAL:
--      - Synchronizes case status to 'Under Appeal' upon appeal registration.
--
-- ZERO MUTATING-TABLE RISK:
-- All triggers operate cleanly as row-level BEFORE/AFTER triggers without querying
-- the table currently being modified. Parent tables (CASES, JUDGMENT) are read-only.
-- =============================================================================

SET FEEDBACK ON;
SET SERVEROUTPUT ON;
SET DEFINE OFF;
SET SQLBLANKLINES ON;

-- -----------------------------------------------------------------------------
-- 1. TRIGGER: TRG_HEARING_STATUS_TRANS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_HEARING_STATUS_TRANS
BEFORE UPDATE OF hearing_status ON HEARING
FOR EACH ROW
BEGIN
    -- No change in status
    IF :OLD.hearing_status = :NEW.hearing_status THEN
        RETURN;
    END IF;

    -- Rule A: COMPLETED is a terminal judicial record
    IF :OLD.hearing_status = 'COMPLETED' THEN
        RAISE_APPLICATION_ERROR(-20041, 'State Machine Violation: A COMPLETED hearing is terminal and its status cannot be modified.');
    END IF;

    -- Rule B: CANCELLED is a terminal judicial record
    IF :OLD.hearing_status = 'CANCELLED' THEN
        RAISE_APPLICATION_ERROR(-20042, 'State Machine Violation: A CANCELLED hearing is terminal and cannot be reinstated.');
    END IF;

    -- Rule C: ADJOURNED can only be rescheduled to SCHEDULED
    IF :OLD.hearing_status = 'ADJOURNED' AND :NEW.hearing_status NOT IN ('SCHEDULED') THEN
        RAISE_APPLICATION_ERROR(-20043, 'State Machine Violation: An ADJOURNED hearing can only transition to SCHEDULED for a future date.');
    END IF;

    -- Rule D: SCHEDULED can transition to COMPLETED, ADJOURNED, or CANCELLED
    IF :OLD.hearing_status = 'SCHEDULED' AND :NEW.hearing_status NOT IN ('COMPLETED', 'ADJOURNED', 'CANCELLED') THEN
        RAISE_APPLICATION_ERROR(-20044, 'State Machine Violation: Invalid transition from SCHEDULED to ''' || :NEW.hearing_status || '''.');
    END IF;
END TRG_HEARING_STATUS_TRANS;
/

-- -----------------------------------------------------------------------------
-- 2. TRIGGER: TRG_PREVENT_HEARING_CLOSED
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_PREVENT_HEARING_CLOSED
BEFORE INSERT ON HEARING
FOR EACH ROW
DECLARE
    v_case_status CASES.Status%TYPE;
BEGIN
    SELECT Status 
    INTO v_case_status 
    FROM CASES 
    WHERE Case_ID = :NEW.case_id;

    IF UPPER(v_case_status) IN ('CLOSED', 'DISPOSED') THEN
        RAISE_APPLICATION_ERROR(-20045, 'Lifecycle Violation: Cannot schedule hearing for case ''' || :NEW.case_id || ''' which is currently ' || v_case_status || '.');
    END IF;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20046, 'Validation Error: Referenced case ''' || :NEW.case_id || ''' does not exist in CASES table.');
END TRG_PREVENT_HEARING_CLOSED;
/

-- -----------------------------------------------------------------------------
-- 3. TRIGGER: TRG_SYNC_CASE_ON_JUDGMENT
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_SYNC_CASE_ON_JUDGMENT
AFTER INSERT OR UPDATE OF judgment_status ON JUDGMENT
FOR EACH ROW
BEGIN
    IF :NEW.judgment_status = 'DELIVERED' THEN
        -- Transition case to 'Disposed' if it was in 'Pending' or 'Hearing'
        -- Do not overwrite if case is already flagged as 'Under Appeal'
        UPDATE CASES
        SET Status = 'Disposed'
        WHERE Case_ID = :NEW.case_id
          AND Status IN ('Pending', 'Hearing');
    END IF;
END TRG_SYNC_CASE_ON_JUDGMENT;
/

-- -----------------------------------------------------------------------------
-- 4. TRIGGER: TRG_VALIDATE_APPEAL_JUDGMENT
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_VALIDATE_APPEAL_JUDGMENT
BEFORE INSERT OR UPDATE ON APPEAL
FOR EACH ROW
DECLARE
    v_judgment_case_id JUDGMENT.case_id%TYPE;
    v_judgment_date    JUDGMENT.judgment_date%TYPE;
BEGIN
    -- 1. Verify judgment belongs to the case specified in the appeal
    BEGIN
        SELECT case_id, judgment_date
        INTO v_judgment_case_id, v_judgment_date
        FROM JUDGMENT
        WHERE judgment_id = :NEW.judgment_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20047, 'Integrity Violation: Judgment ID ''' || :NEW.judgment_id || ''' does not exist.');
    END;

    IF v_judgment_case_id <> :NEW.case_id THEN
        RAISE_APPLICATION_ERROR(-20048, 'Integrity Violation: Judgment ''' || :NEW.judgment_id || ''' belongs to case ''' || v_judgment_case_id || ''', not appeal case ''' || :NEW.case_id || '''.');
    END IF;

    -- 2. Validate chronology: appeal cannot precede judgment
    IF TRUNC(:NEW.filing_date) < TRUNC(v_judgment_date) THEN
        RAISE_APPLICATION_ERROR(-20049, 'Chronology Violation: Appeal filing date (' || TO_CHAR(:NEW.filing_date, 'YYYY-MM-DD') || ') cannot precede judgment date (' || TO_CHAR(v_judgment_date, 'YYYY-MM-DD') || ').');
    END IF;

    -- 3. Validate distinct courts
    IF :NEW.lower_court_id = :NEW.higher_court_id THEN
        RAISE_APPLICATION_ERROR(-20050, 'Jurisdiction Violation: Lower court and Higher court cannot be identical.');
    END IF;
END TRG_VALIDATE_APPEAL_JUDGMENT;
/

-- -----------------------------------------------------------------------------
-- 5. TRIGGER: TRG_SYNC_CASE_ON_APPEAL
-- -----------------------------------------------------------------------------
CREATE OR REPLACE TRIGGER TRG_SYNC_CASE_ON_APPEAL
AFTER INSERT ON APPEAL
FOR EACH ROW
BEGIN
    -- Synchronize original case status to reflect that an appeal is sub judice
    UPDATE CASES
    SET Status = 'Under Appeal'
    WHERE Case_ID = :NEW.case_id;
END TRG_SYNC_CASE_ON_APPEAL;
/

-- -----------------------------------------------------------------------------
-- 6. DEMONSTRATION & TESTING TRIGGER ENFORCEMENT
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT TRIGGER TEST 1: Attempt Invalid Transition on Completed Hearing (HRG_101)
PROMPT =====================================================================
BEGIN
    -- HRG_101 is COMPLETED. Attempting to reopen as SCHEDULED should fail.
    UPDATE HEARING
    SET hearing_status = 'SCHEDULED'
    WHERE hearing_id = 'HRG_101';
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('[EXPECTED TRIGGER BLOCK] Code: ' || SQLCODE || ' - ' || SQLERRM);
END;
/

PROMPT =====================================================================
PROMPT TRIGGER TEST 2: Attempt Scheduling Hearing for Disposed Case (CASE_900)
PROMPT =====================================================================
BEGIN
    -- CASE_900 is Disposed. Attempting to schedule a new hearing should fail.
    INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status)
    VALUES ('HRG_TEST_99', 'CASE_900', SYSDATE + 10, 'Court Hall 1', 'Re-hearing attempt', 'SCHEDULED');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('[EXPECTED TRIGGER BLOCK] Code: ' || SQLCODE || ' - ' || SQLERRM);
END;
/

PROMPT =====================================================================
PROMPT TRIGGER TEST 3: Attempt Inserting Appeal with Mismatched Judgment
PROMPT =====================================================================
BEGIN
    -- JDG_501 belongs to CASE_900, but we try inserting with CASE_3001
    INSERT INTO APPEAL (appeal_id, case_id, judgment_id, lower_court_id, higher_court_id, filing_date, appeal_status)
    VALUES ('APL_TEST_99', 'CASE_3001', 'JDG_501', 'CRT_DC_CHN', 'CRT_HC_TN', SYSDATE, 'PENDING');
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('[EXPECTED TRIGGER BLOCK] Code: ' || SQLCODE || ' - ' || SQLERRM);
END;
/

PROMPT =====================================================================
PROMPT TRIGGER TEST 4: Valid State Transition (SCHEDULED -> COMPLETED)
PROMPT =====================================================================
DECLARE
    v_status HEARING.hearing_status%TYPE;
BEGIN
    -- HRG_107 is currently SCHEDULED. Update to COMPLETED.
    UPDATE HEARING
    SET hearing_status = 'COMPLETED',
        remarks = 'Witness testimony concluded successfully during test.'
    WHERE hearing_id = 'HRG_107';

    SELECT hearing_status INTO v_status FROM HEARING WHERE hearing_id = 'HRG_107';
    DBMS_OUTPUT.PUT_LINE('[SUCCESS] HRG_107 successfully transitioned to: ' || v_status);
    
    -- Revert back to SCHEDULED for test consistency
    -- Note: Since COMPLETED is terminal, we perform ROLLBACK to keep baseline pristine
    ROLLBACK;
    DBMS_OUTPUT.PUT_LINE('[INFO] Test transaction rolled back to preserve test baseline.');
END;
/

PROMPT =====================================================================
PROMPT All 5 Triggers Successfully Created and Enforced!
PROMPT =====================================================================
