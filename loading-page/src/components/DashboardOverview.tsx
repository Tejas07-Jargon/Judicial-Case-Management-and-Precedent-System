import { useState, useEffect } from 'react';
import { api, CitationRankingItem, JudicialReviewItem, LookupOptions } from '../api';
import {
  IconScale,
  IconBriefcase,
  IconFileText,
  IconMapPin,
  IconAward,
  IconShieldAlert,
  IconTag,
  IconChevronRight,
  IconCheckCircle,
  IconAlertCircle,
  IconRefresh,
} from './Icons';

interface DashboardOverviewProps {
  onNavigate: (tab: any) => void;
}

export function DashboardOverview({ onNavigate }: DashboardOverviewProps) {
  const [lookups, setLookups] = useState<LookupOptions | null>(null);
  const [topCitations, setTopCitations] = useState<CitationRankingItem[]>([]);
  const [reviews, setReviews] = useState<JudicialReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverviewData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lookupData, citationData, reviewData] = await Promise.all([
        api.getLookupOptions(),
        api.getCitationRanking(4),
        api.getJudicialReview(),
      ]);
      setLookups(lookupData);
      setTopCitations(citationData.ranking ? citationData.ranking.slice(0, 4) : []);
      setReviews(reviewData.proceedings ? reviewData.proceedings.slice(0, 3) : []);
    } catch (err: any) {
      setError('Unable to load judicial overview metrics. Please ensure backend services are running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#141824] via-[#10131a] to-[#0c0e12] border border-[#2b3240] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#bda36d]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1e2330] border border-[#7d6d4e]/40 text-[#f1e6c6] text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              High Court & Trial Bench Case Records System
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-[#f1e6c6]">
              Judicial Case Management & Precedent System
            </h2>
            <p className="text-xs sm:text-sm text-[#a39e93] leading-relaxed">
              Integrated adjudication suite for criminal dossiers, police charge-sheets,
              binding judgment precedent rankings, and Bharatiya Nyaya Sanhita (BNS) statutory compliance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('dossier')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#bda36d] text-xs font-medium tracking-wide shadow-md transition cursor-pointer"
            >
              <IconFileText className="w-4 h-4 text-[#d2bd8b]" />
              <span>Inspect Case Dossier</span>
            </button>
            <button
              onClick={fetchOverviewData}
              disabled={loading}
              title="Refresh Registry Metrics"
              className="p-2.5 rounded-xl bg-[#14171d] hover:bg-[#1a1e27] border border-[#232730] text-[#a39e93] hover:text-[#f1e6c6] transition cursor-pointer disabled:opacity-50"
            >
              <IconRefresh className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-[#241212] border border-[#6b2c2c] text-[#f1a8a8] text-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconAlertCircle className="w-4 h-4 text-[#f87171] shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchOverviewData}
            className="underline hover:text-white cursor-pointer ml-4 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Key Registry Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#12151c] border border-[#232936] rounded-xl p-5 hover:border-[#7d6d4e]/50 transition space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#8c887d]">
            <span className="text-[11px] font-medium tracking-wider uppercase">Active Cases</span>
            <IconBriefcase className="w-4 h-4 text-[#d2bd8b]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#f1e6c6]">
            {loading ? '—' : lookups?.cases.length || 0}
          </div>
          <p className="text-[11px] text-[#78756c]">
            Criminal dockets under trial
          </p>
        </div>

        <div className="bg-[#12151c] border border-[#232936] rounded-xl p-5 hover:border-[#7d6d4e]/50 transition space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#8c887d]">
            <span className="text-[11px] font-medium tracking-wider uppercase">Factual Incidents</span>
            <IconMapPin className="w-4 h-4 text-[#d2bd8b]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#f1e6c6]">
            {loading ? '—' : lookups?.incidents.length || 0}
          </div>
          <p className="text-[11px] text-[#78756c]">
            Geocoded FIR investigation records
          </p>
        </div>

        <div className="bg-[#12151c] border border-[#232936] rounded-xl p-5 hover:border-[#7d6d4e]/50 transition space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#8c887d]">
            <span className="text-[11px] font-medium tracking-wider uppercase">Statutory Sections</span>
            <IconScale className="w-4 h-4 text-[#d2bd8b]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#f1e6c6]">
            {loading ? '—' : lookups?.statutes.length || 0}
          </div>
          <p className="text-[11px] text-[#78756c]">
            BNS (2023) & IPC Concordance
          </p>
        </div>

        <div className="bg-[#12151c] border border-[#232936] rounded-xl p-5 hover:border-[#7d6d4e]/50 transition space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#8c887d]">
            <span className="text-[11px] font-medium tracking-wider uppercase">Defendants</span>
            <IconShieldAlert className="w-4 h-4 text-[#d2bd8b]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#f1e6c6]">
            {loading ? '—' : lookups?.defendants.length || 0}
          </div>
          <p className="text-[11px] text-[#78756c]">
            Persons & corporate entities
          </p>
        </div>
      </div>

      {/* Core Adjudication Workflows Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#d2bd8b] px-1">
          Principal Judicial Workflows
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('dossier')}
            className="group bg-[#12151c] border border-[#202532] hover:border-[#7d6d4e] rounded-xl p-5 transition cursor-pointer space-y-3 hover:shadow-md"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1a1f2c] border border-[#2c3345] group-hover:border-[#7d6d4e] flex items-center justify-center text-[#d2bd8b] transition">
              <IconFileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#f1e6c6] group-hover:text-[#fff8e2] transition flex items-center justify-between">
                <span>Criminal Case Dossier</span>
                <IconChevronRight className="w-4 h-4 text-[#66635b] group-hover:text-[#d2bd8b] transition group-hover:translate-x-0.5" />
              </h4>
              <p className="text-xs text-[#8c887d] mt-1 leading-relaxed">
                Inspect court tier, arresting agency, bail terms, police charge sheets, and statutory classifications.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('citations')}
            className="group bg-[#12151c] border border-[#202532] hover:border-[#7d6d4e] rounded-xl p-5 transition cursor-pointer space-y-3 hover:shadow-md"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1a1f2c] border border-[#2c3345] group-hover:border-[#7d6d4e] flex items-center justify-center text-[#d2bd8b] transition">
              <IconAward className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#f1e6c6] group-hover:text-[#fff8e2] transition flex items-center justify-between">
                <span>Citation Authority Ranking</span>
                <IconChevronRight className="w-4 h-4 text-[#66635b] group-hover:text-[#d2bd8b] transition group-hover:translate-x-0.5" />
              </h4>
              <p className="text-xs text-[#8c887d] mt-1 leading-relaxed">
                Rank judgments by inward citation density, bench influence, and overruled precedent indicators.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('judicial-review')}
            className="group bg-[#12151c] border border-[#202532] hover:border-[#7d6d4e] rounded-xl p-5 transition cursor-pointer space-y-3 hover:shadow-md"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1a1f2c] border border-[#2c3345] group-hover:border-[#7d6d4e] flex items-center justify-center text-[#d2bd8b] transition">
              <IconScale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#f1e6c6] group-hover:text-[#fff8e2] transition flex items-center justify-between">
                <span>Judicial Review Analysis</span>
                <IconChevronRight className="w-4 h-4 text-[#66635b] group-hover:text-[#d2bd8b] transition group-hover:translate-x-0.5" />
              </h4>
              <p className="text-xs text-[#8c887d] mt-1 leading-relaxed">
                Analyze constitutional challenges, multi-docket overlaps, shared accused entities, and review categories.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('charge-sheets')}
            className="group bg-[#12151c] border border-[#202532] hover:border-[#7d6d4e] rounded-xl p-5 transition cursor-pointer space-y-3 hover:shadow-md"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1a1f2c] border border-[#2c3345] group-hover:border-[#7d6d4e] flex items-center justify-center text-[#d2bd8b] transition">
              <IconBriefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#f1e6c6] group-hover:text-[#fff8e2] transition flex items-center justify-between">
                <span>Docket Charge Sheets</span>
                <IconChevronRight className="w-4 h-4 text-[#66635b] group-hover:text-[#d2bd8b] transition group-hover:translate-x-0.5" />
              </h4>
              <p className="text-xs text-[#8c887d] mt-1 leading-relaxed">
                File new formal charge sheets, update judicial verdicts, record sentences, and link accused defendants.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('incidents')}
            className="group bg-[#12151c] border border-[#202532] hover:border-[#7d6d4e] rounded-xl p-5 transition cursor-pointer space-y-3 hover:shadow-md"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1a1f2c] border border-[#2c3345] group-hover:border-[#7d6d4e] flex items-center justify-center text-[#d2bd8b] transition">
              <IconMapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#f1e6c6] group-hover:text-[#fff8e2] transition flex items-center justify-between">
                <span>Incident Registry</span>
                <IconChevronRight className="w-4 h-4 text-[#66635b] group-hover:text-[#d2bd8b] transition group-hover:translate-x-0.5" />
              </h4>
              <p className="text-xs text-[#8c887d] mt-1 leading-relaxed">
                Create, update, and manage isolated factual incident records connected to criminal proceedings.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('taxonomy')}
            className="group bg-[#12151c] border border-[#202532] hover:border-[#7d6d4e] rounded-xl p-5 transition cursor-pointer space-y-3 hover:shadow-md"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1a1f2c] border border-[#2c3345] group-hover:border-[#7d6d4e] flex items-center justify-center text-[#d2bd8b] transition">
              <IconTag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#f1e6c6] group-hover:text-[#fff8e2] transition flex items-center justify-between">
                <span>Precedent Taxonomy</span>
                <IconChevronRight className="w-4 h-4 text-[#66635b] group-hover:text-[#d2bd8b] transition group-hover:translate-x-0.5" />
              </h4>
              <p className="text-xs text-[#8c887d] mt-1 leading-relaxed">
                Explore jurisprudence classifications, tag legal principles, and attach taxonomy tokens to cases.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytical Snapshot: Precedent Authority & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leading Citations Card */}
        <div className="bg-[#12151c] border border-[#202532] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2330] pb-3">
            <div className="flex items-center gap-2">
              <IconAward className="w-4 h-4 text-[#d2bd8b]" />
              <h4 className="text-xs font-semibold text-[#f1e6c6] uppercase tracking-wider">
                Leading Precedent Authority
              </h4>
            </div>
            <button
              onClick={() => onNavigate('citations')}
              className="text-xs text-[#d2bd8b] hover:underline cursor-pointer"
            >
              View Full Ranking →
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-[#8c887d]">Loading citation records...</div>
          ) : topCitations.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#736f66]">No citation lineages recorded.</div>
          ) : (
            <div className="space-y-2.5">
              {topCitations.map((c, i) => (
                <div
                  key={c.judgmentId || i}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#161a24] border border-[#232936] text-xs hover:border-[#7d6d4e]/40 transition"
                >
                  <div className="space-y-0.5 min-w-0 pr-3">
                    <span className="font-mono text-[#d2bd8b] text-[11px] block">{c.judgmentId}</span>
                    <span className="font-medium text-[#eee9dc] truncate block">{c.precedentCaseTitle}</span>
                    <span className="text-[11px] text-[#8c887d]">Court: {c.renderingCourt}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#202738] border border-[#2e374d] text-[#f1e6c6] font-mono text-xs">
                      #{c.rank} Rank
                    </span>
                    <span className="block text-[10px] text-[#7d796e] mt-0.5">
                      {c.timesCitedInJudgments} Inward Citations
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Judicial Review Summary */}
        <div className="bg-[#12151c] border border-[#202532] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1e2330] pb-3">
            <div className="flex items-center gap-2">
              <IconScale className="w-4 h-4 text-[#d2bd8b]" />
              <h4 className="text-xs font-semibold text-[#f1e6c6] uppercase tracking-wider">
                Constitutional Judicial Reviews
              </h4>
            </div>
            <button
              onClick={() => onNavigate('judicial-review')}
              className="text-xs text-[#d2bd8b] hover:underline cursor-pointer"
            >
              All Proceedings →
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-[#8c887d]">Loading review proceedings...</div>
          ) : reviews.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#736f66]">No review proceedings recorded.</div>
          ) : (
            <div className="space-y-2.5">
              {reviews.map((r, i) => (
                <div
                  key={r.incidentId || i}
                  className="p-3 rounded-lg bg-[#161a24] border border-[#232936] text-xs hover:border-[#7d6d4e]/40 transition space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#d2bd8b] text-[11px]">Accused: {r.defendantId}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        r.reviewStatusCategory === 'OUTCOME_OVERLAP_REVIEW'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                          : r.reviewStatusCategory === 'POTENTIALLY_RELATED'
                          ? 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                          : 'bg-purple-950/60 text-purple-300 border border-purple-800/60'
                      }`}
                    >
                      {r.reviewStatusCategory}
                    </span>
                  </div>
                  <div className="text-[#eee9dc] font-medium truncate">{r.defendantName}</div>
                  <div className="text-[11px] text-[#8c887d] line-clamp-1">
                    Involving Cases: {r.involvingCases.join(', ')} • Incident: {r.incidentLocation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
