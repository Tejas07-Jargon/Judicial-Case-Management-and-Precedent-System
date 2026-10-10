import { Router } from 'express';
import { JudicialController } from '../controllers/judicialController';

export const judicialRouter = Router();

// ============================================================================
// 8 ANALYTICAL WORKFLOWS
// ============================================================================

// Workflow 1: Criminal Case Dossier (Stored Procedure)
judicialRouter.get('/criminal-cases/:caseId/dossier', JudicialController.getCriminalCaseDossier);

// Workflow 2: Search Proceedings by Defendant and Incident (Stored Procedure)
judicialRouter.get('/proceedings/search', JudicialController.searchProceedings);

// Workflow 3: Judgment Citation Frequency Ranking (Query 6)
judicialRouter.get('/precedents/citation-ranking', JudicialController.getCitationRanking);

// Workflow 4: Defendant Incident History (Query 2)
judicialRouter.get('/defendants/:defendantId/incidents', JudicialController.getDefendantIncidents);

// Workflow 5: Criminal Cases by Statute (Query 3)
judicialRouter.get('/criminal-cases/by-statute/:chargeCode', JudicialController.getCasesByStatute);

// Workflow 6: Judicial-Review Related Proceedings (Query 4 / View)
judicialRouter.get('/judicial-review/related-proceedings', JudicialController.getJudicialReviewProceedings);

// Workflow 7: Judgment Precedent Citations (Query 5)
judicialRouter.get('/judgments/:judgmentId/citations', JudicialController.getJudgmentCitations);

// Workflow 8a: Precedent Tag Search (Query 7)
judicialRouter.get('/precedents/tags/search', JudicialController.searchPrecedentTags);

// Workflow 8b: Case Taxonomy Mapping (Query 8)
judicialRouter.get('/cases/:caseId/tags', JudicialController.getCaseTags);

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

// Incidents
judicialRouter.get('/incidents', JudicialController.getAllIncidents);
judicialRouter.post('/incidents', JudicialController.createIncident);
judicialRouter.get('/incidents/:id', JudicialController.getIncidentById);
judicialRouter.patch('/incidents/:id', JudicialController.updateIncident);
judicialRouter.delete('/incidents/:id', JudicialController.deleteIncident);

// Charge Sheets
judicialRouter.get('/charge-sheets', JudicialController.getAllChargeSheets);
judicialRouter.post('/charge-sheets', JudicialController.createChargeSheet);
judicialRouter.get('/charge-sheets/:id', JudicialController.getChargeSheetById);
judicialRouter.patch('/charge-sheets/:id', JudicialController.updateChargeSheet);
judicialRouter.delete('/charge-sheets/:id', JudicialController.deleteChargeSheet);

// Judgment Citations
judicialRouter.get('/judgment-citations', JudicialController.getAllJudgmentCitations);
judicialRouter.post('/judgment-citations', JudicialController.createJudgmentCitation);
judicialRouter.get('/judgment-citations/:id', JudicialController.getJudgmentCitationById);
judicialRouter.patch('/judgment-citations/:id', JudicialController.updateJudgmentCitation);
judicialRouter.delete('/judgment-citations/:id', JudicialController.deleteJudgmentCitation);

// Case Tag Mapping
judicialRouter.post('/cases/:caseId/tags', JudicialController.addCaseTag);
judicialRouter.delete('/cases/:caseId/tags/:tagId', JudicialController.removeCaseTag);

// Lookup Options for dropdowns
judicialRouter.get('/lookup-options', JudicialController.getLookupOptions);

