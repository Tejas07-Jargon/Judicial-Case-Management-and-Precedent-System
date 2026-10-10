import { getDbPool } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import {
  RawCriminalCaseDossierRow,
  CriminalCaseDossierResponse,
  RawProceedingSearchRow,
  ProceedingSearchItem,
  RawCitationRankingRow,
  CitationRankingItem,
  RawDefendantIncidentHistoryRow,
  DefendantIncidentHistoryItem,
  RawCaseByStatuteRow,
  CaseByStatuteItem,
  RawJudicialReviewRow,
  JudicialReviewItem,
  RawJudgmentCitationRow,
  JudgmentCitationItem,
  RawPrecedentTagSearchRow,
  PrecedentTagSearchItem,
  RawCaseTagRow,
  CaseTagItem,
  IncidentModel,
  DocketChargeSheetModel,
  JudgmentCitationModel,
} from '../types/judicial';

export class JudicialService {
  // =========================================================================
  // WORKFLOW 1: Criminal Case Dossier (Stored Procedure)
  // =========================================================================
  public static async getCriminalCaseDossier(caseId: string): Promise<CriminalCaseDossierResponse> {
    const pool = getDbPool();
    const [resultSets] = await pool.query('CALL Get_Criminal_Case_Dossier(?)', [caseId]);

    const rawRows = (Array.isArray(resultSets) && Array.isArray(resultSets[0])
      ? resultSets[0]
      : []) as RawCriminalCaseDossierRow[];

    if (!rawRows || rawRows.length === 0) {
      throw new AppError(404, 'CASE_NOT_FOUND', `Criminal case '${caseId}' was not found.`);
    }

    const firstRow = rawRows[0];

    return {
      caseId: firstRow.Case_ID,
      caseTitle: firstRow.Case_Title,
      caseStatus: firstRow.Case_Status,
      filingDate: firstRow.Filing_Date,
      court: {
        courtId: firstRow.Court_ID,
        courtName: firstRow.Court_Name,
        courtTier: firstRow.Court_Tier,
      },
      criminalDetails: {
        firNumber: firstRow.FIR_Or_Complaint_No,
        arrestingAgency: firstRow.Arresting_Agency,
        bailAmount: firstRow.Bail_Amount !== null ? Number(firstRow.Bail_Amount) : null,
      },
      charges: rawRows
        .filter((row) => row.Charge_Sheet_ID !== null)
        .map((row) => ({
          chargeSheetId: row.Charge_Sheet_ID,
          defendantId: row.Defendant_ID,
          defendantName: row.Defendant_Name,
          defendantType: row.Defendant_Type,
          chargeCode: row.Charge_Code,
          statutorySection: row.Statutory_Section,
          maxSentenceYears: row.Max_Sentence_Years !== null ? Number(row.Max_Sentence_Years) : null,
          incident: row.Incident_ID
            ? {
                incidentId: row.Incident_ID,
                incidentDate: row.Incident_Date,
                location: row.Incident_Location,
                summary: row.Incident_Summary,
              }
            : null,
          recordedVerdict: row.Recorded_Verdict,
          sentenceImposed: row.Sentence_Imposed,
        })),
    };
  }

  // =========================================================================
  // WORKFLOW 2: Proceeding Search by Defendant and Incident (Stored Procedure)
  // =========================================================================
  public static async searchProceedingsByDefendantIncident(
    defendantId: string,
    incidentId: string
  ): Promise<ProceedingSearchItem[]> {
    const pool = getDbPool();
    const [resultSets] = await pool.query(
      'CALL Search_Proceedings_By_Defendant_Incident(?, ?)',
      [defendantId, incidentId]
    );

    const rawRows = (Array.isArray(resultSets) && Array.isArray(resultSets[0])
      ? resultSets[0]
      : []) as RawProceedingSearchRow[];

    return rawRows.map((row) => ({
      chargeSheetId: row.Charge_Sheet_ID,
      defendantId: row.Defendant_ID,
      defendantName: row.Defendant_Name,
      defendantType: row.Defendant_Type,
      incidentId: row.Incident_ID,
      incidentDate: row.Incident_Date,
      incidentLocation: row.Incident_Location,
      caseId: row.Case_ID,
      caseTitle: row.Case_Title,
      caseStatus: row.Case_Status,
      caseFilingDate: row.Case_Filing_Date,
      courtName: row.Court_Name,
      chargeCode: row.Charge_Code,
      statutorySection: row.Statutory_Section,
      recordedVerdict: row.Recorded_Verdict,
      sentenceImposed: row.Sentence_Imposed,
    }));
  }

  // =========================================================================
  // WORKFLOW 3: Citation Frequency Ranking (Query 6)
  // =========================================================================
  public static async getCitationRanking(limit: number): Promise<CitationRankingItem[]> {
    const pool = getDbPool();
    const sql = `
      SELECT 
          j.Judgment_ID,
          c.Case_ID,
          c.Title AS Precedent_Case_Title,
          ct.Court_Name AS Rendering_Court,
          ct.Tier_Level AS Court_Tier,
          j.Verdict_Date,
          COUNT(jc.Citation_ID) AS Times_Cited_In_Judgments,
          COALESCE(GROUP_CONCAT(DISTINCT jc.Precedent_Treatment ORDER BY jc.Precedent_Treatment SEPARATOR ', '), 'None Recorded') AS Treatments_Recorded
      FROM JUDGMENT j
      JOIN \`CASE\` c ON j.Case_ID = c.Case_ID
      JOIN COURT ct ON c.Court_ID = ct.Court_ID
      LEFT JOIN JUDGMENT_CITATION jc ON j.Judgment_ID = jc.Cited_Judgment_ID
      GROUP BY j.Judgment_ID, c.Case_ID, c.Title, ct.Court_Name, ct.Tier_Level, j.Verdict_Date
      HAVING COUNT(jc.Citation_ID) > 0
      ORDER BY Times_Cited_In_Judgments DESC, j.Verdict_Date ASC, j.Judgment_ID ASC
      LIMIT ?
    `;

    const [rows] = await pool.query(sql, [limit]);
    const rawRows = rows as RawCitationRankingRow[];

    return rawRows.map((row, index) => ({
      rank: index + 1,
      judgmentId: row.Judgment_ID,
      caseId: row.Case_ID,
      precedentCaseTitle: row.Precedent_Case_Title,
      renderingCourt: row.Rendering_Court,
      courtTier: row.Court_Tier,
      verdictDate: row.Verdict_Date,
      timesCitedInJudgments: Number(row.Times_Cited_In_Judgments),
      treatmentsRecorded:
        row.Treatments_Recorded && row.Treatments_Recorded !== 'None Recorded'
          ? row.Treatments_Recorded.split(', ')
          : [],
    }));
  }

  // =========================================================================
  // WORKFLOW 4: Defendant Incident History (Query 2)
  // =========================================================================
  public static async getDefendantIncidentHistory(
    defendantId: string
  ): Promise<DefendantIncidentHistoryItem[]> {
    const pool = getDbPool();
    const sql = `
      SELECT 
          le.Entity_ID AS Defendant_ID,
          COALESCE(CONCAT(p.First_Name, ' ', p.Last_Name), o.Company_Name, le.Entity_ID) AS Defendant_Name,
          CASE 
              WHEN p.Entity_ID IS NOT NULL THEN 'Individual'
              WHEN o.Entity_ID IS NOT NULL THEN 'Organization'
              ELSE 'Unknown Entity'
          END AS Defendant_Type,
          inc.Incident_ID,
          inc.Incident_Date,
          inc.Location AS Incident_Location,
          inc.Description AS Incident_Details,
          c.Case_ID,
          c.Title AS Associated_Case_Title,
          sc.Charge_Code,
          sc.Section_Name AS Charge_Faced,
          COALESCE(dcs.Verdict_Type, 'Pending') AS Recorded_Verdict,
          COALESCE(dcs.Sentence_Imposed, 'N/A') AS Sentence_Imposed
      FROM LEGAL_ENTITY le
      LEFT JOIN PERSON p ON le.Entity_ID = p.Entity_ID
      LEFT JOIN ORGANIZATION o ON le.Entity_ID = o.Entity_ID
      JOIN DOCKET_CHARGE_SHEET dcs ON le.Entity_ID = dcs.Defendant_ID
      JOIN INCIDENT inc ON dcs.Incident_ID = inc.Incident_ID
      JOIN \`CASE\` c ON dcs.Criminal_Case_ID = c.Case_ID
      JOIN STATUTE_CHARGE sc ON dcs.Charge_Code = sc.Charge_Code
      WHERE le.Entity_ID = ?
      ORDER BY inc.Incident_Date DESC, c.Case_ID ASC, dcs.Charge_Sheet_ID ASC
    `;

    const [rows] = await pool.query(sql, [defendantId]);
    const rawRows = rows as RawDefendantIncidentHistoryRow[];

    return rawRows.map((row) => ({
      defendantId: row.Defendant_ID,
      defendantName: row.Defendant_Name,
      defendantType: row.Defendant_Type,
      incident: {
        incidentId: row.Incident_ID,
        incidentDate: row.Incident_Date,
        location: row.Incident_Location,
        details: row.Incident_Details,
      },
      associatedCase: {
        caseId: row.Case_ID,
        caseTitle: row.Associated_Case_Title,
      },
      charge: {
        chargeCode: row.Charge_Code,
        statutorySection: row.Charge_Faced,
      },
      recordedVerdict: row.Recorded_Verdict,
      sentenceImposed: row.Sentence_Imposed,
    }));
  }

  // =========================================================================
  // WORKFLOW 5: Criminal Cases Filtered by Statute (Query 3)
  // =========================================================================
  public static async getCasesByStatute(chargeCode: string): Promise<CaseByStatuteItem[]> {
    const pool = getDbPool();
    const sql = `
      SELECT 
          c.Case_ID,
          c.Title AS Case_Title,
          c.Status AS Case_Status,
          c.Filing_Date,
          ct.Court_Name,
          ct.Tier_Level AS Court_Tier,
          cc.FIR_Or_Complaint_No,
          cc.Arresting_Agency,
          sc.Charge_Code,
          sc.Section_Name AS Statutory_Section,
          sc.Max_Sentence_Years
      FROM \`CASE\` c
      JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
      JOIN COURT ct ON c.Court_ID = ct.Court_ID
      JOIN STATUTE_CHARGE sc ON sc.Charge_Code = ?
      WHERE EXISTS (
          SELECT 1 
          FROM DOCKET_CHARGE_SHEET dcs 
          WHERE dcs.Criminal_Case_ID = c.Case_ID 
            AND dcs.Charge_Code = sc.Charge_Code
      )
      ORDER BY c.Filing_Date DESC, c.Case_ID ASC
    `;

    const [rows] = await pool.query(sql, [chargeCode]);
    const rawRows = rows as RawCaseByStatuteRow[];

    return rawRows.map((row) => ({
      caseId: row.Case_ID,
      caseTitle: row.Case_Title,
      caseStatus: row.Case_Status,
      filingDate: row.Filing_Date,
      courtName: row.Court_Name,
      courtTier: row.Court_Tier,
      firNumber: row.FIR_Or_Complaint_No,
      arrestingAgency: row.Arresting_Agency,
      chargeCode: row.Charge_Code,
      statutorySection: row.Statutory_Section,
      maxSentenceYears: row.Max_Sentence_Years !== null ? Number(row.Max_Sentence_Years) : null,
    }));
  }

  // =========================================================================
  // WORKFLOW 6: Judicial-Review Related Proceedings (Query 4 / View)
  // =========================================================================
  public static async getJudicialReviewProceedings(
    category?: string,
    defendantId?: string
  ): Promise<JudicialReviewItem[]> {
    const pool = getDbPool();
    const conditions: string[] = [];
    const params: any[] = [];

    if (category) {
      conditions.push('Review_Status_Category = ?');
      params.push(category);
    }

    if (defendantId) {
      conditions.push('Defendant_ID = ?');
      params.push(defendantId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
          Defendant_ID,
          Defendant_Name,
          Defendant_Type,
          Charge_Code,
          Charge_Section,
          Incident_ID,
          Incident_Date,
          Incident_Location,
          Total_Dockets_Count,
          Recorded_Conviction_Count,
          Recorded_Acquittal_Count,
          Pending_Dockets_Count,
          Unclassified_Outcome_Count,
          Involving_Cases,
          Recorded_Outcomes,
          Review_Status_Category,
          Judicial_Review_Indicator
      FROM V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS
      ${whereClause}
      ORDER BY 
          CASE Review_Status_Category
              WHEN 'OUTCOME_OVERLAP_REVIEW' THEN 1
              WHEN 'POTENTIALLY_RELATED' THEN 2
              WHEN 'MULTIPLE_RECORDED_OUTCOMES_REVIEW' THEN 3
              WHEN 'INSUFFICIENT_OUTCOME_DATA' THEN 4
              ELSE 5
          END ASC,
          Total_Dockets_Count DESC,
          Defendant_ID ASC
    `;

    const [rows] = await pool.query(sql, params);
    const rawRows = rows as RawJudicialReviewRow[];

    return rawRows.map((row) => ({
      defendantId: row.Defendant_ID,
      defendantName: row.Defendant_Name,
      defendantType: row.Defendant_Type,
      chargeCode: row.Charge_Code,
      chargeSection: row.Charge_Section,
      incidentId: row.Incident_ID,
      incidentDate: row.Incident_Date,
      incidentLocation: row.Incident_Location,
      metrics: {
        totalDocketsCount: Number(row.Total_Dockets_Count),
        recordedConvictionCount: Number(row.Recorded_Conviction_Count),
        recordedAcquittalCount: Number(row.Recorded_Acquittal_Count),
        pendingDocketsCount: Number(row.Pending_Dockets_Count),
        unclassifiedOutcomeCount: Number(row.Unclassified_Outcome_Count),
      },
      involvingCases: row.Involving_Cases ? row.Involving_Cases.split(', ') : [],
      recordedOutcomes: row.Recorded_Outcomes ? row.Recorded_Outcomes.split(', ') : [],
      reviewStatusCategory: row.Review_Status_Category,
      judicialReviewIndicator: row.Judicial_Review_Indicator,
    }));
  }

  // =========================================================================
  // WORKFLOW 7: Judgment Citations (Query 5)
  // =========================================================================
  public static async getJudgmentCitations(judgmentId: string): Promise<JudgmentCitationItem[]> {
    const pool = getDbPool();
    const sql = `
      SELECT 
          jc.Citation_ID,
          jc.Cited_Judgment_ID,
          c_cited.Case_ID AS Precedent_Case_ID,
          c_cited.Title AS Precedent_Case_Title,
          j_cited.Verdict_Date AS Precedent_Verdict_Date,
          jc.Citing_Judgment_ID,
          c_citing.Case_ID AS Citing_Case_ID,
          c_citing.Title AS Citing_Case_Title,
          ct_citing.Court_Name AS Citing_Court,
          j_citing.Verdict_Date AS Citing_Verdict_Date,
          jc.Precedent_Treatment,
          jc.Relevance_Note
      FROM JUDGMENT_CITATION jc
      JOIN JUDGMENT j_cited ON jc.Cited_Judgment_ID = j_cited.Judgment_ID
      JOIN \`CASE\` c_cited ON j_cited.Case_ID = c_cited.Case_ID
      JOIN JUDGMENT j_citing ON jc.Citing_Judgment_ID = j_citing.Judgment_ID
      JOIN \`CASE\` c_citing ON j_citing.Case_ID = c_citing.Case_ID
      JOIN COURT ct_citing ON c_citing.Court_ID = ct_citing.Court_ID
      WHERE jc.Cited_Judgment_ID = ?
      ORDER BY j_citing.Verdict_Date DESC, jc.Citation_ID ASC
    `;

    const [rows] = await pool.query(sql, [judgmentId]);
    const rawRows = rows as RawJudgmentCitationRow[];

    return rawRows.map((row) => ({
      citationId: row.Citation_ID,
      citedJudgmentId: row.Cited_Judgment_ID,
      precedentCaseId: row.Precedent_Case_ID,
      precedentCaseTitle: row.Precedent_Case_Title,
      precedentVerdictDate: row.Precedent_Verdict_Date,
      citingJudgmentId: row.Citing_Judgment_ID,
      citingCaseId: row.Citing_Case_ID,
      citingCaseTitle: row.Citing_Case_Title,
      citingCourt: row.Citing_Court,
      citingVerdictDate: row.Citing_Verdict_Date,
      precedentTreatment: row.Precedent_Treatment,
      relevanceNote: row.Relevance_Note,
    }));
  }

  // =========================================================================
  // WORKFLOW 8: Precedent Tag Search (Query 7)
  // =========================================================================
  public static async searchPrecedentTags(term: string): Promise<PrecedentTagSearchItem[]> {
    const pool = getDbPool();
    // Escape SQL wildcard characters to ensure literal substring search
    const escapedTerm = term.replace(/[%_\\]/g, '\\$&');
    const searchPattern = `%${escapedTerm}%`;

    const sql = `
      SELECT 
          pt.Tag_ID,
          pt.Keyword AS Precedent_Tag,
          c.Case_ID,
          c.Title AS Case_Title,
          ct.Court_Name,
          ct.Tier_Level AS Court_Tier,
          c.Status AS Case_Status,
          c.Filing_Date,
          CASE 
              WHEN cc.Case_ID IS NOT NULL THEN 'Criminal'
              WHEN cv.Case_ID IS NOT NULL THEN 'Civil'
              ELSE 'General / Appellate'
          END AS Jurisdiction_Type
      FROM PRECEDENT_TAG pt
      JOIN CASE_TAG_MAPPING ctm ON pt.Tag_ID = ctm.Tag_ID
      JOIN \`CASE\` c ON ctm.Case_ID = c.Case_ID
      JOIN COURT ct ON c.Court_ID = ct.Court_ID
      LEFT JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
      LEFT JOIN CIVIL_CASE cv ON c.Case_ID = cv.Case_ID
      WHERE pt.Keyword LIKE ?
      ORDER BY pt.Keyword ASC, c.Filing_Date DESC, c.Case_ID ASC
    `;

    const [rows] = await pool.query(sql, [searchPattern]);
    const rawRows = rows as RawPrecedentTagSearchRow[];

    return rawRows.map((row) => ({
      tagId: row.Tag_ID,
      precedentTag: row.Precedent_Tag,
      caseId: row.Case_ID,
      caseTitle: row.Case_Title,
      courtName: row.Court_Name,
      courtTier: row.Court_Tier,
      caseStatus: row.Case_Status,
      filingDate: row.Filing_Date,
      jurisdictionType: row.Jurisdiction_Type,
    }));
  }

  // =========================================================================
  // WORKFLOW 9: Case Taxonomy Mapping (Query 8)
  // =========================================================================
  public static async getCaseTags(caseId: string): Promise<CaseTagItem[]> {
    const pool = getDbPool();
    const sql = `
      SELECT 
          c.Case_ID,
          c.Title AS Case_Title,
          c.Status AS Case_Status,
          ct.Court_Name,
          CASE 
              WHEN cc.Case_ID IS NOT NULL THEN 'Criminal'
              WHEN cv.Case_ID IS NOT NULL THEN 'Civil'
              ELSE 'General / Appellate'
          END AS Jurisdiction_Type,
          pt.Tag_ID,
          pt.Keyword AS Assigned_Tag
      FROM \`CASE\` c
      JOIN COURT ct ON c.Court_ID = ct.Court_ID
      LEFT JOIN CRIMINAL_CASE cc ON c.Case_ID = cc.Case_ID
      LEFT JOIN CIVIL_CASE cv ON c.Case_ID = cv.Case_ID
      JOIN CASE_TAG_MAPPING ctm ON c.Case_ID = ctm.Case_ID
      JOIN PRECEDENT_TAG pt ON ctm.Tag_ID = pt.Tag_ID
      WHERE c.Case_ID = ?
      ORDER BY pt.Keyword ASC, pt.Tag_ID ASC
    `;

    const [rows] = await pool.query(sql, [caseId]);
    const rawRows = rows as RawCaseTagRow[];

    return rawRows.map((row) => ({
      caseId: row.Case_ID,
      caseTitle: row.Case_Title,
      caseStatus: row.Case_Status,
      courtName: row.Court_Name,
      jurisdictionType: row.Jurisdiction_Type,
      tagId: row.Tag_ID,
      assignedTag: row.Assigned_Tag,
    }));
  }

  // CRUD 1: Incidents
  // =========================================================================
  public static async getAllIncidents(): Promise<IncidentModel[]> {
    const pool = getDbPool();
    const [rows] = await pool.query(
      'SELECT Incident_ID, Incident_Date, Location, Description FROM INCIDENT ORDER BY Incident_Date DESC, Incident_ID ASC'
    );
    return rows as IncidentModel[];
  }

  public static async createIncident(data: {
    incidentId: string;
    incidentDate: string;
    location: string;
    description?: string;
  }): Promise<IncidentModel> {
    const pool = getDbPool();
    const dateObj = new Date(data.incidentDate);
    const sql = `
      INSERT INTO INCIDENT (Incident_ID, Incident_Date, Location, Description)
      VALUES (?, ?, ?, ?)
    `;
    await pool.query(sql, [
      data.incidentId,
      dateObj,
      data.location,
      data.description || null,
    ]);

    return {
      Incident_ID: data.incidentId,
      Incident_Date: data.incidentDate,
      Location: data.location,
      Description: data.description || null,
    };
  }

  public static async getIncidentById(id: string): Promise<IncidentModel> {
    const pool = getDbPool();
    const [rows] = await pool.query('SELECT * FROM INCIDENT WHERE Incident_ID = ?', [id]);
    const items = rows as IncidentModel[];
    if (items.length === 0) {
      throw new AppError(404, 'INCIDENT_NOT_FOUND', `Incident '${id}' was not found.`);
    }
    return items[0];
  }

  public static async updateIncident(
    id: string,
    data: { incidentDate?: string; location?: string; description?: string }
  ): Promise<IncidentModel> {
    const pool = getDbPool();
    const existing = await this.getIncidentById(id);

    const updatedDate = data.incidentDate !== undefined ? new Date(data.incidentDate) : existing.Incident_Date;
    const updatedLocation = data.location !== undefined ? data.location : existing.Location;
    const updatedDescription = data.description !== undefined ? data.description : existing.Description;

    await pool.query(
      'UPDATE INCIDENT SET Incident_Date = ?, Location = ?, Description = ? WHERE Incident_ID = ?',
      [updatedDate, updatedLocation, updatedDescription, id]
    );

    return {
      Incident_ID: id,
      Incident_Date: typeof updatedDate === 'object' && updatedDate instanceof Date ? updatedDate.toISOString() : String(updatedDate),
      Location: updatedLocation,
      Description: updatedDescription,
    };
  }

  public static async deleteIncident(id: string): Promise<{ deleted: boolean; incidentId: string }> {
    const pool = getDbPool();
    // Pre-check for dependent charge sheets to provide immediate, clear conflict message
    const [dep] = await pool.query(
      'SELECT COUNT(*) as count FROM DOCKET_CHARGE_SHEET WHERE Incident_ID = ?',
      [id]
    );
    const count = (dep as any[])[0]?.count || 0;
    if (count > 0) {
      throw new AppError(
        409,
        'FOREIGN_KEY_CONFLICT',
        `Cannot delete Incident '${id}' because ${count} charge sheet(s) reference it.`
      );
    }

    const [result] = await pool.query('DELETE FROM INCIDENT WHERE Incident_ID = ?', [id]);
    if ((result as any).affectedRows === 0) {
      throw new AppError(404, 'INCIDENT_NOT_FOUND', `Incident '${id}' was not found.`);
    }
    return { deleted: true, incidentId: id };
  }

  // CRUD 2: Docket Charge Sheets
  // =========================================================================
  public static async getAllChargeSheets(): Promise<any[]> {
    const pool = getDbPool();
    const sql = `
      SELECT 
        cs.Charge_Sheet_ID,
        cs.Criminal_Case_ID,
        cs.Defendant_ID,
        COALESCE(CONCAT(p.First_Name, ' ', p.Last_Name), o.Company_Name, cs.Defendant_ID) AS Defendant_Name,
        cs.Charge_Code,
        sc.Section_Name AS Charge_Section,
        cs.Incident_ID,
        cs.Verdict_Type,
        cs.Sentence_Imposed
      FROM DOCKET_CHARGE_SHEET cs
      LEFT JOIN LEGAL_ENTITY le ON cs.Defendant_ID = le.Entity_ID
      LEFT JOIN PERSON p ON le.Entity_ID = p.Entity_ID
      LEFT JOIN ORGANIZATION o ON le.Entity_ID = o.Entity_ID
      LEFT JOIN STATUTE_CHARGE sc ON cs.Charge_Code = sc.Charge_Code
      ORDER BY cs.Charge_Sheet_ID ASC
    `;
    const [rows] = await pool.query(sql);
    return rows as any[];
  }

  public static async createChargeSheet(data: {
    chargeSheetId: string;
    criminalCaseId: string;
    defendantId: string;
    chargeCode: string;
    incidentId: string;
    verdictType?: 'Guilty' | 'Acquitted' | 'Pending';
    sentenceImposed?: string;
  }): Promise<DocketChargeSheetModel> {
    const pool = getDbPool();
    const verdict = data.verdictType || 'Pending';

    const sql = `
      INSERT INTO DOCKET_CHARGE_SHEET 
        (Charge_Sheet_ID, Criminal_Case_ID, Defendant_ID, Charge_Code, Incident_ID, Verdict_Type, Sentence_Imposed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(sql, [
      data.chargeSheetId,
      data.criminalCaseId,
      data.defendantId,
      data.chargeCode,
      data.incidentId,
      verdict,
      data.sentenceImposed || null,
    ]);

    return {
      Charge_Sheet_ID: data.chargeSheetId,
      Criminal_Case_ID: data.criminalCaseId,
      Defendant_ID: data.defendantId,
      Charge_Code: data.chargeCode,
      Incident_ID: data.incidentId,
      Verdict_Type: verdict,
      Sentence_Imposed: data.sentenceImposed || null,
    };
  }

  public static async getChargeSheetById(id: string): Promise<DocketChargeSheetModel> {
    const pool = getDbPool();
    const [rows] = await pool.query('SELECT * FROM DOCKET_CHARGE_SHEET WHERE Charge_Sheet_ID = ?', [
      id,
    ]);
    const items = rows as DocketChargeSheetModel[];
    if (items.length === 0) {
      throw new AppError(404, 'CHARGE_SHEET_NOT_FOUND', `Charge sheet '${id}' was not found.`);
    }
    return items[0];
  }

  public static async updateChargeSheet(
    id: string,
    data: {
      verdictType?: 'Guilty' | 'Acquitted' | 'Pending';
      sentenceImposed?: string;
    }
  ): Promise<DocketChargeSheetModel> {
    const pool = getDbPool();
    const existing = await this.getChargeSheetById(id);

    const updatedVerdict = data.verdictType !== undefined ? data.verdictType : existing.Verdict_Type;
    const updatedSentence =
      data.sentenceImposed !== undefined ? data.sentenceImposed : existing.Sentence_Imposed;

    await pool.query(
      'UPDATE DOCKET_CHARGE_SHEET SET Verdict_Type = ?, Sentence_Imposed = ? WHERE Charge_Sheet_ID = ?',
      [updatedVerdict, updatedSentence, id]
    );

    return {
      ...existing,
      Verdict_Type: updatedVerdict,
      Sentence_Imposed: updatedSentence,
    };
  }

  public static async deleteChargeSheet(id: string): Promise<{ deleted: boolean; chargeSheetId: string }> {
    const pool = getDbPool();
    const [result] = await pool.query('DELETE FROM DOCKET_CHARGE_SHEET WHERE Charge_Sheet_ID = ?', [id]);
    if ((result as any).affectedRows === 0) {
      throw new AppError(404, 'CHARGE_SHEET_NOT_FOUND', `Charge sheet '${id}' was not found.`);
    }
    return { deleted: true, chargeSheetId: id };
  }

  // CRUD 3: Judgment Citations
  // =========================================================================
  public static async getAllJudgmentCitations(): Promise<any[]> {
    const pool = getDbPool();
    const sql = `
      SELECT 
        jc.Citation_ID,
        jc.Citing_Judgment_ID,
        jc.Cited_Judgment_ID,
        jc.Precedent_Treatment,
        jc.Relevance_Note,
        c_citing.Title AS Citing_Case_Title,
        c_cited.Title AS Cited_Case_Title
      FROM JUDGMENT_CITATION jc
      LEFT JOIN JUDGMENT j_citing ON jc.Citing_Judgment_ID = j_citing.Judgment_ID
      LEFT JOIN \`CASE\` c_citing ON j_citing.Case_ID = c_citing.Case_ID
      LEFT JOIN JUDGMENT j_cited ON jc.Cited_Judgment_ID = j_cited.Judgment_ID
      LEFT JOIN \`CASE\` c_cited ON j_cited.Case_ID = c_cited.Case_ID
      ORDER BY jc.Citation_ID ASC
    `;
    const [rows] = await pool.query(sql);
    return rows as any[];
  }

  public static async createJudgmentCitation(data: {

    citationId: string;
    citingJudgmentId: string;
    citedJudgmentId: string;
    precedentTreatment?: 'Followed' | 'Distinguished' | 'Overruled';
    relevanceNote?: string;
  }): Promise<JudgmentCitationModel> {
    const pool = getDbPool();
    const treatment = data.precedentTreatment || 'Followed';

    if (data.citingJudgmentId === data.citedJudgmentId) {
      throw new AppError(
        400,
        'SELF_CITATION_INVALID',
        'A judgment cannot cite itself as a precedent.'
      );
    }

    const sql = `
      INSERT INTO JUDGMENT_CITATION 
        (Citation_ID, Citing_Judgment_ID, Cited_Judgment_ID, Relevance_Note, Precedent_Treatment)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.query(sql, [
      data.citationId,
      data.citingJudgmentId,
      data.citedJudgmentId,
      data.relevanceNote || null,
      treatment,
    ]);

    return {
      Citation_ID: data.citationId,
      Citing_Judgment_ID: data.citingJudgmentId,
      Cited_Judgment_ID: data.citedJudgmentId,
      Relevance_Note: data.relevanceNote || null,
      Precedent_Treatment: treatment,
    };
  }

  public static async getJudgmentCitationById(id: string): Promise<JudgmentCitationModel> {
    const pool = getDbPool();
    const [rows] = await pool.query('SELECT * FROM JUDGMENT_CITATION WHERE Citation_ID = ?', [id]);
    const items = rows as JudgmentCitationModel[];
    if (items.length === 0) {
      throw new AppError(404, 'CITATION_NOT_FOUND', `Judgment citation '${id}' was not found.`);
    }
    return items[0];
  }

  public static async updateJudgmentCitation(
    id: string,
    data: {
      precedentTreatment?: 'Followed' | 'Distinguished' | 'Overruled';
      relevanceNote?: string;
    }
  ): Promise<JudgmentCitationModel> {
    const pool = getDbPool();
    const existing = await this.getJudgmentCitationById(id);

    const updatedTreatment =
      data.precedentTreatment !== undefined ? data.precedentTreatment : existing.Precedent_Treatment;
    const updatedNote = data.relevanceNote !== undefined ? data.relevanceNote : existing.Relevance_Note;

    await pool.query(
      'UPDATE JUDGMENT_CITATION SET Precedent_Treatment = ?, Relevance_Note = ? WHERE Citation_ID = ?',
      [updatedTreatment, updatedNote, id]
    );

    return {
      ...existing,
      Precedent_Treatment: updatedTreatment,
      Relevance_Note: updatedNote,
    };
  }

  public static async deleteJudgmentCitation(id: string): Promise<{ deleted: boolean; citationId: string }> {
    const pool = getDbPool();
    const [result] = await pool.query('DELETE FROM JUDGMENT_CITATION WHERE Citation_ID = ?', [id]);
    if ((result as any).affectedRows === 0) {
      throw new AppError(404, 'CITATION_NOT_FOUND', `Judgment citation '${id}' was not found.`);
    }
    return { deleted: true, citationId: id };
  }

  // =========================================================================
  // CRUD 4: Case Tag Mapping
  // =========================================================================
  public static async addCaseTag(caseId: string, tagId: string): Promise<{ caseId: string; tagId: string }> {
    const pool = getDbPool();
    const sql = `INSERT INTO CASE_TAG_MAPPING (Case_ID, Tag_ID) VALUES (?, ?)`;
    await pool.query(sql, [caseId, tagId]);
    return { caseId, tagId };
  }

  public static async removeCaseTag(caseId: string, tagId: string): Promise<{ deleted: boolean }> {
    const pool = getDbPool();
    const [result] = await pool.query(
      'DELETE FROM CASE_TAG_MAPPING WHERE Case_ID = ? AND Tag_ID = ?',
      [caseId, tagId]
    );
    if ((result as any).affectedRows === 0) {
      throw new AppError(404, 'TAG_MAPPING_NOT_FOUND', `Case tag mapping does not exist.`);
    }
    return { deleted: true };
  }

  // =========================================================================
  // LOOKUP OPTIONS: Valid Foreign Keys for CRUD Forms
  // =========================================================================
  public static async getLookupOptions(): Promise<any> {
    const pool = getDbPool();
    const [cases] = await pool.query('SELECT Case_ID AS caseId, Title AS title FROM `CASE` ORDER BY Case_ID ASC');
    const [defendants] = await pool.query(`
      SELECT le.Entity_ID AS entityId, 
        COALESCE(CONCAT(p.First_Name, ' ', p.Last_Name), o.Company_Name, le.Entity_ID) AS label
      FROM LEGAL_ENTITY le
      LEFT JOIN PERSON p ON le.Entity_ID = p.Entity_ID
      LEFT JOIN ORGANIZATION o ON le.Entity_ID = o.Entity_ID
      ORDER BY le.Entity_ID ASC
    `);
    const [statutes] = await pool.query(
      'SELECT Charge_Code AS chargeCode, Section_Name AS sectionName FROM STATUTE_CHARGE ORDER BY Charge_Code ASC'
    );
    const [incidents] = await pool.query(
      'SELECT Incident_ID AS incidentId, Location AS location, Incident_Date AS incidentDate FROM INCIDENT ORDER BY Incident_ID ASC'
    );
    const [judgments] = await pool.query(`
      SELECT j.Judgment_ID AS judgmentId, j.Case_ID AS caseId, c.Title AS caseTitle
      FROM JUDGMENT j
      JOIN \`CASE\` c ON j.Case_ID = c.Case_ID
      ORDER BY j.Judgment_ID ASC
    `);
    const [tags] = await pool.query('SELECT Tag_ID AS tagId, Keyword AS keyword FROM PRECEDENT_TAG ORDER BY Keyword ASC');

    return {
      cases,
      defendants,
      statutes,
      incidents,
      judgments,
      tags,
    };
  }
}

