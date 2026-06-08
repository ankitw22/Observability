import { MONO, C, TYPE_CONFIG } from "../constants";
import TypeChip from "./TypeChip";
import LogRow from "./LogRow";

export default function DetailView({ run, onBack }) {
  const tc = TYPE_CONFIG[run.logType] || TYPE_CONFIG.info;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: 16 }}>
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

        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "#FAFBFC" }}>
          <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: C.text }}>{run.runId}</span>
          <TypeChip type={run.logType} />
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, marginLeft: "auto", fontWeight: 500 }}>{run.age}</span>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        {run.entries.map((e, i) => <LogRow key={i} entry={e} />)}
      </div>
    </div>
  );
}
