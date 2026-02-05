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
  const [limitPrice, setLimitPrice] = useState("");

  const chartData = useMemo(() => {
    return (priceData?.history ?? []).map((point) => ({
      date: point.date,
      price: point.price,
    }));
  }, [priceData]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (quantity <= 0) return;

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
          <h2 className="text-xl font-semibold mb-1">
            {selectedSymbol} Price
          </h2>
          <p className="text-slate-400 text-sm mb-4">
            Latest: {formatCurrency(priceData?.latestPrice ?? 0)}
          </p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis
                  stroke="#64748b"
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip
                  formatter={(v) => formatCurrency(v)}
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
              onChange={(e) => setSelectedSymbol(e.target.value)}
            >
              {["AAPL", "TSLA", "MSFT", "BTC", "ETH"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-slate-300">Order Type</label>
            <select
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
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
                min="0"
                step="0.01"
                className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSide("buy")}
              className={`rounded-lg px-4 py-2 font-semibold ${
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
              className={`rounded-lg px-4 py-2 font-semibold ${
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
              min="0.0001"
              step="0.0001"
              className="mt-1 w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
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
