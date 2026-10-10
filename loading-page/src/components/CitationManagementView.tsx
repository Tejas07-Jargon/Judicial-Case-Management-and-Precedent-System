import { useState, useEffect } from 'react';
import { api, JudgmentCitation, LookupOptions, ApiClientError } from '../api';

export function CitationManagementView() {
  const [citations, setCitations] = useState<JudgmentCitation[]>([]);
  const [lookups, setLookups] = useState<LookupOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Create Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newCitationId, setNewCitationId] = useState('');
  const [newCitingId, setNewCitingId] = useState('');
  const [newCitedId, setNewCitedId] = useState('');
  const [newTreatment, setNewTreatment] = useState<'Followed' | 'Distinguished' | 'Overruled'>('Followed');
  const [newNote, setNewNote] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit Modal State
  const [editingCitation, setEditingCitation] = useState<JudgmentCitation | null>(null);
  const [editTreatment, setEditTreatment] = useState<'Followed' | 'Distinguished' | 'Overruled'>('Followed');
  const [editNote, setEditNote] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [citationsData, lookupsData] = await Promise.all([
        api.getAllJudgmentCitations(),
        api.getLookupOptions(),
      ]);
      setCitations(citationsData.citations);
      setLookups(lookupsData);

      if (lookupsData.judgments.length > 0 && !newCitingId) {
        setNewCitingId(lookupsData.judgments[0].judgmentId);
      }
      if (lookupsData.judgments.length > 1 && !newCitedId) {
        setNewCitedId(lookupsData.judgments[1].judgmentId);
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

    if (!newCitationId.trim() || !newCitingId || !newCitedId) {
      setError('Citation ID, Citing Judgment, and Cited Judgment are required.');
      return;
    }

    if (newCitingId === newCitedId) {
      setError('Invalid Self-Citation: A judgment cannot cite itself as a legal precedent.');
      return;
    }

    setSubmittingCreate(true);
    try {
      const created = await api.createJudgmentCitation({
        citationId: newCitationId.trim(),
        citingJudgmentId: newCitingId,
        citedJudgmentId: newCitedId,
        precedentTreatment: newTreatment,
        relevanceNote: newNote.trim() || undefined,
      });

      setSuccessMessage(`Judgment Citation '${created.Citation_ID}' recorded successfully.`);
      setNewCitationId('');
      setNewNote('');
      setIsCreating(false);
      await fetchData();
    } catch (err: any) {
      setError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setSubmittingCreate(false);
    }
  };

  const openEditModal = (citation: JudgmentCitation) => {
    clearNotifications();
    setEditingCitation(citation);
    setEditTreatment(citation.Precedent_Treatment);
    setEditNote(citation.Relevance_Note || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCitation) return;
    clearNotifications();

    setSubmittingEdit(true);
    try {
      await api.updateJudgmentCitation(editingCitation.Citation_ID, {
        precedentTreatment: editTreatment,
        relevanceNote: editNote.trim() || undefined,
      });

      setSuccessMessage(`Citation '${editingCitation.Citation_ID}' updated successfully.`);
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
      await api.deleteJudgmentCitation(deletingId);
      setSuccessMessage(`Judgment Citation '${deletingId}' deleted successfully.`);
      setDeletingId(null);
      await fetchData();
    } catch (err: any) {
      setError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setSubmittingDelete(false);
    }
  };

  const getTreatmentBadge = (treatment: string) => {
    switch (treatment) {
      case 'Followed':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
            Followed
          </span>
        );
      case 'Distinguished':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-950/60 text-sky-300 border border-sky-800">
            Distinguished
          </span>
        );
      case 'Overruled':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-800">
            Overruled
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-950/60 text-amber-300 border border-amber-800">
            {treatment}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232730] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h2 className="text-lg font-bold text-[#f1e6c6] tracking-wide">Judgment Citation Management</h2>
            <span className="text-xs bg-[#24211a] text-[#d2bd8b] border border-[#7d6d4e] px-2 py-0.5 rounded-full font-mono">
              JUDGMENT_CITATION CRUD
            </span>
          </div>
          <p className="text-xs text-[#8c887d] mt-1">
            Establish legal precedent lineages, authoritative treatment types, and judicial rationale notes.
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
            {isCreating ? '✕ Cancel' : '+ Record New Citation'}
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

      {/* Citation Creation Form */}
      {isCreating && (
        <div className="bg-[#121519] border border-[#7d6d4e]/60 rounded-xl p-5 shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#232730] pb-2">
            <div>
              <h3 className="text-xs font-semibold text-[#f1e6c6] uppercase tracking-wider">
                Record New Judgment Citation (INSERT)
              </h3>
              <p className="text-[11px] text-[#8c887d]">
                Self-citations are blocked by frontend logic and validated by the backend business rules
              </p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Citation ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. JCIT_101"
                  value={newCitationId}
                  onChange={(e) => setNewCitationId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Citing Judgment (Later Decision) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newCitingId}
                  onChange={(e) => setNewCitingId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
                >
                  {lookups?.judgments.map((j) => (
                    <option key={j.judgmentId} value={j.judgmentId}>
                      {j.judgmentId} ({j.caseId}{j.caseTitle ? ` - ${j.caseTitle}` : ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Cited Precedent (Earlier Authority) <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newCitedId}
                  onChange={(e) => setNewCitedId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
                >
                  {lookups?.judgments.map((j) => (
                    <option key={j.judgmentId} value={j.judgmentId}>
                      {j.judgmentId} ({j.caseId}{j.caseTitle ? ` - ${j.caseTitle}` : ''})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Precedent Treatment <span className="text-rose-400">*</span>
                </label>
                <select
                  value={newTreatment}
                  onChange={(e) => setNewTreatment(e.target.value as any)}
                  disabled={submittingCreate}
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
                >
                  <option value="Followed">Followed (Applied as binding/persuasive)</option>
                  <option value="Distinguished">Distinguished (Factual or legal differences)</option>
                  <option value="Overruled">Overruled (Subsumed by superior court)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Relevance / Rationale Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Applied principles of constructive criminal knowledge under digital contract statute..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  disabled={submittingCreate}
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition"
                />
              </div>
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
                {submittingCreate ? 'Saving...' : 'Record Citation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Citations Table */}
      <div className="bg-[#121519] border border-[#1e2229] rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#1e2229] flex items-center justify-between bg-[#15181f]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f1e6c6]">Recorded Citations</span>
            <span className="text-[10px] bg-[#202530] text-[#8c887d] px-2 py-0.5 rounded-full font-mono">
              Total: {citations.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#8c887d] space-y-2">
            <div className="w-5 h-5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Querying citation lineages from DBMS_DA2_TEST...</p>
          </div>
        ) : citations.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#736f66]">
            No citation records found. Click "+ Record New Citation" to establish a precedent link.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2229] bg-[#14171e] text-[#8c887d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4 font-mono">Citation ID</th>
                  <th className="py-2.5 px-4">Citing Judgment (Later)</th>
                  <th className="py-2.5 px-4">Cited Precedent (Earlier)</th>
                  <th className="py-2.5 px-4">Treatment</th>
                  <th className="py-2.5 px-4">Relevance Note</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181c22]">
                {citations.map((c) => (
                  <tr key={c.Citation_ID} className="hover:bg-[#161a22] transition">
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
                        className="px-2.5 py-1 bg-[#1e2229] hover:bg-[#2b303a] border border-[#373d4a] text-[#cfc9ba] hover:text-[#f1e6c6] rounded text-[11px] font-medium transition cursor-pointer"
                      >
                        ✎ Edit
                      </button>
                      <button
                        onClick={() => {
                          clearNotifications();
                          setDeletingId(c.Citation_ID);
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

      {/* Edit Treatment Modal */}
      {editingCitation && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121519] border border-[#7d6d4e] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#232730] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#f1e6c6]">Edit Citation Treatment & Note (UPDATE)</h3>
                <p className="text-[11px] text-[#8c887d] font-mono">
                  Target: {editingCitation.Citation_ID} ({editingCitation.Citing_Judgment_ID} ➔ {editingCitation.Cited_Judgment_ID})
                </p>
              </div>
              <button
                onClick={() => setEditingCitation(null)}
                className="text-[#8c887d] hover:text-[#eee9dc] text-lg font-bold"
              >
                ✕
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
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
                >
                  <option value="Followed">Followed</option>
                  <option value="Distinguished">Distinguished</option>
                  <option value="Overruled">Overruled</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Relevance / Rationale Note
                </label>
                <textarea
                  rows={3}
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  disabled={submittingEdit}
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg p-2.5 text-xs text-[#eee9dc] outline-none transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#232730]">
                <button
                  type="button"
                  onClick={() => setEditingCitation(null)}
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
                  {submittingEdit ? 'Saving...' : 'Save Changes'}
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
              <h3 className="text-sm font-bold text-rose-200">Confirm Citation Deletion (DELETE)</h3>
            </div>

            <p className="text-xs text-[#d0c9bb] leading-relaxed">
              Are you sure you want to delete citation{' '}
              <span className="font-mono font-bold text-rose-300">{deletingId}</span>?
            </p>

            <p className="text-[11px] text-[#8c887d]">
              This will remove the formal precedent linkage between the judgments.
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
                {submittingDelete ? 'Deleting...' : 'Yes, Delete Citation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
