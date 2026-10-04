
CREATE DATABASE DBMS_DA2_CONCEPT;

USE DBMS_DA2_CONCEPT;

-- Disable foreign key checks for clean initialization
SET FOREIGN_KEY_CHECKS = 0;

-- Drop all tables to prevent conflicts during testing
DROP TABLE IF EXISTS CASE_TAG_MAPPING, PRECEDENT_TAG, CASE_CITATION, 
DOCKET_CHARGE_SHEET, STATUTE_CHARGE, JUDGMENT, HEARING_BENCH, HEARING, 
CIVIL_CASE, CRIMINAL_CASE, CASE_COUNSEL, CASE_PARTY, `CASE`, 
LAWYER, JUDGE, PERSON, ORGANIZATION, LEGAL_ENTITY, COURT;

SET FOREIGN_KEY_CHECKS = 1;

-- =================================================================
-- TIER 1: LEGAL ACTORS & INFRASTRUCTURE
-- =================================================================
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

-- =================================================================
-- TIER 2: CASES & REPRESENTATION
-- =================================================================
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
    Bail_Amount DECIMAL(15,2),
    Arresting_Agency VARCHAR(100),
    FOREIGN KEY (Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE CASCADE
);

CREATE TABLE CIVIL_CASE (
    Case_ID VARCHAR(50) PRIMARY KEY,
    Dispute_Value DECIMAL(15,2),
    Civil_Case_Type VARCHAR(50),
    FOREIGN KEY (Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE CASCADE
);

CREATE TABLE CASE_PARTY (
    Party_ID VARCHAR(50) PRIMARY KEY,
    Entity_ID VARCHAR(50) NOT NULL,
    Case_ID VARCHAR(50) NOT NULL,
    Party_Role VARCHAR(50) NOT NULL,
    FOREIGN KEY (Entity_ID) REFERENCES LEGAL_ENTITY(Entity_ID),
    FOREIGN KEY (Case_ID) REFERENCES `CASE`(Case_ID),
    UNIQUE (Entity_ID, Case_ID, Party_Role) -- Candidate Key from DA1
);

CREATE TABLE CASE_COUNSEL (
    Counsel_ID VARCHAR(50) PRIMARY KEY,
    Lawyer_ID VARCHAR(50) NOT NULL,
    Party_ID VARCHAR(50) NOT NULL,
    Lead_Counsel_Flag BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (Lawyer_ID) REFERENCES LAWYER(Entity_ID),
    FOREIGN KEY (Party_ID) REFERENCES CASE_PARTY(Party_ID),
    UNIQUE (Lawyer_ID, Party_ID) -- Candidate Key from DA1
);

-- =================================================================
-- TIER 3: HEARINGS & JUDGMENTS
-- =================================================================
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
    Case_ID VARCHAR(50) UNIQUE NOT NULL, -- 1:1 Optional relationship constraint
    Verdict_Date DATE,
    Judgment_Text TEXT,
    FOREIGN KEY (Case_ID) REFERENCES `CASE`(Case_ID) ON DELETE CASCADE
);

-- =================================================================
-- TIER 4: DOUBLE JEOPARDY & PRECEDENTS
-- =================================================================
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
    UNIQUE (Defendant_ID, Charge_Code, Incident_Timestamp) -- Double Jeopardy Constraint
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







DELIMITER //

CREATE TRIGGER prevent_judge_as_lawyer
BEFORE INSERT ON JUDGE
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM LAWYER WHERE Entity_ID = NEW.Entity_ID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Disjoint Violation: Entity is an active Lawyer.';
    END IF;
END //

CREATE TRIGGER prevent_lawyer_as_judge
BEFORE INSERT ON LAWYER
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1 FROM JUDGE WHERE Entity_ID = NEW.Entity_ID) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Disjoint Violation: Entity is an active Judge.';
    END IF;
END //


-- [TRIGGER]: Automatically close a case when a Judgment is rendered (Member 2 Logic)
CREATE TRIGGER auto_close_case_on_judgment
AFTER INSERT ON JUDGMENT
FOR EACH ROW
BEGIN
    UPDATE `CASE` 
    SET Status = 'Closed' 
    WHERE Case_ID = NEW.Case_ID;
END //

-- [TRIGGER]: Prevent scheduling new hearings for closed cases (Member 2 Logic)
CREATE TRIGGER prevent_hearing_on_closed_case
BEFORE INSERT ON HEARING
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(50);
    SELECT Status INTO v_status FROM `CASE` WHERE Case_ID = NEW.Case_ID;
    
    IF v_status = 'Closed' THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'Lifecycle Violation: Cannot schedule a hearing for a closed case.';
    END IF;
END //

-- [FUNCTION]: Get total active caseload for a specific Court (Member 1 Logic)
CREATE FUNCTION Get_Court_Case_Count(p_Court_ID VARCHAR(50)) 
RETURNS INT
DETERMINISTIC READS SQL DATA
BEGIN
    DECLARE total_cases INT DEFAULT 0;
    SELECT COUNT(*) INTO total_cases FROM `CASE` WHERE Court_ID = p_Court_ID;
    RETURN total_cases;
END //

-- [PROCEDURE]: ACID-compliant Case Registration spanning Superclass & Subclass
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
END //


-- [PROCEDURE]: Safely Assign Counsel to a Party (Member 1 Logic)
CREATE PROCEDURE Assign_Counsel_To_Party(
    IN p_Counsel_ID VARCHAR(50),
    IN p_Lawyer_ID VARCHAR(50),
    IN p_Party_ID VARCHAR(50),
    IN p_Is_Lead BOOLEAN
)
BEGIN
    -- Validate that the entity is actually an active lawyer
    IF NOT EXISTS (SELECT 1 FROM LAWYER WHERE Entity_ID = p_Lawyer_ID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Entity_ID is not a registered Lawyer.';
    END IF;

    -- Validate that the party exists in the case
    IF NOT EXISTS (SELECT 1 FROM CASE_PARTY WHERE Party_ID = p_Party_ID) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Validation Error: Party_ID does not exist.';
    END IF;

    -- Insert assignment
    INSERT INTO CASE_COUNSEL (Counsel_ID, Lawyer_ID, Party_ID, Lead_Counsel_Flag)
    VALUES (p_Counsel_ID, p_Lawyer_ID, p_Party_ID, p_Is_Lead);
END //

DELIMITER ;








-- 1. Insert Courts
INSERT INTO COURT VALUES 
('CRT_SC_01', 'Supreme Court of India', 'Supreme', 'Delhi'),
('CRT_HC_TN', 'Madras High Court', 'High Court', 'Tamil Nadu'),
('CRT_DC_CHN', 'Chennai District Court', 'District', 'Tamil Nadu');

-- 2. Insert Legal Entities
INSERT INTO LEGAL_ENTITY VALUES 
('ENT_001', 'contact@tn.gov.in', 'Secretariat, Chennai'),
('ENT_002', 'ram@email.com', 'Anna Nagar, Chennai'),
('ENT_003', 'shankar.judge@judiciary.in', 'High Court Quarters'),
('ENT_004', 'kamal.advocate@law.in', 'Mylapore, Chennai'),
('ENT_005', 'corp@tech.com', 'OMR, Chennai'),
('ENT_006', 'krishna.judge@judiciary.in', 'District Quarters');

-- 3. Map Subclasses (Organizations & Persons)
INSERT INTO ORGANIZATION VALUES 
('ENT_001', 'CIN-TN-GOV-999', 'State of Tamil Nadu'),
('ENT_005', 'CIN-TECH-1029', 'TechCorp Solutions');

INSERT INTO PERSON VALUES 
('ENT_002', '[Aadhaar Redacted 1]', 'Ram', 'Kumar', '1985-06-15'),
('ENT_003', '[Aadhaar Redacted 2]', 'Shankar', 'Mahadevan', '1970-02-10'),
('ENT_004', '[Aadhaar Redacted 3]', 'Kamal', 'Hassan', '1982-11-20'),
('ENT_006', '[Aadhaar Redacted 4]', 'Krishna', 'Iyer', '1975-04-12');

-- 4. Assign Judges & Lawyers
INSERT INTO JUDGE VALUES 
('ENT_003', 'JUDGE-TN-882', '2015-08-10', 'CRT_HC_TN'),
('ENT_006', 'JUDGE-TN-401', '2018-05-20', 'CRT_DC_CHN');

INSERT INTO LAWYER VALUES 
('ENT_004', 'BAR-TN-2005', 'Criminal & Corporate Defense', 'Kamal & Associates');

-- 5. Insert Cases (Base + Subclasses)
-- A past historical criminal case (Trial Court)


INSERT INTO `CASE` VALUES ('CASE_900', 'CRT_DC_CHN', NULL, 'State vs. Historic Fraud', '2020-01-10', 'Pending');
INSERT INTO CRIMINAL_CASE VALUES ('CASE_900', 'FIR-2020-11', 10000.00, 'CBI');

-- A current criminal case (Trial Court)
INSERT INTO `CASE` VALUES ('CASE_1001', 'CRT_DC_CHN', NULL, 'State of TN vs. Ram', '2025-01-10', 'Pending');
INSERT INTO CRIMINAL_CASE VALUES ('CASE_1001', 'FIR-2025-001', 50000.00, 'Chennai Police');

-- An active appeal for the criminal case (High Court)
INSERT INTO `CASE` VALUES ('CASE_2001', 'CRT_HC_TN', 'CASE_1001', 'Ram vs. State of TN (Appeal)', '2026-03-15', 'Pending');
INSERT INTO CRIMINAL_CASE VALUES ('CASE_2001', NULL, 100000.00, NULL);

-- A civil lawsuit
INSERT INTO `CASE` VALUES ('CASE_3001', 'CRT_HC_TN', NULL, 'TechCorp vs. Ram', '2026-05-01', 'Pending');
INSERT INTO CIVIL_CASE VALUES ('CASE_3001', 5000000.00, 'Contract Breach');

-- 6. Insert Litigants (CASE_PARTY) and Lawyers (CASE_COUNSEL)
INSERT INTO CASE_PARTY VALUES 
('PRT_01', 'ENT_001', 'CASE_1001', 'Prosecution'),
('PRT_02', 'ENT_002', 'CASE_1001', 'Defendant'),
('PRT_03', 'ENT_005', 'CASE_3001', 'Plaintiff'),
('PRT_04', 'ENT_002', 'CASE_3001', 'Respondent');

INSERT INTO CASE_COUNSEL VALUES 
('CNSL_01', 'ENT_004', 'PRT_02', TRUE),
('CNSL_02', 'ENT_004', 'PRT_04', TRUE);

-- 7. Insert Proceedings (HEARINGS & BENCHES)
INSERT INTO HEARING VALUES 
('CASE_900', '2020-12-01 10:00:00', 'Final arguments heard. Judgment reserved.'),
('CASE_1001', '2025-02-15 11:30:00', 'Bail hearing. Bail granted.'),
('CASE_2001', '2026-04-10 14:00:00', 'Appeal admission hearing.');

INSERT INTO HEARING_BENCH VALUES 
('BNCH_1', 'ENT_006', 'CASE_900', '2020-12-01 10:00:00', 'Single Judge'),
('BNCH_2', 'ENT_006', 'CASE_1001', '2025-02-15 11:30:00', 'Single Judge'),
('BNCH_3', 'ENT_003', 'CASE_2001', '2026-04-10 14:00:00', 'Division Bench Lead');

-- 8. Insert Judgments
INSERT INTO JUDGMENT VALUES 
('JUDG_900', 'CASE_900', '2020-12-15', 'The court finds the defendant guilty of financial fraud under IPC 420.');

-- 9. Insert Statutes & Charges (Double Jeopardy Protection)
INSERT INTO STATUTE_CHARGE VALUES 
('IPC_420', 'Cheating and Dishonesty', 'Inducing delivery of property via fraud.', 7),
('IPC_302', 'Murder', 'Punishment for murder.', 99);

-- Add an extra lawyer to show diverse representation
INSERT INTO LEGAL_ENTITY VALUES ('ENT_007', 'priya.desh@law.in', 'T-Nagar, Chennai');
INSERT INTO PERSON VALUES ('ENT_007', '[Aadhaar Redacted 5]', 'Priya', 'Deshmukh', '1988-09-05');
INSERT INTO LAWYER VALUES ('ENT_007', 'BAR-TN-2015', 'Civil Litigation', 'Deshmukh Legal');

-- Add Priya as counsel for the Civil Case (CASE_3001) Plaintiff
INSERT INTO CASE_COUNSEL VALUES ('CNSL_03', 'ENT_007', 'PRT_03', TRUE);

-- REPLACE your DOCKET_CHARGE_SHEET block with this to include CHG_02
INSERT INTO DOCKET_CHARGE_SHEET VALUES 
('CHG_01', 'CASE_1001', 'ENT_002', 'IPC_420', '2024-11-01 09:30:00', 'Pending', NULL),
('CHG_02', 'CASE_900', 'ENT_002', 'IPC_420', '2019-05-15 14:00:00', 'Guilty', '5 Years RI');


-- 10. Insert Precedent Tags & Citations
INSERT INTO PRECEDENT_TAG VALUES 
('TAG_01', 'Corporate Fraud'),
('TAG_02', 'Bail Jurisprudence');

INSERT INTO CASE_TAG_MAPPING VALUES 
('CASE_900', 'TAG_01'),
('CASE_1001', 'TAG_01'),
('CASE_2001', 'TAG_02');

INSERT INTO CASE_CITATION VALUES 
('CIT_01', 'CASE_2001', 'CASE_900', 'Cited standard for intent to defraud in corporate entities.');



