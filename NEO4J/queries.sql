-- placeholder for database name used
USE DBMS_DA2_CONCEPT;

-- =================================================================
-- MEMBER 1 QUERIES (COURTS, ENTITIES & HIERARCHY)
-- =================================================================

-- 1. Caseload Distribution by Court Tier
SELECT ct.Tier_Level, ct.Court_Name, COUNT(c.Case_ID) AS Total_Cases, 
       SUM(CASE WHEN c.Status = 'Pending' THEN 1 ELSE 0 END) AS Pending_Cases
FROM COURT ct
LEFT JOIN `CASE` c ON ct.Court_ID = c.Court_ID
GROUP BY ct.Tier_Level, ct.Court_Name;

-- 2. Complete Roster of Lawyers and their Active Client Representations
SELECT l.License_No, p.First_Name, p.Last_Name, l.Specialization, 
       c.Title AS Case_Name, cp.Party_Role, cc.Lead_Counsel_Flag
FROM LAWYER l
JOIN PERSON p ON l.Entity_ID = p.Entity_ID
JOIN CASE_COUNSEL cc ON l.Entity_ID = cc.Lawyer_ID
JOIN CASE_PARTY cp ON cc.Party_ID = cp.Party_ID
JOIN `CASE` c ON cp.Case_ID = c.Case_ID;

-- 3. Recursive Appellate Lineage (Tracking a case from Supreme/High down to Trial Court)
WITH RECURSIVE Appellate_Chain AS (
    SELECT Case_ID, Parent_Case_ID, Title, Court_ID, 1 AS Appeal_Level
    FROM `CASE` WHERE Case_ID = 'CASE_2001'
    UNION ALL
    SELECT c.Case_ID, c.Parent_Case_ID, c.Title, c.Court_ID, ac.Appeal_Level + 1
    FROM `CASE` c
    INNER JOIN Appellate_Chain ac ON ac.Parent_Case_ID = c.Case_ID
)
SELECT ac.Appeal_Level, ac.Case_ID, ac.Title, ct.Court_Name, ct.Tier_Level
FROM Appellate_Chain ac
JOIN COURT ct ON ac.Court_ID = ct.Court_ID
ORDER BY ac.Appeal_Level DESC;


-- =================================================================
-- MEMBER 2 QUERIES (HEARINGS, LIFECYCLE & JUDGMENTS)
-- =================================================================

-- 4. Complete Hearing History and Presiding Judges for a Specific Case
SELECT h.Hearing_Timestamp, h.Summary_Notes, hb.Bench_Role, 
       p.First_Name AS Judge_First_Name, p.Last_Name AS Judge_Last_Name
FROM HEARING h
JOIN HEARING_BENCH hb ON h.Case_ID = hb.Case_ID AND h.Hearing_Timestamp = hb.Hearing_Timestamp
JOIN JUDGE j ON hb.Judge_ID = j.Entity_ID
JOIN PERSON p ON j.Entity_ID = p.Entity_ID
WHERE h.Case_ID = 'CASE_1001'
ORDER BY h.Hearing_Timestamp ASC;

-- 5. Case Resolution Duration (Time taken from Filing to Final Judgment)
SELECT c.Case_ID, c.Title, c.Filing_Date, j.Verdict_Date,
       DATEDIFF(j.Verdict_Date, c.Filing_Date) AS Days_To_Resolution
FROM `CASE` c
JOIN JUDGMENT j ON c.Case_ID = j.Case_ID
WHERE c.Status = 'Closed';

-- 6. Pending Cases with Scheduled or Completed Hearings (Subquery filter)
SELECT c.Case_ID, c.Title, c.Filing_Date
FROM `CASE` c
WHERE c.Status = 'Pending' 
  AND c.Case_ID IN (SELECT DISTINCT Case_ID FROM HEARING);


-- =================================================================
-- MEMBER 3 QUERIES (CHARGES, DOUBLE JEOPARDY & PRECEDENTS)
-- =================================================================

-- 7. Double Jeopardy Risk Analysis (Defendants facing the same charge multiple times)
SELECT p.First_Name, p.Last_Name, dcs.Charge_Code, sc.Section_Name, 
       COUNT(dcs.Charge_Sheet_ID) AS Times_Charged
FROM DOCKET_CHARGE_SHEET dcs
JOIN PERSON p ON dcs.Defendant_ID = p.Entity_ID
JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
GROUP BY dcs.Defendant_ID, dcs.Charge_Code, sc.Section_Name
HAVING COUNT(dcs.Charge_Sheet_ID) > 1;

-- 8. The Precedent Engine: Most Frequently Cited Case Laws
SELECT cc.Cited_Precedent_Case_ID, c.Title AS Precedent_Name, 
       COUNT(cc.Citation_ID) AS Times_Cited
FROM CASE_CITATION cc
JOIN `CASE` c ON cc.Cited_Precedent_Case_ID = c.Case_ID
GROUP BY cc.Cited_Precedent_Case_ID, c.Title
ORDER BY Times_Cited DESC;

-- 9. Search Cases by Legal Taxonomy / Tag
SELECT c.Case_ID, c.Title, pt.Keyword
FROM `CASE` c
JOIN CASE_TAG_MAPPING ctm ON c.Case_ID = ctm.Case_ID
JOIN PRECEDENT_TAG pt ON ctm.Tag_ID = pt.Tag_ID
WHERE pt.Keyword = 'Corporate Fraud';


-- =================================================================
-- ULTIMATE CROSS-MODULE INTEGRATION QUERY (ALL 3 MEMBERS)
-- =================================================================

-- 10. The Master Docket: Joins Court Infrastructure, Case Details, Charges, and Judgments
SELECT 
    ct.Court_Name,
    c.Case_ID,
    c.Title,
    GROUP_CONCAT(DISTINCT sc.Section_Name SEPARATOR ' | ') AS Applied_Charges,
    MAX(h.Hearing_Timestamp) AS Last_Hearing_Date,
    COALESCE(j.Verdict_Date, 'No Verdict') AS Judgment_Status
FROM `CASE` c
JOIN COURT ct ON c.Court_ID = ct.Court_ID
LEFT JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
LEFT JOIN DOCKET_CHARGE_SHEET dcs ON cc.Case_ID = dcs.Criminal_Case_ID
LEFT JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
LEFT JOIN HEARING h ON c.Case_ID = h.Case_ID
LEFT JOIN JUDGMENT j ON c.Case_ID = j.Case_ID
GROUP BY ct.Court_Name, c.Case_ID, c.Title, j.Verdict_Date;
