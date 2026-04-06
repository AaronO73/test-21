import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Dashboard shows portfolio summary and a portfolio value chart
export default function Dashboard({ portfolio, formatCurrency }) {
  return (
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Cash", value: portfolio.cash },
          { label: "Portfolio Value", value: portfolio.portfolioValue },
          { label: "Total Equity", value: portfolio.totalEquity },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-slate-900 p-5 rounded-2xl border border-slate-800"
          >
            <p className="text-slate-400 text-sm">{card.label}</p>
            <p className="text-2xl font-semibold mt-2">
              {formatCurrency(card.value)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Portfolio Value</h2>
            <p className="text-slate-400 text-sm">
              Updated with live market prices.
            </p>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={portfolio.timeline}>
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
                dataKey="value"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
        <h2 className="text-xl font-semibold mb-4">Holdings</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="text-left py-2">Symbol</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-right py-2">Avg. Cost</th>
                <th className="text-right py-2">Market Value</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map((holding) => (
                <tr key={holding.symbol} className="border-t border-slate-800">
                  <td className="py-2 font-medium">{holding.symbol}</td>
                  <td className="py-2 text-right">{holding.quantity}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(holding.averagePrice)}
                  </td>
                  <td className="py-2 text-right">
                    {formatCurrency(holding.marketValue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
