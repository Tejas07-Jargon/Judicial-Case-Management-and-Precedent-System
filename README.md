# Judicial-Case-Management-and-Precedent-System
A DBMS project for managing judicial cases, court proceedings, appeals, judgments, and legal precedents, with support for case history and retrieval of relevant previous judgments.

--

## Tech Stack

* **Database:** MySQL 8.0+ (PL/SQL Stored Procedures, ACID Transactions, Triggers, Cascading Foreign Keys)
* **Backend:** Node.js, Express.js, `mysql2/promise` connection pool
* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS
* **Package Manager:** `pnpm` (or `npm`)

--

## Directory Structure

```text
├── README.md               # Project documentation and setup guide
├── scripts.sql             # Full DDL, Triggers, Procedures, Seed Data & Consistency Sync
├── queries.sql             # Analytical queries (Q1 to Q15)
│
├── server/                 # Express backend API
│   ├── db.js               # MySQL connection pool configuration
│   ├── index.js            # API routes and stored procedure invocations
│   ├── package.json
│   └── pnpm-lock.yaml
│
└── loading-page/           # Vite + React frontend client
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    ├── package.json
    ├── pnpm-lock.yaml
    └── src/
        ├── App.tsx         # Main UI console (Forms, Visualizations, Banners)
        ├── main.tsx        # Application root entrypoint
        └── index.css       # Styling & theme definitions
   
```



## Prerequisites

Before starting, ensure you have the following installed on your machine:
* **Node.js** (v18.0.0 or higher) & **npm**
* **pnpm** (Recommended): Install via `npm install -g pnpm`
* **MySQL Server** (v8.0 or higher) running locally on port `3306`
* **Git**

---

## Quickstart Setup Guide

### 1. Clone the Repository

```bash
git clone [https://github.com/](https://github.com/)<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

---

### 2. Database Initialization (MySQL)

The `scripts.sql` script creates the database `DBMS_DA2_CONCEPT`, builds all tables, registers PL/SQL procedures and triggers, seeds the initial datasets, and runs post-seeding synchronization.

#### Option A: Using MySQL Command Line Interface (CLI)

```bash
mysql -u root -p < scripts.sql
```
*(Enter your MySQL root password when prompted).*

#### Option B: Using MySQL Workbench / DBeaver

1. Open MySQL Workbench or your preferred SQL editor.
2. Open `scripts.sql` (`File` > `Open SQL Script...`).
3. Execute the entire script (`Cmd + Shift + Enter` on macOS or `Ctrl + Shift + Enter` on Windows).
4. Verify that the database `DBMS_DA2_CONCEPT` is created with all 19 tables populated.

---

### 3. Backend Configuration & Launch

1. Navigate into the `server` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or: npm install
   ```

3. Configure your local database credentials in `server/db.js`:
   ```javascript
   const pool = mysql.createPool({
     host: 'localhost',
     user: 'root',          // Your MySQL username
     password: 'YOUR_MYSQL_PASSWORD', // Set your MySQL password here
     database: 'DBMS_DA2_CONCEPT',
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0
   });
   ```

4. Start the backend server:
   ```bash
   pnpm run dev
   # or: npm run dev
   ```
   *The Express server will start on `http://localhost:3000`.*

---

### 4. Frontend Launch

Open a **separate terminal window**, navigate to the `loading-page` folder, and start the client interface:

1. Navigate into the frontend folder:
   ```bash
   cd loading-page
   ```

2. Install frontend dependencies:
   ```bash
   pnpm install
   # or: npm install
   ```

3. Launch the Vite development server:
   ```bash
   pnpm dev
   # or: npm run dev
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:8443
   ```
   *(If port `8443` is occupied, Vite will automatically print the assigned fallback port in your terminal, e.g., `http://localhost:5173`).*

---

## Core Application Capabilities

### 1. Transactional Operations (CRUD & Lifecycle Management)
* **Registration Workflows:** Atomic registration of Criminal Cases (with FIR and bail guards) and Civil Cases (with claim amount constraints).
* **Hearing Scheduling:** Schedules proceedings while enforcing lifecycle guards (rejects sessions for cases marked `Closed`).
* **Judgment Recording:** Records verdicts and automatically sets case status to `Closed` via database triggers.
* **Counsel & Precedent Management:** Assigns counsel with role verification (`Assign_Counsel_To_Party`) and links legal precedents (`Cite_Precedent`).
* **Granular Deletions:** Deletes parent cases (with full cascading), cancels hearings, drops specific charges, withdraws counsel, or strikes precedent citations without breaking schema integrity.

### 2. Complex Analytical Queries (Q1 – Q15)
* **Q1:** Caseload Distribution across jurisdictional court tiers.
* **Q2:** Active Lawyer Roster and client representations.
* **Q3:** Recursive Appellate Lineage traversal.
* **Q5:** Resolution Duration benchmarking for concluded cases.
* **Q7:** Double Jeopardy risk identification.
* **Q11:** Stalled Docket detection for inactive pending trials.
* **Q12:** Statistical bail outlier analysis.
* **Q13:** Judicial Clearance Rates across individual judges.
* **Q15:** Specialty-specific lawyer success ranking using window functions.

---

## Troubleshooting & FAQ

* **MySQL Access Denied (`ER_ACCESS_DENIED_ERROR`):**  
  Ensure the credentials in `server/db.js` match your local MySQL configuration.
* **Lifecycle Violation Errors on Inserts:**  
  The system strictly enforces legal timelines. Hearings cannot be scheduled for closed cases, and verdict dates cannot precede case filing dates.
* **CORS / Network Error in Browser:**  
  Verify that the backend server is running on port `3000` before interacting with the frontend interface.
