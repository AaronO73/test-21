import React, { useEffect, useMemo, useState } from "react";
import Dashboard from "./components/Dashboard.jsx";
import TradeForm from "./components/TradeForm.jsx";
import TradeHistory from "./components/TradeHistory.jsx";
import {
  fetchPortfolio,
  fetchHistory,
  fetchStock,
  placeTrade,
} from "./api.js";

// Main app with simple tab navigation
export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL");
  const [priceData, setPriceData] = useState({ latestPrice: 0, history: [] });
  const [currency, setCurrency] = useState("USD");
  const [statusMessage, setStatusMessage] = useState("");

  // Simple FX conversion rates (USD base) for demo purposes
  const fxRates = useMemo(
    () => ({ USD: 1, CAD: 1.35, EUR: 0.92 }),
    []
  );

  const formatCurrency = (value) => {
    const converted = value * (fxRates[currency] ?? 1);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(converted);
  };

  // Load portfolio and history on initial render
  useEffect(() => {
    const loadData = async () => {
      const [portfolioResponse, historyResponse] = await Promise.all([
        fetchPortfolio(),
        fetchHistory(),
      ]);
      setPortfolio(portfolioResponse);
      setHistory(historyResponse);
      if (portfolioResponse?.currency) {
        setCurrency(portfolioResponse.currency);
      }
    };
    loadData();
  }, []);

  // Load price data whenever the selected symbol changes
  useEffect(() => {
    const loadPriceData = async () => {
      const response = await fetchStock(selectedSymbol);
      setPriceData(response);
    };
    loadPriceData();
  }, [selectedSymbol]);

  // Poll portfolio values so the line chart updates with market changes
  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await fetchPortfolio();
      setPortfolio(updated);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTrade = async (payload) => {
    setStatusMessage("Submitting trade...");
    const response = await placeTrade(payload);
    if (response.error) {
      setStatusMessage(response.error);
      return;
    }
    setStatusMessage("Trade executed successfully.");
    const [portfolioResponse, historyResponse] = await Promise.all([
      fetchPortfolio(),
      fetchHistory(),
    ]);
    setPortfolio(portfolioResponse);
    setHistory(historyResponse);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">SimuTrade</h1>
            <p className="text-slate-400">
              Practice trading with real market data and virtual cash.
            </p>
          </div>
          <div className="flex gap-2 bg-slate-900 rounded-full p-1">
            {[
              { id: "dashboard", label: "Dashboard" },
              { id: "trade", label: "Trade" },
              { id: "history", label: "History" },
              { id: "settings", label: "Settings" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`px-4 py-2 rounded-full text-sm transition ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : "text-slate-300 hover:text-white"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        <main className="mt-8">
          {activeTab === "dashboard" && portfolio && (
            <Dashboard
              portfolio={portfolio}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === "trade" && (
            <TradeForm
              priceData={priceData}
              selectedSymbol={selectedSymbol}
              setSelectedSymbol={setSelectedSymbol}
              onTrade={handleTrade}
              statusMessage={statusMessage}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === "history" && (
            <TradeHistory
              trades={history}
              formatCurrency={formatCurrency}
            />
          )}

          {activeTab === "settings" && (
            <section className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
              <label className="block text-sm text-slate-300 mb-2">
                Display Currency
              </label>
              <select
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                <option value="USD">USD</option>
                <option value="CAD">CAD</option>
                <option value="EUR">EUR</option>
              </select>
              <p className="text-slate-400 mt-4">
                Currency changes affect display only in this demo. Hook this up
                to `/api/portfolio` to persist to the database.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
