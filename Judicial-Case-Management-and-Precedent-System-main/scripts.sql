CREATE DATABASE IF NOT EXISTS DBMS_DA2_CONCEPT;
USE DBMS_DA2_CONCEPT;

-- =================================================================
-- PHASE 1: CLEAN TEARDOWN & TABLE DEFINITIONS (DDL)
-- =================================================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS CASE_TAG_MAPPING, PRECEDENT_TAG, CASE_CITATION, 
DOCKET_CHARGE_SHEET, STATUTE_CHARGE, JUDGMENT, HEARING_BENCH, HEARING, 
CIVIL_CASE, CRIMINAL_CASE, CASE_COUNSEL, CASE_PARTY, `CASE`, 
LAWYER, JUDGE, PERSON, ORGANIZATION, LEGAL_ENTITY, COURT;

CREATE TABLE LEGAL_ENTITY (
    Entity_ID VARCHAR(50) PRIMARY KEY,
    Contact_Email VARCHAR(100),
    Address TEXT
);

CREATE TABLE ORGANIZATION (
    Entity_ID VARCHAR(50) PRIMARY KEY,
    Registration_No VARCHAR(50) UNIQUE NOT NULL, 
    Company_Name VARCHAR(100) NOT NULL,
    FOREIGN KEY (Entity_ID) REFERENCES LEGAL_ENTITY(Entity_ID) ON DELETE CASCADE
);

CREATE TABLE PERSON (
    Entity_ID VARCHAR(50) PRIMARY KEY,
    Aadhar_ID VARCHAR(50) UNIQUE NOT NULL, 
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    DOB DATE,
    FOREIGN KEY (Entity_ID) REFERENCES LEGAL_ENTITY(Entity_ID) ON DELETE CASCADE
);

CREATE TABLE COURT (
    Court_ID VARCHAR(50) PRIMARY KEY,
    Court_Name VARCHAR(150) NOT NULL,
    Tier_Level VARCHAR(50) NOT NULL,
    Jurisdiction_State VARCHAR(50) NOT NULL
);

CREATE TABLE JUDGE (
    Entity_ID VARCHAR(50) PRIMARY KEY,
    Judicial_ID VARCHAR(50) UNIQUE NOT NULL, 
    Appointment_Date DATE,
    Current_Court_ID VARCHAR(50),
    FOREIGN KEY (Entity_ID) REFERENCES PERSON(Entity_ID) ON DELETE CASCADE,
    FOREIGN KEY (Current_Court_ID) REFERENCES COURT(Court_ID) ON DELETE SET NULL
);

CREATE TABLE LAWYER (
    Entity_ID VARCHAR(50) PRIMARY KEY,
    License_No VARCHAR(50) UNIQUE NOT NULL, 
    Specialization VARCHAR(100),
    Firm_Name VARCHAR(100),
    FOREIGN KEY (Entity_ID) REFERENCES PERSON(Entity_ID) ON DELETE CASCADE
);

CREATE TABLE `CASE` (
    Case_ID VARCHAR(50) PRIMARY KEY,
    Court_ID VARCHAR(50) NOT NULL,
    Parent_Case_ID VARCHAR(50), 
    Title VARCHAR(200) NOT NULL,
    Filing_Date DATE NOT NULL,
    Status VARCHAR(50) NOT NULL,
    FOREIGN KEY (Court_ID) REFERENCES COURT(Court_ID),
    FOREIGN KEY (Parent_Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE SET NULL
);

CREATE TABLE CRIMINAL_CASE (
    Case_ID VARCHAR(50) PRIMARY KEY,
    FIR_Or_Complaint_No VARCHAR(50),
    Bail_Amount DECIMAL(15,2) CHECK (Bail_Amount >= 0),
    Arresting_Agency VARCHAR(100),
    FOREIGN KEY (Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE CASCADE
);


CREATE TABLE CIVIL_CASE (
    Case_ID VARCHAR(50) PRIMARY KEY,
    Dispute_Value DECIMAL(15,2) CHECK (Dispute_Value >= 0),
    Civil_Case_Type VARCHAR(50),
    FOREIGN KEY (Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE CASCADE
);

CREATE TABLE CASE_PARTY (
    Party_ID VARCHAR(50) PRIMARY KEY,
    Entity_ID VARCHAR(50) NOT NULL,
    Case_ID VARCHAR(50) NOT NULL,
    Party_Role VARCHAR(50) NOT NULL,
    FOREIGN KEY (Entity_ID) REFERENCES LEGAL_ENTITY(Entity_ID),
    FOREIGN KEY (Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE CASCADE,
    UNIQUE (Entity_ID, Case_ID, Party_Role)
);

CREATE TABLE CASE_COUNSEL (
    Counsel_ID VARCHAR(50) PRIMARY KEY,
    Lawyer_ID VARCHAR(50) NOT NULL,
    Party_ID VARCHAR(50) NOT NULL,
    Lead_Counsel_Flag BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (Lawyer_ID) REFERENCES LAWYER(Entity_ID),
    FOREIGN KEY (Party_ID) REFERENCES CASE_PARTY(Party_ID) ON DELETE CASCADE,
    UNIQUE (Lawyer_ID, Party_ID)
);

CREATE TABLE HEARING (
    Case_ID VARCHAR(50) NOT NULL,
    Hearing_Timestamp DATETIME NOT NULL,
    Summary_Notes TEXT,
    PRIMARY KEY (Case_ID, Hearing_Timestamp),
    FOREIGN KEY (Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE CASCADE
);

CREATE TABLE HEARING_BENCH (
    Bench_ID VARCHAR(50) PRIMARY KEY,
    Judge_ID VARCHAR(50) NOT NULL,
    Case_ID VARCHAR(50) NOT NULL,
    Hearing_Timestamp DATETIME NOT NULL,
    Bench_Role VARCHAR(50),
    FOREIGN KEY (Judge_ID) REFERENCES JUDGE(Entity_ID),
    FOREIGN KEY (Case_ID, Hearing_Timestamp) REFERENCES HEARING(Case_ID, Hearing_Timestamp) ON DELETE CASCADE
);

CREATE TABLE JUDGMENT (
    Judgment_ID VARCHAR(50) PRIMARY KEY,
    Case_ID VARCHAR(50) UNIQUE NOT NULL, 
    Verdict_Date DATE,
    Judgment_Text TEXT,
    FOREIGN KEY (Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE CASCADE
);

CREATE TABLE STATUTE_CHARGE (
    Charge_Code VARCHAR(50) PRIMARY KEY,
    Section_Name VARCHAR(150),
    Description TEXT,
    Max_Sentence_Years INT
);

CREATE TABLE DOCKET_CHARGE_SHEET (
    Charge_Sheet_ID VARCHAR(50) PRIMARY KEY,
    Criminal_Case_ID VARCHAR(50) NOT NULL,
    Defendant_ID VARCHAR(50) NOT NULL,
    Charge_Code VARCHAR(50) NOT NULL,
    Incident_Timestamp DATETIME NOT NULL,
    Verdict_Type VARCHAR(50),
    Sentence_Imposed VARCHAR(100),
    FOREIGN KEY (Criminal_Case_ID) REFERENCES CRIMINAL_CASE(Case_ID) ON DELETE CASCADE,
    FOREIGN KEY (Defendant_ID) REFERENCES LEGAL_ENTITY(Entity_ID),
    FOREIGN KEY (Charge_Code) REFERENCES STATUTE_CHARGE(Charge_Code),
    UNIQUE (Defendant_ID, Charge_Code, Incident_Timestamp) 
);

CREATE TABLE CASE_CITATION (
    Citation_ID VARCHAR(50) PRIMARY KEY,
    Citing_Case_ID VARCHAR(50) NOT NULL,
    Cited_Precedent_Case_ID VARCHAR(50) NOT NULL,
    Relevance_Note TEXT,
    FOREIGN KEY (Citing_Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE CASCADE,
    FOREIGN KEY (Cited_Precedent_Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE CASCADE,
    UNIQUE (Citing_Case_ID, Cited_Precedent_Case_ID)
);

CREATE TABLE PRECEDENT_TAG (
    Tag_ID VARCHAR(50) PRIMARY KEY,
    Keyword VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE CASE_TAG_MAPPING (
    Case_ID VARCHAR(50) NOT NULL,
    Tag_ID VARCHAR(50) NOT NULL,
    PRIMARY KEY (Case_ID, Tag_ID),
    FOREIGN KEY (Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE CASCADE,
    FOREIGN KEY (Tag_ID) REFERENCES PRECEDENT_TAG(Tag_ID) ON DELETE CASCADE
);

-- =================================================================
-- PHASE 2: PL/SQL BUSINESS LOGIC (TRIGGERS, FUNCTIONS, PROCEDURES)
-- =================================================================

-- Explicitly drop old objects to prevent "already exists" errors
DELIMITER ;

DROP TRIGGER IF EXISTS prevent_judge_as_lawyer;
DROP TRIGGER IF EXISTS prevent_lawyer_as_judge;
DROP TRIGGER IF EXISTS auto_close_case_on_judgment;
DROP TRIGGER IF EXISTS prevent_hearing_on_closed_case;
DROP FUNCTION IF EXISTS Get_Court_Case_Count;
DROP PROCEDURE IF EXISTS Register_Criminal_Case;
DROP PROCEDURE IF EXISTS Register_Civil_Case;
DROP PROCEDURE IF EXISTS Assign_Counsel_To_Party;
DROP PROCEDURE IF EXISTS Schedule_Hearing_Session;
DROP PROCEDURE IF EXISTS Record_Final_Judgment;
DROP PROCEDURE IF EXISTS Cite_Precedent;

DELIMITER $$

CREATE TRIGGER prevent_judge_as_lawyer
BEFORE INSERT ON JUDGE
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM LAWYER WHERE Entity_ID = NEW.Entity_ID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Disjoint Violation: Entity is an active Lawyer.';
    END IF;
END $$  

CREATE TRIGGER prevent_lawyer_as_judge 
BEFORE INSERT ON LAWYER 
FOR EACH ROW 
BEGIN     
    IF EXISTS (SELECT 1 FROM JUDGE WHERE Entity_ID = NEW.Entity_ID) THEN         
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Disjoint Violation: Entity is an active Judge.';     
    END IF; 
END $$

CREATE TRIGGER auto_close_case_on_judgment
AFTER INSERT ON JUDGMENT
FOR EACH ROW
BEGIN
    UPDATE `CASE` 
    SET Status = 'Closed' 
    WHERE Case_ID = NEW.Case_ID;
END $$

CREATE TRIGGER prevent_hearing_on_closed_case
BEFORE INSERT ON HEARING
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(50);
    SELECT Status INTO v_status FROM `CASE` WHERE Case_ID = NEW.Case_ID;
    IF v_status = 'Closed' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Lifecycle Violation: Cannot schedule a hearing for a closed case.';
    END IF;
END $$

CREATE FUNCTION Get_Court_Case_Count(p_Court_ID VARCHAR(50)) 
RETURNS INT
DETERMINISTIC READS SQL DATA
BEGIN
    DECLARE total_cases INT DEFAULT 0;
    SELECT COUNT(*) INTO total_cases FROM `CASE` WHERE Court_ID = p_Court_ID;
    RETURN total_cases;
END $$

CREATE PROCEDURE Register_Criminal_Case(
    IN p_Case_ID VARCHAR(50), IN p_Court_ID VARCHAR(50), IN p_Parent_Case_ID VARCHAR(50),
    IN p_Title VARCHAR(200), IN p_Filing_Date DATE, IN p_FIR_No VARCHAR(50),
    IN p_Bail DECIMAL(15,2), IN p_Agency VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Transaction failed. Registration rolled back.';
    END;

    START TRANSACTION;
    INSERT INTO `CASE` (Case_ID, Court_ID, Parent_Case_ID, Title, Filing_Date, Status)
    VALUES (p_Case_ID, p_Court_ID, p_Parent_Case_ID, p_Title, p_Filing_Date, 'Pending');
    
    INSERT INTO CRIMINAL_CASE (Case_ID, FIR_Or_Complaint_No, Bail_Amount, Arresting_Agency)
    VALUES (p_Case_ID, p_FIR_No, p_Bail, p_Agency);
    COMMIT;
END $$

CREATE PROCEDURE Register_Civil_Case(
    IN p_Case_ID VARCHAR(50), IN p_Court_ID VARCHAR(50), IN p_Title VARCHAR(255),
    IN p_Filing_Date DATE, IN p_Claim_Amount DECIMAL(15,2), IN p_Dispute_Category VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    IF p_Claim_Amount < 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Claim amount cannot be negative';
    END IF;
    START TRANSACTION;
    INSERT INTO `CASE` (Case_ID, Court_ID, Title, Filing_Date, Status)
    VALUES (p_Case_ID, p_Court_ID, p_Title, p_Filing_Date, 'Pending');
    INSERT INTO CIVIL_CASE (Case_ID, Dispute_Value, Civil_Case_Type)
    VALUES (p_Case_ID, p_Claim_Amount, p_Dispute_Category);
    COMMIT;
END $$  


CREATE PROCEDURE Assign_Counsel_To_Party(     
    IN p_Counsel_ID VARCHAR(50), 
    IN p_Lawyer_ID VARCHAR(50),     
    IN p_Party_ID VARCHAR(50), 
    IN p_Is_Lead BOOLEAN 
) 
BEGIN     
    IF NOT EXISTS (
        SELECT 1 FROM LAWYER 
        WHERE UPPER(TRIM(Entity_ID)) = UPPER(TRIM(p_Lawyer_ID))
    ) THEN         
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Validation Error: Entity_ID is not a registered Lawyer.';     
    END IF;     
    
    IF NOT EXISTS (
        SELECT 1 FROM CASE_PARTY 
        WHERE UPPER(TRIM(Party_ID)) = UPPER(TRIM(p_Party_ID))
    ) THEN         
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Validation Error: Party_ID does not exist.';     
    END IF;     
    
    INSERT INTO CASE_COUNSEL (Counsel_ID, Lawyer_ID, Party_ID, Lead_Counsel_Flag) 
    VALUES (TRIM(p_Counsel_ID), TRIM(p_Lawyer_ID), TRIM(p_Party_ID), p_Is_Lead); 
END$$



CREATE PROCEDURE Schedule_Hearing_Session(
    IN p_Bench_ID VARCHAR(50), IN p_Case_ID VARCHAR(50),
    IN p_Hearing_Timestamp DATETIME, IN p_Summary_Notes TEXT, IN p_Judge_ID VARCHAR(50)
)
BEGIN
    DECLARE v_Status VARCHAR(50);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

    SELECT Status INTO v_Status FROM `CASE` WHERE Case_ID = p_Case_ID;
    IF v_Status = 'Closed' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cannot schedule hearings for closed cases';
    END IF;

    START TRANSACTION;
    INSERT INTO HEARING (Case_ID, Hearing_Timestamp, Summary_Notes)
    VALUES (p_Case_ID, p_Hearing_Timestamp, p_Summary_Notes);

    INSERT INTO HEARING_BENCH (Bench_ID, Judge_ID, Case_ID, Hearing_Timestamp, Bench_Role)
    VALUES (p_Bench_ID, p_Judge_ID, p_Case_ID, p_Hearing_Timestamp, 'Assigned');
    COMMIT;
END $$

CREATE PROCEDURE Record_Final_Judgment(
    IN p_Judgment_ID VARCHAR(50), IN p_Case_ID VARCHAR(50),
    IN p_Verdict_Date DATE, IN p_Judgment_Text TEXT
)
BEGIN
    DECLARE v_Filing_Date DATE;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

    SELECT Filing_Date INTO v_Filing_Date FROM `CASE` WHERE Case_ID = p_Case_ID;
    IF p_Verdict_Date < v_Filing_Date THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Verdict date cannot precede filing date';
    END IF;

    START TRANSACTION;
    INSERT INTO JUDGMENT (Judgment_ID, Case_ID, Verdict_Date, Judgment_Text) 
    VALUES (p_Judgment_ID, p_Case_ID, p_Verdict_Date, p_Judgment_Text);

    UPDATE `CASE` SET Status = 'Closed' WHERE Case_ID = p_Case_ID;
    COMMIT;
END $$


CREATE PROCEDURE Cite_Precedent(
    IN p_Citation_ID VARCHAR(50),
    IN p_Citing_Case_ID VARCHAR(50),
    IN p_Cited_Case_ID VARCHAR(50),
    IN p_Note TEXT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;

    START TRANSACTION;
    INSERT INTO CASE_CITATION (Citation_ID, Citing_Case_ID, Cited_Precedent_Case_ID, Relevance_Note)
    VALUES (p_Citation_ID, p_Citing_Case_ID, p_Cited_Case_ID, p_Note);
    COMMIT;
END$$


DELIMITER ;





-- =================================================================
-- PHASE 3: DATA INITIALIZATION (INSERT STATEMENTS)
-- =================================================================

-- 1. Insert Courts (10 Records)
INSERT INTO COURT VALUES 
('CRT_SC_01', 'Supreme Court of India', 'Supreme', 'Delhi'),
('CRT_HC_TN', 'Madras High Court', 'High Court', 'Tamil Nadu'),
('CRT_DC_CHN', 'Chennai District Court', 'District', 'Tamil Nadu'),
('CRT_HC_KA', 'Karnataka High Court', 'High Court', 'Karnataka'),
('CRT_DC_BLR', 'Bangalore District Court', 'District', 'Karnataka'),
('CRT_HC_MH', 'Bombay High Court', 'High Court', 'Maharashtra'),
('CRT_DC_MUM', 'Mumbai District Court', 'District', 'Maharashtra'),
('CRT_HC_DL', 'Delhi High Court', 'High Court', 'Delhi'),
('CRT_DC_ND', 'New Delhi District Court', 'District', 'Delhi'),
('CRT_FTC_CHN', 'Fast Track Court Chennai', 'Fast Track', 'Tamil Nadu');

-- 2. Insert Legal Entities (35 Records to support 10 Orgs, 25 Persons)
INSERT INTO LEGAL_ENTITY VALUES 
('ENT_001', 'contact@tn.gov.in', 'Secretariat, Chennai'),
('ENT_002', 'ram@email.com', 'Anna Nagar, Chennai'),
('ENT_003', 'shankar.judge@judiciary.in', 'High Court Quarters'),
('ENT_004', 'kamal.advocate@law.in', 'Mylapore, Chennai'),
('ENT_005', 'corp@tech.com', 'OMR, Chennai'),
('ENT_006', 'krishna.judge@judiciary.in', 'District Quarters'),
('ENT_007', 'priya.desh@law.in', 'T-Nagar, Chennai'),
('ENT_O1', 'contact@ka.gov.in', 'Vidhana Soudha, BLR'),
('ENT_O2', 'contact@mh.gov.in', 'Mantralaya, Mumbai'),
('ENT_O3', 'contact@india.gov.in', 'New Delhi'),
('ENT_O4', 'legal@globallogistics.com', 'Port Trust, Chennai'),
('ENT_O5', 'compliance@citybank.in', 'BKC, Mumbai'),
('ENT_O6', 'info@apexbuilders.com', 'Whitefield, Bangalore'),
('ENT_O7', 'legal@horizon.tech', 'Cyber City, Delhi'),
('ENT_O8', 'hq@cbi.gov.in', 'CGO Complex, Delhi'),
('ENT_J1', 'judge1@judiciary.in', 'Delhi Quarters'),
('ENT_J2', 'judge2@judiciary.in', 'Mumbai Quarters'),
('ENT_J3', 'judge3@judiciary.in', 'Bangalore Quarters'),
('ENT_J4', 'judge4@judiciary.in', 'Chennai Quarters'),
('ENT_J5', 'judge5@judiciary.in', 'Delhi Quarters'),
('ENT_J6', 'judge6@judiciary.in', 'Mumbai Quarters'),
('ENT_J7', 'judge7@judiciary.in', 'Bangalore Quarters'),
('ENT_J8', 'judge8@judiciary.in', 'Chennai FTC Quarters'),
('ENT_L1', 'l1@law.in', 'Delhi'),
('ENT_L2', 'l2@law.in', 'Mumbai'),
('ENT_L3', 'l3@law.in', 'Bangalore'),
('ENT_L4', 'l4@law.in', 'Chennai'),
('ENT_L5', 'l5@law.in', 'Delhi'),
('ENT_L6', 'l6@law.in', 'Mumbai'),
('ENT_L7', 'l7@law.in', 'Bangalore'),
('ENT_L8', 'l8@law.in', 'Chennai'),
('ENT_P1', 'p1@email.com', 'Delhi'),
('ENT_P2', 'p2@email.com', 'Mumbai'),
('ENT_P3', 'p3@email.com', 'Bangalore'),
('ENT_P4', 'p4@email.com', 'Chennai');

-- 3. Insert Organizations (10 Records)
INSERT INTO ORGANIZATION VALUES 
('ENT_001', 'CIN-TN-GOV-999', 'State of Tamil Nadu'),
('ENT_005', 'CIN-TECH-1029', 'TechCorp Solutions'),
('ENT_O1', 'CIN-KA-GOV-111', 'State of Karnataka'),
('ENT_O2', 'CIN-MH-GOV-222', 'State of Maharashtra'),
('ENT_O3', 'CIN-UOI-000', 'Union of India'),
('ENT_O4', 'CIN-LOG-555', 'Global Logistics'),
('ENT_O5', 'CIN-BNK-777', 'City Bank'),
('ENT_O6', 'CIN-BLD-888', 'Apex Builders'),
('ENT_O7', 'CIN-HRZ-999', 'Horizon Tech'),
('ENT_O8', 'CIN-CBI-100', 'Central Bureau of Investigation');

-- 4. Insert Persons (25 Records)
INSERT INTO PERSON VALUES 
('ENT_002', '[Aadhaar Redacted 1]', 'Ram', 'Kumar', '1985-06-15'),
('ENT_003', '[Aadhaar Redacted 2]', 'Shankar', 'Mahadevan', '1970-02-10'),
('ENT_004', '[Aadhaar Redacted 3]', 'Kamal', 'Hassan', '1982-11-20'),
('ENT_006', '[Aadhaar Redacted 4]', 'Krishna', 'Iyer', '1975-04-12'),
('ENT_007', '[Aadhaar Redacted 5]', 'Priya', 'Deshmukh', '1988-09-05'),
('ENT_J1', '[Aadhaar Redacted 6]', 'Amit', 'Sharma', '1965-01-01'),
('ENT_J2', '[Aadhaar Redacted 7]', 'Neha', 'Patil', '1972-03-14'),
('ENT_J3', '[Aadhaar Redacted 8]', 'Ravi', 'Shastri', '1968-07-22'),
('ENT_J4', '[Aadhaar Redacted 9]', 'Anita', 'Bose', '1971-11-30'),
('ENT_J5', '[Aadhaar Redacted 10]', 'Vikram', 'Singh', '1969-05-18'),
('ENT_J6', '[Aadhaar Redacted 11]', 'Sanjay', 'Dutt', '1964-08-08'),
('ENT_J7', '[Aadhaar Redacted 12]', 'Meera', 'Nair', '1975-12-12'),
('ENT_J8', '[Aadhaar Redacted 13]', 'Arun', 'Jaitley', '1962-10-10'),
('ENT_L1', '[Aadhaar Redacted 14]', 'Rohan', 'Das', '1980-02-14'),
('ENT_L2', '[Aadhaar Redacted 15]', 'Sneha', 'Kapoor', '1985-06-25'),
('ENT_L3', '[Aadhaar Redacted 16]', 'Karan', 'Johar', '1978-09-19'),
('ENT_L4', '[Aadhaar Redacted 17]', 'Deepa', 'Mehta', '1982-04-04'),
('ENT_L5', '[Aadhaar Redacted 18]', 'Rahul', 'Dravid', '1979-11-11'),
('ENT_L6', '[Aadhaar Redacted 19]', 'Smriti', 'Irani', '1981-08-15'),
('ENT_L7', '[Aadhaar Redacted 20]', 'Anil', 'Kumble', '1977-03-03'),
('ENT_L8', '[Aadhaar Redacted 21]', 'Geeta', 'Phogat', '1986-05-20'),
('ENT_P1', '[Aadhaar Redacted 22]', 'Raj', 'Malhotra', '1990-01-10'),
('ENT_P2', '[Aadhaar Redacted 23]', 'Simran', 'Kaur', '1992-02-20'),
('ENT_P3', '[Aadhaar Redacted 24]', 'Kabir', 'Singh', '1988-03-30'),
('ENT_P4', '[Aadhaar Redacted 25]', 'Preeti', 'Sikka', '1995-04-15');

-- 5. Insert Judges (10 Records)
INSERT INTO JUDGE VALUES 
('ENT_003', 'JUDGE-TN-882', '2015-08-10', 'CRT_HC_TN'),
('ENT_006', 'JUDGE-TN-401', '2018-05-20', 'CRT_DC_CHN'),
('ENT_J1', 'JUDGE-DL-001', '2010-01-15', 'CRT_SC_01'),
('ENT_J2', 'JUDGE-MH-002', '2012-04-20', 'CRT_HC_MH'),
('ENT_J3', 'JUDGE-KA-003', '2014-07-25', 'CRT_HC_KA'),
('ENT_J4', 'JUDGE-TN-004', '2016-10-30', 'CRT_DC_CHN'),
('ENT_J5', 'JUDGE-DL-005', '2011-02-18', 'CRT_HC_DL'),
('ENT_J6', 'JUDGE-MH-006', '2013-05-22', 'CRT_DC_MUM'),
('ENT_J7', 'JUDGE-KA-007', '2015-08-28', 'CRT_DC_BLR'),
('ENT_J8', 'JUDGE-TN-008', '2017-11-05', 'CRT_FTC_CHN');


-- 6. Insert Lawyers (10 Records)
INSERT INTO LAWYER VALUES 
('ENT_004', 'BAR-TN-2005', 'Criminal & Corporate Defense', 'Kamal & Associates'),
('ENT_007', 'BAR-TN-2015', 'Civil Litigation', 'Deshmukh Legal'),
('ENT_L1', 'BAR-DL-2010', 'Corporate Law', 'Das & Co'),
('ENT_L2', 'BAR-MH-2012', 'Criminal Defense', 'Kapoor Chambers'),
('ENT_L3', 'BAR-KA-2014', 'Intellectual Property', 'Johar Legal'),
('ENT_L4', 'BAR-TN-2016', 'Family Law', 'Mehta Associates'),
('ENT_L5', 'BAR-DL-2011', 'Tax Law', 'Dravid & Partners'),
('ENT_L6', 'BAR-MH-2013', 'Civil Litigation', 'Irani Law Firm'),
('ENT_L7', 'BAR-KA-2015', 'Criminal Defense', 'Kumble Legal'),
('ENT_L8', 'BAR-TN-2017', 'Constitutional Law', 'Phogat Chambers');


-- 7. Insert Cases (20 Records: 10 Criminal, 10 Civil)
-- Criminal Cases
INSERT INTO `CASE` VALUES 
('CASE_900', 'CRT_DC_CHN', NULL, 'State vs. Historic Fraud', '2020-01-10', 'Pending'),
('CASE_1001', 'CRT_DC_CHN', NULL, 'State of TN vs. Ram', '2025-01-10', 'Pending'),
('CASE_1002', 'CRT_DC_ND', NULL, 'CBI vs. Raj', '2025-02-15', 'Pending'), 
('CASE_1003', 'CRT_DC_MUM', NULL, 'State of MH vs. Kabir', '2025-03-20', 'Pending'),
('CASE_1004', 'CRT_DC_BLR', NULL, 'State of KA vs. Ram', '2025-04-25', 'Pending'), 
('CASE_1005', 'CRT_FTC_CHN', NULL, 'State vs. Cyber Syndicate', '2023-01-10', 'Pending'), 
('CASE_2001', 'CRT_HC_TN', 'CASE_1001', 'Ram vs. State of TN (Appeal)', '2026-03-15', 'Pending'),
('CASE_2002', 'CRT_HC_MH', 'CASE_1003', 'Kabir vs. State of MH (Appeal)', '2026-04-10', 'Pending'),
('CASE_3000', 'CRT_SC_01', 'CASE_2001', 'Ram vs. State of TN (Supreme Appeal)', '2026-08-20', 'Pending'), 
('CASE_1006', 'CRT_DC_CHN', NULL, 'State vs. Simran', '2025-05-30', 'Pending');

INSERT INTO CRIMINAL_CASE VALUES 
('CASE_900', 'FIR-2020-11', 10000.00, 'CBI'),
('CASE_1001', 'FIR-2025-001', 50000.00, 'Chennai Police'),
('CASE_1002', 'FIR-2025-002', 500000.00, 'CBI'), 
('CASE_1003', 'FIR-2025-003', 25000.00, 'Mumbai Police'),
('CASE_1004', 'FIR-2025-004', 30000.00, 'Bangalore Police'),
('CASE_1005', 'FIR-2023-099', 15000.00, 'Cyber Cell'),
('CASE_2001', NULL, 100000.00, NULL),
('CASE_2002', NULL, 75000.00, NULL),
('CASE_3000', NULL, 200000.00, NULL),
('CASE_1006', 'FIR-2025-005', 40000.00, 'Chennai Police');

-- Civil Cases
INSERT INTO `CASE` VALUES 
('CASE_3001', 'CRT_HC_TN', NULL, 'TechCorp vs. Ram', '2026-05-01', 'Pending'),
('CASE_3002', 'CRT_HC_DL', NULL, 'Global Logistics vs. City Bank', '2025-06-10', 'Pending'),
('CASE_3003', 'CRT_DC_BLR', NULL, 'Apex Builders vs. Simran', '2025-07-15', 'Pending'),
('CASE_3004', 'CRT_HC_MH', NULL, 'Horizon Tech vs. Union of India', '2025-08-20', 'Pending'),
('CASE_3005', 'CRT_DC_CHN', NULL, 'Ram vs. Preeti', '2025-09-25', 'Pending'), 
('CASE_3006', 'CRT_HC_KA', NULL, 'TechCorp vs. Apex Builders', '2025-10-30', 'Pending'),
('CASE_3007', 'CRT_SC_01', NULL, 'City Bank vs. Union of India', '2025-11-05', 'Pending'),
('CASE_3008', 'CRT_DC_MUM', NULL, 'Kabir vs. Global Logistics', '2025-12-10', 'Pending'),
('CASE_3009', 'CRT_DC_ND', NULL, 'Simran vs. Horizon Tech', '2026-01-15', 'Pending'),
('CASE_3010', 'CRT_HC_TN', NULL, 'Priya vs. TechCorp', '2026-02-20', 'Pending');

INSERT INTO CIVIL_CASE VALUES 
('CASE_3001', 5000000.00, 'Contract Breach'),
('CASE_3002', 15000000.00, 'Commercial Dispute'),
('CASE_3003', 2500000.00, 'Property Dispute'),
('CASE_3004', 80000000.00, 'Tax Dispute'),
('CASE_3005', 500000.00, 'Defamation'),
('CASE_3006', 12000000.00, 'Intellectual Property'),
('CASE_3007', 50000000.00, 'Regulatory'),
('CASE_3008', 3500000.00, 'Labor Dispute'),
('CASE_3009', 4500000.00, 'Consumer Protection'),
('CASE_3010', 1000000.00, 'Contract Breach');



-- 8. Insert Litigants (CASE_PARTY)
INSERT INTO CASE_PARTY VALUES 
('PRT_01', 'ENT_001', 'CASE_1001', 'Prosecution'),
('PRT_02', 'ENT_002', 'CASE_1001', 'Defendant'),
('PRT_03', 'ENT_005', 'CASE_3001', 'Plaintiff'),
('PRT_04', 'ENT_002', 'CASE_3001', 'Respondent'),
('PRT_05', 'ENT_O8', 'CASE_1002', 'Prosecution'),
('PRT_06', 'ENT_P1', 'CASE_1002', 'Defendant'),
('PRT_07', 'ENT_O2', 'CASE_1003', 'Prosecution'),
('PRT_08', 'ENT_P3', 'CASE_1003', 'Defendant'),
('PRT_09', 'ENT_O1', 'CASE_1004', 'Prosecution'),
('PRT_10', 'ENT_002', 'CASE_1004', 'Defendant'), -- Ram involved in 3+ cases (Habitual Litigant)
('PRT_11', 'ENT_O4', 'CASE_3002', 'Plaintiff'),
('PRT_12', 'ENT_O5', 'CASE_3002', 'Respondent'),
('PRT_13', 'ENT_O6', 'CASE_3003', 'Plaintiff'),
('PRT_14', 'ENT_P2', 'CASE_3003', 'Respondent'),
('PRT_15', 'ENT_O7', 'CASE_3004', 'Plaintiff'),
('PRT_16', 'ENT_O3', 'CASE_3004', 'Respondent');

-- 9. Insert Counsel (CASE_COUNSEL)
INSERT INTO CASE_COUNSEL VALUES 
('CNSL_01', 'ENT_004', 'PRT_02', TRUE),
('CNSL_02', 'ENT_004', 'PRT_04', TRUE),
('CNSL_03', 'ENT_007', 'PRT_03', TRUE),
('CNSL_04', 'ENT_L2', 'PRT_06', TRUE),
('CNSL_05', 'ENT_L7', 'PRT_08', TRUE),
('CNSL_06', 'ENT_004', 'PRT_10', TRUE),
('CNSL_07', 'ENT_L1', 'PRT_11', TRUE),
('CNSL_08', 'ENT_L5', 'PRT_12', TRUE),
('CNSL_09', 'ENT_L3', 'PRT_13', TRUE),
('CNSL_10', 'ENT_L4', 'PRT_14', TRUE),
('CNSL_11', 'ENT_L1', 'PRT_15', TRUE),
('CNSL_12', 'ENT_L8', 'PRT_16', TRUE);

-- 10. Insert Proceedings (HEARINGS & BENCHES)
INSERT INTO HEARING VALUES 
('CASE_900', '2020-12-01 10:00:00', 'Final arguments heard. Judgment reserved.'),
('CASE_1001', '2025-02-15 11:30:00', 'Bail hearing. Bail granted.'),
('CASE_1005', '2024-05-10 10:30:00', 'Initial framing of charges.'), -- Stalled docket
('CASE_1003', '2025-04-01 11:00:00', 'Witness testimony.'),
('CASE_1003', '2025-04-15 14:00:00', 'Final arguments.'),
('CASE_1004', '2025-05-01 10:00:00', 'Evidence submission.'),
('CASE_3002', '2025-07-01 11:30:00', 'Arbitration failed. Trial begins.'),
('CASE_3003', '2025-08-01 14:30:00', 'Property inspection report reviewed.'),
('CASE_3005', '2025-10-01 10:00:00', 'Defamation evidence presented.'),
('CASE_3007', '2025-12-01 11:00:00', 'Supreme Court admission hearing.');

INSERT INTO HEARING_BENCH VALUES 
('BNCH_1', 'ENT_006', 'CASE_900', '2020-12-01 10:00:00', 'Single Judge'),
('BNCH_2', 'ENT_006', 'CASE_1001', '2025-02-15 11:30:00', 'Single Judge'),
('BNCH_3', 'ENT_J8', 'CASE_1005', '2024-05-10 10:30:00', 'Single Judge'),
('BNCH_4', 'ENT_J6', 'CASE_1003', '2025-04-01 11:00:00', 'Single Judge'),
('BNCH_5', 'ENT_J6', 'CASE_1003', '2025-04-15 14:00:00', 'Single Judge'),
('BNCH_6', 'ENT_J7', 'CASE_1004', '2025-05-01 10:00:00', 'Single Judge'),
('BNCH_7', 'ENT_J5', 'CASE_3002', '2025-07-01 11:30:00', 'Division Bench Lead'),
('BNCH_8', 'ENT_J7', 'CASE_3003', '2025-08-01 14:30:00', 'Single Judge'),
('BNCH_9', 'ENT_006', 'CASE_3005', '2025-10-01 10:00:00', 'Single Judge'),
('BNCH_10', 'ENT_J1', 'CASE_3007', '2025-12-01 11:00:00', 'Constitution Bench Lead');

-- 11. Insert Judgments (10 Records - Triggers 'Closed' status)
INSERT INTO JUDGMENT VALUES 
('JUDG_900', 'CASE_900', '2020-12-15', 'Guilty of financial fraud.'),
('JUDG_1003', 'CASE_1003', '2025-04-20', 'Acquitted due to lack of evidence.'),
('JUDG_1004', 'CASE_1004', '2025-05-15', 'Guilty of property theft.'),
('JUDG_3002', 'CASE_3002', '2025-07-15', 'Damages awarded to Plaintiff.'),
('JUDG_3003', 'CASE_3003', '2025-08-15', 'Injunction granted against Respondent.'),
('JUDG_3005', 'CASE_3005', '2025-10-15', 'Defamation proven. Fine imposed.'),
('JUDG_3007', 'CASE_3007', '2025-12-15', 'Regulatory action upheld.'),
('JUDG_3009', 'CASE_3009', '2026-01-30', 'Settled out of court.'),
('JUDG_1006', 'CASE_1006', '2025-06-15', 'Charges dismissed.'),
('JUDG_3008', 'CASE_3008', '2026-02-01', 'Compensation ordered.');

-- 12. Insert Statutes (10 Records)
INSERT INTO STATUTE_CHARGE VALUES 
('IPC_420', 'Cheating and Dishonesty', 'Inducing delivery of property via fraud.', 7),
('IPC_302', 'Murder', 'Punishment for murder.', 99),
('IPC_120B', 'Criminal Conspiracy', 'Party to a criminal conspiracy.', 2),
('IPC_378', 'Theft', 'Dishonest removal of movable property.', 3),
('IPC_498A', 'Cruelty', 'Husband or relative subjecting woman to cruelty.', 3),
('IPC_307', 'Attempt to Murder', 'Act with intent to cause death.', 10),
('IPC_506', 'Criminal Intimidation', 'Threatening injury to person or property.', 2),
('PCA_7', 'Bribery', 'Public servant taking gratification.', 7),
('IT_66', 'Cyber Terrorism', 'Hacking or data theft.', 3),
('NDBA_138', 'Cheque Bounce', 'Dishonor of cheque for insufficiency of funds.', 2);

-- 13. Insert Charge Sheets (12 Records)
INSERT INTO DOCKET_CHARGE_SHEET VALUES 
('CHG_01', 'CASE_1001', 'ENT_002', 'IPC_420', '2024-11-01 09:30:00', 'Pending', NULL),
('CHG_02', 'CASE_900', 'ENT_002', 'IPC_420', '2019-05-15 14:00:00', 'Guilty', '5 Years RI'),
('CHG_03', 'CASE_1001', 'ENT_002', 'IPC_120B', '2024-11-01 09:30:00', 'Pending', NULL), -- Double charge for habitual query
('CHG_04', 'CASE_1002', 'ENT_P1', 'PCA_7', '2025-01-10 10:00:00', 'Pending', NULL),
('CHG_05', 'CASE_1002', 'ENT_P1', 'IPC_120B', '2025-01-10 10:00:00', 'Pending', NULL),
('CHG_06', 'CASE_1003', 'ENT_P3', 'IPC_307', '2025-02-15 22:00:00', 'Acquitted', NULL),
('CHG_07', 'CASE_1004', 'ENT_002', 'IPC_378', '2025-03-10 14:00:00', 'Guilty', '2 Years RI'),
('CHG_08', 'CASE_1005', 'ENT_P2', 'IT_66', '2022-12-01 08:00:00', 'Pending', NULL),
('CHG_09', 'CASE_1006', 'ENT_P2', 'IPC_506', '2025-04-10 16:00:00', 'Dismissed', NULL),
('CHG_10', 'CASE_2001', 'ENT_002', 'IPC_420', '2026-03-01 10:00:00', 'Pending', NULL),
('CHG_11', 'CASE_1004', 'ENT_002', 'IPC_120B', '2025-03-10 14:00:00', 'Guilty', '1 Year RI'),
('CHG_12', 'CASE_1005', 'ENT_P2', 'IPC_420', '2022-12-01 08:00:00', 'Pending', NULL);

-- 14. Insert Precedent Tags (10 Records)
INSERT INTO PRECEDENT_TAG VALUES 
('TAG_01', 'Corporate Fraud'),
('TAG_02', 'Bail Jurisprudence'),
('TAG_03', 'Homicide'),
('TAG_04', 'Cybercrime'),
('TAG_05', 'Contract Law'),
('TAG_06', 'Property Rights'),
('TAG_07', 'Defamation'),
('TAG_08', 'Corruption'),
('TAG_09', 'Family Law'),
('TAG_10', 'Tax Evasion');

-- 15. Map Tags to Cases (15 Records)
INSERT INTO CASE_TAG_MAPPING VALUES 
('CASE_900', 'TAG_01'),
('CASE_1001', 'TAG_01'),
('CASE_2001', 'TAG_02'),
('CASE_1002', 'TAG_08'),
('CASE_1003', 'TAG_03'),
('CASE_1004', 'TAG_06'),
('CASE_1005', 'TAG_04'),
('CASE_3001', 'TAG_05'),
('CASE_3002', 'TAG_05'),
('CASE_3003', 'TAG_06'),
('CASE_3004', 'TAG_10'),
('CASE_3005', 'TAG_07'),
('CASE_3006', 'TAG_05'),
('CASE_3007', 'TAG_10'),
('CASE_3008', 'TAG_05');

-- 16. Insert Citations (10 Records)
INSERT INTO CASE_CITATION VALUES 
('CIT_01', 'CASE_2001', 'CASE_900', 'Cited standard for intent to defraud in corporate entities.'),
('CIT_02', 'CASE_1001', 'CASE_900', 'Relied on evidence admissibility ruling.'),
('CIT_03', 'CASE_3000', 'CASE_900', 'Supreme court referenced original landmark fraud judgment.'),
('CIT_04', 'CASE_1002', 'CASE_900', 'Cited for corruption linkage.'),
('CIT_05', 'CASE_2002', 'CASE_1003', 'Appealing the acquittal standard.'),
('CIT_06', 'CASE_3006', 'CASE_3002', 'Citing commercial dispute damages calculation.'),
('CIT_07', 'CASE_3007', 'CASE_3004', 'Tax evasion regulatory parallels.'),
('CIT_08', 'CASE_1006', 'CASE_1005', 'Cyber intimidation overlaps.'),
('CIT_09', 'CASE_3010', 'CASE_3001', 'Citing initial contract breach filing.'),
('CIT_10', 'CASE_3008', 'CASE_3002', 'Referencing corporate liability limitations.');



UPDATE `CASE` 
SET Status = 'Closed' 
WHERE Case_ID IN (SELECT Case_ID FROM JUDGMENT);

SET FOREIGN_KEY_CHECKS = 1;
