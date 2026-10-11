# Judicial Case Management and Precedent System

<p align="center">
  <img src="docs/assets/logo.png" alt="Judicial Case Management and Precedent System Logo" width="400" />
</p>

A comprehensive Database Management System (DBMS DA2) project for managing judicial cases, court proceedings, appeals, charge sheets, judgments, and legal precedents, featuring case history tracking, precedent citation graphs, and complete analytical & CRUD workflows.

---

## 1. System Architecture

The project is built as a three-tier architecture:

- **Frontend**: Single Page Application built with **React 19**, **TypeScript**, and **Vite** (served on port `8443`), featuring responsive judicial dashboards, precedent network views, and interactive CRUD management interfaces.
- **Backend**: RESTful API service built with **Node.js**, **Express**, **TypeScript**, and **mysql2/promise** (served on port `5000`), featuring Zod-based request validation, foreign key and duplicate key error translation, and stored procedure execution.
- **Database**: Relational database engine in **MySQL 8.0** with strict primary key / foreign key integrity, check constraints, subtype specialization tables, stored procedures, functions, triggers, and views.

```text
Judicial-Case-Management-and-Precedent-System/
├── database/                   # Migrations, seed data, and analytical SQL scripts
│   ├── test/                   # Schema migrations 01 & 02 for DA2 test environment
│   └── queries/                # Analytical query suite (member3_queries.sql)
├── backend/                    # Node.js/Express TypeScript REST API
│   ├── src/                    # Controllers, services, routes, middleware, models
│   ├── src/tests/unit/         # Automated unit test suite (13 test cases)
│   └── .env.example            # Backend environment template
├── loading-page/               # React 19 / TypeScript / Vite frontend application
│   ├── src/                    # UI views, components, API client, navigation
│   └── vite.config.ts          # Vite configuration with proxy to backend port 5000
├── docs/                       # Project documentation & submission materials
│   ├── DA2_SUBMISSION_REPORT.md  # Comprehensive technical audit & submission report
│   └── DEMONSTRATION_GUIDE.md    # Step-by-step demonstration walkthrough
├── scripts.sql                 # Canonical baseline DDL & DML script (19 base tables)
├── queries.sql                 # Primary analytical query suite (Queries 1–10)
└── README.md                   # Project overview and setup guide
```

---

## 2. Team Contribution Summary

| Member | Branch | Primary Responsibilities & Implemented Modules |
|---|---|---|
| **Member 1 (Adithya)** | `member1-adithya` | Core legal entities (`PERSON`, `ORGANIZATION`, `LEGAL_ENTITY`), lawyers, bar registrations, courts, judges, baseline queries. |
| **Member 2 (Aryan)** | `member2-aryan` | Case lifecycle management (`CASE`, `CIVIL_CASE`), hearings, bench assignments (`HEARING_BENCH`), case citations, initial schema definition. |
| **Member 3 (Tejas)** | `member3-tejas` | Criminal cases (`CRIMINAL_CASE`), incidents (`INCIDENT`), charge sheets (`DOCKET_CHARGE_SHEET`), judgment citations (`JUDGMENT_CITATION`), precedent taxonomy (`PRECEDENT_TAG`, `CASE_TAG_MAPPING`), full Express backend API, React management views, stored procedures, triggers, views, and test suites. |

> **Note on Branch Integration**: All commits from `member1-adithya`, `member2-aryan`, and `main` have been fully integrated into `member3-tejas`. The `member3-tejas` branch represents the unified superset containing 100% of the team's combined codebase.

---

## 3. Database Schema Overview

The project maintains two distinct schema configurations:

1. **Canonical Baseline Schema (`scripts.sql`)**:
   - 19 base tables, 4 triggers, 1 function, 2 procedures.
   - Populated with 48 baseline seed rows.
   - Designed for conceptual modeling (`DBMS_DA2_CONCEPT`).
2. **Migrated DA2 Test Schema (`DBMS_DA2_TEST`)**:
   - 21 base tables, 3 analytical views, 4 triggers, 2 functions, 4 procedures.
   - Populated with **99 physical seed rows** across all 21 tables (48 baseline + 2 migration backfill + 49 Member 3 operational seeds).
   - Introduces 2 additional base tables: dedicated normalized `INCIDENT` relation and formal `JUDGMENT_CITATION` precedent relation (with baseline catalog `STATUTE_CHARGE` preserved).
   - Introduces 3 analytical views: `V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS`, `V_CRIMINAL_CASE_CHARGES`, and `V_PRECEDENT_NETWORK`.

> ⚠️ **Absolute Safety Rule**: Never modify, drop, or seed `DBMS_DA2_CONCEPT`. All interactive testing, automated tests, and local executions must be performed against `DBMS_DA2_TEST`.

---

## 4. Workflows and Capabilities

### Analytical Workflows
- **Workflow 1: Criminal Case Dossier** (`GET /api/v1/criminal-cases/:caseId/dossier`): Returns multi-table aggregated case dossier with defendant history, charge codes, and court info.
- **Workflow 2: Proceeding Search** (`GET /api/v1/proceedings/search`): Cross-references hearings and charges by defendant or incident.
- **Workflow 3: Precedent Citation Ranking** (`GET /api/v1/precedents/citation-ranking`): Computes citation network authority scores.
- **Workflow 6: Judicial Review Indicators** (`GET /api/v1/judicial-review/related-proceedings`): Identifies defendant overlap across distinct criminal proceedings as an indicator for judicial review.
- **Workflow 8: Precedent Taxonomy Search** (`GET /api/v1/precedents/tags/search`): Explores legal concepts by hierarchy and assigned cases.

### Interactive CRUD Management Interfaces
- **Incident Management** (`/api/v1/incidents`): Complete Create, Read, Update, and Delete for incident records.
- **Charge Sheet Management** (`/api/v1/charge-sheets`): Complete Create, Read, Update (verdict/sentence), and Delete for docket charge sheets.
- **Judgment Citation Management** (`/api/v1/judgment-citations`): Complete Create, Read, Update, and Delete with automated self-citation rejection (`citingJudgmentId != citedJudgmentId`).
- **Case Tagging** (`/api/v1/cases/:caseId/tags`): Assign and remove legal taxonomy tags to cases.

---

## 5. Quick Start & Demonstration

### Prerequisites
- Node.js v18+ (tested on Node.js v24.19)
- MySQL Server 8.0 running on port `3306`

### 1. Database Setup (Isolated Test Sandbox)

The isolated test schema `DBMS_DA2_TEST` provides a safe sandbox for local development, automated testing, and evaluation without touching `DBMS_DA2_CONCEPT`.

#### Mode A: Ordinary Development & Demonstration (Do Not Re-Run Setup)
If `DBMS_DA2_TEST` is already initialized and populated (verified with 21 tables and 99 seed rows):
- **DO NOT re-run `database/test/01_baseline_test.sql`**.
- Proceed directly to **Step 2 (Backend Setup)** and **Step 3 (Frontend Setup)**.

#### Mode B: First-Time Setup or Deliberate Test Environment Reset
Execute the test scripts in strict numerical order **only** during first-time setup or when you explicitly intend to wipe and reset the test environment:

```bash
# Via MySQL command-line client:
mysql -u root -p < database/test/01_baseline_test.sql
mysql -u root -p < database/test/02_migration_test.sql
mysql -u root -p < database/test/03_seeds_test.sql
mysql -u root -p < database/test/04_stored_programs_test.sql
```

Or within an interactive MySQL session:
```sql
SOURCE database/test/01_baseline_test.sql;
SOURCE database/test/02_migration_test.sql;
SOURCE database/test/03_seeds_test.sql;
SOURCE database/test/04_stored_programs_test.sql;
```

> ⚠️ **Destructive Reset Warning (`01_baseline_test.sql`)**:
> `database/test/01_baseline_test.sql` contains unconditional `DROP TABLE IF EXISTS ...` statements for all 19 baseline tables in `DBMS_DA2_TEST`. Rerunning this script against an existing database **destroys all existing records and schema modifications**. Never rerun it unless you deliberately intend a complete reset.

> ⚠️ **Safety Warning on `scripts.sql`**:
> The canonical baseline script `scripts.sql` contains an explicit `USE DBMS_DA2_CONCEPT;` directive and drops/recreates tables in `DBMS_DA2_CONCEPT`. **Never source `scripts.sql` when setting up `DBMS_DA2_TEST`.** Always use the isolated `database/test/` scripts for local testing and demonstration.

#### Role of `05_queries_test.sql`
- **Purpose**: `database/test/05_queries_test.sql` contains read-only SQL queries corresponding to the 8 Member 3 analytical use cases.
- **Requirement**: It is **strictly an optional query-verification script**. It does not create tables, modify data, or install stored programs. It is **not required** for application setup or runtime.

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials (DB_NAME=DBMS_DA2_TEST)
npm install
npm run build
npm test             # Runs 13 automated unit tests
npm run start        # Starts server on port 5000
```

### 3. Frontend Setup
```bash
cd loading-page
npm install
npm run build        # Verifies production build
npm run dev          # Starts Vite dev server on port 8443
```

Open `http://localhost:8443` in your browser to access the Judicial Case Management and Precedent System interface.

---

## 6. Testing & Quality Assurance

- **Backend Unit Tests**: 13/13 passing offline tests in `backend/src/tests/unit/api.test.ts` covering health checks, parameter validation, self-citation prevention, and error codes.
- **Frontend Production Build**: Zero TypeScript errors, bundled with Vite in under 2 seconds.
- **Live CRUD & Regression**: Verified end-to-end against live database with isolated disposable records and automatic cleanup.

For detailed test logs, SQL query analysis, and step-by-step viva instructions, refer to:
- [DA2 Submission Report](docs/DA2_SUBMISSION_REPORT.md)
- [Demonstration & Viva Guide](docs/DEMONSTRATION_GUIDE.md)

---

## 7. Submission Readiness & Outstanding Action Items

### Technical Verification Status
All automated technical checks have passed as documented:
- Express REST API compiles with zero TypeScript errors (`npm run build`).
- Automated unit test suite passes 13/13 offline tests (`npm test`).
- React 19 / Vite frontend builds cleanly with zero errors (`npm run build`).
- Live end-to-end CRUD workflows (Incidents, Charge Sheets, Judgment Citations, and Precedent Taxonomy) are verified against the running application.
- All 10 analytical SQL queries and stored programs execute correctly in `DBMS_DA2_TEST`.

### Outstanding Team & Faculty Items
Prior to final submission and release sign-off, the following items remain open for confirmation:
1. **Team Contribution Confirmation:** Mutual sign-off is required from Member 1 (Adithya), Member 2 (Aryan), and Member 3 (Tejas) to confirm the module and contribution descriptions in Section 2.
2. **Faculty Procedural Dialect Acceptance:** Faculty confirmation is needed regarding whether MySQL 8.0 stored procedures, functions, and triggers fulfill the syllabus "SQL/PL/SQL" requirement (an Oracle PL/SQL syntax translation mapping is documented in `docs/DA2_SUBMISSION_REPORT.md` Section 4.6).
3. **Evaluation Database Selection:** Faculty and team confirmation on whether final grading will occur on `DBMS_DA2_TEST` (21 tables, 99 seed rows) or `DBMS_DA2_CONCEPT`.
4. **DA1 Normalization Proof Alignment:** Verification against the original DA1 functional dependencies matrix if formal mathematical BCNF proof is requested.
