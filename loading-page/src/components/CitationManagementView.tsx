import { useState, useEffect } from 'react';
import { api, Citation, LookupOptions, ApiClientError } from '../api';
import {
  IconScale,
  IconPlus,
  IconX,
  IconEdit,
  IconTrash,
  IconCheckCircle,
  IconAlertCircle,
  IconRefresh,
} from './Icons';

export function CitationManagementView() {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [lookups, setLookups] = useState<LookupOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Creation Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newId, setNewId] = useState('');
  const [newCitingId, setNewCitingId] = useState('');
  const [newCitedId, setNewCitedId] = useState('');
  const [newTreatment, setNewTreatment] = useState<
    'Followed' | 'Distinguished' | 'Overruled' | 'Considered'
  >('Followed');
  const [newRelevanceNote, setNewRelevanceNote] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit Modal State
  const [editingCitation, setEditingCitation] = useState<Citation | null>(null);
  const [editTreatment, setEditTreatment] = useState<
    'Followed' | 'Distinguished' | 'Overruled' | 'Considered'
  >('Followed');
  const [editRelevanceNote, setEditRelevanceNote] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [citationsData, lookupsData] = await Promise.all([
        api.getAllCitations(),
        api.getLookupOptions(),
      ]);
      setCitations(citationsData.citations);
      setLookups(lookupsData);

      // Pre-select judgment dropdowns if available and empty
      if (lookupsData.judgments.length > 0 && !newCitingId) {
        setNewCitingId(lookupsData.judgments[0].judgmentId);
      }
      if (lookupsData.judgments.length > 1 && !newCitedId) {
        setNewCitedId(lookupsData.judgments[1].judgmentId);
      } else if (lookupsData.judgments.length > 0 && !newCitedId) {
        setNewCitedId(lookupsData.judgments[0].judgmentId);
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

    if (!newId.trim() || !newCitingId || !newCitedId) {
      setError('Citation ID, Citing Judgment, and Cited Judgment are required fields.');
      return;
    }

    if (newCitingId === newCitedId) {
      setError('A judgment cannot cite itself as precedent. Please choose different judgments.');
      return;
    }

    setSubmittingCreate(true);
    try {
      const created = await api.createCitation({
        citationId: newId.trim(),
        citingJudgmentId: newCitingId,
        citedJudgmentId: newCitedId,
        precedentTreatment: newTreatment,
        relevanceNote: newRelevanceNote.trim() || undefined,
      });

      setSuccessMessage(`Citation link '${created.Citation_ID}' established successfully.`);
      setNewId('');
      setNewRelevanceNote('');
      setNewTreatment('Followed');
      setIsCreating(false);
      await fetchData();
    } catch (err: any) {
      setError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setSubmittingCreate(false);
    }
  };

  const openEditModal = (c: Citation) => {
    clearNotifications();
    setEditingCitation(c);
    setEditTreatment(c.Precedent_Treatment);
    setEditRelevanceNote(c.Relevance_Note || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCitation) return;
    clearNotifications();

    setSubmittingEdit(true);
    try {
      await api.updateCitation(editingCitation.Citation_ID, {
        precedentTreatment: editTreatment,
        relevanceNote: editRelevanceNote.trim() || undefined,
      });

      setSuccessMessage(
        `Citation '${editingCitation.Citation_ID}' treatment updated to '${editTreatment}'.`
      );
      setEditingCitation(null);
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
      await api.deleteCitation(deletingId);
      setSuccessMessage(`Citation '${deletingId}' deleted successfully.`);
      setDeletingId(null);
      await fetchData();
    } catch (err: any) {
      setError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setSubmittingDelete(false);
    }
  };

  const getTreatmentBadge = (
    treatment: 'Followed' | 'Distinguished' | 'Overruled' | 'Considered'
  ) => {
    switch (treatment) {
      case 'Followed':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-800/60">
            Followed
          </span>
        );
      case 'Overruled':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950/50 text-rose-300 border border-rose-800/60">
            Overruled
          </span>
        );
      case 'Distinguished':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/50 text-amber-300 border border-amber-800/60">
            Distinguished
          </span>
        );
      case 'Considered':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950/50 text-blue-300 border border-blue-800/60">
            Considered
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
            <IconScale className="w-5 h-5 text-[#d2bd8b]" />
            <span>Judgment Citations</span>
          </h2>
          <p className="text-xs text-[#a39e93] mt-1">
            Maintain judicial precedent relationships, citing lineage, and binding treatment classifications across judgments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            title="Refresh Citations"
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
                <span>Cancel Recording</span>
              </>
            ) : (
              <>
                <IconPlus className="w-3.5 h-3.5 text-[#d2bd8b]" />
                <span>Record New Citation</span>
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

      {/* Citation Creation Form Drawer */}
      {isCreating && (
        <div className="bg-[#12161f] border border-[#7d6d4e]/70 rounded-xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="border-b border-[#212735] pb-2">
            <h3 className="text-xs font-semibold text-[#f1e6c6] uppercase tracking-wider">
              Establish Precedent Citation Link
            </h3>
            <p className="text-[11px] text-[#8c887d]">
              Records a formal cross-reference between an adjudicating decision and a precedent judgment
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Citation ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CIT_105"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Citing Judgment (Later Bench) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newCitingId}
                  onChange={(e) => setNewCitingId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                >
                  {lookups?.judgments.map((j) => (
                    <option key={j.judgmentId} value={j.judgmentId}>
                      {j.judgmentId} — {j.caseTitle} ({j.courtName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Cited Precedent (Earlier Bench) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newCitedId}
                  onChange={(e) => setNewCitedId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                >
                  {lookups?.judgments.map((j) => (
                    <option key={j.judgmentId} value={j.judgmentId}>
                      {j.judgmentId} — {j.caseTitle} ({j.courtName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Precedent Treatment <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newTreatment}
                  onChange={(e) => setNewTreatment(e.target.value as any)}
                  disabled={submittingCreate}
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                >
                  <option value="Followed">Followed (Binding Authority)</option>
                  <option value="Distinguished">Distinguished (Factual Variance)</option>
                  <option value="Overruled">Overruled (Subsequent Higher Bench)</option>
                  <option value="Considered">Considered (Substantive Discussion)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Relevance / Jurisprudential Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Applied evidentiary standards under digital record authentication"
                  value={newRelevanceNote}
                  onChange={(e) => setNewRelevanceNote(e.target.value)}
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
                {submittingCreate ? 'Establishing Link...' : 'Establish Citation Link'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Citations Table */}
      <div className="bg-[#12161f] border border-[#202532] rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#202532] flex items-center justify-between bg-[#151924]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f1e6c6]">Recorded Precedent Citations</span>
            <span className="text-[10px] bg-[#202738] text-[#8c887d] px-2 py-0.5 rounded-full font-mono border border-[#2c374e]">
              Total: {citations.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#8c887d] space-y-2">
            <div className="w-5 h-5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Retrieving precedent citation relationships...</p>
          </div>
        ) : citations.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#736f66]">
            No citation records found. Click "+ Record New Citation" to establish a precedent link.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1f2430] bg-[#141822] text-[#8c887d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4 font-mono">Citation ID</th>
                  <th className="py-2.5 px-4">Citing Judgment (Later)</th>
                  <th className="py-2.5 px-4">Cited Precedent (Earlier)</th>
                  <th className="py-2.5 px-4">Treatment</th>
                  <th className="py-2.5 px-4">Relevance Note</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181d26]">
                {citations.map((c) => (
                  <tr key={c.Citation_ID} className="hover:bg-[#161b25] transition">
                    <td className="py-3 px-4 font-mono font-medium text-[#d2bd8b]">
                      {c.Citation_ID}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[#eee9dc] font-semibold">{c.Citing_Judgment_ID}</span>
                      {c.Citing_Case_Title && (
                        <span className="block text-[11px] text-[#8c887d] truncate max-w-xs">
                          {c.Citing_Case_Title}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[#d2bd8b] font-semibold">{c.Cited_Judgment_ID}</span>
                      {c.Cited_Case_Title && (
                        <span className="block text-[11px] text-[#8c887d] truncate max-w-xs">
                          {c.Cited_Case_Title}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getTreatmentBadge(c.Precedent_Treatment)}
                    </td>
                    <td className="py-3 px-4 text-[#cfc9ba] max-w-sm truncate" title={c.Relevance_Note || 'None'}>
                      {c.Relevance_Note || <span className="italic text-[#555a66]">None recorded</span>}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => openEditModal(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1a1f2b] hover:bg-[#252c3d] border border-[#2e374d] text-[#cfc9ba] hover:text-[#f1e6c6] rounded-lg text-[11px] font-medium transition cursor-pointer"
                      >
                        <IconEdit className="w-3 h-3 text-[#d2bd8b]" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          clearNotifications();
                          setDeletingId(c.Citation_ID);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 rounded-lg text-[11px] font-medium transition cursor-pointer"
                      >
                        <IconTrash className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Citation Modal */}
      {editingCitation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-[#7d6d4e] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#212735] pb-3">
              <div>
                <h3 className="text-sm font-serif font-medium text-[#f1e6c6]">Update Precedent Treatment</h3>
                <p className="text-[11px] text-[#8c887d] font-mono">
                  Citation ID: {editingCitation.Citation_ID} ({editingCitation.Citing_Judgment_ID} →{' '}
                  {editingCitation.Cited_Judgment_ID})
                </p>
              </div>
              <button
                onClick={() => setEditingCitation(null)}
                className="text-[#8c887d] hover:text-[#eee9dc] cursor-pointer"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Precedent Treatment
                </label>
                <select
                  value={editTreatment}
                  onChange={(e) => setEditTreatment(e.target.value as any)}
                  disabled={submittingEdit}
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                >
                  <option value="Followed">Followed (Binding Authority)</option>
                  <option value="Distinguished">Distinguished (Factual Variance)</option>
                  <option value="Overruled">Overruled (Subsequent Higher Bench)</option>
                  <option value="Considered">Considered (Substantive Discussion)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Relevance / Jurisprudential Note
                </label>
                <textarea
                  rows={3}
                  value={editRelevanceNote}
                  onChange={(e) => setEditRelevanceNote(e.target.value)}
                  disabled={submittingEdit}
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl p-2.5 text-xs text-[#eee9dc] outline-none transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#212735]">
                <button
                  type="button"
                  onClick={() => setEditingCitation(null)}
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
                  {submittingEdit ? 'Saving...' : 'Update Treatment'}
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
              <h3 className="text-sm font-semibold text-rose-200">Confirm Citation Deletion</h3>
            </div>

            <p className="text-xs text-[#d0c9bb] leading-relaxed">
              Are you sure you want to permanently delete precedent citation link{' '}
              <span className="font-mono font-bold text-rose-300">{deletingId}</span>?
            </p>

            <p className="text-[11px] text-[#8c887d]">
              This will remove the precedent relationship and dynamically re-calculate citation influence rankings across all affected judgments.
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
