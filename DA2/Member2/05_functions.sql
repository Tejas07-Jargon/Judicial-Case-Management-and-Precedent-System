-- =============================================================================
-- SCRIPT: 05_functions.sql
-- PROJECT: Judicial Case Management and Precedent System
-- MODULE: DA2 Member 2 — Hearings, Judgments & Appeals
-- AUTHOR: Member 2 (Aryan)
-- COMPATIBILITY: Oracle Database 19c / 21c / 23ai / Oracle SQL Developer
-- =============================================================================
-- DESCRIPTION:
-- Implements the standalone PL/SQL function CALCULATE_CASE_DURATION:
--   - Input: p_case_id (Case Identifier)
--   - Output: NUMBER (Total elapsed or resolution duration in days)
--
-- Business Rules:
--   1. Validates that p_case_id exists; raises error if missing or NULL.
--   2. If a case has received judgment(s), computes:
--      ROUND(judgment_date - filing_date).
--   3. Multiple Judgments Rule:
--      If multiple judgments exist for a case (e.g., interim orders vs final decrees),
--      the function selects the MAX(judgment_date) as the latest operative decree.
--   4. If no judgment exists, calculates elapsed duration up to current date:
--      ROUND(SYSDATE - filing_date).
--
-- Includes anonymous demonstration blocks with DBMS_OUTPUT.PUT_LINE and
-- direct SQL query invocation.
-- =============================================================================

SET FEEDBACK ON;
SET SERVEROUTPUT ON;
SET DEFINE OFF;
SET SQLBLANKLINES ON;

-- -----------------------------------------------------------------------------
-- 1. FUNCTION: CALCULATE_CASE_DURATION
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION CALCULATE_CASE_DURATION (
    p_case_id IN CASES.Case_ID%TYPE
) RETURN NUMBER IS
    v_filing_date     CASES.Filing_Date%TYPE;
    v_judgment_date   JUDGMENT.judgment_date%TYPE;
    v_duration_days   NUMBER;
    v_judgment_count  NUMBER := 0;
BEGIN
    -- 1. Validate input parameter
    IF p_case_id IS NULL OR TRIM(p_case_id) IS NULL THEN
        RAISE_APPLICATION_ERROR(-20031, 'Input Error: Case ID parameter cannot be NULL or empty.');
    END IF;

    -- 2. Verify Case existence and retrieve Filing Date
    BEGIN
        SELECT Filing_Date
        INTO v_filing_date
        FROM CASES
        WHERE Case_ID = p_case_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20032, 'Validation Error: Case ID ''' || p_case_id || ''' does not exist in the database.');
    END;

    -- 3. Check for Judgment records associated with this case
    -- Explicit Rule for Multiple Judgments:
    -- In accordance with judicial lifecycle specifications, a case may accumulate
    -- multiple judgments (such as interim injunctions, preliminary decrees, or final verdicts).
    -- We select MAX(judgment_date) representing the definitive latest operative verdict.
    SELECT COUNT(*), MAX(judgment_date)
    INTO v_judgment_count, v_judgment_date
    FROM JUDGMENT
    WHERE case_id = p_case_id;

    -- 4. Calculate Duration
    IF v_judgment_count > 0 AND v_judgment_date IS NOT NULL THEN
        -- Case has reached judgment: duration is from filing to final verdict
        v_duration_days := ROUND(v_judgment_date - v_filing_date);
    ELSE
        -- Case is ongoing/pending: duration is elapsed time up to today (SYSDATE)
        v_duration_days := ROUND(SYSDATE - v_filing_date);
    END IF;

    -- Safety check: ensure no negative duration due to anomalous future dates
    IF v_duration_days < 0 THEN
        v_duration_days := 0;
    END IF;

    RETURN v_duration_days;

EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE BETWEEN -20999 AND -20000 THEN
            RAISE;
        ELSE
            RAISE_APPLICATION_ERROR(-20033, 'System Exception in CALCULATE_CASE_DURATION: ' || SQLERRM);
        END IF;
END CALCULATE_CASE_DURATION;
/

-- -----------------------------------------------------------------------------
-- 2. DEMONSTRATION & TESTING VIA DBMS_OUTPUT.PUT_LINE
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT DEMONSTRATION 1: Single Judgment Case (CASE_900)
PROMPT =====================================================================
DECLARE
    v_days NUMBER;
BEGIN
    v_days := CALCULATE_CASE_DURATION('CASE_900');
    DBMS_OUTPUT.PUT_LINE('Case CASE_900 (Historic Fraud): Duration to Verdict = ' || v_days || ' days (' || ROUND(v_days/365.25, 2) || ' years)');
END;
/

PROMPT =====================================================================
PROMPT DEMONSTRATION 2: Multi-Judgment Case (CASE_4001 - Interim & Final Verdict)
PROMPT =====================================================================
DECLARE
    v_days NUMBER;
BEGIN
    -- CASE_4001 has two judgments: JDG_502 (2022-01-20) and JDG_503 (2023-06-30)
    -- Rule uses MAX(judgment_date) = 2023-06-30
    v_days := CALCULATE_CASE_DURATION('CASE_4001');
    DBMS_OUTPUT.PUT_LINE('Case CASE_4001 (Apex Mining): Resolved on latest judgment in ' || v_days || ' days (' || ROUND(v_days/365.25, 2) || ' years)');
END;
/

PROMPT =====================================================================
PROMPT DEMONSTRATION 3: Ongoing Pending Case with No Judgment (CASE_5001)
PROMPT =====================================================================
DECLARE
    v_days NUMBER;
BEGIN
    v_days := CALCULATE_CASE_DURATION('CASE_5001');
    DBMS_OUTPUT.PUT_LINE('Case CASE_5001 (Real Estate Dispute): Active elapsed time = ' || v_days || ' days up to SYSDATE');
END;
/

PROMPT =====================================================================
PROMPT DEMONSTRATION 4: Expected Failure on Invalid Case ID (CASE_9999_XYZ)
PROMPT =====================================================================
DECLARE
    v_days NUMBER;
BEGIN
    v_days := CALCULATE_CASE_DURATION('CASE_9999_XYZ');
    DBMS_OUTPUT.PUT_LINE('Duration: ' || v_days);
EXCEPTION
    WHEN OTHERS THEN
        DBMS_OUTPUT.PUT_LINE('[EXPECTED ERROR] Code: ' || SQLCODE || ' - ' || SQLERRM);
END;
/

PROMPT =====================================================================
PROMPT DEMONSTRATION 5: Invocation from Standard SQL SELECT Statement
PROMPT =====================================================================
SELECT 
    c.Case_ID,
    c.Title,
    c.Status,
    TO_CHAR(c.Filing_Date, 'YYYY-MM-DD') AS filing_date,
    CALCULATE_CASE_DURATION(c.Case_ID) AS duration_in_days,
    ROUND(CALCULATE_CASE_DURATION(c.Case_ID) / 365.25, 2) AS duration_in_years,
    CASE 
        WHEN EXISTS (SELECT 1 FROM JUDGMENT j WHERE j.case_id = c.Case_ID) THEN 'Resolved (Filing to Verdict)'
        ELSE 'Active (Filing to SYSDATE)'
    END AS duration_type
FROM CASES c
ORDER BY duration_in_days DESC;

PROMPT =====================================================================
PROMPT Function CALCULATE_CASE_DURATION Compiled & Tested Successfully!
PROMPT =====================================================================
