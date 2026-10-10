# DA2 Member 2 — Hearings, Judgments & Appeals Module
**Judicial Case Management and Precedent System**  
**Author:** Member 2 (Aryan)  
**Database System:** Oracle Database 19c / 21c / 23ai / Oracle SQL Developer / SQL*Plus  

---

## 1. Module Overview

The **Hearings, Judgments & Appeals Module** represents the operational core of the Judicial Case Management and Precedent System. It manages the full judicial lifecycle of cases after their initial registration:
1. **Hearings Management (`HEARING`):** Scheduling courtroom proceedings, logging hearing purposes (bail, charge framing, evidence, cross-examination, final arguments), tracking session dates, courtroom allocations, and hearing statuses (`SCHEDULED`, `COMPLETED`, `ADJOURNED`, `CANCELLED`).
2. **Hearing Bench Constitution (`HEARING_BENCH`):** Supporting arbitrary bench compositions (Single Judge, Division Bench, Full Bench) via an M:N composite relationship between hearings and judges, tracking presiding roles (`Presiding Judge`, `Associate Judge`, `Division Bench Lead`, `Single Judge`, `Chief Justice`).
3. **Judgments & Decrees (`JUDGMENT`):** Recording definitive or interim judicial outcomes, verdicts, ratio decidendi summaries, full legal texts (`CLOB`), and judgment delivery statuses (`DELIVERED`, `RESERVED`, `PRONOUNCED`, `STAYED`, `OVERRULED`). Specifically designed to support **multiple judgments per case** (interim restitution orders, partial discharges, final decrees).
4. **Appellate Escalation (`APPEAL`):** Modeling appellate challenges across the Indian judicial hierarchy (e.g., District Court -> High Court -> Supreme Court), ensuring lower-to-higher court hierarchy rules, limitation adherence, and tracking appellate stages (`PENDING`, `ADMITTED`, `DISPOSED`, `REJECTED`).

---

## 2. Table Structures & Relational Schema

```
                                  +-------------------+
                                  |       COURT       |
                                  | (Member 1 Parent) |
                                  +-------------------+
                                    ^               ^
             lower_court_id (FK)    |               | higher_court_id (FK)
                                    |               |
+-------------------+             +-------------------+             +-------------------+
|       CASES       |<----------->|      APPEAL       |------------>|     JUDGMENT      |
| (Member 1 Parent) |   case_id   |  (Member 2 Table) | judgment_id |  (Member 2 Table) |
+-------------------+   (FK)      +-------------------+    (FK)     +-------------------+
      ^         ^                                                         ^
      |         | case_id (FK)                                            | case_id (FK)
      |         +---------------------------------------------------------+
      |
      | case_id (FK)
+-------------------+
|      HEARING      |
|  (Member 2 Table) |
+-------------------+
      |
      | hearing_id (FK)
      v
+-------------------+             +-------------------+
|   HEARING_BENCH   |------------>|       JUDGE       |
|  (Member 2 Table) |  judge_id   | (Member 1 Parent) |
+-------------------+    (FK)     +-------------------+
```

### Table Definitions

| Table | Primary Key | Foreign Keys | Key Constraints & Checks |
|---|---|---|---|
| **`HEARING`** | `hearing_id` (VARCHAR2) | `case_id` -> `CASES(Case_ID)` | `hearing_status IN ('SCHEDULED', 'COMPLETED', 'ADJOURNED', 'CANCELLED')`, NOT NULL on dates & purpose |
| **`HEARING_BENCH`** | `(hearing_id, judge_id)` (Composite) | `hearing_id` -> `HEARING`, `judge_id` -> `JUDGE(Entity_ID)` | `bench_role IN ('Presiding Judge', 'Associate Judge', 'Single Judge', 'Chief Justice', 'Division Bench Lead')` |
| **`JUDGMENT`** | `judgment_id` (VARCHAR2) | `case_id` -> `CASES(Case_ID)` | Supports multiple judgments per case (no unique constraint on `case_id`). `judgment_status IN ('DELIVERED', 'RESERVED', 'PRONOUNCED', 'STAYED', 'OVERRULED')` |
| **`APPEAL`** | `appeal_id` (VARCHAR2) | `case_id` -> `CASES`, `judgment_id` -> `JUDGMENT`, `lower_court_id` -> `COURT`, `higher_court_id` -> `COURT` | `CHECK (lower_court_id <> higher_court_id)`, `appeal_status IN ('PENDING', 'ADMITTED', 'DISPOSED', 'REJECTED')` |

---

## 3. Scripts Inventory & Execution Order

All scripts are modular, self-contained, and idempotent:

| Order | Script File | Purpose / Description |
|---|---|---|
| **0** | `00_setup_da1_schema.sql` | Baseline Oracle setup for DA1 tables (`COURT`, `PERSON`, `JUDGE`, `CASES`, `LAWYER`, `CASE_PARTY`) & Member 3 tables (`CRIMINAL_CASE`, `CIVIL_CASE`, `STATUTE_CHARGE`, `DOCKET_CHARGE_SHEET`, `CASE_CITATION`, `PRECEDENT_TAG`) |
| **1** | `01_create_tables.sql` | DDL for Member 2 tables (`HEARING`, `HEARING_BENCH`, `JUDGMENT`, `APPEAL`), sequences (`HEARING_SEQ`, `JUDGMENT_SEQ`, `APPEAL_SEQ`), and performance indexes |
| **2** | `02_sample_data.sql` | Interconnected seed data: 14 Hearings, 20 Bench Assignments, 7 Judgments, and 6 Appeals |
| **3** | `03_sql_queries.sql` | All 15 required operational and analytical queries (Analytic functions, `LISTAGG`, date arithmetic, `HAVING`) |
| **4** | `04_plsql_procedures.sql` | Stored procedures `SCHEDULE_HEARING` and `REGISTER_APPEAL` with full validation & demo blocks |
| **5** | `05_functions.sql` | Stored function `CALCULATE_CASE_DURATION` with multiple-judgment rule handling & SQL integration |
| **6** | `06_triggers.sql` | Database triggers enforcing state transition graph, lifecycle sync, and appeal-judgment integrity |
| **7** | `07_test_cases.sql` | Automated test suite validating `NO_DATA_FOUND`, `TOO_MANY_ROWS`, `DUP_VAL_ON_INDEX`, `VALUE_ERROR`, custom errors, and transaction control (`SAVEPOINT` / `ROLLBACK`) |
| **8** | `08_integration_queries.sql` | Five deep cross-module queries joining Member 1, Member 2, and Member 3 tables |
| **★** | `run_all.sql` | Master 1-click execution script running scripts 0 through 8 sequentially |

---

## 4. How to Run in Oracle SQL Developer / SQL*Plus

### Prerequisites
- Oracle Database 19c, 21c, 23c, or 23ai (XE or Enterprise Edition).
- A schema with `CONNECT`, `RESOURCE`, and `CREATE VIEW` privileges.
- SQL*Plus or Oracle SQL Developer.

### Option A: 1-Click Master Execution via SQL*Plus
Navigate to the directory in terminal/PowerShell and launch SQL*Plus:
```sql
cd "DA2\Member2"
sqlplus username/password@hostname:1521/service_name
@run_all.sql
```
*(Every script includes `SET SERVEROUTPUT ON;` and `SET DEFINE OFF;` to suppress variable prompting).*

### Option B: Running Step-by-Step in Oracle SQL Developer
1. Open **Oracle SQL Developer** and connect to your database user connection.
2. Open and run scripts in order using the **"Run Script (F5)"** button:
   - `00_setup_da1_schema.sql` (Initializes baseline tables)
   - `01_create_tables.sql` (Creates Member 2 tables)
   - `02_sample_data.sql` (Loads sample records)
   - `03_sql_queries.sql` (Runs the 15 queries)
   - `04_plsql_procedures.sql` (Compiles procedures and runs procedure test cases)
   - `05_functions.sql` (Compiles function and runs function test cases)
   - `06_triggers.sql` (Compiles triggers and tests enforcement)
   - `07_test_cases.sql` (Executes 11-point assertion test suite)
   - `08_integration_queries.sql` (Executes cross-module queries)

---

## 5. PL/SQL Procedures & Function Reference

### 1. `SCHEDULE_HEARING`
Schedules a courtroom hearing session for a case.
```sql
SCHEDULE_HEARING(
    p_case_id       IN  CASES.Case_ID%TYPE,
    p_hearing_date  IN  DATE,
    p_courtroom     IN  VARCHAR2,
    p_purpose       IN  VARCHAR2,
    p_remarks       IN  VARCHAR2 DEFAULT NULL,
    p_hearing_id    OUT VARCHAR2
);
```
**Business Validations:**
- Verifies `p_case_id` exists; raises `-20005` if not found.
- Verifies case is not `Closed` or `Disposed`; raises `-20006`.
- Enforces future date (`p_hearing_date >= TRUNC(SYSDATE)`); raises `-20007` on past dates.
- Generates ID via `HEARING_SEQ`.
- Synchronizes `CASES.Status` to `'Hearing'` if currently `'Pending'`.

**Sample Call:**
```sql
DECLARE
    v_hid VARCHAR2(50);
BEGIN
    SCHEDULE_HEARING('CASE_1001', SYSDATE + 30, 'Court Hall 2', 'Witness Deposition', 'Summons issued', v_hid);
    DBMS_OUTPUT.PUT_LINE('New Hearing ID: ' || v_hid);
END;
/
```

### 2. `REGISTER_APPEAL`
Registers an appellate challenge against a judgment.
```sql
REGISTER_APPEAL(
    p_case_id         IN  CASES.Case_ID%TYPE,
    p_judgment_id     IN  JUDGMENT.judgment_id%TYPE,
    p_lower_court_id  IN  COURT.Court_ID%TYPE,
    p_higher_court_id IN  COURT.Court_ID%TYPE,
    p_filing_date     IN  DATE,
    p_remarks         IN  VARCHAR2 DEFAULT NULL,
    p_appeal_id       OUT VARCHAR2
);
```
**Business Validations:**
- Verifies case and judgment exist.
- Validates judgment ownership: `p_judgment_id` must belong to `p_case_id`; raises `-20014`.
- Validates distinct courts: `lower_court_id <> higher_court_id`; raises `-20015`.
- Validates judicial hierarchy: `higher_court tier > lower_court tier`; raises `-20018`.
- Validates chronology: `filing_date >= judgment_date`; raises `-20019`.
- Rejects duplicate active appeals: raises `-20020` if appeal already pending/admitted for that judgment.
- Updates `CASES.Status` to `'Under Appeal'`.

**Sample Call:**
```sql
DECLARE
    v_aid VARCHAR2(50);
BEGIN
    REGISTER_APPEAL('CASE_1001', 'JDG_505', 'CRT_DC_CHN', 'CRT_HC_TN', SYSDATE, 'Challenging order', v_aid);
    DBMS_OUTPUT.PUT_LINE('New Appeal ID: ' || v_aid);
END;
/
```

### 3. `CALCULATE_CASE_DURATION`
Calculates case resolution duration or active elapsed time in days.
```sql
CALCULATE_CASE_DURATION(p_case_id IN CASES.Case_ID%TYPE) RETURN NUMBER;
```
**Multiple Judgment Rule:**
- When multiple judgments exist for a case (such as interim injunctions, preliminary decrees, or rulings after remand), the function uses `MAX(judgment_date)` representing the definitive operative verdict.
- If no judgment exists, returns `ROUND(SYSDATE - filing_date)`.
- Validates case existence; raises `-20032` if missing.

**Sample Call:**
```sql
-- In SQL
SELECT Case_ID, Title, CALCULATE_CASE_DURATION(Case_ID) AS days_elapsed FROM CASES;

-- In PL/SQL
DECLARE
    v_days NUMBER;
BEGIN
    v_days := CALCULATE_CASE_DURATION('CASE_900');
    DBMS_OUTPUT.PUT_LINE('Resolution Duration: ' || v_days || ' days');
END;
/
```

---

## 6. Business Triggers Implemented

1. **`TRG_HEARING_STATUS_TRANS` (`BEFORE UPDATE ON HEARING`):**
   - Enforces judicial hearing state machine:
     - `COMPLETED` is terminal -> cannot transition to any other state (Raises `-20041`).
     - `CANCELLED` is terminal -> cannot transition to any other state (Raises `-20042`).
     - `ADJOURNED` can only transition to `SCHEDULED` (Raises `-20043`).
2. **`TRG_PREVENT_HEARING_CLOSED` (`BEFORE INSERT ON HEARING`):**
   - Blocks scheduling new or future-dated hearings for cases that are `Closed` or `Disposed` (Raises `-20045`).
   - Permits loading historical/past hearings (`hearing_date < SYSDATE` with non-scheduled status) to maintain archival audit integrity.
3. **`TRG_SYNC_CASE_ON_JUDGMENT` (`AFTER INSERT/UPDATE ON JUDGMENT`):**
   - When a **final judgment** is delivered (`DELIVERED`/`PRONOUNCED`), updates `CASES.Status = 'Disposed'` (preserving appellate window).
   - **Interim Judgment Rule:** Interim/preliminary/partial rulings (e.g. Interim Injunction, Partial Discharge) do NOT mark the case `Disposed`, preserving trial docketing for subsequent hearings.
4. **`TRG_VALIDATE_APPEAL_JUDGMENT` (`BEFORE INSERT/UPDATE ON APPEAL`):**
   - Enforces judgment ownership: The appeal's judgment must belong to the specified case or to its lower-court parent docket via `Parent_Case_ID` (Raises `-20048`).
   - Enforces chronology: Appeal filing date >= judgment delivery date (Raises `-20049`).
   - Enforces distinct courts: Lower court <> Higher court (Raises `-20050`).
5. **`TRG_SYNC_CASE_ON_APPEAL` (`AFTER INSERT ON APPEAL`):**
   - Updates `CASES.Status = 'Under Appeal'` for active appeals (`PENDING` or `ADMITTED`). If an appellate docket is referenced, synchronizes both the appellate docket and the lower-court trial case.

---

## 7. Common Oracle Errors Trapped & Resolved

| Oracle Error | Cause in Database | How the Solution Handles / Prevents It |
|---|---|---|
| **`ORA-00001` (DUP_VAL_ON_INDEX)** | Duplicate primary key or unique key violation | Sequences (`HEARING_SEQ`, `APPEAL_SEQ`) start above seed data (201, 801); handled in `EXCEPTION WHEN DUP_VAL_ON_INDEX` |
| **`ORA-01403` (NO_DATA_FOUND)** | `SELECT INTO` returned zero rows | Trapped in procedures (`WHEN NO_DATA_FOUND`) and re-raised as descriptive user errors (`-20005`, `-20013`) |
| **`ORA-01422` (TOO_MANY_ROWS)** | `SELECT INTO` returned multiple rows | Avoided in `CALCULATE_CASE_DURATION` by using `MAX(judgment_date)` and `COUNT(*)`; demonstrated in test suite |
| **`ORA-06502` (VALUE_ERROR)** | String buffer truncation or type conversion error | Trapped via `WHEN VALUE_ERROR`; input parameters use `%TYPE` anchoring |
| **`ORA-04091` (Mutating Table)** | Trigger queries or modifies table currently firing it | Avoided completely by using parent table lookups (`CASES`, `JUDGMENT`) from child triggers (`APPEAL`, `HEARING`) |
| **`SP2-0027` / Substitution Prompt** | SQL*Plus treating `&` as substitution variable | Prevented by placing `SET DEFINE OFF;` at the top of all scripts |

---

## 8. Assumptions & Known Design Decisions

1. **Table Naming (`CASES` vs `CASE`):**
   - In Oracle SQL, `CASE` is a reserved keyword. The table is physically defined as `CASES`, with a compatibility view `CREATE OR REPLACE VIEW "CASE" AS SELECT * FROM CASES;` so that both conventions work seamlessly.
2. **Multiple Judgments Support:**
   - In realistic judicial proceedings (and specifically required in the problem specification), a case can have multiple judgments (interim orders, partial discharges, final verdicts). Therefore, `JUDGMENT.case_id` is a regular foreign key **without** a unique constraint.
3. **Appellate Case Model:**
   - In Member 2, `APPEAL.case_id` represents the **case docket being appealed** (the case owning the challenged judgment). For compatibility with multi-tier case filing, procedures and triggers also accept an appellate case identifier if its DA1 `Parent_Case_ID` links to the lower-court case.
4. **Lifecycle Statuses & Interim Orders:**
   - Filing -> `Pending` -> `Hearing` -> `Disposed` (upon Final Judgment) -> `Under Appeal` (upon Appeal registration). Cases receiving interim or interlocutory orders remain in `Hearing` status so that trial proceedings may continue.
5. **Court Tier Hierarchy:**
   - Indian 4-tier hierarchy: `Subordinate` (Level 1) < `District` (Level 2) < `High Court` (Level 3) < `Supreme` (Level 4). Appeals must proceed from lower tier to strictly higher tier.
6. **Transaction Boundary Management:**
   - Reusable stored procedures (`SCHEDULE_HEARING`, `REGISTER_APPEAL`) utilize internal `SAVEPOINT` management and delegate final `COMMIT`/`ROLLBACK` boundaries to the calling application or script. Dedicated demonstration blocks explicitly commit or rollback as appropriate.
7. **Execution Reliability:**
   - Master runner `run_all.sql` utilizes `WHENEVER SQLERROR EXIT FAILURE ROLLBACK;` and `WHENEVER OSERROR EXIT FAILURE;` to guarantee automated halt on genuine system faults while permitting handled PL/SQL exception demonstrations.
