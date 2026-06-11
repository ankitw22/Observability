import { useState, useEffect, useCallback, useRef } from "react";
import { C, API_URL } from "./constants";
import { normalizeRuns } from "./utils";
import Toolbar from "./components/Toolbar";
import RunCard from "./components/RunCard";
import DetailView from "./components/DetailView";
import { LoadingScreen, ErrorScreen, EmptyScreen } from "./components/StatusScreens";

const API_PAGE_SIZE = 100;

export default function AIObservability() {
  // --- normal (no-search) state ---
  const [runs, setRuns]         = useState([]);
  const [fetching, setFetching] = useState(false);
  const [hasMore, setHasMore]   = useState(true);

  // --- search state ---
  const [search, setSearch]               = useState("");
  const [searchResults, setSearchResults] = useState(null); // null = not in search mode
  const [searching, setSearching]         = useState(false);
  const [searchHasMore, setSearchHasMore] = useState(false);

  const [error, setError]       = useState(null);
  const [detailId, setDetailId] = useState(null);

  // refs for normal pagination
  const apiPageRef  = useRef(1);
  const hasMoreRef  = useRef(true);
  const fetchingRef = useRef(false);
  const seenIdsRef  = useRef(new Set());

  // refs for search pagination
  const searchPageRef    = useRef(1);
  const searchHasMoreRef = useRef(false);
  const searchingRef     = useRef(false);
  const searchQueryRef   = useRef("");

  const searchDebounceRef = useRef(null);

  // ── normal infinite scroll fetch ──────────────────────────────────────────
  const fetchNextPage = useCallback(async () => {
    if (fetchingRef.current || !hasMoreRef.current) return;
    fetchingRef.current = true;
    setFetching(true);
    setError(null);
    try {
      const params = new URLSearchParams({ pageSize: API_PAGE_SIZE, page: apiPageRef.current });
      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const newRuns = normalizeRuns(data.logs || []);
      newRuns.sort((a, b) => new Date(b.lastUpdated || b.ts || 0) - new Date(a.lastUpdated || a.ts || 0));

      const fresh = newRuns.filter(r => !seenIdsRef.current.has(r.runId));
      fresh.forEach(r => seenIdsRef.current.add(r.runId));
      setRuns(prev => [...prev, ...fresh]);

      apiPageRef.current += 1;
      if (apiPageRef.current > (data.totalPages || 1)) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      fetchingRef.current = false;
      setFetching(false);
    }
  }, []);

  // ── search fetch (supports pagination / appending) ────────────────────────
  const fetchSearchPage = useCallback(async (query, page, append = false) => {
    if (searchingRef.current) return;
    searchingRef.current = true;
    setSearching(true);
    setError(null);
    try {
      const params = new URLSearchParams({ search: query.trim(), page, pageSize: API_PAGE_SIZE });
      const res = await fetch(`${API_URL}?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const results = normalizeRuns(data.logs || []);
      results.sort((a, b) => new Date(b.lastUpdated || b.ts || 0) - new Date(a.lastUpdated || a.ts || 0));

      setSearchResults(prev => append && prev ? [...prev, ...results] : results);

      const more = page < (data.totalPages || 1);
      searchHasMoreRef.current = more;
      setSearchHasMore(more);
      searchPageRef.current = page + 1;
    } catch (e) {
      setError(e.message);
    } finally {
      searchingRef.current = false;
      setSearching(false);
    }
  }, []);

  const fetchNextSearchPage = useCallback(() => {
    if (!searchHasMoreRef.current || searchingRef.current) return;
    fetchSearchPage(searchQueryRef.current, searchPageRef.current, true);
  }, [fetchSearchPage]);

  // ── debounced search input handler ────────────────────────────────────────
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setDetailId(null);
    clearTimeout(searchDebounceRef.current);
    if (!val.trim()) {
      setSearchResults(null);
      searchQueryRef.current = "";
      searchPageRef.current = 1;
      searchHasMoreRef.current = false;
      return;
    }
    searchDebounceRef.current = setTimeout(() => {
      searchQueryRef.current = val;
      searchPageRef.current = 1;
      searchHasMoreRef.current = false;
      fetchSearchPage(val, 1, false);
    }, 400);
  };

  // ── auto-fill viewport for normal mode ────────────────────────────────────
  useEffect(() => {
    if (fetching || searchResults !== null) return;
    if (!hasMoreRef.current) return;
    if (runs.length === 0) { fetchNextPage(); return; }
    if (document.documentElement.scrollHeight <= window.innerHeight + 100) {
      fetchNextPage();
    }
  }, [runs, fetching, fetchNextPage, searchResults]);

  // ── auto-fill viewport for search mode ────────────────────────────────────
  useEffect(() => {
    if (searching || searchResults === null) return;
    if (!searchHasMoreRef.current) return;
    if (document.documentElement.scrollHeight <= window.innerHeight + 100) {
      fetchNextSearchPage();
    }
  }, [searchResults, searching, fetchNextSearchPage]);

  // ── window scroll: both normal and search pagination ──────────────────────
  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollHeight - scrollTop - clientHeight < 400) {
          if (searchResults !== null) {
            fetchNextSearchPage();
          } else {
            fetchNextPage();
          }
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (rafId) cancelAnimationFrame(rafId); };
  }, [fetchNextPage, fetchNextSearchPage, searchResults]);

  // ── refresh ────────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    fetchingRef.current = false;
    seenIdsRef.current = new Set();
    apiPageRef.current = 1;
    hasMoreRef.current = true;
    searchQueryRef.current = "";
    searchPageRef.current = 1;
    searchHasMoreRef.current = false;
    setRuns([]);
    setHasMore(true);
    setSearchResults(null);
    setSearchHasMore(false);
    setSearch("");
    setError(null);
  };

  const displayRuns = searchResults !== null ? searchResults : runs;
  const detailRun   = detailId ? displayRuns.find(r => r.runId === detailId) : null;
  const isInitial   = fetching && runs.length === 0 && searchResults === null;
  const isLoadingMore = fetching || searching;
  const noMoreData  = searchResults !== null
    ? !searchHasMore && !searching
    : !hasMore && !fetching;

  return (
    <div style={{ fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", background: C.bg, minHeight: "100vh", color: C.text }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "1.5rem 2rem" }}>

        <Toolbar
          search={search}
          onSearchChange={handleSearchChange}
          searching={searching}
          onRefresh={handleRefresh}
        />

        {isInitial && <LoadingScreen />}
        {error && !isLoadingMore && <ErrorScreen message={error} onRetry={handleRefresh} />}
        {!isInitial && !isLoadingMore && !error && displayRuns.length === 0 && <EmptyScreen />}

        {!isInitial && (
          detailRun
            ? <DetailView run={detailRun} onBack={() => setDetailId(null)} />
            : <>
                {displayRuns.map(run => (
                  <RunCard key={run.runId} run={run} onOpen={setDetailId} />
                ))}

                {isLoadingMore && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "32px 0", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ width: 28, height: 28, border: `3px solid ${C.border}`, borderTopColor: C.caret, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    <span style={{ fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", fontSize: 12, color: C.textDim, fontWeight: 500 }}>
                      {searching ? "Searching..." : "Fetching next page..."}
                    </span>
                  </div>
                )}

                {noMoreData && displayRuns.length > 0 && (
                  <div style={{ textAlign: "center", padding: "20px", fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", fontSize: 12, color: C.textDim, borderTop: `1px dashed ${C.border}`, marginTop: 8 }}>
                    {searchResults !== null
                      ? `${displayRuns.length} result${displayRuns.length !== 1 ? "s" : ""} for "${search}"`
                      : `All ${displayRuns.length} log IDs loaded`}
                  </div>
                )}
              </>
        )}
      </div>
    </div>
  );
}
