import { MONO, TYPE_CONFIG } from "../constants";

export default function TypeChip({ type }) {
  const tc = TYPE_CONFIG[type];
  return (
    <span style={{
      fontFamily: MONO, fontSize: 10, fontWeight: 600,
      padding: "2px 8px", borderRadius: 3,
      background: tc.bg, color: tc.fg,
      border: `1px solid ${tc.border}`,
      letterSpacing: "0.04em", whiteSpace: "nowrap",
      display: "inline-block",
    }}>
      {type}
    </span>
  );
}
