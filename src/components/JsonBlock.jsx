import { MONO, C } from "../constants";

export default function JsonBlock({ value }) {
  let pretty;
  try { pretty = JSON.stringify(JSON.parse(value), null, 2); } catch (_) { pretty = value; }
  return (
    <pre style={{
      fontFamily: MONO, fontSize: 11.5,
      background: "#F6F8FA", color: "#24292F",
      border: `1px solid ${C.border}`, borderRadius: 6,
      padding: "10px 14px", whiteSpace: "pre-wrap",
      lineHeight: 1.65, margin: 0, overflowX: "auto", textAlign: "left",
    }}>
      {pretty}
    </pre>
  );
}
