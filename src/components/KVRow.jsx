import { useState } from "react";
import { MONO, C, COLLAPSE_THRESHOLD } from "../constants";

export default function KVRow({ label, value }) {
  const str = String(value);
  const isLong = str.length > COLLAPSE_THRESHOLD;
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggle = (e) => { e.stopPropagation(); setExpanded(v => !v); };

  const copy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(str).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      onClick={isLong ? toggle : undefined}
      style={{
        display: "flex", gap: 14, fontFamily: MONO, fontSize: 12, alignItems: "flex-start",
        cursor: isLong ? "pointer" : "default",
        borderRadius: 4, padding: "2px 4px", margin: "0 -4px",
        transition: "background 0.15s", position: "relative",
      }}
      onMouseEnter={(e) => { setHovered(true);  e.currentTarget.style.background = C.surface; }}
      onMouseLeave={(e) => { setHovered(false); e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ color: C.textDim, minWidth: 130, flexShrink: 0 }}>{label}</span>

      <span style={{ color: C.text, wordBreak: "break-all", flex: 1 }}>
        {isLong ? (
          <span style={{ position: "relative", display: "block" }}>
            <span style={{ display: "block", lineHeight: 1.65, maxHeight: expanded ? "none" : "3.6em", overflow: "hidden" }}>
              {str}
            </span>
            {!expanded && (
              <span style={{
                position: "absolute", bottom: 0, left: 0, right: 0, height: "2.4em",
                background: "linear-gradient(transparent, #FFFFFF)", pointerEvents: "none",
              }} />
            )}
            <span style={{ display: "block", marginTop: 3, fontFamily: MONO, fontSize: 10, fontWeight: 600, color: C.caret }}>
              {expanded ? "↑ collapse" : "↓ expand"}
            </span>
          </span>
        ) : str}
      </span>

      <button
        onClick={copy}
        style={{
          flexShrink: 0, alignSelf: "flex-start",
          fontFamily: MONO, fontSize: 10, fontWeight: 600,
          color: copied ? "#16A34A" : C.caret,
          background: "#FFFFFF", border: `1px solid ${C.border}`,
          borderRadius: 4, padding: "1px 0", cursor: "pointer",
          width: 36, textAlign: "center",
          transition: "color 0.15s, opacity 0.15s",
          opacity: hovered ? 1 : 0,
          pointerEvents: hovered ? "auto" : "none",
        }}
      >
        {copied ? "✓" : "copy"}
      </button>
    </div>
  );
}
