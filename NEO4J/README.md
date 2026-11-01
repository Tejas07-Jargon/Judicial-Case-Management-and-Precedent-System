# Judicial Case Management System (Neo4j Graph Implementation)

This directory contains the Graph Database implementation of the Judicial Case Management System. It serves as a direct architectural migration from the relational (MySQL) baseline, redesigned to eliminate relational impedance mismatch using Index-Free Adjacency (IFA).

## Tech Stack
* **Database:** Neo4j (Labeled Property Graph)
* **Backend:** Node.js, Express.js, `neo4j-driver`
* **Frontend:** React 19, TypeScript, Vite
* **Query Language:** Cypher

## Key Architectural Upgrades
* **Index-Free Adjacency:** Replaced expensive multi-table `JOIN` operations with constant-time $O(1)$ graph pointer traversals for entity resolution (Judges, Courts, Lawyers).
* **Recursive Hierarchies:** Variable-length path traversals (`[:APPEALED_FROM*1..]`) compute multi-tier appellate lineages (District -> High Court -> Supreme Court) without relational CTE performance penalties.
* **Native Full-Text Search:** Utilizes Neo4j's internal Lucene engine for tokenized substring matching and algorithmic relevance scoring, replacing unindexed `CONTAINS`/`LIKE` table scans.
* **Client-Side Offloading:** Implements "Fetch-Mode" analytical query explorer. Heavy graph aggregations are materialized on the DBMS, while tabular filtering is delegated to the React client's in-memory execution to preserve database connection pools.

## Graph Schema Overview
* **Nodes:** `:Case`, `:Court`, `:Judge`, `:Lawyer`, `:CaseParty`, `:Hearing`, `:Judgment`, `:ChargeSheet`
* **Relationships:** `[:FILED_IN]`, `[:PRESIDED_BY]`, `[:FOR_CASE]`, `[:REPRESENTS]`, `[:HAS_HEARING]`, `[:APPEALED_FROM]`, `[:CITES]`

## Prerequisites
* Node.js (v18+)
* Neo4j Desktop or Neo4j AuraDB instance running locally on bolt port `7687`

## Installation & Setup

**1. Environment Configuration**
Create a `.env` file in the `server/` directory with your Neo4j credentials:
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
2. Install Dependencies
Navigate to both the server and client directories to install packages:

Bash
cd server && npm install
cd ../client && npm install
3. Database Initialization (Schema & Seeding)
Wipe the current graph, apply uniqueness constraints, construct the B-Tree/Lucene indexes, and bulk-load the mock judicial ecosystem:

Bash
cd server
node seed.js
4. Start the Application
Run the API Gateway (Backend):

Bash
cd server
npm start
Run the React Client (Frontend):

Bash
cd client
npm run dev
Directory Structure
/server/seed.js - Automated teardown, schema constraint configuration, and graph entity ingestion.

/server/index.js - Express API gateway and Cypher query execution routes.

/client/src/ - React frontend featuring dynamic graph lookups and in-memory analytical filtering.