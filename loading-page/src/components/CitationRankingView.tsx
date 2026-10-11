import { useState, useEffect } from 'react';
import { api, CitationRankingItem, ApiClientError } from '../api';
import {
  IconAward,
  IconRefresh,
  IconScale,
  IconAlertCircle,
} from './Icons';

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
            <h2 className="text-xl font-semibold text-[#f1e6c6] tracking-wide flex items-center gap-2">
              <IconAward className="w-5 h-5 text-[#d2bd8b]" />
              <span>Judgment Citation Frequency Ranking</span>
            </h2>
            <p className="text-xs text-[#a39e93] mt-1">
              Ranks judgments by frequency and legal weight of incoming judicial citations across benches and jurisdictions.
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
                className={`px-3 py-1.5 rounded-lg font-medium border transition cursor-pointer ${
                  limit === l
                    ? 'bg-[#292211] text-[#f1e6c6] border-[#d2bd8b]'
                    : 'bg-[#12161f] text-[#a39e93] border-[#212735] hover:text-[#eee9dc]'
                }`}
              >
                {l}
              </button>
            ))}
            <button
              onClick={() => fetchRanking(limit)}
              disabled={loading}
              title="Refresh Precedent Ranking"
              className="p-1.5 bg-[#141720] hover:bg-[#1a1f2b] border border-[#242b3b] text-[#a39e93] hover:text-[#eee9dc] rounded-lg text-xs transition cursor-pointer disabled:opacity-50"
            >
              <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Legal Authority Boundary Disclaimer */}
        <div className="mt-3 bg-[#11141c] border border-[#212738] p-3.5 rounded-xl text-[11px] text-[#9c978b] flex items-center gap-2.5">
          <IconScale className="w-4 h-4 text-[#d2bd8b] shrink-0" />
          <span>
            <strong className="text-[#f1e6c6] font-medium mr-1">Precedent Semantics Notice:</strong>
            Citation frequency measures empirical citation in subsequent judgments. It does not
            conclusively dictate legal hierarchy or binding authority under Article 141.
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-[#241212] border border-[#6b2c2c] text-[#f1a8a8] px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchRanking(limit)}
            className="underline hover:text-white cursor-pointer font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-[#12161f] border border-[#202532] rounded-xl p-8 text-center text-xs text-[#8c887d] space-y-2">
          <div className="w-5 h-5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Computing incoming judgment citation metrics and tie-breakers...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && ranking.length === 0 && (
        <div className="bg-[#12161f] border border-[#202532] rounded-xl p-8 text-center text-xs text-[#8c887d]">
          No cited judgments found. Judgments with zero incoming citations are excluded from the ranking.
        </div>
      )}

      {/* Table of Results */}
      {!loading && ranking.length > 0 && (
        <div className="bg-[#12161f] border border-[#202532] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141822] text-[#8c887d] uppercase tracking-wider text-[10px] border-b border-[#1f2430]">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Rank</th>
                  <th className="py-3 px-4">Judgment & Case Title</th>
                  <th className="py-3 px-4">Rendering Court</th>
                  <th className="py-3 px-4">Verdict Date</th>
                  <th className="py-3 px-4 text-center">Times Cited</th>
                  <th className="py-3 px-4">Treatments Recorded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181d26]">
                {ranking.map((item) => (
                  <tr key={item.judgmentId} className="hover:bg-[#161b25] transition">
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
                      <span className="inline-block bg-[#1b212f] text-[#f1e6c6] border border-[#7d6d4e]/70 px-2.5 py-1 rounded-full font-semibold font-mono">
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
