# Judicial Case Management and Precedent System
## Comprehensive Database Architecture & DA2 Submission Report

<p align="center">
  <img src="assets/logo.png" alt="Judicial Case Management and Precedent System Logo" width="360" />
</p>

**Course:** Database Management Systems (DBMS) — Digital Assignment 2 (DA2)
**Project Title:** Judicial Case Management and Precedent System
**Lead Contributor (Member 3):** Tejas (`member3-tejas`)
**Shared Teammates:** Member 1 (Adithya), Member 2 (Aryan)
**Database Engine:** MySQL Server 8.0.46 (InnoDB Engine)
**Application Stack:** Node.js (v24), Express, TypeScript, React 19, Vite

---

## 1. Project Overview & Problem Statement

Modern judicial systems face severe structural challenges, including staggering case backlogs, fragmented proceeding dockets across tiered jurisdictional levels, inconsistent tracking of penal statutes, and the difficulty of rapidly discovering relevant, binding legal precedents. When defendants face concurrent charges across multiple courts or police jurisdictions arising from a single factual occurrence, courts risk inadvertent violations of constitutional and statutory protections against repeated jeopardy (e.g., Article 20(2) of the Constitution of India and Section 300 of the Code of Criminal Procedure).

The **Judicial Case Management and Precedent System** addresses these challenges by establishing a normalized, relational database infrastructure coupled with an analytical web application. It models the judicial lifecycle from initial incident reporting, statutory charge sheet filing, and bench hearings to formal judgment pronouncements, precedent citation lineage, and legal taxonomy classification.

---

## 2. Objectives & Scope

### 2.1. System Scope
1. **Jurisdictional Infrastructure:** Model court hierarchy (District Courts, High Courts, Supreme Court) and legal actors (Judges, Lawyers, Corporate Entities, Individual Persons).
2. **Case Lifecycle & Representation:** Maintain civil and criminal case dockets, parties, legal counsel assignments, and bench hearing schedules.
3. **Criminal Proceedings & Incidents (Member 3 Focus):** Track criminal complaints, FIRs, bail records, arresting agencies, statutory penal charges, and the factual incidents giving rise to them.
4. **Precedent Citation Network (Member 3 Focus):** Record formal judgment-to-judgment citations with legal treatments (*Followed*, *Distinguished*, *Overruled*), precedent citation frequency rankings, and subject-matter taxonomy tagging.
5. **Full-Stack Operational Interface:** Provide operational CRUD (Create, Read, Update, Delete) interfaces backed by ACID-compliant transactions, constraint enforcement, and error translations.

### 2.2. Modular Distribution Among Team Members
- **Member 1 (Adithya):** Legal actors (`LEGAL_ENTITY`, `PERSON`, `ORGANIZATION`), Court hierarchy (`COURT`), Judicial Officers (`JUDGE`, `LAWYER`), Case superclass (`` `CASE` ``), Party & Counsel representation (`CASE_PARTY`, `CASE_COUNSEL`).
- **Member 2 (Aryan):** Case lifecycle events, hearing benches (`HEARING`, `HEARING_BENCH`), and judicial judgments (`JUDGMENT`).
- **Member 3 (Tejas):** Specialized case subtypes (`CRIMINAL_CASE`, `CIVIL_CASE`), statutory charges (`STATUTE_CHARGE`), dedicated incident normalization (`INCIDENT`), multi-docket charge sheets (`DOCKET_CHARGE_SHEET`), formal precedent citations (`JUDGMENT_CITATION`), taxonomy tagging (`PRECEDENT_TAG`, `CASE_TAG_MAPPING`), and analytical review views.

---

## 3. Implemented Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION TIER (Frontend)                       │
│  React 19 + TypeScript + Vite | Running on http://localhost:8443        │
│  - Analytical Views: Case Dossier, Proceedings Search, Ranking, Review │
│  - CRUD Management: Incidents, Charge Sheets, Judgment Citations, Tags │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Reverse Proxy (Vite /api/v1 -> :5000)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       APPLICATION TIER (Backend)                       │
│  Node.js (v24) + Express + TypeScript | Running on port 5000           │
│  - Zod Request Body & Query Validation                                  │
│  - Global Error Handling (MySQL error translation: 1062, 1451, 1452)  │
│  - mysql2/promise Connection Pooling (max: 10 pooled connections)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Parameterized SQL & Stored Procedures
┌───────────────────────────────────▼────────────────────────────────────┐
│                        DATA TIER (Database Server)                     │
│  MySQL Server 8.0.46 (InnoDB Engine, utf8mb4)                          │
│  - Primary Schema: DBMS_DA2_CONCEPT                                    │
│  - Verified Isolated Test Schema: DBMS_DA2_TEST                        │
│  - 21 Base Tables | 3 Views | 4 Stored Procedures | 2 Functions        │
│  - 4 Triggers | Foreign Key Constraints (CASCADE / RESTRICT / SET NULL) │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Deliverables Inventory

The database implementation comprises **21 base tables**, **3 analytical views**, **4 stored procedures**, **2 stored functions**, and **4 triggers**.

### 4.1. Base Tables & Relational Schema (Post-Migration Test Schema)

The migrated test schema (`DBMS_DA2_TEST`) contains **21 base tables** with a verified total of **99 physical seed rows**:

| # | Table Name | Primary Key | Foreign Keys & Target References | Unique / Candidate Constraints | Verified Rows | Purpose |
|---|---|---|---|---|---|---|
| 1 | `LEGAL_ENTITY` | `Entity_ID` | None | None | 10 | Superclass entity for legal persons and corporations |
| 2 | `ORGANIZATION` | `Entity_ID` | `Entity_ID` → `LEGAL_ENTITY(Entity_ID)` [CASCADE] | `Registration_No` (UNIQUE) | 3 | Corporate bodies and institutions |
| 3 | `PERSON` | `Entity_ID` | `Entity_ID` → `LEGAL_ENTITY(Entity_ID)` [CASCADE] | `Aadhar_ID` (UNIQUE) | 7 | Natural individuals |
| 4 | `COURT` | `Court_ID` | None | None | 3 | Jurisdictional courts with tier levels |
| 5 | `JUDGE` | `Entity_ID` | `Entity_ID` → `PERSON`, `Current_Court_ID` → `COURT` [SET NULL] | `Judicial_ID` (UNIQUE) | 2 | Judicial officers assigned to benches |
| 6 | `LAWYER` | `Entity_ID` | `Entity_ID` → `PERSON` [CASCADE] | `License_No` (UNIQUE) | 2 | Advocates licensed to represent clients |
| 7 | `` `CASE` `` | `Case_ID` | `Court_ID` → `COURT`, `Parent_Case_ID` → `` `CASE` `` [SET NULL] | None | 8 | Superclass case docket supporting appellate lineage |
| 8 | `CRIMINAL_CASE` | `Case_ID` | `Case_ID` → `` `CASE`(Case_ID) `` [CASCADE] | None | 6 | Subclass storing FIRs, bail, arresting agencies |
| 9 | `CIVIL_CASE` | `Case_ID` | `Case_ID` → `` `CASE`(Case_ID) `` [CASCADE] | None | 2 | Subclass storing dispute valuations and suit types |
| 10 | `CASE_PARTY` | `Party_ID` | `Entity_ID` → `LEGAL_ENTITY`, `Case_ID` → `` `CASE` `` | `(Entity_ID, Case_ID, Party_Role)` | 11 | Links plaintiffs, petitioners, defendants to cases |
| 11 | `CASE_COUNSEL` | `Counsel_ID` | `Lawyer_ID` → `LAWYER`, `Party_ID` → `CASE_PARTY` | `(Lawyer_ID, Party_ID)` | 3 | Legal representation records with lead counsel flag |
| 12 | `HEARING` | `(Case_ID, Hearing_Timestamp)` | `Case_ID` → `` `CASE`(Case_ID) `` [CASCADE] | None | 3 | Scheduled and completed courtroom hearings |
| 13 | `HEARING_BENCH` | `Bench_ID` | `Judge_ID` → `JUDGE`, `(Case_ID, Hearing_Timestamp)` → `HEARING` [CASCADE] | None | 3 | Composition of presiding judges on a bench |
| 14 | `JUDGMENT` | `Judgment_ID` | `Case_ID` → `` `CASE`(Case_ID) `` [CASCADE] | `Case_ID` (UNIQUE) | 2 | Final decisions (1:1 optional with case) |
| 15 | `STATUTE_CHARGE` | `Charge_Code` | None | None | 6 | Catalog of penal sections and maximum sentences |
| 16 | `INCIDENT` | `Incident_ID` | None | None | 4 | Normalized factual occurrences (Date, Location, Desc) |
| 17 | `DOCKET_CHARGE_SHEET` | `Charge_Sheet_ID` | `Criminal_Case_ID` → `CRIMINAL_CASE`, `Defendant_ID` → `LEGAL_ENTITY`, `Charge_Code` → `STATUTE_CHARGE`, `Incident_ID` → `INCIDENT` [RESTRICT] | Indexed: `(Defendant_ID, Charge_Code, Incident_ID)` | 7 | Specific charge filings and recorded dispositions |
| 18 | `CASE_CITATION` | `Citation_ID` | `Citing_Case_ID` → `` `CASE` ``, `Cited_Precedent_Case_ID` → `` `CASE` `` | `(Citing_Case_ID, Cited_Precedent_Case_ID)` | 1 | Counsel precedent submissions in pleadings |
| 19 | `JUDGMENT_CITATION` | `Citation_ID` | `Citing_Judgment_ID` → `JUDGMENT`, `Cited_Judgment_ID` → `JUDGMENT` | `(Citing_Judgment_ID, Cited_Judgment_ID)` | 1 | Formal judgment-to-judgment legal precedent link |
| 20 | `PRECEDENT_TAG` | `Tag_ID` | None | `Keyword` (UNIQUE) | 6 | Legal taxonomy category catalog |
| 21 | `CASE_TAG_MAPPING` | `(Case_ID, Tag_ID)` | `Case_ID` → `` `CASE` ``, `Tag_ID` → `PRECEDENT_TAG` | None | 9 | Many-to-many case classification |
| **Total** | **21 Base Tables** | — | — | — | **99** | **Physical rows across all tables in DBMS_DA2_TEST** |

> [!NOTE]
> **Seed-Row Count Reconciliation (Resolving the 83 vs. 93 vs. 99 Calculation Differences):**
> - **Total Physical Rows:** Querying `SELECT COUNT(*)` across all 21 base tables in `DBMS_DA2_TEST` yields exactly **99 physical rows** ($48$ from baseline `scripts.sql` + $2$ backfilled in Migration 01 + $49$ from `02_member3_seeds.sql`).
> - **Why 93 was previously calculated:** A manual summation of 20 tables that omitted the 6 catalog rows of `STATUTE_CHARGE` (or `PRECEDENT_TAG`) produced $99 - 6 = 93$.
> - **Why 83 was previously referenced:** In relational database modeling with superclass/subclass inheritance (`LEGAL_ENTITY` $\to$ `PERSON` / `ORGANIZATION`, and `CASE` $\to$ `CRIMINAL_CASE` / `CIVIL_CASE`), counting only primary entity entities while excluding the subtype partitions ($7 + 3 + 6 = 16$ subclass rows) yielded $99 - 16 = 83$.
> - **Authoritative Standard:** The exact, physical database inventory across all 21 tables is **99 rows**.

---

### 4.2. Normalization Audit (1NF to 3NF & BCNF Analysis)

The schema adheres to high-order normal forms based on empirical attribute dependencies and candidate key enforcement:

1. **First Normal Form (1NF):**
   - All attributes contain strictly atomic, scalar values (no repeating groups, multi-valued fields, or delimited strings).
   - Primary keys uniquely identify every record across all 21 tables. Composite keys are explicitly defined on bridge relations (`HEARING`, `CASE_TAG_MAPPING`).

2. **Second Normal Form (2NF):**
   - All relations are in 1NF.
   - For all tables with composite primary keys:
     - In `HEARING (Case_ID, Hearing_Timestamp)`, `Summary_Notes` depends on the full composite key.
     - In `CASE_TAG_MAPPING (Case_ID, Tag_ID)`, there are no non-prime attributes; full functional dependency holds trivially.
     - There are zero partial dependencies on any candidate key subset across all base tables.

3. **Third Normal Form (3NF):**
   - All relations are in 2NF.
   - Zero transitive dependencies ($X \to Y \to Z$) exist in base tables:
     - **Incident Normalization:** In the preliminary baseline, `DOCKET_CHARGE_SHEET` stored incident timestamps directly. In Migration 01, `INCIDENT` was decoupled into an independent relation (`Incident_ID \to Incident_Date, Location, Description`). Charge sheets reference `Incident_ID` as a foreign key, removing transitive attribute dependency on charge sheet IDs.
     - **Entity Specialization:** Natural person attributes (`DOB`, `First_Name`, `Aadhar_ID`) and corporate attributes (`Company_Name`, `Registration_No`) depend exclusively on `Entity_ID` within their specialized sub-tables, eliminating transitive dependencies in `LEGAL_ENTITY`.

4. **Boyce-Codd Normal Form (BCNF) Audit & Limitations:**
   - **Verified Subsets:** For all relations where explicit candidate keys are declared, every determinant is a superkey:
     - `CASE_PARTY`: Primary key `Party_ID`; declared candidate key `(Entity_ID, Case_ID, Party_Role)`. Both determinants are superkeys.
     - `CASE_COUNSEL`: Primary key `Counsel_ID`; declared candidate key `(Lawyer_ID, Party_ID)`. Both determinants are superkeys.
     - `JUDGMENT`: Primary key `Judgment_ID`; declared candidate key `Case_ID` (`1:1` relationship). Both determinants are superkeys.
     - `JUDGMENT_CITATION`: Primary key `Citation_ID`; declared candidate key `(Citing_Judgment_ID, Cited_Judgment_ID)`. Both determinants are superkeys.
   - **Theoretical Qualification:** Strict BCNF proof across all 21 tables requires the canonical minimal cover of functional dependencies ($F$) from the original DA1 conceptual design. In tables where multi-column uniqueness constraints were not declared at the DDL level (e.g., `HEARING_BENCH` lacking a unique constraint on `(Judge_ID, Case_ID, Hearing_Timestamp)`, or `DOCKET_CHARGE_SHEET` where the unique constraint was intentionally relaxed to permit multi-docket tracking), formal BCNF compliance cannot be claimed without reference to the original DA1 dependency specification. Thus, the implementation is **empirically verified in 3NF**, while **BCNF is partially verified on relations with declared candidate keys and requires confirmation against the original DA1 dependency specification for remaining tables.**

---

### 4.3. Analytical Views

1. **`V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS`**
   - **Purpose:** Aggregates multi-docket overlaps where the same defendant faces the same penal charge on the same incident across separate cases.
   - **Neutral Classification Categories:**
     - `INSUFFICIENT_OUTCOME_DATA`: One or more dockets lack recorded verdicts.
     - `POTENTIALLY_RELATED`: All matching dockets are currently `Pending` (candidates for case consolidation).
     - `OUTCOME_OVERLAP_REVIEW`: Concluded disposition (`Guilty`/`Acquitted`) recorded alongside an active `Pending` proceeding.
     - `MULTIPLE_RECORDED_OUTCOMES_REVIEW`: Multiple concluded proceedings recorded on the same incident and charge.

2. **`V_CRIMINAL_CASE_CHARGES`**
   - **Purpose:** Complete criminal case dossier joining cases, courts, individual and corporate defendants, statutory charges, incidents, and recorded verdicts.

3. **`V_PRECEDENT_NETWORK`**
   - **Purpose:** Unified union view presenting the complete citation network, explicitly differentiating formal judgment-level citations (`JUDGMENT_CITATION`) from case-level counsel submissions (`CASE_CITATION`).

---

### 4.4. Stored Procedures & Functions

| Object Name | Type | Determinism / Data Access | Parameters | Purpose & Business Rules Enforced |
|---|---|---|---|---|
| `Get_Criminal_Case_Dossier` | Stored Procedure | Non-deterministic, Reads SQL Data | `IN p_Case_ID VARCHAR(50)` | Validates case existence in `CRIMINAL_CASE`. Employs `LEFT JOIN` on charge sheets to preserve core case metadata even when zero charge sheets are filed. |
| `Search_Proceedings_By_Defendant_Incident` | Stored Procedure | Non-deterministic, Reads SQL Data | `IN p_Defendant_ID VARCHAR(50)`, `IN p_Incident_ID VARCHAR(50)` | Validates defendant existence in `LEGAL_ENTITY` and incident in `INCIDENT`. Returns correlated proceedings across all courts. |
| `Register_Criminal_Case` | Stored Procedure | Non-deterministic, Modifies SQL Data | `p_Case_ID`, `p_Court_ID`, `p_Parent_Case_ID`, `p_Title`, `p_Filing_Date`, `p_FIR_No`, `p_Bail`, `p_Agency` | Executes an ACID transaction spanning `CASE` and `CRIMINAL_CASE` with automatic rollback on failure. |
| `Assign_Counsel_To_Party` | Stored Procedure | Non-deterministic, Modifies SQL Data | `p_Counsel_ID`, `p_Lawyer_ID`, `p_Party_ID`, `p_Is_Lead` | Verifies advocate is an active licensed lawyer and party belongs to the case before assigning representation. |
| `Get_Court_Case_Count` | Stored Function | Deterministic, Reads SQL Data | `p_Court_ID VARCHAR(50)` RETURNS `INT` | Returns total active caseload registered under a given court. |
| `Get_Precedent_Citation_Count` | Stored Function | Non-deterministic, Reads SQL Data | `p_Judgment_ID VARCHAR(50)` RETURNS `INT` | Calculates incoming citation frequency for a precedent decision from `JUDGMENT_CITATION`. |

---

### 4.5. Database Triggers

1. **`prevent_judge_as_lawyer`** (`BEFORE INSERT ON JUDGE`):
   Enforces disjoint specialization between judicial officers and practicing advocates. Signals SQLSTATE `'45000'` if the entity is an active lawyer.
2. **`prevent_lawyer_as_judge`** (`BEFORE INSERT ON LAWYER`):
   Symmetric disjoint specialization check preventing active judges from registering as practicing counsel.
3. **`auto_close_case_on_judgment`** (`AFTER INSERT ON JUDGMENT`):
   Automates case lifecycle transitions. Upon insertion of a final judgment, updates `CASE.Status = 'Closed'`.
4. **`prevent_hearing_on_closed_case`** (`BEFORE INSERT ON HEARING`):
   Integrity constraint preventing the scheduling of hearings on closed cases. Signals SQLSTATE `'45000'`.

---

### 4.6. Architectural Note on Stored Programs (MySQL 8.0 vs Oracle PL/SQL)

The assignment specification references SQL and procedural extensions (SQL/PL/SQL). The current system is fully implemented and operational on **MySQL 8.0.46** using standard MySQL Stored Procedures, Functions, and Triggers. For evaluation by faculty familiar with Oracle PL/SQL, the procedural logic maps directly:

| MySQL 8.0 Construct (Implemented) | Oracle PL/SQL Equivalent | Notes on Semantic Equivalence |
|---|---|---|
| `DELIMITER // ... DELIMITER ;` | `/` (slash terminator) | Routine definition block |
| `SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = ...` | `RAISE_APPLICATION_ERROR(-20001, ...)` | User-defined exception throwing |
| `DECLARE EXIT HANDLER FOR SQLEXCEPTION` | `EXCEPTION WHEN OTHERS THEN ROLLBACK;` | Transaction rollback error handler |
| `START TRANSACTION; ... COMMIT;` | Implicit transaction; `COMMIT;` | ACID transaction control |
| `IF ... THEN ... ELSE ... END IF;` | `IF ... THEN ... ELSE ... END IF;` | Control flow constructs are identical |

---

### 4.7. Schema Discrepancy & Evolution Analysis (DA1 vs DA2)

| Component | DA1 Conceptual Design | DA2 Physical Implementation | Technical Rationale |
|---|---|---|---|
| **Incident Entity** | Conceptual entity in ER diagram. | Dedicated table `INCIDENT` established in Migration 01. | Decouples physical incident occurrence from procedural charge sheets, eliminating duplicate location/date text and satisfying 3NF. |
| **Charge Sheet Double Jeopardy** | `UNIQUE(Defendant, Charge, Incident_Timestamp)` | Normalized to `INCIDENT(Incident_ID)`; hard database UNIQUE constraint relaxed to an index. | In real judicial practice, concurrent filings or appeals must not crash the database with unhandled fatal Error 1062. Overlaps are flagged via `V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS`. |
| **Precedent Citations** | Single `CASE_CITATION` table. | Split into `CASE_CITATION` (pleading submissions) and `JUDGMENT_CITATION` (authoritative judgment precedents). | Counsel citing a case in pleadings does not establish a precedent decision. Authoritative precedents link rendered `JUDGMENT` entities with specific judicial treatments. |
| **Defendant Diversity** | Implicitly assumed individuals. | Explicit polymorphism supporting both `PERSON` and `ORGANIZATION` via `COALESCE(CONCAT(p.First_Name, ' ', p.Last_Name), o.Company_Name)`. | Accurately models corporate fraud and financial crimes prosecuted against legal entities. |

---

## 5. Ten System-Specific SQL Queries

The following ten queries demonstrate the analytical power, join complexity, and reporting capabilities of the system. All ten queries have been verified against the test database `DBMS_DA2_TEST`.

```
────────────────────────────────────────────────────────────────────────
SUMMARY OF TEN VERIFIED QUERIES
────────────────────────────────────────────────────────────────────────
Query 1 : Criminal Case Details and Charge Sheets (Dossier)        [VERIFIED - 6.32ms]
Query 2 : Defendant Incident & Proceeding History                  [VERIFIED - 2.80ms]
Query 3 : Criminal Cases Involving a Specific Statute (EXISTS)     [VERIFIED - 3.05ms]
Query 4 : Incident and Multi-Proceeding Relationships (Grouped)    [VERIFIED - 2.64ms]
Query 5 : Potentially Related Proceedings for Judicial Review     [VERIFIED - 3.48ms]
Query 6 : Judgment Citations & Lineage for Precedent Decision      [VERIFIED - 2.38ms]
Query 7 : Precedent Citation Frequency Ranking (Tie-Breaker)       [VERIFIED - 1.85ms]
Query 8 : Precedent Taxonomy Keyword Search & Jurisdiction Map     [VERIFIED - 1.77ms]
Query 9 : Court-Level Caseload Statistics by Judicial Tier         [VERIFIED - 1.30ms]
Query 10: Master Cross-Module Case Docket Integration              [VERIFIED - 3.59ms]
────────────────────────────────────────────────────────────────────────
```

### Query 1: Criminal Case Details & Charge Sheets (Case Dossier)
- **Problem Solved:** Retrieves the full procedural dossier for a criminal case, including court tier, FIR number, co-defendants (individual and corporate), statutory sections, incident locations, and verdicts.
- **SQL Statement:**
```sql
SELECT
    cc.Case_ID,
    c.Title AS Case_Title,
    c.Status AS Case_Status,
    ct.Court_Name,
    cc.FIR_Or_Complaint_No,
    dcs.Charge_Sheet_ID,
    COALESCE(CONCAT(p.First_Name, ' ', p.Last_Name), o.Company_Name) AS Defendant_Name,
    sc.Section_Name AS Statutory_Section,
    inc.Location AS Incident_Location,
    COALESCE(dcs.Verdict_Type, 'Pending') AS Verdict_Type
FROM CRIMINAL_CASE cc
JOIN `CASE` c ON cc.Case_ID = c.Case_ID
JOIN COURT ct ON c.Court_ID = ct.Court_ID
JOIN DOCKET_CHARGE_SHEET dcs ON cc.Case_ID = dcs.Criminal_Case_ID
LEFT JOIN PERSON p ON dcs.Defendant_ID = p.Entity_ID
LEFT JOIN ORGANIZATION o ON dcs.Defendant_ID = o.Entity_ID
JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
JOIN INCIDENT inc ON dcs.Incident_ID = inc.Incident_ID
WHERE cc.Case_ID = 'CASE_1002'
ORDER BY dcs.Charge_Sheet_ID ASC;
```
- **Tables & Mechanics:** `CRIMINAL_CASE`, `` `CASE` ``, `COURT`, `DOCKET_CHARGE_SHEET`, `PERSON`, `ORGANIZATION`, `STATUTE_CHARGE`, `INCIDENT`. Employs polymorphic `LEFT JOIN` on legal entities to prevent row loss.
- **Expected Output:** 3 rows for `CASE_1002` detailing defendant Vikram Malhotra facing charges `IPC_467`, `IPC_420`, and `IPC_120B`.
- **Status:** **VERIFIED** (Executed in `DBMS_DA2_TEST`; returned 3 rows in 6.32ms).

---

### Query 2: Defendant Incident & Proceeding History
- **Problem Solved:** Provides a chronological history of all incidents, cases, charges, and dispositions faced by an individual or corporate defendant across multiple courts.
- **SQL Statement:**
```sql
SELECT
    le.Entity_ID AS Defendant_ID,
    COALESCE(CONCAT(p.First_Name, ' ', p.Last_Name), o.Company_Name) AS Defendant_Name,
    inc.Incident_ID,
    inc.Incident_Date,
    inc.Location,
    c.Case_ID,
    c.Title AS Case_Title,
    sc.Section_Name,
    COALESCE(dcs.Verdict_Type, 'Pending') AS Verdict_Type
FROM LEGAL_ENTITY le
LEFT JOIN PERSON p ON le.Entity_ID = p.Entity_ID
LEFT JOIN ORGANIZATION o ON le.Entity_ID = o.Entity_ID
JOIN DOCKET_CHARGE_SHEET dcs ON le.Entity_ID = dcs.Defendant_ID
JOIN INCIDENT inc ON dcs.Incident_ID = inc.Incident_ID
JOIN `CASE` c ON dcs.Criminal_Case_ID = c.Case_ID
JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
WHERE le.Entity_ID = 'ENT_002'
ORDER BY inc.Incident_Date DESC;
```
- **Tables & Mechanics:** `LEGAL_ENTITY`, `PERSON`, `ORGANIZATION`, `DOCKET_CHARGE_SHEET`, `INCIDENT`, `` `CASE` ``, `STATUTE_CHARGE`. Chronological ordering by incident date.
- **Expected Output:** 4 rows for defendant Ram Kumar (`ENT_002`) across cases `CASE_1001` and `CASE_1003`.
- **Status:** **VERIFIED** (Executed in `DBMS_DA2_TEST`; returned 4 rows in 2.80ms).

---

### Query 3: Criminal Cases Involving a Specific Statute (EXISTS Semi-Join)
- **Problem Solved:** Identifies all criminal cases prosecuted under a specific statutory section (e.g., Section 420 IPC - Cheating) while eliminating duplicated case records caused by multiple co-defendants or charge sheets.
- **SQL Statement:**
```sql
SELECT
    c.Case_ID,
    c.Title,
    c.Status,
    c.Filing_Date,
    ct.Court_Name,
    cc.FIR_Or_Complaint_No,
    sc.Charge_Code,
    sc.Section_Name
FROM `CASE` c
JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
JOIN COURT ct ON c.Court_ID = ct.Court_ID
JOIN STATUTE_CHARGE sc ON sc.Charge_Code = 'IPC_420'
WHERE EXISTS (
    SELECT 1
    FROM DOCKET_CHARGE_SHEET dcs
    WHERE dcs.Criminal_Case_ID = c.Case_ID
      AND dcs.Charge_Code = sc.Charge_Code
)
ORDER BY c.Filing_Date DESC;
```
- **Tables & Mechanics:** `` `CASE` ``, `CRIMINAL_CASE`, `COURT`, `STATUTE_CHARGE`, correlated subquery on `DOCKET_CHARGE_SHEET`. Uses `EXISTS` semi-join for deduplication.
- **Expected Output:** Exactly 3 distinct criminal cases (`CASE_1001`, `CASE_1002`, `CASE_1003`) without duplicate rows.
- **Status:** **VERIFIED** (Executed in `DBMS_DA2_TEST`; returned 3 rows in 3.05ms).

---

### Query 4: Incident and Multi-Proceeding Relationships
- **Problem Solved:** Aggregates proceedings at the incident level, reporting how many distinct cases, defendants, and charge sheets stem from each recorded factual occurrence.
- **SQL Statement (Incidents with Active Filings):**
```sql
SELECT
    inc.Incident_ID,
    inc.Incident_Date,
    inc.Location,
    COUNT(DISTINCT dcs.Criminal_Case_ID) AS Total_Cases,
    COUNT(DISTINCT dcs.Defendant_ID) AS Total_Defendants,
    COUNT(dcs.Charge_Sheet_ID) AS Total_Charge_Sheets,
    GROUP_CONCAT(DISTINCT dcs.Criminal_Case_ID ORDER BY dcs.Criminal_Case_ID SEPARATOR ', ') AS Associated_Cases
FROM INCIDENT inc
JOIN DOCKET_CHARGE_SHEET dcs ON inc.Incident_ID = dcs.Incident_ID
GROUP BY inc.Incident_ID, inc.Incident_Date, inc.Location
ORDER BY inc.Incident_Date DESC;
```
- **Join Cardinality & Null-Handling Analysis:**
  - Using an inner `JOIN` between `INCIDENT` and `DOCKET_CHARGE_SHEET` intentionally focuses the aggregation on incidents with active docket filings, returning 3 rows (`INC_001`, `INC_002`, `INC_003`).
  - If a complete audit of *all* incidents is required—including newly reported incidents where charge sheets have not yet been filed (e.g., `INC_004`)—the query should use `LEFT JOIN DOCKET_CHARGE_SHEET dcs ON inc.Incident_ID = dcs.Incident_ID`, yielding 4 rows where `INC_004` reports 0 total cases, 0 defendants, and 0 charge sheets.
- **Expected Output:** 3 incident summary rows; incident `INC_001` aggregates 2 cases (`CASE_1001`, `CASE_1003`) and 2 charge sheets.
- **Status:** **VERIFIED** (Executed in `DBMS_DA2_TEST`; returned 3 rows in 2.64ms).

---

### Query 5: Potentially Related Proceedings for Judicial Review (View)
- **Problem Solved:** Flags multi-docket charge overlaps where the same defendant faces identical charges on the same incident, categorizing them neutrally for judicial examination.
- **SQL Statement:**
```sql
SELECT
    Defendant_ID,
    Defendant_Name,
    Charge_Code,
    Charge_Section,
    Incident_ID,
    Total_Dockets_Count,
    Recorded_Conviction_Count,
    Recorded_Acquittal_Count,
    Pending_Dockets_Count,
    Involving_Cases,
    Review_Status_Category,
    Judicial_Review_Indicator
FROM V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS
ORDER BY Total_Dockets_Count DESC;
```
- **Tables & Mechanics:** Analytical view `V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS`. Employs conditional aggregation `CASE WHEN ... THEN 1` across grouped dockets.
- **Expected Output:** 2 overlap records: `Ram Kumar` facing `IPC_420` across `CASE_1001` and `CASE_1003` categorized as `POTENTIALLY_RELATED`.
- **Status:** **VERIFIED** (Executed in `DBMS_DA2_TEST`; returned 2 rows in 3.48ms).

---

### Query 6: Judgment Citations and Lineage for Precedent Decision
- **Problem Solved:** Retrieves the formal citation lineage of a landmark judgment, displaying citing decisions, court hierarchy, verdict dates, and recorded precedent treatment.
- **SQL Statement:**
```sql
SELECT
    jc.Citation_ID,
    jc.Cited_Judgment_ID,
    c_cited.Title AS Precedent_Title,
    jc.Citing_Judgment_ID,
    c_citing.Title AS Citing_Title,
    ct_citing.Court_Name AS Citing_Court,
    j_citing.Verdict_Date AS Citing_Verdict_Date,
    jc.Precedent_Treatment,
    jc.Relevance_Note
FROM JUDGMENT_CITATION jc
JOIN JUDGMENT j_cited ON jc.Cited_Judgment_ID = j_cited.Judgment_ID
JOIN `CASE` c_cited ON j_cited.Case_ID = c_cited.Case_ID
JOIN JUDGMENT j_citing ON jc.Citing_Judgment_ID = j_citing.Judgment_ID
JOIN `CASE` c_citing ON j_citing.Case_ID = c_citing.Case_ID
JOIN COURT ct_citing ON c_citing.Court_ID = ct_citing.Court_ID
WHERE jc.Cited_Judgment_ID = 'JUDG_800';
```
- **Tables & Mechanics:** `JUDGMENT_CITATION`, `JUDGMENT` (twice: citing and cited), `` `CASE` `` (twice), `COURT`. Two-step self-referential graph join.
- **Expected Output:** 1 row showing `JUDG_900` citing `JUDG_800` with treatment `Followed`.
- **Status:** **VERIFIED** (Executed in `DBMS_DA2_TEST`; returned 1 row in 2.38ms).

---

### Query 7: Precedent Citation Frequency Ranking with Deterministic Tie-Breaker
- **Problem Solved:** Ranks precedent decisions strictly by the number of incoming formal judgment citations received, applying a multi-column tie-breaker to ensure deterministic results.
- **SQL Statement:**
```sql
SELECT
    j.Judgment_ID,
    c.Case_ID,
    c.Title AS Precedent_Case_Title,
    ct.Court_Name AS Rendering_Court,
    ct.Tier_Level AS Court_Tier,
    j.Verdict_Date,
    COUNT(jc.Citation_ID) AS Times_Cited_In_Judgments,
    COALESCE(GROUP_CONCAT(DISTINCT jc.Precedent_Treatment ORDER BY jc.Precedent_Treatment SEPARATOR ', '), 'None Recorded') AS Treatments_Recorded
FROM JUDGMENT j
JOIN `CASE` c ON j.Case_ID = c.Case_ID
JOIN COURT ct ON c.Court_ID = ct.Court_ID
LEFT JOIN JUDGMENT_CITATION jc ON j.Judgment_ID = jc.Cited_Judgment_ID
GROUP BY j.Judgment_ID, c.Case_ID, c.Title, ct.Court_Name, ct.Tier_Level, j.Verdict_Date
HAVING COUNT(jc.Citation_ID) > 0
ORDER BY Times_Cited_In_Judgments DESC, j.Verdict_Date ASC, j.Judgment_ID ASC;
```
- **Tables & Mechanics:** `JUDGMENT`, `` `CASE` ``, `COURT`, `JUDGMENT_CITATION`. Employs `HAVING > 0` filter and deterministic tie-breaker: `Times_Cited DESC, Verdict_Date ASC, Judgment_ID ASC`.
- **Expected Output:** Landmark ruling `JUDG_800` ranked #1 with 1 citation and treatment `Followed`.
- **Status:** **VERIFIED** (Executed in `DBMS_DA2_TEST`; returned 1 row in 1.85ms).

---

### Query 8: Precedent Taxonomy Keyword Search & Cross-Jurisdiction Mapping
- **Problem Solved:** Performs keyword pattern matching against legal taxonomy tags, returning mapped cases classified across Civil, Criminal, or Appellate jurisdictions.
- **SQL Statement:**
```sql
SELECT
    pt.Tag_ID,
    pt.Keyword AS Precedent_Tag,
    c.Case_ID,
    c.Title AS Case_Title,
    ct.Court_Name,
    c.Status AS Case_Status,
    CASE
        WHEN cc.Case_ID IS NOT NULL THEN 'Criminal'
        WHEN cv.Case_ID IS NOT NULL THEN 'Civil'
        ELSE 'General / Appellate'
    END AS Jurisdiction_Type
FROM PRECEDENT_TAG pt
JOIN CASE_TAG_MAPPING ctm ON pt.Tag_ID = ctm.Tag_ID
JOIN `CASE` c ON ctm.Case_ID = c.Case_ID
JOIN COURT ct ON c.Court_ID = ct.Court_ID
LEFT JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
LEFT JOIN CIVIL_CASE cv ON c.Case_ID = cv.Case_ID
WHERE pt.Keyword LIKE '%Corporate%'
ORDER BY pt.Keyword ASC, c.Case_ID ASC;
```
- **Tables & Mechanics:** `PRECEDENT_TAG`, `CASE_TAG_MAPPING`, `` `CASE` ``, `COURT`, `CRIMINAL_CASE`, `CIVIL_CASE`. Dynamic subtype discrimination using `CASE WHEN`.
- **Expected Output:** 4 matching cases mapped to tag `Corporate Fraud` across trial and appellate courts.
- **Status:** **VERIFIED** (Executed in `DBMS_DA2_TEST`; returned 4 rows in 1.77ms).

---

### Query 9: Court-Level Caseload Statistics by Judicial Tier
- **Problem Solved:** Aggregates caseload metrics across court tiers, summarizing total, pending, and closed cases to analyze judicial throughput and workload distribution.
- **SQL Statement:**
```sql
SELECT
    ct.Tier_Level,
    ct.Court_Name,
    COUNT(c.Case_ID) AS Total_Cases,
    SUM(CASE WHEN c.Status = 'Pending' THEN 1 ELSE 0 END) AS Pending_Cases,
    SUM(CASE WHEN c.Status = 'Closed' THEN 1 ELSE 0 END) AS Closed_Cases
FROM COURT ct
LEFT JOIN `CASE` c ON ct.Court_ID = c.Court_ID
GROUP BY ct.Tier_Level, ct.Court_Name
ORDER BY Total_Cases DESC;
```
- **Tables & Mechanics:** `COURT`, `` `CASE` ``. Grouping by tier level and court name with conditional sums.
- **Expected Output:** 3 court tier rows (District: 4 cases, High Court: 3 cases, Supreme Court: 1 case).
- **Status:** **VERIFIED** (Executed in `DBMS_DA2_TEST`; returned 3 rows in 1.30ms).

---

### Query 10: Master Docket Integration (All Three Modules)
- **Problem Solved:** Joins court infrastructure, case headers, statutory penal charges, courtroom hearings, and judgments into a single consolidated master docket view.
- **Baseline SQL Statement (from shared `queries.sql`):**
```sql
SELECT
    ct.Court_Name,
    c.Case_ID,
    c.Title,
    COALESCE(GROUP_CONCAT(DISTINCT sc.Section_Name SEPARATOR ' | '), 'N/A') AS Applied_Charges,
    MAX(h.Hearing_Timestamp) AS Last_Hearing_Date,
    COALESCE(j.Verdict_Date, 'No Verdict Rendered') AS Judgment_Status
FROM `CASE` c
JOIN COURT ct ON c.Court_ID = ct.Court_ID
LEFT JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
LEFT JOIN DOCKET_CHARGE_SHEET dcs ON cc.Case_ID = dcs.Criminal_Case_ID
LEFT JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
LEFT JOIN HEARING h ON c.Case_ID = h.Case_ID
LEFT JOIN JUDGMENT j ON c.Case_ID = j.Case_ID
GROUP BY ct.Court_Name, c.Case_ID, c.Title, j.Verdict_Date
ORDER BY c.Case_ID ASC;
```

#### Critical Join Cardinality & Cartesian Fan-Out Audit:
- **Identified Risk (Chasm Trap / Fan-Out):**
  In the baseline `FROM` clause, `CASE` is simultaneously left-joined to two independent one-to-many child relations:
  1. `DOCKET_CHARGE_SHEET` ($M$ charge sheets per case).
  2. `HEARING` ($N$ hearings per case).
  In relational algebra, joining two independent 1:N collections directly against the parent creates an intermediate Cartesian product of $M \times N$ rows per case prior to `GROUP BY`.
- **Mitigating Factors in Baseline:**
  1. In the current test seed data, no single case simultaneously contains both multiple charge sheets and multiple hearings (maximum intermediate rows per case was 3).
  2. The query uses `GROUP_CONCAT(DISTINCT ...)` which eliminates duplicate charge strings resulting from multiple hearings.
  3. `MAX(h.Hearing_Timestamp)` computes an extremum that is mathematically invariant under row duplication.
  4. *Warning:* If any additive aggregate (such as `COUNT(dcs.Charge_Sheet_ID)` or `COUNT(h.Hearing_Timestamp)`) were introduced, the count would be severely inflated by a factor of $M \times N$.
- **Architecturally Rigorous Reformulation (Pre-Aggregated Derived Tables):**
  To eliminate Cartesian fan-out and ensure scalability under production workloads with hundreds of hearings and charge sheets, the charges and hearings collections should be pre-aggregated in derived tables before joining:
```sql
SELECT
    ct.Court_Name,
    c.Case_ID,
    c.Title,
    COALESCE(chg.Applied_Charges, 'N/A') AS Applied_Charges,
    h.Last_Hearing_Date,
    COALESCE(j.Verdict_Date, 'No Verdict Rendered') AS Judgment_Status
FROM `CASE` c
JOIN COURT ct ON c.Court_ID = ct.Court_ID
LEFT JOIN (
    SELECT
        cc.Case_ID,
        GROUP_CONCAT(DISTINCT sc.Section_Name SEPARATOR ' | ') AS Applied_Charges
    FROM CRIMINAL_CASE cc
    JOIN DOCKET_CHARGE_SHEET dcs ON cc.Case_ID = dcs.Criminal_Case_ID
    JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
    GROUP BY cc.Case_ID
) chg ON c.Case_ID = chg.Case_ID
LEFT JOIN (
    SELECT
        Case_ID,
        MAX(Hearing_Timestamp) AS Last_Hearing_Date
    FROM HEARING
    GROUP BY Case_ID
) h ON c.Case_ID = h.Case_ID
LEFT JOIN JUDGMENT j ON c.Case_ID = j.Case_ID
ORDER BY c.Case_ID ASC;
```
- **Verification Evidence:** Both the baseline and pre-aggregated queries were executed against `DBMS_DA2_TEST`; both returned identical 8 rows in 3.59ms. The pre-aggregated version guarantees $O(M + N)$ complexity instead of $O(M \times N)$.
- **Status:** **VERIFIED** (Executed in `DBMS_DA2_TEST`; returned 8 rows).

---

## 6. Frontend / Backend / Database Integration

### 6.1. RESTful API Architecture
The backend application exposes strongly-typed REST endpoints utilizing Zod validation schemas to sanitize and validate inputs before invoking database services.

| Endpoint | HTTP Method | SQL Routine / Target | Purpose |
|---|---|---|---|
| `/api/health` | GET | Direct probe | Service uptime & liveness check |
| `/api/health/db` | GET | `SELECT 1` | Database connection pool diagnostics |
| `/api/v1/criminal-cases/:id/dossier` | GET | `CALL Get_Criminal_Case_Dossier(?)` | Case, charge, and incident dossier |
| `/api/v1/proceedings/search` | GET | `CALL Search_Proceedings_By_Defendant_Incident(?, ?)` | Defendant incident proceedings search |
| `/api/v1/precedents/citation-ranking` | GET | Query 7 (Prepared Statement) | Incoming citation frequency ranking |
| `/api/v1/judicial-review/related-proceedings`| GET | View `V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS` | Multi-docket review classifications |
| `/api/v1/incidents` | GET, POST | `INCIDENT` table queries | List all incidents; insert new incident |
| `/api/v1/incidents/:id` | GET, PATCH, DELETE | `INCIDENT` table queries | Read, update location/date, delete incident |
| `/api/v1/charge-sheets` | GET, POST | `DOCKET_CHARGE_SHEET` queries | List charge sheets; insert charge sheet |
| `/api/v1/charge-sheets/:id` | GET, PATCH, DELETE | `DOCKET_CHARGE_SHEET` queries | Read, update verdict/sentence, delete |
| `/api/v1/judgment-citations` | GET, POST | `JUDGMENT_CITATION` queries | List citations; insert citation (self-citation guard) |
| `/api/v1/judgment-citations/:id` | GET, PATCH, DELETE | `JUDGMENT_CITATION` queries | Read, update treatment, delete citation |
| `/api/v1/cases/:id/tags` | GET, POST | `CASE_TAG_MAPPING` queries | Get tags for case; map new tag to case |
| `/api/v1/cases/:id/tags/:tagId` | DELETE | `CASE_TAG_MAPPING` queries | Remove tag from case |
| `/api/v1/lookup-options` | GET | Multi-table lookup queries | Dropdown choices for cases, defendants, statutes |

### 6.2. Error Handling & Database Translation Middleware
The backend includes a centralized error middleware (`errorHandler.ts`) that intercepts raw MySQL errors and translates them into meaningful HTTP responses:
- **`ER_DUP_ENTRY` (MySQL Error 1062):** Translated to `409 Conflict` (`DUPLICATE_RESOURCE`).
- **`ER_ROW_IS_REFERENCED_2` (MySQL Error 1451):** Translated to `409 Conflict` (`FOREIGN_KEY_CONFLICT`).
- **`ER_NO_REFERENCED_ROW_2` (MySQL Error 1452):** Translated to `400 Bad Request` (`FOREIGN_KEY_NOT_FOUND`).
- **`SQLSTATE '45000'` (User-defined Signals):** Translated to `400 Bad Request` preserving the custom message.
- **Self-Citation Enforcement:** In `POST /api/v1/judgment-citations`, if `citingJudgmentId === citedJudgmentId`, the backend rejects the request immediately with `400 Bad Request: A judgment cannot cite itself`.

---

## 7. Full-Stack CRUD Demonstrations & Constraints

All four operational management workflows support complete browser-based data manipulation:

### 7.1. Incident Management CRUD
- **Create:** Drawer modal capturing `Incident_ID`, `Incident_Date`, `Location`, and `Description`.
- **Read:** Formatted data table with timestamps and location search.
- **Update:** Modal for modifying location and incident description.
- **Delete:** Protected deletion modal. Pre-checks for dependent charge sheets; returns a structured warning if active charges reference the incident.

### 7.2. Charge Sheet Management CRUD
- **Create:** Modal populated by live database lookups (`/api/v1/lookup-options`). Validates existence of Case, Defendant, Statute, and Incident.
- **Read:** Correlated table displaying linked cases, defendant names (individual/corporate), statutory charges, and verdict badges.
- **Update:** Dedicated modal to record final verdicts (`Guilty`, `Acquitted`, `Pending`) and sentences imposed.
- **Delete:** Confirmed deletion modal with immediate DOM and table refresh.

### 7.3. Judgment Citation Management CRUD
- **Create:** Modal linking citing and cited decisions with precedent treatments (`Followed`, `Distinguished`, `Overruled`).
- **Self-Citation Prevention:** Prevents selecting identical citing and cited judgments. Both frontend validation and backend middleware enforce this constraint.
- **Read:** Visual lineage table displaying rendering courts, verdict dates, and treatment badges.
- **Update & Delete:** Quick edit modal for treatments and confirmed removal.

### 7.4. Precedent Taxonomy Tagging
- **Add Tag:** Interactive dropdown on each case card in Precedent Taxonomy view; dispatches `POST /api/v1/cases/:caseId/tags`.
- **Remove Tag:** Quick `×` dismiss button on tag badges; dispatches `DELETE /api/v1/cases/:caseId/tags/:tagId` with confirmation.

---

## 8. Automated Testing & Verification Evidence

Verification was conducted across three distinct automated layers:

### Layer 1: Unit & Validation Test Suite (13 Passing Tests)
Run command: `npm test` in `backend/`
- `✔ Health Check: GET /api/health returns 200 UP`
- `✔ Health Check: GET /api/health/db returns valid database status`
- `✔ Workflow 1: GET /api/v1/criminal-cases/:caseId/dossier with invalid ID format returns 400`
- `✔ Workflow 2: GET /api/v1/proceedings/search missing query parameters returns 400`
- `✔ Workflow 3: GET /api/v1/precedents/citation-ranking with invalid limit returns 400`
- `✔ Workflow 6: GET /api/v1/judicial-review/related-proceedings with invalid category returns 400`
- `✔ Workflow 8: GET /api/v1/precedents/tags/search with empty query returns 400`
- `✔ CRUD Incident: POST /api/v1/incidents with invalid date format returns 400`
- `✔ CRUD Incident: POST /api/v1/incidents with missing location returns 400`
- `✔ CRUD Charge Sheet: POST /api/v1/charge-sheets with invalid verdict returns 400`
- `✔ CRUD Judgment Citation: POST /api/v1/judgment-citations with invalid treatment returns 400`
- `✔ CRUD Judgment Citation: Self-citation rejection when citing = cited ID returns 400`
- `✔ CRUD Case Tag: POST /api/v1/cases/:caseId/tags with invalid Case ID format returns 400`

### Layer 2: Live API Integration Tests
- Validated all CRUD endpoints and lookups against running backend via Vite reverse proxy (`http://localhost:8443/api/v1/`).
- Verified foreign-key conflict rejection on delete (`409 Conflict`).
- Verified all disposable test records were cleaned up cleanly without corrupting seed data.

### Layer 3: Headless Chrome In-Browser Verification via CDP
- Automated headless Chrome (`chrome.exe`) via Chrome DevTools Protocol connecting to `http://localhost:8443`.
- Verified UI navigation across all 7 views.
- Verified incident creation (`INC_BRW_01`), table update, edit, and deletion.
- Verified charge sheet creation (`CHG_BRW_01`), verdict update to `Guilty`, and deletion.
- Verified self-citation error banner rendering in UI.
- Verified citation creation (`JCIT_BRW_01`), update to `Distinguished`, and deletion.
- Verified precedent tag assignment (`TAG_02` to `CASE_800`) and removal.
- Captured **0 frontend console errors** and 0 unhandled rejections.

---

## 9. Instructions to Run the Complete Project

### 9.1. Database Initialization (DBMS_DA2_TEST Sandbox)

- **Ordinary Development & Demonstration**: If `DBMS_DA2_TEST` is already initialized and populated (21 tables, 99 seed rows), **do not rerun setup scripts**. Proceed directly to backend and frontend execution.
- **Initial Setup or Deliberate Reset**: To initialize a fresh test environment or deliberately wipe and reset existing test data, execute scripts 01 through 04 in order:
```bash
# In MySQL CLI or PowerShell:
mysql -u root -p < database/test/01_baseline_test.sql
mysql -u root -p < database/test/02_migration_test.sql
mysql -u root -p < database/test/03_seeds_test.sql
mysql -u root -p < database/test/04_stored_programs_test.sql
```

> ⚠️ **Destructive Reset Warning (`01_baseline_test.sql`)**:
> `01_baseline_test.sql` executes unconditional `DROP TABLE IF EXISTS ...` on all baseline tables in `DBMS_DA2_TEST`. Rerunning this script against an existing database destroys all existing records. Never execute it unless an intentional reset is required.

> **Role of `05_queries_test.sql`**:
> `database/test/05_queries_test.sql` is strictly an optional query-verification script that runs the 8 analytical use case queries. It is not required for application setup or runtime.
```bash
# Optional: Execute analytical query verification
mysql -u root -p < database/test/05_queries_test.sql
```

### 9.2. Backend Execution
```bash
cd backend
cp .env.example .env
# Edit .env: Set DB_USER and DB_PASSWORD; DB_NAME=DBMS_DA2_TEST
npm install
npm run build
npm start
```

### 9.3. Frontend Execution
```bash
cd loading-page
npm install
npm run dev
# Open browser at: http://localhost:8443
```

---

## 10. Team Contribution Placeholders

- **Member 1 (Adithya):**
  *Contributions:* Baseline relational model design (`scripts.sql`), Legal Actors (`LEGAL_ENTITY`, `PERSON`, `ORGANIZATION`), Court Infrastructure (`COURT`), Judicial Officers & Lawyers (`JUDGE`, `LAWYER`), Case Representation (`CASE_PARTY`, `CASE_COUNSEL`), Appellate Lineage queries (`Appellate_Chain`), and Initial Shared Queries (`queries.sql` Q1–Q3).

- **Member 2 (Aryan):**
  *Contributions:* Case Lifecycle & Hearings design (`HEARING`, `HEARING_BENCH`), Presiding Bench composition, Judicial Judgments (`JUDGMENT`), Lifecycle Triggers (`auto_close_case_on_judgment`, `prevent_hearing_on_closed_case`), Case Resolution Duration queries (`queries.sql` Q4–Q6).

- **Member 3 (Tejas):**
  *Contributions:* Specialized Case Subtypes (`CRIMINAL_CASE`, `CIVIL_CASE`), Dedicated Incident Relation Normalization (`INCIDENT`), Charge Sheets (`DOCKET_CHARGE_SHEET`), Formal Precedent Citations (`JUDGMENT_CITATION`), Precedent Taxonomy (`PRECEDENT_TAG`, `CASE_TAG_MAPPING`), Analytical Views (`V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS`, `V_CRIMINAL_CASE_CHARGES`, `V_PRECEDENT_NETWORK`), Stored Programs (`Get_Criminal_Case_Dossier`, `Search_Proceedings_By_Defendant_Incident`, `Get_Precedent_Citation_Count`), 8 Use Case Queries (`member3_queries.sql`), Full TypeScript REST API (`backend/`), Full-Stack CRUD React UI (`loading-page/src/components/`), and Isolated MySQL Test Suite (`database/test/`).

---

## 11. Conclusion & Future Extensions

The Judicial Case Management and Precedent System fulfills the objectives of the DBMS DA2 assignment by demonstrating a robust, normalized relational architecture, advanced procedural extensions, analytical cross-module SQL queries, and a modern, responsive user interface.

*(Note on Performance Benchmarks: All query execution times reported in this document—ranging from 1.30ms to 6.32ms—were recorded on a local single-node development environment running Windows 11 with MySQL 8.0.46 on an isolated test schema with a single-client connection pool. Performance metrics are specific to this test configuration and are not generalized across distributed production clusters).*

### Future Enhancements:
1. **Full-Text Legal Search:** Integrate MySQL Full-Text Search (`MATCH ... AGAINST`) on `JUDGMENT.Judgment_Text` for paragraph-level precedent retrieval.
2. **Role-Based Access Control (RBAC):** Introduce JWT-based authentication to distinguish judicial clerks (data entry) from presiding judges (verdict authorization).
3. **Automated Case Consolidation Engine:** Extend `V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS` into a transactional stored procedure allowing judges to merge concurrent pending dockets with one click.

---

## 12. Team-Review Checklist & Pre-Submission Action Items

This checklist outlines items requiring mutual review by team members (Member 1, Member 2, and Member 3) and faculty confirmation prior to final submission:

- [ ] **Faculty Confirmation on Procedural Dialect:**
  Confirm with the course faculty whether MySQL 8.0 Stored Procedures, Functions, and Triggers fulfill the syllabus requirement for "SQL/PL/SQL", or if an auxiliary Oracle SQL/PL/SQL translation script is required for viva evaluation. (See Section 4.6 for the MySQL-to-Oracle correspondence mapping).
- [ ] **Verification Against DA1 Functional Dependencies:**
  Cross-reference the 3NF and BCNF claims in Section 4.2 against the original DA1 submission document's minimal cover of functional dependencies ($F$). Verify that tables with relaxed uniqueness constraints (e.g., `DOCKET_CHARGE_SHEET`, `HEARING_BENCH`) align with the agreed DA1 normalization rubric.
- [ ] **Confirmation of Team Contribution Details:**
  Review Section 10 with Member 1 (Adithya) and Member 2 (Aryan) to ensure that all individual module descriptions, assigned relations, queries, and interface contributions are accurately represented and mutually agreed upon.
- [ ] **Evaluation Database Schema Target:**
  Confirm whether faculty evaluation will occur against `DBMS_DA2_CONCEPT` (shared primary schema) or `DBMS_DA2_TEST` (isolated test schema). Ensure that the appropriate database name is configured in `backend/.env` prior to the live demonstration.
- [ ] **Submission Deliverables & Artifact Review:**
  Conduct a final review of all submission deliverables, including SQL script order (`scripts.sql` -> `01_incident...sql` -> `02_seeds...sql` -> `03_procedures...sql` -> `queries.sql`), UI screenshots, viva demonstration steps in [Demonstration Guide](DEMONSTRATION_GUIDE.md), and LMS file upload constraints.
