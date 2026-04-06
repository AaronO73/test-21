// Helper functions to call the backend API.
// This resolver is tolerant of common deployment/local-dev mismatches.
const resolveApiBases = () => {
  const bases = [];

  if (typeof window !== "undefined" && window?.__SIMUTRADE_API_BASE__) {
    bases.push(window.__SIMUTRADE_API_BASE__);
  }

  if (typeof process !== "undefined" && process?.env?.SIMUTRADE_API_BASE) {
    bases.push(process.env.SIMUTRADE_API_BASE);
  }

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      bases.push(`${protocol}//${hostname}:4000/api`);
    }
  }

  // Prefer same-origin API proxy when available.
  bases.push("/api");
  // Common explicit local fallbacks.
  bases.push("http://localhost:4000/api");
  bases.push("http://127.0.0.1:4000/api");

  // De-duplicate while preserving order.
  return [...new Set(bases)];
};

const API_BASES = resolveApiBases();

const requestWithFallbacks = async (path, options) => {
  let lastError;
  for (const base of API_BASES) {
    try {
      const response = await fetch(`${base}${path}`, options);
      if (response.ok) {
        return response.json();
      }
      // 404/5xx can happen when one base is wrong; keep trying.
      lastError = new Error(`Request failed (${response.status}) for ${base}${path}`);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("API request failed.");
};

export const fetchPortfolio = async () => {
  return requestWithFallbacks("/portfolio");
};

export const fetchHistory = async () => {
  return requestWithFallbacks("/history");
};

export const fetchStock = async (symbol) => {
  return requestWithFallbacks(`/stocks?symbol=${symbol}`);
};

export const placeTrade = async (payload) => {
  return requestWithFallbacks("/trade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};
