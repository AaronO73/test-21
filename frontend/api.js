// Helper functions to call the backend API
// Use a relative URL by default so the frontend can be hosted with a proxy
// or behind the same origin as the backend.
const API_BASE =
  (typeof window !== "undefined" && window?.__SIMUTRADE_API_BASE__) ||
  (typeof process !== "undefined" && process?.env?.SIMUTRADE_API_BASE) ||
  "/api";

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
