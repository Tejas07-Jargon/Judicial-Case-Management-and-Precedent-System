import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { JudicialService } from '../services/judicialService';

// ============================================================================
// Parameter Validation Schemas
// ============================================================================
const caseIdParamSchema = z.object({
  caseId: z
    .string()
    .trim()
    .min(1, 'Case ID cannot be empty')
    .regex(/^CASE_[0-9]+$/i, "Case ID must match format 'CASE_<number>' (e.g. CASE_1002)"),
});

const defendantIdParamSchema = z.object({
  defendantId: z.string().trim().min(1, 'Defendant ID is required'),
});

const chargeCodeParamSchema = z.object({
  chargeCode: z.string().trim().min(1, 'Charge Code is required'),
});

const judgmentIdParamSchema = z.object({
  judgmentId: z.string().trim().min(1, 'Judgment ID is required'),
});

const proceedingSearchQuerySchema = z.object({
  defendantId: z.string().trim().min(1, 'Defendant ID is required'),
  incidentId: z.string().trim().min(1, 'Incident ID is required'),
});

const citationRankingQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20),
});

const judicialReviewQuerySchema = z.object({
  category: z
    .enum([
      'INSUFFICIENT_OUTCOME_DATA',
      'POTENTIALLY_RELATED',
      'OUTCOME_OVERLAP_REVIEW',
      'MULTIPLE_RECORDED_OUTCOMES_REVIEW',
    ])
    .optional(),
  defendantId: z.string().trim().min(1).optional(),
});

const tagSearchQuerySchema = z.object({
  q: z.string().trim().min(1, 'Search query parameter q cannot be empty'),
});

const caseTagParamSchema = z.object({
  caseId: z.string().trim().min(1, 'Case ID is required'),
  tagId: z.string().trim().min(1, 'Tag ID is required'),
});

// CRUD Schemas
const createIncidentSchema = z.object({
  incidentId: z.string().trim().min(1, 'Incident ID is required'),
  incidentDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid incident date format (expected ISO date or datetime string)',
  }),
  location: z.string().trim().min(1, 'Location is required').max(255),
  description: z.string().trim().optional(),
});

const updateIncidentSchema = z.object({
  incidentDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid incident date format' })
    .optional(),
  location: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().optional(),
});

const createChargeSheetSchema = z.object({
  chargeSheetId: z.string().trim().min(1, 'Charge Sheet ID is required'),
  criminalCaseId: z.string().trim().min(1, 'Criminal Case ID is required'),
  defendantId: z.string().trim().min(1, 'Defendant ID is required'),
  chargeCode: z.string().trim().min(1, 'Charge Code is required'),
  incidentId: z.string().trim().min(1, 'Incident ID is required'),
  verdictType: z.enum(['Guilty', 'Acquitted', 'Pending']).default('Pending'),
  sentenceImposed: z.string().trim().optional(),
});

const updateChargeSheetSchema = z.object({
  verdictType: z.enum(['Guilty', 'Acquitted', 'Pending']).optional(),
  sentenceImposed: z.string().trim().optional(),
});

const createCitationSchema = z.object({
  citationId: z.string().trim().min(1, 'Citation ID is required'),
  citingJudgmentId: z.string().trim().min(1, 'Citing Judgment ID is required'),
  citedJudgmentId: z.string().trim().min(1, 'Cited Judgment ID is required'),
  precedentTreatment: z.enum(['Followed', 'Distinguished', 'Overruled']).default('Followed'),
  relevanceNote: z.string().trim().optional(),
});

const updateCitationSchema = z.object({
  precedentTreatment: z.enum(['Followed', 'Distinguished', 'Overruled']).optional(),
  relevanceNote: z.string().trim().optional(),
});

export class JudicialController {
  // =========================================================================
  // ANALYTICAL WORKFLOWS
  // =========================================================================

  /**
   * GET /api/v1/criminal-cases/:caseId/dossier
   */
  public static async getCriminalCaseDossier(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { caseId } = caseIdParamSchema.parse(req.params);
      const dossier = await JudicialService.getCriminalCaseDossier(caseId);
      res.status(200).json(dossier);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/proceedings/search?defendantId=...&incidentId=...
   */
  public static async searchProceedings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { defendantId, incidentId } = proceedingSearchQuerySchema.parse(req.query);
      const results = await JudicialService.searchProceedingsByDefendantIncident(
        defendantId,
        incidentId
      );
      res.status(200).json({
        count: results.length,
        proceedings: results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/precedents/citation-ranking?limit=10
   */
  public static async getCitationRanking(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { limit } = citationRankingQuerySchema.parse(req.query);
      const ranking = await JudicialService.getCitationRanking(limit);
      res.status(200).json({
        count: ranking.length,
        ranking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/defendants/:defendantId/incidents
   */
  public static async getDefendantIncidents(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { defendantId } = defendantIdParamSchema.parse(req.params);
      const history = await JudicialService.getDefendantIncidentHistory(defendantId);
      res.status(200).json({
        defendantId,
        count: history.length,
        records: history,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/criminal-cases/by-statute/:chargeCode
   */
  public static async getCasesByStatute(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { chargeCode } = chargeCodeParamSchema.parse(req.params);
      const cases = await JudicialService.getCasesByStatute(chargeCode);
      res.status(200).json({
        chargeCode,
        count: cases.length,
        cases,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/judicial-review/related-proceedings
   */
  public static async getJudicialReviewProceedings(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { category, defendantId } = judicialReviewQuerySchema.parse(req.query);
      const proceedings = await JudicialService.getJudicialReviewProceedings(
        category,
        defendantId
      );
      res.status(200).json({
        count: proceedings.length,
        proceedings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/judgments/:judgmentId/citations
   */
  public static async getJudgmentCitations(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { judgmentId } = judgmentIdParamSchema.parse(req.params);
      const citations = await JudicialService.getJudgmentCitations(judgmentId);
      res.status(200).json({
        judgmentId,
        count: citations.length,
        citations,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/precedents/tags/search?q=Corporate
   */
  public static async searchPrecedentTags(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { q } = tagSearchQuerySchema.parse(req.query);
      const results = await JudicialService.searchPrecedentTags(q);
      res.status(200).json({
        query: q,
        count: results.length,
        tags: results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/cases/:caseId/tags
   */
  public static async getCaseTags(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { caseId } = caseIdParamSchema.parse(req.params);
      const tags = await JudicialService.getCaseTags(caseId);
      res.status(200).json({
        caseId,
        count: tags.length,
        tags,
      });
    } catch (error) {
      next(error);
    }
  }

  // =========================================================================
  // CRUD OPERATIONS
  // =========================================================================

  // Incident CRUD
  public static async getAllIncidents(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const items = await JudicialService.getAllIncidents();
      res.status(200).json({ count: items.length, incidents: items });
    } catch (error) {
      next(error);
    }
  }

  public static async createIncident(
    req: Request,
    res: Response,

    next: NextFunction
  ): Promise<void> {
    try {
      const data = createIncidentSchema.parse(req.body);
      const created = await JudicialService.createIncident(data);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }

  public static async getIncidentById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = z.string().trim().min(1).parse(req.params.id);
      const item = await JudicialService.getIncidentById(id);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  public static async updateIncident(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = z.string().trim().min(1).parse(req.params.id);
      const data = updateIncidentSchema.parse(req.body);
      const updated = await JudicialService.updateIncident(id, data);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteIncident(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = z.string().trim().min(1).parse(req.params.id);
      const result = await JudicialService.deleteIncident(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Charge Sheet CRUD
  public static async getAllChargeSheets(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const items = await JudicialService.getAllChargeSheets();
      res.status(200).json({ count: items.length, chargeSheets: items });
    } catch (error) {
      next(error);
    }
  }

  public static async createChargeSheet(
    req: Request,
    res: Response,

    next: NextFunction
  ): Promise<void> {
    try {
      const data = createChargeSheetSchema.parse(req.body);
      const created = await JudicialService.createChargeSheet(data);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }

  public static async getChargeSheetById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = z.string().trim().min(1).parse(req.params.id);
      const item = await JudicialService.getChargeSheetById(id);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  public static async updateChargeSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = z.string().trim().min(1).parse(req.params.id);
      const data = updateChargeSheetSchema.parse(req.body);
      const updated = await JudicialService.updateChargeSheet(id, data);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteChargeSheet(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = z.string().trim().min(1).parse(req.params.id);
      const result = await JudicialService.deleteChargeSheet(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Judgment Citation CRUD
  public static async getAllJudgmentCitations(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const items = await JudicialService.getAllJudgmentCitations();
      res.status(200).json({ count: items.length, citations: items });
    } catch (error) {
      next(error);
    }
  }

  public static async createJudgmentCitation(
    req: Request,
    res: Response,
    next: NextFunction

  ): Promise<void> {
    try {
      const data = createCitationSchema.parse(req.body);
      const created = await JudicialService.createJudgmentCitation(data);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }

  public static async getJudgmentCitationById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = z.string().trim().min(1).parse(req.params.id);
      const item = await JudicialService.getJudgmentCitationById(id);
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  }

  public static async updateJudgmentCitation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = z.string().trim().min(1).parse(req.params.id);
      const data = updateCitationSchema.parse(req.body);
      const updated = await JudicialService.updateJudgmentCitation(id, data);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteJudgmentCitation(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = z.string().trim().min(1).parse(req.params.id);
      const result = await JudicialService.deleteJudgmentCitation(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Case Tag Mapping CRUD
  public static async addCaseTag(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { caseId } = caseIdParamSchema.parse(req.params);
      const tagId = z.string().trim().min(1).parse(req.body.tagId);
      const result = await JudicialService.addCaseTag(caseId, tagId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  public static async removeCaseTag(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { caseId, tagId } = caseTagParamSchema.parse(req.params);
      const result = await JudicialService.removeCaseTag(caseId, tagId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Lookup Options
  public static async getLookupOptions(
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const options = await JudicialService.getLookupOptions();
      res.status(200).json(options);
    } catch (error) {
      next(error);
    }
  }
}

