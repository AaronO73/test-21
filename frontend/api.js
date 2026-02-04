// Helper functions to call the backend API
// Use a relative URL by default so the frontend can be hosted with a proxy
// or behind the same origin as the backend. For local dev, fall back to port 4000.
const resolveApiBase = () => {
  if (typeof window !== "undefined" && window?.__SIMUTRADE_API_BASE__) {
    return window.__SIMUTRADE_API_BASE__;
  }
  if (typeof process !== "undefined" && process?.env?.SIMUTRADE_API_BASE) {
    return process.env.SIMUTRADE_API_BASE;
  }
  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `${protocol}//${hostname}:4000/api`;
    }
  }
  return "/api";
};

const API_BASE = resolveApiBase();

export const fetchPortfolio = async () => {
  const response = await fetch(`${API_BASE}/portfolio`);
  return response.json();
};

export const fetchHistory = async () => {
  const response = await fetch(`${API_BASE}/history`);
  return response.json();
};

export const fetchStock = async (symbol) => {
  const response = await fetch(`${API_BASE}/stocks?symbol=${symbol}`);
  return response.json();
};

export const placeTrade = async (payload) => {
  const response = await fetch(`${API_BASE}/trade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.json();
};
