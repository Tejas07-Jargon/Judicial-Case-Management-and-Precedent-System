-- =============================================================================
-- SCRIPT: 00_setup_da1_schema.sql
-- PROJECT: Judicial Case Management and Precedent System
-- MODULE: DA1 Baseline & Cross-Module Prerequisite Schema (Oracle Edition)
-- AUTHOR: Member 2 (Aryan) & Team
-- COMPATIBILITY: Oracle Database 19c / 21c / 23ai / Oracle SQL Developer
-- =============================================================================
-- DESCRIPTION:
-- Sets up the DA1 core schema (Member 1: Courts, Legal Entities, Judges, Lawyers,
-- Cases, Litigants, Counsel) and Member 3 prerequisite tables (Statute Charges,
-- Charge Sheets, Precedents, Citations) in Oracle SQL format.
-- This script enables standalone, independent execution of the Member 2 module.
-- =============================================================================

SET FEEDBACK ON;
SET SERVEROUTPUT ON;
SET DEFINE OFF;

-- -----------------------------------------------------------------------------
-- 1. DROP EXISTING TABLES IN DEPENDENCY ORDER (Safe Re-run)
-- -----------------------------------------------------------------------------
BEGIN
    FOR t IN (SELECT table_name FROM user_tables WHERE table_name IN (
        'CASE_TAG_MAPPING', 'PRECEDENT_TAG', 'CASE_CITATION', 
        'DOCKET_CHARGE_SHEET', 'STATUTE_CHARGE', 'APPEAL', 'JUDGMENT', 
        'HEARING_BENCH', 'HEARING', 'CASE_COUNSEL', 'CASE_PARTY', 
        'CIVIL_CASE', 'CRIMINAL_CASE', 'CASES', 'LAWYER', 'JUDGE', 
        'PERSON', 'ORGANIZATION', 'LEGAL_ENTITY', 'COURT'
    )) LOOP
        BEGIN
            EXECUTE IMMEDIATE 'DROP TABLE ' || t.table_name || ' CASCADE CONSTRAINTS';
        EXCEPTION
            WHEN OTHERS THEN NULL;
        END;
    END LOOP;
END;
/

-- -----------------------------------------------------------------------------
-- 2. TIER 1: LEGAL ACTORS & INFRASTRUCTURE (MEMBER 1)
-- -----------------------------------------------------------------------------

CREATE TABLE COURT (
    Court_ID            VARCHAR2(50) PRIMARY KEY,
    Court_Name          VARCHAR2(150) NOT NULL,
    Tier_Level          VARCHAR2(50) NOT NULL CHECK (Tier_Level IN ('Supreme', 'High Court', 'District', 'Subordinate')),
    Jurisdiction_State  VARCHAR2(50) NOT NULL
);

CREATE TABLE LEGAL_ENTITY (
    Entity_ID           VARCHAR2(50) PRIMARY KEY,
    Contact_Email       VARCHAR2(100),
    Address             VARCHAR2(500)
);

CREATE TABLE ORGANIZATION (
    Entity_ID           VARCHAR2(50) PRIMARY KEY,
    Registration_No     VARCHAR2(50) UNIQUE NOT NULL, 
    Company_Name        VARCHAR2(100) NOT NULL,
    CONSTRAINT FK_ORG_ENTITY FOREIGN KEY (Entity_ID) 
        REFERENCES LEGAL_ENTITY(Entity_ID) ON DELETE CASCADE
);

CREATE TABLE PERSON (
    Entity_ID           VARCHAR2(50) PRIMARY KEY,
    Aadhar_ID           VARCHAR2(50) UNIQUE NOT NULL, 
    First_Name          VARCHAR2(50) NOT NULL,
    Last_Name           VARCHAR2(50) NOT NULL,
    DOB                 DATE,
    CONSTRAINT FK_PERSON_ENTITY FOREIGN KEY (Entity_ID) 
        REFERENCES LEGAL_ENTITY(Entity_ID) ON DELETE CASCADE
);

CREATE TABLE JUDGE (
    Entity_ID           VARCHAR2(50) PRIMARY KEY,
    Judicial_ID         VARCHAR2(50) UNIQUE NOT NULL, 
    Appointment_Date    DATE,
    Current_Court_ID    VARCHAR2(50),
    CONSTRAINT FK_JUDGE_PERSON FOREIGN KEY (Entity_ID) 
        REFERENCES PERSON(Entity_ID) ON DELETE CASCADE,
    CONSTRAINT FK_JUDGE_COURT FOREIGN KEY (Current_Court_ID) 
        REFERENCES COURT(Court_ID) ON DELETE SET NULL
);

CREATE TABLE LAWYER (
    Entity_ID           VARCHAR2(50) PRIMARY KEY,
    License_No          VARCHAR2(50) UNIQUE NOT NULL, 
    Specialization      VARCHAR2(100),
    Firm_Name           VARCHAR2(100),
    CONSTRAINT FK_LAWYER_PERSON FOREIGN KEY (Entity_ID) 
        REFERENCES PERSON(Entity_ID) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 3. TIER 2: CASES & REPRESENTATION (MEMBER 1)
-- -----------------------------------------------------------------------------

CREATE TABLE CASES (
    Case_ID             VARCHAR2(50) PRIMARY KEY,
    Court_ID            VARCHAR2(50) NOT NULL,
    Parent_Case_ID      VARCHAR2(50), 
    Title               VARCHAR2(200) NOT NULL,
    Filing_Date         DATE NOT NULL,
    Status              VARCHAR2(50) DEFAULT 'Pending' NOT NULL 
                        CHECK (Status IN ('Pending', 'Hearing', 'Disposed', 'Closed', 'Under Appeal')),
    CONSTRAINT FK_CASE_COURT FOREIGN KEY (Court_ID) 
        REFERENCES COURT(Court_ID),
    CONSTRAINT FK_CASE_PARENT FOREIGN KEY (Parent_Case_ID) 
        REFERENCES CASES(Case_ID) ON DELETE SET NULL
);

-- Compatibility view so queries using "CASE" also function smoothly in Oracle
CREATE OR REPLACE VIEW "CASE" AS SELECT * FROM CASES;

CREATE TABLE CRIMINAL_CASE (
    Case_ID             VARCHAR2(50) PRIMARY KEY,
    FIR_Or_Complaint_No VARCHAR2(50),
    Bail_Amount         NUMBER(15,2),
    Arresting_Agency    VARCHAR2(100),
    CONSTRAINT FK_CRIM_CASE FOREIGN KEY (Case_ID) 
        REFERENCES CASES(Case_ID) ON DELETE CASCADE
);

CREATE TABLE CIVIL_CASE (
    Case_ID             VARCHAR2(50) PRIMARY KEY,
    Dispute_Value       NUMBER(15,2),
    Civil_Case_Type     VARCHAR2(50),
    CONSTRAINT FK_CIV_CASE FOREIGN KEY (Case_ID) 
        REFERENCES CASES(Case_ID) ON DELETE CASCADE
);

CREATE TABLE CASE_PARTY (
    Party_ID            VARCHAR2(50) PRIMARY KEY,
    Entity_ID           VARCHAR2(50) NOT NULL,
    Case_ID             VARCHAR2(50) NOT NULL,
    Party_Role          VARCHAR2(50) NOT NULL,
    CONSTRAINT FK_PARTY_ENTITY FOREIGN KEY (Entity_ID) 
        REFERENCES LEGAL_ENTITY(Entity_ID),
    CONSTRAINT FK_PARTY_CASE FOREIGN KEY (Case_ID) 
        REFERENCES CASES(Case_ID) ON DELETE CASCADE,
    CONSTRAINT UQ_PARTY_ROLE UNIQUE (Entity_ID, Case_ID, Party_Role)
);

CREATE TABLE CASE_COUNSEL (
    Counsel_ID          VARCHAR2(50) PRIMARY KEY,
    Lawyer_ID           VARCHAR2(50) NOT NULL,
    Party_ID            VARCHAR2(50) NOT NULL,
    Lead_Counsel_Flag   NUMBER(1) DEFAULT 0 NOT NULL CHECK (Lead_Counsel_Flag IN (0, 1)),
    CONSTRAINT FK_COUNSEL_LAWYER FOREIGN KEY (Lawyer_ID) 
        REFERENCES LAWYER(Entity_ID),
    CONSTRAINT FK_COUNSEL_PARTY FOREIGN KEY (Party_ID) 
        REFERENCES CASE_PARTY(Party_ID) ON DELETE CASCADE,
    CONSTRAINT UQ_COUNSEL_PARTY UNIQUE (Lawyer_ID, Party_ID)
);

-- -----------------------------------------------------------------------------
-- 4. TIER 4: CHARGES & PRECEDENTS (MEMBER 3 PREREQUISITES)
-- -----------------------------------------------------------------------------

CREATE TABLE STATUTE_CHARGE (
    Charge_Code         VARCHAR2(50) PRIMARY KEY,
    Section_Name        VARCHAR2(150) NOT NULL,
    Description         VARCHAR2(1000),
    Max_Sentence_Years  NUMBER(3)
);

CREATE TABLE DOCKET_CHARGE_SHEET (
    Charge_Sheet_ID     VARCHAR2(50) PRIMARY KEY,
    Criminal_Case_ID    VARCHAR2(50) NOT NULL,
    Defendant_ID        VARCHAR2(50) NOT NULL,
    Charge_Code         VARCHAR2(50) NOT NULL,
    Incident_Timestamp  TIMESTAMP NOT NULL,
    Verdict_Type        VARCHAR2(50),
    Sentence_Imposed    VARCHAR2(100),
    CONSTRAINT FK_DOCKET_CASE FOREIGN KEY (Criminal_Case_ID) 
        REFERENCES CRIMINAL_CASE(Case_ID) ON DELETE CASCADE,
    CONSTRAINT FK_DOCKET_DEFENDANT FOREIGN KEY (Defendant_ID) 
        REFERENCES LEGAL_ENTITY(Entity_ID),
    CONSTRAINT FK_DOCKET_CHARGE FOREIGN KEY (Charge_Code) 
        REFERENCES STATUTE_CHARGE(Charge_Code),
    CONSTRAINT UQ_DOUBLE_JEOPARDY UNIQUE (Defendant_ID, Charge_Code, Incident_Timestamp)
);

CREATE TABLE CASE_CITATION (
    Citation_ID             VARCHAR2(50) PRIMARY KEY,
    Citing_Case_ID          VARCHAR2(50) NOT NULL,
    Cited_Precedent_Case_ID VARCHAR2(50) NOT NULL,
    Relevance_Note          VARCHAR2(1000),
    CONSTRAINT FK_CITE_CITING FOREIGN KEY (Citing_Case_ID) 
        REFERENCES CASES(Case_ID) ON DELETE CASCADE,
    CONSTRAINT FK_CITE_CITED FOREIGN KEY (Cited_Precedent_Case_ID) 
        REFERENCES CASES(Case_ID) ON DELETE CASCADE,
    CONSTRAINT UQ_CASE_CITATION UNIQUE (Citing_Case_ID, Cited_Precedent_Case_ID)
);

CREATE TABLE PRECEDENT_TAG (
    Tag_ID              VARCHAR2(50) PRIMARY KEY,
    Keyword             VARCHAR2(100) UNIQUE NOT NULL
);

CREATE TABLE CASE_TAG_MAPPING (
    Case_ID             VARCHAR2(50) NOT NULL,
    Tag_ID              VARCHAR2(50) NOT NULL,
    CONSTRAINT PK_CASE_TAG PRIMARY KEY (Case_ID, Tag_ID),
    CONSTRAINT FK_MAP_CASE FOREIGN KEY (Case_ID) 
        REFERENCES CASES(Case_ID) ON DELETE CASCADE,
    CONSTRAINT FK_MAP_TAG FOREIGN KEY (Tag_ID) 
        REFERENCES PRECEDENT_TAG(Tag_ID) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- 5. SEED BASELINE DATA (DA1 & MEMBER 1 / MEMBER 3)
-- -----------------------------------------------------------------------------

-- Courts across Indian hierarchy
INSERT INTO COURT VALUES ('CRT_SC_01', 'Supreme Court of India', 'Supreme', 'Delhi');
INSERT INTO COURT VALUES ('CRT_HC_TN', 'Madras High Court', 'High Court', 'Tamil Nadu');
INSERT INTO COURT VALUES ('CRT_HC_DEL', 'Delhi High Court', 'High Court', 'Delhi');
INSERT INTO COURT VALUES ('CRT_DC_CHN', 'Chennai District Court', 'District', 'Tamil Nadu');
INSERT INTO COURT VALUES ('CRT_DC_BGL', 'Bengaluru City Civil Court', 'District', 'Karnataka');

-- Legal Entities
INSERT INTO LEGAL_ENTITY VALUES ('ENT_001', 'contact@tn.gov.in', 'Secretariat, Chennai');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_002', 'ram@email.com', 'Anna Nagar, Chennai');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_003', 'shankar.judge@judiciary.in', 'High Court Quarters, Chennai');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_004', 'kamal.advocate@law.in', 'Mylapore, Chennai');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_005', 'corp@tech.com', 'OMR IT Corridor, Chennai');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_006', 'krishna.judge@judiciary.in', 'District Judicial Quarters, Chennai');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_007', 'priya.desh@law.in', 'T-Nagar, Chennai');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_008', 'banumathi.sc@judiciary.in', 'Tilak Marg Quarters, New Delhi');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_009', 'sanjay.hc@judiciary.in', 'Egmore, Chennai');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_010', 'chandrachud.sc@judiciary.in', 'Krishna Menon Marg, New Delhi');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_011', 'meera.sharma@email.com', 'Indiranagar, Bengaluru');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_012', 'southcity.realty@corp.in', 'MG Road, Bengaluru');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_013', 'cbi.hq@gov.in', 'CGO Complex, New Delhi');
INSERT INTO LEGAL_ENTITY VALUES ('ENT_014', 'harish.mehta@securities.com', 'Nariman Point, Mumbai');

-- Organizations
INSERT INTO ORGANIZATION VALUES ('ENT_001', 'CIN-TN-GOV-999', 'State of Tamil Nadu');
INSERT INTO ORGANIZATION VALUES ('ENT_005', 'CIN-TECH-1029', 'TechCorp Solutions Pvt Ltd');
INSERT INTO ORGANIZATION VALUES ('ENT_012', 'CIN-REAL-5521', 'South City Real Estate Developers');
INSERT INTO ORGANIZATION VALUES ('ENT_013', 'GOV-CBI-INDIA', 'Central Bureau of Investigation');

-- Persons
INSERT INTO PERSON VALUES ('ENT_002', 'AADHAAR-TN-1002', 'Ram', 'Kumar', DATE '1985-06-15');
INSERT INTO PERSON VALUES ('ENT_003', 'AADHAAR-TN-1003', 'Shankar', 'Mahadevan', DATE '1970-02-10');
INSERT INTO PERSON VALUES ('ENT_004', 'AADHAAR-TN-1004', 'Kamal', 'Hassan', DATE '1982-11-20');
INSERT INTO PERSON VALUES ('ENT_006', 'AADHAAR-TN-1006', 'Krishna', 'Iyer', DATE '1975-04-12');
INSERT INTO PERSON VALUES ('ENT_007', 'AADHAAR-TN-1007', 'Priya', 'Deshmukh', DATE '1988-09-05');
INSERT INTO PERSON VALUES ('ENT_008', 'AADHAAR-DL-1008', 'R.', 'Banumathi', DATE '1962-07-20');
INSERT INTO PERSON VALUES ('ENT_009', 'AADHAAR-TN-1009', 'Sanjay', 'Kishan', DATE '1968-01-14');
INSERT INTO PERSON VALUES ('ENT_010', 'AADHAAR-DL-1010', 'D.Y.', 'Chandrachud', DATE '1959-11-11');
INSERT INTO PERSON VALUES ('ENT_011', 'AADHAAR-KA-1011', 'Meera', 'Sharma', DATE '1990-03-25');
INSERT INTO PERSON VALUES ('ENT_014', 'AADHAAR-MH-1014', 'Harish', 'Mehta', DATE '1978-08-30');

-- Judges
INSERT INTO JUDGE VALUES ('ENT_003', 'JUDGE-TN-882', DATE '2015-08-10', 'CRT_HC_TN');
INSERT INTO JUDGE VALUES ('ENT_006', 'JUDGE-TN-401', DATE '2018-05-20', 'CRT_DC_CHN');
INSERT INTO JUDGE VALUES ('ENT_008', 'JUDGE-SC-101', DATE '2014-08-13', 'CRT_SC_01');
INSERT INTO JUDGE VALUES ('ENT_009', 'JUDGE-HC-550', DATE '2016-11-05', 'CRT_HC_TN');
INSERT INTO JUDGE VALUES ('ENT_010', 'JUDGE-SC-102', DATE '2016-05-13', 'CRT_SC_01');

-- Lawyers
INSERT INTO LAWYER VALUES ('ENT_004', 'BAR-TN-2005', 'Criminal & Corporate Defense', 'Kamal & Associates');
INSERT INTO LAWYER VALUES ('ENT_007', 'BAR-TN-2015', 'Civil & Commercial Litigation', 'Deshmukh Legal Chambers');

-- Baseline Cases
-- Case 900: Historic fraud (District Court, closed)
INSERT INTO CASES VALUES ('CASE_900', 'CRT_DC_CHN', NULL, 'State vs. Historic Fraud', DATE '2020-01-10', 'Disposed');
INSERT INTO CRIMINAL_CASE VALUES ('CASE_900', 'FIR-2020-11', 10000.00, 'CBI');

-- Case 1001: Active criminal case (District Court)
INSERT INTO CASES VALUES ('CASE_1001', 'CRT_DC_CHN', NULL, 'State of TN vs. Ram', DATE '2024-01-10', 'Hearing');
INSERT INTO CRIMINAL_CASE VALUES ('CASE_1001', 'FIR-2024-001', 50000.00, 'Chennai Police');

-- Case 2001: Criminal appeal of CASE_1001 (Madras High Court)
INSERT INTO CASES VALUES ('CASE_2001', 'CRT_HC_TN', 'CASE_1001', 'Ram vs. State of TN (Appeal)', DATE '2025-03-15', 'Under Appeal');
INSERT INTO CRIMINAL_CASE VALUES ('CASE_2001', NULL, 100000.00, NULL);

-- Case 3001: Commercial dispute (Madras High Court)
INSERT INTO CASES VALUES ('CASE_3001', 'CRT_HC_TN', NULL, 'TechCorp vs. Ram', DATE '2025-05-01', 'Hearing');
INSERT INTO CIVIL_CASE VALUES ('CASE_3001', 5000000.00, 'Contract Breach');

-- Case 4001: Long-running environmental case (> 2 years before judgment)
INSERT INTO CASES VALUES ('CASE_4001', 'CRT_DC_CHN', NULL, 'Union of India vs. Apex Mining Corp', DATE '2021-03-15', 'Disposed');
INSERT INTO CIVIL_CASE VALUES ('CASE_4001', 12000000.00, 'Environmental Degradation');

-- Case 4002: Appeal of CASE_4001 in Madras High Court
INSERT INTO CASES VALUES ('CASE_4002', 'CRT_HC_TN', 'CASE_4001', 'Apex Mining Corp vs. Union of India (Appeal)', DATE '2023-09-10', 'Under Appeal');
INSERT INTO CIVIL_CASE VALUES ('CASE_4002', 12000000.00, 'Appellate Review');

-- Case 5001: Multi-hearing ongoing civil suit (No judgment yet)
INSERT INTO CASES VALUES ('CASE_5001', 'CRT_DC_BGL', NULL, 'Meera Sharma vs. South City Real Estate', DATE '2023-06-20', 'Hearing');
INSERT INTO CIVIL_CASE VALUES ('CASE_5001', 3500000.00, 'Consumer Real Estate Fraud');

-- Case 6001: Major securities fraud trial (Disposed)
INSERT INTO CASES VALUES ('CASE_6001', 'CRT_DC_CHN', NULL, 'CBI vs. Harish Mehta & Ors', DATE '2022-08-14', 'Disposed');
INSERT INTO CRIMINAL_CASE VALUES ('CASE_6001', 'FIR-CBI-2022-08', 2500000.00, 'CBI Special Crime Branch');

-- Case 7001: Freshly filed public interest writ (Pending, no hearings)
INSERT INTO CASES VALUES ('CASE_7001', 'CRT_HC_DEL', NULL, 'Citizens Forum vs. Municipal Corporation', DATE '2026-02-01', 'Pending');
INSERT INTO CIVIL_CASE VALUES ('CASE_7001', 0.00, 'Public Interest Litigation');

-- Case Parties
INSERT INTO CASE_PARTY VALUES ('PRT_01', 'ENT_001', 'CASE_1001', 'Prosecution');
INSERT INTO CASE_PARTY VALUES ('PRT_02', 'ENT_002', 'CASE_1001', 'Defendant');
INSERT INTO CASE_PARTY VALUES ('PRT_03', 'ENT_005', 'CASE_3001', 'Plaintiff');
INSERT INTO CASE_PARTY VALUES ('PRT_04', 'ENT_002', 'CASE_3001', 'Respondent');
INSERT INTO CASE_PARTY VALUES ('PRT_05', 'ENT_011', 'CASE_5001', 'Plaintiff');
INSERT INTO CASE_PARTY VALUES ('PRT_06', 'ENT_012', 'CASE_5001', 'Defendant');
INSERT INTO CASE_PARTY VALUES ('PRT_07', 'ENT_013', 'CASE_6001', 'Prosecution');
INSERT INTO CASE_PARTY VALUES ('PRT_08', 'ENT_014', 'CASE_6001', 'Defendant');

-- Case Counsel
INSERT INTO CASE_COUNSEL VALUES ('CNSL_01', 'ENT_004', 'PRT_02', 1);
INSERT INTO CASE_COUNSEL VALUES ('CNSL_02', 'ENT_004', 'PRT_04', 1);
INSERT INTO CASE_COUNSEL VALUES ('CNSL_03', 'ENT_007', 'PRT_03', 1);
INSERT INTO CASE_COUNSEL VALUES ('CNSL_04', 'ENT_007', 'PRT_05', 1);
INSERT INTO CASE_COUNSEL VALUES ('CNSL_05', 'ENT_004', 'PRT_08', 1);

-- Member 3 Baseline Data (Statutes, Charges, Citations, Tags)
INSERT INTO STATUTE_CHARGE VALUES ('IPC_420', 'Cheating and Dishonesty', 'Inducing delivery of property dishonestly', 7);
INSERT INTO STATUTE_CHARGE VALUES ('IPC_409', 'Criminal Breach of Trust', 'Breach of trust by public servant, banker or agent', 10);
INSERT INTO STATUTE_CHARGE VALUES ('IPC_120B', 'Criminal Conspiracy', 'Party to a criminal conspiracy to commit offense', 7);
INSERT INTO STATUTE_CHARGE VALUES ('IPC_302', 'Murder', 'Punishment for murder', 99);

INSERT INTO DOCKET_CHARGE_SHEET VALUES ('CHG_01', 'CASE_1001', 'ENT_002', 'IPC_420', TIMESTAMP '2024-01-15 10:00:00', 'Framed', NULL);
INSERT INTO DOCKET_CHARGE_SHEET VALUES ('CHG_02', 'CASE_900', 'ENT_002', 'IPC_420', TIMESTAMP '2020-01-20 14:00:00', 'Guilty', '5 Years Rigorous Imprisonment');
INSERT INTO DOCKET_CHARGE_SHEET VALUES ('CHG_03', 'CASE_6001', 'ENT_014', 'IPC_409', TIMESTAMP '2022-09-01 11:30:00', 'Guilty', '7 Years Rigorous Imprisonment');

INSERT INTO PRECEDENT_TAG VALUES ('TAG_01', 'Corporate Fraud');
INSERT INTO PRECEDENT_TAG VALUES ('TAG_02', 'Bail Jurisprudence');
INSERT INTO PRECEDENT_TAG VALUES ('TAG_03', 'Environmental Liability');
INSERT INTO PRECEDENT_TAG VALUES ('TAG_04', 'Specific Performance');

INSERT INTO CASE_TAG_MAPPING VALUES ('CASE_900', 'TAG_01');
INSERT INTO CASE_TAG_MAPPING VALUES ('CASE_1001', 'TAG_01');
INSERT INTO CASE_TAG_MAPPING VALUES ('CASE_2001', 'TAG_02');
INSERT INTO CASE_TAG_MAPPING VALUES ('CASE_4001', 'TAG_03');
INSERT INTO CASE_TAG_MAPPING VALUES ('CASE_6001', 'TAG_01');

INSERT INTO CASE_CITATION VALUES ('CIT_01', 'CASE_2001', 'CASE_900', 'Cited landmark threshold for intent in financial misstatements.');
INSERT INTO CASE_CITATION VALUES ('CIT_02', 'CASE_4002', 'CASE_4001', 'Appellate review on polluter pays doctrine quantification.');

COMMIT;

PROMPT =====================================================================
PROMPT DA1 Baseline & Cross-Module Prerequisite Schema Loaded Successfully!
PROMPT =====================================================================
