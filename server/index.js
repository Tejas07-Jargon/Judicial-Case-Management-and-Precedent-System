import express from 'express';
import cors from 'cors';
import pool from './db.js';

const app = express();
app.use(cors({ origin: 'http://localhost:8443' })); 
app.use(express.json());

// Guided ADD Route: Triggers the PL/SQL Procedure
app.post('/api/cases/register', async (req, res) => {
    const { case_id, court_id, title, date, fir, bail, agency } = req.body;
    try {
        await pool.query(
            'CALL Register_Criminal_Case(?, ?, NULL, ?, ?, ?, ?, ?)',
            [case_id, court_id, title, date, fir, bail, agency]
        );
        res.json({ success: true, message: 'Transaction Successful: Case & Subclass registered via PL/SQL.' });
    } catch (error) {
        // Explicitly passes SQL trigger/constraint errors back to the React UI
        res.status(400).json({ error: error.sqlMessage || 'Database validation failed.' });
    }
});

// FETCH Route: Serves the 10 specific DA2 Queries
app.get('/api/queries/:id', async (req, res) => {
    const queryMap = {
        1: `SELECT ct.Tier_Level, ct.Court_Name, COUNT(c.Case_ID) AS Total_Cases, SUM(CASE WHEN c.Status = 'Pending' THEN 1 ELSE 0 END) AS Pending_Cases FROM COURT ct LEFT JOIN \`CASE\` c ON ct.Court_ID = c.Court_ID GROUP BY ct.Tier_Level, ct.Court_Name;`,
        2: `SELECT l.License_No, p.First_Name, p.Last_Name, l.Specialization, c.Title AS Case_Name, cp.Party_Role FROM LAWYER l JOIN PERSON p ON l.Entity_ID = p.Entity_ID JOIN CASE_COUNSEL cc ON l.Entity_ID = cc.Lawyer_ID JOIN CASE_PARTY cp ON cc.Party_ID = cp.Party_ID JOIN \`CASE\` c ON cp.Case_ID = c.Case_ID;`,
        3: `WITH RECURSIVE Appellate_Chain AS ( SELECT Case_ID, Parent_Case_ID, Title, Court_ID, 1 AS Appeal_Level FROM \`CASE\` WHERE Case_ID = 'CASE_2001' UNION ALL SELECT c.Case_ID, c.Parent_Case_ID, c.Title, c.Court_ID, ac.Appeal_Level + 1 FROM \`CASE\` c INNER JOIN Appellate_Chain ac ON ac.Parent_Case_ID = c.Case_ID ) SELECT ac.Appeal_Level, ac.Case_ID, ac.Title, ct.Court_Name, ct.Tier_Level FROM Appellate_Chain ac JOIN COURT ct ON ac.Court_ID = ct.Court_ID ORDER BY ac.Appeal_Level DESC;`,
        4: `SELECT h.Hearing_Timestamp, h.Summary_Notes, hb.Bench_Role, p.First_Name AS Judge_First, p.Last_Name AS Judge_Last FROM HEARING h JOIN HEARING_BENCH hb ON h.Case_ID = hb.Case_ID AND h.Hearing_Timestamp = hb.Hearing_Timestamp JOIN JUDGE j ON hb.Judge_ID = j.Entity_ID JOIN PERSON p ON j.Entity_ID = p.Entity_ID WHERE h.Case_ID = 'CASE_1001' ORDER BY h.Hearing_Timestamp ASC;`,
        5: `SELECT c.Case_ID, c.Title, c.Filing_Date, j.Verdict_Date, DATEDIFF(j.Verdict_Date, c.Filing_Date) AS Days_To_Resolution FROM \`CASE\` c JOIN JUDGMENT j ON c.Case_ID = j.Case_ID WHERE c.Status = 'Closed';`,
        6: `SELECT c.Case_ID, c.Title, c.Filing_Date FROM \`CASE\` c WHERE c.Status = 'Pending' AND c.Case_ID IN (SELECT DISTINCT Case_ID FROM HEARING);`,
        7: `SELECT p.First_Name, p.Last_Name, dcs.Charge_Code, sc.Section_Name, COUNT(dcs.Charge_Sheet_ID) AS Times_Charged FROM DOCKET_CHARGE_SHEET dcs JOIN PERSON p ON dcs.Defendant_ID = p.Entity_ID JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code GROUP BY dcs.Defendant_ID, dcs.Charge_Code, sc.Section_Name HAVING COUNT(dcs.Charge_Sheet_ID) > 1;`,
        8: `SELECT cc.Cited_Precedent_Case_ID, c.Title AS Precedent_Name, COUNT(cc.Citation_ID) AS Times_Cited FROM CASE_CITATION cc JOIN \`CASE\` c ON cc.Cited_Precedent_Case_ID = c.Case_ID GROUP BY cc.Cited_Precedent_Case_ID, c.Title ORDER BY Times_Cited DESC;`,
        9: `SELECT c.Case_ID, c.Title, pt.Keyword FROM \`CASE\` c JOIN CASE_TAG_MAPPING ctm ON c.Case_ID = ctm.Case_ID JOIN PRECEDENT_TAG pt ON ctm.Tag_ID = pt.Tag_ID WHERE pt.Keyword = 'Corporate Fraud';`,
        10: `SELECT ct.Court_Name, c.Case_ID, c.Title, GROUP_CONCAT(DISTINCT sc.Section_Name SEPARATOR ' | ') AS Applied_Charges, MAX(h.Hearing_Timestamp) AS Last_Hearing_Date, COALESCE(j.Verdict_Date, 'No Verdict') AS Judgment_Status FROM \`CASE\` c JOIN COURT ct ON c.Court_ID = ct.Court_ID LEFT JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID LEFT JOIN DOCKET_CHARGE_SHEET dcs ON cc.Case_ID = dcs.Criminal_Case_ID LEFT JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code LEFT JOIN HEARING h ON c.Case_ID = h.Case_ID LEFT JOIN JUDGMENT j ON c.Case_ID = j.Case_ID GROUP BY ct.Court_Name, c.Case_ID, c.Title, j.Verdict_Date;`,
        11: `SELECT c.Case_ID, c.Title, c.Filing_Date, 
              MAX(h.Hearing_Timestamp) as Last_Hearing, 
              DATEDIFF(CURRENT_DATE, MAX(h.Hearing_Timestamp)) as Days_Since_Last_Hearing
       FROM \`CASE\` c
       LEFT JOIN HEARING h ON c.Case_ID = h.Case_ID
       WHERE c.Status = 'Pending'
       GROUP BY c.Case_ID, c.Title, c.Filing_Date
       HAVING Last_Hearing < DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR) OR Last_Hearing IS NULL
       ORDER BY Days_Since_Last_Hearing DESC;`,
       12: `SELECT cc.Case_ID, c.Title, cc.Arresting_Agency, cc.Bail_Amount
       FROM CRIMINAL_CASE cc
       JOIN \`CASE\` c ON cc.Case_ID = c.Case_ID
       WHERE cc.Bail_Amount > (
           SELECT AVG(Bail_Amount)
           FROM CRIMINAL_CASE sub_cc
           WHERE sub_cc.Arresting_Agency = cc.Arresting_Agency
       )
       ORDER BY cc.Bail_Amount DESC;`,
       13: `SELECT j.Entity_ID AS Judge_ID, CONCAT(p.First_Name, ' ', p.Last_Name) AS Judge_Name,
              COUNT(DISTINCT hb.Case_ID) AS Total_Cases_Handled,
              SUM(CASE WHEN c.Status = 'Closed' THEN 1 ELSE 0 END) AS Cases_Resolved,
              ROUND((SUM(CASE WHEN c.Status = 'Closed' THEN 1 ELSE 0 END) / COUNT(DISTINCT hb.Case_ID)) * 100, 2) AS Clearance_Rate_Pct
       FROM JUDGE j
       JOIN PERSON p ON j.Entity_ID = p.Entity_ID
       JOIN HEARING_BENCH hb ON j.Entity_ID = hb.Judge_ID
       JOIN \`CASE\` c ON hb.Case_ID = c.Case_ID
       GROUP BY j.Entity_ID, p.First_Name, p.Last_Name
       ORDER BY Clearance_Rate_Pct DESC;`,
       14: `SELECT p.Entity_ID AS Litigant_ID, CONCAT(p.First_Name, ' ', p.Last_Name) AS Litigant_Name,
              COUNT(DISTINCT cp.Case_ID) AS Cases_Involved,
              COUNT(DISTINCT YEAR(c.Filing_Date)) AS Active_Years
       FROM PERSON p
       JOIN CASE_PARTY cp ON p.Entity_ID = cp.Entity_ID
       JOIN \`CASE\` c ON cp.Case_ID = c.Case_ID
       GROUP BY p.Entity_ID, p.First_Name, p.Last_Name
       HAVING Cases_Involved >= 2 
       ORDER BY Cases_Involved DESC;`,

      15: `SELECT l.Specialization, p.First_Name, p.Last_Name, COUNT(j.Case_ID) AS Resolved_Cases,
              RANK() OVER (PARTITION BY l.Specialization ORDER BY COUNT(j.Case_ID) DESC) AS Specialty_Rank
      FROM LAWYER l
      JOIN PERSON p ON l.Entity_ID = p.Entity_ID
      JOIN CASE_COUNSEL cc ON l.Entity_ID = cc.Lawyer_ID
      JOIN CASE_PARTY cp ON cc.Party_ID = cp.Party_ID
      JOIN JUDGMENT j ON cp.Case_ID = j.Case_ID
      GROUP BY l.Specialization, p.First_Name, p.Last_Name;`


    };
    
    try {
        const sql = queryMap[req.params.id];
        if (!sql) return res.status(404).json({ error: 'Query not found' });
        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.sqlMessage });
    }
});


app.post('/api/cases/civil/register', async (req, res) => {
  const { case_id, court_id, title, filing_date, claim_amount, dispute_category } = req.body;
  try {
    await pool.query('CALL Register_Civil_Case(?, ?, ?, ?, ?, ?)', 
      [case_id, court_id, title, filing_date, claim_amount, dispute_category]);
    res.json({ message: `Civil Case ${case_id} registered successfully` });
  } catch (error) {
    res.status(400).json({ error: error.sqlMessage || error.message });
  }
});


app.post('/api/hearings/schedule', async (req, res) => {
  const { bench_id, case_id, hearing_timestamp, summary_notes, judge_id } = req.body;
  try {
    await pool.query('CALL Schedule_Hearing_Session(?, ?, ?, ?, ?)',
      [bench_id, case_id, hearing_timestamp, summary_notes, judge_id]);
    res.json({ message: `Hearing session ${bench_id} scheduled successfully.` });
  } catch (error) {
    res.status(400).json({ error: error.sqlMessage || error.message });
  }
});


app.post('/api/judgments/record', async (req, res) => {
  const { judgment_id, case_id, verdict_date, judgment_text } = req.body;
  try {
    await pool.query('CALL Record_Final_Judgment(?, ?, ?, ?)', 
      [judgment_id, case_id, verdict_date, judgment_text]);
    res.json({ message: `Judgment ${judgment_id} recorded and case closed.` });
  } catch (error) {
    res.status(400).json({ error: error.sqlMessage || error.message });
  }
});



// Explicit UPDATE Route
app.put('/api/cases/update', async (req, res) => {
  const { case_id, new_title } = req.body;
  try {
    const [result] = await pool.query('UPDATE `CASE` SET Title = ? WHERE Case_ID = ?', [new_title, case_id]);
    if (result.affectedRows === 0) throw new Error('Case ID not found.');
    res.json({ message: `Case ${case_id} updated with new title.` });
  } catch (error) {
    res.status(400).json({ error: error.sqlMessage || error.message });
  }
});

// Explicit DELETE Route
app.delete('/api/cases/delete', async (req, res) => {
  const { case_id } = req.body;
  try {
    // ON DELETE CASCADE automatically clears CIVIL_CASE, CRIMINAL_CASE, HEARINGS, etc.
    const [result] = await pool.query('DELETE FROM `CASE` WHERE Case_ID = ?', [case_id]);
    if (result.affectedRows === 0) throw new Error('Case ID not found.');
    res.json({ message: `Case ${case_id} and all associated records permanently deleted.` });
  } catch (error) {
    res.status(400).json({ error: error.sqlMessage || error.message });
  }
});


// Feature 1: Assign Counsel Workflow
app.post('/api/counsel/assign', async (req, res) => {
  // Convert string 'true'/'false' from frontend to boolean 1/0 for MySQL
  const isLead = req.body.is_lead === 'true' ? 1 : 0;
  try {
    await pool.query('CALL Assign_Counsel_To_Party(?, ?, ?, ?)', 
      [req.body.counsel_id, req.body.lawyer_id, req.body.party_id, isLead]);
    res.json({ message: `Lawyer ${req.body.lawyer_id} assigned to party successfully.` });
  } catch (error) {
    res.status(400).json({ error: error.sqlMessage || error.message });
  }
});

// Feature 3: Precedent Engine Workflow
// Cite Precedent Workflow (Sanitized)
app.post('/api/cases/cite', async (req, res) => {
  const citationId = req.body.citation_id?.trim();
  const citingCase = req.body.citing_case?.trim();
  const citedCase = req.body.cited_case?.trim();
  const note = req.body.note?.trim();

  try {
    await pool.query('CALL Cite_Precedent(?, ?, ?, ?)', 
      [citationId, citingCase, citedCase, note]);
    res.json({ message: `Precedent link ${citationId} established.` });
  } catch (error) {
    res.status(400).json({ error: error.sqlMessage || error.message });
  }
});





// --- GRANULAR DELETE WORKFLOWS ---

// 1. Cancel a Scheduled Session
app.delete('/api/hearings/cancel', async (req, res) => {
  try {
    // Deleting from HEARING automatically cascades to remove the judge from HEARING_BENCH
    const [result] = await pool.query('DELETE FROM HEARING WHERE Case_ID = ? AND Hearing_Timestamp = ?', 
      [req.body.case_id, req.body.hearing_timestamp]);
    if (result.affectedRows === 0) throw new Error('Hearing session not found.');
    res.json({ message: `Hearing for Case ${req.body.case_id} cancelled successfully.` });
  } catch (error) {
    res.status(400).json({ error: error.sqlMessage || error.message });
  }
});

// 2. Withdraw Counsel
app.delete('/api/counsel/withdraw', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM CASE_COUNSEL WHERE Counsel_ID = ?', [req.body.counsel_id]);
    if (result.affectedRows === 0) throw new Error('Counsel Assignment ID not found.');
    res.json({ message: `Counsel assignment ${req.body.counsel_id} withdrawn.` });
  } catch (error) {
    res.status(400).json({ error: error.sqlMessage || error.message });
  }
});

// 3. Drop a Charge
app.delete('/api/charges/drop', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM DOCKET_CHARGE_SHEET WHERE Charge_Sheet_ID = ?', [req.body.charge_sheet_id]);
    if (result.affectedRows === 0) throw new Error('Charge Sheet ID not found.');
    res.json({ message: `Charge ${req.body.charge_sheet_id} dropped successfully.` });
  } catch (error) {
    res.status(400).json({ error: error.sqlMessage || error.message });
  }
});

// 4. Strike a Precedent
app.delete('/api/citations/strike', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM CASE_CITATION WHERE Citation_ID = ?', [req.body.citation_id]);
    if (result.affectedRows === 0) throw new Error('Citation ID not found.');
    res.json({ message: `Precedent citation ${req.body.citation_id} struck from record.` });
  } catch (error) {
    res.status(400).json({ error: error.sqlMessage || error.message });
  }
});




app.listen(3000, () => console.log('API live on port 3000'));