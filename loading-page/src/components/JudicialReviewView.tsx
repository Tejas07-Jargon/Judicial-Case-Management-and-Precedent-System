import { useState, useEffect } from 'react';
import { api, JudicialReviewItem, ApiClientError } from '../api';
import {
  IconScale,
  IconSearch,
  IconAlertCircle,
  IconCheckCircle,
  IconX,
} from './Icons';

export function JudicialReviewView() {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [defendantFilter, setDefendantFilter] = useState<string>('');
  const [proceedings, setProceedings] = useState<JudicialReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviewData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getJudicialReview({
        category: categoryFilter || undefined,
        defendantId: defendantFilter.trim() || undefined,
      });
      setProceedings(data.proceedings);
    } catch (err: any) {
      setProceedings([]);
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch judicial review candidates.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewData();
  }, [categoryFilter]);

  const handleDefendantSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReviewData();
  };

  return (
    <div className="space-y-6">
      {/* Header & Analytical Scope */}
      <div>
        <h2 className="text-xl font-semibold text-[#f1e6c6] tracking-wide flex items-center gap-2">
          <IconScale className="w-5 h-5 text-[#d2bd8b]" />
          <span>Judicial Review: Multi-Docket Overlap Analysis</span>
        </h2>
        <p className="text-xs text-[#a39e93] mt-1">
          Constitutional and cross-docket review identifying related proceedings, jurisdictional overlaps, and concurrent prosecutions across common defendants and incidents.
        </p>

        {/* Legal Disclaimer Box */}
        <div className="mt-3 bg-[#11141c] border border-[#212738] p-3.5 rounded-xl text-[11px] text-[#9c978b] flex items-start gap-2.5">
          <IconScale className="w-4 h-4 text-[#d2bd8b] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[#f1e6c6] font-medium mr-1">Judicial Integrity Notice:</strong>
            These records represent administrative and procedural review candidates flagged for judicial
            examination. They do <strong>not</strong> establish legal guilt, prior double-jeopardy bars, or
            statutory plea violations without independent court adjudication.
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#12161f] border border-[#202532] p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between text-xs">
        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[#8c887d]">Status Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#181d28] border border-[#2c3445] text-[#eee9dc] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#d2bd8b]"
          >
            <option value="">All Review Categories</option>
            <option value="OUTCOME_OVERLAP_REVIEW">OUTCOME_OVERLAP_REVIEW (Concluded + Pending)</option>
            <option value="POTENTIALLY_RELATED">POTENTIALLY_RELATED (All Pending)</option>
            <option value="MULTIPLE_RECORDED_OUTCOMES_REVIEW">
              MULTIPLE_RECORDED_OUTCOMES_REVIEW (Multiple Concluded)
            </option>
            <option value="INSUFFICIENT_OUTCOME_DATA">INSUFFICIENT_OUTCOME_DATA (Incomplete Data)</option>
          </select>
        </div>

        {/* Defendant Filter Input */}
        <form onSubmit={handleDefendantSearch} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={defendantFilter}
              onChange={(e) => setDefendantFilter(e.target.value)}
              placeholder="Filter by Defendant ID (e.g. ENT_002)"
              className="bg-[#181d28] border border-[#2c3445] text-[#eee9dc] placeholder-[#66635b] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#d2bd8b]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#bda36d] px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer inline-flex items-center gap-1"
          >
            <IconSearch className="w-3.5 h-3.5 text-[#d2bd8b]" />
            <span>Apply</span>
          </button>
          {defendantFilter && (
            <button
              type="button"
              onClick={() => {
                setDefendantFilter('');
                fetchReviewData();
              }}
              className="text-[#8c887d] hover:text-[#eee9dc] text-xs underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#241212] border border-[#6b2c2c] text-[#f1a8a8] px-3.5 py-2.5 rounded-xl text-xs flex items-start justify-between">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchReviewData}
            className="underline hover:text-white cursor-pointer font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-[#12161f] border border-[#202532] rounded-xl p-8 text-center text-xs text-[#8c887d] animate-pulse space-y-2">
          <div className="w-5 h-5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Evaluating cross-docket proceedings for judicial review candidates...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && proceedings.length === 0 && (
        <div className="bg-[#12161f] border border-[#202532] rounded-xl p-8 text-center text-xs text-[#8c887d]">
          No overlapping proceedings matching the selected filters were found.
        </div>
      )}

      {/* Results Cards */}
      {!loading && proceedings.length > 0 && (
        <div className="space-y-4">
          {proceedings.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#12161f] border border-[#202532] rounded-xl p-5 text-xs hover:border-[#7d6d4e]/50 transition space-y-4 shadow-sm"
            >
              {/* Category Badge & Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c212c] pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold tracking-wide border ${
                      item.reviewCategory === 'OUTCOME_OVERLAP_REVIEW'
                        ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                        : item.reviewCategory === 'POTENTIALLY_RELATED'
                        ? 'bg-blue-950/40 text-blue-300 border-blue-800/60'
                        : item.reviewCategory === 'MULTIPLE_RECORDED_OUTCOMES_REVIEW'
                        ? 'bg-purple-950/40 text-purple-300 border-purple-800/60'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {item.reviewCategory}
                  </span>
                  <span className="text-[#8c887d] text-[11px]">
                    Shared Defendant: <strong className="text-[#eee9dc]">{item.defendantName}</strong>{' '}
                    <code className="text-[#d2bd8b]">({item.defendantId})</code>
                  </span>
                </div>
                <div className="text-[11px] text-[#8c887d]">
                  Shared Incident: <code className="text-[#a39e93]">{item.incidentId}</code>
                </div>
              </div>

              {/* Two Column Cases Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Case 1 */}
                <div className="bg-[#0e1014] p-3.5 rounded-xl border border-[#1d222e] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#f1e6c6] font-mono">
                      {item.case1Id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        item.case1Status === 'Pending'
                          ? 'bg-[#292211] text-[#e0bb6b]'
                          : 'bg-[#15241b] text-[#71cf96]'
                      }`}
                    >
                      {item.case1Status}
                    </span>
                  </div>
                  <div className="text-[#eee9dc] font-medium text-xs truncate">
                    {item.case1Title}
                  </div>
                  <div className="text-[11px] text-[#8c887d] space-y-0.5">
                    <div>Adjudicating Court: {item.case1Court}</div>
                    <div>Filing Date: {new Date(item.case1FilingDate).toLocaleDateString()}</div>
                    {item.case1Verdict && (
                      <div className="text-[#cfc9ba]">Verdict: {item.case1Verdict}</div>
                    )}
                  </div>
                </div>

                {/* Case 2 */}
                <div className="bg-[#0e1014] p-3.5 rounded-xl border border-[#1d222e] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#f1e6c6] font-mono">
                      {item.case2Id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        item.case2Status === 'Pending'
                          ? 'bg-[#292211] text-[#e0bb6b]'
                          : 'bg-[#15241b] text-[#71cf96]'
                      }`}
                    >
                      {item.case2Status}
                    </span>
                  </div>
                  <div className="text-[#eee9dc] font-medium text-xs truncate">
                    {item.case2Title}
                  </div>
                  <div className="text-[11px] text-[#8c887d] space-y-0.5">
                    <div>Adjudicating Court: {item.case2Court}</div>
                    <div>Filing Date: {new Date(item.case2FilingDate).toLocaleDateString()}</div>
                    {item.case2Verdict && (
                      <div className="text-[#cfc9ba]">Verdict: {item.case2Verdict}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal Rationale Note */}
              <div className="bg-[#141824] border border-[#212738] p-3 rounded-lg text-[11px] text-[#b3ad9f]">
                <strong className="text-[#f1e6c6]">Advisory Note:</strong> Overlapping incident{' '}
                <code className="text-[#d2bd8b]">{item.incidentId}</code> with identical accused party{' '}
                <code className="text-[#d2bd8b]">{item.defendantId}</code> across concurrent dockets.
                Judicial officer should inspect whether consolidation, transfer, or issue-estoppel applies.
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
