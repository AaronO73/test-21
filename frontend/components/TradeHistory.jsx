import React from "react";

// Trade history table of executed trades
export default function TradeHistory({ trades, formatCurrency }) {
  return (
    <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
      <h2 className="text-xl font-semibold mb-4">Trade History</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-slate-400">
            <tr>
              <th className="text-left py-2">Symbol</th>
              <th className="text-left py-2">Type</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Quantity</th>
              <th className="text-right py-2">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-t border-slate-800">
                <td className="py-2 font-medium">{trade.symbol}</td>
                <td className="py-2 capitalize">{trade.type}</td>
                <td className="py-2 text-right">
                  {formatCurrency(trade.price)}
                </td>
                <td className="py-2 text-right">{trade.quantity}</td>
                <td className="py-2 text-right text-slate-400">
                  {new Date(trade.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
