// ============================================================================
// API Response Types matching the backend contracts
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export interface HealthResponse {
  status: 'UP' | 'DOWN';
  timestamp: string;
  service?: string;
  database?: 'CONNECTED' | 'UNAVAILABLE';
  error?: string;
}

export interface CriminalCaseDossier {
  caseId: string;
  caseTitle: string;
  caseStatus: string;
  filingDate: string;
  court: {
    courtId: string;
    courtName: string;
    courtTier: string;
  };
  criminalDetails: {
    firNumber: string;
    arrestingAgency: string;
    bailAmount: number | null;
  };
  charges: Array<{
    chargeSheetId: string | null;
    defendantId: string | null;
    defendantName: string;
    defendantType: string;
    chargeCode: string | null;
    statutorySection: string;
    maxSentenceYears: number | null;
    incident: {
      incidentId: string | null;
      incidentDate: string | null;
      location: string | null;
      summary: string | null;
    } | null;
    recordedVerdict: string;
    sentenceImposed: string;
  }>;
}

export interface CitationRankingItem {
  rank: number;
  judgmentId: string;
  caseId: string;
  precedentCaseTitle: string;
  renderingCourt: string;
  courtTier: string;
  verdictDate: string;
  timesCitedInJudgments: number;
  treatmentsRecorded: string[];
}

export interface CitationRankingResponse {
  count: number;
  ranking: CitationRankingItem[];
}

export interface JudicialReviewItem {
  defendantId: string;
  defendantName: string;
  defendantType: string;
  chargeCode: string;
  chargeSection: string;
  incidentId: string;
  incidentDate: string;
  incidentLocation: string;
  metrics: {
    totalDocketsCount: number;
    recordedConvictionCount: number;
    recordedAcquittalCount: number;
    pendingDocketsCount: number;
    unclassifiedOutcomeCount: number;
  };
  involvingCases: string[];
  recordedOutcomes: string[];
  reviewStatusCategory:
    | 'INSUFFICIENT_OUTCOME_DATA'
    | 'POTENTIALLY_RELATED'
    | 'OUTCOME_OVERLAP_REVIEW'
    | 'MULTIPLE_RECORDED_OUTCOMES_REVIEW';
  judicialReviewIndicator: string;
}

export interface JudicialReviewResponse {
  count: number;
  proceedings: JudicialReviewItem[];
}

export interface PrecedentTagSearchItem {
  tagId: string;
  precedentTag: string;
  caseId: string;
  caseTitle: string;
  courtName: string;
  courtTier: string;
  caseStatus: string;
  filingDate: string;
  jurisdictionType: string;
}

export interface PrecedentTagSearchResponse {
  query: string;
  count: number;
  tags: PrecedentTagSearchItem[];
}

export interface CaseTagItem {
  caseId: string;
  caseTitle: string;
  caseStatus: string;
  courtName: string;
  jurisdictionType: string;
  tagId: string;
  assignedTag: string;
}

export interface CaseTagsResponse {
  caseId: string;
  count: number;
  tags: CaseTagItem[];
}

// ============================================================================
// CRUD Interfaces
// ============================================================================

export interface Incident {
  Incident_ID: string;
  Incident_Date: string;
  Location: string;
  Description: string | null;
}

export interface IncidentsResponse {
  count: number;
  incidents: Incident[];
}

export interface ChargeSheet {
  Charge_Sheet_ID: string;
  Criminal_Case_ID: string;
  Defendant_ID: string;
  Defendant_Name?: string;
  Charge_Code: string;
  Charge_Section?: string;
  Incident_ID: string;
  Verdict_Type: 'Guilty' | 'Acquitted' | 'Pending';
  Sentence_Imposed: string | null;
}

export interface ChargeSheetsResponse {
  count: number;
  chargeSheets: ChargeSheet[];
}

export interface JudgmentCitation {
  Citation_ID: string;
  Citing_Judgment_ID: string;
  Cited_Judgment_ID: string;
  Precedent_Treatment: 'Followed' | 'Distinguished' | 'Overruled';
  Relevance_Note: string | null;
  Citing_Case_Title?: string;
  Cited_Case_Title?: string;
}

export interface JudgmentCitationsResponse {
  count: number;
  citations: JudgmentCitation[];
}

export interface LookupOptions {
  cases: Array<{ caseId: string; title: string }>;
  defendants: Array<{ entityId: string; label: string }>;
  statutes: Array<{ chargeCode: string; sectionName: string }>;
  incidents: Array<{ incidentId: string; location: string; incidentDate?: string }>;
  judgments: Array<{ judgmentId: string; caseId: string; caseTitle?: string }>;
  tags: Array<{ tagId: string; keyword: string }>;
}


// ============================================================================
// Typed API Client
// ============================================================================

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code: string, statusCode: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(options?.headers || {}),
      },
    });
  } catch (networkErr: any) {
    throw new ApiClientError(
      'Unable to connect to the backend server. Please verify that the API service is running.',
      'NETWORK_ERROR',
      0
    );
  }

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const errorPayload = data as ApiErrorResponse | null;
    const errorMessage =
      errorPayload?.error?.message ||
      (res.status === 503
        ? 'Database service is currently unreachable or starting up.'
        : `Request failed with HTTP status ${res.status}`);
    const errorCode = errorPayload?.error?.code || (res.status === 503 ? 'SERVICE_UNAVAILABLE' : 'HTTP_ERROR');

    throw new ApiClientError(errorMessage, errorCode, res.status, errorPayload?.error?.details);
  }

  return data as T;
}

export const api = {
  // Health
  checkHealth: () => request<HealthResponse>('/api/health'),
  checkDbHealth: () => request<HealthResponse>('/api/health/db'),

  // Workflow A: Criminal Case Dossier
  getCriminalCaseDossier: (caseId: string) =>
    request<CriminalCaseDossier>(`/api/v1/criminal-cases/${encodeURIComponent(caseId)}/dossier`),

  // Workflow B: Citation Ranking
  getCitationRanking: (limit: number = 20) =>
    request<CitationRankingResponse>(`/api/v1/precedents/citation-ranking?limit=${limit}`),

  // Workflow C: Judicial Review Related Proceedings
  getJudicialReview: (params?: { category?: string; defendantId?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.defendantId) query.set('defendantId', params.defendantId);
    const qs = query.toString();
    return request<JudicialReviewResponse>(`/api/v1/judicial-review/related-proceedings${qs ? `?${qs}` : ''}`);
  },

  // Workflow D: Precedent Taxonomy Search
  searchPrecedentTags: (q: string) =>
    request<PrecedentTagSearchResponse>(`/api/v1/precedents/tags/search?q=${encodeURIComponent(q)}`),

  // Workflow D (Secondary): Case Tag Mapping
  getCaseTags: (caseId: string) =>
    request<CaseTagsResponse>(`/api/v1/cases/${encodeURIComponent(caseId)}/tags`),

  // =========================================================================
  // CRUD A: Incident Management
  // =========================================================================
  getAllIncidents: () => request<IncidentsResponse>('/api/v1/incidents'),
  getIncidentById: (id: string) => request<Incident>(`/api/v1/incidents/${encodeURIComponent(id)}`),
  createIncident: (data: {
    incidentId: string;
    incidentDate: string;
    location: string;
    description?: string;
  }) =>
    request<Incident>('/api/v1/incidents', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateIncident: (
    id: string,
    data: { incidentDate?: string; location?: string; description?: string }
  ) =>
    request<Incident>(`/api/v1/incidents/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteIncident: (id: string) =>
    request<{ deleted: boolean; incidentId: string }>(`/api/v1/incidents/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  // =========================================================================
  // CRUD B: Charge Sheet Management
  // =========================================================================
  getAllChargeSheets: () => request<ChargeSheetsResponse>('/api/v1/charge-sheets'),
  getChargeSheetById: (id: string) =>
    request<ChargeSheet>(`/api/v1/charge-sheets/${encodeURIComponent(id)}`),
  createChargeSheet: (data: {
    chargeSheetId: string;
    criminalCaseId: string;
    defendantId: string;
    chargeCode: string;
    incidentId: string;
    verdictType?: 'Guilty' | 'Acquitted' | 'Pending';
    sentenceImposed?: string;
  }) =>
    request<ChargeSheet>('/api/v1/charge-sheets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateChargeSheet: (
    id: string,
    data: { verdictType?: 'Guilty' | 'Acquitted' | 'Pending'; sentenceImposed?: string }
  ) =>
    request<ChargeSheet>(`/api/v1/charge-sheets/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteChargeSheet: (id: string) =>
    request<{ deleted: boolean; chargeSheetId: string }>(
      `/api/v1/charge-sheets/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    ),

  // =========================================================================
  // CRUD C: Judgment Citation Management & Case Tags
  // =========================================================================
  getAllJudgmentCitations: () => request<JudgmentCitationsResponse>('/api/v1/judgment-citations'),
  getJudgmentCitationById: (id: string) =>
    request<JudgmentCitation>(`/api/v1/judgment-citations/${encodeURIComponent(id)}`),
  createJudgmentCitation: (data: {
    citationId: string;
    citingJudgmentId: string;
    citedJudgmentId: string;
    precedentTreatment?: 'Followed' | 'Distinguished' | 'Overruled';
    relevanceNote?: string;
  }) =>
    request<JudgmentCitation>('/api/v1/judgment-citations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateJudgmentCitation: (
    id: string,
    data: { precedentTreatment?: 'Followed' | 'Distinguished' | 'Overruled'; relevanceNote?: string }
  ) =>
    request<JudgmentCitation>(`/api/v1/judgment-citations/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteJudgmentCitation: (id: string) =>
    request<{ deleted: boolean; citationId: string }>(
      `/api/v1/judgment-citations/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    ),

  // Case Tag Management
  addCaseTag: (caseId: string, tagId: string) =>
    request<{ caseId: string; tagId: string }>(`/api/v1/cases/${encodeURIComponent(caseId)}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagId }),
    }),
  removeCaseTag: (caseId: string, tagId: string) =>
    request<{ deleted: boolean }>(
      `/api/v1/cases/${encodeURIComponent(caseId)}/tags/${encodeURIComponent(tagId)}`,
      { method: 'DELETE' }
    ),

  // Lookups
  getLookupOptions: () => request<LookupOptions>('/api/v1/lookup-options'),
};
