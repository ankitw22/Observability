import { MONO, C } from "../constants";
import { isJsonString } from "../utils";
import JsonBlock from "./JsonBlock";
import KVRow from "./KVRow";

const blockStyle = {
  fontFamily: MONO, fontSize: 12,
  background: "#F6F8FA", border: `1px solid ${C.border}`,
  borderRadius: 4, padding: "9px 12px",
  whiteSpace: "pre-wrap", lineHeight: 1.65, margin: 0,
};

export default function DumpContent({ c }) {
  if (c.t === "kv") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {Object.entries(c.d).map(([k, v]) => <KVRow key={k} label={k} value={v} />)}
    </div>
  );

  if (c.t === "text") {
    if (isJsonString(c.text)) return <JsonBlock value={c.text} />;
    return <div style={{ fontFamily: MONO, fontSize: 12, color: C.textMid, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{c.text}</div>;
  }

  if (c.t === "err") return (
    <div style={{ fontFamily: MONO, fontSize: 12, color: "#B91C1C", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 4, padding: "9px 12px", whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
      {c.msg}
    </div>
  );

  if (c.t === "prompt") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textDim, marginBottom: 5 }}>prompt</div>
        {isJsonString(c.prompt) ? <JsonBlock value={c.prompt} /> : <pre style={{ ...blockStyle, color: C.textMid }}>{c.prompt}</pre>}
      </div>
      <div>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.textDim, marginBottom: 5 }}>response</div>
        {isJsonString(c.resp) ? <JsonBlock value={c.resp} /> : <pre style={{ ...blockStyle, color: C.text }}>{c.resp}</pre>}
      </div>
    </div>
  );

  return null;
}
