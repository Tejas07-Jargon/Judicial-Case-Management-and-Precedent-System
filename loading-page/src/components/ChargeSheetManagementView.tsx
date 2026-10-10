import { useState, useEffect } from 'react';
import { api, ChargeSheet, LookupOptions, ApiClientError } from '../api';

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

  const openEditModal = (sheet: ChargeSheet) => {
    clearNotifications();
    setEditingSheet(sheet);
    setEditVerdict(sheet.Verdict_Type);
    setEditSentence(sheet.Sentence_Imposed || '');
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

      setSuccessMessage(`Charge Sheet '${editingSheet.Charge_Sheet_ID}' updated successfully.`);
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

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'Guilty':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-800">
            Guilty
          </span>
        );
      case 'Acquitted':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
            Acquitted
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232730] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h2 className="text-lg font-bold text-[#f1e6c6] tracking-wide">Charge Sheet Management</h2>
            <span className="text-xs bg-[#24211a] text-[#d2bd8b] border border-[#7d6d4e] px-2 py-0.5 rounded-full font-mono">
              DOCKET_CHARGE_SHEET CRUD
            </span>
          </div>
          <p className="text-xs text-[#8c887d] mt-1">
            Connects Criminal Cases, Defendants, Statutory Offenses, Incidents, and Verdicts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-1.5 bg-[#14171d] hover:bg-[#1e222b] border border-[#2e3340] text-[#a39e93] hover:text-[#eee9dc] rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : '↻ Refresh List'}
          </button>
          <button
            onClick={() => {
              clearNotifications();
              setIsCreating(!isCreating);
            }}
            className="px-3.5 py-1.5 bg-[#24211a] hover:bg-[#342f24] border border-[#bda36d] text-[#f1e6c6] rounded-lg text-xs font-medium tracking-wide shadow-sm transition cursor-pointer"
          >
            {isCreating ? '✕ Cancel' : '+ File New Charge Sheet'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-200 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Charge Sheet Creation Form Drawer */}
      {isCreating && (
        <div className="bg-[#121519] border border-[#7d6d4e]/60 rounded-xl p-5 shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#232730] pb-2">
            <div>
              <h3 className="text-xs font-semibold text-[#f1e6c6] uppercase tracking-wider">
                File New Docket Charge Sheet (INSERT)
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
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition"
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
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
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
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
                >
                  {lookups?.defendants.map((d) => (
                    <option key={d.entityId} value={d.entityId}>
                      {d.entityId} — {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Statute Offense <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newChargeCode}
                  onChange={(e) => setNewChargeCode(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
                >
                  {lookups?.statutes.map((s) => (
                    <option key={s.chargeCode} value={s.chargeCode}>
                      {s.chargeCode} — {s.sectionName}
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
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
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
                  Initial Verdict
                </label>
                <select
                  value={newVerdict}
                  onChange={(e) => setNewVerdict(e.target.value as any)}
                  disabled={submittingCreate}
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
                >
                  <option value="Pending">Pending</option>
                  <option value="Guilty">Guilty</option>
                  <option value="Acquitted">Acquitted</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                Sentence Imposed (if any)
              </label>
              <input
                type="text"
                placeholder="e.g. 3 years Rigorous Imprisonment and Rs. 50,000 fine"
                value={newSentence}
                onChange={(e) => setNewSentence(e.target.value)}
                disabled={submittingCreate}
                className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                disabled={submittingCreate}
                className="px-3 py-1.5 bg-[#14171d] hover:bg-[#1e222b] border border-[#2e3340] text-[#a39e93] rounded-lg text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingCreate}
                className="px-4 py-1.5 bg-[#bda36d] hover:bg-[#d2bd8b] text-[#121519] font-semibold rounded-lg text-xs shadow transition cursor-pointer disabled:opacity-50"
              >
                {submittingCreate ? 'Filing...' : 'Commit Charge Sheet'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Charge Sheets Table */}
      <div className="bg-[#121519] border border-[#1e2229] rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#1e2229] flex items-center justify-between bg-[#15181f]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f1e6c6]">Docket Charge Sheets</span>
            <span className="text-[10px] bg-[#202530] text-[#8c887d] px-2 py-0.5 rounded-full font-mono">
              Total: {chargeSheets.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#8c887d] space-y-2">
            <div className="w-5 h-5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Querying charge sheets and case linkages from DBMS_DA2_TEST...</p>
          </div>
        ) : chargeSheets.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#736f66]">
            No charge sheet records found. Click "+ File New Charge Sheet" to record one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2229] bg-[#14171e] text-[#8c887d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4 font-mono">Docket ID</th>
                  <th className="py-2.5 px-4">Case</th>
                  <th className="py-2.5 px-4">Defendant</th>
                  <th className="py-2.5 px-4">Statute Offense</th>
                  <th className="py-2.5 px-4 font-mono">Incident</th>
                  <th className="py-2.5 px-4">Verdict</th>
                  <th className="py-2.5 px-4">Sentence</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181c22]">
                {chargeSheets.map((cs) => (
                  <tr key={cs.Charge_Sheet_ID} className="hover:bg-[#161a22] transition">
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
                      <span className="font-mono text-[#d2bd8b] text-[11px]">{cs.Charge_Code}</span>
                      {cs.Charge_Section && (
                        <span className="block text-[11px] text-[#8c887d] truncate max-w-xs">
                          {cs.Charge_Section}
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
                        className="px-2.5 py-1 bg-[#1e2229] hover:bg-[#2b303a] border border-[#373d4a] text-[#cfc9ba] hover:text-[#f1e6c6] rounded text-[11px] font-medium transition cursor-pointer"
                      >
                        ✎ Verdict
                      </button>
                      <button
                        onClick={() => {
                          clearNotifications();
                          setDeletingId(cs.Charge_Sheet_ID);
                        }}
                        className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded text-[11px] font-medium transition cursor-pointer"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Verdict Modal */}
      {editingSheet && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121519] border border-[#7d6d4e] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#232730] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#f1e6c6]">Update Verdict & Sentence (UPDATE)</h3>
                <p className="text-[11px] text-[#8c887d] font-mono">
                  Target Docket: {editingSheet.Charge_Sheet_ID} ({editingSheet.Criminal_Case_ID})
                </p>
              </div>
              <button
                onClick={() => setEditingSheet(null)}
                className="text-[#8c887d] hover:text-[#eee9dc] text-lg font-bold"
              >
                ✕
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
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
                >
                  <option value="Pending">Pending</option>
                  <option value="Guilty">Guilty</option>
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
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg p-2.5 text-xs text-[#eee9dc] outline-none transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#232730]">
                <button
                  type="button"
                  onClick={() => setEditingSheet(null)}
                  disabled={submittingEdit}
                  className="px-3.5 py-1.5 bg-[#14171d] hover:bg-[#1e222b] border border-[#2e3340] text-[#a39e93] rounded-lg text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-4 py-1.5 bg-[#bda36d] hover:bg-[#d2bd8b] text-[#121519] font-semibold rounded-lg text-xs shadow transition cursor-pointer disabled:opacity-50"
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
          <div className="bg-[#141214] border border-rose-800/80 rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-sm font-bold text-rose-200">Confirm Charge Sheet Deletion (DELETE)</h3>
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
                className="px-3.5 py-1.5 bg-[#1c1d22] hover:bg-[#252830] border border-[#323640] text-[#a39e93] rounded-lg text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={submittingDelete}
                className="px-4 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-semibold rounded-lg text-xs shadow transition cursor-pointer disabled:opacity-50"
              >
                {submittingDelete ? 'Deleting...' : 'Yes, Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
