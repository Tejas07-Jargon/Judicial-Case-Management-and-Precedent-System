-- =================================================================
-- Judicial Case Management and Precedent System
-- Module: Criminal Cases, Charges, Incidents and Legal Precedents (Member 3)
-- File: database/queries/member3_queries.sql
-- Description: Core queries implementing the 8 mandatory use cases for Member 3
-- Prerequisites: scripts.sql, 01_incident_and_precedent_refinements.sql, 02_member3_seeds.sql
-- Database Engine: MySQL 8.0+ | Database: DBMS_DA2_CONCEPT
-- =================================================================

USE DBMS_DA2_CONCEPT;

-- =================================================================
-- USE CASE 1: Retrieve charges and incidents for a specific criminal case
-- Purpose:
--   Retrieves all recorded charges, statutory sections, incident dates,
--   locations, defendants (both individual and organizational), verdicts,
--   and sentences for a selected criminal case.
-- Input Parameter: @case_id (Demonstration value: 'CASE_1002')
-- =================================================================
SET @case_id := 'CASE_1002';

SELECT 
    cc.Case_ID,
    c.Title AS Case_Title,
    c.Status AS Case_Status,
    ct.Court_Name,
    cc.FIR_Or_Complaint_No,
    cc.Arresting_Agency,
    dcs.Charge_Sheet_ID,
    dcs.Defendant_ID,
    COALESCE(CONCAT(p.First_Name, ' ', p.Last_Name), o.Company_Name, dcs.Defendant_ID) AS Defendant_Name,
    CASE 
        WHEN p.Entity_ID IS NOT NULL THEN 'Individual'
        WHEN o.Entity_ID IS NOT NULL THEN 'Organization'
        ELSE 'Unknown Entity'
    END AS Defendant_Type,
    sc.Charge_Code,
    sc.Section_Name AS Statutory_Section,
    sc.Max_Sentence_Years,
    inc.Incident_ID,
    inc.Incident_Date,
    inc.Location AS Incident_Location,
    COALESCE(dcs.Verdict_Type, 'Pending') AS Recorded_Verdict,
    COALESCE(dcs.Sentence_Imposed, 'N/A') AS Sentence_Imposed
FROM CRIMINAL_CASE cc
JOIN `CASE` c ON cc.Case_ID = c.Case_ID
JOIN COURT ct ON c.Court_ID = ct.Court_ID
JOIN DOCKET_CHARGE_SHEET dcs ON cc.Case_ID = dcs.Criminal_Case_ID
LEFT JOIN PERSON p ON dcs.Defendant_ID = p.Entity_ID
LEFT JOIN ORGANIZATION o ON dcs.Defendant_ID = o.Entity_ID
JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
JOIN INCIDENT inc ON dcs.Incident_ID = inc.Incident_ID
WHERE cc.Case_ID = @case_id
ORDER BY dcs.Charge_Sheet_ID ASC;


-- =================================================================
-- USE CASE 2: Retrieve all recorded incidents and charges associated with a defendant
-- Purpose:
--   Displays the comprehensive incident history and proceedings for a designated
--   defendant across all cases. Accurately handles both individual persons
--   and organizational/corporate defendants.
-- Input Parameter: @defendant_id (Demonstration value: 'ENT_002')
-- =================================================================
SET @defendant_id := 'ENT_002';

SELECT 
    le.Entity_ID AS Defendant_ID,
    COALESCE(CONCAT(p.First_Name, ' ', p.Last_Name), o.Company_Name, le.Entity_ID) AS Defendant_Name,
    CASE 
        WHEN p.Entity_ID IS NOT NULL THEN 'Individual'
        WHEN o.Entity_ID IS NOT NULL THEN 'Organization'
        ELSE 'Unknown Entity'
    END AS Defendant_Type,
    inc.Incident_ID,
    inc.Incident_Date,
    inc.Location AS Incident_Location,
    inc.Description AS Incident_Details,
    c.Case_ID,
    c.Title AS Associated_Case_Title,
    sc.Charge_Code,
    sc.Section_Name AS Charge_Faced,
    COALESCE(dcs.Verdict_Type, 'Pending') AS Recorded_Verdict,
    COALESCE(dcs.Sentence_Imposed, 'N/A') AS Sentence_Imposed
FROM LEGAL_ENTITY le
LEFT JOIN PERSON p ON le.Entity_ID = p.Entity_ID
LEFT JOIN ORGANIZATION o ON le.Entity_ID = o.Entity_ID
JOIN DOCKET_CHARGE_SHEET dcs ON le.Entity_ID = dcs.Defendant_ID
JOIN INCIDENT inc ON dcs.Incident_ID = inc.Incident_ID
JOIN `CASE` c ON dcs.Criminal_Case_ID = c.Case_ID
JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
WHERE le.Entity_ID = @defendant_id
ORDER BY inc.Incident_Date DESC, c.Case_ID ASC, dcs.Charge_Sheet_ID ASC;


-- =================================================================
-- USE CASE 3: Find criminal cases involving a particular statute or charge
-- Purpose:
--   Returns all criminal cases associated with a specified penal statute.
--   Uses EXISTS semi-join to completely eliminate duplicated case rows
--   caused by cases having multiple matching charge sheets or co-defendants.
-- Input Parameter: @charge_code (Demonstration value: 'IPC_420')
-- =================================================================
SET @charge_code := 'IPC_420';

SELECT 
    c.Case_ID,
    c.Title AS Case_Title,
    c.Status AS Case_Status,
    c.Filing_Date,
    ct.Court_Name,
    ct.Tier_Level AS Court_Tier,
    cc.FIR_Or_Complaint_No,
    cc.Arresting_Agency,
    sc.Charge_Code,
    sc.Section_Name AS Statutory_Section,
    sc.Max_Sentence_Years
FROM `CASE` c
JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
JOIN COURT ct ON c.Court_ID = ct.Court_ID
JOIN STATUTE_CHARGE sc ON sc.Charge_Code = @charge_code
WHERE EXISTS (
    SELECT 1 
    FROM DOCKET_CHARGE_SHEET dcs 
    WHERE dcs.Criminal_Case_ID = c.Case_ID 
      AND dcs.Charge_Code = sc.Charge_Code
)
ORDER BY c.Filing_Date DESC, c.Case_ID ASC;


-- =================================================================
-- USE CASE 4: Identify potentially related proceedings for judicial review
-- Purpose:
--   Queries the analytical view V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS to flag
--   multi-docket overlaps where the same defendant faces the same statutory charge
--   on the same factual incident across separate dockets.
--
-- Analytical & Legal Integrity Notes:
--   1. The query and view report data neutrally for judicial examination; they do
--      NOT declare or prove a constitutional double jeopardy bar (Article 20(2))
--      or statutory bar (Section 300 CrPC).
--   2. Individual charge sheets record disposition types (Guilty, Acquitted, Pending)
--      but lack per-charge verdict timestamps. Chronological precedence is therefore
--      not assumed; counts reflect recorded outcomes.
--   3. Categories:
--      - INSUFFICIENT_OUTCOME_DATA: Missing, NULL, or unclassified outcome information.
--      - POTENTIALLY_RELATED: All dockets are explicitly Pending (consolidation candidates).
--      - OUTCOME_OVERLAP_REVIEW: Concluded disposition alongside an active Pending docket.
--      - MULTIPLE_RECORDED_OUTCOMES_REVIEW: Multiple concluded dispositions with zero Pending dockets.
-- =================================================================
SELECT 
    Defendant_ID,
    Defendant_Name,
    Defendant_Type,
    Charge_Code,
    Charge_Section,
    Incident_ID,
    Incident_Date,
    Incident_Location,
    Total_Dockets_Count,
    Recorded_Conviction_Count,
    Recorded_Acquittal_Count,
    Pending_Dockets_Count,
    Unclassified_Outcome_Count,
    Involving_Cases,
    Recorded_Outcomes,
    Review_Status_Category,
    Judicial_Review_Indicator
FROM V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS
ORDER BY 
    CASE Review_Status_Category
        WHEN 'OUTCOME_OVERLAP_REVIEW' THEN 1
        WHEN 'POTENTIALLY_RELATED' THEN 2
        WHEN 'MULTIPLE_RECORDED_OUTCOMES_REVIEW' THEN 3
        WHEN 'INSUFFICIENT_OUTCOME_DATA' THEN 4
        ELSE 5
    END ASC,
    Total_Dockets_Count DESC,
    Defendant_ID ASC;


-- =================================================================
-- USE CASE 5: Retrieve judgments citing a selected judgment
-- Purpose:
--   Retrieves formal judgment-level citation relationships involving a selected
--   precedent judgment. Distinguishes citing from cited judgments and presents
--   relevance notes and treatment without asserting conclusive binding authority.
-- Input Parameter: @cited_judgment_id (Demonstration value: 'JUDG_800')
-- =================================================================
SET @cited_judgment_id := 'JUDG_800';

SELECT 
    jc.Citation_ID,
    jc.Cited_Judgment_ID,
    c_cited.Case_ID AS Precedent_Case_ID,
    c_cited.Title AS Precedent_Case_Title,
    j_cited.Verdict_Date AS Precedent_Verdict_Date,
    jc.Citing_Judgment_ID,
    c_citing.Case_ID AS Citing_Case_ID,
    c_citing.Title AS Citing_Case_Title,
    ct_citing.Court_Name AS Citing_Court,
    j_citing.Verdict_Date AS Citing_Verdict_Date,
    jc.Precedent_Treatment,
    jc.Relevance_Note
FROM JUDGMENT_CITATION jc
JOIN JUDGMENT j_cited ON jc.Cited_Judgment_ID = j_cited.Judgment_ID
JOIN `CASE` c_cited ON j_cited.Case_ID = c_cited.Case_ID
JOIN JUDGMENT j_citing ON jc.Citing_Judgment_ID = j_citing.Judgment_ID
JOIN `CASE` c_citing ON j_citing.Case_ID = c_citing.Case_ID
JOIN COURT ct_citing ON c_citing.Court_ID = ct_citing.Court_ID
WHERE jc.Cited_Judgment_ID = @cited_judgment_id
ORDER BY j_citing.Verdict_Date DESC, jc.Citation_ID ASC;


-- =================================================================
-- USE CASE 6: Judgment Citation Frequency Ranking
-- Purpose:
--   Ranks judgments by the frequency of formal incoming judgment-level citations
--   received in subsequent judicial decisions.
-- Note on Scope & Semantics:
--   1. Measures strictly citation frequency (incoming citations in JUDGMENT_CITATION).
--      Does not determine or imply conclusive legal authority or hierarchy.
--   2. Distinguishes formal judgment-level citations from case-level counsel submissions in pleadings.
--   3. Excludes judgments with zero incoming citations (via HAVING clause) to focus
--      the ranking specifically on cited precedents.
--   4. Uses a deterministic multi-column tie-breaker:
--      ORDER BY Times_Cited_In_Judgments DESC, j.Verdict_Date ASC, j.Judgment_ID ASC.
-- =================================================================
SELECT 
    j.Judgment_ID,
    c.Case_ID,
    c.Title AS Precedent_Case_Title,
    ct.Court_Name AS Rendering_Court,
    ct.Tier_Level AS Court_Tier,
    j.Verdict_Date,
    COUNT(jc.Citation_ID) AS Times_Cited_In_Judgments,
    COALESCE(GROUP_CONCAT(DISTINCT jc.Precedent_Treatment ORDER BY jc.Precedent_Treatment SEPARATOR ', '), 'None Recorded') AS Treatments_Recorded
FROM JUDGMENT j
JOIN `CASE` c ON j.Case_ID = c.Case_ID
JOIN COURT ct ON c.Court_ID = ct.Court_ID
LEFT JOIN JUDGMENT_CITATION jc ON j.Judgment_ID = jc.Cited_Judgment_ID
GROUP BY j.Judgment_ID, c.Case_ID, c.Title, ct.Court_Name, ct.Tier_Level, j.Verdict_Date
HAVING COUNT(jc.Citation_ID) > 0
ORDER BY Times_Cited_In_Judgments DESC, j.Verdict_Date ASC, j.Judgment_ID ASC;


-- =================================================================
-- USE CASE 7: Search precedent tags by keyword
-- Purpose:
--   Allows user-supplied keywords (or wildcard patterns) to find relevant tags
--   and associated cases across civil, criminal, and constitutional domains.
-- Input Parameter: @search_pattern (Demonstration value: '%Corporate%')
-- =================================================================
SET @search_pattern := '%Corporate%';

SELECT 
    pt.Tag_ID,
    pt.Keyword AS Precedent_Tag,
    c.Case_ID,
    c.Title AS Case_Title,
    ct.Court_Name,
    ct.Tier_Level AS Court_Tier,
    c.Status AS Case_Status,
    c.Filing_Date,
    CASE 
        WHEN cc.Case_ID IS NOT NULL THEN 'Criminal'
        WHEN cv.Case_ID IS NOT NULL THEN 'Civil'
        ELSE 'General / Appellate'
    END AS Jurisdiction_Type
FROM PRECEDENT_TAG pt
JOIN CASE_TAG_MAPPING ctm ON pt.Tag_ID = ctm.Tag_ID
JOIN `CASE` c ON ctm.Case_ID = c.Case_ID
JOIN COURT ct ON c.Court_ID = ct.Court_ID
LEFT JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
LEFT JOIN CIVIL_CASE cv ON c.Case_ID = cv.Case_ID
WHERE pt.Keyword LIKE @search_pattern
ORDER BY pt.Keyword ASC, c.Filing_Date DESC, c.Case_ID ASC;


-- =================================================================
-- USE CASE 8: Retrieve all tags associated with a specific case
-- Purpose:
--   Retrieves all taxonomy tags mapped to a specific case, including
--   the case title, court, status, and jurisdiction specialization.
-- Input Parameter: @case_id_for_tags (Demonstration value: 'CASE_800')
-- =================================================================
SET @case_id_for_tags := 'CASE_800';

SELECT 
    c.Case_ID,
    c.Title AS Case_Title,
    c.Status AS Case_Status,
    ct.Court_Name,
    CASE 
        WHEN cc.Case_ID IS NOT NULL THEN 'Criminal'
        WHEN cv.Case_ID IS NOT NULL THEN 'Civil'
        ELSE 'General / Appellate'
    END AS Jurisdiction_Type,
    pt.Tag_ID,
    pt.Keyword AS Assigned_Tag
FROM `CASE` c
JOIN COURT ct ON c.Court_ID = ct.Court_ID
LEFT JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
LEFT JOIN CIVIL_CASE cv ON c.Case_ID = cv.Case_ID
JOIN CASE_TAG_MAPPING ctm ON c.Case_ID = ctm.Case_ID
JOIN PRECEDENT_TAG pt ON ctm.Tag_ID = pt.Tag_ID
WHERE c.Case_ID = @case_id_for_tags
ORDER BY pt.Keyword ASC, pt.Tag_ID ASC;
