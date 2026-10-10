-- =============================================================================
-- SCRIPT: 07_test_cases.sql
-- PROJECT: Judicial Case Management and Precedent System
-- MODULE: DA2 Member 2 — Hearings, Judgments & Appeals
-- AUTHOR: Member 2 (Aryan)
-- COMPATIBILITY: Oracle Database 19c / 21c / 23ai / Oracle SQL Developer
-- =============================================================================
-- DESCRIPTION:
-- Comprehensive automated test harness validating:
--   1. Valid operational workflows (Hearing Creation, Bench Assignment, Appeals)
--   2. Explicit Oracle Exception Handling:
--      - NO_DATA_FOUND
--      - TOO_MANY_ROWS
--      - DUP_VAL_ON_INDEX
--      - VALUE_ERROR
--      - Application Exceptions (-20001 to -20050)
--      - WHEN OTHERS with SQLCODE and SQLERRM diagnostics
--   3. Transaction Integrity:
--      - Deliberate COMMIT, SAVEPOINT, and ROLLBACK verification
--      - Atomic rollback of invalid multi-step operations
-- =============================================================================

SET FEEDBACK ON;
SET SERVEROUTPUT ON;
SET DEFINE OFF;
SET SQLBLANKLINES ON;

DECLARE
    v_total_tests   NUMBER := 0;
    v_passed_tests  NUMBER := 0;
    v_failed_tests  NUMBER := 0;
    v_str_val       VARCHAR2(50);
    v_num_val       NUMBER;
    v_test_caught   BOOLEAN;
    v_err_msg       VARCHAR2(500);

    -- Helper procedure to report test assertions
    PROCEDURE ASSERT_TEST (
        p_test_name IN VARCHAR2,
        p_condition IN BOOLEAN,
        p_details   IN VARCHAR2 DEFAULT NULL
    ) IS
    BEGIN
        v_total_tests := v_total_tests + 1;
        IF p_condition THEN
            v_passed_tests := v_passed_tests + 1;
            DBMS_OUTPUT.PUT_LINE('[PASS] Test ' || v_total_tests || ': ' || p_test_name || CASE WHEN p_details IS NOT NULL THEN ' (' || p_details || ')' END);
        ELSE
            v_failed_tests := v_failed_tests + 1;
            DBMS_OUTPUT.PUT_LINE('[FAIL] Test ' || v_total_tests || ': ' || p_test_name || ' -> FAILED! ' || p_details);
        END IF;
    END;

BEGIN
    DBMS_OUTPUT.PUT_LINE('=====================================================================');
    DBMS_OUTPUT.PUT_LINE('STARTING AUTOMATED MEMBER 2 TEST SUITE & TRANSACTION VALIDATION');
    DBMS_OUTPUT.PUT_LINE('=====================================================================');

    -- -------------------------------------------------------------------------
    -- TEST 1: Exception Handling - NO_DATA_FOUND
    -- Triggering NO_DATA_FOUND when querying a non-existent case in CASES table
    -- -------------------------------------------------------------------------
    v_test_caught := FALSE;
    BEGIN
        SELECT Title INTO v_str_val FROM CASES WHERE Case_ID = 'NON_EXISTENT_CASE_999';
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            v_test_caught := TRUE;
            v_err_msg := 'Trapped standard Oracle NO_DATA_FOUND (ORA-01403)';
        WHEN OTHERS THEN
            v_err_msg := 'Unexpected error: ' || SQLERRM;
    END;
    ASSERT_TEST('Explicit NO_DATA_FOUND Trapping', v_test_caught, v_err_msg);

    -- -------------------------------------------------------------------------
    -- TEST 2: Exception Handling - TOO_MANY_ROWS
    -- Triggering TOO_MANY_ROWS when querying multiple judgments with scalar INTO
    -- -------------------------------------------------------------------------
    v_test_caught := FALSE;
    BEGIN
        -- CASE_4001 has two judgments: JDG_502 and JDG_503
        SELECT judgment_id INTO v_str_val FROM JUDGMENT WHERE case_id = 'CASE_4001';
    EXCEPTION
        WHEN TOO_MANY_ROWS THEN
            v_test_caught := TRUE;
            v_err_msg := 'Trapped standard Oracle TOO_MANY_ROWS (ORA-01422)';
        WHEN OTHERS THEN
            v_err_msg := 'Unexpected error: ' || SQLERRM;
    END;
    ASSERT_TEST('Explicit TOO_MANY_ROWS Trapping on Multi-Judgment Case', v_test_caught, v_err_msg);

    -- -------------------------------------------------------------------------
    -- TEST 3: Exception Handling - DUP_VAL_ON_INDEX
    -- Triggering DUP_VAL_ON_INDEX by inserting an existing primary key
    -- -------------------------------------------------------------------------
    v_test_caught := FALSE;
    BEGIN
        -- HRG_101 already exists in HEARING
        INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status)
        VALUES ('HRG_101', 'CASE_1001', SYSDATE + 1, 'Hall 1', 'Duplicate Test', 'SCHEDULED');
    EXCEPTION
        WHEN DUP_VAL_ON_INDEX THEN
            v_test_caught := TRUE;
            v_err_msg := 'Trapped standard Oracle DUP_VAL_ON_INDEX (ORA-00001)';
        WHEN OTHERS THEN
            v_err_msg := 'Unexpected error: ' || SQLERRM;
    END;
    ASSERT_TEST('Explicit DUP_VAL_ON_INDEX Trapping on Duplicate Hearing ID', v_test_caught, v_err_msg);

    -- -------------------------------------------------------------------------
    -- TEST 4: Exception Handling - VALUE_ERROR
    -- Triggering VALUE_ERROR via numeric/character conversion mismatch
    -- -------------------------------------------------------------------------
    v_test_caught := FALSE;
    BEGIN
        -- Assigning non-numeric string to NUMBER variable
        v_num_val := TO_NUMBER('NOT_A_VALID_NUMBER_XYZ');
    EXCEPTION
        WHEN VALUE_ERROR THEN
            v_test_caught := TRUE;
            v_err_msg := 'Trapped standard Oracle VALUE_ERROR (ORA-06502)';
        WHEN OTHERS THEN
            v_err_msg := 'Unexpected error: ' || SQLERRM;
    END;
    ASSERT_TEST('Explicit VALUE_ERROR Trapping on Conversion Failure', v_test_caught, v_err_msg);

    -- -------------------------------------------------------------------------
    -- TEST 5: Procedure Validation - SCHEDULE_HEARING Valid Workflow
    -- -------------------------------------------------------------------------
    v_test_caught := FALSE;
    BEGIN
        SCHEDULE_HEARING(
            p_case_id      => 'CASE_1001',
            p_hearing_date => SYSDATE + 60,
            p_courtroom    => 'Court Hall 3B',
            p_purpose      => 'Defense Final Submissions',
            p_remarks      => 'Automated test suite creation',
            p_hearing_id   => v_str_val
        );
        -- Verify record exists in DB
        SELECT hearing_id INTO v_str_val FROM HEARING WHERE hearing_id = v_str_val;
        v_test_caught := TRUE;
        v_err_msg := 'Generated hearing ID: ' || v_str_val;
        -- Rollback test insertion to maintain clean test baseline
        ROLLBACK;
    EXCEPTION
        WHEN OTHERS THEN
            ROLLBACK;
            v_err_msg := 'Failure in procedure: ' || SQLERRM;
    END;
    ASSERT_TEST('SCHEDULE_HEARING Valid Execution', v_test_caught, v_err_msg);

    -- -------------------------------------------------------------------------
    -- TEST 6: Procedure Validation - SCHEDULE_HEARING Past Date Rejection
    -- -------------------------------------------------------------------------
    v_test_caught := FALSE;
    BEGIN
        SCHEDULE_HEARING(
            p_case_id      => 'CASE_1001',
            p_hearing_date => DATE '2019-01-01',
            p_courtroom    => 'Court Hall 1',
            p_purpose      => 'Past date test',
            p_hearing_id   => v_str_val
        );
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE = -20007 THEN
                v_test_caught := TRUE;
                v_err_msg := 'Properly rejected with ORA-20007';
            ELSE
                v_err_msg := 'Unexpected code: ' || SQLCODE;
            END IF;
    END;
    ASSERT_TEST('SCHEDULE_HEARING Past Date Validation', v_test_caught, v_err_msg);

    -- -------------------------------------------------------------------------
    -- TEST 7: Procedure Validation - REGISTER_APPEAL Mismatched Judgment
    -- -------------------------------------------------------------------------
    v_test_caught := FALSE;
    BEGIN
        -- JDG_501 belongs to CASE_900; trying to register under CASE_3001
        REGISTER_APPEAL(
            p_case_id         => 'CASE_3001',
            p_judgment_id     => 'JDG_501',
            p_lower_court_id  => 'CRT_DC_CHN',
            p_higher_court_id => 'CRT_HC_TN',
            p_filing_date     => SYSDATE,
            p_appeal_id       => v_str_val
        );
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE = -20014 OR SQLCODE = -20048 THEN
                v_test_caught := TRUE;
                v_err_msg := 'Properly trapped case-judgment mismatch';
            ELSE
                v_err_msg := 'Unexpected code: ' || SQLCODE;
            END IF;
    END;
    ASSERT_TEST('REGISTER_APPEAL Judgment-Case Integrity Check', v_test_caught, v_err_msg);

    -- -------------------------------------------------------------------------
    -- TEST 8: Procedure Validation - REGISTER_APPEAL Invalid Inverted Hierarchy
    -- -------------------------------------------------------------------------
    v_test_caught := FALSE;
    BEGIN
        -- Supreme Court (4) down to District Court (2)
        REGISTER_APPEAL(
            p_case_id         => 'CASE_900',
            p_judgment_id     => 'JDG_501',
            p_lower_court_id  => 'CRT_SC_01',
            p_higher_court_id => 'CRT_DC_CHN',
            p_filing_date     => SYSDATE,
            p_appeal_id       => v_str_val
        );
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE = -20018 THEN
                v_test_caught := TRUE;
                v_err_msg := 'Properly trapped inverted hierarchy (ORA-20018)';
            ELSE
                v_err_msg := 'Unexpected code: ' || SQLCODE;
            END IF;
    END;
    ASSERT_TEST('REGISTER_APPEAL Judicial Tier Hierarchy Check', v_test_caught, v_err_msg);

    -- -------------------------------------------------------------------------
    -- TEST 9: Function Validation - CALCULATE_CASE_DURATION Accuracy
    -- -------------------------------------------------------------------------
    v_test_caught := FALSE;
    BEGIN
        -- CASE_900: Filed 2020-01-10, Judgment 2020-12-15 = Exactly 340 days
        v_num_val := CALCULATE_CASE_DURATION('CASE_900');
        IF v_num_val = 340 THEN
            v_test_caught := TRUE;
            v_err_msg := 'Returned exactly 340 days';
        ELSE
            v_err_msg := 'Expected 340, got ' || v_num_val;
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            v_err_msg := 'Error: ' || SQLERRM;
    END;
    ASSERT_TEST('CALCULATE_CASE_DURATION Accurate Day Calculation', v_test_caught, v_err_msg);

    -- -------------------------------------------------------------------------
    -- TEST 10: Trigger Enforcement - Terminal COMPLETED Hearing State
    -- -------------------------------------------------------------------------
    v_test_caught := FALSE;
    BEGIN
        UPDATE HEARING SET hearing_status = 'SCHEDULED' WHERE hearing_id = 'HRG_101';
    EXCEPTION
        WHEN OTHERS THEN
            IF SQLCODE = -20041 THEN
                v_test_caught := TRUE;
                v_err_msg := 'Trigger TRG_HEARING_STATUS_TRANS enforced (ORA-20041)';
            ELSE
                v_err_msg := 'Unexpected code: ' || SQLCODE;
            END IF;
    END;
    ASSERT_TEST('Trigger Enforcing Terminal COMPLETED Hearing Status', v_test_caught, v_err_msg);

    -- -------------------------------------------------------------------------
    -- TEST 11: Transaction Control - SAVEPOINT and Atomic ROLLBACK
    -- -------------------------------------------------------------------------
    v_test_caught := FALSE;
    BEGIN
        -- Start transaction with explicit SAVEPOINT
        SAVEPOINT test_savepoint_alpha;

        -- Step A: Insert a temporary hearing
        INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status)
        VALUES ('HRG_TX_TEST', 'CASE_1001', SYSDATE + 90, 'Hall 9', 'Transaction Test Hearing', 'SCHEDULED');

        -- Verify Step A row exists in current transaction
        SELECT hearing_id INTO v_str_val FROM HEARING WHERE hearing_id = 'HRG_TX_TEST';

        -- Step B: Rollback to savepoint
        ROLLBACK TO SAVEPOINT test_savepoint_alpha;

        -- Step C: Confirm row no longer exists after rollback
        BEGIN
            SELECT hearing_id INTO v_str_val FROM HEARING WHERE hearing_id = 'HRG_TX_TEST';
            v_err_msg := 'Row still found! Rollback failed.';
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                v_test_caught := TRUE;
                v_err_msg := 'Atomically reverted changes via SAVEPOINT and ROLLBACK';
        END;
    EXCEPTION
        WHEN OTHERS THEN
            v_err_msg := 'Transaction error: ' || SQLERRM;
    END;
    ASSERT_TEST('Transaction Integrity: SAVEPOINT & Isolated ROLLBACK', v_test_caught, v_err_msg);

    -- -------------------------------------------------------------------------
    -- FINAL SUMMARY REPORT
    -- -------------------------------------------------------------------------
    DBMS_OUTPUT.PUT_LINE('=====================================================================');
    DBMS_OUTPUT.PUT_LINE('TEST SUITE EXECUTION SUMMARY:');
    DBMS_OUTPUT.PUT_LINE('  Total Tests Executed : ' || v_total_tests);
    DBMS_OUTPUT.PUT_LINE('  Passed Assertions    : ' || v_passed_tests);
    DBMS_OUTPUT.PUT_LINE('  Failed Assertions    : ' || v_failed_tests);
    IF v_failed_tests = 0 THEN
        DBMS_OUTPUT.PUT_LINE('RESULT: ALL TESTS PASSED! 100% SUCCESS RATE.');
    ELSE
        DBMS_OUTPUT.PUT_LINE('RESULT: SOME TESTS FAILED. PLEASE REVIEW DIAGNOSTICS.');
    END IF;
    DBMS_OUTPUT.PUT_LINE('=====================================================================');

END;
/
