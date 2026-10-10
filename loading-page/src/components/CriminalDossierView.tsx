import React, { useState } from 'react';
import { api, CriminalCaseDossier, ApiClientError } from '../api';

export function CriminalDossierView() {
  const [caseIdInput, setCaseIdInput] = useState('CASE_1002');
  const [dossier, setDossier] = useState<CriminalCaseDossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDossier = async (idToFetch: string) => {
    const trimmed = idToFetch.trim();
    if (!trimmed) {
      setError('Please provide a Case ID (e.g. CASE_1002, CASE_1001).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.getCriminalCaseDossier(trimmed);
      setDossier(data);
    } catch (err: any) {
      setDossier(null);
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch criminal case dossier.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDossier(caseIdInput);
  };

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div>
        <h2 className="text-xl font-semibold text-[#f1e6c6] tracking-wide">
          Criminal Case Dossier & Charge Sheets
        </h2>
        <p className="text-xs text-[#a39e93] mt-1">
          Direct invocation of MySQL 8.0 Stored Procedure{' '}
          <code className="text-[#d2bd8b] bg-[#14171a] px-1.5 py-0.5 rounded">
            Get_Criminal_Case_Dossier(IN p_Case_ID)
          </code>
          .
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <input
            type="text"
            value={caseIdInput}
            onChange={(e) => setCaseIdInput(e.target.value)}
            placeholder="Enter Case ID (e.g. CASE_1002, CASE_1001)"
            className="w-full bg-[#121519] border border-[#2b2e35] rounded-lg px-4 py-2.5 text-sm text-[#eee9dc] placeholder-[#66635b] focus:outline-none focus:border-[#d2bd8b] transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#7d6d4e] px-5 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Fetching Dossier...' : 'Search Dossier'}
        </button>
        <button
          type="button"
          onClick={() => {
            setCaseIdInput('CASE_1002');
            fetchDossier('CASE_1002');
          }}
          className="text-xs text-[#d2bd8b] hover:underline px-2 py-1"
        >
          Load CASE_1002 (Demo)
        </button>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="bg-[#241212] border border-[#6b2c2c] text-[#f1a8a8] px-4 py-3 rounded-lg text-sm flex items-start justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchDossier(caseIdInput)}
            className="text-xs text-[#f1e6c6] underline ml-4 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-[#121519] border border-[#1e2229] rounded-xl p-8 text-center text-sm text-[#8c887d] animate-pulse">
          Querying criminal records and charge sheets from database...
        </div>
      )}

      {/* Empty State before search */}
      {!loading && !error && !dossier && (
        <div className="bg-[#121519] border border-[#1e2229] rounded-xl p-8 text-center text-sm text-[#8c887d]">
          Enter a criminal case identifier and click "Search Dossier" to inspect case metadata, court hierarchy, statutory charges, and accused entities.
        </div>
      )}

      {/* Dossier Content */}
      {!loading && dossier && (
        <div className="space-y-6">
          {/* Case Metadata Card */}
          <div className="bg-[#121519] border border-[#232730] rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#232730] pb-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#d2bd8b] font-semibold">
                  {dossier.caseId}
                </span>
                <h3 className="text-lg font-medium text-[#f1e6c6] mt-0.5">
                  {dossier.caseTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded text-xs font-medium ${
                    dossier.caseStatus === 'Pending'
                      ? 'bg-[#292211] text-[#e0bb6b] border border-[#524422]'
                      : 'bg-[#15241b] text-[#71cf96] border border-[#284934]'
                  }`}
                >
                  Status: {dossier.caseStatus}
                </span>
                <span className="px-2.5 py-1 rounded text-xs bg-[#1a1e24] text-[#a39e93] border border-[#2b2e35]">
                  Filing: {new Date(dossier.filingDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#8c887d] block">Adjudicating Court</span>
                <span className="text-[#eee9dc] font-medium">{dossier.court.courtName}</span>
                <span className="text-[#8c887d] block text-[11px] mt-0.5">Tier: {dossier.court.courtTier}</span>
              </div>
              <div>
                <span className="text-[#8c887d] block">Police FIR / Complaint</span>
                <span className="text-[#eee9dc] font-medium">{dossier.criminalDetails.firNumber}</span>
              </div>
              <div>
                <span className="text-[#8c887d] block">Arresting / Investigating Agency</span>
                <span className="text-[#eee9dc] font-medium">{dossier.criminalDetails.arrestingAgency}</span>
              </div>
              <div>
                <span className="text-[#8c887d] block">Bail Amount Specified</span>
                <span className="text-[#eee9dc] font-medium">
                  {dossier.criminalDetails.bailAmount !== null
                    ? `₹ ${dossier.criminalDetails.bailAmount.toLocaleString('en-IN')}`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Charges & Incidents List */}
          <div>
            <h4 className="text-sm font-medium text-[#f1e6c6] mb-3">
              Charges & Incident Dossier ({dossier.charges.length})
            </h4>

            {dossier.charges.length === 0 ? (
              <div className="bg-[#121519] border border-[#232730] rounded-xl p-6 text-center text-xs text-[#8c887d]">
                No charge sheets have been registered for this criminal case yet. Core case information is preserved.
              </div>
            ) : (
              <div className="space-y-4">
                {dossier.charges.map((charge, idx) => (
                  <div
                    key={charge.chargeSheetId || idx}
                    className="bg-[#121519] border border-[#232730] rounded-xl p-5 text-xs hover:border-[#383d47] transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2229] pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#1b2028] text-[#d2bd8b] px-2 py-0.5 rounded font-mono text-[11px]">
                          {charge.chargeSheetId}
                        </span>
                        <span className="text-sm font-medium text-[#eee9dc]">
                          {charge.statutorySection}
                        </span>
                        <span className="text-[#8c887d] text-[11px]">({charge.chargeCode})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#1f242d] text-[#c2bdae]">
                          Verdict: {charge.recordedVerdict}
                        </span>
                        {charge.sentenceImposed && charge.sentenceImposed !== 'N/A' && (
                          <span className="px-2 py-0.5 rounded bg-[#2b1f1f] text-[#e89d9d]">
                            Sentence: {charge.sentenceImposed}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Defendant details */}
                      <div>
                        <span className="text-[#8c887d] block text-[11px]">Accused Defendant</span>
                        <span className="text-[#eee9dc] font-medium text-sm">
                          {charge.defendantName}
                        </span>
                        <span className="text-[#8c887d] block text-[11px] mt-0.5">
                          Type: {charge.defendantType} • Entity ID: {charge.defendantId}
                        </span>
                      </div>

                      {/* Incident Details */}
                      <div>
                        <span className="text-[#8c887d] block text-[11px]">Factual Incident</span>
                        {charge.incident ? (
                          <div>
                            <span className="text-[#eee9dc] font-medium">
                              {charge.incident.location}
                            </span>
                            <span className="text-[#8c887d] block text-[11px] mt-0.5">
                              Date:{' '}
                              {charge.incident.incidentDate
                                ? new Date(charge.incident.incidentDate).toLocaleString()
                                : 'N/A'}
                            </span>
                            {charge.incident.summary && (
                              <p className="text-[#a39e93] text-[11px] mt-1.5 leading-relaxed bg-[#0e1013] p-2 rounded border border-[#1a1e24]">
                                {charge.incident.summary}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#8c887d]">No incident details recorded.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
