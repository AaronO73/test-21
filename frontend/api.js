// Helper functions to call the backend API
const API_BASE = "http://localhost:4000/api";

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
