import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../../app';

// Helper to make mock requests against the Express app without external libraries
async function mockRequest(
  app: any,
  method: string,
  url: string,
  body?: any
): Promise<{ status: number; body: any }> {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const port = (server.address() as any).port;
      const fullUrl = `http://127.0.0.1:${port}${url}`;

      fetch(fullUrl, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
      })
        .then(async (res) => {
          const resBody = await res.json().catch(() => null);
          server.close(() => {
            resolve({ status: res.status, body: resBody });
          });
        })
        .catch((err) => {
          server.close(() => {
            throw err;
          });
        });
    });
  });
}

// -----------------------------------------------------------------------------
// 1. HEALTH CHECKS
// -----------------------------------------------------------------------------
test('Health Check: GET /api/health returns 200 UP', async () => {
  const app = createApp();
  const res = await mockRequest(app, 'GET', '/api/health');

  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'UP');
  assert.equal(res.body.service, 'Judicial Case Management Backend');
  assert.ok(res.body.timestamp);
});

test('Health Check: GET /api/health/db returns valid database status', async () => {
  const app = createApp();
  const res = await mockRequest(app, 'GET', '/api/health/db');

  assert.ok([200, 503].includes(res.status));
  if (res.status === 200) {
    assert.equal(res.body.status, 'UP');
    assert.equal(res.body.database, 'CONNECTED');
  } else {
    assert.equal(res.body.status, 'DOWN');
    assert.equal(res.body.database, 'UNAVAILABLE');
  }
});

// -----------------------------------------------------------------------------
// 2. ANALYTICAL WORKFLOW INPUT VALIDATION
// -----------------------------------------------------------------------------
test('Workflow 1: GET /api/v1/criminal-cases/:caseId/dossier with invalid ID format returns 400', async () => {
  const app = createApp();
  const res = await mockRequest(app, 'GET', '/api/v1/criminal-cases/NOT_A_CASE_ID/dossier');

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('Workflow 2: GET /api/v1/proceedings/search missing query parameters returns 400', async () => {
  const app = createApp();
  const res = await mockRequest(app, 'GET', '/api/v1/proceedings/search?defendantId=ENT_002');

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('Workflow 3: GET /api/v1/precedents/citation-ranking with invalid limit returns 400', async () => {
  const app = createApp();
  const res = await mockRequest(app, 'GET', '/api/v1/precedents/citation-ranking?limit=500');

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('Workflow 6: GET /api/v1/judicial-review/related-proceedings with invalid category returns 400', async () => {
  const app = createApp();
  const res = await mockRequest(
    app,
    'GET',
    '/api/v1/judicial-review/related-proceedings?category=INVALID_CATEGORY'
  );

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('Workflow 8: GET /api/v1/precedents/tags/search with empty query returns 400', async () => {
  const app = createApp();
  const res = await mockRequest(app, 'GET', '/api/v1/precedents/tags/search?q=');

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

// -----------------------------------------------------------------------------
// 3. CRUD INPUT VALIDATION
// -----------------------------------------------------------------------------
test('CRUD Incident: POST /api/v1/incidents with invalid date format returns 400', async () => {
  const app = createApp();
  const res = await mockRequest(app, 'POST', '/api/v1/incidents', {
    incidentId: 'INC_999',
    incidentDate: 'not-a-valid-date',
    location: 'Chennai',
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('CRUD Incident: POST /api/v1/incidents with missing location returns 400', async () => {
  const app = createApp();
  const res = await mockRequest(app, 'POST', '/api/v1/incidents', {
    incidentId: 'INC_999',
    incidentDate: '2025-01-01T10:00:00Z',
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('CRUD Charge Sheet: POST /api/v1/charge-sheets with invalid verdict returns 400', async () => {
  const app = createApp();
  const res = await mockRequest(app, 'POST', '/api/v1/charge-sheets', {
    chargeSheetId: 'CHG_99',
    criminalCaseId: 'CASE_1002',
    defendantId: 'ENT_009',
    chargeCode: 'IPC_420',
    incidentId: 'INC_001',
    verdictType: 'UNRECOGNIZED_VERDICT',
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('CRUD Judgment Citation: POST /api/v1/judgment-citations with invalid treatment returns 400', async () => {
  const app = createApp();
  const res = await mockRequest(app, 'POST', '/api/v1/judgment-citations', {
    citationId: 'JCIT_99',
    citingJudgmentId: 'JUDG_900',
    citedJudgmentId: 'JUDG_800',
    precedentTreatment: 'NOT_A_LEGAL_TREATMENT',
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

test('CRUD Judgment Citation: Self-citation rejection when citing = cited ID returns 400', async () => {
  const app = createApp();
  // Self-citation is rejected at the service level before hitting the database
  const res = await mockRequest(app, 'POST', '/api/v1/judgment-citations', {
    citationId: 'JCIT_SAME',
    citingJudgmentId: 'JUDG_800',
    citedJudgmentId: 'JUDG_800',
    precedentTreatment: 'Followed',
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'SELF_CITATION_INVALID');
});

test('CRUD Case Tag: POST /api/v1/cases/:caseId/tags with invalid Case ID format returns 400', async () => {
  const app = createApp();
  const res = await mockRequest(app, 'POST', '/api/v1/cases/BAD_CASE/tags', {
    tagId: 'TAG_01',
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});
