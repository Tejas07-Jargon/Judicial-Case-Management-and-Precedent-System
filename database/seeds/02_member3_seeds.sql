-- =================================================================
-- Judicial Case Management and Precedent System
-- Module: Criminal Cases, Charges, Incidents and Legal Precedents (Member 3)
-- Seeds 02: Demonstration Records for Member 3 Module
-- Prerequisites: scripts.sql and 01_incident_and_precedent_refinements.sql
-- Database Engine: MySQL 8.0+
-- =================================================================

USE DBMS_DA2_CONCEPT;

-- -----------------------------------------------------------------
-- 1. EXTENDED STATUTORY CHARGES CATALOGUE
-- Expanded penal and statutory provisions with maximum sentences
-- -----------------------------------------------------------------
INSERT INTO STATUTE_CHARGE (Charge_Code, Section_Name, Description, Max_Sentence_Years)
VALUES
('IPC_406', 'Criminal Breach of Trust', 'Dishonest misappropriation or conversion to own use of entrusted property.', 3),
('IPC_467', 'Forgery of Valuable Security', 'Forgery of documents purporting to be a valuable security, will, or authority to receive money.', 10),
('IT_66D', 'Cheating by Personation Using Computer Resource', 'Cheating by personating any person by using any computer resource or communication device.', 3),
('IPC_120B', 'Criminal Conspiracy', 'Being party to a criminal conspiracy to commit an offence punishable with death, imprisonment for life or rigorous imprisonment.', 7)
ON DUPLICATE KEY UPDATE 
    Section_Name = VALUES(Section_Name),
    Description = VALUES(Description),
    Max_Sentence_Years = VALUES(Max_Sentence_Years);

-- -----------------------------------------------------------------
-- 2. ADDITIONAL FICTIONAL LEGAL ENTITIES & PERSONS
-- Fictional identities for multi-defendant & corporate proceedings
-- -----------------------------------------------------------------
INSERT INTO LEGAL_ENTITY (Entity_ID, Contact_Email, Address)
VALUES
('ENT_008', 'contact@apexlogistics.demo', '14 Guindy Industrial Estate, Chennai'),
('ENT_009', 'vikram.malhotra@demo.in', '78 Boat Club Road, Chennai'),
('ENT_010', 'suresh.raina@demo.in', '22 Velachery Main Road, Chennai')
ON DUPLICATE KEY UPDATE Contact_Email = VALUES(Contact_Email), Address = VALUES(Address);

INSERT INTO ORGANIZATION (Entity_ID, Registration_No, Company_Name)
VALUES
('ENT_008', 'CIN-TN-LOG-2021-9988', 'Apex Logistics Solutions Ltd')
ON DUPLICATE KEY UPDATE Company_Name = VALUES(Company_Name);

INSERT INTO PERSON (Entity_ID, Aadhar_ID, First_Name, Last_Name, DOB)
VALUES
('ENT_009', '[Fictional-ID-009]', 'Vikram', 'Malhotra', '1980-04-14'),
('ENT_010', '[Fictional-ID-010]', 'Suresh', 'Raina', '1987-09-28')
ON DUPLICATE KEY UPDATE First_Name = VALUES(First_Name), Last_Name = VALUES(Last_Name);

-- -----------------------------------------------------------------
-- 3. EXPANDED CASES (BASE `CASE` + SUBTYPES)
-- -----------------------------------------------------------------
-- Historical Supreme Court Landmark Precedent (Concluded)
INSERT INTO `CASE` (Case_ID, Court_ID, Parent_Case_ID, Title, Filing_Date, Status)
VALUES
('CASE_800', 'CRT_SC_01', NULL, 'Union Mercantile Corp vs. Directorate of Enforcement', '2017-02-10', 'Closed'),
('CASE_1002', 'CRT_DC_CHN', NULL, 'State of TN vs. Vikram Malhotra & Anr', '2025-03-01', 'Pending'),
('CASE_1003', 'CRT_DC_CHN', NULL, 'State of TN vs. Ram (Secondary Bank Charge)', '2025-06-15', 'Pending'),
('CASE_3002', 'CRT_HC_TN', NULL, 'TechCorp Solutions vs. Apex Logistics Solutions Ltd', '2026-01-20', 'Pending')
ON DUPLICATE KEY UPDATE Title = VALUES(Title), Status = VALUES(Status);

-- Criminal Subtypes
INSERT INTO CRIMINAL_CASE (Case_ID, FIR_Or_Complaint_No, Bail_Amount, Arresting_Agency)
VALUES
('CASE_800', 'ECIR-2016-09', 500000.00, 'Directorate of Enforcement'),
('CASE_1002', 'FIR-2025-042', 75000.00, 'CB-CID Cyber Cell'),
('CASE_1003', 'FIR-2025-108', 30000.00, 'Economic Offences Wing')
ON DUPLICATE KEY UPDATE Bail_Amount = VALUES(Bail_Amount), Arresting_Agency = VALUES(Arresting_Agency);

-- Civil Subtype
INSERT INTO CIVIL_CASE (Case_ID, Dispute_Value, Civil_Case_Type)
VALUES
('CASE_3002', 12500000.00, 'Commercial Contract & Damages')
ON DUPLICATE KEY UPDATE Dispute_Value = VALUES(Dispute_Value);

-- Parties for new cases
INSERT INTO CASE_PARTY (Party_ID, Entity_ID, Case_ID, Party_Role)
VALUES
('PRT_05', 'ENT_001', 'CASE_1002', 'Prosecution'),
('PRT_06', 'ENT_009', 'CASE_1002', 'Primary Defendant'),
('PRT_07', 'ENT_010', 'CASE_1002', 'Co-Accused'),
('PRT_08', 'ENT_001', 'CASE_1003', 'Prosecution'),
('PRT_09', 'ENT_002', 'CASE_1003', 'Defendant'),
('PRT_10', 'ENT_005', 'CASE_3002', 'Plaintiff'),
('PRT_11', 'ENT_008', 'CASE_3002', 'Defendant')
ON DUPLICATE KEY UPDATE Party_Role = VALUES(Party_Role);

-- -----------------------------------------------------------------
-- 4. ADDITIONAL INCIDENTS (SINGLE SOURCE OF TRUTH)
-- -----------------------------------------------------------------
INSERT INTO INCIDENT (Incident_ID, Incident_Date, Location, Description)
VALUES
('INC_003', '2024-08-12 16:45:00', 'Guindy Industrial Estate, Chennai', 'Falsification of electronic shipping manifests and digital token tampering to divert export consignments.'),
('INC_004', '2024-11-01 09:30:00', 'Anna Nagar, Chennai', 'Parallel secondary transaction inquiry arising from the Nov 1, 2024 bank transfer.'),
('INC_005', '2016-08-20 11:15:00', 'Connaught Place Commercial Plaza, New Delhi', 'High-value syndicated overseas remittance routing without statutory clearance.')
ON DUPLICATE KEY UPDATE Description = VALUES(Description), Location = VALUES(Location);

-- -----------------------------------------------------------------
-- 5. EXPANDED DOCKET CHARGE SHEETS
-- Corrected: No legacy Incident_Timestamp column (references INCIDENT)
-- -----------------------------------------------------------------
INSERT INTO DOCKET_CHARGE_SHEET (Charge_Sheet_ID, Criminal_Case_ID, Defendant_ID, Charge_Code, Incident_ID, Verdict_Type, Sentence_Imposed)
VALUES
-- In CASE_1002: Primary defendant Vikram Malhotra faces Forgery and IT Act charges
('CHG_03', 'CASE_1002', 'ENT_009', 'IPC_467', 'INC_003', 'Pending', NULL),
('CHG_04', 'CASE_1002', 'ENT_009', 'IT_66D',  'INC_003', 'Pending', NULL),
-- In CASE_1002: Co-accused Suresh Raina faces Criminal Conspiracy
('CHG_05', 'CASE_1002', 'ENT_010', 'IPC_120B', 'INC_003', 'Pending', NULL),

-- DEMONSTRATION SCENARIO A: Multiple Concurrent Pending Proceedings (POTENTIALLY_RELATED)
-- Defendant Ram (ENT_002) faces IPC_420 in CASE_1001 (CHG_01, Pending) and in CASE_1003 (CHG_06, Pending) on INC_001
('CHG_06', 'CASE_1003', 'ENT_002', 'IPC_420', 'INC_001', 'Pending', NULL),

-- DEMONSTRATION SCENARIO B: Prior Conviction with New Pending Docket (REVIEW_REQUIRED)
-- Defendant Ram (ENT_002) was found Guilty in CASE_900 (CHG_02, Guilty, 5 Yrs RI) on INC_002.
-- A subsequent charge CHG_07 is filed in CASE_1003 on the identical incident INC_002 and charge IPC_420.
-- This triggers REVIEW_REQUIRED in V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS for Section 300 CrPC scrutiny.
('CHG_07', 'CASE_1003', 'ENT_002', 'IPC_420', 'INC_002', 'Pending', NULL)
ON DUPLICATE KEY UPDATE Verdict_Type = VALUES(Verdict_Type), Sentence_Imposed = VALUES(Sentence_Imposed);

-- -----------------------------------------------------------------
-- 6. ADDITIONAL CONCLUDED JUDGMENT
-- Provides cited judgment for formal precedent relationships
-- -----------------------------------------------------------------
INSERT INTO JUDGMENT (Judgment_ID, Case_ID, Verdict_Date, Judgment_Text)
VALUES
('JUDG_800', 'CASE_800', '2018-04-18', 'The Supreme Court of India holds that corporate criminal liability requires demonstrable mens rea attributable to key managerial personnel; establishes definitive standards for electronic evidence authentication in commercial fraud.')
ON DUPLICATE KEY UPDATE Verdict_Date = VALUES(Verdict_Date), Judgment_Text = VALUES(Judgment_Text);

-- -----------------------------------------------------------------
-- 7. FORMAL JUDGMENT PRECEDENT CITATION
-- Cites Supreme Court JUDG_800 from Madras HC / DC judgment JUDG_900
-- Both judgments exist and are concluded decisions.
-- -----------------------------------------------------------------
INSERT INTO JUDGMENT_CITATION (Citation_ID, Citing_Judgment_ID, Cited_Judgment_ID, Relevance_Note, Precedent_Treatment)
VALUES
('JCIT_01', 'JUDG_900', 'JUDG_800', 'Followed landmark Supreme Court ruling on corporate officer attribution in financial fraud.', 'Followed')
ON DUPLICATE KEY UPDATE Precedent_Treatment = VALUES(Precedent_Treatment), Relevance_Note = VALUES(Relevance_Note);

-- -----------------------------------------------------------------
-- 8. EXPANDED PRECEDENT TAXONOMY & CASE TAG MAPPINGS
-- -----------------------------------------------------------------
INSERT INTO PRECEDENT_TAG (Tag_ID, Keyword)
VALUES
('TAG_03', 'Cyber Financial Crime'),
('TAG_04', 'Double Jeopardy Bar'),
('TAG_05', 'Forgery & Document Fraud'),
('TAG_06', 'Criminal Breach of Trust')
ON DUPLICATE KEY UPDATE Keyword = VALUES(Keyword);

INSERT INTO CASE_TAG_MAPPING (Case_ID, Tag_ID)
VALUES
('CASE_800', 'TAG_01'),
('CASE_800', 'TAG_03'),
('CASE_1002', 'TAG_03'),
('CASE_1002', 'TAG_05'),
('CASE_1003', 'TAG_01'),
('CASE_1003', 'TAG_04')
ON DUPLICATE KEY UPDATE Tag_ID = VALUES(Tag_ID);
