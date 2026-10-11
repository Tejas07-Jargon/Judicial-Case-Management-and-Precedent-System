import React, { useState, useEffect } from 'react';
import {
  api,
  PrecedentTagSearchItem,
  CaseTagItem,
  ApiClientError,
} from '../api';
import {
  IconTag,
  IconSearch,
  IconPlus,
  IconX,
  IconCheckCircle,
  IconAlertCircle,
  IconTrash,
} from './Icons';

export function PrecedentTaxonomyView() {
  const [searchQuery, setSearchQuery] = useState('Corporate');
  const [searchResults, setSearchResults] = useState<PrecedentTagSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [caseIdInput, setCaseIdInput] = useState('CASE_800');
  const [caseTags, setCaseTags] = useState<CaseTagItem[]>([]);
  const [caseLoading, setCaseLoading] = useState(false);
  const [caseError, setCaseError] = useState<string | null>(null);

  // Precedent Tag Mapping Mutation State
  const [availableTags, setAvailableTags] = useState<Array<{ tagId: string; keyword: string }>>([]);
  const [selectedTagToAssign, setSelectedTagToAssign] = useState<string>('');
  const [tagMutating, setTagMutating] = useState(false);
  const [tagMutationSuccess, setTagMutationSuccess] = useState<string | null>(null);
  const [tagMutationError, setTagMutationError] = useState<string | null>(null);

  useEffect(() => {
    api.getLookupOptions()
      .then((data) => {
        setAvailableTags(data.tags);
        if (data.tags.length > 0) {
          setSelectedTagToAssign(data.tags[0].tagId);
        }
      })
      .catch(() => {});
  }, []);

  const executeTagSearch = async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setSearchError('Search query cannot be empty.');
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    try {
      const data = await api.searchPrecedentTags(trimmed);
      setSearchResults(data.tags);
    } catch (err: any) {
      setSearchResults([]);
      if (err instanceof ApiClientError) {
        setSearchError(err.message);
      } else {
        setSearchError('Tag search failed.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const executeCaseTagLookup = async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) {
      setCaseError('Case ID cannot be empty.');
      return;
    }

    setCaseLoading(true);
    setCaseError(null);
    try {
      const data = await api.getCaseTags(trimmed);
      setCaseTags(data.tags);
    } catch (err: any) {
      setCaseTags([]);
      if (err instanceof ApiClientError) {
        setCaseError(err.message);
      } else {
        setCaseError('Case tag lookup failed.');
      }
    } finally {
      setCaseLoading(false);
    }
  };

  const handleAddTag = async () => {
    const caseId = caseIdInput.trim();
    if (!caseId || !selectedTagToAssign) {
      setTagMutationError('Valid Case ID and Tag selection are required.');
      return;
    }

    setTagMutating(true);
    setTagMutationError(null);
    setTagMutationSuccess(null);
    try {
      await api.addCaseTag(caseId, selectedTagToAssign);
      setTagMutationSuccess(`Precedent Tag '${selectedTagToAssign}' mapped to case '${caseId}'.`);
      await executeCaseTagLookup(caseId);
    } catch (err: any) {
      setTagMutationError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setTagMutating(false);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    const caseId = caseIdInput.trim();
    if (!caseId) return;

    if (!window.confirm(`Are you sure you want to remove tag '${tagId}' from case '${caseId}'?`)) {
      return;
    }

    setTagMutating(true);
    setTagMutationError(null);
    setTagMutationSuccess(null);
    try {
      await api.removeCaseTag(caseId, tagId);
      setTagMutationSuccess(`Tag '${tagId}' removed from case '${caseId}'.`);
      await executeCaseTagLookup(caseId);
    } catch (err: any) {
      setTagMutationError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err.message);
    } finally {
      setTagMutating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[#f1e6c6] tracking-wide flex items-center gap-2">
          <IconTag className="w-5 h-5 text-[#d2bd8b]" />
          <span>Precedent Taxonomy & Case Tag Mapping</span>
        </h2>
        <p className="text-xs text-[#a39e93] mt-1">
          Explore legal subjects, doctrine classifications, and mapped judicial precedents across precedent taxonomy categories.
        </p>
      </div>

      {/* SECTION 1: KEYWORD SEARCH */}
      <div className="bg-[#12161f] border border-[#202532] rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-serif font-medium text-[#f1e6c6]">
          1. Search Precedent Tags & Associated Decisions
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeTagSearch(searchQuery);
          }}
          className="flex flex-wrap gap-3 items-center"
        >
          <div className="relative flex-1 min-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#736f66]">
              <IconSearch className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search taxonomy keyword (e.g. Corporate, Fraud, Cyber)"
              className="w-full bg-[#181d28] border border-[#2c3445] rounded-xl pl-9 pr-4 py-2 text-xs text-[#eee9dc] placeholder-[#66635b] focus:outline-none focus:border-[#d2bd8b]"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#bda36d] px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <IconSearch className="w-3.5 h-3.5 text-[#d2bd8b]" />
            <span>{searchLoading ? 'Searching...' : 'Search Tags'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('Corporate');
              executeTagSearch('Corporate');
            }}
            className="text-xs text-[#d2bd8b] hover:underline px-2 py-1 font-medium cursor-pointer"
          >
            Sample: 'Corporate'
          </button>
        </form>

        {/* Search Error */}
        {searchError && (
          <div className="bg-[#241212] border border-[#6b2c2c] text-[#f1a8a8] px-3.5 py-2.5 rounded-xl text-xs flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{searchError}</span>
            </div>
            <button
              onClick={() => executeTagSearch(searchQuery)}
              className="underline hover:text-white cursor-pointer font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search Loading */}
        {searchLoading && (
          <div className="text-center py-6 text-xs text-[#8c887d] animate-pulse space-y-2">
            <div className="w-5 h-5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Searching precedent taxonomy catalog...</p>
          </div>
        )}

        {/* Search Results */}
        {!searchLoading && searchResults.length > 0 && (
          <div className="overflow-x-auto border border-[#1f2430] rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141822] text-[#8c887d] text-[10px] uppercase border-b border-[#1f2430]">
                <tr>
                  <th className="py-2.5 px-3">Taxonomy Tag</th>
                  <th className="py-2.5 px-3">Case Title & ID</th>
                  <th className="py-2.5 px-3">Adjudicating Court</th>
                  <th className="py-2.5 px-3">Jurisdiction</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#181d26]">
                {searchResults.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#161b25] transition">
                    <td className="py-2.5 px-3 font-medium text-[#d2bd8b]">
                      #{item.precedentTag}
                      <span className="block text-[10px] text-[#66635b]">ID: {item.tagId}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-[#eee9dc] font-medium">{item.caseTitle}</div>
                      <div className="text-[11px] text-[#8c887d] font-mono">{item.caseId}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[#eee9dc]">{item.courtName}</span>
                      <span className="block text-[10px] text-[#8c887d]">Tier: {item.courtTier}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          item.jurisdictionType === 'Criminal'
                            ? 'bg-[#291818] text-[#e89d9d] border border-rose-900/40'
                            : item.jurisdictionType === 'Civil'
                            ? 'bg-[#182429] text-[#9dcce8] border border-blue-900/40'
                            : 'bg-[#212418] text-[#cce89d] border border-amber-900/40'
                        }`}
                      >
                        {item.jurisdictionType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#a39e93]">{item.caseStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 2: CASE TAG LOOKUP */}
      <div className="bg-[#12161f] border border-[#202532] rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-serif font-medium text-[#f1e6c6]">
          2. Inspect Tags Assigned to a Specific Case
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeCaseTagLookup(caseIdInput);
          }}
          className="flex flex-wrap gap-3 items-center"
        >
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={caseIdInput}
              onChange={(e) => setCaseIdInput(e.target.value)}
              placeholder="Enter Case ID (e.g. CASE_800, CASE_1002)"
              className="w-full bg-[#181d28] border border-[#2c3445] rounded-xl px-4 py-2 text-xs text-[#eee9dc] placeholder-[#66635b] focus:outline-none focus:border-[#d2bd8b]"
            />
          </div>
          <button
            type="submit"
            disabled={caseLoading}
            className="bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#bda36d] px-4 py-2 rounded-xl text-xs font-medium transition cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            <IconTag className="w-3.5 h-3.5 text-[#d2bd8b]" />
            <span>{caseLoading ? 'Inspecting...' : 'Lookup Tags'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setCaseIdInput('CASE_800');
              executeCaseTagLookup('CASE_800');
            }}
            className="text-xs text-[#d2bd8b] hover:underline px-2 py-1 font-medium cursor-pointer"
          >
            Sample: 'CASE_800'
          </button>
        </form>

        {/* Case Tag Error */}
        {caseError && (
          <div className="bg-[#241212] border border-[#6b2c2c] text-[#f1a8a8] px-3.5 py-2.5 rounded-xl text-xs flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{caseError}</span>
            </div>
            <button
              onClick={() => executeCaseTagLookup(caseIdInput)}
              className="underline hover:text-white cursor-pointer font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Case Tag Loading */}
        {caseLoading && (
          <div className="text-center py-6 text-xs text-[#8c887d] animate-pulse space-y-2">
            <div className="w-5 h-5 border-2 border-[#d2bd8b] border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Retrieving assigned taxonomy mappings...</p>
          </div>
        )}

        {/* Tag Mutation Notifications */}
        {tagMutationSuccess && (
          <div className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 px-3.5 py-2.5 rounded-xl text-xs flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IconCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{tagMutationSuccess}</span>
            </div>
            <button
              onClick={() => setTagMutationSuccess(null)}
              className="text-emerald-400 hover:text-emerald-200 cursor-pointer"
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {tagMutationError && (
          <div className="bg-rose-950/40 border border-rose-800/60 text-rose-200 px-3.5 py-2.5 rounded-xl text-xs flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IconAlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{tagMutationError}</span>
            </div>
            <button
              onClick={() => setTagMutationError(null)}
              className="text-rose-400 hover:text-rose-200 cursor-pointer"
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Case Tag Results */}
        {!caseLoading && caseTags.length > 0 && (
          <div className="bg-[#0e1014] border border-[#1f2430] p-4 rounded-xl space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c212c] pb-2">
              <span className="font-medium text-[#f1e6c6]">
                {caseTags[0].caseTitle}{' '}
                <span className="text-[#8c887d] font-normal font-mono">({caseTags[0].caseId})</span>
              </span>
              <span className="text-[#a39e93] text-[11px]">
                Court: {caseTags[0].courtName} • Jurisdiction: {caseTags[0].jurisdictionType}
              </span>
            </div>
            <div>
              <span className="text-[#8c887d] block text-[11px] mb-2 font-medium">Mapped Precedent Tags:</span>
              <div className="flex flex-wrap gap-2">
                {caseTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#181d28] text-[#d2bd8b] border border-[#2c3445] pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <span>#{tag.assignedTag}</span>
                    <span className="text-[10px] text-[#7d796e]">({tag.tagId})</span>
                    <button
                      onClick={() => handleRemoveTag(tag.tagId)}
                      disabled={tagMutating}
                      title="Remove Tag Mapping"
                      className="ml-1 text-[#8c887d] hover:text-rose-400 p-0.5 rounded hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <IconX className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Inline Add Tag */}
            <div className="pt-3 border-t border-[#1c212c] flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-[#a39e93] font-medium">Assign Precedent Tag:</span>
              <select
                value={selectedTagToAssign}
                onChange={(e) => setSelectedTagToAssign(e.target.value)}
                disabled={tagMutating}
                className="bg-[#181d28] border border-[#2c3445] rounded-xl px-3 py-1.5 text-xs text-[#eee9dc] outline-none"
              >
                {availableTags.map((t) => (
                  <option key={t.tagId} value={t.tagId}>
                    {t.tagId} — #{t.keyword}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddTag}
                disabled={tagMutating || !selectedTagToAssign}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#bda36d] rounded-xl text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                <IconPlus className="w-3 h-3 text-[#d2bd8b]" />
                <span>{tagMutating ? 'Mapping...' : 'Assign Tag'}</span>
              </button>
            </div>
          </div>
        )}

        {!caseLoading && !caseError && caseTags.length === 0 && (
          <div className="bg-[#0e1014] border border-[#1f2430] p-4 rounded-xl space-y-3 text-xs">
            <p className="text-[#8c887d] text-center">
              No precedent tags currently mapped to <code className="text-[#d2bd8b]">{caseIdInput}</code>.
            </p>
            <div className="pt-2 border-t border-[#1c212c] flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] text-[#a39e93] font-medium">Assign Initial Tag:</span>
              <select
                value={selectedTagToAssign}
                onChange={(e) => setSelectedTagToAssign(e.target.value)}
                disabled={tagMutating}
                className="bg-[#181d28] border border-[#2c3445] rounded-xl px-3 py-1.5 text-xs text-[#eee9dc] outline-none"
              >
                {availableTags.map((t) => (
                  <option key={t.tagId} value={t.tagId}>
                    {t.tagId} — #{t.keyword}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddTag}
                disabled={tagMutating || !selectedTagToAssign}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#bda36d] rounded-xl text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                <IconPlus className="w-3 h-3 text-[#d2bd8b]" />
                <span>{tagMutating ? 'Mapping...' : 'Assign Tag'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
