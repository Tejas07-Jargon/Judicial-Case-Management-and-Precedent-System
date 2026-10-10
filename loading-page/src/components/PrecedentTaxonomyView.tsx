import React, { useState, useEffect } from 'react';
import {
  api,
  PrecedentTagSearchItem,
  CaseTagItem,
  ApiClientError,
} from '../api';

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
        <h2 className="text-xl font-semibold text-[#f1e6c6] tracking-wide">
          Precedent Taxonomy & Case Tag Mapping
        </h2>
        <p className="text-xs text-[#a39e93] mt-1">
          Explore legal subjects, doctrine classifications, and mapped judicial precedents across{' '}
          <code className="text-[#d2bd8b] bg-[#14171a] px-1.5 py-0.5 rounded">PRECEDENT_TAG</code> and{' '}
          <code className="text-[#d2bd8b] bg-[#14171a] px-1.5 py-0.5 rounded">CASE_TAG_MAPPING</code>.
        </p>
      </div>

      {/* SECTION 1: KEYWORD SEARCH */}
      <div className="bg-[#121519] border border-[#232730] rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-medium text-[#f1e6c6]">
          1. Search Precedent Tags & Associated Decisions (Query 7)
        </h3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeTagSearch(searchQuery);
          }}
          className="flex flex-wrap gap-3 items-center"
        >
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search taxonomy keyword (e.g. Corporate, Fraud, Cyber)"
              className="w-full bg-[#1a1e24] border border-[#2b2e35] rounded-lg px-4 py-2 text-xs text-[#eee9dc] placeholder-[#66635b] focus:outline-none focus:border-[#d2bd8b]"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#7d6d4e] px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {searchLoading ? 'Searching...' : 'Search Tags'}
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('Corporate');
              executeTagSearch('Corporate');
            }}
            className="text-xs text-[#d2bd8b] hover:underline px-2 py-1"
          >
            Sample: 'Corporate'
          </button>
        </form>

        {/* Search Error */}
        {searchError && (
          <div className="bg-[#241212] border border-[#6b2c2c] text-[#f1a8a8] px-3 py-2 rounded text-xs flex justify-between">
            <span>{searchError}</span>
            <button
              onClick={() => executeTagSearch(searchQuery)}
              className="underline hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search Loading */}
        {searchLoading && (
          <div className="text-center py-4 text-xs text-[#8c887d] animate-pulse">
            Searching taxonomy catalog...
          </div>
        )}

        {/* Search Results */}
        {!searchLoading && searchResults.length > 0 && (
          <div className="overflow-x-auto border border-[#1e2229] rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#171a20] text-[#a39e93] text-[10px] uppercase border-b border-[#1e2229]">
                <tr>
                  <th className="py-2.5 px-3">Taxonomy Tag</th>
                  <th className="py-2.5 px-3">Case Title & ID</th>
                  <th className="py-2.5 px-3">Adjudicating Court</th>
                  <th className="py-2.5 px-3">Jurisdiction</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2229]">
                {searchResults.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#15181f] transition">
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
                            ? 'bg-[#291818] text-[#e89d9d]'
                            : item.jurisdictionType === 'Civil'
                            ? 'bg-[#182429] text-[#9dcce8]'
                            : 'bg-[#212418] text-[#cce89d]'
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
      <div className="bg-[#121519] border border-[#232730] rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-medium text-[#f1e6c6]">
          2. Inspect Tags Assigned to a Specific Case (Query 8)
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
              className="w-full bg-[#1a1e24] border border-[#2b2e35] rounded-lg px-4 py-2 text-xs text-[#eee9dc] placeholder-[#66635b] focus:outline-none focus:border-[#d2bd8b]"
            />
          </div>
          <button
            type="submit"
            disabled={caseLoading}
            className="bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#7d6d4e] px-4 py-2 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-50"
          >
            {caseLoading ? 'Inspecting...' : 'Lookup Tags'}
          </button>
          <button
            type="button"
            onClick={() => {
              setCaseIdInput('CASE_800');
              executeCaseTagLookup('CASE_800');
            }}
            className="text-xs text-[#d2bd8b] hover:underline px-2 py-1"
          >
            Sample: 'CASE_800'
          </button>
        </form>

        {/* Case Tag Error */}
        {caseError && (
          <div className="bg-[#241212] border border-[#6b2c2c] text-[#f1a8a8] px-3 py-2 rounded text-xs flex justify-between">
            <span>{caseError}</span>
            <button
              onClick={() => executeCaseTagLookup(caseIdInput)}
              className="underline hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Case Tag Loading */}
        {caseLoading && (
          <div className="text-center py-4 text-xs text-[#8c887d] animate-pulse">
            Querying assigned taxonomy mappings...
          </div>
        )}

        {/* Tag Mutation Notifications */}
        {tagMutationSuccess && (
          <div className="bg-emerald-950/40 border border-emerald-800 text-emerald-200 px-3 py-2 rounded text-xs flex justify-between items-center">
            <span>✓ {tagMutationSuccess}</span>
            <button
              onClick={() => setTagMutationSuccess(null)}
              className="text-emerald-400 hover:text-emerald-200 text-sm font-bold"
            >
              ×
            </button>
          </div>
        )}

        {tagMutationError && (
          <div className="bg-rose-950/40 border border-rose-800 text-rose-200 px-3 py-2 rounded text-xs flex justify-between items-center">
            <span>⚠ {tagMutationError}</span>
            <button
              onClick={() => setTagMutationError(null)}
              className="text-rose-400 hover:text-rose-200 text-sm font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Case Tag Results */}
        {!caseLoading && caseTags.length > 0 && (
          <div className="bg-[#0e1013] border border-[#1a1e24] p-4 rounded-lg space-y-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e2229] pb-2">
              <span className="font-medium text-[#f1e6c6]">
                {caseTags[0].caseTitle}{' '}
                <span className="text-[#8c887d] font-normal font-mono">({caseTags[0].caseId})</span>
              </span>
              <span className="text-[#a39e93] text-[11px]">
                Court: {caseTags[0].courtName} • Jurisdiction: {caseTags[0].jurisdictionType}
              </span>
            </div>
            <div>
              <span className="text-[#8c887d] block text-[11px] mb-2">Mapped Precedent Tags:</span>
              <div className="flex flex-wrap gap-2">
                {caseTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-[#1b2028] text-[#d2bd8b] border border-[#383d47] pl-2.5 pr-1.5 py-1 rounded text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <span>#{tag.assignedTag}</span>
                    <span className="text-[10px] text-[#7d796e]">({tag.tagId})</span>
                    <button
                      onClick={() => handleRemoveTag(tag.tagId)}
                      disabled={tagMutating}
                      title="Remove Tag Mapping"
                      className="ml-1 text-[#8c887d] hover:text-rose-400 font-bold px-1 rounded hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Inline Add Tag */}
            <div className="pt-3 border-t border-[#1e2229] flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-[#a39e93] font-medium">+ Assign Precedent Tag:</span>
              <select
                value={selectedTagToAssign}
                onChange={(e) => setSelectedTagToAssign(e.target.value)}
                disabled={tagMutating}
                className="bg-[#181b22] border border-[#2b313d] rounded px-2.5 py-1 text-xs text-[#eee9dc] outline-none"
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
                className="px-3 py-1 bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#bda36d] rounded text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                {tagMutating ? 'Mapping...' : 'Assign Tag'}
              </button>
            </div>
          </div>
        )}

        {!caseLoading && !caseError && caseTags.length === 0 && (
          <div className="bg-[#0e1013] border border-[#1a1e24] p-4 rounded-lg space-y-3 text-xs">
            <p className="text-[#8c887d] text-center">
              No precedent tags currently mapped to <code className="text-[#d2bd8b]">{caseIdInput}</code>.
            </p>
            <div className="pt-2 border-t border-[#1e2229] flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] text-[#a39e93] font-medium">Assign Initial Tag:</span>
              <select
                value={selectedTagToAssign}
                onChange={(e) => setSelectedTagToAssign(e.target.value)}
                disabled={tagMutating}
                className="bg-[#181b22] border border-[#2b313d] rounded px-2.5 py-1 text-xs text-[#eee9dc] outline-none"
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
                className="px-3 py-1 bg-[#24211a] hover:bg-[#342f24] text-[#f1e6c6] border border-[#bda36d] rounded text-xs font-medium transition cursor-pointer disabled:opacity-50"
              >
                {tagMutating ? 'Mapping...' : 'Assign Tag'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

