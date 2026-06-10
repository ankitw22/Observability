import { useRef, useEffect } from "react";
import { MONO, C } from "../constants";

export default function Toolbar({ search, onSearchChange, onRefresh }) {
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

      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          value={search}
          onChange={onSearchChange}
          placeholder="Search by log ID..."
          style={{ width: "100%", boxSizing: "border-box", fontFamily: MONO, fontSize: 13, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 40px 8px 12px", color: C.text, outline: "none", transition: "border-color 0.15s" }}
          onFocus={(e) => e.currentTarget.style.borderColor = C.caret}
          onBlur={(e)  => e.currentTarget.style.borderColor = C.border}
        />
        <kbd style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontFamily: MONO, fontSize: 10, color: C.textDim, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 4, padding: "2px 5px", pointerEvents: "none" }}>
          ⌘K
        </kbd>
      </div>
    </div>
  );
}
