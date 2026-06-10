import { useRef, useEffect } from "react";
import { MONO, C, TYPE_CONFIG, ALL_TYPES } from "../constants";

function SearchInput({ value, onChange }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div style={{ flex: 1, position: "relative" }}>
      <input
        ref={inputRef}
        value={value}
        onChange={onChange}
        placeholder="Search by run ID, type, step, or any field value..."
        style={{ width: "100%", boxSizing: "border-box", fontFamily: MONO, fontSize: 13, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 40px 8px 12px", color: C.text, outline: "none", transition: "border-color 0.15s" }}
        onFocus={(e) => e.currentTarget.style.borderColor = C.caret}
        onBlur={(e)  => e.currentTarget.style.borderColor = C.border}
      />
      <kbd style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontFamily: MONO, fontSize: 10, color: C.textDim, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 5px", pointerEvents: "none" }}>
        ⌘K
      </kbd>
    </div>
  );
}

function TypeFilters({ typeFilter, setTypeFilter, presentTypes }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, marginRight: 2 }}>Filter:</span>
      <button
        onClick={() => setTypeFilter("all")}
        style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4, cursor: "pointer", background: typeFilter === "all" ? C.text : C.surface, color: typeFilter === "all" ? "#FFFFFF" : C.textMid, border: `1px solid ${typeFilter === "all" ? C.text : C.border}`, transition: "all 0.15s" }}
      >
        all
      </button>
      {[...ALL_TYPES.filter(t => presentTypes.includes(t)), ...presentTypes.filter(t => !ALL_TYPES.includes(t))].map(t => {
        const tc = TYPE_CONFIG[t];
        const active = typeFilter === t;
        return (
          <button key={t}
            onClick={() => setTypeFilter(active ? "all" : t)}
            style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4, cursor: "pointer", background: active ? tc.fg : tc.bg, color: active ? "#FFFFFF" : tc.fg, border: `1px solid ${active ? tc.fg : tc.border}`, transition: "all 0.15s" }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

export default function Toolbar({ search, onSearchChange, typeFilter, setTypeFilter, presentTypes, onRefresh }) {
  return (
    <div style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 8, padding: "16px 20px", marginBottom: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <h1 style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: C.text, margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.caret} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          AI Observability Logs
        </h1>
        <button
          onClick={onRefresh}
          style={{ marginLeft: "auto", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer", color: C.text, fontSize: 13, lineHeight: 1, fontFamily: MONO, fontWeight: 500, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6 }}
          onMouseOver={(e) => e.currentTarget.style.background = C.surfaceHov}
          onMouseOut={(e)  => e.currentTarget.style.background = C.surface}
        >
          ↻ Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <SearchInput value={search} onChange={onSearchChange} />
      </div>

      <TypeFilters typeFilter={typeFilter} setTypeFilter={setTypeFilter} presentTypes={presentTypes} />
    </div>
  );
}
