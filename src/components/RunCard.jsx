import { memo } from "react";
import { MONO, C } from "../constants";
import LogRow from "./LogRow";

const PREVIEW_LIMIT = 5;

export default memo(function RunCard({ run, onOpen }) {
  const preview   = run.entries.slice(0, PREVIEW_LIMIT);
  const hasMore   = run.entries.length > PREVIEW_LIMIT;

  return (
    <div style={{ marginBottom: 16, background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: C.text }}>{run.runId}</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: C.textDim, marginLeft: "auto", fontWeight: 500 }}>{run.age}</span>
      </div>

      {/* Preview entries */}
      <div>
        {preview.map((e, i) => <LogRow key={i} entry={e} />)}
      </div>

      {/* Show all logs button */}
      {hasMore && (
        <button
          onClick={() => onOpen(run.runId)}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", padding: "10px 20px", fontFamily: MONO, fontSize: 12, fontWeight: 600, color: C.caret, background: C.surface, border: "none", borderTop: `1px solid ${C.border}`, cursor: "pointer", transition: "background 0.15s" }}
          onMouseOver={(e) => e.currentTarget.style.background = C.surfaceHov}
          onMouseOut={(e)  => e.currentTarget.style.background = C.surface}
        >
          Show all logs
        </button>
      )}
    </div>
  );
});
