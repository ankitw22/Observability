import { TYPE_CONFIG } from "./constants";

export function isJsonString(str) {
  if (typeof str !== "string") return false;
  const s = str.trim();
  if (!((s.startsWith("{") && s.endsWith("}")) || (s.startsWith("[") && s.endsWith("]")))) return false;
  try { JSON.parse(s); return true; } catch (_) { return false; }
}

export function previewText(c) {
  if (c.t === "kv")     return Object.entries(c.d).map(([k, v]) => `${k}: ${v}`).join("\n");
  if (c.t === "text")   return c.text;
  if (c.t === "err")    return c.msg;
  if (c.t === "prompt") return `${c.prompt}\n\n${c.resp}`;
  return "";
}

export function timeAgo(ts) {
  if (!ts) return "";
  try {
    const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (diff < 60)    return `${diff}s ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch (_) { return ""; }
}

export function normalizeEntry(raw) {
  let type = raw.type || raw.event_type || raw.kind || raw.data?.type || "info";
  const knownTypes = ["input", "output", "llm", "tool", "agent", "error", "info"];
  if (!knownTypes.includes(type)) {
    if (raw.error || raw.exception)                       type = "error";
    else if (raw.prompt || raw.model || raw.tokens)       type = "llm";
    else if (raw.tool_name || raw.tool || raw.function)   type = "tool";
    else if (raw.agent || raw.agent_name || raw.handoff)  type = "agent";
    else if (raw.output || raw.result || raw.response)    type = "output";
    else                                                   type = "input";
  }

  const step = raw.step || raw.data?.step || raw.name || raw.label || raw.event || raw.message || "";
  const ts   = raw.ts || raw.timestamp || raw.created_at || raw.time || "";

  let tsFormatted = ts;
  try {
    const d = new Date(ts);
    if (!isNaN(d)) tsFormatted = d.toTimeString().slice(0, 8) + "." + String(d.getMilliseconds()).padStart(3, "0");
  } catch (_) {}

  let content;
  if (raw.data && typeof raw.data === "object" && !Array.isArray(raw.data)) {
    content = { t: "kv", d: Object.fromEntries(Object.entries(raw.data).map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : String(v)])) };
  } else if (raw.data) {
    content = { t: "text", text: typeof raw.data === "string" ? raw.data : JSON.stringify(raw.data, null, 2) };
  } else if (raw.error || raw.exception || type === "error") {
    const msg = raw.error || raw.exception || raw.message || raw.msg || JSON.stringify(raw);
    content = { t: "err", msg: typeof msg === "object" ? JSON.stringify(msg, null, 2) : String(msg) };
  } else if (raw.prompt || raw.prompt_text) {
    content = { t: "prompt", prompt: raw.prompt || raw.prompt_text || "", resp: raw.response || raw.output || raw.completion || "" };
  } else {
    const dump = raw.dump || raw.payload || raw.meta || raw.details;
    if (dump && typeof dump === "object" && !Array.isArray(dump)) {
      content = { t: "kv", d: Object.fromEntries(Object.entries(dump).map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : String(v)])) };
    } else if (dump) {
      content = { t: "text", text: typeof dump === "string" ? dump : JSON.stringify(dump, null, 2) };
    } else {
      const exclude = new Set(["type","event_type","kind","step","name","label","event","ts","timestamp","created_at","time","id","run_id","session_id","unique_id","log_id","updated_at"]);
      const kv = Object.fromEntries(Object.entries(raw).filter(([k]) => !exclude.has(k)).map(([k, v]) => [k, typeof v === "object" ? JSON.stringify(v) : String(v)]));
      content = Object.keys(kv).length > 0 ? { t: "kv", d: kv } : { t: "text", text: JSON.stringify(raw, null, 2) };
    }
  }

  return { ts: tsFormatted, tsRaw: ts, type, step, content };
}

export function inferLogType(entries) {
  if (!entries.length) return "info";
  const counts = {};
  entries.forEach(e => { counts[e.type] = (counts[e.type] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return (sorted.find(([t]) => t !== "info") || sorted[0])?.[0] || "info";
}

export function normalizeRuns(apiData) {
  let items = apiData;
  if (!Array.isArray(apiData)) {
    items = apiData.runs || apiData.logs || apiData.data || apiData.events || [apiData];
  }

  const firstItem = items[0] || {};
  const isFlat = !firstItem.entries && !firstItem.logs;

  if (isFlat) {
    const groups = {};
    const groupOrder = [];
    items.forEach(raw => {
      const runId = raw.run_id || raw.log_id || raw.session_id || raw.id || "default";
      if (!groups[runId]) {
        groups[runId] = { runId, entries: [], ts: raw.timestamp || raw.ts || raw.created_at || "" };
        groupOrder.push(runId);
      }
      groups[runId].entries.push(normalizeEntry(raw));
    });
    return groupOrder.map(id => {
      const g = groups[id];
      g.entries.sort((a, b) => new Date(a.tsRaw || 0) - new Date(b.tsRaw || 0));
      const hasErr  = g.entries.some(e => e.type === "error");
      const hasWarn = g.entries.some(e => e.content?.t === "err");
      const logType = inferLogType(g.entries);
      return { runId: g.runId, status: hasErr ? "error" : hasWarn ? "warn" : "ok", age: timeAgo(g.ts), entries: g.entries, logType, ts: g.ts };
    });
  }

  return items.map(run => {
    const rawEntries = run.entries || run.logs || run.events || [];
    const entries = rawEntries.map(normalizeEntry);
    entries.sort((a, b) => new Date(a.tsRaw || 0) - new Date(b.tsRaw || 0));
    const hasErr  = entries.some(e => e.type === "error");
    const hasWarn = entries.some(e => e.content?.t === "err");
    const runId   = run.runId || run.run_id || run.id || "unknown";
    const ts      = run.created_at || run.timestamp || run.ts || "";
    const logType = inferLogType(entries);
    return { runId, status: run.status || (hasErr ? "error" : hasWarn ? "warn" : "ok"), age: timeAgo(ts), entries, logType, ts };
  });
}

function extractText(value) {
  if (value == null) return "";
  if (typeof value === "string") {
    try { return extractText(JSON.parse(value)); } catch (_) { return value; }
  }
  if (typeof value === "object") return Object.values(value).map(extractText).join(" ");
  return String(value);
}

function entryHaystack(runId, e) {
  const c = e.content;
  let contentText = "";
  if (c.t === "kv")     contentText = Object.entries(c.d).map(([k, v]) => `${k} ${extractText(v)}`).join(" ");
  if (c.t === "text")   contentText = extractText(c.text);
  if (c.t === "err")    contentText = c.msg;
  if (c.t === "prompt") contentText = `${extractText(c.prompt)} ${extractText(c.resp)}`;
  return `${runId} ${e.type} ${e.step} ${e.ts} ${contentText}`.toLowerCase();
}

export function filterRuns(runs, { typeFilter, search }) {
  const query = search.trim().toLowerCase();
  return runs.map(run => {
    const filtered = run.entries.filter(e => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (query && !entryHaystack(run.runId, e).includes(query)) return false;
      return true;
    });
    if (!filtered.length) return null;
    return { ...run, entries: filtered };
  }).filter(Boolean);
}

export function getTypeColor(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG.info;
}
