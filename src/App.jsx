import { useState, useEffect, useCallback } from "react";

const MONO = "'JetBrains Mono','Fira Code','Cascadia Code',monospace";

// Light theme tokens
const C = {
  bg:        "#F5F7FA",
  surface:   "#F8F9FA",
  surfaceHov:"#E9ECEF",
  border:    "#DEE2E6",
  borderMid: "#CED4DA",
  text:      "#1F2937",
  textMid:   "#374151",
  textDim:   "#6B7280",
  caret:     "#0366D6",
};

const TYPE_CONFIG = {
  input:  { bg: "#E7F3FF", fg: "#0366D6", border: "#B3D7FF" },
  llm:    { bg: "#FFF5E6", fg: "#D97706", border: "#FFD699" },
  tool:   { bg: "#F3EBFF", fg: "#7C3AED", border: "#D4B3FF" },
  agent:  { bg: "#ECFDF5", fg: "#059669", border: "#A7F3D0" },
  output: { bg: "#F0FDF4", fg: "#16A34A", border: "#BBF7D0" },
  error:  { bg: "#FEF2F2", fg: "#DC2626", border: "#FECACA" },
};

const STATUS_COLOR = { ok: "#16A34A", error: "#DC2626", warn: "#D97706" };

function previewText(c) {
  if (c.t === "kv")     return Object.entries(c.d).map(([k,v]) => `${k}: ${v}`).join("\n");
  if (c.t === "text")   return c.text;
  if (c.t === "err")    return c.msg;
  if (c.t === "prompt") return `${c.prompt}\n\n${c.resp}`;
  return "";
}

function DumpContent({ c }) {
  const blockStyle = {
    fontFamily: MONO, fontSize: 12,
    background: "#F6F8FA",
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    padding: "9px 12px",
    whiteSpace: "pre-wrap",
    lineHeight: 1.65,
    margin: 0,
  };

  if (c.t === "kv") return (
    <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
      {Object.entries(c.d).map(([k,v]) => (
        <div key={k} style={{ display:"flex", gap:14, fontFamily:MONO, fontSize:12 }}>
          <span style={{ color: C.textDim, minWidth:130, flexShrink:0 }}>{k}</span>
          <span style={{ color: C.text, wordBreak:"break-all" }}>{String(v)}</span>
        </div>
      ))}
    </div>
  );

  if (c.t === "text") return (
    <div style={{ fontFamily:MONO, fontSize:12, color: C.textMid, lineHeight:1.65, whiteSpace:"pre-wrap" }}>
      {c.text}
    </div>
  );

  if (c.t === "err") return (
    <div style={{ fontFamily:MONO, fontSize:12, color:"#B91C1C", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:4, padding:"9px 12px", whiteSpace:"pre-wrap", lineHeight:1.65 }}>
      {c.msg}
    </div>
  );

  if (c.t === "prompt") return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div>
        <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color: C.textDim, marginBottom:5 }}>prompt</div>
        <pre style={{ ...blockStyle, color: C.textMid }}>{c.prompt}</pre>
      </div>
      <div>
        <div style={{ fontFamily:MONO, fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color: C.textDim, marginBottom:5 }}>response</div>
        <pre style={{ ...blockStyle, color: C.text }}>{c.resp}</pre>
      </div>
    </div>
  );
  return null;
}

function LogRow({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const preview = previewText(entry.content);
  const hasContent = preview.trim().length > 0;
  const tc = TYPE_CONFIG[entry.type] || TYPE_CONFIG.input;

  const onClick = useCallback(() => {
    if (!hasContent) return;
    setExpanded(v => !v);
  }, [hasContent]);

  return (
    <div
      onClick={onClick}
      style={{
        borderBottom: `1px solid ${C.border}`,
        cursor: hasContent ? "pointer" : "default",
        background: expanded ? "#FAFBFC" : "#FFFFFF",
        transition: "background 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => !expanded && hasContent && (e.currentTarget.style.background = "#FAFBFC")}
      onMouseLeave={(e) => !expanded && (e.currentTarget.style.background = "#FFFFFF")}
    >
      <div style={{ display:"grid", gridTemplateColumns:"110px 80px 1fr auto", alignItems:"start", padding:"12px 20px", gap: "12px" }}>

        {/* timestamp */}
        <div style={{ fontFamily:MONO, fontSize:11, color: C.textDim, paddingRight:12, lineHeight:1.5, letterSpacing:"0.01em" }}>
          {entry.ts}
        </div>

        {/* badge */}
        <div style={{ paddingRight:10 }}>
          <span style={{
            fontFamily: MONO, fontSize: 10, fontWeight: 600,
            padding: "2px 8px", borderRadius: 3,
            background: tc.bg, color: tc.fg,
            border: `1px solid ${tc.border}`,
            letterSpacing: "0.04em", whiteSpace: "nowrap",
            display: "inline-block",
          }}>
            {entry.type}
          </span>
        </div>

        {/* main */}
        <div style={{ minWidth:0 }}>
          {/* step name row */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom: hasContent ? 5 : 0 }}>
            <div style={{
              fontFamily: MONO, fontSize: 12, fontWeight: 500,
              color: expanded ? C.text : "#4B5563",
              lineHeight: 1.5,
            }}>
              {entry.step}
            </div>
          </div>

          {hasContent && !expanded && (
            <div style={{ position:"relative" }}>
              <div style={{
                fontFamily: MONO, fontSize: 11.5, color: C.textDim,
                lineHeight: 1.65, maxHeight:"calc(1.65em * 3)",
                overflow: "hidden", whiteSpace:"pre-wrap", wordBreak:"break-word",
              }}>
                {preview}
              </div>
              <div style={{
                position:"absolute", bottom:0, left:0, right:0, height:"1.6em",
                background:`linear-gradient(transparent, ${expanded ? "#FAFBFC" : "#FFFFFF"})`,
                pointerEvents:"none",
              }} />
            </div>
          )}

          {hasContent && expanded && (
            <div style={{ paddingTop:6 }}>
              <DumpContent c={entry.content} />
            </div>
          )}
        </div>

        {/* expand/collapse icon */}
        {hasContent && (
          <div style={{ 
            display: "flex", 
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 2
          }}>
            <div style={{
              width: 24,
              height: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 4,
              background: expanded ? C.surface : "transparent",
              color: C.textDim,
              transition: "all 0.15s"
            }}>
              {expanded ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FlowStrip({ entries }) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", gap:4, marginBottom:16 }}>
      {entries.map((e, i) => {
        const tc = TYPE_CONFIG[e.type] || TYPE_CONFIG.input;
        return (
          <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
            <span style={{ fontFamily:MONO, fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:3, background:tc.bg, color:tc.fg, border:`1px solid ${tc.border}` }}>
              {e.type}
            </span>
            {i < entries.length - 1 && <span style={{ color: C.textDim, fontSize:10 }}>›</span>}
          </span>
        );
      })}
    </div>
  );
}

function RunCard({ run, onOpen }) {
  const dotColor = STATUS_COLOR[run.status] || C.textDim;
  return (
    <div style={{ 
      marginBottom: 20,
      background: "#FFFFFF",
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      transition: "box-shadow 0.2s"
    }}>
      <div style={{ 
        display:"flex", 
        alignItems:"center", 
        gap:12, 
        padding: "14px 20px",
        background: C.surface,
        borderBottom: `1px solid ${C.border}`
      }}>
        <span style={{ 
          width: 8, 
          height: 8, 
          borderRadius:"50%", 
          background: dotColor, 
          flexShrink:0, 
          boxShadow:`0 0 8px ${dotColor}80` 
        }} />
        <button onClick={() => onOpen(run.runId)} style={{
          fontFamily: MONO, 
          fontSize: 14, 
          fontWeight: 700, 
          color: C.text,
          background:"none", 
          border:"none", 
          cursor:"pointer", 
          padding: 0,
          textDecoration:"none",
          transition: "color 0.15s"
        }}
        onMouseOver={(e) => e.currentTarget.style.color = C.caret}
        onMouseOut={(e) => e.currentTarget.style.color = C.text}
        >
          {run.runId}
        </button>
        <span style={{
          fontFamily: MONO, 
          fontSize: 11, 
          fontWeight: 600,
          background: "#FFFFFF", 
          color: C.textMid,
          border: `1px solid ${C.border}`, 
          borderRadius: 4,
          padding: "3px 9px",
        }}>
          {run.entries.length} events
        </span>
        <span style={{ 
          fontFamily: MONO, 
          fontSize: 12, 
          color: C.textDim, 
          marginLeft:"auto",
          fontWeight: 500
        }}>
          {run.age}
        </span>
      </div>
      <div>
        {run.entries.map((e, i) => <LogRow key={i} entry={e} />)}
      </div>
    </div>
  );
}

function DetailView({ run, onBack }) {
  const dotColor = STATUS_COLOR[run.status] || C.textDim;
  return (
    <div style={{
      background: "#FFFFFF",
      border: `1px solid ${C.border}`,
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    }}>
      <button onClick={onBack} style={{
        display:"flex", 
        alignItems:"center", 
        gap:8,
        fontFamily: MONO, 
        fontSize: 13, 
        fontWeight: 600,
        color: C.textMid,
        background: C.surface,
        border:"none", 
        borderBottom: `1px solid ${C.border}`,
        cursor:"pointer",
        padding:"14px 20px",
        width:"100%",
        transition: "background 0.15s"
      }}
      onMouseOver={(e) => e.currentTarget.style.background = C.surfaceHov}
      onMouseOut={(e) => e.currentTarget.style.background = C.surface}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to all runs
      </button>
      <div style={{ 
        display:"flex", 
        alignItems:"center", 
        gap:12, 
        padding: "16px 20px",
        borderBottom: `1px solid ${C.border}`,
        background: "#FAFBFC"
      }}>
        <span style={{ 
          width: 8, 
          height: 8, 
          borderRadius:"50%", 
          background: dotColor, 
          flexShrink:0, 
          boxShadow:`0 0 8px ${dotColor}80` 
        }} />
        <span style={{ 
          fontFamily: MONO, 
          fontSize: 16, 
          fontWeight: 700, 
          color: C.text 
        }}>
          {run.runId}
        </span>
        <span style={{ 
          fontFamily: MONO, 
          fontSize: 11, 
          fontWeight: 600, 
          background: "#FFFFFF", 
          color: C.textMid, 
          border: `1px solid ${C.border}`, 
          borderRadius: 4, 
          padding: "3px 9px" 
        }}>
          {run.entries.length} events
        </span>
        <span style={{ 
          fontFamily: MONO, 
          fontSize: 12, 
          color: C.textDim, 
          marginLeft:"auto",
          fontWeight: 500 
        }}>
          {run.age}
        </span>
      </div>
      <div style={{ padding: "12px 20px", background: C.surface }}>
        <FlowStrip entries={run.entries} />
      </div>
      <div>
        {run.entries.map((e, i) => <LogRow key={i} entry={e} />)}
      </div>
    </div>
  );
}

// ─── normalize raw API data into internal format ──────────────────────────────
function normalizeEntry(raw) {
  // detect type from common fields
  let type = raw.type || raw.event_type || raw.kind || "info";
  const knownTypes = ["input","output","llm","tool","agent","error"];
  if (!knownTypes.includes(type)) {
    // infer from content keys
    if (raw.error || raw.exception) type = "error";
    else if (raw.prompt || raw.model || raw.tokens) type = "llm";
    else if (raw.tool_name || raw.tool || raw.function) type = "tool";
    else if (raw.agent || raw.agent_name || raw.handoff) type = "agent";
    else if (raw.output || raw.result || raw.response) type = "output";
    else type = "input";
  }

  const step = raw.step || raw.name || raw.label || raw.event || raw.message || type;
  const ts   = raw.ts || raw.timestamp || raw.created_at || raw.time || "";

  // format timestamp to HH:MM:SS.mmm
  let tsFormatted = ts;
  try {
    const d = new Date(ts);
    if (!isNaN(d)) {
      tsFormatted = d.toTimeString().slice(0,8) + "." + String(d.getMilliseconds()).padStart(3,"0");
    }
  } catch(_) {}

  // build content - prioritize 'data' field
  let content;
  
  // Check if there's a 'data' key and use it
  if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    content = { t: "kv", d: Object.fromEntries(Object.entries(raw.data).map(([k,v]) => [k, typeof v === "object" ? JSON.stringify(v) : String(v)])) };
  } else if (raw.data) {
    content = { t: "text", text: typeof raw.data === "string" ? raw.data : JSON.stringify(raw.data, null, 2) };
  } else if (raw.error || raw.exception || type === "error") {
    const msg = raw.error || raw.exception || raw.message || raw.msg || JSON.stringify(raw);
    content = { t: "err", msg: typeof msg === "object" ? JSON.stringify(msg, null, 2) : String(msg) };
  } else if (raw.prompt || raw.prompt_text) {
    content = { t: "prompt", prompt: raw.prompt || raw.prompt_text || "", resp: raw.response || raw.output || raw.completion || "" };
  } else {
    // fallback: check for other common data fields
    const dump = raw.dump || raw.payload || raw.meta || raw.details;
    if (dump && typeof dump === "object" && !Array.isArray(dump)) {
      content = { t: "kv", d: Object.fromEntries(Object.entries(dump).map(([k,v]) => [k, typeof v === "object" ? JSON.stringify(v) : String(v)])) };
    } else if (dump) {
      content = { t: "text", text: typeof dump === "string" ? dump : JSON.stringify(dump, null, 2) };
    } else {
      // show all remaining keys as kv
      const exclude = new Set(["type","event_type","kind","step","name","label","event","ts","timestamp","created_at","time","id","run_id","session_id","unique_id","log_id","created_at","updated_at"]);
      const kv = Object.fromEntries(Object.entries(raw).filter(([k]) => !exclude.has(k)).map(([k,v]) => [k, typeof v === "object" ? JSON.stringify(v) : String(v)]));
      content = Object.keys(kv).length > 0 ? { t: "kv", d: kv } : { t: "text", text: JSON.stringify(raw, null, 2) };
    }
  }

  return { ts: tsFormatted, type, step, content };
}

function normalizeRuns(apiData) {
  // handle array of runs, array of logs, or object with runs/logs key
  let items = apiData;
  if (!Array.isArray(apiData)) {
    items = apiData.runs || apiData.logs || apiData.data || apiData.events || [apiData];
  }

  // if items look like flat log entries (have no entries/logs sub-array), group by run_id
  const firstItem = items[0] || {};
  const isFlat = !firstItem.entries && !firstItem.logs;

  if (isFlat) {
    // group by run_id / session_id / id
    const groups = {};
    items.forEach(raw => {
      const runId = raw.run_id || raw.session_id || raw.id || "default";
      if (!groups[runId]) groups[runId] = { runId, entries: [], ts: raw.timestamp || raw.ts || raw.created_at || "" };
      groups[runId].entries.push(normalizeEntry(raw));
    });
    return Object.values(groups).map(g => {
      const hasErr  = g.entries.some(e => e.type === "error");
      const hasWarn = g.entries.some(e => e.content?.t === "err");
      return { runId: g.runId, status: hasErr ? "error" : hasWarn ? "warn" : "ok", age: timeAgo(g.ts), entries: g.entries };
    });
  }

  // items are already run objects
  return items.map(run => {
    const rawEntries = run.entries || run.logs || run.events || [];
    const entries = rawEntries.map(normalizeEntry);
    const hasErr  = entries.some(e => e.type === "error");
    const hasWarn = entries.some(e => e.content?.t === "err");
    const runId   = run.runId || run.run_id || run.id || "unknown";
    const age     = timeAgo(run.created_at || run.timestamp || run.ts || "");
    return { runId, status: run.status || (hasErr ? "error" : hasWarn ? "warn" : "ok"), age, entries };
  });
}

function timeAgo(ts) {
  if (!ts) return "";
  try {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  } catch(_) { return ""; }
}

// ─── Root ─────────────────────────────────────────────────────────────────────
const API_URL = "https://db.gtwy.ai/api/observability";

export default function AIObservability() {
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [rawData, setRawData]   = useState(null);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all");
  const [detailId, setDetailId] = useState(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setRawData(data);
      setLogs(normalizeRuns(data));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const FILTERS = ["all", "error", "tool", "llm"];
  const detailRun = detailId ? logs.find(r => r.runId === detailId) : null;

  const visible = logs.map(run => ({
    ...run,
    entries: run.entries.filter(e => {
      if (filter !== "all" && e.type !== filter) return false;
      if (search) {
        const hay = `${run.runId} ${e.step} ${e.type} ${previewText(e.content)}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    }),
  })).filter(r => r.entries.length > 0);

  return (
    <div style={{ fontFamily:MONO, background: C.bg, minHeight:"100vh", color: C.text }}>
      <div style={{ maxWidth: "1600px", margin:"0 auto", padding:"1.5rem 2rem" }}>

        {/* toolbar */}
        <div style={{ 
          background: "#FFFFFF",
          border: `1px solid ${C.border}`,
          borderRadius: 8,
          padding: "16px 20px",
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:12 }}>
            <h1 style={{ 
              fontFamily: MONO, 
              fontSize: 18, 
              fontWeight: 700, 
              color: C.text,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.caret} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
              </svg>
              AI Observability Logs
            </h1>
            <div style={{ 
              marginLeft: "auto",
              display: "flex",
              gap: 8,
              alignItems: "center"
            }}>
              <span style={{ 
                fontFamily: MONO, 
                fontSize: 11, 
                color: C.textDim,
                background: C.surface,
                padding: "4px 8px",
                borderRadius: 4,
                border: `1px solid ${C.border}`
              }}>
                {logs.length} total runs
              </span>
              <button 
                onClick={fetchLogs} 
                title="Refresh logs" 
                style={{ 
                  background: C.surface, 
                  border: `1px solid ${C.border}`, 
                  borderRadius: 6, 
                  padding: "6px 12px", 
                  cursor: "pointer", 
                  color: C.text, 
                  fontSize: 13, 
                  lineHeight: 1,
                  fontFamily: MONO,
                  fontWeight: 500,
                  transition: "all 0.15s",
                  display: "flex",
                  alignItems: "center",
                  gap: 6
                }}
                onMouseOver={(e) => e.currentTarget.style.background = C.surfaceHov}
                onMouseOut={(e) => e.currentTarget.style.background = C.surface}
              >
                ↻ Refresh
              </button>
            </div>
          </div>
          
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by run ID, step, or keyword..."
              style={{ 
                flex: 1, 
                fontFamily: MONO, 
                fontSize: 13, 
                background: C.bg, 
                border: `1px solid ${C.border}`, 
                borderRadius: 6, 
                padding: "8px 12px", 
                color: C.text, 
                outline: "none",
                transition: "border-color 0.15s"
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = C.caret}
              onBlur={(e) => e.currentTarget.style.borderColor = C.border}
            />
            {FILTERS.map(f => {
              const active = filter === f;
              return (
                <button key={f} onClick={() => { setFilter(f); setDetailId(null); }} style={{
                  fontFamily: MONO, 
                  fontSize: 12, 
                  fontWeight: active ? 600 : 500,
                  padding: "7px 14px",
                  border: active ? `2px solid ${C.caret}` : `1px solid ${C.border}`,
                  borderRadius: 6,
                  background: active ? "#E7F3FF" : C.surface,
                  color: active ? C.caret : C.textMid,
                  cursor: "pointer", 
                  whiteSpace: "nowrap", 
                  transition: "all 0.15s",
                  textTransform: "capitalize"
                }}>
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* states */}
        {loading && (
          <div style={{ 
            textAlign:"center", 
            padding:"4rem 2rem",
            background: "#FFFFFF",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{
              fontFamily: MONO,
              fontSize: 14,
              color: C.textMid,
              marginBottom: 12
            }}>
              <div style={{
                display: "inline-block",
                width: 16,
                height: 16,
                border: `2px solid ${C.border}`,
                borderTopColor: C.caret,
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                marginRight: 10
              }} />
              Fetching logs...
            </div>
            <style>
              {`@keyframes spin { to { transform: rotate(360deg); } }`}
            </style>
          </div>
        )}

        {error && (
          <div style={{ 
            fontFamily: MONO, 
            fontSize: 13, 
            color: "#991B1B", 
            background: "#FEF2F2", 
            border: `2px solid #FCA5A5`, 
            borderRadius: 8, 
            padding: "16px 20px",
            boxShadow: "0 1px 3px rgba(220,38,38,0.1)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontWeight: 600 }}>Failed to fetch logs</span>
            </div>
            <div style={{ color: "#B91C1C", marginBottom: 12 }}>{error}</div>
            <button 
              onClick={fetchLogs} 
              style={{ 
                fontFamily: MONO, 
                fontSize: 12, 
                fontWeight: 600,
                color: "#FFFFFF", 
                background: "#DC2626", 
                border: "none", 
                borderRadius: 6, 
                padding: "6px 14px", 
                cursor: "pointer",
                transition: "background 0.15s"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "#B91C1C"}
              onMouseOut={(e) => e.currentTarget.style.background = "#DC2626"}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div style={{ 
            textAlign:"center", 
            padding:"4rem 2rem",
            background: "#FFFFFF",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ 
              fontFamily: MONO, 
              fontSize: 14, 
              fontWeight: 600,
              color: C.text,
              marginBottom: 8
            }}>
              No logs found
            </div>
            <div style={{ 
              fontFamily: MONO, 
              fontSize: 12, 
              color: C.textDim 
            }}>
              Try adjusting your filters or search terms
            </div>
          </div>
        )}

        {!loading && !error && visible.length > 0 && (
          detailRun ? (
            <DetailView run={detailRun} onBack={() => setDetailId(null)} />
          ) : (
            visible.map(run => <RunCard key={run.runId} run={run} onOpen={setDetailId} />)
          )
        )}
      </div>
    </div>
  );
}