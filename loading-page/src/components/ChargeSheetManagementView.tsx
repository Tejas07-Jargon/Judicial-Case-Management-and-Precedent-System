import { useState, useEffect } from 'react';
import { api, ChargeSheet, LookupOptions, ApiClientError } from '../api';
import { formatStatuteConcordance, getStatuteDisplay } from '../utils/statuteHelper';
import {
  IconBriefcase,
  IconPlus,
  IconX,
  IconEdit,
  IconTrash,
  IconCheckCircle,
  IconAlertCircle,
  IconRefresh,
} from './Icons';

export function ChargeSheetManagementView() {
  const [chargeSheets, setChargeSheets] = useState<ChargeSheet[]>([]);
  const [lookups, setLookups] = useState<LookupOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Creation Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newId, setNewId] = useState('');
  const [newCaseId, setNewCaseId] = useState('');
  const [newDefendantId, setNewDefendantId] = useState('');
  const [newChargeCode, setNewChargeCode] = useState('');
  const [newIncidentId, setNewIncidentId] = useState('');
  const [newVerdict, setNewVerdict] = useState<'Guilty' | 'Acquitted' | 'Pending'>('Pending');
  const [newSentence, setNewSentence] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit Modal State
  const [editingSheet, setEditingSheet] = useState<ChargeSheet | null>(null);
  const [editVerdict, setEditVerdict] = useState<'Guilty' | 'Acquitted' | 'Pending'>('Pending');
  const [editSentence, setEditSentence] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sheetsData, lookupsData] = await Promise.all([
        api.getAllChargeSheets(),
        api.getLookupOptions(),
      ]);
      setChargeSheets(sheetsData.chargeSheets);
      setLookups(lookupsData);

      // Pre-select first options if creation is blank
      if (lookupsData.cases.length > 0 && !newCaseId) {
        setNewCaseId(lookupsData.cases[0].caseId);
      }
      if (lookupsData.defendants.length > 0 && !newDefendantId) {
        setNewDefendantId(lookupsData.defendants[0].entityId);
      }
      if (lookupsData.statutes.length > 0 && !newChargeCode) {
        setNewChargeCode(lookupsData.statutes[0].chargeCode);
      }
      if (lookupsData.incidents.length > 0 && !newIncidentId) {
        setNewIncidentId(lookupsData.incidents[0].incidentId);
      }
    } catch (err: any) {
      setError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearNotifications = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();

    if (!newId.trim() || !newCaseId || !newDefendantId || !newChargeCode || !newIncidentId) {
      setError('Charge Sheet ID, Criminal Case, Defendant, Statute, and Incident are all required.');
      return;
    }

    setSubmittingCreate(true);
    try {
      const created = await api.createChargeSheet({
        chargeSheetId: newId.trim(),
        criminalCaseId: newCaseId,
        defendantId: newDefendantId,
        chargeCode: newChargeCode,
        incidentId: newIncidentId,
        verdictType: newVerdict,
        sentenceImposed: newSentence.trim() || undefined,
      });

      setSuccessMessage(`Docket Charge Sheet '${created.Charge_Sheet_ID}' filed successfully.`);
      setNewId('');
      setNewSentence('');
      setNewVerdict('Pending');
      setIsCreating(false);
      await fetchData();
    } catch (err: any) {
      setError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setSubmittingCreate(false);
    }
  };

  const openEditModal = (cs: ChargeSheet) => {
    clearNotifications();
    setEditingSheet(cs);
    setEditVerdict(cs.Verdict_Type);
    setEditSentence(cs.Sentence_Imposed || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSheet) return;
    clearNotifications();

    setSubmittingEdit(true);
    try {
      await api.updateChargeSheet(editingSheet.Charge_Sheet_ID, {
        verdictType: editVerdict,
        sentenceImposed: editSentence.trim() || undefined,
      });

      setSuccessMessage(
        `Verdict for Charge Sheet '${editingSheet.Charge_Sheet_ID}' updated to '${editVerdict}'.`
      );
      setEditingSheet(null);
      await fetchData();
    } catch (err: any) {
      setError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    clearNotifications();
    setSubmittingDelete(true);

    try {
      await api.deleteChargeSheet(deletingId);
      setSuccessMessage(`Charge Sheet '${deletingId}' deleted successfully.`);
      setDeletingId(null);
      await fetchData();
    } catch (err: any) {
      setError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setSubmittingDelete(false);
    }
  };

  const getVerdictBadge = (verdict: 'Guilty' | 'Acquitted' | 'Pending') => {
    switch (verdict) {
      case 'Guilty':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/50 text-rose-300 border border-rose-800/60">
            Guilty
          </span>
        );
      case 'Acquitted':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-800/60">
            Acquitted
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/50 text-amber-300 border border-amber-800/60">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c212c] pb-4">
        <div>
          <h2 className="text-xl font-semibold text-[#f1e6c6] tracking-wide flex items-center gap-2">
            <IconBriefcase className="w-5 h-5 text-[#d2bd8b]" />
            <span>Docket Charge Sheets</span>
          </h2>
          <p className="text-xs text-[#a39e93] mt-1">
            Register formal prosecution charge sheets, record judicial verdicts, and link criminal cases under Bharatiya Nyaya Sanhita (BNS) & IPC statutory regimes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            title="Refresh Records"
            className="p-2 bg-[#141720] hover:bg-[#1a1f2b] border border-[#242b3b] text-[#a39e93] hover:text-[#eee9dc] rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
          >
            <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              clearNotifications();
              setIsCreating(!isCreating);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#24211a] hover:bg-[#342f24] border border-[#bda36d] text-[#f1e6c6] rounded-xl text-xs font-medium tracking-wide shadow-sm transition cursor-pointer"
          >
            {isCreating ? (
              <>
                <IconX className="w-3.5 h-3.5" />
                <span>Cancel Filing</span>
              </>
            ) : (
              <>
                <IconPlus className="w-3.5 h-3.5 text-[#d2bd8b]" />
                <span>File New Charge Sheet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 cursor-pointer"
          >
            <IconX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 cursor-pointer"
          >
            <IconX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Charge Sheet Creation Form Drawer */}
      {isCreating && (
        <div className="bg-[#12161f] border border-[#7d6d4e]/70 rounded-xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#212735] pb-2">
            <div>
              <h3 className="text-xs font-semibold text-[#f1e6c6] uppercase tracking-wider">
                File New Docket Charge Sheet
              </h3>
              <p className="text-[11px] text-[#8c887d]">
                Foreign key references are pre-populated from active cases, defendants, statutes, and incidents
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Charge Sheet ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CHG_201"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Criminal Case ID <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newCaseId}
                  onChange={(e) => setNewCaseId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                >
                  {lookups?.cases.map((c) => (
                    <option key={c.caseId} value={c.caseId}>
                      {c.caseId} — {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Defendant <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newDefendantId}
                  onChange={(e) => setNewDefendantId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                >
                  {lookups?.defendants.map((d) => (
                    <option key={d.entityId} value={d.entityId}>
                      {d.entityId} — {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Statute Offense (BNS / IPC Concordance) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newChargeCode}
                  onChange={(e) => setNewChargeCode(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                >
                  {lookups?.statutes.map((s) => (
                    <option key={s.chargeCode} value={s.chargeCode}>
                      {formatStatuteConcordance(s.chargeCode)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Underlying Incident <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newIncidentId}
                  onChange={(e) => setNewIncidentId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                >
                  {lookups?.incidents.map((inc) => (
                    <option key={inc.incidentId} value={inc.incidentId}>
                      {inc.incidentId} — {inc.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Initial Verdict Status
                </label>
                <select
                  value={newVerdict}
                  onChange={(e) => setNewVerdict(e.target.value as any)}
                  disabled={submittingCreate}
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                >
                  <option value="Pending">Pending (Trial Stage)</option>
                  <option value="Guilty">Guilty (Conviction)</option>
                  <option value="Acquitted">Acquitted</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Sentence Imposed (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rigorous imprisonment for 3 years, fine of ₹50,000"
                  value={newSentence}
                  onChange={(e) => setNewSentence(e.target.value)}
                  disabled={submittingCreate}
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#212735]">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                disabled={submittingCreate}
                className="px-4 py-2 bg-[#141720] hover:bg-[#1c212d] border border-[#2a3243] text-[#a39e93] rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingCreate}
                className="px-5 py-2 bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#bda36d] font-medium rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {submittingCreate ? 'Filing Charge Sheet...' : 'Submit Charge Sheet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Charge Sheets Table */}
      <div className="bg-[#12161f] border border-[#202532] rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#202532] flex items-center justify-between bg-[#151924]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f1e6c6]">Docket Charge Sheets</span>
            <span className="text-[10px] bg-[#202738] text-[#8c887d] px-2 py-0.5 rounded-full font-mono border border-[#2c374e]">
              Total: {chargeSheets.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#8c887d] space-y-2">
            <div className="w-5 h-5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Retrieving registered docket charge sheets...</p>
          </div>
        ) : chargeSheets.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#736f66]">
            No charge sheet records found. Click "+ File New Charge Sheet" to record one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1f2430] bg-[#141822] text-[#8c887d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4 font-mono">Docket ID</th>
                  <th className="py-2.5 px-4">Case</th>
                  <th className="py-2.5 px-4">Defendant</th>
                  <th className="py-2.5 px-4">Statute Offense (BNS / IPC)</th>
                  <th className="py-2.5 px-4 font-mono">Incident</th>
                  <th className="py-2.5 px-4">Verdict</th>
                  <th className="py-2.5 px-4">Sentence</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181d26]">
                {chargeSheets.map((cs) => {
                  const statute = getStatuteDisplay(cs.Charge_Code);

                  return (
                    <tr key={cs.Charge_Sheet_ID} className="hover:bg-[#161b25] transition">
                      <td className="py-3 px-4 font-mono font-medium text-[#d2bd8b]">
                        {cs.Charge_Sheet_ID}
                      </td>
                      <td className="py-3 px-4 text-[#eee9dc] font-mono">
                        {cs.Criminal_Case_ID}
                      </td>
                      <td className="py-3 px-4 text-[#cfc9ba]">
                        <span className="font-mono text-[#a39e93] text-[11px]">{cs.Defendant_ID}</span>
                        {cs.Defendant_Name && (
                          <span className="block text-[11px] text-[#eee9dc] font-medium">
                            {cs.Defendant_Name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#cfc9ba]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[#f1e6c6] text-[11px]">
                            {statute.primary}
                          </span>
                          <span
                            className={`px-1 rounded text-[9px] font-semibold ${statute.regime === 'BNS'
                              ? 'bg-amber-950/40 text-amber-300 border border-amber-800/40'
                              : statute.regime === 'IPC'
                                ? 'bg-blue-950/40 text-blue-300 border border-blue-800/40'
                                : 'bg-purple-950/40 text-purple-300 border border-purple-800/40'
                              }`}
                          >
                            {statute.regime === 'BNS' ? 'BNS' : statute.regime === 'IPC' ? 'IPC' : 'Act'}
                          </span>
                        </div>
                        {statute.secondary && (
                          <span className="block text-[10px] text-[#8c887d] truncate max-w-xs">
                            {statute.secondary}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#a39e93]">
                        {cs.Incident_ID}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getVerdictBadge(cs.Verdict_Type)}
                      </td>
                      <td className="py-3 px-4 text-[#8c887d] max-w-xs truncate" title={cs.Sentence_Imposed || 'None'}>
                        {cs.Sentence_Imposed || <span className="italic text-[#555a66]">None</span>}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => openEditModal(cs)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1a1f2b] hover:bg-[#252c3d] border border-[#2e374d] text-[#cfc9ba] hover:text-[#f1e6c6] rounded-lg text-[11px] font-medium transition cursor-pointer"
                        >
                          <IconEdit className="w-3 h-3 text-[#d2bd8b]" />
                          <span>Verdict</span>
                        </button>
                        <button
                          onClick={() => {
                            clearNotifications();
                            setDeletingId(cs.Charge_Sheet_ID);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-lg text-[11px] font-medium transition cursor-pointer"
                        >
                          <IconTrash className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Verdict Modal */}
      {editingSheet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-[#7d6d4e] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#212735] pb-3">
              <div>
                <h3 className="text-sm font-serif font-medium text-[#f1e6c6]">Update Verdict & Sentence</h3>
                <p className="text-[11px] text-[#8c887d] font-mono">
                  Target Docket: {editingSheet.Charge_Sheet_ID} ({editingSheet.Criminal_Case_ID})
                </p>
              </div>
              <button
                onClick={() => setEditingSheet(null)}
                className="text-[#8c887d] hover:text-[#eee9dc] cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Recorded Verdict
                </label>
                <select
                  value={editVerdict}
                  onChange={(e) => setEditVerdict(e.target.value as any)}
                  disabled={submittingEdit}
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                >
                  <option value="Pending">Pending (Trial Ongoing)</option>
                  <option value="Guilty">Guilty (Conviction)</option>
                  <option value="Acquitted">Acquitted</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Sentence Imposed
                </label>
                <textarea
                  rows={3}
                  placeholder="Record formal judicial sentence details or fine amounts..."
                  value={editSentence}
                  onChange={(e) => setEditSentence(e.target.value)}
                  disabled={submittingEdit}
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl p-2.5 text-xs text-[#eee9dc] outline-none transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#212735]">
                <button
                  type="button"
                  onClick={() => setEditingSheet(null)}
                  disabled={submittingEdit}
                  className="px-3.5 py-1.5 bg-[#141720] hover:bg-[#1c212d] border border-[#2a3243] text-[#a39e93] rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-4 py-1.5 bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#bda36d] font-medium rounded-xl text-xs shadow transition cursor-pointer disabled:opacity-50"
                >
                  {submittingEdit ? 'Saving...' : 'Update Verdict'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141216] border border-rose-800/80 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <IconAlertCircle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-rose-200">Confirm Charge Sheet Deletion</h3>
            </div>

            <p className="text-xs text-[#d0c9bb] leading-relaxed">
              Are you sure you want to permanently delete charge sheet{' '}
              <span className="font-mono font-bold text-rose-300">{deletingId}</span>?
            </p>

            <p className="text-[11px] text-[#8c887d]">
              This will remove the docket entry connecting the defendant, statute, and incident for this proceeding.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={submittingDelete}
                className="px-3.5 py-1.5 bg-[#1c1d24] hover:bg-[#252833] border border-[#303544] text-[#a39e93] rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={submittingDelete}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-medium rounded-xl text-xs shadow transition cursor-pointer disabled:opacity-50"
              >
                {submittingDelete ? 'Deleting...' : 'Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
