// Mock Data Store initialized with scripts.sql baseline datasets
// Used when MySQL is not connected or in demo/resilience mode

export const initialData = {
  courts: [
    { Court_ID: 'CRT_SC_01', Court_Name: 'Supreme Court of India', Tier_Level: 'Supreme', Jurisdiction_State: 'Delhi' },
    { Court_ID: 'CRT_HC_TN', Court_Name: 'Madras High Court', Tier_Level: 'High Court', Jurisdiction_State: 'Tamil Nadu' },
    { Court_ID: 'CRT_DC_CHN', Court_Name: 'Chennai District Court', Tier_Level: 'District', Jurisdiction_State: 'Tamil Nadu' }
  ],
  legalEntities: [
    { Entity_ID: 'ENT_001', Contact_Email: 'contact@tn.gov.in', Address: 'Secretariat, Chennai' },
    { Entity_ID: 'ENT_002', Contact_Email: 'ram@email.com', Address: 'Anna Nagar, Chennai' },
    { Entity_ID: 'ENT_003', Contact_Email: 'shankar.judge@judiciary.in', Address: 'High Court Quarters' },
    { Entity_ID: 'ENT_004', Contact_Email: 'kamal.advocate@law.in', Address: 'Mylapore, Chennai' },
    { Entity_ID: 'ENT_005', Contact_Email: 'corp@tech.com', Address: 'OMR, Chennai' },
    { Entity_ID: 'ENT_006', Contact_Email: 'krishna.judge@judiciary.in', Address: 'District Quarters' },
    { Entity_ID: 'ENT_007', Contact_Email: 'priya.desh@law.in', Address: 'T-Nagar, Chennai' }
  ],
  persons: [
    { Entity_ID: 'ENT_002', Aadhar_ID: '[Aadhaar Redacted 1]', First_Name: 'Ram', Last_Name: 'Kumar', DOB: '1985-06-15' },
    { Entity_ID: 'ENT_003', Aadhar_ID: '[Aadhaar Redacted 2]', First_Name: 'Shankar', Last_Name: 'Mahadevan', DOB: '1970-02-10' },
    { Entity_ID: 'ENT_004', Aadhar_ID: '[Aadhaar Redacted 3]', First_Name: 'Kamal', Last_Name: 'Hassan', DOB: '1982-11-20' },
    { Entity_ID: 'ENT_006', Aadhar_ID: '[Aadhaar Redacted 4]', First_Name: 'Krishna', Last_Name: 'Iyer', DOB: '1975-04-12' },
    { Entity_ID: 'ENT_007', Aadhar_ID: '[Aadhaar Redacted 5]', First_Name: 'Priya', Last_Name: 'Deshmukh', DOB: '1988-09-05' }
  ],
  organizations: [
    { Entity_ID: 'ENT_001', Registration_No: 'CIN-TN-GOV-999', Company_Name: 'State of Tamil Nadu' },
    { Entity_ID: 'ENT_005', Registration_No: 'CIN-TECH-1029', Company_Name: 'TechCorp Solutions' }
  ],
  judges: [
    { Entity_ID: 'ENT_003', Judicial_ID: 'JUDGE-TN-882', Appointment_Date: '2015-08-10', Current_Court_ID: 'CRT_HC_TN', First_Name: 'Shankar', Last_Name: 'Mahadevan' },
    { Entity_ID: 'ENT_006', Judicial_ID: 'JUDGE-TN-401', Appointment_Date: '2018-05-20', Current_Court_ID: 'CRT_DC_CHN', First_Name: 'Krishna', Last_Name: 'Iyer' }
  ],
  lawyers: [
    { Entity_ID: 'ENT_004', License_No: 'BAR-TN-2005', Specialization: 'Criminal & Corporate Defense', Firm_Name: 'Kamal & Associates', First_Name: 'Kamal', Last_Name: 'Hassan' },
    { Entity_ID: 'ENT_007', License_No: 'BAR-TN-2015', Specialization: 'Civil Litigation', Firm_Name: 'Deshmukh Legal', First_Name: 'Priya', Last_Name: 'Deshmukh' }
  ],
  cases: [
    { Case_ID: 'CASE_900', Court_ID: 'CRT_DC_CHN', Parent_Case_ID: null, Title: 'State vs. Historic Fraud', Filing_Date: '2020-01-10', Status: 'Closed' },
    { Case_ID: 'CASE_1001', Court_ID: 'CRT_DC_CHN', Parent_Case_ID: null, Title: 'State of TN vs. Ram', Filing_Date: '2025-01-10', Status: 'Pending' },
    { Case_ID: 'CASE_2001', Court_ID: 'CRT_HC_TN', Parent_Case_ID: 'CASE_1001', Title: 'Ram vs. State of TN (Appeal)', Filing_Date: '2026-03-15', Status: 'Pending' },
    { Case_ID: 'CASE_3001', Court_ID: 'CRT_HC_TN', Parent_Case_ID: null, Title: 'TechCorp vs. Ram', Filing_Date: '2026-05-01', Status: 'Pending' }
  ],
  criminalCases: [
    { Case_ID: 'CASE_900', FIR_Or_Complaint_No: 'FIR-2020-11', Bail_Amount: 10000.00, Arresting_Agency: 'CBI' },
    { Case_ID: 'CASE_1001', FIR_Or_Complaint_No: 'FIR-2025-001', Bail_Amount: 50000.00, Arresting_Agency: 'Chennai Police' },
    { Case_ID: 'CASE_2001', FIR_Or_Complaint_No: null, Bail_Amount: 100000.00, Arresting_Agency: null }
  ],
  civilCases: [
    { Case_ID: 'CASE_3001', Dispute_Value: 5000000.00, Civil_Case_Type: 'Contract Breach' }
  ],
  caseParties: [
    { Party_ID: 'PRT_01', Entity_ID: 'ENT_001', Case_ID: 'CASE_1001', Party_Role: 'Prosecution' },
    { Party_ID: 'PRT_02', Entity_ID: 'ENT_002', Case_ID: 'CASE_1001', Party_Role: 'Defendant' },
    { Party_ID: 'PRT_03', Entity_ID: 'ENT_005', Case_ID: 'CASE_3001', Party_Role: 'Plaintiff' },
    { Party_ID: 'PRT_04', Entity_ID: 'ENT_002', Case_ID: 'CASE_3001', Party_Role: 'Respondent' }
  ],
  caseCounsel: [
    { Counsel_ID: 'CNSL_01', Lawyer_ID: 'ENT_004', Party_ID: 'PRT_02', Lead_Counsel_Flag: 1 },
    { Counsel_ID: 'CNSL_02', Lawyer_ID: 'ENT_004', Party_ID: 'PRT_04', Lead_Counsel_Flag: 1 },
    { Counsel_ID: 'CNSL_03', Lawyer_ID: 'ENT_007', Party_ID: 'PRT_03', Lead_Counsel_Flag: 1 }
  ],
  hearings: [
    { Case_ID: 'CASE_900', Hearing_Timestamp: '2020-12-01 10:00:00', Summary_Notes: 'Final arguments heard. Judgment reserved.' },
    { Case_ID: 'CASE_1001', Hearing_Timestamp: '2025-02-15 11:30:00', Summary_Notes: 'Bail hearing. Bail granted.' },
    { Case_ID: 'CASE_2001', Hearing_Timestamp: '2026-04-10 14:00:00', Summary_Notes: 'Appeal admission hearing.' }
  ],
  hearingBenches: [
    { Bench_ID: 'BNCH_1', Judge_ID: 'ENT_006', Case_ID: 'CASE_900', Hearing_Timestamp: '2020-12-01 10:00:00', Bench_Role: 'Single Judge' },
    { Bench_ID: 'BNCH_2', Judge_ID: 'ENT_006', Case_ID: 'CASE_1001', Hearing_Timestamp: '2025-02-15 11:30:00', Bench_Role: 'Single Judge' },
    { Bench_ID: 'BNCH_3', Judge_ID: 'ENT_003', Case_ID: 'CASE_2001', Hearing_Timestamp: '2026-04-10 14:00:00', Bench_Role: 'Division Bench Lead' }
  ],
  judgments: [
    { Judgment_ID: 'JUDG_900', Case_ID: 'CASE_900', Verdict_Date: '2020-12-15', Judgment_Text: 'The court finds the defendant guilty of financial fraud under IPC 420.' }
  ],
  statuteCharges: [
    { Charge_Code: 'IPC_420', Section_Name: 'Cheating and Dishonesty', Description: 'Inducing delivery of property via fraud.', Max_Sentence_Years: 7 },
    { Charge_Code: 'IPC_302', Section_Name: 'Murder', Description: 'Punishment for murder.', Max_Sentence_Years: 99 }
  ],
  chargeSheets: [
    { Charge_Sheet_ID: 'CHG_01', Criminal_Case_ID: 'CASE_1001', Defendant_ID: 'ENT_002', Charge_Code: 'IPC_420', Incident_Timestamp: '2024-11-01 09:30:00', Verdict_Type: 'Pending', Sentence_Imposed: null },
    { Charge_Sheet_ID: 'CHG_02', Criminal_Case_ID: 'CASE_900', Defendant_ID: 'ENT_002', Charge_Code: 'IPC_420', Incident_Timestamp: '2019-05-15 14:00:00', Verdict_Type: 'Guilty', Sentence_Imposed: '5 Years RI' }
  ],
  citations: [
    { Citation_ID: 'CIT_01', Citing_Case_ID: 'CASE_2001', Cited_Precedent_Case_ID: 'CASE_900', Relevance_Note: 'Cited standard for intent to defraud in corporate entities.' }
  ],
  precedentTags: [
    { Tag_ID: 'TAG_01', Keyword: 'Corporate Fraud' },
    { Tag_ID: 'TAG_02', Keyword: 'Bail Jurisprudence' }
  ],
  caseTagMappings: [
    { Case_ID: 'CASE_900', Tag_ID: 'TAG_01' },
    { Case_ID: 'CASE_1001', Tag_ID: 'TAG_01' },
    { Case_ID: 'CASE_2001', Tag_ID: 'TAG_02' }
  ]
};
