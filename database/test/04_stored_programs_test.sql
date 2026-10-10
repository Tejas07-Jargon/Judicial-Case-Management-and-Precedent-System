-- =================================================================
-- Judicial Case Management and Precedent System
-- Module: Criminal Cases, Charges, Incidents and Legal Precedents (Member 3)
-- TEST-ONLY ISOLATED STORED PROGRAMS (Safe Sandbox for DBMS_DA2_TEST)
-- File: database/test/04_stored_programs_test.sql
-- TARGET SCHEMA: DBMS_DA2_TEST (STRICTLY ISOLATED FROM DBMS_DA2_CONCEPT)
-- Prerequisites: 01_baseline_test.sql, 02_migration_test.sql, 03_seeds_test.sql
-- Database Engine: MySQL 8.0+
-- =================================================================
-- NOTICE:
-- 1. This file is generated strictly for isolated test validation.
-- 2. It DOES NOT touch, alter, or drop DBMS_DA2_CONCEPT.
-- 3. Stored procedures and functions are created strictly in DBMS_DA2_TEST.
-- =================================================================

USE DBMS_DA2_TEST;

-- Drop existing stored programs if they exist in DBMS_DA2_TEST
DROP PROCEDURE IF EXISTS Get_Criminal_Case_Dossier;
DROP PROCEDURE IF EXISTS Search_Proceedings_By_Defendant_Incident;
DROP FUNCTION IF EXISTS Get_Precedent_Citation_Count;

DELIMITER //

-- =================================================================
-- STORED PROCEDURE A: Get_Criminal_Case_Dossier
-- Purpose:
--   Retrieves the complete case, court, defendant, charge, and incident
--   dossier for a designated criminal case.
-- Features:
--   - Validates input parameter (checks for NULL or blank string).
--   - Validates existence in CRIMINAL_CASE; signals an error if not found.
--   - Uses LEFT JOIN on DOCKET_CHARGE_SHEET so that a valid criminal case
--     with no charge sheets yet filed still returns core case & court details.
--   - Supports both individual (PERSON) and corporate (ORGANIZATION) defendants
--     via LEFT JOIN without row multiplication.
--   - Uses INCIDENT relation as the single source of truth for incident facts.
--   - Deterministic ordering by Charge_Sheet_ID ASC.
-- =================================================================
CREATE PROCEDURE Get_Criminal_Case_Dossier(
    IN p_Case_ID VARCHAR(50)
)
BEGIN
    -- 1. Validate input parameter
    IF p_Case_ID IS NULL OR TRIM(p_Case_ID) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Case_ID cannot be NULL or empty.';
    END IF;

    -- 2. Validate that the case exists and is specifically a registered criminal case
    IF NOT EXISTS (SELECT 1 FROM CRIMINAL_CASE WHERE Case_ID = p_Case_ID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lookup Error: Case_ID does not exist as a registered criminal case.';
    END IF;

    -- 3. Return the dossier
    SELECT 
        cc.Case_ID,
        c.Title AS Case_Title,
        c.Status AS Case_Status,
        c.Filing_Date,
        ct.Court_ID,
        ct.Court_Name,
        ct.Tier_Level AS Court_Tier,
        cc.FIR_Or_Complaint_No,
        cc.Arresting_Agency,
        cc.Bail_Amount,
        dcs.Charge_Sheet_ID,
        dcs.Defendant_ID,
        COALESCE(CONCAT(p.First_Name, ' ', p.Last_Name), o.Company_Name, dcs.Defendant_ID, 'No Defendant Assigned') AS Defendant_Name,
        CASE 
            WHEN p.Entity_ID IS NOT NULL THEN 'Individual'
            WHEN o.Entity_ID IS NOT NULL THEN 'Organization'
            WHEN dcs.Defendant_ID IS NOT NULL THEN 'Unknown Entity'
            ELSE 'N/A'
        END AS Defendant_Type,
        sc.Charge_Code,
        COALESCE(sc.Section_Name, 'N/A') AS Statutory_Section,
        sc.Max_Sentence_Years,
        inc.Incident_ID,
        inc.Incident_Date,
        inc.Location AS Incident_Location,
        inc.Description AS Incident_Summary,
        COALESCE(dcs.Verdict_Type, 'Pending') AS Recorded_Verdict,
        COALESCE(dcs.Sentence_Imposed, 'N/A') AS Sentence_Imposed
    FROM CRIMINAL_CASE cc
    JOIN `CASE` c ON cc.Case_ID = c.Case_ID
    JOIN COURT ct ON c.Court_ID = ct.Court_ID
    LEFT JOIN DOCKET_CHARGE_SHEET dcs ON cc.Case_ID = dcs.Criminal_Case_ID
    LEFT JOIN PERSON p ON dcs.Defendant_ID = p.Entity_ID
    LEFT JOIN ORGANIZATION o ON dcs.Defendant_ID = o.Entity_ID
    LEFT JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
    LEFT JOIN INCIDENT inc ON dcs.Incident_ID = inc.Incident_ID
    WHERE cc.Case_ID = p_Case_ID
    ORDER BY dcs.Charge_Sheet_ID ASC;
END //


-- =================================================================
-- STORED PROCEDURE B: Search_Proceedings_By_Defendant_Incident
-- Purpose:
--   Retrieves all recorded charge sheets and associated proceedings for a
--   given defendant and incident across all courts.
-- Features:
--   - Validates defendant and incident input parameters.
--   - Signals an error if the defendant or incident is not registered in the system.
--   - Returns a structured result set of all proceedings facing the defendant
--     arising from that specific incident, including case details and recorded dispositions.
--   - If both identifiers exist but no charge sheet links them, returns an
--     empty result set with the exact schema columns, ready for application consumers.
--   - Vital utility for judicial officers and defense counsel assessing potential
--     multi-docket overlap, case consolidation, or statutory plea bars.
--   - Deterministic ordering by Case Filing_Date DESC, Charge_Sheet_ID ASC.
-- =================================================================
CREATE PROCEDURE Search_Proceedings_By_Defendant_Incident(
    IN p_Defendant_ID VARCHAR(50),
    IN p_Incident_ID VARCHAR(50)
)
BEGIN
    -- 1. Validate input parameters
    IF p_Defendant_ID IS NULL OR TRIM(p_Defendant_ID) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Defendant_ID cannot be NULL or empty.';
    END IF;

    IF p_Incident_ID IS NULL OR TRIM(p_Incident_ID) = '' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Incident_ID cannot be NULL or empty.';
    END IF;

    -- 2. Validate existence of Legal Entity
    IF NOT EXISTS (SELECT 1 FROM LEGAL_ENTITY WHERE Entity_ID = p_Defendant_ID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lookup Error: Defendant_ID does not exist in LEGAL_ENTITY.';
    END IF;

    -- 3. Validate existence of Incident
    IF NOT EXISTS (SELECT 1 FROM INCIDENT WHERE Incident_ID = p_Incident_ID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Lookup Error: Incident_ID does not exist in INCIDENT.';
    END IF;

    -- 4. Retrieve matching proceeding records
    SELECT 
        dcs.Charge_Sheet_ID,
        dcs.Defendant_ID,
        COALESCE(CONCAT(p.First_Name, ' ', p.Last_Name), o.Company_Name, dcs.Defendant_ID) AS Defendant_Name,
        CASE 
            WHEN p.Entity_ID IS NOT NULL THEN 'Individual'
            WHEN o.Entity_ID IS NOT NULL THEN 'Organization'
            ELSE 'Unknown Entity'
        END AS Defendant_Type,
        inc.Incident_ID,
        inc.Incident_Date,
        inc.Location AS Incident_Location,
        dcs.Criminal_Case_ID AS Case_ID,
        c.Title AS Case_Title,
        c.Status AS Case_Status,
        c.Filing_Date AS Case_Filing_Date,
        ct.Court_Name,
        sc.Charge_Code,
        sc.Section_Name AS Statutory_Section,
        COALESCE(dcs.Verdict_Type, 'Pending') AS Recorded_Verdict,
        COALESCE(dcs.Sentence_Imposed, 'N/A') AS Sentence_Imposed
    FROM DOCKET_CHARGE_SHEET dcs
    JOIN `CASE` c ON dcs.Criminal_Case_ID = c.Case_ID
    JOIN COURT ct ON c.Court_ID = ct.Court_ID
    JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
    JOIN INCIDENT inc ON dcs.Incident_ID = inc.Incident_ID
    LEFT JOIN PERSON p ON dcs.Defendant_ID = p.Entity_ID
    LEFT JOIN ORGANIZATION o ON dcs.Defendant_ID = o.Entity_ID
    WHERE dcs.Defendant_ID = p_Defendant_ID
      AND dcs.Incident_ID = p_Incident_ID
    ORDER BY c.Filing_Date DESC, dcs.Charge_Sheet_ID ASC;
END //


-- =================================================================
-- STORED FUNCTION: Get_Precedent_Citation_Count
-- Purpose:
--   Returns the number of times a judgment has been formally cited
--   by subsequent judgments in JUDGMENT_CITATION (incoming citations received).
-- Parameter:
--   p_Judgment_ID - The judgment identifier whose incoming citations are counted.
-- Returns:
--   INT - Total number of formal incoming citations received.
-- Features:
--   - Returns 0 for NULL or blank inputs.
--   - Characteristic: NOT DETERMINISTIC READS SQL DATA (reads mutable table data).
--   - Complements the shared baseline function `Get_Court_Case_Count`.
-- =================================================================
CREATE FUNCTION Get_Precedent_Citation_Count(
    p_Judgment_ID VARCHAR(50)
)
RETURNS INT
NOT DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_citation_count INT DEFAULT 0;

    -- Return 0 directly if input is NULL or empty
    IF p_Judgment_ID IS NULL OR TRIM(p_Judgment_ID) = '' THEN
        RETURN 0;
    END IF;

    -- Count formal judgment-level citations where the given judgment is cited (incoming citations received)
    SELECT COUNT(*) INTO v_citation_count
    FROM JUDGMENT_CITATION
    WHERE Cited_Judgment_ID = p_Judgment_ID;

    RETURN v_citation_count;
END //

DELIMITER ;
