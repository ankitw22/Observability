import { useState, useEffect, useRef, useCallback } from "react";
import { MONO, C, TYPE_CONFIG, ALL_TYPES, API_URL } from "../constants";
import { normalizeEntry, inferLogType } from "../utils";
import TypeChip from "./TypeChip";
import LogRow from "./LogRow";

export default function DetailView({ run, onBack }) {
  const [entries, setEntries]     = useState(run.entries);
  const [logType, setLogType]     = useState(run.logType);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // filter
  const [activeFilter, setActiveFilter] = useState("all");

  // key-value search
  const [sKey, setSKey]           = useState("");
  const [sVal, setSVal]           = useState("");
  const [results, setResults]     = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState(null);
  const debounceRef               = useRef(null);

  // fetch all entries on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setError(null);
    fetch(`${API_URL}/${encodeURIComponent(run.runId)}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        if (cancelled) return;
        const raw = data.logs || data.entries || data.data || (Array.isArray(data) ? data : []);
        const normalized = raw.map(normalizeEntry);
        normalized.sort((a, b) => new Date(a.tsRaw || 0) - new Date(b.tsRaw || 0));
        setEntries(normalized);
        setLogType(inferLogType(normalized));
      })
      .catch(e => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [run.runId]);

  const doSearch = useCallback(async (k, v) => {
    if (!k.trim() && !v.trim()) { setResults(null); setSearchErr(null); return; }
    setSearching(true); setSearchErr(null);
    try {
      const payload = JSON.stringify({ [k]: v });
      const res = await fetch(`${API_URL}/${encodeURIComponent(run.runId)}?search=${encodeURIComponent(payload)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const raw = data.logs || data.entries || data.data || (Array.isArray(data) ? data : []);
      setResults(raw.map(normalizeEntry));
    } catch (e) {
      setSearchErr(e.message);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, [run.runId]);

  const triggerSearch = (k, v) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(k, v), 350);
  };

  const handleKey = (e) => { setSKey(e.target.value); triggerSearch(e.target.value, sVal); };
  const handleVal = (e) => { setSVal(e.target.value); triggerSearch(sKey, e.target.value); };
  const clearSearch = () => { setSKey(""); setSVal(""); setResults(null); setSearchErr(null); };

  const sourceEntries = results !== null ? results : entries;
  const presentTypes  = [...new Set(entries.map(e => e.type))];
  const displayEntries = activeFilter === "all" ? sourceEntries : sourceEntries.filter(e => e.type === activeFilter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

      {/* Header card */}
      <div style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 16 }}>

        {/* Back */}
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: MONO, fontSize: 13, fontWeight: 600, color: C.textMid, background: C.surface, border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", padding: "14px 20px", width: "100%", transition: "background 0.15s" }}
          onMouseOver={(e) => e.currentTarget.style.background = C.surfaceHov}
          onMouseOut={(e)  => e.currentTarget.style.background = C.surface}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to all logs
        </button>

        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "16px 20px", background: "#FAFBFC", borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: C.text }}>{run.runId}</span>
          <TypeChip type={logType} />
          {loading
            ? <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 11, height: 11, border: `2px solid ${C.border}`, borderTopColor: C.caret, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Loading...
              </span>
            : <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}>{entries.length} entries</span>
          }
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, marginLeft: "auto" }}>{run.age}</span>
        </div>

        {/* Filter chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 20px", background: "#FAFBFC", borderBottom: `1px solid ${C.border}` }}>
          <button
            onClick={() => setActiveFilter("all")}
            style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4, cursor: "pointer", background: activeFilter === "all" ? C.text : C.surface, color: activeFilter === "all" ? "#FFFFFF" : C.textMid, border: `1px solid ${activeFilter === "all" ? C.text : C.border}`, transition: "all 0.15s" }}
          >
            all
          </button>
          {[...ALL_TYPES.filter(t => presentTypes.includes(t)), ...presentTypes.filter(t => !ALL_TYPES.includes(t))].map(t => {
            const tc = TYPE_CONFIG[t];
            const active = activeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setActiveFilter(active ? "all" : t)}
                style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4, cursor: "pointer", background: active ? tc.fg : tc.bg, color: active ? "#FFFFFF" : tc.fg, border: `1px solid ${active ? tc.fg : tc.border}`, transition: "all 0.15s" }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {/* Key-value search */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "#F8F9FA", borderBottom: `1px solid ${C.border}` }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={sKey}
            onChange={handleKey}
            placeholder="key"
            style={{ width: 140, fontFamily: MONO, fontSize: 12, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 10px", outline: "none", color: C.text }}
            onFocus={(e) => e.currentTarget.style.borderColor = C.caret}
            onBlur={(e)  => e.currentTarget.style.borderColor = C.border}
          />
          <span style={{ fontFamily: MONO, fontSize: 13, color: C.textDim, fontWeight: 600 }}>:</span>
          <input
            value={sVal}
            onChange={handleVal}
            placeholder="value"
            style={{ flex: 1, fontFamily: MONO, fontSize: 12, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 5, padding: "5px 10px", outline: "none", color: C.text }}
            onFocus={(e) => e.currentTarget.style.borderColor = C.caret}
            onBlur={(e)  => e.currentTarget.style.borderColor = C.border}
          />
          {searching && (
            <div style={{ width: 12, height: 12, border: `2px solid ${C.border}`, borderTopColor: C.caret, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
          )}
          {(sKey || sVal) && !searching && (
            <button onClick={clearSearch} style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, background: "none", border: "none", cursor: "pointer", padding: "0 2px" }}>✕</button>
          )}
        </div>

        {/* Search status */}
        {searchErr && (
          <div style={{ fontFamily: MONO, fontSize: 12, color: "#DC2626", padding: "8px 20px", background: "#FEF2F2" }}>
            Search failed: {searchErr}
          </div>
        )}
        {!searchErr && results !== null && (
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, padding: "6px 20px", background: "#F0F4FF" }}>
            {results.length === 0
              ? `No matches for { ${sKey}: ${sVal} }`
              : `${results.length} result${results.length !== 1 ? "s" : ""} for { ${sKey}: ${sVal} }`}
          </div>
        )}
      </div>

      {error && (
        <div style={{ fontFamily: MONO, fontSize: 12, color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px 20px", marginBottom: 12 }}>
          Failed to load full entries: {error} — showing cached preview.
        </div>
      )}

      {/* Entries */}
      <div style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {displayEntries.length === 0 && !loading ? (
          <div style={{ fontFamily: MONO, fontSize: 13, color: C.textDim, padding: "32px 20px", textAlign: "center" }}>
            No entries to display
          </div>
        ) : (
          displayEntries.map((e, i) => <LogRow key={i} entry={e} />)
        )}
      </div>
    </div>
  );
}
