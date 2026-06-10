export const MONO = "'JetBrains Mono','Fira Code','Cascadia Code',monospace";

export const C = {
  bg:         "#F5F7FA",
  surface:    "#F8F9FA",
  surfaceHov: "#E9ECEF",
  border:     "#DEE2E6",
  text:       "#1F2937",
  textMid:    "#374151",
  textDim:    "#6B7280",
  caret:      "#0366D6",
};

const TYPE_STYLES = {
  input:  { bg: "#E7F3FF", fg: "#0366D6", border: "#B3D7FF" },
  llm:    { bg: "#FFF5E6", fg: "#D97706", border: "#FFD699" },
  tool:   { bg: "#F3EBFF", fg: "#7C3AED", border: "#D4B3FF" },
  agent:  { bg: "#ECFDF5", fg: "#059669", border: "#A7F3D0" },
  output: { bg: "#F0FDF4", fg: "#16A34A", border: "#BBF7D0" },
  error:  { bg: "#FEF2F2", fg: "#DC2626", border: "#FECACA" },
  info:   { bg: "#F1F5F9", fg: "#475569", border: "#CBD5E1" },
};

export const UNKNOWN_TYPE_STYLE = { bg: "#F3F4F6", fg: "#374151", border: "#D1D5DB" };

export const TYPE_CONFIG = new Proxy(TYPE_STYLES, {
  get: (target, key) => target[key] ?? UNKNOWN_TYPE_STYLE,
});

export const ALL_TYPES = ["input", "llm", "tool", "agent", "output", "error", "info"];

export const API_URL = import.meta.env.VITE_API_URL || "https://db.gtwy.ai/api/observability";
export const SEARCH_API_URL = import.meta.env.VITE_SEARCH_API_URL || API_URL;

export const COLLAPSE_THRESHOLD = 120;
