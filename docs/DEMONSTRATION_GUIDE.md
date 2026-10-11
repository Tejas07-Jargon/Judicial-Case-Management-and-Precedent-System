# Judicial Case Management & Precedent System
## Reproducible Demonstration & Viva Guide (DA2 Submission)

<p align="center">
  <img src="assets/logo.png" alt="Judicial Case Management and Precedent System Logo" width="360" />
</p>

This guide provides an end-to-end walkthrough for faculty review, viva examinations, and live technical evaluations. It demonstrates database connectivity, analytical workflows, full-stack CRUD operations, validation constraints, and database routines.

---

### Prerequisites & Environment Setup

- **Database Engine:** MySQL 8.0+ running locally on port `3306`
- **Active Test Database:** `DBMS_DA2_TEST` (verified with 21 base tables and 99 seed rows)
  > ⚠️ **Notice**: For viva demonstration, use the existing active database directly. Do **not** re-run `database/test/01_baseline_test.sql`, as it drops and recreates all tables in `DBMS_DA2_TEST`.
- **Backend Runtime:** Node.js v20+ / v24+
- **Frontend Tooling:** Vite, React 19, TypeScript

---

### Step 1: Starting the Backend & Frontend Services

Open two separate terminal windows in the repository root:

#### Terminal 1 — Backend Service
```bash
cd backend

# Verify database configuration
# Ensure .env points to:
# DB_HOST=localhost, DB_PORT=3306, DB_USER=root, DB_NAME=DBMS_DA2_TEST

# Install dependencies (if not already done)
npm install

# Start the Express server
npm run dev
```
**Expected Console Output:**
```text
[Database] Connected to MySQL database: DBMS_DA2_TEST
[Server] Judicial Backend running on port 5000 in development mode
[Server] Health check available at: http://localhost:5000/api/health
```

#### Terminal 2 — Frontend Application
```bash
cd loading-page

# Install dependencies (if not already done)
npm install

# Launch the Vite development server
npm run dev
```
**Expected Console Output (illustrative):**
```text
  VITE v8.x.x  ready in ~450 ms (illustrative local startup time)

  ➜  Local:   http://localhost:8443/
  ➜  Network: use --host to expose
```

---

### Step 2: Verifying System Health & Database Connectivity

Before demonstrating the UI, verify the backend health endpoints:

1. **Service Liveness:**
   ```bash
   curl -s http://localhost:5000/api/health
   ```
   **Expected Response:**
   ```json
   {
     "status": "UP",
     "timestamp": "2026-10-11T...",
     "uptime": 12.34
   }
   ```

2. **Database Connection Pool Status:**
   ```bash
   curl -s http://localhost:5000/api/health/db
   ```
   **Expected Response:**
   ```json
   {
     "status": "UP",
     "database": "DBMS_DA2_TEST",
     "pool": {
       "totalConnections": 1,
       "activeConnections": 0,
       "idleConnections": 1,
       "queuedRequests": 0
     }
   }
   ```

---

### Step 3: Opening the Web Application

1. Open your browser to **`http://localhost:8443`**.
2. If the initial splash screen appears, click **"Enter System"** or navigate directly.
3. Observe the top header indicator:
   - Green badge: **`Backend Active`** (confirming live communication between Vite proxy and Express).
4. Observe the navigation sidebar divided into two clear operational sections:
   - **Analytical Modules:** Criminal Case Dossier, Search Proceedings, Citation Ranking, Judicial Review, Precedent Taxonomy.
   - **CRUD Management Modules:** Incident Management, Charge Sheet Management, Citation Management.

---

### Step 4: Demonstrating Analytical Workflows

#### 4.1. Criminal Case Dossier
- **Navigation:** Click **"Criminal Case Dossier"** in the sidebar.
- **Action:** Enter Case ID **`CASE_1002`** and click **"Fetch Dossier"** (or select from quick options).
- **Observed Behavior:**
  - Case metadata card displays: Title (`State of TN vs. Vikram Malhotra & Anr`), Status (`Pending`), Court (`Chennai District Court`, Tier: `District`), FIR (`FIR-2025-042`).
  - Charge sheets table displays 3 individual charges linking statutory sections:
    - `IPC_467` (Forgery of Valuable Security)
    - `IPC_420` (Cheating and Dishonesty)
    - `IPC_120B` (Criminal Conspiracy)
  - Displays co-defendants (supporting both individuals and corporate entities) and incident locations.

#### 4.2. Precedent Citation Frequency Ranking
- **Navigation:** Click **"Citation Ranking"** in the sidebar.
- **Observed Behavior:**
  - Ranks judgments by frequency of incoming citations recorded in `JUDGMENT_CITATION`.
  - Displays landmark ruling:
    - **Precedent:** `Union Mercantile Corp vs. Directorate of Enforcement` (`JUDG_800` / `CASE_800`).
    - **Court:** `Supreme Court of India` (Tier: `Supreme`).
    - **Times Cited:** `1` (Cited by `JUDG_900`).
    - **Recorded Treatments:** `Followed`.

#### 4.3. Multi-Docket Judicial Review
- **Navigation:** Click **"Judicial Review"** in the sidebar.
- **Action:** Select filter **"POTENTIALLY_RELATED"** or **"ALL"**.
- **Observed Behavior:**
  - Queries `V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS`.
  - Identifies defendant `Ram Kumar` (`ENT_002`) facing statutory charge `IPC_420` across two concurrent dockets (`CASE_1001` and `CASE_1003`) stemming from incident `INC_001`.
  - Flags review recommendation: *"All matching dockets are currently pending — Consolidation review advised"*.

---

### Step 5: Demonstrating Incident Management (Full CRUD)

- **Navigation:** Click **"Incident Management"** in the sidebar.

#### 5.1. List / Read
- Verify the 4 baseline seed incidents (`INC_001` through `INC_004`) are listed with Date, Location, and Description.

#### 5.2. Create (INSERT)
1. Click **"+ New Incident"** button to open the drawer.
2. Fill out the form:
   - **Incident ID:** `INC_DEMO_01`
   - **Incident Date:** `2025-08-15T10:30`
   - **Location:** `Marina Promenade, Chennai`
   - **Description:** `Unauthorized digital access to municipal records.`
3. Click **"Save Incident"**.
4. **Verification:** A green success toast appears, and `INC_DEMO_01` immediately appears at the top of the table.

#### 5.3. Update (PATCH)
1. In the row for `INC_DEMO_01`, click **"Edit"**.
2. Modify the **Location** field to: `Marina Promenade - Cyber Unit, Chennai`.
3. Click **"Save Changes"**.
4. **Verification:** The table reflects the updated location immediately.

#### 5.4. Delete (DELETE)
1. In the row for `INC_DEMO_01`, click **"Delete"**.
2. Confirm deletion in the modal prompt.
3. **Verification:** Green toast confirms deletion; row disappears from the table.

---

### Step 6: Demonstrating Charge Sheet Management (Full CRUD)

- **Navigation:** Click **"Charge Sheet Management"** in the sidebar.

#### 6.1. List / Read
- Verify existing docket charge sheets (`CHG_01` through `CHG_07`) with correlated Case IDs, Defendants, Statutes, and Incidents.

#### 6.2. Create (INSERT)
1. Click **"+ New Charge Sheet"**.
2. Select or enter:
   - **Charge Sheet ID:** `CHG_DEMO_01`
   - **Criminal Case:** Select `CASE_800` (or `CASE_1002`)
   - **Defendant:** Select `ENT_002` (Ram Kumar)
   - **Statute Charge:** Select `IPC_420`
   - **Incident:** Select `INC_001`
   - **Verdict Type:** `Pending`
   - **Sentence Imposed:** Leave empty or type `Under Investigation`
3. Click **"Save Charge Sheet"**.
4. **Verification:** `CHG_DEMO_01` appears in the list with status `Pending`.

#### 6.3. Update (PATCH)
1. Click **"Edit"** on `CHG_DEMO_01`.
2. Change **Verdict Type** from `Pending` to `Guilty`.
3. Set **Sentence Imposed** to: `2 Years Simple Imprisonment`.
4. Click **"Update Verdict"**.
5. **Verification:** Verdict badge changes to `Guilty` with green highlight, and sentence displays in table.

#### 6.4. Delete (DELETE)
1. Click **"Delete"** on `CHG_DEMO_01`.
2. Confirm the deletion prompt.
3. **Verification:** Record is removed from the database and UI.

---

### Step 7: Demonstrating Judgment Citation Management & Self-Citation Prevention

- **Navigation:** Click **"Citation Management"** in the sidebar.

#### 7.1. Prevent Self-Citations (Constraint Demonstration)
1. Click **"+ New Judgment Citation"**.
2. In **Citing Judgment**, select `JUDG_800`.
3. In **Cited Judgment**, select the exact same `JUDG_800`.
4. Observe the client and server validation:
   - Form warns: *"A judgment cannot cite itself."*
   - Submit attempt triggers HTTP 400 Bad Request error banner: *"A judgment cannot cite itself (Self-citation is legally invalid)"*.

#### 7.2. Create (INSERT)
1. In **Citing Judgment**, select `JUDG_800`.
2. In **Cited Judgment**, select `JUDG_900`.
3. **Citation ID:** `JCIT_DEMO_01`
4. **Precedent Treatment:** Select `Distinguished`.
5. **Relevance Note:** `Distinguished on factual grounds regarding corporate oversight.`
6. Click **"Save Citation"**.
7. **Verification:** `JCIT_DEMO_01` is rendered in the lineage table with `Distinguished` badge.

#### 7.3. Update (PATCH)
1. Click **"Edit"** on `JCIT_DEMO_01`.
2. Update **Precedent Treatment** to `Overruled`.
3. Click **"Update Citation"**.
4. **Verification:** Badge reflects `Overruled` in red.

#### 7.4. Delete (DELETE)
1. Click **"Delete"** on `JCIT_DEMO_01`.
2. Confirm deletion.
3. **Verification:** Lineage table removes the citation cleanly.

---

### Step 8: Demonstrating Precedent Taxonomy Tag Mapping

- **Navigation:** Click **"Precedent Taxonomy"** in the sidebar.

#### 8.1. Tag Assignment (INSERT)
1. Locate case **`CASE_800`** (*Union Mercantile Corp vs. Directorate of Enforcement*).
2. In the case's tag dropdown, select **`TAG_02`** (*Criminal Procedure*).
3. Click **"+ Add Tag"**.
4. **Verification:** The tag pill `Criminal Procedure` immediately appears attached to `CASE_800`.

#### 8.2. Tag Removal (DELETE)
1. Click the **`×`** button on the `Criminal Procedure` pill attached to `CASE_800`.
2. Confirm the removal dialog.
3. **Verification:** Tag pill is cleanly removed from the UI and backend database.

---

### Step 9: Demonstrating SQL Stored Programs & Functions in MySQL

You can execute these commands in MySQL Workbench or the `mysql` CLI to demonstrate database-level logic:

#### Stored Procedure 1: Case Dossier Retrieval
```sql
USE DBMS_DA2_TEST;
CALL Get_Criminal_Case_Dossier('CASE_1002');
```
*Observed Result:* Returns 3 rows linking case metadata, defendant Vikram Malhotra, statutory charges, and incident details.

#### Stored Procedure 2: Proceedings Search by Defendant & Incident
```sql
CALL Search_Proceedings_By_Defendant_Incident('ENT_002', 'INC_001');
```
*Observed Result:* Returns 2 distinct proceedings (`CASE_1001` and `CASE_1003`) facing defendant `Ram Kumar` arising from `INC_001`.

#### Stored Function 1: Court Caseload Counter
```sql
SELECT Get_Court_Case_Count('CRT_SC_01') AS Supreme_Court_Cases;
```
*Observed Result:* Returns integer count `1`.

#### Stored Function 2: Citation Frequency Counter
```sql
SELECT Get_Precedent_Citation_Count('JUDG_800') AS Times_Cited;
```
*Observed Result:* Returns integer count `1` (reflecting incoming citation from `JUDG_900`).

#### Trigger Demonstration: Auto-Close Case on Judgment
```sql
-- Inserting a judgment automatically closes the underlying case
SELECT Status FROM `CASE` WHERE Case_ID = 'CASE_1001';
-- Observed: Pending
```

---

### Step 10: Cleanup & Referential Integrity Rules

When creating records during a live demonstration:
1. **Always clean up in reverse foreign-key order:**
   - Delete `DOCKET_CHARGE_SHEET` records before attempting to delete referenced `INCIDENT` or `STATUTE_CHARGE` records.
   - Delete `JUDGMENT_CITATION` before attempting to delete referenced `JUDGMENT` records.
2. **Foreign-Key Protection:**
   - Attempting to delete `INC_001` while charge sheets `CHG_01` or `CHG_07` exist will return `409 Conflict: FOREIGN_KEY_CONFLICT` with message: *"Cannot delete incident: Active charge sheets depend on this incident record."* This demonstrates active referential integrity protection.
