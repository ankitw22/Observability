import { useState, useEffect, useCallback } from "react";
import { C, API_URL } from "./constants";
import { normalizeRuns, filterRuns } from "./utils";
import Toolbar from "./components/Toolbar";
import RunCard from "./components/RunCard";
import DetailView from "./components/DetailView";
import { LoadingScreen, ErrorScreen, EmptyScreen } from "./components/StatusScreens";

export default function AIObservability() {
  const [logs, setLogs]                   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [search, setSearch]               = useState("");
  const [typeFilter, setTypeFilter]       = useState("all");
  const [detailId, setDetailId]           = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const runs = normalizeRuns(data);
      runs.sort((a, b) => new Date(a.ts || 0) - new Date(b.ts || 0));
      setLogs(runs);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const visible      = filterRuns(logs, { typeFilter, search });
  const detailRun    = detailId ? logs.find(r => r.runId === detailId) : null;
  const presentTypes = [...new Set(logs.flatMap(r => r.entries.map(e => e.type)))];

  return (
    <div style={{ fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", background: C.bg, minHeight: "100vh", color: C.text }}>
<div style={{ maxWidth: "1600px", margin: "0 auto", padding: "1.5rem 2rem" }}>

        <Toolbar
          search={search}
          onSearchChange={e => { setSearch(e.target.value); setDetailId(null); }}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          presentTypes={presentTypes}
          onRefresh={fetchLogs}
        />

        {loading && <LoadingScreen />}
        {error   && <ErrorScreen message={error} onRetry={fetchLogs} />}

        {!loading && !error && visible.length === 0 && <EmptyScreen />}

        {!loading && !error && visible.length > 0 && (
          detailRun
            ? <DetailView run={detailRun} onBack={() => setDetailId(null)} />
            : visible.map(run => <RunCard key={run.runId} run={run} onOpen={setDetailId} />)
        )}
      </div>
    </div>
  );
}
