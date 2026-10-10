import { useState, useEffect } from 'react';
import { api, JudicialReviewItem, ApiClientError } from '../api';

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
        <h2 className="text-xl font-semibold text-[#f1e6c6] tracking-wide">
          Judicial Review: Multi-Docket Overlap Analysis
        </h2>
        <p className="text-xs text-[#a39e93] mt-1">
          Analytical scrutiny over{' '}
          <code className="text-[#d2bd8b] bg-[#14171a] px-1.5 py-0.5 rounded">
            V_JUDICIAL_REVIEW_RELATED_PROCEEDINGS
          </code>{' '}
          identifying overlapping dockets across common defendants and incidents.
        </p>

        {/* Legal Disclaimer Box */}
        <div className="mt-3 bg-[#111418] border border-[#232730] p-3 rounded-lg text-[11px] text-[#9c978b]">
          <span className="text-[#d2bd8b] font-medium mr-1.5">Judicial Integrity Notice:</span>
          These records represent administrative and procedural review candidates flagged for judicial
          examination. They do <strong>not</strong> establish legal guilt, prior double-jeopardy bars, or
          statutory plea violations without independent court adjudication.
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#121519] border border-[#232730] p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between text-xs">
        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[#8c887d]">Status Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#1a1e24] border border-[#2b2e35] text-[#eee9dc] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#d2bd8b]"
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
          <input
            type="text"
            value={defendantFilter}
            onChange={(e) => setDefendantFilter(e.target.value)}
            placeholder="Filter by Defendant ID (e.g. ENT_002)"
            className="bg-[#1a1e24] border border-[#2b2e35] text-[#eee9dc] placeholder-[#66635b] rounded px-3 py-1.5 text-xs focus:outline-none focus:border-[#d2bd8b]"
          />
          <button
            type="submit"
            className="bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#7d6d4e] px-3 py-1.5 rounded text-xs transition cursor-pointer"
          >
            Apply
          </button>
          {defendantFilter && (
            <button
              type="button"
              onClick={() => {
                setDefendantFilter('');
                fetchReviewData();
              }}
              className="text-[#8c887d] hover:text-[#eee9dc] text-xs underline"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#241212] border border-[#6b2c2c] text-[#f1a8a8] px-4 py-3 rounded-lg text-sm flex items-start justify-between">
          <span>{error}</span>
          <button
            onClick={fetchReviewData}
            className="text-xs text-[#f1e6c6] underline ml-4 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-[#121519] border border-[#1e2229] rounded-xl p-8 text-center text-sm text-[#8c887d] animate-pulse">
          Evaluating cross-docket proceedings for review candidates...
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && proceedings.length === 0 && (
        <div className="bg-[#121519] border border-[#1e2229] rounded-xl p-8 text-center text-sm text-[#8c887d]">
          No overlapping proceedings matching the selected filters were found.
        </div>
      )}

      {/* Results Cards */}
      {!loading && proceedings.length > 0 && (
        <div className="space-y-4">
          {proceedings.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#121519] border border-[#232730] rounded-xl p-5 text-xs hover:border-[#383d47] transition space-y-4"
            >
              {/* Category Badge & Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2229] pb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider ${
                      item.reviewStatusCategory === 'OUTCOME_OVERLAP_REVIEW'
                        ? 'bg-[#2f1818] text-[#f29b9b] border border-[#662b2b]'
                        : item.reviewStatusCategory === 'POTENTIALLY_RELATED'
                        ? 'bg-[#292211] text-[#e0bb6b] border border-[#524422]'
                        : item.reviewStatusCategory === 'MULTIPLE_RECORDED_OUTCOMES_REVIEW'
                        ? 'bg-[#1e1c2b] text-[#b3a8e8] border border-[#3b365e]'
                        : 'bg-[#1f242d] text-[#a39e93] border border-[#2d3440]'
                    }`}
                  >
                    {item.reviewStatusCategory.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[#a39e93] font-mono">
                    Dockets Overlap: <strong>{item.metrics.totalDocketsCount}</strong>
                  </span>
                </div>
                <div className="text-[11px] text-[#8c887d]">
                  Involving Cases: <code className="text-[#eee9dc]">{item.involvingCases.join(', ')}</code>
                </div>
              </div>

              {/* Accused & Incident Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-[#8c887d] block text-[11px]">Accused Entity</span>
                  <span className="text-[#eee9dc] font-medium text-sm">{item.defendantName}</span>
                  <span className="text-[#8c887d] block text-[11px] mt-0.5">
                    ID: {item.defendantId} • Type: {item.defendantType}
                  </span>
                </div>
                <div>
                  <span className="text-[#8c887d] block text-[11px]">Statutory Charge</span>
                  <span className="text-[#eee9dc] font-medium text-sm">{item.chargeSection}</span>
                  <span className="text-[#8c887d] block text-[11px] mt-0.5">
                    Code: {item.chargeCode}
                  </span>
                </div>
                <div>
                  <span className="text-[#8c887d] block text-[11px]">Incident Origin</span>
                  <span className="text-[#eee9dc] font-medium">{item.incidentLocation}</span>
                  <span className="text-[#8c887d] block text-[11px] mt-0.5">
                    ID: {item.incidentId} • {new Date(item.incidentDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Disposition Counts Breakdown */}
              <div className="bg-[#0e1013] border border-[#1a1e24] p-3 rounded-lg flex flex-wrap gap-4 text-[11px]">
                <div>
                  <span className="text-[#8c887d]">Convictions Recorded:</span>{' '}
                  <span className="font-semibold text-[#eee9dc]">
                    {item.metrics.recordedConvictionCount}
                  </span>
                </div>
                <div>
                  <span className="text-[#8c887d]">Acquittals Recorded:</span>{' '}
                  <span className="font-semibold text-[#eee9dc]">
                    {item.metrics.recordedAcquittalCount}
                  </span>
                </div>
                <div>
                  <span className="text-[#8c887d]">Pending Dockets:</span>{' '}
                  <span className="font-semibold text-[#d2bd8b]">
                    {item.metrics.pendingDocketsCount}
                  </span>
                </div>
                <div>
                  <span className="text-[#8c887d]">Unclassified Dispositions:</span>{' '}
                  <span className="font-semibold text-[#eee9dc]">
                    {item.metrics.unclassifiedOutcomeCount}
                  </span>
                </div>
                <div className="ml-auto text-[#8c887d]">
                  Recorded Dispositions: <code className="text-[#c2bdae]">{item.recordedOutcomes.join(', ')}</code>
                </div>
              </div>

              {/* Analytical Advisory Text */}
              <div className="text-[11px] text-[#a39e93] leading-relaxed">
                <span className="text-[#d2bd8b] font-medium">Scrutiny Indicator:</span>{' '}
                {item.judicialReviewIndicator}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
