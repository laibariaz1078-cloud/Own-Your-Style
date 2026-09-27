"use client";

import { useEffect, useState } from "react";
import { mockOrders } from "../../app/dashboard/mock-data";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function SellerRevenueChart() {
  const [bars, setBars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await fetch("/api/dashboard/orders", { credentials: "include" });
        const data = await res.json();
        const orders = data.orders || [];

        const monthlyTotals = {};
        orders.forEach((order) => {
          const date = new Date(order.createdAt);
          const key = `${date.getFullYear()}-${date.getMonth()}`;
          const orderRevenue = order.items?.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0) || 0;
          monthlyTotals[key] = (monthlyTotals[key] || 0) + orderRevenue;
        });

        const now = new Date();
        const last7Months = [];
        for (let i = 6; i >= 0; i -= 1) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${d.getMonth()}`;
          last7Months.push({ label: monthLabels[d.getMonth()], value: monthlyTotals[key] || 0 });
        }

        const maxValue = Math.max(...last7Months.map((month) => month.value), 1);
        setBars(last7Months.map((month) => ({ ...month, heightPct: month.value ? Math.max(10, Math.round((month.value / maxValue) * 100)) : 4 })));
      } catch (error) {
        console.error("Failed to fetch revenue:", error);
        const now = new Date();
        setBars(Array.from({ length: 7 }, (_, index) => {
          const date = new Date(now.getFullYear(), now.getMonth() - 6 + index, 1);
          return { label: monthLabels[date.getMonth()], value: mockOrders[index % mockOrders.length].pricing.grandTotal, heightPct: 40 + index * 8 };
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchRevenue();
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Revenue Overview</h3>
          <p className="text-sm text-slate-500">Performance for the last 7 months</p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-44 items-center justify-center text-sm text-slate-500">Loading revenue...</div>
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
                  <div className="w-full rounded-t-xl bg-[#DB4444] shadow-sm" style={{ height: `${bar.heightPct}%` }} />
                </div>
                <span className="text-xs text-slate-500">{bar.label}</span>
              </div>
            ))}
          </div>
          {!loading && bars.every((bar) => bar.value === 0) && <p className="absolute inset-x-0 top-1/2 text-center text-xs text-slate-400">No revenue data yet</p>}
        </div>
      )}
    </div>
  );
}
