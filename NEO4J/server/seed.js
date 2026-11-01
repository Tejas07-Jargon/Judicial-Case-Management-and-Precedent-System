// server/seed.js
console.log('--- SEED SCRIPT BOOTED: Initializing execution environment ---');

import driver from './db.js';

const statements = [
  // 1. CLEAN TEARDOWN
  `MATCH (n) DETACH DELETE n`,

  // 2. UNIQUENESS CONSTRAINTS & GRAPH INDEXES (Phase 4 Architectural Overhaul)
  `CREATE CONSTRAINT entity_id_unique IF NOT EXISTS FOR (e:LegalEntity) REQUIRE e.entity_id IS UNIQUE`,
  `CREATE CONSTRAINT org_reg_unique IF NOT EXISTS FOR (o:Organization) REQUIRE o.registration_no IS UNIQUE`,
  `CREATE CONSTRAINT person_aadhar_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.aadhar_id IS UNIQUE`,
  `CREATE CONSTRAINT judge_id_unique IF NOT EXISTS FOR (j:Judge) REQUIRE j.judicial_id IS UNIQUE`,
  `CREATE CONSTRAINT lawyer_lic_unique IF NOT EXISTS FOR (l:Lawyer) REQUIRE l.license_no IS UNIQUE`,
  `CREATE CONSTRAINT court_id_unique IF NOT EXISTS FOR (c:Court) REQUIRE c.court_id IS UNIQUE`,
  `CREATE CONSTRAINT case_id_unique IF NOT EXISTS FOR (c:Case) REQUIRE c.case_id IS UNIQUE`,
  `CREATE CONSTRAINT party_id_unique IF NOT EXISTS FOR (cp:CaseParty) REQUIRE cp.party_id IS UNIQUE`,
  `CREATE CONSTRAINT judgment_id_unique IF NOT EXISTS FOR (j:Judgment) REQUIRE j.judgment_id IS UNIQUE`,
  `CREATE CONSTRAINT charge_code_unique IF NOT EXISTS FOR (sc:StatuteCharge) REQUIRE sc.charge_code IS UNIQUE`,
  `CREATE CONSTRAINT charge_sheet_id_unique IF NOT EXISTS FOR (cs:ChargeSheet) REQUIRE cs.charge_sheet_id IS UNIQUE`,
  `CREATE CONSTRAINT tag_id_unique IF NOT EXISTS FOR (t:PrecedentTag) REQUIRE t.tag_id IS UNIQUE`,
  `CREATE CONSTRAINT agency_name_unique IF NOT EXISTS FOR (a:Afgency) REQUIRE a.name IS UNIQUE`,
  
  // High-Performance Indexes
  `CREATE INDEX case_status_idx IF NOT EXISTS FOR (c:Case) ON (c.status)`,
  `CREATE INDEX case_filing_date_idx IF NOT EXISTS FOR (c:Case) ON (c.filing_date)`,
  `CREATE FULLTEXT INDEX caseSearch IF NOT EXISTS FOR (n:Case) ON EACH [n.case_id, n.title]`,

  // 3. SEED COURTS
  `UNWIND [
    ['CRT_SC_01', 'Supreme Court of India', 'Supreme', 'Delhi'],
    ['CRT_HC_TN', 'Madras High Court', 'High Court', 'Tamil Nadu'],
    ['CRT_DC_CHN', 'Chennai District Court', 'District', 'Tamil Nadu'],
    ['CRT_HC_KA', 'Karnataka High Court', 'High Court', 'Karnataka'],
    ['CRT_DC_BLR', 'Bangalore District Court', 'District', 'Karnataka'],
    ['CRT_HC_MH', 'Bombay High Court', 'High Court', 'Maharashtra'],
    ['CRT_DC_MUM', 'Mumbai District Court', 'District', 'Maharashtra'],
    ['CRT_HC_DL', 'Delhi High Court', 'High Court', 'Delhi'],
    ['CRT_DC_ND', 'New Delhi District Court', 'District', 'Delhi'],
    ['CRT_FTC_CHN', 'Fast Track Court Chennai', 'Fast Track', 'Tamil Nadu']
  ] AS row
  CREATE (:Court {
    court_id: row[0],
    court_name: row[1],f
    tier_level: row[2],
    jurisdiction_state: row[3]
  })`,

  // 4. SEED LEGAL ENTITIES
  `UNWIND [
    ['ENT_001', 'contact@tn.gov.in', 'Secretariat, Chennai'],
    ['ENT_002', 'ram@email.com', 'Anna Nagar, Chennai'],
    ['ENT_003', 'shankar.judge@judiciary.in', 'High Court Quarters'],
    ['ENT_004', 'kamal.advocate@law.in', 'Mylapore, Chennai'],
    ['ENT_005', 'corp@tech.com', 'OMR, Chennai'],
    ['ENT_006', 'krishna.judge@judiciary.in', 'District Quarters'],
    ['ENT_007', 'priya.desh@law.in', 'T-Nagar, Chennai'],
    ['ENT_O1', 'contact@ka.gov.in', 'Vidhana Soudha, BLR'],
    ['ENT_O2', 'contact@mh.gov.in', 'Mantralaya, Mumbai'],
    ['ENT_O3', 'contact@india.gov.in', 'New Delhi'],
    ['ENT_O4', 'legal@globallogistics.com', 'Port Trust, Chennai'],
    ['ENT_O5', 'compliance@citybank.in', 'BKC, Mumbai'],
    ['ENT_O6', 'info@apexbuilders.com', 'Whitefield, Bangalore'],
    ['ENT_O7', 'legal@horizon.tech', 'Cyber City, Delhi'],
    ['ENT_O8', 'hq@cbi.gov.in', 'CGO Complex, Delhi'],
    ['ENT_J1', 'judge1@judiciary.in', 'Delhi Quarters'],
    ['ENT_J2', 'judge2@judiciary.in', 'Mumbai Quarters'],
    ['ENT_J3', 'judge3@judiciary.in', 'Bangalore Quarters'],
    ['ENT_J4', 'judge4@judiciary.in', 'Chennai Quarters'],
    ['ENT_J5', 'judge5@judiciary.in', 'Delhi Quarters'],
    ['ENT_J6', 'judge6@judiciary.in', 'Mumbai Quarters'],
    ['ENT_J7', 'judge7@judiciary.in', 'Bangalore Quarters'],
    ['ENT_J8', 'judge8@judiciary.in', 'Chennai FTC Quarters'],
    ['ENT_L1', 'l1@law.in', 'Delhi'],
    ['ENT_L2', 'l2@law.in', 'Mumbai'],
    ['ENT_L3', 'l3@law.in', 'Bangalore'],
    ['ENT_L4', 'l4@law.in', 'Chennai'],
    ['ENT_L5', 'l5@law.in', 'Delhi'],
    ['ENT_L6', 'l6@law.in', 'Mumbai'],
    ['ENT_L7', 'l7@law.in', 'Bangalore'],
    ['ENT_L8', 'l8@law.in', 'Chennai'],
    ['ENT_P1', 'p1@email.com', 'Delhi'],
    ['ENT_P2', 'p2@email.com', 'Mumbai'],
    ['ENT_P3', 'p3@email.com', 'Bangalore'],
    ['ENT_P4', 'p4@email.com', 'Chennai']
  ] AS row
  CREATE (:LegalEntity {
    entity_id: row[0],
    contact_email: row[1],
    address: row[2]
  })`,

  // 5. SEED ORGANIZATIONS
  `UNWIND [
    ['ENT_001', 'CIN-TN-GOV-999', 'State of Tamil Nadu'],
    ['ENT_005', 'CIN-TECH-1029', 'TechCorp Solutions'],
    ['ENT_O1', 'CIN-KA-GOV-111', 'State of Karnataka'],
    ['ENT_O2', 'CIN-MH-GOV-222', 'State of Maharashtra'],
    ['ENT_O3', 'CIN-UOI-000', 'Union of India'],
    ['ENT_O4', 'CIN-LOG-555', 'Global Logistics'],
    ['ENT_O5', 'CIN-BNK-777', 'City Bank'],
    ['ENT_O6', 'CIN-BLD-888', 'Apex Builders'],
    ['ENT_O7', 'CIN-HRZ-999', 'Horizon Tech'],
    ['ENT_O8', 'CIN-CBI-100', 'Central Bureau of Investigation']
  ] AS row
  MATCH (e:LegalEntity {entity_id: row[0]})
  SET e:Organization,
      e.registration_no = row[1],
      e.company_name = row[2]`,

  // 6. SEED PERSONS
  `UNWIND [
    ['ENT_002', '[Aadhaar Redacted 1]', 'Ram', 'Kumar', '1985-06-15'],
    ['ENT_003', '[Aadhaar Redacted 2]', 'Shankar', 'Mahadevan', '1970-02-10'],
    ['ENT_004', '[Aadhaar Redacted 3]', 'Kamal', 'Hassan', '1982-11-20'],
    ['ENT_006', '[Aadhaar Redacted 4]', 'Krishna', 'Iyer', '1975-04-12'],
    ['ENT_007', '[Aadhaar Redacted 5]', 'Priya', 'Deshmukh', '1988-09-05'],
    ['ENT_J1', '[Aadhaar Redacted 6]', 'Amit', 'Sharma', '1965-01-01'],
    ['ENT_J2', '[Aadhaar Redacted 7]', 'Neha', 'Patil', '1972-03-14'],
    ['ENT_J3', '[Aadhaar Redacted 8]', 'Ravi', 'Shastri', '1968-07-22'],
    ['ENT_J4', '[Aadhaar Redacted 9]', 'Anita', 'Bose', '1971-11-30'],
    ['ENT_J5', '[Aadhaar Redacted 10]', 'Vikram', 'Singh', '1969-05-18'],
    ['ENT_J6', '[Aadhaar Redacted 11]', 'Sanjay', 'Dutt', '1964-08-08'],
    ['ENT_J7', '[Aadhaar Redacted 12]', 'Meera', 'Nair', '1975-12-12'],
    ['ENT_J8', '[Aadhaar Redacted 13]', 'Arun', 'Jaitley', '1962-10-10'],
    ['ENT_L1', '[Aadhaar Redacted 14]', 'Rohan', 'Das', '1980-02-14'],
    ['ENT_L2', '[Aadhaar Redacted 15]', 'Sneha', 'Kapoor', '1985-06-25'],
    ['ENT_L3', '[Aadhaar Redacted 16]', 'Karan', 'Johar', '1978-09-19'],
    ['ENT_L4', '[Aadhaar Redacted 17]', 'Deepa', 'Mehta', '1982-04-04'],
    ['ENT_L5', '[Aadhaar Redacted 18]', 'Rahul', 'Dravid', '1979-11-11'],
    ['ENT_L6', '[Aadhaar Redacted 19]', 'Smriti', 'Irani', '1981-08-15'],
    ['ENT_L7', '[Aadhaar Redacted 20]', 'Anil', 'Kumble', '1977-03-03'],
    ['ENT_L8', '[Aadhaar Redacted 21]', 'Geeta', 'Phogat', '1986-05-20'],
    ['ENT_P1', '[Aadhaar Redacted 22]', 'Raj', 'Malhotra', '1990-01-10'],
    ['ENT_P2', '[Aadhaar Redacted 23]', 'Simran', 'Kaur', '1992-02-20'],
    ['ENT_P3', '[Aadhaar Redacted 24]', 'Kabir', 'Singh', '1988-03-30'],
    ['ENT_P4', '[Aadhaar Redacted 25]', 'Preeti', 'Sikka', '1995-04-15']
  ] AS row
  MATCH (e:LegalEntity {entity_id: row[0]})
  SET e:Person,
      e.aadhar_id = row[1],
      e.first_name = row[2],
      e.last_name = row[3],
      e.dob = row[4]`,

  // 7. SEED JUDGES
  `UNWIND [
    ['ENT_003', 'JUDGE-TN-882', '2015-08-10', 'CRT_HC_TN'],
    ['ENT_006', 'JUDGE-TN-401', '2018-05-20', 'CRT_DC_CHN'],
    ['ENT_J1', 'JUDGE-DL-001', '2010-01-15', 'CRT_SC_01'],
    ['ENT_J2', 'JUDGE-MH-002', '2012-04-20', 'CRT_HC_MH'],
    ['ENT_J3', 'JUDGE-KA-003', '2014-07-25', 'CRT_HC_KA'],
    ['ENT_J4', 'JUDGE-TN-004', '2016-10-30', 'CRT_DC_CHN'],
    ['ENT_J5', 'JUDGE-DL-005', '2011-02-18', 'CRT_HC_DL'],
    ['ENT_J6', 'JUDGE-MH-006', '2013-05-22', 'CRT_DC_MUM'],
    ['ENT_J7', 'JUDGE-KA-007', '2015-08-28', 'CRT_DC_BLR'],
    ['ENT_J8', 'JUDGE-TN-008', '2017-11-05', 'CRT_FTC_CHN']
  ] AS row
  MATCH (p:Person {entity_id: row[0]})
  MATCH (ct:Court {court_id: row[3]})
  SET p:Judge,
      p.judicial_id = row[1],
      p.appointment_date = row[2]
  CREATE (p)-[:ASSIGNED_TO_COURT]->(ct)`,

  // 8. SEED LAWYERS
  `UNWIND [
    ['ENT_004', 'BAR-TN-2005', 'Criminal & Corporate Defense', 'Kamal & Associates'],
    ['ENT_007', 'BAR-TN-2015', 'Civil Litigation', 'Deshmukh Legal'],
    ['ENT_L1', 'BAR-DL-2010', 'Corporate Law', 'Das & Co'],
    ['ENT_L2', 'BAR-MH-2012', 'Criminal Defense', 'Kapoor Chambers'],
    ['ENT_L3', 'BAR-KA-2014', 'Intellectual Property', 'Johar Legal'],
    ['ENT_L4', 'BAR-TN-2016', 'Family Law', 'Mehta Associates'],
    ['ENT_L5', 'BAR-DL-2011', 'Tax Law', 'Dravid & Partners'],
    ['ENT_L6', 'BAR-MH-2013', 'Civil Litigation', 'Irani Law Firm'],
    ['ENT_L7', 'BAR-KA-2015', 'Criminal Defense', 'Kumble Legal'],
    ['ENT_L8', 'BAR-TN-2017', 'Constitutional Law', 'Phogat Chambers']
  ] AS row
  MATCH (p:Person {entity_id: row[0]})
  SET p:Lawyer,
      p.license_no = row[1],
      p.specialization = row[2],
      p.firm_name = row[3]`,

  // 9. SEED CRIMINAL CASES (Pure Graph Connections)
  `UNWIND [
    ['CASE_900', 'CRT_DC_CHN', null, 'State vs. Historic Fraud', '2020-01-10', 'Pending', 'FIR-2020-11', 10000.00, 'CBI'],
    ['CASE_1001', 'CRT_DC_CHN', null, 'State of TN vs. Ram', '2025-01-10', 'Pending', 'FIR-2025-001', 50000.00, 'Chennai Police'],
    ['CASE_1002', 'CRT_DC_ND', null, 'CBI vs. Raj', '2025-02-15', 'Pending', 'FIR-2025-002', 500000.00, 'CBI'],
    ['CASE_1003', 'CRT_DC_MUM', null, 'State of MH vs. Kabir', '2025-03-20', 'Pending', 'FIR-2025-003', 25000.00, 'Mumbai Police'],
    ['CASE_1004', 'CRT_DC_BLR', null, 'State of KA vs. Ram', '2025-04-25', 'Pending', 'FIR-2025-004', 30000.00, 'Bangalore Police'],
    ['CASE_1005', 'CRT_FTC_CHN', null, 'State vs. Cyber Syndicate', '2023-01-10', 'Pending', 'FIR-2023-099', 15000.00, 'Cyber Cell'],
    ['CASE_2001', 'CRT_HC_TN', 'CASE_1001', 'Ram vs. State of TN (Appeal)', '2026-03-15', 'Pending', null, 100000.00, null],
    ['CASE_2002', 'CRT_HC_MH', 'CASE_1003', 'Kabir vs. State of MH (Appeal)', '2026-04-10', 'Pending', null, 75000.00, null],
    ['CASE_3000', 'CRT_SC_01', 'CASE_2001', 'Ram vs. State of TN (Supreme Appeal)', '2026-08-20', 'Pending', null, 200000.00, null],
    ['CASE_1006', 'CRT_DC_CHN', null, 'State vs. Simran', '2025-05-30', 'Pending', 'FIR-2025-005', 40000.00, 'Chennai Police']
  ] AS row
  MATCH (ct:Court {court_id: row[1]})
  CREATE (c:Case:CriminalCase {
    case_id: row[0],
    title: row[3],
    filing_date: row[4],
    status: row[5],
    fir_or_complaint_no: row[6],
    bail_amount: row[7]
  })
  CREATE (c)-[:FILED_IN]->(ct)
  WITH c, row
  OPTIONAL MATCH (parent:Case {case_id: row[2]})
  FOREACH (_ IN CASE WHEN parent IS NOT NULL THEN [1] ELSE [] END | CREATE (c)-[:APPEALED_FROM]->(parent))
  WITH c, row
  FOREACH (_ IN CASE WHEN row[8] IS NOT NULL THEN [1] ELSE [] END | 
    MERGE (ag:Agency {name: row[8]})
    CREATE (c)-[:INVESTIGATED_BY]->(ag)
  )`,

  // 10. SEED CIVIL CASES (Pure Graph Connections)
  `UNWIND [
    ['CASE_3001', 'CRT_HC_TN', null, 'TechCorp vs. Ram', '2026-05-01', 'Pending', 5000000.00, 'Contract Breach'],
    ['CASE_3002', 'CRT_HC_DL', null, 'Global Logistics vs. City Bank', '2025-06-10', 'Pending', 15000000.00, 'Commercial Dispute'],
    ['CASE_3003', 'CRT_DC_BLR', null, 'Apex Builders vs. Simran', '2025-07-15', 'Pending', 2500000.00, 'Property Dispute'],
    ['CASE_3004', 'CRT_HC_MH', null, 'Horizon Tech vs. Union of India', '2025-08-20', 'Pending', 80000000.00, 'Tax Dispute'],
    ['CASE_3005', 'CRT_DC_CHN', null, 'Ram vs. Preeti', '2025-09-25', 'Pending', 500000.00, 'Defamation'],
    ['CASE_3006', 'CRT_HC_KA', null, 'TechCorp vs. Apex Builders', '2025-10-30', 'Pending', 12000000.00, 'Intellectual Property'],
    ['CASE_3007', 'CRT_SC_01', null, 'City Bank vs. Union of India', '2025-11-05', 'Pending', 50000000.00, 'Regulatory'],
    ['CASE_3008', 'CRT_DC_MUM', null, 'Kabir vs. Global Logistics', '2025-12-10', 'Pending', 3500000.00, 'Labor Dispute'],
    ['CASE_3009', 'CRT_DC_ND', null, 'Simran vs. Horizon Tech', '2026-01-15', 'Pending', 4500000.00, 'Consumer Protection'],
    ['CASE_3010', 'CRT_HC_TN', null, 'Priya vs. TechCorp', '2026-02-20', 'Pending', 1000000.00, 'Contract Breach']
  ] AS row
  MATCH (ct:Court {court_id: row[1]})
  CREATE (c:Case:CivilCase {
    case_id: row[0],
    title: row[3],
    filing_date: row[4],
    status: row[5],
    dispute_value: row[6],
    civil_case_type: row[7]
  })
  CREATE (c)-[:FILED_IN]->(ct)
  WITH c, row
  OPTIONAL MATCH (parent:Case {case_id: row[2]})
  FOREACH (_ IN CASE WHEN parent IS NOT NULL THEN [1] ELSE [] END | CREATE (c)-[:APPEALED_FROM]->(parent))`,

  // 11. SEED LITIGANTS / CASE_PARTY
  `UNWIND [
    ['PRT_01', 'ENT_001', 'CASE_1001', 'Prosecution'],
    ['PRT_02', 'ENT_002', 'CASE_1001', 'Defendant'],
    ['PRT_03', 'ENT_005', 'CASE_3001', 'Plaintiff'],
    ['PRT_04', 'ENT_002', 'CASE_3001', 'Respondent'],
    ['PRT_05', 'ENT_O8', 'CASE_1002', 'Prosecution'],
    ['PRT_06', 'ENT_P1', 'CASE_1002', 'Defendant'],
    ['PRT_07', 'ENT_O2', 'CASE_1003', 'Prosecution'],
    ['PRT_08', 'ENT_P3', 'CASE_1003', 'Defendant'],
    ['PRT_09', 'ENT_O1', 'CASE_1004', 'Prosecution'],
    ['PRT_10', 'ENT_002', 'CASE_1004', 'Defendant'],
    ['PRT_11', 'ENT_O4', 'CASE_3002', 'Plaintiff'],
    ['PRT_12', 'ENT_O5', 'CASE_3002', 'Respondent'],
    ['PRT_13', 'ENT_O6', 'CASE_3003', 'Plaintiff'],
    ['PRT_14', 'ENT_P2', 'CASE_3003', 'Respondent'],
    ['PRT_15', 'ENT_O7', 'CASE_3004', 'Plaintiff'],
    ['PRT_16', 'ENT_O3', 'CASE_3004', 'Respondent']
  ] AS row
  MATCH (e:LegalEntity {entity_id: row[1]})
  MATCH (c:Case {case_id: row[2]})
  CREATE (cp:CaseParty {
    party_id: row[0],
    entity_id: row[1],
    case_id: row[2],
    party_role: row[3]
  })
  CREATE (e)-[:HAS_PARTY_RECORD]->(cp)-[:FOR_CASE]->(c)`,

  // 12. SEED COUNSEL
  `UNWIND [
    ['CNSL_01', 'ENT_004', 'PRT_02', true],
    ['CNSL_02', 'ENT_004', 'PRT_04', true],
    ['CNSL_03', 'ENT_007', 'PRT_03', true],
    ['CNSL_04', 'ENT_L2', 'PRT_06', true],
    ['CNSL_05', 'ENT_L7', 'PRT_08', true],
    ['CNSL_06', 'ENT_004', 'PRT_10', true],
    ['CNSL_07', 'ENT_L1', 'PRT_11', true],
    ['CNSL_08', 'ENT_L5', 'PRT_12', true],
    ['CNSL_09', 'ENT_L3', 'PRT_13', true],
    ['CNSL_10', 'ENT_L4', 'PRT_14', true],
    ['CNSL_11', 'ENT_L1', 'PRT_15', true],
    ['CNSL_12', 'ENT_L8', 'PRT_16', true]
  ] AS row
  MATCH (l:Lawyer {entity_id: row[1]})
  MATCH (cp:CaseParty {party_id: row[2]})
  CREATE (l)-[:REPRESENTS {
    counsel_id: row[0],
    lead_counsel_flag: row[3]
  }]->(cp)`,

  // 13. SEED HEARINGS & BENCHES
  `UNWIND [
    ['CASE_900', '2020-12-01 10:00:00', 'Final arguments heard. Judgment reserved.'],
    ['CASE_1001', '2025-02-15 11:30:00', 'Bail hearing. Bail granted.'],
    ['CASE_1005', '2024-05-10 10:30:00', 'Initial framing of charges.'],
    ['CASE_1003', '2025-04-01 11:00:00', 'Witness testimony.'],
    ['CASE_1003', '2025-04-15 14:00:00', 'Final arguments.'],
    ['CASE_1004', '2025-05-01 10:00:00', 'Evidence submission.'],
    ['CASE_3002', '2025-07-01 11:30:00', 'Arbitration failed. Trial begins.'],
    ['CASE_3003', '2025-08-01 14:30:00', 'Property inspection report reviewed.'],
    ['CASE_3005', '2025-10-01 10:00:00', 'Defamation evidence presented.'],
    ['CASE_3007', '2025-12-01 11:00:00', 'Supreme Court admission hearing.']
  ] AS row
  MATCH (c:Case {case_id: row[0]})
  CREATE (c)-[:HAS_HEARING]->(:Hearing {
    case_id: row[0],
    hearing_timestamp: row[1],
    summary_notes: row[2]
  })`,

  

  `UNWIND [
    ['BNCH_1', 'ENT_006', 'CASE_900', '2020-12-01 10:00:00', 'Single Judge'],
    ['BNCH_2', 'ENT_006', 'CASE_1001', '2025-02-15 11:30:00', 'Single Judge'],
    ['BNCH_3', 'ENT_J8', 'CASE_1005', '2024-05-10 10:30:00', 'Single Judge'],
    ['BNCH_4', 'ENT_J6', 'CASE_1003', '2025-04-01 11:00:00', 'Single Judge'],
    ['BNCH_5', 'ENT_J6', 'CASE_1003', '2025-04-15 14:00:00', 'Single Judge'],
    ['BNCH_6', 'ENT_J7', 'CASE_1004', '2025-05-01 10:00:00', 'Single Judge'],
    ['BNCH_7', 'ENT_J5', 'CASE_3002', '2025-07-01 11:30:00', 'Division Bench Lead'],
    ['BNCH_8', 'ENT_J7', 'CASE_3003', '2025-08-01 14:30:00', 'Single Judge'],
    ['BNCH_9', 'ENT_006', 'CASE_3005', '2025-10-01 10:00:00', 'Single Judge'],
    ['BNCH_10', 'ENT_J1', 'CASE_3007', '2025-12-01 11:00:00', 'Constitution Bench Lead']
  ] AS row
  MATCH (j:Judge {entity_id: row[1]})
  MATCH (:Case {case_id: row[2]})-[:HAS_HEARING]->(h:Hearing {hearing_timestamp: row[3]})
  CREATE (j)-[:SAT_ON_BENCH {
    bench_id: row[0],
    bench_role: row[4]
  }]->(h)`,

  // 14. SEED JUDGMENTS & AUTO-CLOSE
  `UNWIND [
    ['JUDG_900', 'CASE_900', '2020-12-15', 'Guilty of financial fraud.'],
    ['JUDG_1003', 'CASE_1003', '2025-04-20', 'Acquitted due to lack of evidence.'],
    ['JUDG_1004', 'CASE_1004', '2025-05-15', 'Guilty of property theft.'],
    ['JUDG_3002', 'CASE_3002', '2025-07-15', 'Damages awarded to Plaintiff.'],
    ['JUDG_3003', 'CASE_3003', '2025-08-15', 'Injunction granted against Respondent.'],
    ['JUDG_3005', 'CASE_3005', '2025-10-15', 'Defamation proven. Fine imposed.'],
    ['JUDG_3007', 'CASE_3007', '2025-12-15', 'Regulatory action upheld.'],
    ['JUDG_3009', 'CASE_3009', '2026-01-30', 'Settled out of court.'],
    ['JUDG_1006', 'CASE_1006', '2025-06-15', 'Charges dismissed.'],
    ['JUDG_3008', 'CASE_3008', '2026-02-01', 'Compensation ordered.']
  ] AS row
  MATCH (c:Case {case_id: row[1]})
  SET c.status = 'Closed'
  CREATE (c)-[:HAS_JUDGMENT]->(:Judgment {
    judgment_id: row[0],
    case_id: row[1],
    verdict_date: row[2],
    judgment_text: row[3]
  })`,

  // 15. SEED STATUTES
  `UNWIND [
    ['IPC_420', 'Cheating and Dishonesty', 'Inducing delivery of property via fraud.', 7],
    ['IPC_302', 'Murder', 'Punishment for murder.', 99],
    ['IPC_120B', 'Criminal Conspiracy', 'Party to a criminal conspiracy.', 2],
    ['IPC_378', 'Theft', 'Dishonest removal of movable property.', 3],
    ['IPC_498A', 'Cruelty', 'Husband or relative subjecting woman to cruelty.', 3],
    ['IPC_307', 'Attempt to Murder', 'Act with intent to cause death.', 10],
    ['IPC_506', 'Criminal Intimidation', 'Threatening injury to person or property.', 2],
    ['PCA_7', 'Bribery', 'Public servant taking gratification.', 7],
    ['IT_66', 'Cyber Terrorism', 'Hacking or data theft.', 3],
    ['NDBA_138', 'Cheque Bounce', 'Dishonor of cheque for insufficiency of funds.', 2]
  ] AS row
  CREATE (:StatuteCharge {
    charge_code: row[0],
    section_name: row[1],
    description: row[2],
    max_sentence_years: row[3]
  })`,

  // 16. SEED CHARGE SHEETS
  `UNWIND [
    ['CHG_01', 'CASE_1001', 'ENT_002', 'IPC_420', '2024-11-01 09:30:00', 'Pending', null],
    ['CHG_02', 'CASE_900', 'ENT_002', 'IPC_420', '2019-05-15 14:00:00', 'Guilty', '5 Years RI'],
    ['CHG_03', 'CASE_1001', 'ENT_002', 'IPC_120B', '2024-11-01 09:30:00', 'Pending', null],
    ['CHG_04', 'CASE_1002', 'ENT_P1', 'PCA_7', '2025-01-10 10:00:00', 'Pending', null],
    ['CHG_05', 'CASE_1002', 'ENT_P1', 'IPC_120B', '2025-01-10 10:00:00', 'Pending', null],
    ['CHG_06', 'CASE_1003', 'ENT_P3', 'IPC_307', '2025-02-15 22:00:00', 'Acquitted', null],
    ['CHG_07', 'CASE_1004', 'ENT_002', 'IPC_378', '2025-03-10 14:00:00', 'Guilty', '2 Years RI'],
    ['CHG_08', 'CASE_1005', 'ENT_P2', 'IT_66', '2022-12-01 08:00:00', 'Pending', null],
    ['CHG_09', 'CASE_1006', 'ENT_P2', 'IPC_506', '2025-04-10 16:00:00', 'Dismissed', null],
    ['CHG_10', 'CASE_2001', 'ENT_002', 'IPC_420', '2026-03-01 10:00:00', 'Pending', null],
    ['CHG_11', 'CASE_1004', 'ENT_002', 'IPC_120B', '2025-03-10 14:00:00', 'Guilty', '1 Year RI'],
    ['CHG_12', 'CASE_1005', 'ENT_P2', 'IPC_420', '2022-12-01 08:00:00', 'Pending', null]
  ] AS row
  MATCH (cc:CriminalCase {case_id: row[1]})
  MATCH (def:LegalEntity {entity_id: row[2]})
  MATCH (sc:StatuteCharge {charge_code: row[3]})
  CREATE (cs:ChargeSheet {
    charge_sheet_id: row[0],
    criminal_case_id: row[1],
    defendant_id: row[2],
    charge_code: row[3],
    incident_timestamp: row[4],
    verdict_type: row[5],
    sentence_imposed: row[6]
  })
  CREATE (cc)-[:HAS_CHARGE_SHEET]->(cs)
  CREATE (cs)-[:AGAINST_DEFENDANT]->(def)
  CREATE (cs)-[:CHARGED_UNDER]->(sc)`,

  // 17. SEED PRECEDENT TAGS
  `UNWIND [
    ['TAG_01', 'Corporate Fraud'],
    ['TAG_02', 'Bail Jurisprudence'],
    ['TAG_03', 'Homicide'],
    ['TAG_04', 'Cybercrime'],
    ['TAG_05', 'Contract Law'],
    ['TAG_06', 'Property Rights'],
    ['TAG_07', 'Defamation'],
    ['TAG_08', 'Corruption'],
    ['TAG_09', 'Family Law'],
    ['TAG_10', 'Tax Evasion']
  ] AS row
  CREATE (:PrecedentTag { tag_id: row[0], keyword: row[1] })`,

  `UNWIND [
    ['CASE_900', 'TAG_01'], ['CASE_1001', 'TAG_01'], ['CASE_2001', 'TAG_02'],
    ['CASE_1002', 'TAG_08'], ['CASE_1003', 'TAG_03'], ['CASE_1004', 'TAG_06'],
    ['CASE_1005', 'TAG_04'], ['CASE_3001', 'TAG_05'], ['CASE_3002', 'TAG_05'],
    ['CASE_3003', 'TAG_06'], ['CASE_3004', 'TAG_10'], ['CASE_3005', 'TAG_07'],
    ['CASE_3006', 'TAG_05'], ['CASE_3007', 'TAG_10'], ['CASE_3008', 'TAG_05']
  ] AS row
  MATCH (c:Case {case_id: row[0]})
  MATCH (t:PrecedentTag {tag_id: row[1]})
  CREATE (c)-[:HAS_TAG]->(t)`,

  // 18. SEED CITATIONS
  `UNWIND [
    ['CIT_01', 'CASE_2001', 'CASE_900', 'Cited standard for intent to defraud in corporate entities.'],
    ['CIT_02', 'CASE_1001', 'CASE_900', 'Relied on evidence admissibility ruling.'],
    ['CIT_03', 'CASE_3000', 'CASE_900', 'Supreme court referenced original landmark fraud judgment.'],
    ['CIT_04', 'CASE_1002', 'CASE_900', 'Cited for corruption linkage.'],
    ['CIT_05', 'CASE_2002', 'CASE_1003', 'Appealing the acquittal standard.'],
    ['CIT_06', 'CASE_3006', 'CASE_3002', 'Citing commercial dispute damages calculation.'],
    ['CIT_07', 'CASE_3007', 'CASE_3004', 'Tax evasion regulatory parallels.'],
    ['CIT_08', 'CASE_1006', 'CASE_1005', 'Cyber intimidation overlaps.'],
    ['CIT_09', 'CASE_3010', 'CASE_3001', 'Citing initial contract breach filing.'],
    ['CIT_10', 'CASE_3008', 'CASE_3002', 'Referencing corporate liability limitations.']
  ] AS row
  MATCH (citing:Case {case_id: row[1]})
  MATCH (cited:Case {case_id: row[2]})
  CREATE (citing)-[:CITES { citation_id: row[0], relevance_note: row[3] }]->(cited)`
];

async function seedDatabase() {
  // Binding explicitly to 'neo4j' prevents default routing table lookup errors
  const session = driver.session({ database: 'neo4j' });
  try {
    console.log('Starting Neo4j Schema & Seed initialization...');
    for (let i = 0; i < statements.length; i++) {
      await session.run(statements[i]);
      console.log(`Executed step ${i + 1}/${statements.length}`);
    }
    console.log('Neo4j Database successfully seeded with all judicial records!');
  } catch (err) {
    console.error('Seed Error:', err);
  } finally {
    await session.close();
    await driver.close();
  }
}

// THIS FUNCTION CALL IS CRITICAL:
seedDatabase();
