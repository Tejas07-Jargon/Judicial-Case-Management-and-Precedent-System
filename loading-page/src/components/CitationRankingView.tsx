import { useState, useEffect } from 'react';
import { api, CitationRankingItem, ApiClientError } from '../api';

export function CitationRankingView() {
  const [limit, setLimit] = useState<number>(20);
  const [ranking, setRanking] = useState<CitationRankingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = async (limitVal: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCitationRanking(limitVal);
      setRanking(data.ranking);
    } catch (err: any) {
      setRanking([]);
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError('Failed to fetch precedent citation ranking.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking(limit);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header & Distinction Note */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-[#f1e6c6] tracking-wide">
              Judgment Citation Frequency Ranking
            </h2>
            <p className="text-xs text-[#a39e93] mt-1">
              Ranks judgments by frequency of incoming citations recorded in{' '}
              <code className="text-[#d2bd8b] bg-[#14171a] px-1.5 py-0.5 rounded">
                JUDGMENT_CITATION
              </code>
              .
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8c887d]">Display Top:</span>
            {[10, 20, 50].map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLimit(l);
                  fetchRanking(l);
                }}
                className={`px-3 py-1.5 rounded font-medium border transition cursor-pointer ${
                  limit === l
                    ? 'bg-[#292211] text-[#f1e6c6] border-[#d2bd8b]'
                    : 'bg-[#121519] text-[#a39e93] border-[#232730] hover:text-[#eee9dc]'
                }`}
              >
                {l}
              </button>
            ))}
            <button
              onClick={() => fetchRanking(limit)}
              className="ml-2 text-xs text-[#d2bd8b] hover:underline"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Legal Authority Boundary Disclaimer */}
        <div className="mt-3 bg-[#111418] border border-[#232730] p-3 rounded-lg text-[11px] text-[#9c978b] flex items-center gap-2">
          <span className="text-[#d2bd8b] font-medium">Precedent Semantics:</span>
          <span>
            Citation frequency measures empirical citation in subsequent judgments. It does not
            conclusively dictate legal hierarchy or binding authority under Article 141.
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#241212] border border-[#6b2c2c] text-[#f1a8a8] px-4 py-3 rounded-lg text-sm flex items-start justify-between">
          <span>{error}</span>
          <button
            onClick={() => fetchRanking(limit)}
            className="text-xs text-[#f1e6c6] underline ml-4 hover:text-white"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-[#121519] border border-[#1e2229] rounded-xl p-8 text-center text-sm text-[#8c887d] animate-pulse">
          Computing incoming judgment citation metrics and tie-breakers...
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && ranking.length === 0 && (
        <div className="bg-[#121519] border border-[#1e2229] rounded-xl p-8 text-center text-sm text-[#8c887d]">
          No cited judgments found in the database. Judgments with zero incoming citations are
          excluded from the ranking.
        </div>
      )}

      {/* Table of Results */}
      {!loading && ranking.length > 0 && (
        <div className="bg-[#121519] border border-[#232730] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171a20] text-[#a39e93] uppercase tracking-wider text-[10px] border-b border-[#232730]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Judgment & Case Title</th>
                  <th className="py-3 px-4">Rendering Court</th>
                  <th className="py-3 px-4">Verdict Date</th>
                  <th className="py-3 px-4 text-center">Times Cited</th>
                  <th className="py-3 px-4">Treatments Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2229]">
                {ranking.map((item) => (
                  <tr key={item.judgmentId} className="hover:bg-[#15181f] transition">
                    <td className="py-3.5 px-4 text-center font-mono font-medium text-[#d2bd8b]">
                      #{item.rank}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#eee9dc] text-sm">
                        {item.precedentCaseTitle}
                      </div>
                      <div className="text-[11px] text-[#8c887d] mt-0.5">
                        Judgment: <code className="text-[#a39e93]">{item.judgmentId}</code> • Case:{' '}
                        <code className="text-[#a39e93]">{item.caseId}</code>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[#eee9dc]">{item.renderingCourt}</span>
                      <span className="block text-[10px] text-[#8c887d]">Tier: {item.courtTier}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#a39e93] font-mono">
                      {new Date(item.verdictDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block bg-[#24211a] text-[#f1e6c6] border border-[#7d6d4e] px-2.5 py-1 rounded-full font-semibold">
                        {item.timesCitedInJudgments}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {item.treatmentsRecorded.map((trt, i) => (
                          <span
                            key={i}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              trt === 'Followed'
                                ? 'bg-[#15241b] text-[#71cf96] border-[#284934]'
                                : trt === 'Distinguished'
                                ? 'bg-[#292211] text-[#e0bb6b] border-[#524422]'
                                : 'bg-[#2b1f1f] text-[#e89d9d] border-[#593030]'
                            }`}
                          >
                            {trt}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
