import React, { useState } from 'react';
import { api, CriminalCaseDossier, ApiClientError } from '../api';
import { getStatuteDisplay } from '../utils/statuteHelper';
import {
  IconSearch,
  IconFileText,
  IconScale,
  IconMapPin,
  IconAlertCircle,
  IconCheckCircle,
} from './Icons';

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
      {/* Header & Judicial Context */}
      <div>
        <h2 className="text-xl font-semibold text-[#f1e6c6] tracking-wide flex items-center gap-2">
          <IconFileText className="w-5 h-5 text-[#d2bd8b]" />
          <span>Criminal Case Dossier & Charge Sheets</span>
        </h2>
        <p className="text-xs text-[#a39e93] mt-1">
          Authoritative judicial docket inspection covering adjudicating bench, investigating agency, police charge sheets, and statutory offence classifications.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#736f66]">
            <IconSearch className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={caseIdInput}
            onChange={(e) => setCaseIdInput(e.target.value)}
            placeholder="Enter Case ID (e.g. CASE_1002, CASE_1001)"
            className="w-full bg-[#12161f] border border-[#262c3b] rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm text-[#eee9dc] placeholder-[#66635b] focus:outline-none focus:border-[#d2bd8b] transition"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#bda36d] px-5 py-2.5 rounded-xl text-xs font-medium tracking-wide shadow-sm transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin" />
              <span>Fetching Dossier...</span>
            </>
          ) : (
            <>
              <IconSearch className="w-4 h-4 text-[#d2bd8b]" />
              <span>Inspect Dossier</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setCaseIdInput('CASE_1002');
            fetchDossier('CASE_1002');
          }}
          className="text-xs text-[#d2bd8b] hover:underline px-2 py-1 font-medium cursor-pointer"
        >
          Load CASE_1002 (Demo)
        </button>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="bg-[#241212] border border-[#6b2c2c] text-[#f1a8a8] px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconAlertCircle className="w-4 h-4 text-[#f87171] shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDossier(caseIdInput)}
            className="text-xs text-[#f1e6c6] underline ml-4 hover:text-white cursor-pointer font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-[#12161f] border border-[#212735] rounded-xl p-8 text-center text-xs text-[#8c887d] space-y-2">
          <div className="w-5 h-5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Retrieving criminal case docket and linked charge sheets...</p>
        </div>
      )}

      {/* Empty State before search */}
      {!loading && !error && !dossier && (
        <div className="bg-[#12161f] border border-[#212735] rounded-xl p-8 text-center text-xs text-[#8c887d]">
          Enter a criminal case identifier and click "Inspect Dossier" to inspect case metadata, court hierarchy, statutory charges, and accused entities.
        </div>
      )}

      {/* Dossier Content */}
      {!loading && dossier && (
        <div className="space-y-6">
          {/* Case Metadata Card */}
          <div className="bg-[#12161f] border border-[#232936] rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#202532] pb-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#d2bd8b] font-semibold">
                  {dossier.caseId}
                </span>
                <h3 className="text-lg font-serif font-medium text-[#f1e6c6] mt-0.5">
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
                <span className="px-2.5 py-1 rounded text-xs bg-[#1a1f2c] text-[#a39e93] border border-[#2a3245]">
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
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d2bd8b] mb-3 px-1">
              Registered Charges & Incidents ({dossier.charges.length})
            </h4>

            {dossier.charges.length === 0 ? (
              <div className="bg-[#12161f] border border-[#212735] rounded-xl p-6 text-center text-xs text-[#8c887d]">
                No charge sheets have been registered for this criminal case yet. Core case information is preserved.
              </div>
            ) : (
              <div className="space-y-4">
                {dossier.charges.map((charge, idx) => {
                  const statuteDisplay = getStatuteDisplay(charge.chargeCode, dossier.filingDate);

                  return (
                    <div
                      key={charge.chargeSheetId || idx}
                      className="bg-[#12161f] border border-[#212735] rounded-xl p-5 text-xs hover:border-[#7d6d4e]/50 transition shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c212c] pb-3 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-[#1b202c] text-[#d2bd8b] px-2 py-0.5 rounded font-mono text-[11px] border border-[#2d3548]">
                            {charge.chargeSheetId}
                          </span>
                          <span className="text-sm font-medium text-[#eee9dc]">
                            {statuteDisplay.primary}
                          </span>
                          {statuteDisplay.secondary && (
                            <span className="text-[11px] text-[#8c887d] bg-[#161a22] px-2 py-0.5 rounded border border-[#252b39]">
                              {statuteDisplay.secondary}
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                              statuteDisplay.regime === 'BNS'
                                ? 'bg-amber-950/40 text-amber-300 border border-amber-800/50'
                                : statuteDisplay.regime === 'IPC'
                                ? 'bg-blue-950/40 text-blue-300 border border-blue-800/50'
                                : 'bg-purple-950/40 text-purple-300 border border-purple-800/50'
                            }`}
                          >
                            {statuteDisplay.regime === 'BNS' ? 'BNS (2023)' : statuteDisplay.regime === 'IPC' ? 'IPC (Hist.)' : 'Special Act'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                              charge.recordedVerdict === 'Guilty'
                                ? 'bg-rose-950/50 text-rose-300 border border-rose-800/50'
                                : charge.recordedVerdict === 'Acquitted'
                                ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
                                : 'bg-amber-950/50 text-amber-300 border border-amber-800/50'
                            }`}
                          >
                            Verdict: {charge.recordedVerdict}
                          </span>
                          {charge.sentenceImposed && charge.sentenceImposed !== 'N/A' && (
                            <span className="px-2 py-0.5 rounded bg-[#2b1f1f] text-[#e89d9d] border border-[#482828]">
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
                              <span className="text-[#eee9dc] font-medium flex items-center gap-1.5">
                                <IconMapPin className="w-3.5 h-3.5 text-[#d2bd8b]" />
                                <span>{charge.incident.location}</span>
                              </span>
                              <span className="text-[#8c887d] block text-[11px] mt-0.5">
                                Date:{' '}
                                {charge.incident.incidentDate
                                  ? new Date(charge.incident.incidentDate).toLocaleString()
                                  : 'N/A'}
                              </span>
                              {charge.incident.summary && (
                                <p className="text-[#a39e93] text-[11px] mt-1.5 leading-relaxed bg-[#0c0e13] p-2.5 rounded-lg border border-[#1b202a]">
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
