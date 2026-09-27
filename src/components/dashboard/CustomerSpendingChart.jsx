"use client";

import { useEffect, useState } from "react";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CustomerSpendingChart() {
  const [bars, setBars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSpending = async () => {
      try {
        const response = await fetch("/api/dashboard/orders?days=365", { credentials: "include" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load spending");

        const totals = {};
        (data.orders || []).forEach((order) => {
          const date = new Date(order.createdAt);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          totals[key] = (totals[key] || 0) + Number(order.pricing?.grandTotal || 0);
        });

        const now = new Date();
        const months = Array.from({ length: 6 }, (_, index) => {
          const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          return { label: monthLabels[date.getMonth()], value: totals[key] || 0 };
        });
        const maxValue = Math.max(...months.map((month) => month.value), 1);
        setBars(months.map((month) => ({ ...month, heightPct: month.value ? Math.max(10, Math.round((month.value / maxValue) * 100)) : 4 })));
      } catch (error) {
        console.error("Failed to fetch customer spending:", error);
        const now = new Date();
        setBars(Array.from({ length: 6 }, (_, index) => {
          const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
          return { label: monthLabels[date.getMonth()], value: 0, heightPct: 4 };
        }));
      } finally {
        setLoading(false);
      }
    };

    loadSpending();
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">Spending overview</h2>
        <p className="text-sm text-slate-500">Your order spending over the last six months.</p>
      </div>
      {loading ? (
        <div className="flex h-44 items-center justify-center text-sm text-slate-500">Loading spending...</div>
      ) : (
        <div className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 flex h-36 flex-col justify-between border-b border-slate-100 py-1">
            <span className="text-[10px] text-slate-300">${Math.max(...bars.map((bar) => bar.value), 0).toFixed(0)}</span>
            <span className="text-[10px] text-slate-300">$0</span>
          </div>
          <div className="flex h-44 items-end gap-3">
            {bars.map((bar) => (
              <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <div className="flex h-full w-full items-end" title={`$${bar.value.toFixed(2)}`}>
                  <div className="w-full rounded-t-xl bg-[#DB4444]" style={{ height: `${bar.heightPct}%` }} />
                </div>
                <span className="text-xs text-slate-500">{bar.label}</span>
              </div>
            ))}
          </div>
          {!loading && bars.every((bar) => bar.value === 0) && <p className="absolute inset-x-0 top-1/2 text-center text-xs text-slate-400">No spending data yet</p>}
        </div>
      )}
    </section>
  );
}
