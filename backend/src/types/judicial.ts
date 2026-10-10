/**
 * Raw row structure returned by Get_Criminal_Case_Dossier stored procedure.
 */
export interface RawCriminalCaseDossierRow {
  Case_ID: string;
  Case_Title: string;
  Case_Status: string;
  Filing_Date: string | Date;
  Court_ID: string;
  Court_Name: string;
  Court_Tier: string;
  FIR_Or_Complaint_No: string;
  Arresting_Agency: string;
  Bail_Amount: number | string | null;
  Charge_Sheet_ID: string | null;
  Defendant_ID: string | null;
  Defendant_Name: string;
  Defendant_Type: string;
  Charge_Code: string | null;
  Statutory_Section: string;
  Max_Sentence_Years: number | null;
  Incident_ID: string | null;
  Incident_Date: string | Date | null;
  Incident_Location: string | null;
  Incident_Summary: string | null;
  Recorded_Verdict: string;
  Sentence_Imposed: string;
}

/**
 * Clean transformed response structure for Criminal Case Dossier.
 */
export interface CriminalCaseDossierResponse {
  caseId: string;
  caseTitle: string;
  caseStatus: string;
  filingDate: string | Date;
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
      incidentDate: string | Date | null;
      location: string | null;
      summary: string | null;
    } | null;
    recordedVerdict: string;
    sentenceImposed: string;
  }>;
}

/**
 * Raw row structure returned by Search_Proceedings_By_Defendant_Incident.
 */
export interface RawProceedingSearchRow {
  Charge_Sheet_ID: string;
  Defendant_ID: string;
  Defendant_Name: string;
  Defendant_Type: string;
  Incident_ID: string;
  Incident_Date: string | Date;
  Incident_Location: string;
  Case_ID: string;
  Case_Title: string;
  Case_Status: string;
  Case_Filing_Date: string | Date;
  Court_Name: string;
  Charge_Code: string;
  Statutory_Section: string;
  Recorded_Verdict: string;
  Sentence_Imposed: string;
}

/**
 * Transformed structure for proceeding search items.
 */
export interface ProceedingSearchItem {
  chargeSheetId: string;
  defendantId: string;
  defendantName: string;
  defendantType: string;
  incidentId: string;
  incidentDate: string | Date;
  incidentLocation: string;
  caseId: string;
  caseTitle: string;
  caseStatus: string;
  caseFilingDate: string | Date;
  courtName: string;
  chargeCode: string;
  statutorySection: string;
  recordedVerdict: string;
  sentenceImposed: string;
}

/**
 * Raw row structure returned by Query 6 (Citation Frequency Ranking).
 */
export interface RawCitationRankingRow {
  Judgment_ID: string;
  Case_ID: string;
  Precedent_Case_Title: string;
  Rendering_Court: string;
  Court_Tier: string;
  Verdict_Date: string | Date;
  Times_Cited_In_Judgments: number | string;
  Treatments_Recorded: string;
}

/**
 * Transformed structure for citation ranking items.
 */
export interface CitationRankingItem {
  rank: number;
  judgmentId: string;
  caseId: string;
  precedentCaseTitle: string;
  renderingCourt: string;
  courtTier: string;
  verdictDate: string | Date;
  timesCitedInJudgments: number;
  treatmentsRecorded: string[];
}

/**
 * Query 2: Defendant Incident History Raw Row
 */
export interface RawDefendantIncidentHistoryRow {
  Defendant_ID: string;
  Defendant_Name: string;
  Defendant_Type: string;
  Incident_ID: string;
  Incident_Date: string | Date;
  Incident_Location: string;
  Incident_Details: string | null;
  Case_ID: string;
  Associated_Case_Title: string;
  Charge_Code: string;
  Charge_Faced: string;
  Recorded_Verdict: string;
  Sentence_Imposed: string;
}

export interface DefendantIncidentHistoryItem {
  defendantId: string;
  defendantName: string;
  defendantType: string;
  incident: {
    incidentId: string;
    incidentDate: string | Date;
    location: string;
    details: string | null;
  };
  associatedCase: {
    caseId: string;
    caseTitle: string;
  };
  charge: {
    chargeCode: string;
    statutorySection: string;
  };
  recordedVerdict: string;
  sentenceImposed: string;
}

/**
 * Query 3: Criminal Cases by Statute Raw Row
 */
export interface RawCaseByStatuteRow {
  Case_ID: string;
  Case_Title: string;
  Case_Status: string;
  Filing_Date: string | Date;
  Court_Name: string;
  Court_Tier: string;
  FIR_Or_Complaint_No: string;
  Arresting_Agency: string;
  Charge_Code: string;
  Statutory_Section: string;
  Max_Sentence_Years: number | null;
}

export interface CaseByStatuteItem {
  caseId: string;
  caseTitle: string;
  caseStatus: string;
  filingDate: string | Date;
  courtName: string;
  courtTier: string;
  firNumber: string;
  arrestingAgency: string;
  chargeCode: string;
  statutorySection: string;
  maxSentenceYears: number | null;
}

/**
 * Query 4: Judicial Review Overlapping Proceedings Raw Row
 */
export interface RawJudicialReviewRow {
  Defendant_ID: string;
  Defendant_Name: string;
  Defendant_Type: string;
  Charge_Code: string;
  Charge_Section: string;
  Incident_ID: string;
  Incident_Date: string | Date;
  Incident_Location: string;
  Total_Dockets_Count: number | string;
  Recorded_Conviction_Count: number | string;
  Recorded_Acquittal_Count: number | string;
  Pending_Dockets_Count: number | string;
  Unclassified_Outcome_Count: number | string;
  Involving_Cases: string;
  Recorded_Outcomes: string;
  Review_Status_Category: string;
  Judicial_Review_Indicator: string;
}

export interface JudicialReviewItem {
  defendantId: string;
  defendantName: string;
  defendantType: string;
  chargeCode: string;
  chargeSection: string;
  incidentId: string;
  incidentDate: string | Date;
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
  reviewStatusCategory: string;
  judicialReviewIndicator: string;
}

/**
 * Query 5: Judgment Citations Raw Row
 */
export interface RawJudgmentCitationRow {
  Citation_ID: string;
  Cited_Judgment_ID: string;
  Precedent_Case_ID: string;
  Precedent_Case_Title: string;
  Precedent_Verdict_Date: string | Date;
  Citing_Judgment_ID: string;
  Citing_Case_ID: string;
  Citing_Case_Title: string;
  Citing_Court: string;
  Citing_Verdict_Date: string | Date;
  Precedent_Treatment: string;
  Relevance_Note: string | null;
}

export interface JudgmentCitationItem {
  citationId: string;
  citedJudgmentId: string;
  precedentCaseId: string;
  precedentCaseTitle: string;
  precedentVerdictDate: string | Date;
  citingJudgmentId: string;
  citingCaseId: string;
  citingCaseTitle: string;
  citingCourt: string;
  citingVerdictDate: string | Date;
  precedentTreatment: string;
  relevanceNote: string | null;
}

/**
 * Query 7: Precedent Tag Search Raw Row
 */
export interface RawPrecedentTagSearchRow {
  Tag_ID: string;
  Precedent_Tag: string;
  Case_ID: string;
  Case_Title: string;
  Court_Name: string;
  Court_Tier: string;
  Case_Status: string;
  Filing_Date: string | Date;
  Jurisdiction_Type: string;
}

export interface PrecedentTagSearchItem {
  tagId: string;
  precedentTag: string;
  caseId: string;
  caseTitle: string;
  courtName: string;
  courtTier: string;
  caseStatus: string;
  filingDate: string | Date;
  jurisdictionType: string;
}

/**
 * Query 8: Case Tags Raw Row
 */
export interface RawCaseTagRow {
  Case_ID: string;
  Case_Title: string;
  Case_Status: string;
  Court_Name: string;
  Jurisdiction_Type: string;
  Tag_ID: string;
  Assigned_Tag: string;
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

/**
 * CRUD Model: Incident
 */
export interface IncidentModel {
  Incident_ID: string;
  Incident_Date: string | Date;
  Location: string;
  Description: string | null;
}

/**
 * CRUD Model: Docket Charge Sheet
 */
export interface DocketChargeSheetModel {
  Charge_Sheet_ID: string;
  Criminal_Case_ID: string;
  Defendant_ID: string;
  Charge_Code: string;
  Incident_ID: string;
  Verdict_Type: 'Guilty' | 'Acquitted' | 'Pending';
  Sentence_Imposed: string | null;
}

/**
 * CRUD Model: Judgment Citation
 */
export interface JudgmentCitationModel {
  Citation_ID: string;
  Citing_Judgment_ID: string;
  Cited_Judgment_ID: string;
  Relevance_Note: string | null;
  Precedent_Treatment: 'Followed' | 'Distinguished' | 'Overruled';
}
