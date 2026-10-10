-- =================================================================
-- Judicial Case Management and Precedent System
-- Module: Criminal Cases, Charges, Incidents and Legal Precedents (Member 3)
-- TEST-ONLY ISOLATED MIGRATION 01 (Safe Sandbox for DBMS_DA2_TEST)
-- File: database/test/02_migration_test.sql
-- TARGET SCHEMA: DBMS_DA2_TEST (STRICTLY ISOLATED FROM DBMS_DA2_CONCEPT)
-- Canonical Baseline Prerequisite: 01_baseline_test.sql (executed in DBMS_DA2_TEST)
-- Database Engine: MySQL 8.0+
-- =================================================================
-- NOTICE:
-- 1. This file is generated strictly for isolated test validation.
-- 2. It DOES NOT touch, alter, or drop DBMS_DA2_CONCEPT.
-- 3. All schema selections and metadata lookups target DBMS_DA2_TEST via DATABASE().
-- =================================================================

USE DBMS_DA2_TEST;

-- -----------------------------------------------------------------
-- 1. DEDICATED INCIDENT RELATION
-- Reconciles conceptual design with physical schema.
-- Decouples incident identity, date, location and description from charge sheets.
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS INCIDENT (
    Incident_ID VARCHAR(50) PRIMARY KEY,
    Incident_Date DATETIME NOT NULL,
    Location VARCHAR(255) NOT NULL,
    Description TEXT
);

-- Backfill incident entities for existing baseline charge sheets
-- (CHG_01 in CASE_1001 and CHG_02 in CASE_900 from baseline)
INSERT INTO INCIDENT (Incident_ID, Incident_Date, Location, Description)
VALUES
('INC_001', '2024-11-01 09:30:00', 'Anna Nagar, Chennai', 'Alleged fraudulent diversion of proprietary company funds via unauthorized banking instruction.'),
('INC_002', '2019-05-15 14:00:00', 'George Town Commercial Complex, Chennai', 'Fictitious corporate asset valuation submitted for tender qualification.')
ON DUPLICATE KEY UPDATE 
    Incident_Date = VALUES(Incident_Date),
    Location = VALUES(Location),
    Description = VALUES(Description);

-- -----------------------------------------------------------------
-- 2. DOCKET_CHARGE_SHEET NORMALIZATION
-- Add Incident_ID foreign key column and link to INCIDENT table
-- -----------------------------------------------------------------
SET @column_exists := (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'DOCKET_CHARGE_SHEET' 
      AND COLUMN_NAME = 'Incident_ID'
);

SET @sql := IF(@column_exists = 0, 
    'ALTER TABLE DOCKET_CHARGE_SHEET ADD COLUMN Incident_ID VARCHAR(50) AFTER Charge_Code;', 
    'SELECT "Incident_ID already exists on DOCKET_CHARGE_SHEET";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Map existing charge sheets to their backfilled incident records
UPDATE DOCKET_CHARGE_SHEET 
SET Incident_ID = 'INC_001' 
WHERE Charge_Sheet_ID = 'CHG_01' AND (Incident_ID IS NULL OR Incident_ID = '');

UPDATE DOCKET_CHARGE_SHEET 
SET Incident_ID = 'INC_002' 
WHERE Charge_Sheet_ID = 'CHG_02' AND (Incident_ID IS NULL OR Incident_ID = '');

-- Enforce NOT NULL on Incident_ID
ALTER TABLE DOCKET_CHARGE_SHEET 
MODIFY COLUMN Incident_ID VARCHAR(50) NOT NULL;

-- Add foreign key constraint to INCIDENT
SET @fk_exists := (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'DOCKET_CHARGE_SHEET' 
      AND CONSTRAINT_NAME = 'fk_dcs_incident'
);

SET @sql := IF(@fk_exists = 0, 
    'ALTER TABLE DOCKET_CHARGE_SHEET ADD CONSTRAINT fk_dcs_incident FOREIGN KEY (Incident_ID) REFERENCES INCIDENT(Incident_ID) ON DELETE RESTRICT;', 
    'SELECT "fk_dcs_incident already exists";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -----------------------------------------------------------------
-- 3. REMOVE HARD UNIQUE CONSTRAINT & REMOVE REDUNDANT TIMESTAMP
-- 
-- A. Replacement Non-Unique Indexes (Created First):
-- In MySQL InnoDB, FOREIGN KEY (Defendant_ID) requires an index starting with Defendant_ID.
-- The legacy unique constraint UNIQUE (Defendant_ID, Charge_Code, Incident_Timestamp)
-- previously satisfied this requirement. We must create the replacement index
-- idx_dcs_defendant_charge(Defendant_ID, Charge_Code, Incident_ID) FIRST
-- before dropping the legacy unique index, otherwise InnoDB raises ERROR 1553.
--
-- B. Hard UNIQUE Constraint Removal:
-- Once the replacement index is in place, we safely drop the legacy unique constraint
-- so multiple filings / concurrent dockets on the same incident do not cause Error 1062.
--
-- C. Redundant Incident_Timestamp Removal:
-- The single source of truth for incident date/time is now INCIDENT.Incident_Date.
-- We safely drop the redundant Incident_Timestamp column.
-- -----------------------------------------------------------------

-- 3A. Create replacement performance indexes covering Defendant_ID first
SET @idx1_exists := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'DOCKET_CHARGE_SHEET' 
      AND INDEX_NAME = 'idx_dcs_defendant_charge'
);
SET @sql := IF(@idx1_exists = 0, 
    'CREATE INDEX idx_dcs_defendant_charge ON DOCKET_CHARGE_SHEET(Defendant_ID, Charge_Code, Incident_ID);', 
    'SELECT "idx_dcs_defendant_charge already exists";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx2_exists := (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'DOCKET_CHARGE_SHEET' 
      AND INDEX_NAME = 'idx_dcs_case_lookup'
);
SET @sql := IF(@idx2_exists = 0, 
    'CREATE INDEX idx_dcs_case_lookup ON DOCKET_CHARGE_SHEET(Criminal_Case_ID);', 
    'SELECT "idx_dcs_case_lookup already exists";'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3B. Drop unique index on DOCKET_CHARGE_SHEET if present (now safe since Defendant_ID is covered)
SET @uk_name := (
    SELECT CONSTRAINT_NAME 
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'DOCKET_CHARGE_SHEET' 
      AND CONSTRAINT_TYPE = 'UNIQUE'
    LIMIT 1
);

SET @drop_uk_sql := IF(@uk_name IS NOT NULL, 
    CONCAT('ALTER TABLE DOCKET_CHARGE_SHEET DROP INDEX `', @uk_name, '`;'), 
    'SELECT "No unique constraint to drop on DOCKET_CHARGE_SHEET";'
);
PREPARE stmt FROM @drop_uk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3C. Drop redundant legacy Incident_Timestamp column if it exists
SET @ts_exists := (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'DOCKET_CHARGE_SHEET' 
      AND COLUMN_NAME = 'Incident_Timestamp'
);

SET @drop_ts_sql := IF(@ts_exists > 0, 
    'ALTER TABLE DOCKET_CHARGE_SHEET DROP COLUMN Incident_Timestamp;', 
    'SELECT "Incident_Timestamp column already removed";'
);
PREPARE stmt FROM @drop_ts_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- -----------------------------------------------------------------
-- 4. JUDGMENT_CITATION RELATION
-- Formal citation relation between concluded JUDGMENTS.
-- Note: CASE_CITATION is preserved for case-to-case submissions,
-- while JUDGMENT_CITATION handles authoritative judgment precedents.
-- -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS JUDGMENT_CITATION (
    Citation_ID VARCHAR(50) PRIMARY KEY,
    Citing_Judgment_ID VARCHAR(50) NOT NULL,
    Cited_Judgment_ID VARCHAR(50) NOT NULL,
    Relevance_Note TEXT,
    Precedent_Treatment VARCHAR(50) DEFAULT 'Followed',
    FOREIGN KEY (Citing_Judgment_ID) REFERENCES JUDGMENT(Judgment_ID) ON DELETE CASCADE,
    FOREIGN KEY (Cited_Judgment_ID) REFERENCES JUDGMENT(Judgment_ID) ON DELETE CASCADE,
    UNIQUE (Citing_Judgment_ID, Cited_Judgment_ID)
);

-- -----------------------------------------------------------------
-- 5. ANALYTICAL VIEWS FOR JUDICIAL REVIEW & MODULE INTEGRATION
-- -----------------------------------------------------------------

-- View 1: Potentially Related Proceedings for Judicial Review
-- Identifies overlapping proceedings without making unilateral legal determinations.
-- Supports both individual (PERSON) and corporate (ORGANIZATION) defendants.
-- Uses neutral metrics without assuming chronological sequence where outcome timestamps are absent.
-- Categorizes proceedings with deterministic rules:
--   - INSUFFICIENT_OUTCOME_DATA: Any docket has NULL, empty, or unclassified verdict.
--   - POTENTIALLY_RELATED: All dockets are explicitly Pending.
--   - OUTCOME_OVERLAP_REVIEW: Concluded outcome (Guilty/Acquitted) + active Pending docket.
--   - MULTIPLE_RECORDED_OUTCOMES_REVIEW: Multiple concluded outcomes with zero pending dockets.
CREATE OR REPLACE VIEW V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS AS
SELECT 
    dcs.Defendant_ID,
    COALESCE(CONCAT(p.First_Name, ' ', p.Last_Name), o.Company_Name, dcs.Defendant_ID) AS Defendant_Name,
    CASE 
        WHEN p.Entity_ID IS NOT NULL THEN 'Individual'
        WHEN o.Entity_ID IS NOT NULL THEN 'Organization'
        ELSE 'Unknown Entity'
    END AS Defendant_Type,
    dcs.Charge_Code,
    sc.Section_Name AS Charge_Section,
    inc.Incident_ID,
    inc.Incident_Date,
    inc.Location AS Incident_Location,
    COUNT(dcs.Charge_Sheet_ID) AS Total_Dockets_Count,
    SUM(CASE WHEN dcs.Verdict_Type = 'Guilty' THEN 1 ELSE 0 END) AS Recorded_Conviction_Count,
    SUM(CASE WHEN dcs.Verdict_Type = 'Acquitted' THEN 1 ELSE 0 END) AS Recorded_Acquittal_Count,
    SUM(CASE WHEN dcs.Verdict_Type = 'Pending' THEN 1 ELSE 0 END) AS Pending_Dockets_Count,
    SUM(CASE WHEN dcs.Verdict_Type IS NULL OR dcs.Verdict_Type = '' OR dcs.Verdict_Type NOT IN ('Guilty', 'Acquitted', 'Pending') THEN 1 ELSE 0 END) AS Unclassified_Outcome_Count,
    GROUP_CONCAT(DISTINCT dcs.Criminal_Case_ID ORDER BY dcs.Criminal_Case_ID SEPARATOR ', ') AS Involving_Cases,
    GROUP_CONCAT(DISTINCT COALESCE(dcs.Verdict_Type, 'Pending') ORDER BY dcs.Charge_Sheet_ID SEPARATOR ', ') AS Recorded_Outcomes,
    CASE 
        -- Priority 1: If any docket in the group has missing, null, empty, or unclassified outcome:
        WHEN SUM(CASE WHEN dcs.Verdict_Type IS NULL OR dcs.Verdict_Type = '' OR dcs.Verdict_Type NOT IN ('Guilty', 'Acquitted', 'Pending') THEN 1 ELSE 0 END) > 0
        THEN 'INSUFFICIENT_OUTCOME_DATA'

        -- Priority 2: All dockets in the group are explicitly Pending (and zero unclassified):
        WHEN SUM(CASE WHEN dcs.Verdict_Type = 'Pending' THEN 1 ELSE 0 END) = COUNT(dcs.Charge_Sheet_ID)
        THEN 'POTENTIALLY_RELATED'

        -- Priority 3: Concluded outcome (Guilty or Acquitted) alongside active Pending docket:
        WHEN (SUM(CASE WHEN dcs.Verdict_Type IN ('Guilty', 'Acquitted') THEN 1 ELSE 0 END) > 0)
             AND (SUM(CASE WHEN dcs.Verdict_Type = 'Pending' THEN 1 ELSE 0 END) > 0)
        THEN 'OUTCOME_OVERLAP_REVIEW'

        -- Priority 4: All dockets in group are concluded (Guilty or Acquitted) with zero Pending:
        WHEN SUM(CASE WHEN dcs.Verdict_Type IN ('Guilty', 'Acquitted') THEN 1 ELSE 0 END) = COUNT(dcs.Charge_Sheet_ID)
        THEN 'MULTIPLE_RECORDED_OUTCOMES_REVIEW'

        ELSE 'INSUFFICIENT_OUTCOME_DATA'
    END AS Review_Status_Category,
    CASE 
        -- Missing, null, empty, or unclassified outcome:
        WHEN SUM(CASE WHEN dcs.Verdict_Type IS NULL OR dcs.Verdict_Type = '' OR dcs.Verdict_Type NOT IN ('Guilty', 'Acquitted', 'Pending') THEN 1 ELSE 0 END) > 0
        THEN 'INSUFFICIENT_OUTCOME_DATA: One or more dockets contain missing, null, or unclassified verdict information'

        -- All dockets are explicitly Pending:
        WHEN SUM(CASE WHEN dcs.Verdict_Type = 'Pending' THEN 1 ELSE 0 END) = COUNT(dcs.Charge_Sheet_ID)
        THEN 'POTENTIALLY_RELATED: All matching dockets are currently pending — Consolidation review advised'

        -- Recorded conviction alongside active pending proceeding:
        WHEN (SUM(CASE WHEN dcs.Verdict_Type = 'Guilty' THEN 1 ELSE 0 END) > 0)
             AND (SUM(CASE WHEN dcs.Verdict_Type = 'Pending' THEN 1 ELSE 0 END) > 0)
        THEN 'OUTCOME_OVERLAP_REVIEW: Overlapping dockets contain recorded conviction and active pending docket — Judicial review advised under applicable statutory bars'

        -- Recorded acquittal alongside active pending proceeding:
        WHEN (SUM(CASE WHEN dcs.Verdict_Type = 'Acquitted' THEN 1 ELSE 0 END) > 0)
             AND (SUM(CASE WHEN dcs.Verdict_Type = 'Pending' THEN 1 ELSE 0 END) > 0)
        THEN 'OUTCOME_OVERLAP_REVIEW: Overlapping dockets contain recorded acquittal and active pending docket — Judicial review advised under applicable statutory bars'

        -- All dockets concluded:
        WHEN SUM(CASE WHEN dcs.Verdict_Type IN ('Guilty', 'Acquitted') THEN 1 ELSE 0 END) = COUNT(dcs.Charge_Sheet_ID)
        THEN 'MULTIPLE_RECORDED_OUTCOMES_REVIEW: Multiple concluded proceedings recorded on same incident and charge — Review recorded dispositions'

        ELSE 'INSUFFICIENT_OUTCOME_DATA: Outcome records cannot be classified under standard review categories'
    END AS Judicial_Review_Indicator
FROM DOCKET_CHARGE_SHEET dcs
LEFT JOIN PERSON p ON dcs.Defendant_ID = p.Entity_ID
LEFT JOIN ORGANIZATION o ON dcs.Defendant_ID = o.Entity_ID
JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
JOIN INCIDENT inc ON dcs.Incident_ID = inc.Incident_ID
GROUP BY dcs.Defendant_ID, p.First_Name, p.Last_Name, o.Company_Name, p.Entity_ID, o.Entity_ID, dcs.Charge_Code, sc.Section_Name, inc.Incident_ID, inc.Incident_Date, inc.Location
HAVING COUNT(dcs.Charge_Sheet_ID) > 1;

-- View 2: Complete Criminal Charge Dossier
-- Supports both individual (PERSON) and corporate (ORGANIZATION) defendants.
CREATE OR REPLACE VIEW V_CRIMINAL_CASE_CHARGES AS
SELECT 
    c.Case_ID,
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
    inc.Description AS Incident_Summary,
    dcs.Verdict_Type,
    dcs.Sentence_Imposed
FROM `CASE` c
JOIN COURT ct ON c.Court_ID = ct.Court_ID
JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
JOIN DOCKET_CHARGE_SHEET dcs ON cc.Case_ID = dcs.Criminal_Case_ID
LEFT JOIN PERSON p ON dcs.Defendant_ID = p.Entity_ID
LEFT JOIN ORGANIZATION o ON dcs.Defendant_ID = o.Entity_ID
JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
JOIN INCIDENT inc ON dcs.Incident_ID = inc.Incident_ID;

-- View 3: Precedent Network with Explicit Citation Scope
-- Distinguishes formal judgment-level citations from counsel submissions.
-- Note on Is_Judgment_Level_Citation:
-- This boolean indicates strictly whether the record links two judgments (TRUE)
-- versus a case-level citation/submission in pleadings (FALSE).
-- It does NOT determine or prove that a cited judgment is authoritative,
-- binding, valid precedent, or still good law under court hierarchy.
CREATE OR REPLACE VIEW V_PRECEDENT_NETWORK AS
SELECT 
    jc.Citation_ID,
    'JUDGMENT_PRECEDENT' AS Citation_Level,
    'Judgment-to-Judgment Citation' AS Precedent_Category,
    TRUE AS Is_Judgment_Level_Citation,
    jc.Citing_Judgment_ID AS Citing_Reference_ID,
    c1.Case_ID AS Citing_Case_ID,
    c1.Title AS Citing_Case_Title,
    jc.Cited_Judgment_ID AS Cited_Precedent_ID,
    c2.Case_ID AS Cited_Case_ID,
    c2.Title AS Cited_Precedent_Title,
    jc.Precedent_Treatment,
    jc.Relevance_Note
FROM JUDGMENT_CITATION jc
JOIN JUDGMENT j1 ON jc.Citing_Judgment_ID = j1.Judgment_ID
JOIN `CASE` c1 ON j1.Case_ID = c1.Case_ID
JOIN JUDGMENT j2 ON jc.Cited_Judgment_ID = j2.Judgment_ID
JOIN `CASE` c2 ON j2.Case_ID = c2.Case_ID
UNION ALL
SELECT 
    cc.Citation_ID,
    'CASE_SUBMISSION' AS Citation_Level,
    'Counsel Citation in Pleadings' AS Precedent_Category,
    FALSE AS Is_Judgment_Level_Citation,
    cc.Citing_Case_ID AS Citing_Reference_ID,
    cc.Citing_Case_ID AS Citing_Case_ID,
    c1.Title AS Citing_Case_Title,
    cc.Cited_Precedent_Case_ID AS Cited_Precedent_ID,
    cc.Cited_Precedent_Case_ID AS Cited_Case_ID,
    c2.Title AS Cited_Precedent_Title,
    'Cited by Counsel in Pleadings' AS Precedent_Treatment,
    cc.Relevance_Note
FROM CASE_CITATION cc
JOIN `CASE` c1 ON cc.Citing_Case_ID = c1.Case_ID
JOIN `CASE` c2 ON cc.Cited_Precedent_Case_ID = c2.Case_ID;
