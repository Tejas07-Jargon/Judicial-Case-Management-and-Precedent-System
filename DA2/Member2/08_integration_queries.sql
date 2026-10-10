-- =============================================================================
-- SCRIPT: 08_integration_queries.sql
-- PROJECT: Judicial Case Management and Precedent System
-- MODULE: DA2 Member 2 — Cross-Module Integration Queries
-- AUTHOR: Member 2 (Aryan) in coordination with Member 1 & Member 3
-- COMPATIBILITY: Oracle Database 19c / 21c / 23ai / Oracle SQL Developer
-- =============================================================================
-- DESCRIPTION:
-- Implements five sophisticated cross-module analytical queries joining:
--   - Member 1: COURT, CASES, JUDGE, PERSON, LAWYER, CASE_PARTY, CASE_COUNSEL
--   - Member 2: HEARING, HEARING_BENCH, JUDGMENT, APPEAL
--   - Member 3: CRIMINAL_CASE, CIVIL_CASE, STATUTE_CHARGE, DOCKET_CHARGE_SHEET,
--               CASE_CITATION, PRECEDENT_TAG, CASE_TAG_MAPPING
--
-- Validates relational consistency, foreign key integrity, and end-to-end
-- information flows across the judicial management lifecycle.
-- =============================================================================

SET FEEDBACK ON;
SET SERVEROUTPUT ON;
SET DEFINE OFF;
SET LINESIZE 220;
SET PAGESIZE 60;

-- -----------------------------------------------------------------------------
-- QUERY 1: The Master Judicial Docket (Full 3-Member Integration)
-- Integrates: Member 1 (Court, Case Title, Filing Date),
--             Member 2 (Hearing Count, Last Hearing Date, Latest Judgment & Date),
--             Member 3 (Criminal FIR, Civil Claim, Applied Statute Charges)
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT INTEGRATION QUERY 1: Master Case Dossier (All 3 Members Joined)
PROMPT =====================================================================
SELECT 
    ct.Court_Name,
    c.Case_ID,
    c.Title AS case_title,
    CASE 
        WHEN crim.Case_ID IS NOT NULL THEN 'Criminal (FIR: ' || NVL(crim.FIR_Or_Complaint_No, 'N/A') || ')'
        WHEN civ.Case_ID IS NOT NULL  THEN 'Civil (Value: Rs ' || TO_CHAR(civ.Dispute_Value, 'FM99,99,99,999') || ')'
        ELSE 'General'
    END AS case_category,
    COUNT(DISTINCT h.hearing_id) AS total_hearings,
    TO_CHAR(MAX(h.hearing_date), 'YYYY-MM-DD') AS latest_hearing_date,
    NVL(MAX(j.outcome) KEEP (DENSE_RANK LAST ORDER BY j.judgment_date NULLS FIRST, j.judgment_id), 'Pending Adjudication') AS latest_verdict,
    TO_CHAR(MAX(j.judgment_date), 'YYYY-MM-DD') AS verdict_date,
    c.Status AS current_lifecycle_status
FROM CASES c
JOIN COURT ct ON c.Court_ID = ct.Court_ID
LEFT JOIN CRIMINAL_CASE crim ON c.Case_ID = crim.Case_ID
LEFT JOIN CIVIL_CASE civ     ON c.Case_ID = civ.Case_ID
LEFT JOIN HEARING h          ON c.Case_ID = h.case_id
LEFT JOIN JUDGMENT j         ON c.Case_ID = j.case_id
GROUP BY 
    ct.Court_Name, c.Case_ID, c.Title, 
    crim.Case_ID, crim.FIR_Or_Complaint_No, 
    civ.Case_ID, civ.Dispute_Value, c.Status
ORDER BY c.Case_ID ASC;

-- -----------------------------------------------------------------------------
-- QUERY 2: Precedent Citation Effectiveness & Appellate Challenge Tracking
-- Integrates: Member 3 (CASE_CITATION, PRECEDENT_TAG, CASE_TAG_MAPPING),
--             Member 2 (JUDGMENT, APPEAL),
--             Member 1 (CASES, COURT)
-- Purpose: Identifies judgments that cited historical precedents, cross-referencing
--          whether the citing case was subsequently appealed in superior courts.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT INTEGRATION QUERY 2: Precedent Citation & Appellate Impact
PROMPT =====================================================================
SELECT 
    cite.Citation_ID,
    c_citing.Case_ID AS citing_case_id,
    c_citing.Title AS citing_case_name,
    c_precedent.Case_ID AS precedent_case_id,
    c_precedent.Title AS precedent_case_name,
    pt.Keyword AS legal_taxonomy_tag,
    cite.Relevance_Note,
    j_citing.judgment_id AS citing_judgment_id,
    j_citing.outcome AS citing_verdict,
    NVL(a.appeal_status, 'No Appeal Filed') AS appellate_challenge_status,
    hc.Court_Name AS appellate_review_court
FROM CASE_CITATION cite
JOIN CASES c_citing ON cite.Citing_Case_ID = c_citing.Case_ID
JOIN CASES c_precedent ON cite.Cited_Precedent_Case_ID = c_precedent.Case_ID
LEFT JOIN CASE_TAG_MAPPING ctm ON c_precedent.Case_ID = ctm.Case_ID
LEFT JOIN PRECEDENT_TAG pt ON ctm.Tag_ID = pt.Tag_ID
LEFT JOIN JUDGMENT j_citing ON c_citing.Case_ID = j_citing.case_id
LEFT JOIN APPEAL a ON c_citing.Case_ID = a.case_id
LEFT JOIN COURT hc ON a.higher_court_id = hc.Court_ID
ORDER BY cite.Citation_ID ASC;

-- -----------------------------------------------------------------------------
-- QUERY 3: Counsel Representation and Appellate Escapes
-- Integrates: Member 1 (LAWYER, PERSON, CASE_COUNSEL, CASE_PARTY),
--             Member 2 (JUDGMENT, APPEAL),
--             Member 1 (CASES)
-- Purpose: Analyzes defense and prosecution counsel performance in cases that
--          received judgments and were subsequently escalated to higher courts.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT INTEGRATION QUERY 3: Legal Counsel Performance & Appellate Escalation
PROMPT =====================================================================
SELECT 
    l.License_No,
    p_lawyer.First_Name || ' ' || p_lawyer.Last_Name AS advocate_name,
    l.Firm_Name,
    cp.Party_Role,
    c.Case_ID,
    c.Title AS case_title,
    j.outcome AS trial_judgment_outcome,
    TO_CHAR(j.judgment_date, 'YYYY-MM-DD') AS verdict_date,
    NVL(a.appeal_id, 'None') AS appeal_docket,
    NVL(a.appeal_status, 'Uncontested') AS appeal_status,
    a.outcome AS appellate_verdict
FROM LAWYER l
JOIN PERSON p_lawyer ON l.Entity_ID = p_lawyer.Entity_ID
JOIN CASE_COUNSEL cc ON l.Entity_ID = cc.Lawyer_ID
JOIN CASE_PARTY cp ON cc.Party_ID = cp.Party_ID
JOIN CASES c ON cp.Case_ID = c.Case_ID
LEFT JOIN JUDGMENT j ON c.Case_ID = j.case_id
LEFT JOIN APPEAL a ON c.Case_ID = a.case_id
ORDER BY advocate_name, c.Case_ID;

-- -----------------------------------------------------------------------------
-- QUERY 4: Judge Bench Workload Across Criminal vs Civil Dockets
-- Integrates: Member 1 (JUDGE, PERSON, COURT),
--             Member 2 (HEARING_BENCH, HEARING, JUDGMENT),
--             Member 3 (CRIMINAL_CASE, CIVIL_CASE)
-- Purpose: Profiles judicial productivity by measuring criminal hearings vs civil
--          hearings presided over by each judge and judgments rendered.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT INTEGRATION QUERY 4: Judicial Bench Workload Across Case Types
PROMPT =====================================================================
SELECT 
    j.Judicial_ID,
    p.First_Name || ' ' || p.Last_Name AS judge_name,
    ct.Court_Name AS primary_court,
    COUNT(DISTINCT h.hearing_id) AS total_hearings_presided,
    COUNT(DISTINCT CASE WHEN crim.Case_ID IS NOT NULL THEN h.hearing_id END) AS criminal_hearings,
    COUNT(DISTINCT CASE WHEN civ.Case_ID IS NOT NULL THEN h.hearing_id END) AS civil_hearings,
    COUNT(DISTINCT jdg.judgment_id) AS total_judgments_on_docket
FROM JUDGE j
JOIN PERSON p ON j.Entity_ID = p.Entity_ID
LEFT JOIN COURT ct ON j.Current_Court_ID = ct.Court_ID
LEFT JOIN HEARING_BENCH hb ON j.Entity_ID = hb.judge_id
LEFT JOIN HEARING h ON hb.hearing_id = h.hearing_id
LEFT JOIN CASES c ON h.case_id = c.Case_ID
LEFT JOIN CRIMINAL_CASE crim ON c.Case_ID = crim.Case_ID
LEFT JOIN CIVIL_CASE civ     ON c.Case_ID = civ.Case_ID
LEFT JOIN JUDGMENT jdg       ON c.Case_ID = jdg.case_id
GROUP BY 
    j.Judicial_ID, p.First_Name, p.Last_Name, ct.Court_Name
ORDER BY total_hearings_presided DESC;

-- -----------------------------------------------------------------------------
-- QUERY 5: Criminal Charge Adjudication Pipeline
-- Integrates: Member 3 (DOCKET_CHARGE_SHEET, STATUTE_CHARGE, CRIMINAL_CASE),
--             Member 1 (PERSON as Defendant, COURT),
--             Member 2 (JUDGMENT, APPEAL)
-- Purpose: Traces criminal charges from formal charge-sheet framing through
--          trial court verdict to superior court appellate challenge.
-- -----------------------------------------------------------------------------
PROMPT =====================================================================
PROMPT INTEGRATION QUERY 5: Criminal Charge-to-Verdict-to-Appeal Pipeline
PROMPT =====================================================================
SELECT 
    dcs.Charge_Sheet_ID,
    crim.Case_ID,
    p_def.First_Name || ' ' || p_def.Last_Name AS defendant_name,
    sc.Charge_Code,
    sc.Section_Name,
    sc.Max_Sentence_Years,
    dcs.Verdict_Type AS charge_sheet_verdict,
    j.judgment_id AS trial_judgment,
    j.outcome AS trial_verdict,
    a.appeal_id,
    a.appeal_status,
    hc.Court_Name AS appellate_court
FROM DOCKET_CHARGE_SHEET dcs
JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
JOIN CRIMINAL_CASE crim ON dcs.Criminal_Case_ID = crim.Case_ID
JOIN CASES c ON crim.Case_ID = c.Case_ID
LEFT JOIN PERSON p_def ON dcs.Defendant_ID = p_def.Entity_ID
LEFT JOIN JUDGMENT j ON c.Case_ID = j.case_id
LEFT JOIN APPEAL a ON c.Case_ID = a.case_id
LEFT JOIN COURT hc ON a.higher_court_id = hc.Court_ID
ORDER BY crim.Case_ID, sc.Charge_Code;

PROMPT =====================================================================
PROMPT All 5 Cross-Module Integration Queries Executed Successfully!
PROMPT =====================================================================
