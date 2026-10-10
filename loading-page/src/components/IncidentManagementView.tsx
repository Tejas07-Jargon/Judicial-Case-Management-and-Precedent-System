import { useState, useEffect } from 'react';
import { api, Incident, ApiClientError } from '../api';

export function IncidentManagementView() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Creation Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newId, setNewId] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Edit Modal State
  const [editingIncident, setEditingIncident] = useState<Incident | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAllIncidents();
      setIncidents(data.incidents);
    } catch (err: any) {
      setError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const clearNotifications = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearNotifications();

    if (!newId.trim() || !newDate.trim() || !newLocation.trim()) {
      setError('Incident ID, Incident Date, and Location are required fields.');
      return;
    }

    setSubmittingCreate(true);
    try {
      const created = await api.createIncident({
        incidentId: newId.trim(),
        incidentDate: new Date(newDate).toISOString(),
        location: newLocation.trim(),
        description: newDescription.trim() || undefined,
      });

      setSuccessMessage(`Incident '${created.Incident_ID}' created successfully.`);
      setNewId('');
      setNewDate('');
      setNewLocation('');
      setNewDescription('');
      setIsCreating(false);
      await fetchIncidents();
    } catch (err: any) {
      setError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setSubmittingCreate(false);
    }
  };

  const openEditModal = (inc: Incident) => {
    clearNotifications();
    setEditingIncident(inc);
    // Convert to local datetime string format for input if possible
    try {
      const d = new Date(inc.Incident_Date);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      setEditDate(localISOTime);
    } catch {
      setEditDate('');
    }
    setEditLocation(inc.Location);
    setEditDescription(inc.Description || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncident) return;
    clearNotifications();

    if (!editLocation.trim()) {
      setError('Location cannot be empty.');
      return;
    }

    setSubmittingEdit(true);
    try {
      await api.updateIncident(editingIncident.Incident_ID, {
        incidentDate: editDate ? new Date(editDate).toISOString() : undefined,
        location: editLocation.trim(),
        description: editDescription.trim() || undefined,
      });

      setSuccessMessage(`Incident '${editingIncident.Incident_ID}' updated successfully.`);
      setEditingIncident(null);
      await fetchIncidents();
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
      await api.deleteIncident(deletingId);
      setSuccessMessage(`Incident '${deletingId}' deleted successfully.`);
      setDeletingId(null);
      await fetchIncidents();
    } catch (err: any) {
      setError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setSubmittingDelete(false);
    }
  };

  const formatDate = (raw: string) => {
    try {
      const d = new Date(raw);
      if (isNaN(d.getTime())) return raw;
      return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return raw;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#232730] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📍</span>
            <h2 className="text-lg font-bold text-[#f1e6c6] tracking-wide">Incident Management</h2>
            <span className="text-xs bg-[#24211a] text-[#d2bd8b] border border-[#7d6d4e] px-2 py-0.5 rounded-full font-mono">
              CRUD Operations
            </span>
          </div>
          <p className="text-xs text-[#8c887d] mt-1">
            Single Source of Truth for crime occurrences, locations, and incident timelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchIncidents}
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
            {isCreating ? '✕ Cancel' : '+ Register New Incident'}
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

      {/* Incident Creation Form Drawer */}
      {isCreating && (
        <div className="bg-[#121519] border border-[#7d6d4e]/60 rounded-xl p-5 shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-[#232730] pb-2">
            <h3 className="text-xs font-semibold text-[#f1e6c6] uppercase tracking-wider">
              Register New Incident (INSERT)
            </h3>
            <span className="text-[11px] text-[#8c887d]">All mandatory fields are validated</span>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Incident ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. INC_101"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition"
                />
                <span className="text-[10px] text-[#6b665c]">Unique primary key</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Incident Date & Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
                />
                <span className="text-[10px] text-[#6b665c]">ISO datetime</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Location <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. T. Nagar, Chennai"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition"
                />
                <span className="text-[10px] text-[#6b665c]">Max 255 characters</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                Description / Summary
              </label>
              <textarea
                placeholder="Narrative summary of observed criminal occurrences, physical artifacts, or dispatch notes..."
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                disabled={submittingCreate}
                className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg p-2.5 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition resize-none"
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
                {submittingCreate ? 'Inserting...' : 'Commit Incident Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Incidents Table */}
      <div className="bg-[#121519] border border-[#1e2229] rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#1e2229] flex items-center justify-between bg-[#15181f]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f1e6c6]">Registered Incidents</span>
            <span className="text-[10px] bg-[#202530] text-[#8c887d] px-2 py-0.5 rounded-full font-mono">
              Total: {incidents.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#8c887d] space-y-2">
            <div className="w-5 h-5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Querying isolated incident records from DBMS_DA2_TEST...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#736f66]">
            No incident records found in the database. Click "+ Register New Incident" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1e2229] bg-[#14171e] text-[#8c887d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4 font-mono">Incident ID</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181c22]">
                {incidents.map((inc) => (
                  <tr key={inc.Incident_ID} className="hover:bg-[#161a22] transition">
                    <td className="py-3 px-4 font-mono font-medium text-[#d2bd8b]">
                      {inc.Incident_ID}
                    </td>
                    <td className="py-3 px-4 text-[#eee9dc] whitespace-nowrap">
                      {formatDate(inc.Incident_Date)}
                    </td>
                    <td className="py-3 px-4 text-[#cfc9ba] max-w-xs truncate" title={inc.Location}>
                      {inc.Location}
                    </td>
                    <td
                      className="py-3 px-4 text-[#8c887d] max-w-md truncate"
                      title={inc.Description || 'None'}
                    >
                      {inc.Description || <span className="italic text-[#555a66]">None recorded</span>}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => openEditModal(inc)}
                        className="px-2.5 py-1 bg-[#1e2229] hover:bg-[#2b303a] border border-[#373d4a] text-[#cfc9ba] hover:text-[#f1e6c6] rounded text-[11px] font-medium transition cursor-pointer"
                      >
                        ✎ Edit
                      </button>
                      <button
                        onClick={() => {
                          clearNotifications();
                          setDeletingId(inc.Incident_ID);
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

      {/* Edit Incident Modal */}
      {editingIncident && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#121519] border border-[#7d6d4e] rounded-xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#232730] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#f1e6c6]">Edit Incident Details (UPDATE)</h3>
                <p className="text-[11px] text-[#8c887d] font-mono">
                  Target: {editingIncident.Incident_ID}
                </p>
              </div>
              <button
                onClick={() => setEditingIncident(null)}
                className="text-[#8c887d] hover:text-[#eee9dc] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Incident Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  disabled={submittingEdit}
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Location <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  disabled={submittingEdit}
                  required
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg px-3 py-1.5 text-xs text-[#eee9dc] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Description / Summary
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={submittingEdit}
                  className="w-full bg-[#181b22] border border-[#2b313d] focus:border-[#d2bd8b] rounded-lg p-2.5 text-xs text-[#eee9dc] outline-none transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#232730]">
                <button
                  type="button"
                  onClick={() => setEditingIncident(null)}
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
              <h3 className="text-sm font-bold text-rose-200">Confirm Incident Deletion (DELETE)</h3>
            </div>

            <p className="text-xs text-[#d0c9bb] leading-relaxed">
              Are you sure you want to permanently delete incident{' '}
              <span className="font-mono font-bold text-rose-300">{deletingId}</span>?
            </p>

            <div className="bg-[#1c1618] border border-rose-900/60 p-3 rounded-lg text-[11px] text-[#e3a1a1] space-y-1">
              <span className="font-semibold block text-rose-300">Foreign Key Constraint Protection:</span>
              <p>
                If any existing <code className="font-mono text-rose-200">DOCKET_CHARGE_SHEET</code> records reference this incident, the backend will prevent deletion and return a 409 Foreign Key Conflict.
              </p>
            </div>

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
