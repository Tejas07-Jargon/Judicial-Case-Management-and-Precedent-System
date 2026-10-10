-- =============================================================================
-- SCRIPT: 02_sample_data.sql
-- PROJECT: Judicial Case Management and Precedent System
-- MODULE: DA2 Member 2 — Hearings, Judgments & Appeals
-- AUTHOR: Member 2 (Aryan)
-- COMPATIBILITY: Oracle Database 19c / 21c / 23ai / Oracle SQL Developer
-- =============================================================================
-- DESCRIPTION:
-- Populates interconnected, realistic demonstration data for Member 2 tables:
--   - 14 Hearings (COMPLETED, SCHEDULED, ADJOURNED, CANCELLED)
--   - 20 Hearing Bench Assignments (Single, Division, Full Bench compositions)
--   - 7 Judgments (Convicted, Acquitted, Decreed, Dismissed, Interim & Final)
--   - 6 Appeals (PENDING, ADMITTED, DISPOSED, REJECTED)
--
-- All entities and case references correspond directly to the baseline DA1 tables.
-- All data is demonstrative and fictional.
-- =============================================================================

SET FEEDBACK ON;
SET SERVEROUTPUT ON;
SET DEFINE OFF;
SET SQLBLANKLINES ON;

-- Clean existing Member 2 data before reloading
DELETE FROM APPEAL;
DELETE FROM JUDGMENT;
DELETE FROM HEARING_BENCH;
DELETE FROM HEARING;
COMMIT;

-- -----------------------------------------------------------------------------
-- 1. SEED DATA: HEARING (14 Hearings across multiple cases and judicial stages)
-- -----------------------------------------------------------------------------

-- CASE_900 (Historic Fraud Case - Trial Court CRT_DC_CHN)
INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_101', 'CASE_900', DATE '2020-03-12', 'Court Hall 1', 'Framing of Charges under IPC 420', 'COMPLETED', 'Charges formally read to accused; pleaded not guilty.');

INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_102', 'CASE_900', DATE '2020-07-18', 'Court Hall 1', 'Prosecution Evidence Recording', 'COMPLETED', 'PW-1 and PW-2 examined and cross-examined in full.');

INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_103', 'CASE_900', DATE '2020-12-01', 'Court Hall 1', 'Final Arguments and Summation', 'COMPLETED', 'Arguments concluded by Special Public Prosecutor and Defense Counsel. Judgment reserved.');

-- CASE_1001 (Active Criminal Trial - CRT_DC_CHN)
INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_104', 'CASE_1001', DATE '2024-02-15', 'Court Hall 2', 'Bail Application Hearing', 'COMPLETED', 'Regular bail granted with conditions to surrender passport.');

INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_105', 'CASE_1001', DATE '2024-06-20', 'Court Hall 2', 'Framing of Charges', 'ADJOURNED', 'Adjourned due to non-availability of defense counsel; cost of Rs 2000 imposed.');

INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_106', 'CASE_1001', DATE '2024-09-10', 'Court Hall 2', 'Framing of Charges (Rescheduled)', 'COMPLETED', 'Charges framed under Section 420 IPC; trial schedule fixed.');

INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_107', 'CASE_1001', DATE '2026-11-20', 'Court Hall 2', 'Prosecution Witness Deposition', 'SCHEDULED', 'Summons issued to forensic banking investigator.');

-- CASE_2001 (Criminal Appeal - Madras High Court CRT_HC_TN)
INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_108', 'CASE_2001', DATE '2025-04-10', 'Court Hall 4 (Division)', 'Appeal Admission & Stay Hearing', 'COMPLETED', 'Appeal admitted; lower court sentence stayed pending final adjudication.');

INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_109', 'CASE_2001', DATE '2026-12-05', 'Court Hall 4 (Division)', 'Final Appellate Arguments', 'SCHEDULED', 'Paper books compiled and served to Advocate General.');

-- CASE_3001 (Commercial Civil Suit - Madras High Court CRT_HC_TN)
INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_110', 'CASE_3001', DATE '2025-06-15', 'Commercial Court 1', 'Interim Injunction Hearing', 'COMPLETED', 'Interim status quo order granted regarding disputed software intellectual property.');

INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_111', 'CASE_3001', DATE '2025-10-22', 'Commercial Court 1', 'Mediation Report Review', 'CANCELLED', 'Mediation failed prior to hearing; parties directed directly to oral evidence.');

-- CASE_4001 (Apex Mining Environmental Case - CRT_DC_CHN)
INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_112', 'CASE_4001', DATE '2021-08-14', 'Special Environment Court', 'Expert Committee Inspection Report', 'COMPLETED', 'National Green Tribunal committee submitted groundwater contamination assessment.');

INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_113', 'CASE_4001', DATE '2023-04-05', 'Special Environment Court', 'Final Arguments on Environmental Restitution', 'COMPLETED', 'State pollution control board presented remediation plan; judgment reserved.');

-- CASE_5001 (Consumer Real Estate Dispute - CRT_DC_BGL, Multiple hearings, NO Judgment)
INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_114', 'CASE_5001', DATE '2023-09-12', 'Court Hall 3', 'First Appearance & Written Statement', 'COMPLETED', 'Defendant developer filed written statement with project delay claims.');

INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_115', 'CASE_5001', DATE '2024-03-18', 'Court Hall 3', 'Documentary Evidence Scrutiny', 'ADJOURNED', 'Adjourned at request of petitioner for producing certified bank disbursement statements.');

INSERT INTO HEARING (hearing_id, case_id, hearing_date, courtroom, purpose, hearing_status, remarks)
VALUES ('HRG_116', 'CASE_5001', DATE '2026-12-18', 'Court Hall 3', 'Complainant Cross-Examination', 'SCHEDULED', 'Final opportunity for builder counsel to conduct cross-examination.');

-- -----------------------------------------------------------------------------
-- 2. SEED DATA: HEARING_BENCH (20 Bench Assignments across single/multi judges)
-- -----------------------------------------------------------------------------

-- HRG_101 (Single Judge: Justice Krishna Iyer)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_101', 'ENT_006', 'Single Judge');

-- HRG_102 (Single Judge: Justice Krishna Iyer)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_102', 'ENT_006', 'Single Judge');

-- HRG_103 (Single Judge: Justice Krishna Iyer)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_103', 'ENT_006', 'Single Judge');

-- HRG_104 (Single Judge: Justice Krishna Iyer)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_104', 'ENT_006', 'Single Judge');

-- HRG_105 (Single Judge: Justice Krishna Iyer)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_105', 'ENT_006', 'Single Judge');

-- HRG_106 (Single Judge: Justice Krishna Iyer)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_106', 'ENT_006', 'Single Judge');

-- HRG_107 (Single Judge: Justice Krishna Iyer)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_107', 'ENT_006', 'Single Judge');

-- HRG_108 (Division Bench: Justice Shankar Mahadevan & Justice Sanjay Kishan)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_108', 'ENT_003', 'Division Bench Lead');
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_108', 'ENT_009', 'Associate Judge');

-- HRG_109 (Division Bench: Justice Shankar Mahadevan & Justice Sanjay Kishan)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_109', 'ENT_003', 'Division Bench Lead');
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_109', 'ENT_009', 'Associate Judge');

-- HRG_110 (Single Judge: Justice Sanjay Kishan)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_110', 'ENT_009', 'Single Judge');

-- HRG_111 (Single Judge: Justice Sanjay Kishan)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_111', 'ENT_009', 'Single Judge');

-- HRG_112 (Single Judge: Justice Krishna Iyer)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_112', 'ENT_006', 'Presiding Judge');

-- HRG_113 (Full Bench: Justice Krishna Iyer, Justice Shankar Mahadevan, Justice Sanjay Kishan)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_113', 'ENT_003', 'Division Bench Lead');
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_113', 'ENT_006', 'Associate Judge');
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_113', 'ENT_009', 'Associate Judge');

-- HRG_114, HRG_115, HRG_116 (Bengaluru Court - Presiding Judge)
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_114', 'ENT_006', 'Single Judge');
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_115', 'ENT_006', 'Single Judge');
INSERT INTO HEARING_BENCH (hearing_id, judge_id, bench_role)
VALUES ('HRG_116', 'ENT_006', 'Single Judge');

-- -----------------------------------------------------------------------------
-- 3. SEED DATA: JUDGMENT (7 Judgments with detailed ratios and outcomes)
-- Note: CASE_4001 has two judgments (Interim Restitution + Final Judgment)
-- to demonstrate multiple judgment records per case support.
-- -----------------------------------------------------------------------------

-- Judgment 1: CASE_900 (Guilty verdict in historic fraud)
INSERT INTO JUDGMENT (judgment_id, case_id, judgment_date, outcome, judgment_text, judgment_status)
VALUES (
    'JDG_501',
    'CASE_900',
    DATE '2020-12-15',
    'Convicted under IPC 420',
    'The prosecution has established beyond reasonable doubt that the accused intentionally deceived investors by fabricating audited balance sheets. Sentenced to 5 years rigorous imprisonment and a fine of Rs 50,000.',
    'DELIVERED'
);

-- Judgment 2: CASE_4001 (Interim Environmental Injunction & Penalty - First Judgment)
INSERT INTO JUDGMENT (judgment_id, case_id, judgment_date, outcome, judgment_text, judgment_status)
VALUES (
    'JDG_502',
    'CASE_4001',
    DATE '2022-01-20',
    'Interim Restitution Order',
    'Ad-interim direction ordering the respondent mining company to deposit Rs 2 Crore in escrow towards preliminary clean-up operations of the polluted water reservoirs.',
    'DELIVERED'
);

-- Judgment 3: CASE_4001 (Final Environmental Decree - Second Judgment, > 2 yrs after 2021 filing)
INSERT INTO JUDGMENT (judgment_id, case_id, judgment_date, outcome, judgment_text, judgment_status)
VALUES (
    'JDG_503',
    'CASE_4001',
    DATE '2023-06-30',
    'Decreed with Exemplary Damages',
    'Applying the absolute liability and polluter pays doctrines, the court directs Apex Mining Corp to pay environmental restitution of Rs 10 Crore to the State Remediation Fund within 90 days.',
    'DELIVERED'
);

-- Judgment 4: CASE_6001 (CBI securities fraud trial - Conviction)
INSERT INTO JUDGMENT (judgment_id, case_id, judgment_date, outcome, judgment_text, judgment_status)
VALUES (
    'JDG_504',
    'CASE_6001',
    DATE '2023-04-12',
    'Convicted under IPC 409 and 120B',
    'Defendant Harish Mehta found guilty of siphoning public funds via unauthorized broker accounts. Sentenced to 7 years imprisonment with confiscation of seized assets worth Rs 8.5 Crore.',
    'DELIVERED'
);

-- Judgment 5: CASE_1001 (Preliminary Discharge Order on Section 120B)
INSERT INTO JUDGMENT (judgment_id, case_id, judgment_date, outcome, judgment_text, judgment_status)
VALUES (
    'JDG_505',
    'CASE_1001',
    DATE '2024-11-28',
    'Partial Discharge Allowed',
    'Accused discharged in respect of ancillary conspiracy charges under Section 120B IPC for lack of prima facie evidence. Trial to proceed solely under Section 420 IPC.',
    'DELIVERED'
);

-- Judgment 6: CASE_3001 (Madras HC Commercial Decree)
INSERT INTO JUDGMENT (judgment_id, case_id, judgment_date, outcome, judgment_text, judgment_status)
VALUES (
    'JDG_506',
    'CASE_3001',
    DATE '2025-11-15',
    'Suit Decreed in Favor of Plaintiff',
    'Defendant is perpetually restrained from deploying or commercializing the proprietary algorithms developed during employment with plaintiff corporation. Nominal damages of Rs 5 Lakhs awarded.',
    'DELIVERED'
);

-- Judgment 7: CASE_2001 (Madras HC Appellate Judgment - Overruling Trial Conviction)
INSERT INTO JUDGMENT (judgment_id, case_id, judgment_date, outcome, judgment_text, judgment_status)
VALUES (
    'JDG_507',
    'CASE_2001',
    DATE '2026-02-18',
    'Appeal Allowed; Conviction Set Aside',
    'The Division Bench observes serious procedural lapses in chain-of-custody of electronic records. Trial court judgment set aside and appellant acquitted of all charges.',
    'DELIVERED'
);

-- -----------------------------------------------------------------------------
-- 4. SEED DATA: APPEAL (6 Appeals covering PENDING, ADMITTED, DISPOSED, REJECTED)
-- -----------------------------------------------------------------------------

-- Appeal 1: CASE_900 against JDG_501 (District Court -> Madras High Court, Disposed)
INSERT INTO APPEAL (appeal_id, case_id, judgment_id, lower_court_id, higher_court_id, filing_date, appeal_status, outcome, remarks)
VALUES (
    'APL_701',
    'CASE_900',
    'JDG_501',
    'CRT_DC_CHN',
    'CRT_HC_TN',
    DATE '2021-01-25',
    'DISPOSED',
    'Appeal Allowed; Retrial Ordered',
    'Substantial question of law raised regarding digital evidence certification under Indian Evidence Act 65B.'
);

-- Appeal 2: CASE_4001 against JDG_503 (District Court -> Madras High Court, Admitted)
-- (> 2 years case filing to judgment, subsequently appealed)
INSERT INTO APPEAL (appeal_id, case_id, judgment_id, lower_court_id, higher_court_id, filing_date, appeal_status, outcome, remarks)
VALUES (
    'APL_702',
    'CASE_4001',
    'JDG_503',
    'CRT_DC_CHN',
    'CRT_HC_TN',
    DATE '2023-09-15',
    'ADMITTED',
    'Sub judice - Stay on damages recovery',
    'Mining corporation challenges quantum of exemplary damages as disproportionate to proved contamination footprint.'
);

-- Appeal 3: Challenge against JDG_504 (District Court -> Supreme Court of India, Admitted)
INSERT INTO APPEAL (appeal_id, case_id, judgment_id, lower_court_id, higher_court_id, filing_date, appeal_status, outcome, remarks)
VALUES (
    'APL_703',
    'CASE_6001',
    'JDG_504',
    'CRT_DC_CHN',
    'CRT_SC_01',
    DATE '2023-07-20',
    'ADMITTED',
    'Special Leave Petition Admitted',
    'Special Leave Petition (Criminal) admitted on constitutional validity of prolonged pre-trial asset attachment.'
);

-- Appeal 4: Fresh Appeal against JDG_506 (Madras High Court -> Supreme Court of India, Pending)
INSERT INTO APPEAL (appeal_id, case_id, judgment_id, lower_court_id, higher_court_id, filing_date, appeal_status, outcome, remarks)
VALUES (
    'APL_704',
    'CASE_3001',
    'JDG_506',
    'CRT_HC_TN',
    'CRT_SC_01',
    DATE '2026-01-10',
    'PENDING',
    NULL,
    'Memorandum of appeal filed contesting the trade secret definition under non-compete covenants.'
);

-- Appeal 5: Frivolous Appeal against JDG_502 (District Court -> Madras High Court, Rejected)
INSERT INTO APPEAL (appeal_id, case_id, judgment_id, lower_court_id, higher_court_id, filing_date, appeal_status, outcome, remarks)
VALUES (
    'APL_705',
    'CASE_4001',
    'JDG_502',
    'CRT_DC_CHN',
    'CRT_HC_TN',
    DATE '2022-03-05',
    'REJECTED',
    'Appeal Dismissed at Admission Stage',
    'Interlocutory appeal not maintainable against an ad-interim conditional deposit order.'
);

-- Appeal 6: State Challenge against JDG_507 (Madras High Court -> Supreme Court of India, Pending)
INSERT INTO APPEAL (appeal_id, case_id, judgment_id, lower_court_id, higher_court_id, filing_date, appeal_status, outcome, remarks)
VALUES (
    'APL_706',
    'CASE_2001',
    'JDG_507',
    'CRT_HC_TN',
    'CRT_SC_01',
    DATE '2026-03-25',
    'PENDING',
    NULL,
    'State of Tamil Nadu appeals High Court acquittal in commercial fraud precedent.'
);

COMMIT;

PROMPT =====================================================================
PROMPT Member 2 Sample Data Populated Successfully!
PROMPT   - Hearings: 14 rows
PROMPT   - Hearing Bench Assignments: 20 rows
PROMPT   - Judgments: 7 rows
PROMPT   - Appeals: 6 rows
PROMPT =====================================================================
