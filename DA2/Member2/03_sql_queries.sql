-- =============================================================================
-- SCRIPT: 03_sql_queries.sql
-- PROJECT: Judicial Case Management and Precedent System
-- MODULE: DA2 Member 2 — Hearings, Judgments & Appeals
-- AUTHOR: Member 2 (Aryan)
-- COMPATIBILITY: Oracle Database 19c / 21c / 23ai / Oracle SQL Developer
-- =============================================================================
-- DESCRIPTION:
-- Implements all 15 required operational and analytical SQL queries for Member 2:
--   Q1.  Complete hearing history of a particular case
--   Q2.  Upcoming hearings
--   Q3.  Past hearings
--   Q4.  Judges forming a particular hearing bench (with judge names)
--   Q5.  Cases that have received judgments
--   Q6.  Cases without a judgment record
--   Q7.  Appeal history from lower court to higher court (with court names)
--   Q8.  Appeals grouped by status (with counts & percentages)
--   Q9.  Time taken between case filing and judgment (resolution duration)
--   Q10. Cases currently under appeal
--   Q11. Time elapsed between judgment and appeal filing (limitation tracking)
--   Q12. Latest judgment for every case (using Analytic ROW_NUMBER)
--   Q13. Hearing schedule with case, court and judge information (LISTAGG)
--   Q14. Cases with multiple hearings but no judgment (procedural bottlenecks)
--   Q15. Cases taking > 2 years to receive judgment and subsequently appealed
-- =============================================================================

SET FEEDBACK ON;
SET SERVEROUTPUT ON;
SET DEFINE OFF;
SET LINESIZE 200;
SET PAGESIZE 50;

-- -----------------------------------------------------------------------------
-- QUERY 1: Complete Hearing History of a Particular Case (CASE_1001)
-- Purpose: Retrieves chronological hearing timeline, courtroom, purpose, status,
--          presiding judges, and judicial remarks for a specific case docket.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 1: Complete Hearing History for Case 'CASE_1001'
PROMPT =====================================================================
SELECT 
    h.hearing_id,
    TO_CHAR(h.hearing_date, 'YYYY-MM-DD') AS hearing_date,
    h.courtroom,
    h.purpose,
    h.hearing_status,
    p.First_Name || ' ' || p.Last_Name AS presiding_judge,
    hb.bench_role,
    h.remarks
FROM HEARING h
JOIN CASES c ON h.case_id = c.Case_ID
LEFT JOIN HEARING_BENCH hb ON h.hearing_id = hb.hearing_id
LEFT JOIN JUDGE j ON hb.judge_id = j.Entity_ID
LEFT JOIN PERSON p ON j.Entity_ID = p.Entity_ID
WHERE h.case_id = 'CASE_1001'
ORDER BY h.hearing_date ASC;

-- -----------------------------------------------------------------------------
-- QUERY 2: Upcoming Hearings
-- Purpose: Lists all scheduled future hearings across the court system with case
--          details, assigned courtroom, and scheduled date.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 2: Upcoming Hearings Across Courts
PROMPT =====================================================================
SELECT 
    h.hearing_id,
    h.case_id,
    c.Title AS case_title,
    ct.Court_Name,
    TO_CHAR(h.hearing_date, 'YYYY-MM-DD') AS scheduled_date,
    h.courtroom,
    h.purpose,
    h.hearing_status
FROM HEARING h
JOIN CASES c ON h.case_id = c.Case_ID
JOIN COURT ct ON c.Court_ID = ct.Court_ID
WHERE h.hearing_status = 'SCHEDULED'
  AND h.hearing_date >= TRUNC(SYSDATE)
ORDER BY h.hearing_date ASC;

-- -----------------------------------------------------------------------------
-- QUERY 3: Past Hearings
-- Purpose: Lists concluded or adjourned hearings with recorded judicial summaries.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 3: Concluded and Past Hearings
PROMPT =====================================================================
SELECT 
    h.hearing_id,
    h.case_id,
    c.Title AS case_title,
    TO_CHAR(h.hearing_date, 'YYYY-MM-DD') AS hearing_date,
    h.courtroom,
    h.purpose,
    h.hearing_status,
    h.remarks
FROM HEARING h
JOIN CASES c ON h.case_id = c.Case_ID
WHERE h.hearing_status IN ('COMPLETED', 'ADJOURNED')
ORDER BY h.hearing_date DESC;

-- -----------------------------------------------------------------------------
-- QUERY 4: Judges Forming a Particular Hearing Bench (HRG_108 & HRG_113)
-- Purpose: Inspects multi-judge bench constitution (Division / Full Bench),
--          including judge names, official judicial ID, and their bench role.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 4: Bench Constitution for Multi-Judge Hearings (HRG_108 & HRG_113)
PROMPT =====================================================================
SELECT 
    hb.hearing_id,
    h.case_id,
    h.purpose,
    hb.bench_role,
    j.Judicial_ID,
    p.First_Name || ' ' || p.Last_Name AS judge_full_name,
    TO_CHAR(j.Appointment_Date, 'YYYY-MM-DD') AS appointment_date,
    ct.Court_Name AS primary_court
FROM HEARING_BENCH hb
JOIN HEARING h ON hb.hearing_id = h.hearing_id
JOIN JUDGE j ON hb.judge_id = j.Entity_ID
JOIN PERSON p ON j.Entity_ID = p.Entity_ID
LEFT JOIN COURT ct ON j.Current_Court_ID = ct.Court_ID
WHERE hb.hearing_id IN ('HRG_108', 'HRG_113')
ORDER BY hb.hearing_id, hb.bench_role DESC;

-- -----------------------------------------------------------------------------
-- QUERY 5: Cases That Have Received Judgments
-- Purpose: Displays all adjudicated cases along with judgment date, outcome,
--          judgment status, and the court delivering the verdict.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 5: Adjudicated Cases with Delivered Judgments
PROMPT =====================================================================
SELECT 
    c.Case_ID,
    c.Title AS case_title,
    ct.Court_Name,
    j.judgment_id,
    TO_CHAR(j.judgment_date, 'YYYY-MM-DD') AS judgment_date,
    j.outcome,
    j.judgment_status
FROM CASES c
JOIN COURT ct ON c.Court_ID = ct.Court_ID
JOIN JUDGMENT j ON c.Case_ID = j.case_id
ORDER BY j.judgment_date DESC;

-- -----------------------------------------------------------------------------
-- QUERY 6: Cases Without a Judgment Record
-- Purpose: Identifies pending or ongoing cases that have not yet reached a final
--          verdict, calculating elapsed days since case initiation.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 6: Active Cases Without a Judgment Record
PROMPT =====================================================================
SELECT 
    c.Case_ID,
    c.Title AS case_title,
    ct.Court_Name,
    TO_CHAR(c.Filing_Date, 'YYYY-MM-DD') AS filing_date,
    c.Status AS case_status,
    ROUND(SYSDATE - c.Filing_Date) AS days_pending_without_judgment
FROM CASES c
JOIN COURT ct ON c.Court_ID = ct.Court_ID
WHERE NOT EXISTS (
    SELECT 1 FROM JUDGMENT j WHERE j.case_id = c.Case_ID
)
ORDER BY days_pending_without_judgment DESC;

-- -----------------------------------------------------------------------------
-- QUERY 7: Appeal History from Lower Court to Higher Court
-- Purpose: Tracks appellate escalation lineage, displaying origin court, appellate
--          court, challenged judgment, and appeal status.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 7: Appellate Escalation Lineage across Court Hierarchy
PROMPT =====================================================================
SELECT 
    a.appeal_id,
    a.case_id,
    c.Title AS case_title,
    a.judgment_id AS challenged_judgment,
    lc.Court_Name AS lower_court_name,
    lc.Tier_Level AS lower_court_tier,
    hc.Court_Name AS higher_court_name,
    hc.Tier_Level AS higher_court_tier,
    TO_CHAR(a.filing_date, 'YYYY-MM-DD') AS appeal_filing_date,
    a.appeal_status,
    a.outcome AS appellate_outcome
FROM APPEAL a
JOIN CASES c ON a.case_id = c.Case_ID
JOIN COURT lc ON a.lower_court_id = lc.Court_ID
JOIN COURT hc ON a.higher_court_id = hc.Court_ID
ORDER BY a.filing_date DESC;

-- -----------------------------------------------------------------------------
-- QUERY 8: Appeals Grouped by Status
-- Purpose: Aggregates appellate docket volume by status (PENDING, ADMITTED,
--          DISPOSED, REJECTED) with total counts and percentage distributions.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 8: Appellate Caseload Distribution Grouped by Status
PROMPT =====================================================================
SELECT 
    appeal_status,
    COUNT(appeal_id) AS total_appeals,
    ROUND(COUNT(appeal_id) * 100.0 / SUM(COUNT(appeal_id)) OVER (), 2) AS percentage_of_total
FROM APPEAL
GROUP BY appeal_status
ORDER BY total_appeals DESC;

-- -----------------------------------------------------------------------------
-- QUERY 9: Time Taken Between Case Filing and Judgment
-- Purpose: Measures judicial resolution efficiency by computing days and years
--          elapsed between initial case filing and judgment delivery.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 9: Case Adjudication Duration (Filing to Judgment)
PROMPT =====================================================================
SELECT 
    c.Case_ID,
    c.Title AS case_title,
    ct.Court_Name,
    TO_CHAR(c.Filing_Date, 'YYYY-MM-DD') AS filing_date,
    TO_CHAR(j.judgment_date, 'YYYY-MM-DD') AS judgment_date,
    j.outcome,
    ROUND(j.judgment_date - c.Filing_Date) AS days_to_judgment,
    ROUND((j.judgment_date - c.Filing_Date) / 365.25, 2) AS years_to_judgment
FROM CASES c
JOIN COURT ct ON c.Court_ID = ct.Court_ID
JOIN JUDGMENT j ON c.Case_ID = j.case_id
ORDER BY days_to_judgment DESC;

-- -----------------------------------------------------------------------------
-- QUERY 10: Cases Currently Under Appeal
-- Purpose: Filters cases with active pending or admitted appellate proceedings.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 10: Cases Currently Sub Judice Under Active Appeal
PROMPT =====================================================================
SELECT 
    a.appeal_id,
    c.Case_ID,
    c.Title AS case_title,
    hc.Court_Name AS appellate_forum,
    TO_CHAR(a.filing_date, 'YYYY-MM-DD') AS appeal_date,
    a.appeal_status,
    a.remarks AS grounds_of_appeal
FROM CASES c
JOIN APPEAL a ON c.Case_ID = a.case_id
JOIN COURT hc ON a.higher_court_id = hc.Court_ID
WHERE a.appeal_status IN ('PENDING', 'ADMITTED')
ORDER BY a.filing_date ASC;

-- -----------------------------------------------------------------------------
-- QUERY 11: Time Elapsed Between Judgment and Appeal Filing
-- Purpose: Evaluates statutory limitation compliance by measuring elapsed days
--          between lower court verdict and appellate petition submission.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 11: Time Elapsed Between Judgment and Appeal Filing
PROMPT =====================================================================
SELECT 
    a.appeal_id,
    a.case_id,
    c.Title AS case_title,
    j.judgment_id,
    TO_CHAR(j.judgment_date, 'YYYY-MM-DD') AS judgment_date,
    TO_CHAR(a.filing_date, 'YYYY-MM-DD') AS appeal_filing_date,
    ROUND(a.filing_date - j.judgment_date) AS days_elapsed_to_appeal,
    CASE 
        WHEN (a.filing_date - j.judgment_date) <= 30 THEN 'Within Standard 30-Day Limit'
        WHEN (a.filing_date - j.judgment_date) <= 90 THEN 'Within Extended 90-Day Limit'
        ELSE 'Condonation of Delay Required (> 90 Days)'
    END AS limitation_status
FROM APPEAL a
JOIN JUDGMENT j ON a.judgment_id = j.judgment_id
JOIN CASES c ON a.case_id = c.Case_ID
ORDER BY days_elapsed_to_appeal ASC;

-- -----------------------------------------------------------------------------
-- QUERY 12: Latest Judgment for Every Case (Analytic ROW_NUMBER)
-- Purpose: Retrieves the single most recent operative judgment per case using
--          the ROW_NUMBER() analytic window function, correctly resolving cases
--          with multiple judgments (such as interim and final decrees).
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 12: Latest Operative Judgment for Every Adjudicated Case
PROMPT =====================================================================
WITH RankedJudgments AS (
    SELECT 
        j.judgment_id,
        j.case_id,
        c.Title AS case_title,
        j.judgment_date,
        j.outcome,
        j.judgment_status,
        ROW_NUMBER() OVER (PARTITION BY j.case_id ORDER BY j.judgment_date DESC, j.judgment_id DESC) AS rank_order
    FROM JUDGMENT j
    JOIN CASES c ON j.case_id = c.Case_ID
)
SELECT 
    case_id,
    case_title,
    judgment_id AS latest_judgment_id,
    TO_CHAR(judgment_date, 'YYYY-MM-DD') AS latest_judgment_date,
    outcome,
    judgment_status
FROM RankedJudgments
WHERE rank_order = 1
ORDER BY judgment_date DESC;

-- -----------------------------------------------------------------------------
-- QUERY 13: Hearing Schedule with Case, Court and Aggregated Bench Judges
-- Purpose: Generates a unified court cause list combining case details, court,
--          hearing date, and all assigned judges formatted via LISTAGG.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 13: Master Hearing Schedule with Aggregated Bench Composition
PROMPT =====================================================================
SELECT 
    h.hearing_id,
    c.Case_ID,
    c.Title AS case_title,
    ct.Court_Name,
    TO_CHAR(h.hearing_date, 'YYYY-MM-DD') AS hearing_date,
    h.courtroom,
    h.purpose,
    h.hearing_status,
    LISTAGG(p.First_Name || ' ' || p.Last_Name || ' (' || hb.bench_role || ')', '; ' ON OVERFLOW TRUNCATE '...' WITHOUT COUNT) 
        WITHIN GROUP (ORDER BY hb.bench_role DESC) AS presiding_bench
FROM HEARING h
JOIN CASES c ON h.case_id = c.Case_ID
JOIN COURT ct ON c.Court_ID = ct.Court_ID
LEFT JOIN HEARING_BENCH hb ON h.hearing_id = hb.hearing_id
LEFT JOIN JUDGE j ON hb.judge_id = j.Entity_ID
LEFT JOIN PERSON p ON j.Entity_ID = p.Entity_ID
GROUP BY 
    h.hearing_id, c.Case_ID, c.Title, ct.Court_Name, 
    h.hearing_date, h.courtroom, h.purpose, h.hearing_status
ORDER BY h.hearing_date ASC;

-- -----------------------------------------------------------------------------
-- QUERY 14: Cases with Multiple Hearings but No Judgment
-- Purpose: Detects protracted litigations undergoing repeated hearings without
--          reaching a decree, identifying potential judicial bottlenecks.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 14: Cases with Multiple Hearings but No Judgment
PROMPT =====================================================================
SELECT 
    c.Case_ID,
    c.Title AS case_title,
    ct.Court_Name,
    c.Status AS case_status,
    COUNT(h.hearing_id) AS total_hearings_held,
    MIN(h.hearing_date) AS first_hearing_date,
    MAX(h.hearing_date) AS latest_hearing_date
FROM CASES c
JOIN COURT ct ON c.Court_ID = ct.Court_ID
JOIN HEARING h ON c.Case_ID = h.case_id
WHERE NOT EXISTS (
    SELECT 1 FROM JUDGMENT j WHERE j.case_id = c.Case_ID
)
GROUP BY c.Case_ID, c.Title, ct.Court_Name, c.Status
HAVING COUNT(h.hearing_id) > 1
ORDER BY total_hearings_held DESC;

-- -----------------------------------------------------------------------------
-- QUERY 15: Cases Taking > 2 Years to Judgment and Subsequently Appealed
-- Purpose: Identifies complex, lengthy cases taking over 730 days from filing
--          to decree that were subsequently escalated to higher appellate courts.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT QUERY 15: Cases Taking > 2 Years to Judgment and Subsequently Appealed
PROMPT =====================================================================
SELECT 
    c.Case_ID,
    c.Title AS case_title,
    TO_CHAR(c.Filing_Date, 'YYYY-MM-DD') AS filing_date,
    j.judgment_id,
    TO_CHAR(j.judgment_date, 'YYYY-MM-DD') AS judgment_date,
    ROUND(j.judgment_date - c.Filing_Date) AS days_to_judgment,
    ROUND((j.judgment_date - c.Filing_Date) / 365.25, 2) AS years_to_judgment,
    a.appeal_id,
    TO_CHAR(a.filing_date, 'YYYY-MM-DD') AS appeal_filing_date,
    hc.Court_Name AS escalated_to_higher_court,
    a.appeal_status
FROM CASES c
JOIN JUDGMENT j ON c.Case_ID = j.case_id
JOIN APPEAL a ON j.judgment_id = a.judgment_id
JOIN COURT hc ON a.higher_court_id = hc.Court_ID
WHERE (j.judgment_date - c.Filing_Date) > 730
ORDER BY days_to_judgment DESC;

PROMPT =====================================================================
PROMPT All 15 Member 2 SQL Queries Executed Successfully!
PROMPT =====================================================================
