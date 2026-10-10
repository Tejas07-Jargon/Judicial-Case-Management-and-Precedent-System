# Judicial Case Management Backend (Member 3 Module)

Comprehensive REST API for the Judicial Case Management and Precedent System, implementing Member 3's criminal cases, proceedings review, precedent citation networks, and legal taxonomy.

Built with **Node.js**, **Express**, **TypeScript**, and **mysql2/promise**.

---

## 1. Project Architecture

```text
backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Zod-validated environment configuration
│   │   └── database.ts         # mysql2/promise connection pool & health checks
│   ├── middleware/
│   │   └── errorHandler.ts     # Global error handler (translates ER_DUP_ENTRY, 1451, 1452, 45000)
│   ├── types/
│   │   └── judicial.ts         # TypeScript data contracts & response models
│   ├── services/
│   │   └── judicialService.ts  # Stored procedure calls, parameterized SQL & CRUD logic
│   ├── controllers/
│   │   └── judicialController.ts # Zod request validation & HTTP orchestration
│   ├── routes/
│   │   ├── healthRoutes.ts     # /api/health and /api/health/db
│   │   └── judicialRoutes.ts   # Analytical and CRUD /api/v1 endpoints
│   ├── tests/
│   │   └── unit/api.test.ts    # 13 automated unit tests (offline & error handling)
│   ├── app.ts                  # Express application factory
│   └── server.ts               # Server bootstrap with graceful shutdown
├── .env.example                # Configuration template
├── package.json
└── tsconfig.json
```

---

## 2. Environment Configuration

Copy `.env.example` to `.env` and configure your database parameters:

```bash
cp .env.example .env
```

| Key | Description | Default |
|---|---|---|
| `PORT` | Backend HTTP listening port | `5000` |
| `NODE_ENV` | Environment mode (`development`, `production`, `test`) | `development` |
| `DB_HOST` | MySQL Server host | `localhost` |
| `DB_PORT` | MySQL listening port | `3306` |
| `DB_USER` | Database user | `root` |
| `DB_PASSWORD` | Database password | `""` |
| `DB_NAME` | Schema name | `DBMS_DA2_CONCEPT` |
| `DB_CONNECTION_LIMIT` | Maximum pooled connections | `10` |

---

## 3. Running the Server

### Development Mode (with hot-reload):
```bash
npm run dev
```

### Production Build & Run:
```bash
npm run build
npm start
```

---

## 4. Analytical API Workflows (Member 3)

All parameters are bound via parameterized queries (`?`). User inputs are validated with Zod.

### 1. Criminal Case Dossier
- **Route:** `GET /api/v1/criminal-cases/:caseId/dossier`
- **SQL Target:** Stored Procedure `CALL Get_Criminal_Case_Dossier(?)`
- **Example:** `GET /api/v1/criminal-cases/CASE_1002/dossier`
- **Response:** Case and court details, defendant details (supporting both individual persons and corporations), FIR, bail, and charge sheet listings.

### 2. Search Proceedings by Defendant and Incident
- **Route:** `GET /api/v1/proceedings/search?defendantId=...&incidentId=...`
- **SQL Target:** Stored Procedure `CALL Search_Proceedings_By_Defendant_Incident(?, ?)`
- **Example:** `GET /api/v1/proceedings/search?defendantId=ENT_002&incidentId=INC_001`
- **Response:** Correlated list of all proceedings and dispositions across courts facing the defendant on that specific incident.

### 3. Judgment Citation Frequency Ranking
- **Route:** `GET /api/v1/precedents/citation-ranking?limit=10`
- **SQL Target:** Query 6 from `database/queries/member3_queries.sql`
- **Parameters:** `limit` (Integer between 1 and 100, default: 20).
- **Semantics:** Ranks judgments strictly by incoming citations received in `JUDGMENT_CITATION`. Excludes un-cited judgments via `HAVING COUNT > 0`. Preserves deterministic multi-column tie-breakers.

### 4. Defendant Incident History
- **Route:** `GET /api/v1/defendants/:defendantId/incidents`
- **SQL Target:** Query 2 from `database/queries/member3_queries.sql`
- **Example:** `GET /api/v1/defendants/ENT_002/incidents`
- **Response:** Chronological history of incidents, associated cases, charges faced, and recorded outcomes for an individual or corporate defendant.

### 5. Criminal Cases by Statute
- **Route:** `GET /api/v1/criminal-cases/by-statute/:chargeCode`
- **SQL Target:** Query 3 from `database/queries/member3_queries.sql`
- **Example:** `GET /api/v1/criminal-cases/by-statute/IPC_420`
- **Deduplication:** Implements `WHERE EXISTS` on `DOCKET_CHARGE_SHEET` to return each matching case exactly once.

### 6. Judicial-Review Related Proceedings
- **Route:** `GET /api/v1/judicial-review/related-proceedings?category=...&defendantId=...`
- **SQL Target:** Analytical View `V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS`
- **Filters:** Optional `category` (`INSUFFICIENT_OUTCOME_DATA`, `POTENTIALLY_RELATED`, `OUTCOME_OVERLAP_REVIEW`, `MULTIPLE_RECORDED_OUTCOMES_REVIEW`), optional `defendantId`.
- **Legal Integrity:** Flags proceedings for judicial examination; does not make conclusory claims of double jeopardy or statutory plea bars.

### 7. Judgment Citations
- **Route:** `GET /api/v1/judgments/:judgmentId/citations`
- **SQL Target:** Query 5 from `database/queries/member3_queries.sql`
- **Example:** `GET /api/v1/judgments/JUDG_800/citations`
- **Response:** Downstream citing judgments with court details, verdict dates, and recorded precedent treatment (`Followed`, `Distinguished`, `Overruled`).

### 8. Precedent Tag Taxonomy & Case Mapping
- **Search Precedent Tags:** `GET /api/v1/precedents/tags/search?q=Corporate` (Query 7, literal substring search with wildcard escaping).
- **Get Case Tags:** `GET /api/v1/cases/:caseId/tags` (Query 8, taxonomy tags mapped to a specific case).

---

## 5. CRUD Operations

### A. Incidents (`/api/v1/incidents`)
- `POST /api/v1/incidents`: Creates incident (`incidentId`, `incidentDate`, `location`, `description`).
- `GET /api/v1/incidents/:id`: Retrieves incident by primary key.
- `PATCH /api/v1/incidents/:id`: Updates date, location, or description.
- `DELETE /api/v1/incidents/:id`: Deletes incident. Pre-checks for dependent charge sheets; returns `409 Conflict` (`FOREIGN_KEY_CONFLICT`) if referenced.

### B. Charge Sheets (`/api/v1/charge-sheets`)
- `POST /api/v1/charge-sheets`: Inserts docket charge sheet. Validates foreign keys; restricts `verdictType` to `Guilty`, `Acquitted`, or `Pending`.
- `GET /api/v1/charge-sheets/:id`: Retrieves charge sheet by primary key.
- `PATCH /api/v1/charge-sheets/:id`: Updates `verdictType` or `sentenceImposed`.
- `DELETE /api/v1/charge-sheets/:id`: Deletes charge sheet record.

### C. Judgment Citations (`/api/v1/judgment-citations`)
- `POST /api/v1/judgment-citations`: Creates citation (`citationId`, `citingJudgmentId`, `citedJudgmentId`, `precedentTreatment`, `relevanceNote`). Restricts treatment to `Followed`, `Distinguished`, or `Overruled`. Rejects self-citations (`citingJudgmentId === citedJudgmentId`) with `400 Bad Request`.
- `GET /api/v1/judgment-citations/:id`: Retrieves citation record.
- `PATCH /api/v1/judgment-citations/:id`: Updates treatment or relevance note.
- `DELETE /api/v1/judgment-citations/:id`: Deletes citation.

### D. Case Tag Mapping (`/api/v1/cases/:caseId/tags`)
- `POST /api/v1/cases/:caseId/tags`: Maps a tag to a case (`body: { "tagId": "..." }`).
- `DELETE /api/v1/cases/:caseId/tags/:tagId`: Removes tag mapping from case.

---

## 6. Automated Testing

Run the offline unit test suite:
```bash
npm test
```

Test Results: **13 passing tests**, covering:
- Health check endpoints (`/api/health`, `/api/health/db`).
- Input validation (malformed case IDs, missing query params, out-of-range limits, invalid categories, empty search terms).
- CRUD validation (invalid dates, missing required fields, illegal verdict types, invalid precedent treatments, self-citation rejection).
- Offline database error translation (`503 Service Unavailable`).
