# Judicial Case Management and Precedent System — Database Module

## Module: Criminal Cases, Charges, Incidents and Legal Precedents (Member 3)

### 1. Canonical Architecture & Directory Layout

To prevent schema drift and redundant table definitions, the shared repository maintains **one canonical baseline script**:
- **Shared Canonical Baseline:** [`scripts.sql`](../scripts.sql) (authored by Member 1, established in repository root).

Member 3's module builds strictly on top of this shared baseline through modular migrations, demonstration seeds, stored programs, and analytical queries:

```text
Judicial-Case-Management-and-Precedent-System/
├── scripts.sql                                    # CANONICAL SHARED BASELINE (Member 1)
├── queries.sql                                    # Shared analytical queries (Members 1, 2, 3)
│
└── database/
    ├── README.md                                  # Complete architecture & execution guide
    ├── migrations/
    │   └── 01_incident_and_precedent_refinements.sql  # INCIDENT, DOCKET normalization, JUDGMENT_CITATION, views
    ├── seeds/
    │   └── 02_member3_seeds.sql                   # Demonstration seeds for Member 3
    ├── stored_programs/
    │   └── member3_procedures.sql                 # Member 3 Stored Procedures & Functions
    └── queries/
        └── member3_queries.sql                    # 8 mandatory use cases implemented & refined
```

---

### 2. Execution Order and Prerequisites

All SQL files target the MySQL 8.0+ database `DBMS_DA2_CONCEPT`.

> [!NOTE]
> **Database Creation & Idempotency Note:**  
> The baseline script `scripts.sql` contains an unconditional `CREATE DATABASE DBMS_DA2_CONCEPT;`. When running on an environment where `DBMS_DA2_CONCEPT` already exists, run `mysql -u root -p -e "DROP DATABASE IF EXISTS DBMS_DA2_CONCEPT;"` prior to Step 1, or execute with `--force` / ignore duplicate database warning.

Run the scripts in the following exact sequence:

1. **Step 1: Canonical Shared Schema & Baseline Seed Data**
   ```bash
   mysql -u root -p < scripts.sql
   ```
   *Action:* Establishes all shared tables (`LEGAL_ENTITY`, `PERSON`, `ORGANIZATION`, `COURT`, `JUDGE`, `LAWYER`, `` `CASE` ``, `CIVIL_CASE`, `CRIMINAL_CASE`, `CASE_PARTY`, `CASE_COUNSEL`, `HEARING`, `HEARING_BENCH`, `JUDGMENT`, `STATUTE_CHARGE`, `DOCKET_CHARGE_SHEET`, `CASE_CITATION`, `PRECEDENT_TAG`, `CASE_TAG_MAPPING`), triggers, functions, procedures, and baseline records.

2. **Step 2: Incident & Precedent Refinement Migration**
   ```bash
   mysql -u root -p < database/migrations/01_incident_and_precedent_refinements.sql
   ```
   *Action:*
   - Creates the dedicated `INCIDENT` relation (`Incident_ID`, `Incident_Date`, `Location`, `Description`).
   - Backfills existing baseline charge sheets (`CHG_01` → `INC_001`, `CHG_02` → `INC_002`).
   - Normalizes `DOCKET_CHARGE_SHEET` with foreign key `fk_dcs_incident` to `INCIDENT(Incident_ID)`.
   - Safely drops the redundant legacy `Incident_Timestamp` column (no shared code depends on it; `INCIDENT` is the single source of truth).
   - Relaxes the hard unhandled database `UNIQUE` constraint to an index, allowing multi-proceeding tracking without fatal DB errors.
   - Creates formal `JUDGMENT_CITATION` (`Citing_Judgment_ID`, `Cited_Judgment_ID`, `Precedent_Treatment`, `Relevance_Note`).
   - Installs analytical views: `V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS`, `V_CRIMINAL_CASE_CHARGES`, `V_PRECEDENT_NETWORK`.

3. **Step 3: Member 3 Demonstration Seed Data**
   ```bash
   mysql -u root -p < database/seeds/02_member3_seeds.sql
   ```
   *Action:*
   - Adds expanded statutory penal charges (`IPC_406`, `IPC_467`, `IT_66D`, `IPC_120B`).
   - Adds fictional corporate entities and defendants (`ENT_008`, `ENT_009`, `ENT_010`).
   - Inserts Supreme Court landmark case (`CASE_800` / `JUDG_800`), trial cases (`CASE_1002`, `CASE_1003`), and civil case (`CASE_3002`).
   - Inserts incidents (`INC_003`, `INC_004`, `INC_005`).
   - Inserts docket charge sheets demonstrating concurrent dockets (`POTENTIALLY_RELATED`) and outcome overlap (`OUTCOME_OVERLAP_REVIEW`).
   - Inserts formal precedent citation `JCIT_01` (`JUDG_900` citing `JUDG_800`).
   - Expands taxonomy tags and case mappings.

4. **Step 4: Member 3 Stored Programs Installation**
   ```bash
   mysql -u root -p < database/stored_programs/member3_procedures.sql
   ```
   *Action:*
   - Installs `Get_Criminal_Case_Dossier(IN p_Case_ID VARCHAR(50))`: Validates inputs, verifies criminal case existence, and outputs the full case, court, defendant, charge, and incident dossier. Uses `LEFT JOIN` on charge sheets to preserve core case details even when zero charge sheets are currently registered.
   - Installs `Search_Proceedings_By_Defendant_Incident(IN p_Defendant_ID VARCHAR(50), IN p_Incident_ID VARCHAR(50))`: Validates inputs, verifies entity and incident existence, and returns all proceedings across cases on the given incident.
   - Installs `Get_Precedent_Citation_Count(p_Judgment_ID VARCHAR(50)) RETURNS INT`: Deterministic helper returning the number of formal judgment-level citations received (`Cited_Judgment_ID = p_Judgment_ID`).

5. **Step 5: Execute Analytical Queries**
   ```bash
   mysql -u root -p < database/queries/member3_queries.sql
   ```

---

### 3. Member 3 Assigned Relations Status

| # | Assigned Relation | Canonical Implementation Details |
|---|---|---|
| 1 | **`CRIMINAL_CASE`** | Primary key `Case_ID`, Foreign key `Case_ID` → `` `CASE`(Case_ID) `` `ON DELETE CASCADE`. Stores `FIR_Or_Complaint_No`, `Bail_Amount`, `Arresting_Agency`. Preserves 1:1 subtype specialization. |
| 2 | **`CIVIL_CASE`** | Primary key `Case_ID`, Foreign key `Case_ID` → `` `CASE`(Case_ID) `` `ON DELETE CASCADE`. Stores `Dispute_Value`, `Civil_Case_Type`. Subtype specialization validated. |
| 3 | **`STATUTE_CHARGE`** | Primary key `Charge_Code`. Central catalog of statutory and penal charges (`IPC_420`, `IPC_302`, `IPC_406`, `IPC_467`, `IT_66D`, `IPC_120B`). Attributes: `Section_Name`, `Description`, `Max_Sentence_Years`. |
| 4 | **`INCIDENT`** | **Dedicated relation created in Migration 01**. Primary key `Incident_ID`, attributes `Incident_Date`, `Location`, `Description`. Serves as the single source of truth for all incident facts. |
| 5 | **`DOCKET_CHARGE_SHEET`** | Normalized to reference `Incident_ID` → `INCIDENT(Incident_ID)`. Dropped redundant legacy timestamp column. Relaxed the unhandled `UNIQUE` constraint to an index; replaced with analytical view `V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS` to flag overlapping dockets for judicial review rather than crashing the database. |
| 6 | **`JUDGMENT_CITATION`** | **Created in Migration 01**. Primary key `Citation_ID`, Foreign keys `Citing_Judgment_ID` → `JUDGMENT(Judgment_ID)` and `Cited_Judgment_ID` → `JUDGMENT(Judgment_ID)`. Stores `Precedent_Treatment` ('Followed', 'Distinguished', 'Overruled') and `Relevance_Note`. Preserves `CASE_CITATION` for counsel submissions in pleadings. |
| 7 | **`PRECEDENT_TAG`** | Primary key `Tag_ID`, `Keyword VARCHAR(100) UNIQUE NOT NULL`. Taxonomy catalog for judicial subject classifications. |
| 8 | **`CASE_TAG_MAPPING`** | Composite primary key `(Case_ID, Tag_ID)`, Foreign keys to `` `CASE` `` and `PRECEDENT_TAG`. Supports many-to-many legal taxonomy classification. |

---

### 4. Stored Programs Implemented for Member 3

1. **`Get_Criminal_Case_Dossier(IN p_Case_ID VARCHAR(50))`**
   - **Type:** Stored Procedure
   - **Purpose:** Fetches complete case details, court hierarchy, defendant information (supporting both `PERSON` and `ORGANIZATION`), statutory charges, and incident details for a single criminal case.
   - **Validation & Errors:**
     - Signals `SQLSTATE '45000'` if `p_Case_ID` is NULL or empty string.
     - Signals `SQLSTATE '45000'` if `p_Case_ID` does not exist in `CRIMINAL_CASE`.
   - **Zero Charge Sheet Resilience:** Uses `LEFT JOIN` on `DOCKET_CHARGE_SHEET`, `STATUTE_CHARGE`, and `INCIDENT` so newly registered criminal cases return basic case and court metadata instead of an empty result set.
   - **Execution Example:**
     ```sql
     CALL Get_Criminal_Case_Dossier('CASE_1002');
     ```

2. **`Search_Proceedings_By_Defendant_Incident(IN p_Defendant_ID VARCHAR(50), IN p_Incident_ID VARCHAR(50))`**
   - **Type:** Stored Procedure
   - **Purpose:** Searches and correlates all criminal proceedings facing a given defendant arising from a specific incident across all courts.
   - **Validation & Errors:**
     - Validates that both input parameters are non-empty.
     - Signals `SQLSTATE '45000'` if `Defendant_ID` does not exist in `LEGAL_ENTITY`.
     - Signals `SQLSTATE '45000'` if `Incident_ID` does not exist in `INCIDENT`.
   - **Execution Example:**
     ```sql
     CALL Search_Proceedings_By_Defendant_Incident('ENT_002', 'INC_001');
     ```

3. **`Get_Precedent_Citation_Count(p_Judgment_ID VARCHAR(50)) RETURNS INT`**
   - **Type:** Stored Function (`NOT DETERMINISTIC READS SQL DATA`)
   - **Purpose:** Returns the exact count of formal incoming citations received by a given judgment in `JUDGMENT_CITATION` (`Cited_Judgment_ID = p_Judgment_ID`).
   - **Execution Example:**
     ```sql
     SELECT Judgment_ID, Verdict_Date, Get_Precedent_Citation_Count('JUDG_800') AS Times_Cited
     FROM JUDGMENT WHERE Judgment_ID = 'JUDG_800';
     ```

---

### 5. Backend Application Integration Mapping

When developing backend APIs (e.g., Express.js, FastAPI, or Spring Boot), integrate the queries and stored programs using parameterized queries / prepared statements (`?` or named placeholders) instead of raw string interpolation:

| Backend Endpoint / Workflow | SQL Target | Application Parameters | Returned Data Structure |
|---|---|---|---|
| `GET /api/criminal-cases/:id/dossier` | `CALL Get_Criminal_Case_Dossier(?)` | `p_Case_ID` (e.g. `'CASE_1002'`) | Array of charge & incident rows with case header |
| `GET /api/proceedings/search?defendant=&incident=` | `CALL Search_Proceedings_By_Defendant_Incident(?, ?)` | `p_Defendant_ID`, `p_Incident_ID` | Array of proceedings matching defendant & incident |
| `GET /api/defendants/:id/history` | Query 2 (Prepared Statement) | `?` (`le.Entity_ID`) | Chronological list of defendant incidents and cases |
| `GET /api/cases/by-statute/:chargeCode` | Query 3 (Prepared Statement) | `?` (`sc.Charge_Code`) | Deduplicated list of criminal cases under statute |
| `GET /api/judicial-review/related-proceedings` | Query 4 (Static View Query) | None (Filterable via `WHERE` / `LIMIT`) | Analytical multi-docket groupings with review category |
| `GET /api/judgments/:id/citations` | Query 5 (Prepared Statement) | `?` (`jc.Cited_Judgment_ID`) | Downstream citing judgments with legal treatment |
| `GET /api/precedents/ranking` | Query 6 (Static Query) | Optional `LIMIT ?` | Judgment citation frequency ranking by incoming citations |
| `GET /api/precedents/tags/search?q=` | Query 7 (Prepared Statement) | `CONCAT('%', ?, '%')` | Taxonomy tags with matching cross-jurisdiction cases |
| `GET /api/cases/:id/tags` | Query 8 (Prepared Statement) | `?` (`c.Case_ID`) | Tag list associated with specific case |

---

### 6. Isolated Test Pipeline (`DBMS_DA2_TEST`)

To safely validate the database migration, stored programs, and analytical queries without risking modification, dropping, or corruption of the primary `DBMS_DA2_CONCEPT` schema, isolated test scripts are maintained under `database/test/`:

| Test Script | Target Schema | Description |
|---|---|---|
| [`01_baseline_test.sql`](test/01_baseline_test.sql) | `DBMS_DA2_TEST` | Creates `DBMS_DA2_TEST`, selects it, drops tables within it, and establishes the 18 shared baseline tables and seeds. |
| [`02_migration_test.sql`](test/02_migration_test.sql) | `DBMS_DA2_TEST` | Establishes `INCIDENT`, normalizes `DOCKET_CHARGE_SHEET`, creates `JUDGMENT_CITATION`, and installs analytical views using `DATABASE()` schema checks. |
| [`03_seeds_test.sql`](test/03_seeds_test.sql) | `DBMS_DA2_TEST` | Populates Member 3 demonstration records strictly into `DBMS_DA2_TEST`. |
| [`04_stored_programs_test.sql`](test/04_stored_programs_test.sql) | `DBMS_DA2_TEST` | Drops and installs stored procedures and functions within `DBMS_DA2_TEST`. |
| [`05_queries_test.sql`](test/05_queries_test.sql) | `DBMS_DA2_TEST` | Executes the 8 analytical and demonstration queries against `DBMS_DA2_TEST`. |

#### Safe Test Execution Sequence

When ready to run integration testing against a local MySQL instance:

```bash
# 1. Establish Isolated Baseline
mysql -u root -p < database/test/01_baseline_test.sql

# 2. Apply Member 3 Refinement Migration
mysql -u root -p < database/test/02_migration_test.sql

# 3. Seed Demonstration Records
mysql -u root -p < database/test/03_seeds_test.sql

# 4. Install Stored Procedures and Functions
mysql -u root -p < database/test/04_stored_programs_test.sql

# 5. Execute Analytical Verification Queries
mysql -u root -p < database/test/05_queries_test.sql
```

> [!IMPORTANT]
> **Safety Guarantee:**  
> - None of the test scripts in `database/test/` contain destructive operations against `DBMS_DA2_CONCEPT`.
> - No `DROP DATABASE` command is used; table recreation is scoped strictly to `DBMS_DA2_TEST`.
> - To test the Node.js backend against this schema, set `DB_NAME=DBMS_DA2_TEST` in `backend/.env`.

