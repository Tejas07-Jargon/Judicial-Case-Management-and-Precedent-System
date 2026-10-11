import { useState, useEffect } from 'react';
import { api, Incident, ApiClientError } from '../api';
import {
  IconMapPin,
  IconPlus,
  IconX,
  IconEdit,
  IconTrash,
  IconCheckCircle,
  IconAlertCircle,
  IconRefresh,
} from './Icons';

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

      setSuccessMessage(`Incident '${created.Incident_ID}' recorded successfully.`);
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
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return raw;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c212c] pb-4">
        <div>
          <h2 className="text-xl font-semibold text-[#f1e6c6] tracking-wide flex items-center gap-2">
            <IconMapPin className="w-5 h-5 text-[#d2bd8b]" />
            <span>Incident Management</span>
          </h2>
          <p className="text-xs text-[#a39e93] mt-1">
            Maintain factual occurrence records, geocoded offense locations, timestamps, and investigation narratives.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchIncidents}
            disabled={loading}
            title="Refresh Incidents"
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
                <span>Cancel Registration</span>
              </>
            ) : (
              <>
                <IconPlus className="w-3.5 h-3.5 text-[#d2bd8b]" />
                <span>Register New Incident</span>
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

      {/* Incident Creation Form Drawer */}
      {isCreating && (
        <div className="bg-[#12161f] border border-[#7d6d4e]/70 rounded-xl p-5 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="border-b border-[#212735] pb-2">
            <h3 className="text-xs font-semibold text-[#f1e6c6] uppercase tracking-wider">
              Register New Factual Incident
            </h3>
            <p className="text-[11px] text-[#8c887d]">
              Isolated 3NF entity storing occurrence metadata independent of formal case filings
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Incident ID <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. INC_301"
                  value={newId}
                  onChange={(e) => setNewId(e.target.value)}
                  disabled={submittingCreate}
                  required
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition"
                />
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
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                />
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
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                Description / Narrative Summary
              </label>
              <textarea
                placeholder="Narrative summary of observed criminal occurrences, physical artifacts, or dispatch notes..."
                rows={2}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                disabled={submittingCreate}
                className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl p-2.5 text-xs text-[#eee9dc] placeholder-[#555a66] outline-none transition resize-none"
              />
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
                {submittingCreate ? 'Recording Incident...' : 'Record Incident'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Incidents Table */}
      <div className="bg-[#12161f] border border-[#202532] rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-[#202532] flex items-center justify-between bg-[#151924]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#f1e6c6]">Registered Incidents</span>
            <span className="text-[10px] bg-[#202738] text-[#8c887d] px-2 py-0.5 rounded-full font-mono border border-[#2c374e]">
              Total: {incidents.length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#8c887d] space-y-2">
            <div className="w-5 h-5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Retrieving factual incident registry...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#736f66]">
            No incident records found. Click "+ Register New Incident" to add one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1f2430] bg-[#141822] text-[#8c887d] text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4 font-mono">Incident ID</th>
                  <th className="py-2.5 px-4">Date & Time</th>
                  <th className="py-2.5 px-4">Location</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181d26]">
                {incidents.map((inc) => (
                  <tr key={inc.Incident_ID} className="hover:bg-[#161b25] transition">
                    <td className="py-3 px-4 font-mono font-medium text-[#d2bd8b]">
                      {inc.Incident_ID}
                    </td>
                    <td className="py-3 px-4 text-[#eee9dc] whitespace-nowrap">
                      {formatDate(inc.Incident_Date)}
                    </td>
                    <td className="py-3 px-4 text-[#cfc9ba] font-medium">
                      <div className="flex items-center gap-1.5">
                        <IconMapPin className="w-3.5 h-3.5 text-[#d2bd8b]" />
                        <span>{inc.Location}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#8c887d] max-w-md truncate" title={inc.Description || 'No description'}>
                      {inc.Description || <span className="italic text-[#555a66]">No narrative description</span>}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => openEditModal(inc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1a1f2b] hover:bg-[#252c3d] border border-[#2e374d] text-[#cfc9ba] hover:text-[#f1e6c6] rounded-lg text-[11px] font-medium transition cursor-pointer"
                      >
                        <IconEdit className="w-3 h-3 text-[#d2bd8b]" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          clearNotifications();
                          setDeletingId(inc.Incident_ID);
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

      {/* Edit Incident Modal */}
      {editingIncident && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12161f] border border-[#7d6d4e] rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#212735] pb-3">
              <div>
                <h3 className="text-sm font-serif font-medium text-[#f1e6c6]">Edit Incident Details</h3>
                <p className="text-[11px] text-[#8c887d] font-mono">
                  Target Record: {editingIncident.Incident_ID}
                </p>
              </div>
              <button
                onClick={() => setEditingIncident(null)}
                className="text-[#8c887d] hover:text-[#eee9dc] cursor-pointer"
              >
                <IconX className="w-4 h-4" />
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
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
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
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl px-3 py-2 text-xs text-[#eee9dc] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#a39e93] mb-1">
                  Description / Narrative Summary
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  disabled={submittingEdit}
                  className="w-full bg-[#181d28] border border-[#2c3445] focus:border-[#d2bd8b] rounded-xl p-2.5 text-xs text-[#eee9dc] outline-none transition resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#212735]">
                <button
                  type="button"
                  onClick={() => setEditingIncident(null)}
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
                  {submittingEdit ? 'Saving...' : 'Update Incident'}
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
              <h3 className="text-sm font-semibold text-rose-200">Confirm Incident Deletion</h3>
            </div>

            <p className="text-xs text-[#d0c9bb] leading-relaxed">
              Are you sure you want to permanently delete incident{' '}
              <span className="font-mono font-bold text-rose-300">{deletingId}</span>?
            </p>

            <p className="text-[11px] text-[#8c887d]">
              Notice: Foreign key integrity checks in the database prevent deletion if this incident is currently linked to an active charge sheet.
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
