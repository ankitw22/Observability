import { MONO, C } from "../constants";

export function LoadingScreen() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ fontFamily: MONO, fontSize: 14, color: C.textMid }}>
        <div style={{ display: "inline-block", width: 16, height: 16, border: `2px solid ${C.border}`, borderTopColor: C.caret, borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 10 }} />
        Fetching logs...
      </div>
    </div>
  );
}

export function ErrorScreen({ message, onRetry }) {
  return (
    <div style={{ fontFamily: MONO, fontSize: 13, color: "#991B1B", background: "#FEF2F2", border: "2px solid #FCA5A5", borderRadius: 8, padding: "16px 20px", boxShadow: "0 1px 3px rgba(220,38,38,0.1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 16 }}>⚠️</span>
        <span style={{ fontWeight: 600 }}>Failed to fetch logs</span>
      </div>
      <div style={{ color: "#B91C1C", marginBottom: 12 }}>{message}</div>
      <button
        onClick={onRetry}
        style={{ fontFamily: MONO, fontSize: 12, fontWeight: 600, color: "#FFFFFF", background: "#DC2626", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", transition: "background 0.15s" }}
        onMouseOver={(e) => e.currentTarget.style.background = "#B91C1C"}
        onMouseOut={(e)  => e.currentTarget.style.background = "#DC2626"}
      >
        Retry
      </button>
    </div>
  );
}

export function EmptyScreen() {
  return (
    <div style={{ textAlign: "center", padding: "4rem 2rem", background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 8 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 8 }}>No logs found</div>
      <div style={{ fontFamily: MONO, fontSize: 12, color: C.textDim }}>Try adjusting your filters or search terms</div>
    </div>
  );
}
