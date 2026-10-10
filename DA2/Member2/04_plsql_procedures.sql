-- =============================================================================
-- SCRIPT: 04_plsql_procedures.sql
-- PROJECT: Judicial Case Management and Precedent System
-- MODULE: DA2 Member 2 — Hearings, Judgments & Appeals
-- AUTHOR: Member 2 (Aryan)
-- COMPATIBILITY: Oracle Database 19c / 21c / 23ai / Oracle SQL Developer
-- =============================================================================
-- DESCRIPTION:
-- Implements two critical transactional PL/SQL procedures:
--   1. SCHEDULE_HEARING:
--      - Validates case existence, case lifecycle status, scheduling dates, and inputs.
--      - Inserts the hearing record with initial status 'SCHEDULED'.
--      - Synchronizes case status to 'Hearing' if currently 'Pending'.
--      - Demonstrates success and failed calls (invalid case, past date, closed case).
--
--   2. REGISTER_APPEAL:
--      - Validates case and judgment existence.
--      - Verifies that the referenced judgment belongs to the specified case.
--      - Validates lower court and higher court existence and judicial tier hierarchy.
--      - Enforces statutory chronology (appeal filing cannot precede judgment date).
--      - Rejects duplicate active appeals for the same judgment.
--      - Inserts the appeal with initial status 'PENDING'.
--      - Synchronizes case status to 'Under Appeal'.
--      - Demonstrates success and failed calls (mismatched case/judgment, invalid courts, etc.).
-- =============================================================================

SET FEEDBACK ON;
SET SERVEROUTPUT ON;
SET DEFINE OFF;
SET SQLBLANKLINES ON;

-- -----------------------------------------------------------------------------
-- 1. PROCEDURE: SCHEDULE_HEARING
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE SCHEDULE_HEARING (
    p_case_id       IN  CASES.Case_ID%TYPE,
    p_hearing_date  IN  DATE,
    p_courtroom     IN  VARCHAR2,
    p_purpose       IN  VARCHAR2,
    p_remarks       IN  VARCHAR2 DEFAULT NULL,
    p_hearing_id    OUT VARCHAR2
) IS
    v_case_status   CASES.Status%TYPE;
    v_new_id        VARCHAR2(50);
BEGIN
    SAVEPOINT sp_schedule_hearing;

    -- 1. Validate mandatory inputs
    IF p_case_id IS NULL OR TRIM(p_case_id) IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001, 'Input Error: Case ID cannot be NULL or empty.');
    END IF;

    IF p_hearing_date IS NULL THEN
        RAISE_APPLICATION_ERROR(-20002, 'Input Error: Hearing date is mandatory.');
    END IF;

    IF p_courtroom IS NULL OR TRIM(p_courtroom) IS NULL THEN
        RAISE_APPLICATION_ERROR(-20003, 'Input Error: Courtroom designation is mandatory.');
    END IF;

    IF p_purpose IS NULL OR TRIM(p_purpose) IS NULL THEN
        RAISE_APPLICATION_ERROR(-20004, 'Input Error: Hearing purpose must be specified.');
    END IF;

    -- 2. Verify Case Exists and fetch current status
    BEGIN
        SELECT Status 
        INTO v_case_status 
        FROM CASES 
        WHERE Case_ID = p_case_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20005, 'Validation Error: Case ID ''' || p_case_id || ''' does not exist in the database.');
    END;

    -- 3. Business Rule: Closed or Disposed cases cannot have new hearings scheduled
    IF UPPER(v_case_status) IN ('CLOSED', 'DISPOSED') THEN
        RAISE_APPLICATION_ERROR(-20006, 'Lifecycle Violation: Cannot schedule hearing for a case with status ''' || v_case_status || '''.');
    END IF;

    -- 4. Business Rule: Hearing date cannot be scheduled in the past
    IF TRUNC(p_hearing_date) < TRUNC(SYSDATE) THEN
        RAISE_APPLICATION_ERROR(-20007, 'Scheduling Error: Cannot schedule a future hearing with a past date (' || TO_CHAR(p_hearing_date, 'YYYY-MM-DD') || ').');
    END IF;

    -- 5. Generate Primary Key via Sequence
    v_new_id := 'HRG_' || HEARING_SEQ.NEXTVAL;

    -- 6. Insert new hearing record
    INSERT INTO HEARING (
        hearing_id,
        case_id,
        hearing_date,
        courtroom,
        purpose,
        hearing_status,
        remarks
    ) VALUES (
        v_new_id,
        p_case_id,
        p_hearing_date,
        TRIM(p_courtroom),
        TRIM(p_purpose),
        'SCHEDULED',
        TRIM(p_remarks)
    );

    -- 7. Update Case Status to 'Hearing' if it was 'Pending'
    IF UPPER(v_case_status) = 'PENDING' THEN
        UPDATE CASES
        SET Status = 'Hearing'
        WHERE Case_ID = p_case_id;
    END IF;

    p_hearing_id := v_new_id;
    -- Note: Transaction boundary is controlled by caller (no hardcoded commit)
    
    DBMS_OUTPUT.PUT_LINE('[SUCCESS] Hearing ' || v_new_id || ' scheduled successfully for Case ' || p_case_id || ' on ' || TO_CHAR(p_hearing_date, 'YYYY-MM-DD'));

EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK TO sp_schedule_hearing;
        RAISE_APPLICATION_ERROR(-20008, 'Integrity Error: Duplicate primary key generated for hearing.');
    WHEN VALUE_ERROR THEN
        ROLLBACK TO sp_schedule_hearing;
        RAISE_APPLICATION_ERROR(-20009, 'Data Error: A supplied parameter exceeds the allowed column length.');
    WHEN OTHERS THEN
        ROLLBACK TO sp_schedule_hearing;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSE
            RAISE_APPLICATION_ERROR(-20010, 'System Exception in SCHEDULE_HEARING: ' || SQLERRM);
        END IF;
END SCHEDULE_HEARING;
/

-- -----------------------------------------------------------------------------
-- 2. PROCEDURE: REGISTER_APPEAL
-- -----------------------------------------------------------------------------
CREATE OR REPLACE PROCEDURE REGISTER_APPEAL (
    p_case_id         IN  CASES.Case_ID%TYPE,
    p_judgment_id     IN  JUDGMENT.judgment_id%TYPE,
    p_lower_court_id  IN  COURT.Court_ID%TYPE,
    p_higher_court_id IN  COURT.Court_ID%TYPE,
    p_filing_date     IN  DATE,
    p_remarks         IN  VARCHAR2 DEFAULT NULL,
    p_appeal_id       OUT VARCHAR2
) IS
    v_judgment_case_id   JUDGMENT.case_id%TYPE;
    v_judgment_date      JUDGMENT.judgment_date%TYPE;
    v_lower_tier         COURT.Tier_Level%TYPE;
    v_higher_tier        COURT.Tier_Level%TYPE;
    v_lower_rank         NUMBER;
    v_higher_rank        NUMBER;
    v_active_appeal_cnt  NUMBER := 0;
    v_new_id             VARCHAR2(50);
BEGIN
    SAVEPOINT sp_register_appeal;

    -- 1. Validate mandatory inputs
    IF p_case_id IS NULL OR p_judgment_id IS NULL OR p_lower_court_id IS NULL OR p_higher_court_id IS NULL OR p_filing_date IS NULL THEN
        RAISE_APPLICATION_ERROR(-20011, 'Input Error: Case ID, Judgment ID, Lower Court, Higher Court, and Filing Date are all mandatory.');
    END IF;

    -- 2. Verify that Case exists
    BEGIN
        SELECT 1 INTO v_active_appeal_cnt FROM CASES WHERE Case_ID = p_case_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20012, 'Validation Error: Case ID ''' || p_case_id || ''' does not exist.');
    END;

    -- 3. Verify Judgment exists and retrieve parent case and date
    BEGIN
        SELECT case_id, judgment_date
        INTO v_judgment_case_id, v_judgment_date
        FROM JUDGMENT
        WHERE judgment_id = p_judgment_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20013, 'Validation Error: Judgment ID ''' || p_judgment_id || ''' does not exist.');
    END;

    -- 4. Verify that Judgment belongs to the specified Case or its parent
    IF v_judgment_case_id <> p_case_id THEN
        DECLARE
            v_parent_case_id CASES.Parent_Case_ID%TYPE;
        BEGIN
            SELECT Parent_Case_ID INTO v_parent_case_id FROM CASES WHERE Case_ID = p_case_id;
            IF v_parent_case_id IS NULL OR v_parent_case_id <> v_judgment_case_id THEN
                RAISE_APPLICATION_ERROR(-20014, 'Integrity Mismatch: Judgment ''' || p_judgment_id || ''' belongs to case ''' || v_judgment_case_id || ''', not specified case ''' || p_case_id || ''' or its parent.');
            END IF;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20014, 'Integrity Mismatch: Judgment ''' || p_judgment_id || ''' belongs to case ''' || v_judgment_case_id || ''', not specified case ''' || p_case_id || '''.');
        END;
    END IF;

    -- 5. Business Rule: Lower court and Higher court cannot be identical
    IF p_lower_court_id = p_higher_court_id THEN
        RAISE_APPLICATION_ERROR(-20015, 'Jurisdiction Error: Lower court and Higher court cannot be identical (' || p_lower_court_id || ').');
    END IF;

    -- 6. Verify Lower Court exists and get tier
    BEGIN
        SELECT Tier_Level INTO v_lower_tier FROM COURT WHERE Court_ID = p_lower_court_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20016, 'Validation Error: Lower Court ID ''' || p_lower_court_id || ''' does not exist.');
    END;

    -- 7. Verify Higher Court exists and get tier
    BEGIN
        SELECT Tier_Level INTO v_higher_tier FROM COURT WHERE Court_ID = p_higher_court_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20017, 'Validation Error: Higher Court ID ''' || p_higher_court_id || ''' does not exist.');
    END;

    -- 8. Business Rule: Validate Court Hierarchy
    -- Tier hierarchy values: Subordinate (1) < District (2) < High Court (3) < Supreme (4)
    v_lower_rank := CASE v_lower_tier
        WHEN 'Subordinate' THEN 1
        WHEN 'District'    THEN 2
        WHEN 'High Court'  THEN 3
        WHEN 'Supreme'     THEN 4
        ELSE 0
    END;

    v_higher_rank := CASE v_higher_tier
        WHEN 'Subordinate' THEN 1
        WHEN 'District'    THEN 2
        WHEN 'High Court'  THEN 3
        WHEN 'Supreme'     THEN 4
        ELSE 0
    END;

    IF v_higher_rank <= v_lower_rank THEN
        RAISE_APPLICATION_ERROR(-20018, 'Hierarchy Violation: Appellate court (' || v_higher_tier || ') must have a higher judicial tier than lower court (' || v_lower_tier || ').');
    END IF;

    -- 9. Business Rule: Appeal filing date cannot precede the judgment verdict date
    IF TRUNC(p_filing_date) < TRUNC(v_judgment_date) THEN
        RAISE_APPLICATION_ERROR(-20019, 'Chronology Violation: Appeal filing date (' || TO_CHAR(p_filing_date, 'YYYY-MM-DD') || ') cannot precede the judgment date (' || TO_CHAR(v_judgment_date, 'YYYY-MM-DD') || ').');
    END IF;

    -- 10. Business Rule: Reject duplicate active appeals for the same judgment
    SELECT COUNT(*)
    INTO v_active_appeal_cnt
    FROM APPEAL
    WHERE judgment_id = p_judgment_id
      AND appeal_status IN ('PENDING', 'ADMITTED');

    IF v_active_appeal_cnt > 0 THEN
        RAISE_APPLICATION_ERROR(-20020, 'Duplicate Appeal: An active appeal is already pending/admitted for judgment ''' || p_judgment_id || '''.');
    END IF;

    -- 11. Generate Primary Key via Sequence
    v_new_id := 'APL_' || APPEAL_SEQ.NEXTVAL;

    -- 12. Insert the Appeal Record
    INSERT INTO APPEAL (
        appeal_id,
        case_id,
        judgment_id,
        lower_court_id,
        higher_court_id,
        filing_date,
        appeal_status,
        outcome,
        remarks
    ) VALUES (
        v_new_id,
        p_case_id,
        p_judgment_id,
        p_lower_court_id,
        p_higher_court_id,
        p_filing_date,
        'PENDING',
        NULL,
        TRIM(p_remarks)
    );

    -- 13. Maintain Case Lifecycle: Synchronize case status to 'Under Appeal'
    UPDATE CASES
    SET Status = 'Under Appeal'
    WHERE Case_ID = p_case_id;

    -- If p_case_id was an appellate docket, also update the original trial case
    IF v_judgment_case_id <> p_case_id THEN
        UPDATE CASES
        SET Status = 'Under Appeal'
        WHERE Case_ID = v_judgment_case_id;
    END IF;

    p_appeal_id := v_new_id;
    -- Note: Transaction boundary is controlled by caller (no hardcoded commit)

    DBMS_OUTPUT.PUT_LINE('[SUCCESS] Appeal ' || v_new_id || ' registered successfully for Case ' || p_case_id || ' from ' || v_lower_tier || ' to ' || v_higher_tier);

EXCEPTION
    WHEN DUP_VAL_ON_INDEX THEN
        ROLLBACK TO sp_register_appeal;
        RAISE_APPLICATION_ERROR(-20021, 'Integrity Error: Duplicate primary key generated for appeal.');
    WHEN VALUE_ERROR THEN
        ROLLBACK TO sp_register_appeal;
        RAISE_APPLICATION_ERROR(-20022, 'Data Error: A parameter value exceeds allowable string limits.');
    WHEN OTHERS THEN
        ROLLBACK TO sp_register_appeal;
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSE
            RAISE_APPLICATION_ERROR(-20023, 'System Exception in REGISTER_APPEAL: ' || SQLERRM);
        END IF;
END REGISTER_APPEAL;
/

-- -----------------------------------------------------------------------------
-- 3. DEMONSTRATION & TEST SUITE FOR STORED PROCEDURES
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT DEMONSTRATION 1: SCHEDULE_HEARING (Successful Call)
PROMPT =====================================================================
DECLARE
    v_hid VARCHAR2(50);
BEGIN
    SCHEDULE_HEARING(
        p_case_id      => 'CASE_1001',
        p_hearing_date => SYSDATE + 45,
        p_courtroom    => 'Court Hall 2A',
        p_purpose      => 'Cross Examination of Defense Forensic Analyst',
        p_remarks      => 'Special video-conferencing facility requested.',
        p_hearing_id   => v_hid
    );
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Generated Hearing ID: ' || v_hid);
END;
/

PROMPT =====================================================================
PROMPT DEMONSTRATION 2: SCHEDULE_HEARING (Expected Failure: Non-Existent Case)
PROMPT =====================================================================
DECLARE
    v_hid VARCHAR2(50);
BEGIN
    SCHEDULE_HEARING(
        p_case_id      => 'CASE_9999_GHOST',
        p_hearing_date => SYSDATE + 10,
        p_courtroom    => 'Hall 1',
        p_purpose      => 'Preliminary arguments',
        p_hearing_id   => v_hid
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('[HANDLED ERROR] Code: ' || SQLCODE || ' - ' || SQLERRM);
END;
/

PROMPT =====================================================================
PROMPT DEMONSTRATION 3: SCHEDULE_HEARING (Expected Failure: Scheduling in Past)
PROMPT =====================================================================
DECLARE
    v_hid VARCHAR2(50);
BEGIN
    SCHEDULE_HEARING(
        p_case_id      => 'CASE_1001',
        p_hearing_date => DATE '2020-01-01',
        p_courtroom    => 'Hall 2',
        p_purpose      => 'Backdated hearing test',
        p_hearing_id   => v_hid
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('[HANDLED ERROR] Code: ' || SQLCODE || ' - ' || SQLERRM);
END;
/

PROMPT =====================================================================
PROMPT DEMONSTRATION 4: REGISTER_APPEAL (Successful Call)
PROMPT =====================================================================
DECLARE
    v_aid VARCHAR2(50);
BEGIN
    -- Appeal judgment JDG_505 (on CASE_1001) from District Court to Madras High Court
    REGISTER_APPEAL(
        p_case_id         => 'CASE_1001',
        p_judgment_id     => 'JDG_505',
        p_lower_court_id  => 'CRT_DC_CHN',
        p_higher_court_id => 'CRT_HC_TN',
        p_filing_date     => SYSDATE,
        p_remarks         => 'Interlocutory appeal against partial discharge denial.',
        p_appeal_id       => v_aid
    );
    COMMIT;
    DBMS_OUTPUT.PUT_LINE('Generated Appeal ID: ' || v_aid);
END;
/

PROMPT =====================================================================
PROMPT DEMONSTRATION 5: REGISTER_APPEAL (Expected Failure: Mismatched Judgment)
PROMPT =====================================================================
DECLARE
    v_aid VARCHAR2(50);
BEGIN
    -- Mismatch: JDG_501 belongs to CASE_900, but we specify CASE_1001
    REGISTER_APPEAL(
        p_case_id         => 'CASE_1001',
        p_judgment_id     => 'JDG_501',
        p_lower_court_id  => 'CRT_DC_CHN',
        p_higher_court_id => 'CRT_HC_TN',
        p_filing_date     => SYSDATE,
        p_appeal_id       => v_aid
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('[HANDLED ERROR] Code: ' || SQLCODE || ' - ' || SQLERRM);
END;
/

PROMPT =====================================================================
PROMPT DEMONSTRATION 6: REGISTER_APPEAL (Expected Failure: Identical Courts)
PROMPT =====================================================================
DECLARE
    v_aid VARCHAR2(50);
BEGIN
    REGISTER_APPEAL(
        p_case_id         => 'CASE_1001',
        p_judgment_id     => 'JDG_505',
        p_lower_court_id  => 'CRT_DC_CHN',
        p_higher_court_id => 'CRT_DC_CHN',
        p_filing_date     => SYSDATE,
        p_appeal_id       => v_aid
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('[HANDLED ERROR] Code: ' || SQLCODE || ' - ' || SQLERRM);
END;
/

PROMPT =====================================================================
PROMPT DEMONSTRATION 7: REGISTER_APPEAL (Expected Failure: Invalid Hierarchy)
PROMPT =====================================================================
DECLARE
    v_aid VARCHAR2(50);
BEGIN
    -- Invalid Hierarchy: Madras High Court down to Chennai District Court
    REGISTER_APPEAL(
        p_case_id         => 'CASE_3001',
        p_judgment_id     => 'JDG_506',
        p_lower_court_id  => 'CRT_HC_TN',
        p_higher_court_id => 'CRT_DC_CHN',
        p_filing_date     => SYSDATE,
        p_appeal_id       => v_aid
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('[HANDLED ERROR] Code: ' || SQLCODE || ' - ' || SQLERRM);
END;
/

PROMPT =====================================================================
PROMPT DEMONSTRATION 8: REGISTER_APPEAL (Expected Failure: Duplicate Appeal)
PROMPT =====================================================================
DECLARE
    v_aid VARCHAR2(50);
BEGIN
    -- Duplicate: JDG_505 already has an active appeal registered in Demonstration 4
    REGISTER_APPEAL(
        p_case_id         => 'CASE_1001',
        p_judgment_id     => 'JDG_505',
        p_lower_court_id  => 'CRT_DC_CHN',
        p_higher_court_id => 'CRT_HC_TN',
        p_filing_date     => SYSDATE,
        p_appeal_id       => v_aid
    );
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('[HANDLED ERROR] Code: ' || SQLCODE || ' - ' || SQLERRM);
END;
/

PROMPT =====================================================================
PROMPT Procedures SCHEDULE_HEARING and REGISTER_APPEAL Compiled & Tested!
PROMPT =====================================================================
