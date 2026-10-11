import express from 'express';
import cors from 'cors';
import { getPool, testConnection, getStatus, executeQuery } from './db.js';
import { initialData } from './mockData.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory store initialized with baseline data for mock/fallback mode
let memDb = JSON.parse(JSON.stringify(initialData));

// Test DB connection on startup
let dbHealth = { connected: false };
testConnection().then(res => {
  dbHealth = res;
});

// Helper to determine whether to run against live MySQL
async function runQuery(sql, params = []) {
  const status = getStatus();
  if (status.connected) {
    try {
      const [rows] = await executeQuery(sql, params);
      return { success: true, data: rows, source: 'mysql' };
    } catch (err) {
      console.error('[MySQL Query Error]', err.message);
      throw err;
    }
  }
  return null;
}

// -------------------------------------------------------------
// STATUS & HEALTH ENDPOINTS
// -------------------------------------------------------------
app.get('/api/status', async (req, res) => {
  const currentStatus = getStatus();
  res.json({
    ...currentStatus,
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

app.post('/api/reconnect', async (req, res) => {
  const testRes = await testConnection();
  res.json(testRes);
});

// -------------------------------------------------------------
// READ ENDPOINTS
// -------------------------------------------------------------

// Cases with linked data
app.get('/api/cases', async (req, res) => {
  try {
    const live = await runQuery(`
      SELECT c.Case_ID, c.Court_ID, ct.Court_Name, ct.Tier_Level, c.Parent_Case_ID,
             c.Title, c.Filing_Date, c.Status,
             cc.FIR_Or_Complaint_No, cc.Bail_Amount, cc.Arresting_Agency,
             cv.Dispute_Value, cv.Civil_Case_Type,
             CASE 
               WHEN cc.Case_ID IS NOT NULL THEN 'Criminal'
               WHEN cv.Case_ID IS NOT NULL THEN 'Civil'
               ELSE 'General'
             END AS Case_Category
      FROM \`CASE\` c
      LEFT JOIN COURT ct ON c.Court_ID = ct.Court_ID
      LEFT JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
      LEFT JOIN CIVIL_CASE cv ON c.Case_ID = cv.Case_ID
      ORDER BY c.Filing_Date DESC;
    `);
    if (live) return res.json(live.data);
  } catch (e) {
    // Fall back to memory store on error
  }

  // Memory store fallback
  const combined = memDb.cases.map(c => {
    const court = memDb.courts.find(ct => ct.Court_ID === c.Court_ID);
    const crim = memDb.criminalCases.find(cr => cr.Case_ID === c.Case_ID);
    const civ = memDb.civilCases.find(cv => cv.Case_ID === c.Case_ID);
    return {
      ...c,
      Court_Name: court?.Court_Name || c.Court_ID,
      Tier_Level: court?.Tier_Level || 'Trial',
      FIR_Or_Complaint_No: crim?.FIR_Or_Complaint_No || null,
      Bail_Amount: crim?.Bail_Amount || null,
      Arresting_Agency: crim?.Arresting_Agency || null,
      Dispute_Value: civ?.Dispute_Value || null,
      Civil_Case_Type: civ?.Civil_Case_Type || null,
      Case_Category: crim ? 'Criminal' : (civ ? 'Civil' : 'General')
    };
  });
  res.json(combined);
});

// Courts
app.get('/api/courts', async (req, res) => {
  try {
    const live = await runQuery(`SELECT * FROM COURT ORDER BY Tier_Level DESC;`);
    if (live) return res.json(live.data);
  } catch (e) {}
  res.json(memDb.courts);
});

// Judges
app.get('/api/judges', async (req, res) => {
  try {
    const live = await runQuery(`
      SELECT j.Entity_ID, j.Judicial_ID, j.Appointment_Date, j.Current_Court_ID,
             p.First_Name, p.Last_Name, ct.Court_Name
      FROM JUDGE j
      JOIN PERSON p ON j.Entity_ID = p.Entity_ID
      LEFT JOIN COURT ct ON j.Current_Court_ID = ct.Court_ID;
    `);
    if (live) return res.json(live.data);
  } catch (e) {}
  const result = memDb.judges.map(j => {
    const court = memDb.courts.find(c => c.Court_ID === j.Current_Court_ID);
    return { ...j, Court_Name: court?.Court_Name || j.Current_Court_ID };
  });
  res.json(result);
});

// Lawyers
app.get('/api/lawyers', async (req, res) => {
  try {
    const live = await runQuery(`
      SELECT l.Entity_ID, l.License_No, l.Specialization, l.Firm_Name,
             p.First_Name, p.Last_Name
      FROM LAWYER l
      JOIN PERSON p ON l.Entity_ID = p.Entity_ID;
    `);
    if (live) return res.json(live.data);
  } catch (e) {}
  res.json(memDb.lawyers);
});

// Hearings
app.get('/api/hearings', async (req, res) => {
  try {
    const live = await runQuery(`
      SELECT h.Case_ID, c.Title AS Case_Title, h.Hearing_Timestamp, h.Summary_Notes,
             hb.Bench_ID, hb.Judge_ID, hb.Bench_Role,
             CONCAT(p.First_Name, ' ', p.Last_Name) AS Presiding_Judge
      FROM HEARING h
      JOIN \`CASE\` c ON h.Case_ID = c.Case_ID
      LEFT JOIN HEARING_BENCH hb ON h.Case_ID = hb.Case_ID AND h.Hearing_Timestamp = hb.Hearing_Timestamp
      LEFT JOIN JUDGE j ON hb.Judge_ID = j.Entity_ID
      LEFT JOIN PERSON p ON j.Entity_ID = p.Entity_ID
      ORDER BY h.Hearing_Timestamp DESC;
    `);
    if (live) return res.json(live.data);
  } catch (e) {}

  const result = memDb.hearings.map(h => {
    const c = memDb.cases.find(x => x.Case_ID === h.Case_ID);
    const bench = memDb.hearingBenches.find(b => b.Case_ID === h.Case_ID && b.Hearing_Timestamp === h.Hearing_Timestamp);
    const judge = bench ? memDb.judges.find(j => j.Entity_ID === bench.Judge_ID) : null;
    return {
      Case_ID: h.Case_ID,
      Case_Title: c?.Title || h.Case_ID,
      Hearing_Timestamp: h.Hearing_Timestamp,
      Summary_Notes: h.Summary_Notes,
      Bench_ID: bench?.Bench_ID || null,
      Judge_ID: bench?.Judge_ID || null,
      Bench_Role: bench?.Bench_Role || null,
      Presiding_Judge: judge ? `${judge.First_Name} ${judge.Last_Name}` : 'Unassigned'
    };
  });
  res.json(result);
});

// Judgments
app.get('/api/judgments', async (req, res) => {
  try {
    const live = await runQuery(`
      SELECT j.Judgment_ID, j.Case_ID, c.Title AS Case_Title, j.Verdict_Date, j.Judgment_Text,
             DATEDIFF(j.Verdict_Date, c.Filing_Date) AS Days_To_Resolution
      FROM JUDGMENT j
      JOIN \`CASE\` c ON j.Case_ID = c.Case_ID
      ORDER BY j.Verdict_Date DESC;
    `);
    if (live) return res.json(live.data);
  } catch (e) {}

  const result = memDb.judgments.map(j => {
    const c = memDb.cases.find(x => x.Case_ID === j.Case_ID);
    return {
      ...j,
      Case_Title: c?.Title || j.Case_ID,
      Days_To_Resolution: c ? Math.round((new Date(j.Verdict_Date) - new Date(c.Filing_Date)) / (1000 * 60 * 60 * 24)) : null
    };
  });
  res.json(result);
});

// Citations & Precedents
app.get('/api/precedents', async (req, res) => {
  try {
    const live = await runQuery(`
      SELECT cc.Citation_ID, cc.Citing_Case_ID, c1.Title AS Citing_Case_Title,
             cc.Cited_Precedent_Case_ID, c2.Title AS Cited_Precedent_Title,
             cc.Relevance_Note
      FROM CASE_CITATION cc
      JOIN \`CASE\` c1 ON cc.Citing_Case_ID = c1.Case_ID
      JOIN \`CASE\` c2 ON cc.Cited_Precedent_Case_ID = c2.Case_ID;
    `);
    if (live) return res.json(live.data);
  } catch (e) {}

  const result = memDb.citations.map(cit => {
    const c1 = memDb.cases.find(c => c.Case_ID === cit.Citing_Case_ID);
    const c2 = memDb.cases.find(c => c.Case_ID === cit.Cited_Precedent_Case_ID);
    return {
      ...cit,
      Citing_Case_Title: c1?.Title || cit.Citing_Case_ID,
      Cited_Precedent_Title: c2?.Title || cit.Cited_Precedent_Case_ID
    };
  });
  res.json(result);
});

// Master Docket
app.get('/api/master-docket', async (req, res) => {
  try {
    const live = await runQuery(`
      SELECT 
          ct.Court_Name,
          c.Case_ID,
          c.Title,
          c.Status,
          GROUP_CONCAT(DISTINCT sc.Section_Name SEPARATOR ' | ') AS Applied_Charges,
          MAX(h.Hearing_Timestamp) AS Last_Hearing_Date,
          COALESCE(j.Verdict_Date, 'No Verdict') AS Judgment_Status
      FROM \`CASE\` c
      JOIN COURT ct ON c.Court_ID = ct.Court_ID
      LEFT JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
      LEFT JOIN DOCKET_CHARGE_SHEET dcs ON cc.Case_ID = dcs.Criminal_Case_ID
      LEFT JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
      LEFT JOIN HEARING h ON c.Case_ID = h.Case_ID
      LEFT JOIN JUDGMENT j ON c.Case_ID = j.Case_ID
      GROUP BY ct.Court_Name, c.Case_ID, c.Title, c.Status, j.Verdict_Date;
    `);
    if (live) return res.json(live.data);
  } catch (e) {}

  // Fallback master docket
  const result = memDb.cases.map(c => {
    const court = memDb.courts.find(ct => ct.Court_ID === c.Court_ID);
    const charges = memDb.chargeSheets.filter(ch => ch.Criminal_Case_ID === c.Case_ID);
    const statuteNames = charges.map(ch => {
      const s = memDb.statuteCharges.find(sc => sc.Charge_Code === ch.Charge_Code);
      return s?.Section_Name || ch.Charge_Code;
    });
    const hearings = memDb.hearings.filter(h => h.Case_ID === c.Case_ID);
    const lastHearing = hearings.length > 0 ? hearings.sort((a,b) => new Date(b.Hearing_Timestamp) - new Date(a.Hearing_Timestamp))[0].Hearing_Timestamp : null;
    const judgment = memDb.judgments.find(j => j.Case_ID === c.Case_ID);
    return {
      Court_Name: court?.Court_Name || c.Court_ID,
      Case_ID: c.Case_ID,
      Title: c.Title,
      Status: c.Status,
      Applied_Charges: statuteNames.join(' | ') || 'None',
      Last_Hearing_Date: lastHearing || 'None',
      Judgment_Status: judgment?.Verdict_Date || 'No Verdict'
    };
  });
  res.json(result);
});

// Appeals & Appellate Chains
app.get('/api/appeals', async (req, res) => {
  try {
    const live = await runQuery(`
      SELECT c.Case_ID, c.Parent_Case_ID, p.Title AS Parent_Case_Title,
             c.Title, c.Court_ID, ct.Court_Name, ct.Tier_Level,
             c.Filing_Date, c.Status
      FROM \`CASE\` c
      LEFT JOIN \`CASE\` p ON c.Parent_Case_ID = p.Case_ID
      LEFT JOIN COURT ct ON c.Court_ID = ct.Court_ID
      WHERE c.Parent_Case_ID IS NOT NULL OR c.Title LIKE '%Appeal%'
      ORDER BY c.Filing_Date DESC;
    `);
    if (live) return res.json(live.data);
  } catch (e) {}

  const result = memDb.cases
    .filter(c => c.Parent_Case_ID || (c.Title && c.Title.toLowerCase().includes('appeal')))
    .map(c => {
      const parent = memDb.cases.find(p => p.Case_ID === c.Parent_Case_ID);
      const court = memDb.courts.find(ct => ct.Court_ID === c.Court_ID);
      return {
        Case_ID: c.Case_ID,
        Parent_Case_ID: c.Parent_Case_ID,
        Parent_Case_Title: parent?.Title || (c.Parent_Case_ID ? `Parent ${c.Parent_Case_ID}` : 'Original Record'),
        Title: c.Title,
        Court_ID: c.Court_ID,
        Court_Name: court?.Court_Name || c.Court_ID,
        Tier_Level: court?.Tier_Level || 'High Court',
        Filing_Date: c.Filing_Date,
        Status: c.Status
      };
    });
  res.json(result);
});

// System Audit Trail & Proceedings History
app.get('/api/audit-trail', async (req, res) => {
  try {
    const live = await runQuery(`
      SELECT 'HEARING_SESSION' AS Event_Type,
             h.Hearing_Timestamp AS Event_Timestamp,
             h.Case_ID,
             c.Title AS Case_Title,
             CONCAT('Proceeding: ', COALESCE(h.Summary_Notes, 'No minutes recorded')) AS Details,
             COALESCE(hb.Bench_Role, 'Single Judge') AS Actor_Role,
             CONCAT(COALESCE(p.First_Name, 'Hon.'), ' ', COALESCE(p.Last_Name, 'Judge')) AS Actor_Name
      FROM HEARING h
      JOIN \`CASE\` c ON h.Case_ID = c.Case_ID
      LEFT JOIN HEARING_BENCH hb ON h.Case_ID = hb.Case_ID AND h.Hearing_Timestamp = hb.Hearing_Timestamp
      LEFT JOIN JUDGE j ON hb.Judge_ID = j.Entity_ID
      LEFT JOIN PERSON p ON j.Entity_ID = p.Entity_ID
      UNION ALL
      SELECT 'JUDGMENT_PRONOUNCED' AS Event_Type,
             CONCAT(j.Verdict_Date, ' 10:00:00') AS Event_Timestamp,
             j.Case_ID,
             c.Title AS Case_Title,
             CONCAT('Final Decree Delivered: ', SUBSTRING(j.Judgment_Text, 1, 120), '...') AS Details,
             'Adjudicating Court' AS Actor_Role,
             ct.Court_Name AS Actor_Name
      FROM JUDGMENT j
      JOIN \`CASE\` c ON j.Case_ID = c.Case_ID
      JOIN COURT ct ON c.Court_ID = ct.Court_ID
      UNION ALL
      SELECT 'CASE_FILED' AS Event_Type,
             CONCAT(c.Filing_Date, ' 09:00:00') AS Event_Timestamp,
             c.Case_ID,
             c.Title AS Case_Title,
             CONCAT('Docket Lodged at ', ct.Court_Name, ' (Status: ', c.Status, ')') AS Details,
             'Registrar' AS Actor_Role,
             ct.Court_Name AS Actor_Name
      FROM \`CASE\` c
      JOIN COURT ct ON c.Court_ID = ct.Court_ID
      ORDER BY Event_Timestamp DESC;
    `);
    if (live) return res.json(live.data);
  } catch (e) {}

  const events = [];
  memDb.cases.forEach(c => {
    const court = memDb.courts.find(ct => ct.Court_ID === c.Court_ID);
    events.push({
      Event_Type: 'CASE_FILED',
      Event_Timestamp: `${c.Filing_Date} 09:00:00`,
      Case_ID: c.Case_ID,
      Case_Title: c.Title,
      Details: `Docket Lodged at ${court?.Court_Name || c.Court_ID} (Status: ${c.Status})`,
      Actor_Role: 'Registrar',
      Actor_Name: court?.Court_Name || 'Registry'
    });
  });

  memDb.hearings.forEach(h => {
    const c = memDb.cases.find(x => x.Case_ID === h.Case_ID);
    const bench = memDb.hearingBenches.find(b => b.Case_ID === h.Case_ID && b.Hearing_Timestamp === h.Hearing_Timestamp);
    const judge = bench ? memDb.judges.find(j => j.Entity_ID === bench.Judge_ID) : null;
    events.push({
      Event_Type: 'HEARING_SESSION',
      Event_Timestamp: h.Hearing_Timestamp,
      Case_ID: h.Case_ID,
      Case_Title: c?.Title || h.Case_ID,
      Details: `Proceeding: ${h.Summary_Notes}`,
      Actor_Role: bench?.Bench_Role || 'Single Judge',
      Actor_Name: judge ? `${judge.First_Name} ${judge.Last_Name}` : 'Presiding Judge'
    });
  });

  memDb.judgments.forEach(j => {
    const c = memDb.cases.find(x => x.Case_ID === j.Case_ID);
    const court = c ? memDb.courts.find(ct => ct.Court_ID === c.Court_ID) : null;
    events.push({
      Event_Type: 'JUDGMENT_PRONOUNCED',
      Event_Timestamp: `${j.Verdict_Date} 10:00:00`,
      Case_ID: j.Case_ID,
      Case_Title: c?.Title || j.Case_ID,
      Details: `Final Decree Delivered: ${j.Judgment_Text}`,
      Actor_Role: 'Adjudicating Court',
      Actor_Name: court?.Court_Name || 'High Court'
    });
  });

  events.sort((a, b) => new Date(b.Event_Timestamp).getTime() - new Date(a.Event_Timestamp).getTime());
  res.json(events);
});

// -------------------------------------------------------------
// ANALYTICAL QUERY ENGINE (Q1 - Q15)
// -------------------------------------------------------------
app.get('/api/analytics/summary', (req, res) => {
  const totalCases = memDb.cases.length;
  const pendingCases = memDb.cases.filter(c => c.Status === 'Pending').length;
  const closedCases = memDb.cases.filter(c => c.Status === 'Closed').length;
  const clearanceRate = totalCases > 0 ? Math.round((closedCases / totalCases) * 100) : 0;
  res.json({
    totalCases,
    pendingCases,
    closedCases,
    clearanceRate,
    totalCourts: memDb.courts.length,
    totalJudges: memDb.judges.length,
    totalLawyers: memDb.lawyers.length,
    totalHearings: memDb.hearings.length,
    totalJudgments: memDb.judgments.length
  });
});

app.get('/api/analytics/q/:id', async (req, res) => {
  const queryId = req.params.id;

  // SQL definitions for all 15 queries
  const queries = {
    '1': {
      title: 'Q1: Caseload Distribution by Court Tier',
      description: 'Aggregates overall and pending case distribution across judicial tiers.',
      sql: `
        SELECT ct.Tier_Level, ct.Court_Name, COUNT(c.Case_ID) AS Total_Cases, 
               SUM(CASE WHEN c.Status = 'Pending' THEN 1 ELSE 0 END) AS Pending_Cases
        FROM COURT ct
        LEFT JOIN \`CASE\` c ON ct.Court_ID = c.Court_ID
        GROUP BY ct.Tier_Level, ct.Court_Name;
      `,
      fallback: () => {
        const map = {};
        memDb.courts.forEach(court => {
          map[court.Court_ID] = {
            Tier_Level: court.Tier_Level,
            Court_Name: court.Court_Name,
            Total_Cases: 0,
            Pending_Cases: 0
          };
        });
        memDb.cases.forEach(c => {
          if (map[c.Court_ID]) {
            map[c.Court_ID].Total_Cases += 1;
            if (c.Status === 'Pending') map[c.Court_ID].Pending_Cases += 1;
          }
        });
        return Object.values(map);
      }
    },
    '2': {
      title: 'Q2: Lawyer Roster and Active Client Representations',
      description: 'Maps lawyers, licenses, and specializations to client dockets.',
      sql: `
        SELECT l.License_No, p.First_Name, p.Last_Name, l.Specialization, 
               c.Title AS Case_Name, cp.Party_Role, cc.Lead_Counsel_Flag
        FROM LAWYER l
        JOIN PERSON p ON l.Entity_ID = p.Entity_ID
        JOIN CASE_COUNSEL cc ON l.Entity_ID = cc.Lawyer_ID
        JOIN CASE_PARTY cp ON cc.Party_ID = cp.Party_ID
        JOIN \`CASE\` c ON cp.Case_ID = c.Case_ID;
      `,
      fallback: () => {
        return memDb.caseCounsel.map(cc => {
          const lawyer = memDb.lawyers.find(l => l.Entity_ID === cc.Lawyer_ID);
          const party = memDb.caseParties.find(p => p.Party_ID === cc.Party_ID);
          const c = party ? memDb.cases.find(x => x.Case_ID === party.Case_ID) : null;
          return {
            License_No: lawyer?.License_No,
            First_Name: lawyer?.First_Name,
            Last_Name: lawyer?.Last_Name,
            Specialization: lawyer?.Specialization,
            Case_Name: c?.Title || 'N/A',
            Party_Role: party?.Party_Role || 'N/A',
            Lead_Counsel_Flag: cc.Lead_Counsel_Flag ? 1 : 0
          };
        });
      }
    },
    '3': {
      title: 'Q3: Recursive Appellate Lineage Traversal',
      description: 'Traces the multi-tier hierarchy of appeals linking High Courts and District Courts.',
      sql: `
        WITH RECURSIVE Appellate_Chain AS (
            SELECT Case_ID, Parent_Case_ID, Title, Court_ID, 1 AS Appeal_Level
            FROM \`CASE\` WHERE Case_ID = 'CASE_2001'
            UNION ALL
            SELECT c.Case_ID, c.Parent_Case_ID, c.Title, c.Court_ID, ac.Appeal_Level + 1
            FROM \`CASE\` c
            INNER JOIN Appellate_Chain ac ON ac.Parent_Case_ID = c.Case_ID
        )
        SELECT ac.Appeal_Level, ac.Case_ID, ac.Title, ct.Court_Name, ct.Tier_Level
        FROM Appellate_Chain ac
        JOIN COURT ct ON ac.Court_ID = ct.Court_ID
        ORDER BY ac.Appeal_Level DESC;
      `,
      fallback: () => [
        { Appeal_Level: 2, Case_ID: 'CASE_1001', Title: 'State of TN vs. Ram', Court_Name: 'Chennai District Court', Tier_Level: 'District' },
        { Appeal_Level: 1, Case_ID: 'CASE_2001', Title: 'Ram vs. State of TN (Appeal)', Court_Name: 'Madras High Court', Tier_Level: 'High Court' }
      ]
    },
    '4': {
      title: 'Q4: Complete Hearing History and Presiding Judges',
      description: 'Audit log of hearing dates, bench composition, and judge minutes for CASE_1001.',
      sql: `
        SELECT h.Hearing_Timestamp, h.Summary_Notes, hb.Bench_Role, 
               p.First_Name AS Judge_First_Name, p.Last_Name AS Judge_Last_Name
        FROM HEARING h
        JOIN HEARING_BENCH hb ON h.Case_ID = hb.Case_ID AND h.Hearing_Timestamp = hb.Hearing_Timestamp
        JOIN JUDGE j ON hb.Judge_ID = j.Entity_ID
        JOIN PERSON p ON j.Entity_ID = p.Entity_ID
        WHERE h.Case_ID = 'CASE_1001'
        ORDER BY h.Hearing_Timestamp ASC;
      `,
      fallback: () => [
        {
          Hearing_Timestamp: '2025-02-15 11:30:00',
          Summary_Notes: 'Bail hearing. Bail granted.',
          Bench_Role: 'Single Judge',
          Judge_First_Name: 'Krishna',
          Judge_Last_Name: 'Iyer'
        }
      ]
    },
    '5': {
      title: 'Q5: Case Resolution Duration Benchmarking',
      description: 'Days elapsed between filing date and verdict delivery for concluded trials.',
      sql: `
        SELECT c.Case_ID, c.Title, c.Filing_Date, j.Verdict_Date,
               DATEDIFF(j.Verdict_Date, c.Filing_Date) AS Days_To_Resolution
        FROM \`CASE\` c
        JOIN JUDGMENT j ON c.Case_ID = j.Case_ID
        WHERE c.Status = 'Closed';
      `,
      fallback: () => [
        { Case_ID: 'CASE_900', Title: 'State vs. Historic Fraud', Filing_Date: '2020-01-10', Verdict_Date: '2020-12-15', Days_To_Resolution: 340 }
      ]
    },
    '6': {
      title: 'Q6: Pending Cases with Scheduled or Completed Hearings',
      description: 'Subquery filtering cases currently in trial docket with recorded hearings.',
      sql: `
        SELECT c.Case_ID, c.Title, c.Filing_Date
        FROM \`CASE\` c
        WHERE c.Status = 'Pending' 
          AND c.Case_ID IN (SELECT DISTINCT Case_ID FROM HEARING);
      `,
      fallback: () => [
        { Case_ID: 'CASE_1001', Title: 'State of TN vs. Ram', Filing_Date: '2025-01-10' },
        { Case_ID: 'CASE_2001', Title: 'Ram vs. State of TN (Appeal)', Filing_Date: '2026-03-15' }
      ]
    },
    '7': {
      title: 'Q7: Double Jeopardy Risk Identification',
      description: 'Detects defendants facing duplicate charges for the same statute/incident.',
      sql: `
        SELECT p.First_Name, p.Last_Name, dcs.Charge_Code, sc.Section_Name, 
               COUNT(dcs.Charge_Sheet_ID) AS Times_Charged
        FROM DOCKET_CHARGE_SHEET dcs
        JOIN PERSON p ON dcs.Defendant_ID = p.Entity_ID
        JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
        GROUP BY dcs.Defendant_ID, dcs.Charge_Code, sc.Section_Name
        HAVING COUNT(dcs.Charge_Sheet_ID) > 1;
      `,
      fallback: () => [
        { First_Name: 'Ram', Last_Name: 'Kumar', Charge_Code: 'IPC_420', Section_Name: 'Cheating and Dishonesty', Times_Charged: 2 }
      ]
    },
    '8': {
      title: 'Q8: The Precedent Engine: Most Frequently Cited Case Laws',
      description: 'Ranks precedent cases by the frequency with which they are cited across trials.',
      sql: `
        SELECT cc.Cited_Precedent_Case_ID, c.Title AS Precedent_Name, 
               COUNT(cc.Citation_ID) AS Times_Cited
        FROM CASE_CITATION cc
        JOIN \`CASE\` c ON cc.Cited_Precedent_Case_ID = c.Case_ID
        GROUP BY cc.Cited_Precedent_Case_ID, c.Title
        ORDER BY Times_Cited DESC;
      `,
      fallback: () => [
        { Cited_Precedent_Case_ID: 'CASE_900', Precedent_Name: 'State vs. Historic Fraud', Times_Cited: 1 }
      ]
    },
    '9': {
      title: 'Q9: Legal Taxonomy & Tag Explorer',
      description: 'Retrieves cases linked to specific legal tags like Corporate Fraud.',
      sql: `
        SELECT c.Case_ID, c.Title, pt.Keyword
        FROM \`CASE\` c
        JOIN CASE_TAG_MAPPING ctm ON c.Case_ID = ctm.Case_ID
        JOIN PRECEDENT_TAG pt ON ctm.Tag_ID = pt.Tag_ID
        WHERE pt.Keyword = 'Corporate Fraud';
      `,
      fallback: () => [
        { Case_ID: 'CASE_900', Title: 'State vs. Historic Fraud', Keyword: 'Corporate Fraud' },
        { Case_ID: 'CASE_1001', Title: 'State of TN vs. Ram', Keyword: 'Corporate Fraud' }
      ]
    },
    '10': {
      title: 'Q10: Cross-Module Master Docket Integration',
      description: 'Comprehensive 6-way join across Courts, Cases, Charges, Hearings & Judgments.',
      sql: `
        SELECT 
            ct.Court_Name,
            c.Case_ID,
            c.Title,
            GROUP_CONCAT(DISTINCT sc.Section_Name SEPARATOR ' | ') AS Applied_Charges,
            MAX(h.Hearing_Timestamp) AS Last_Hearing_Date,
            COALESCE(j.Verdict_Date, 'No Verdict') AS Judgment_Status
        FROM \`CASE\` c
        JOIN COURT ct ON c.Court_ID = ct.Court_ID
        LEFT JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
        LEFT JOIN DOCKET_CHARGE_SHEET dcs ON cc.Case_ID = dcs.Criminal_Case_ID
        LEFT JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
        LEFT JOIN HEARING h ON c.Case_ID = h.Case_ID
        LEFT JOIN JUDGMENT j ON c.Case_ID = j.Case_ID
        GROUP BY ct.Court_Name, c.Case_ID, c.Title, j.Verdict_Date;
      `,
      fallback: () => [
        { Court_Name: 'Chennai District Court', Case_ID: 'CASE_900', Title: 'State vs. Historic Fraud', Applied_Charges: 'Cheating and Dishonesty', Last_Hearing_Date: '2020-12-01 10:00:00', Judgment_Status: '2020-12-15' },
        { Court_Name: 'Chennai District Court', Case_ID: 'CASE_1001', Title: 'State of TN vs. Ram', Applied_Charges: 'Cheating and Dishonesty', Last_Hearing_Date: '2025-02-15 11:30:00', Judgment_Status: 'No Verdict' },
        { Court_Name: 'Madras High Court', Case_ID: 'CASE_2001', Title: 'Ram vs. State of TN (Appeal)', Applied_Charges: 'None', Last_Hearing_Date: '2026-04-10 14:00:00', Judgment_Status: 'No Verdict' },
        { Court_Name: 'Madras High Court', Case_ID: 'CASE_3001', Title: 'TechCorp vs. Ram', Applied_Charges: 'None', Last_Hearing_Date: 'None', Judgment_Status: 'No Verdict' }
      ]
    },
    '11': {
      title: 'Q11: Stalled Docket Detection for Inactive Trials',
      description: 'Identifies pending trials with no proceedings or inactive dockets for > 90 days.',
      sql: `
        SELECT c.Case_ID, c.Title, c.Filing_Date, ct.Court_Name,
               MAX(h.Hearing_Timestamp) AS Last_Hearing,
               DATEDIFF(CURRENT_DATE(), COALESCE(MAX(h.Hearing_Timestamp), c.Filing_Date)) AS Days_Inactive
        FROM \`CASE\` c
        JOIN COURT ct ON c.Court_ID = ct.Court_ID
        LEFT JOIN HEARING h ON c.Case_ID = h.Case_ID
        WHERE c.Status = 'Pending'
        GROUP BY c.Case_ID, c.Title, c.Filing_Date, ct.Court_Name
        ORDER BY Days_Inactive DESC;
      `,
      fallback: () => [
        { Case_ID: 'CASE_1001', Title: 'State of TN vs. Ram', Filing_Date: '2025-01-10', Court_Name: 'Chennai District Court', Last_Hearing: '2025-02-15 11:30:00', Days_Inactive: 604 },
        { Case_ID: 'CASE_3001', Title: 'TechCorp vs. Ram', Filing_Date: '2026-05-01', Court_Name: 'Madras High Court', Last_Hearing: null, Days_Inactive: 163 }
      ]
    },
    '12': {
      title: 'Q12: Statistical Bail Outlier Analysis',
      description: 'Detects bail amounts placed significantly higher than average benchmark bail values.',
      sql: `
        SELECT cc.Case_ID, c.Title, cc.Bail_Amount, cc.Arresting_Agency,
               ROUND(stats.Avg_Bail, 2) AS Benchmark_Avg_Bail,
               ROUND(cc.Bail_Amount - stats.Avg_Bail, 2) AS Variance_Above_Avg
        FROM CRIMINAL_CASE cc
        JOIN \`CASE\` c ON cc.Case_ID = c.Case_ID
        CROSS JOIN (
            SELECT AVG(Bail_Amount) AS Avg_Bail FROM CRIMINAL_CASE WHERE Bail_Amount IS NOT NULL
        ) stats
        WHERE cc.Bail_Amount > stats.Avg_Bail
        ORDER BY cc.Bail_Amount DESC;
      `,
      fallback: () => [
        { Case_ID: 'CASE_2001', Title: 'Ram vs. State of TN (Appeal)', Bail_Amount: 100000.00, Arresting_Agency: 'Judicial Remand', Benchmark_Avg_Bail: 53333.33, Variance_Above_Avg: 46666.67 }
      ]
    },
    '13': {
      title: 'Q13: Judicial Clearance Rates across Individual Judges',
      description: 'Ranks judicial clearance percentage and case disposal metrics for sitting judges.',
      sql: `
        SELECT j.Judicial_ID, p.First_Name, p.Last_Name, ct.Court_Name,
               COUNT(DISTINCT hb.Case_ID) AS Total_Presided_Cases,
               COUNT(DISTINCT jg.Judgment_ID) AS Disposed_Decisions,
               ROUND(COUNT(DISTINCT jg.Judgment_ID) * 100.0 / NULLIF(COUNT(DISTINCT hb.Case_ID), 0), 1) AS Clearance_Percentage
        FROM JUDGE j
        JOIN PERSON p ON j.Entity_ID = p.Entity_ID
        LEFT JOIN COURT ct ON j.Current_Court_ID = ct.Court_ID
        LEFT JOIN HEARING_BENCH hb ON j.Entity_ID = hb.Judge_ID
        LEFT JOIN JUDGMENT jg ON hb.Case_ID = jg.Case_ID
        GROUP BY j.Judicial_ID, p.First_Name, p.Last_Name, ct.Court_Name
        ORDER BY Total_Presided_Cases DESC;
      `,
      fallback: () => [
        { Judicial_ID: 'JUDGE-TN-401', First_Name: 'Krishna', Last_Name: 'Iyer', Court_Name: 'Chennai District Court', Total_Presided_Cases: 2, Disposed_Decisions: 1, Clearance_Percentage: 50.0 },
        { Judicial_ID: 'JUDGE-TN-882', First_Name: 'Shankar', Last_Name: 'Mahadevan', Court_Name: 'Madras High Court', Total_Presided_Cases: 1, Disposed_Decisions: 0, Clearance_Percentage: 0.0 }
      ]
    },
    '14': {
      title: 'Q14: Procedural Bottlenecks: Repeated Hearings without Decree',
      description: 'Highlights unresolved trials undergoing multiple hearing iterations without decree.',
      sql: `
        SELECT c.Case_ID, c.Title, c.Status, COUNT(h.Hearing_Timestamp) AS Hearing_Count,
               MIN(h.Hearing_Timestamp) AS First_Hearing,
               MAX(h.Hearing_Timestamp) AS Latest_Hearing
        FROM \`CASE\` c
        JOIN HEARING h ON c.Case_ID = h.Case_ID
        LEFT JOIN JUDGMENT j ON c.Case_ID = j.Case_ID
        WHERE j.Judgment_ID IS NULL
        GROUP BY c.Case_ID, c.Title, c.Status
        ORDER BY Hearing_Count DESC;
      `,
      fallback: () => [
        { Case_ID: 'CASE_1001', Title: 'State of TN vs. Ram', Status: 'Pending', Hearing_Count: 1, First_Hearing: '2025-02-15 11:30:00', Latest_Hearing: '2025-02-15 11:30:00' },
        { Case_ID: 'CASE_2001', Title: 'Ram vs. State of TN (Appeal)', Status: 'Pending', Hearing_Count: 1, First_Hearing: '2026-04-10 14:00:00', Latest_Hearing: '2026-04-10 14:00:00' }
      ]
    },
    '15': {
      title: 'Q15: Specialty-Specific Lawyer Ranking using Window Functions',
      description: 'Uses DENSE_RANK() window function to rank lawyers within legal specializations.',
      sql: `
        SELECT l.License_No, p.First_Name, p.Last_Name, l.Specialization, l.Firm_Name,
               COUNT(DISTINCT cc.Party_ID) AS Represented_Clients,
               COUNT(DISTINCT cp.Case_ID) AS Total_Dockets,
               DENSE_RANK() OVER (PARTITION BY l.Specialization ORDER BY COUNT(DISTINCT cp.Case_ID) DESC) AS Specialization_Rank
        FROM LAWYER l
        JOIN PERSON p ON l.Entity_ID = p.Entity_ID
        LEFT JOIN CASE_COUNSEL cc ON l.Entity_ID = cc.Lawyer_ID
        LEFT JOIN CASE_PARTY cp ON cc.Party_ID = cp.Party_ID
        GROUP BY l.License_No, p.First_Name, p.Last_Name, l.Specialization, l.Firm_Name
        ORDER BY l.Specialization, Specialization_Rank;
      `,
      fallback: () => [
        { License_No: 'BAR-TN-2015', First_Name: 'Priya', Last_Name: 'Deshmukh', Specialization: 'Civil Litigation', Firm_Name: 'Deshmukh Legal', Represented_Clients: 1, Total_Dockets: 1, Specialization_Rank: 1 },
        { License_No: 'BAR-TN-2005', First_Name: 'Kamal', Last_Name: 'Hassan', Specialization: 'Criminal & Corporate Defense', Firm_Name: 'Kamal & Associates', Represented_Clients: 2, Total_Dockets: 2, Specialization_Rank: 1 }
      ]
    }
  };

  const q = queries[queryId];
  if (!q) {
    return res.status(404).json({ error: `Query Q${queryId} not recognized. Supported: Q1 - Q15.` });
  }

  try {
    const live = await runQuery(q.sql);
    if (live) {
      return res.json({
        id: queryId,
        title: q.title,
        description: q.description,
        source: 'MySQL Database Engine',
        data: live.data
      });
    }
  } catch (err) {
    console.warn(`Query ${queryId} MySQL execution notice:`, err.message);
  }

  // Fallback to computed memory results
  const data = q.fallback();
  res.json({
    id: queryId,
    title: q.title,
    description: q.description,
    source: 'Demonstration Engine (Seed Fallback)',
    data
  });
});

// -------------------------------------------------------------
// TRANSACTIONAL OPERATIONS & STORED PROCEDURE INVOCATIONS
// -------------------------------------------------------------

// Register Criminal Case (Atomic Stored Procedure: Register_Criminal_Case)
app.post('/api/cases/criminal', async (req, res) => {
  const { Case_ID, Court_ID, Parent_Case_ID, Title, Filing_Date, FIR_Or_Complaint_No, Bail_Amount, Arresting_Agency } = req.body;

  if (!Case_ID || !Court_ID || !Title || !Filing_Date) {
    return res.status(400).json({ error: 'Missing mandatory fields: Case_ID, Court_ID, Title, Filing_Date are required.' });
  }

  try {
    const status = getStatus();
    if (status.connected) {
      await executeQuery(
        `CALL Register_Criminal_Case(?, ?, ?, ?, ?, ?, ?, ?);`,
        [Case_ID, Court_ID, Parent_Case_ID || null, Title, Filing_Date, FIR_Or_Complaint_No || null, Bail_Amount || 0, Arresting_Agency || null]
      );
      return res.status(201).json({ success: true, message: `Criminal case ${Case_ID} registered atomically via Stored Procedure.` });
    }
  } catch (err) {
    return res.status(400).json({ error: err.sqlMessage || err.message });
  }

  // Memory fallback
  if (memDb.cases.find(c => c.Case_ID === Case_ID)) {
    return res.status(400).json({ error: `Primary Key Violation: Case ${Case_ID} already exists.` });
  }

  memDb.cases.push({
    Case_ID,
    Court_ID,
    Parent_Case_ID: Parent_Case_ID || null,
    Title,
    Filing_Date,
    Status: 'Pending'
  });
  memDb.criminalCases.push({
    Case_ID,
    FIR_Or_Complaint_No: FIR_Or_Complaint_No || null,
    Bail_Amount: parseFloat(Bail_Amount) || 0,
    Arresting_Agency: Arresting_Agency || null
  });

  res.status(201).json({ success: true, message: `Criminal case ${Case_ID} registered successfully.`, mode: 'fallback' });
});

// Register Civil Case (Atomic Stored Procedure: Register_Civil_Case)
app.post('/api/cases/civil', async (req, res) => {
  const { Case_ID, Court_ID, Parent_Case_ID, Title, Filing_Date, Dispute_Value, Civil_Case_Type } = req.body;

  if (!Case_ID || !Court_ID || !Title || !Filing_Date) {
    return res.status(400).json({ error: 'Missing mandatory fields: Case_ID, Court_ID, Title, Filing_Date are required.' });
  }

  try {
    const status = getStatus();
    if (status.connected) {
      await executeQuery(
        `CALL Register_Civil_Case(?, ?, ?, ?, ?, ?, ?);`,
        [Case_ID, Court_ID, Parent_Case_ID || null, Title, Filing_Date, Dispute_Value || 0, Civil_Case_Type || 'Commercial Dispute']
      );
      return res.status(201).json({ success: true, message: `Civil case ${Case_ID} registered atomically via Stored Procedure.` });
    }
  } catch (err) {
    return res.status(400).json({ error: err.sqlMessage || err.message });
  }

  // Memory fallback
  if (memDb.cases.find(c => c.Case_ID === Case_ID)) {
    return res.status(400).json({ error: `Primary Key Violation: Case ${Case_ID} already exists.` });
  }

  memDb.cases.push({
    Case_ID,
    Court_ID,
    Parent_Case_ID: Parent_Case_ID || null,
    Title,
    Filing_Date,
    Status: 'Pending'
  });
  memDb.civilCases.push({
    Case_ID,
    Dispute_Value: parseFloat(Dispute_Value) || 0,
    Civil_Case_Type: Civil_Case_Type || 'Commercial Dispute'
  });

  res.status(201).json({ success: true, message: `Civil case ${Case_ID} registered successfully.`, mode: 'fallback' });
});

// Schedule Hearing (Enforces lifecycle check against Closed cases)
app.post('/api/hearings', async (req, res) => {
  const { Case_ID, Hearing_Timestamp, Summary_Notes, Judge_ID, Bench_Role } = req.body;

  if (!Case_ID || !Hearing_Timestamp) {
    return res.status(400).json({ error: 'Case_ID and Hearing_Timestamp are required.' });
  }

  try {
    const status = getStatus();
    if (status.connected) {
      const benchId = `BNCH_${Date.now().toString().slice(-4)}`;
      await executeQuery(
        `CALL Schedule_Hearing(?, ?, ?, ?, ?, ?);`,
        [Case_ID, Hearing_Timestamp, Summary_Notes || 'Proceedings Scheduled', benchId, Judge_ID || null, Bench_Role || 'Single Judge']
      );
      return res.status(201).json({ success: true, message: `Hearing scheduled with Bench assignment for Case ${Case_ID}.` });
    }
  } catch (err) {
    return res.status(400).json({ error: err.sqlMessage || err.message });
  }

  // Memory fallback with lifecycle check
  const targetCase = memDb.cases.find(c => c.Case_ID === Case_ID);
  if (!targetCase) {
    return res.status(404).json({ error: `Target Case ${Case_ID} not found in court dockets.` });
  }
  if (targetCase.Status === 'Closed') {
    return res.status(400).json({ error: 'Lifecycle Violation: Cannot schedule a hearing for a Closed case.' });
  }

  memDb.hearings.push({
    Case_ID,
    Hearing_Timestamp,
    Summary_Notes: Summary_Notes || 'Proceedings Scheduled'
  });

  if (Judge_ID) {
    memDb.hearingBenches.push({
      Bench_ID: `BNCH_${Date.now().toString().slice(-4)}`,
      Judge_ID,
      Case_ID,
      Hearing_Timestamp,
      Bench_Role: Bench_Role || 'Single Judge'
    });
  }

  res.status(201).json({ success: true, message: `Hearing successfully scheduled for ${Case_ID}.`, mode: 'fallback' });
});

// Record Judgment (Enforces chronological constraint, triggers case status = Closed)
app.post('/api/judgments', async (req, res) => {
  const { Judgment_ID, Case_ID, Verdict_Date, Judgment_Text } = req.body;

  if (!Judgment_ID || !Case_ID || !Verdict_Date || !Judgment_Text) {
    return res.status(400).json({ error: 'Judgment_ID, Case_ID, Verdict_Date, and Judgment_Text are mandatory.' });
  }

  try {
    const status = getStatus();
    if (status.connected) {
      await executeQuery(
        `CALL Record_Judgment(?, ?, ?, ?);`,
        [Judgment_ID, Case_ID, Verdict_Date, Judgment_Text]
      );
      return res.status(201).json({ success: true, message: `Judgment ${Judgment_ID} recorded. Case status transitioned to Closed via Trigger.` });
    }
  } catch (err) {
    return res.status(400).json({ error: err.sqlMessage || err.message });
  }

  // Memory fallback
  const targetCase = memDb.cases.find(c => c.Case_ID === Case_ID);
  if (!targetCase) {
    return res.status(404).json({ error: `Target Case ${Case_ID} not found.` });
  }

  if (new Date(Verdict_Date) < new Date(targetCase.Filing_Date)) {
    return res.status(400).json({ error: 'Chronology Violation: Verdict date cannot precede case filing date.' });
  }

  memDb.judgments.push({
    Judgment_ID,
    Case_ID,
    Verdict_Date,
    Judgment_Text
  });
  // Auto-close trigger behavior
  targetCase.Status = 'Closed';

  res.status(201).json({ success: true, message: `Judgment recorded. Case ${Case_ID} status marked Closed.`, mode: 'fallback' });
});

// Assign Counsel to Party (Stored Procedure: Assign_Counsel_To_Party)
app.post('/api/counsel/assign', async (req, res) => {
  const { Counsel_ID, Lawyer_ID, Party_ID, Lead_Counsel_Flag } = req.body;

  if (!Counsel_ID || !Lawyer_ID || !Party_ID) {
    return res.status(400).json({ error: 'Counsel_ID, Lawyer_ID, and Party_ID are required.' });
  }

  try {
    const status = getStatus();
    if (status.connected) {
      await executeQuery(
        `CALL Assign_Counsel_To_Party(?, ?, ?, ?);`,
        [Counsel_ID, Lawyer_ID, Party_ID, Lead_Counsel_Flag ? 1 : 0]
      );
      return res.status(201).json({ success: true, message: `Counsel ${Lawyer_ID} assigned to litigant ${Party_ID}.` });
    }
  } catch (err) {
    return res.status(400).json({ error: err.sqlMessage || err.message });
  }

  // Memory fallback with verification
  const lawyer = memDb.lawyers.find(l => l.Entity_ID === Lawyer_ID);
  if (!lawyer) {
    return res.status(400).json({ error: 'Validation Error: Entity_ID is not a registered Lawyer.' });
  }
  const party = memDb.caseParties.find(p => p.Party_ID === Party_ID);
  if (!party) {
    return res.status(400).json({ error: 'Validation Error: Party_ID does not exist.' });
  }

  memDb.caseCounsel.push({
    Counsel_ID,
    Lawyer_ID,
    Party_ID,
    Lead_Counsel_Flag: Lead_Counsel_Flag ? 1 : 0
  });

  res.status(201).json({ success: true, message: `Counsel assigned to Party ${Party_ID}.`, mode: 'fallback' });
});

// Cite Precedent (Stored Procedure: Cite_Precedent)
app.post('/api/precedents/cite', async (req, res) => {
  const { Citation_ID, Citing_Case_ID, Cited_Precedent_Case_ID, Relevance_Note } = req.body;

  if (!Citation_ID || !Citing_Case_ID || !Cited_Precedent_Case_ID) {
    return res.status(400).json({ error: 'Citation_ID, Citing_Case_ID, and Cited_Precedent_Case_ID are required.' });
  }

  if (Citing_Case_ID === Cited_Precedent_Case_ID) {
    return res.status(400).json({ error: 'Validation Error: A case cannot cite itself as precedent.' });
  }

  try {
    const status = getStatus();
    if (status.connected) {
      await executeQuery(
        `CALL Cite_Precedent(?, ?, ?, ?);`,
        [Citation_ID, Citing_Case_ID, Cited_Precedent_Case_ID, Relevance_Note || 'Direct precedent cited']
      );
      return res.status(201).json({ success: true, message: `Precedent ${Cited_Precedent_Case_ID} cited in Case ${Citing_Case_ID}.` });
    }
  } catch (err) {
    return res.status(400).json({ error: err.sqlMessage || err.message });
  }

  memDb.citations.push({
    Citation_ID,
    Citing_Case_ID,
    Cited_Precedent_Case_ID,
    Relevance_Note: Relevance_Note || 'Direct precedent cited'
  });

  res.status(201).json({ success: true, message: `Citation ${Citation_ID} linked successfully.`, mode: 'fallback' });
});

// -------------------------------------------------------------
// GRANULAR DELETION OPERATIONS (CASCADING & SCHEMA INTEGRITY)
// -------------------------------------------------------------

// Delete Case (Cascades to hearings, judgments, criminal/civil subclasses, charges, counsel)
app.delete('/api/cases/:id', async (req, res) => {
  const caseId = req.params.id;
  try {
    const status = getStatus();
    if (status.connected) {
      await executeQuery(`DELETE FROM \`CASE\` WHERE Case_ID = ?;`, [caseId]);
      return res.json({ success: true, message: `Case ${caseId} deleted with full cascading clean-up.` });
    }
  } catch (err) {
    return res.status(400).json({ error: err.sqlMessage || err.message });
  }

  // Memory cascade deletion
  memDb.cases = memDb.cases.filter(c => c.Case_ID !== caseId);
  memDb.criminalCases = memDb.criminalCases.filter(c => c.Case_ID !== caseId);
  memDb.civilCases = memDb.civilCases.filter(c => c.Case_ID !== caseId);
  memDb.hearings = memDb.hearings.filter(h => h.Case_ID !== caseId);
  memDb.hearingBenches = memDb.hearingBenches.filter(hb => hb.Case_ID !== caseId);
  memDb.judgments = memDb.judgments.filter(j => j.Case_ID !== caseId);
  memDb.citations = memDb.citations.filter(cit => cit.Citing_Case_ID !== caseId && cit.Cited_Precedent_Case_ID !== caseId);

  res.json({ success: true, message: `Case ${caseId} purged with cascading integrity preserved.`, mode: 'fallback' });
});

// Cancel Hearing
app.delete('/api/hearings/:caseId/:timestamp', async (req, res) => {
  const { caseId, timestamp } = req.params;
  try {
    const status = getStatus();
    if (status.connected) {
      await executeQuery(`DELETE FROM HEARING WHERE Case_ID = ? AND Hearing_Timestamp = ?;`, [caseId, timestamp]);
      return res.json({ success: true, message: `Hearing session on ${timestamp} cancelled.` });
    }
  } catch (err) {
    return res.status(400).json({ error: err.sqlMessage || err.message });
  }

  memDb.hearings = memDb.hearings.filter(h => !(h.Case_ID === caseId && h.Hearing_Timestamp === timestamp));
  memDb.hearingBenches = memDb.hearingBenches.filter(b => !(b.Case_ID === caseId && b.Hearing_Timestamp === timestamp));

  res.json({ success: true, message: `Hearing cancelled for Case ${caseId}.`, mode: 'fallback' });
});

// Drop Charge from Docket
app.delete('/api/charges/:id', async (req, res) => {
  const chargeSheetId = req.params.id;
  try {
    const status = getStatus();
    if (status.connected) {
      await executeQuery(`DELETE FROM DOCKET_CHARGE_SHEET WHERE Charge_Sheet_ID = ?;`, [chargeSheetId]);
      return res.json({ success: true, message: `Charge ${chargeSheetId} dropped from docket.` });
    }
  } catch (err) {
    return res.status(400).json({ error: err.sqlMessage || err.message });
  }

  memDb.chargeSheets = memDb.chargeSheets.filter(cs => cs.Charge_Sheet_ID !== chargeSheetId);
  res.json({ success: true, message: `Charge sheet ${chargeSheetId} dropped.`, mode: 'fallback' });
});

// Withdraw Counsel Assignment
app.delete('/api/counsel/:id', async (req, res) => {
  const counselId = req.params.id;
  try {
    const status = getStatus();
    if (status.connected) {
      await executeQuery(`DELETE FROM CASE_COUNSEL WHERE Counsel_ID = ?;`, [counselId]);
      return res.json({ success: true, message: `Counsel assignment ${counselId} withdrawn.` });
    }
  } catch (err) {
    return res.status(400).json({ error: err.sqlMessage || err.message });
  }

  memDb.caseCounsel = memDb.caseCounsel.filter(c => c.Counsel_ID !== counselId);
  res.json({ success: true, message: `Counsel representation ${counselId} withdrawn.`, mode: 'fallback' });
});

// Strike Precedent Citation
app.delete('/api/citations/:id', async (req, res) => {
  const citationId = req.params.id;
  try {
    const status = getStatus();
    if (status.connected) {
      await executeQuery(`DELETE FROM CASE_CITATION WHERE Citation_ID = ?;`, [citationId]);
      return res.json({ success: true, message: `Citation ${citationId} struck from record.` });
    }
  } catch (err) {
    return res.status(400).json({ error: err.sqlMessage || err.message });
  }

  memDb.citations = memDb.citations.filter(c => c.Citation_ID !== citationId);
  res.json({ success: true, message: `Citation ${citationId} struck.`, mode: 'fallback' });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`[Express Backend] Judicial API Server running on http://localhost:${PORT}`);
});
