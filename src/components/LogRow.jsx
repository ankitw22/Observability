import { useState, useCallback } from "react";
import { MONO, C } from "../constants";
import { previewText } from "../utils";
import TypeChip from "./TypeChip";
import DumpContent from "./DumpContent";

const ChevronIcon = ({ up }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {up ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
  </svg>
);

export default function LogRow({ entry }) {
  const [expanded, setExpanded] = useState(false);
  const preview = previewText(entry.content);
  const hasContent = preview.trim().length > 0;

  const onClick = useCallback(() => {
    if (hasContent) setExpanded(v => !v);
  }, [hasContent]);

  return (
    <div
      onClick={onClick}
      style={{
        borderBottom: `1px solid ${C.border}`,
        cursor: hasContent ? "pointer" : "default",
        background: expanded ? "#FAFBFC" : "#FFFFFF",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => !expanded && hasContent && (e.currentTarget.style.background = "#FAFBFC")}
      onMouseLeave={(e) => !expanded && (e.currentTarget.style.background = "#FFFFFF")}
    >
      <div style={{ display: "grid", gridTemplateColumns: "110px 80px 1fr auto", alignItems: "start", padding: "12px 20px", gap: 12 }}>

        <div style={{ fontFamily: MONO, fontSize: 11, color: C.textDim, lineHeight: 1.5, letterSpacing: "0.01em" }}>
          {entry.ts}
        </div>

        <div>{entry.type && <TypeChip type={entry.type} />}</div>

        <div style={{ minWidth: 0 }}>
          {hasContent && !expanded && (
            <div style={{ position: "relative" }}>
              <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.textDim, lineHeight: 1.65, maxHeight: "calc(1.65em * 3)", overflow: "hidden", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {preview}
              </div>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1.6em", background: `linear-gradient(transparent, #FFFFFF)`, pointerEvents: "none" }} />
            </div>
          )}
          {hasContent && expanded && (
            <div style={{ paddingTop: 6 }}>
              <DumpContent c={entry.content} />
            </div>
          )}
        </div>

        {hasContent && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: 2 }}>
            <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, background: expanded ? C.surface : "transparent", color: C.textDim, transition: "all 0.15s" }}>
              <ChevronIcon up={expanded} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
