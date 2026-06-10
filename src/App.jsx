import { useState, useEffect, useCallback, useRef } from "react";
import { C, API_URL } from "./constants";
import { normalizeRuns } from "./utils";
import Toolbar from "./components/Toolbar";
import RunCard from "./components/RunCard";
import DetailView from "./components/DetailView";
import { LoadingScreen, ErrorScreen, EmptyScreen } from "./components/StatusScreens";

const API_PAGE_SIZE = 100;

export default function AIObservability() {
  const [runs, setRuns]             = useState([]);
  const [fetching, setFetching]     = useState(false);
  const [error, setError]           = useState(null);
  const [hasMore, setHasMore]       = useState(true);
  const [search, setSearch]         = useState("");
  const [detailId, setDetailId]     = useState(null);

  const apiPageRef   = useRef(1);
  const hasMoreRef   = useRef(true);
  const fetchingRef  = useRef(false);
  const seenIdsRef   = useRef(new Set());

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

  // initial load
  useEffect(() => { fetchNextPage(); }, [fetchNextPage]);

  // window scroll → trigger next page when near bottom (throttled via rAF)
  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollHeight - scrollTop - clientHeight < 400) {
          fetchNextPage();
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (rafId) cancelAnimationFrame(rafId); };
  }, [fetchNextPage]);

  const handleRefresh = () => {
    seenIdsRef.current = new Set();
    apiPageRef.current = 1;
    hasMoreRef.current = true;
    setRuns([]);
    setHasMore(true);
    setError(null);
    fetchNextPage();
  };

  const filtered = search.trim()
    ? runs.filter(run => run.runId.toLowerCase().includes(search.trim().toLowerCase()))
    : runs;

  const detailRun = detailId ? runs.find(r => r.runId === detailId) : null;
  const isInitial    = fetching && runs.length === 0;

  return (
    <div style={{ fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", background: C.bg, minHeight: "100vh", color: C.text }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto", padding: "1.5rem 2rem" }}>

        <Toolbar
          search={search}
          onSearchChange={e => { setSearch(e.target.value); setDetailId(null); }}
          onRefresh={handleRefresh}
        />

        {isInitial && <LoadingScreen />}
        {error && !fetching && <ErrorScreen message={error} onRetry={handleRefresh} />}
        {!isInitial && !fetching && !error && filtered.length === 0 && <EmptyScreen />}

        {!isInitial && (
          detailRun
            ? <DetailView run={detailRun} onBack={() => setDetailId(null)} />
            : <>
                {filtered.map(run => (
                  <RunCard key={run.runId} run={run} onOpen={setDetailId} />
                ))}

                {fetching && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "32px 0", background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, marginTop: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                    <div style={{ width: 28, height: 28, border: `3px solid ${C.border}`, borderTopColor: C.caret, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    <span style={{ fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", fontSize: 12, color: C.textDim, fontWeight: 500 }}>
                      Fetching next page...
                    </span>
                  </div>
                )}

                {!fetching && !hasMore && filtered.length > 0 && (
                  <div style={{ textAlign: "center", padding: "20px", fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", fontSize: 12, color: C.textDim, borderTop: `1px dashed ${C.border}`, marginTop: 8 }}>
                    All {filtered.length} log IDs loaded
                  </div>
                )}
              </>
        )}
      </div>
    </div>
  );
}
