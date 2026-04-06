import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Trade form allows users to submit buy/sell orders
export default function TradeForm({
  priceData,
  selectedSymbol,
  setSelectedSymbol,
  onTrade,
  statusMessage,
  formatCurrency,
}) {
  const [side, setSide] = useState("buy");
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState("market");
  const [limitPrice, setLimitPrice] = useState(0);

  const chartData = useMemo(() => {
    return priceData.history.map((point) => ({
      date: point.date,
      price: point.price,
    }));
  }, [priceData]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onTrade({
      symbol: selectedSymbol,
      side,
      quantity: Number(quantity),
      orderType,
      limitPrice: orderType === "limit" ? Number(limitPrice) : null,
    });
  };

  return (
    <section className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">{selectedSymbol} Price</h2>
              <p className="text-slate-400 text-sm">
                Latest: {formatCurrency(priceData.latestPrice)}
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis
                  stroke="#64748b"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4"
        >
          <h2 className="text-xl font-semibold">Place a Trade</h2>
          <div>
            <label className="text-sm text-slate-300">Symbol</label>
            <select
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
              value={selectedSymbol}
              onChange={(event) => setSelectedSymbol(event.target.value)}
            >
              {["AAPL", "TSLA", "MSFT", "BTC", "ETH"].map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-300">Order Type</label>
            <select
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
              value={orderType}
              onChange={(event) => setOrderType(event.target.value)}
            >
              <option value="market">Market</option>
              <option value="limit">Limit</option>
            </select>
          </div>
          {orderType === "limit" && (
            <div>
              <label className="text-sm text-slate-300">Limit Price</label>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
                value={limitPrice}
                onChange={(event) => setLimitPrice(event.target.value)}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide("buy")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                side === "buy"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-950 text-slate-300"
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setSide("sell")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                side === "sell"
                  ? "bg-rose-500 text-white"
                  : "bg-slate-950 text-slate-300"
              }`}
            >
              Sell
            </button>
          </div>
          <div>
            <label className="text-sm text-slate-300">Quantity</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold py-2 rounded-lg"
          >
            Submit Trade
          </button>
          {statusMessage && (
            <p className="text-sm text-slate-400">{statusMessage}</p>
          )}
        </form>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h3 className="text-lg font-semibold mb-2">Gamification</h3>
        <p className="text-slate-400">
          Leaderboards and trading challenges will appear here in the full
          release.
        </p>
      </div>
    </section>
  );
}
