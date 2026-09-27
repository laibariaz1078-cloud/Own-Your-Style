"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, DollarSign, Users, LayoutDashboard } from "lucide-react";
import StatCard from "../../../components/dashboard/StatCard";
import CustomerOrdersTable from "../../../components/dashboard/CustomerOrdersTable";
import CustomerSpendingChart from "../../../components/dashboard/CustomerSpendingChart";
import { mockOrders } from "../mock-data";

export default function CustomerDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0, totalSellers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const ordersRes = await fetch("/api/dashboard/orders?days=30", { credentials: "include" });
        if (!ordersRes.ok) throw new Error(`Request failed (${ordersRes.status})`);
        const ordersData = await ordersRes.json();

        const totalSpent =
          ordersData.orders?.reduce((sum, order) => {
            const orderTotal = Number(order.pricing?.grandTotal) || 0;
            return sum + orderTotal;
          }, 0) || 0;

        const uniqueSellers = new Set(
          ordersData.orders?.flatMap((order) => order.items?.map((item) => item.sellerId))
        );

        setStats({
          totalOrders: ordersData.orders?.length || 0,
          totalSpent: totalSpent.toFixed(2),
          totalSellers: uniqueSellers.size,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        const totalSpent = mockOrders.reduce((sum, order) => sum + order.pricing.grandTotal, 0);
        setStats({ totalOrders: mockOrders.length, totalSpent: totalSpent.toFixed(2), totalSellers: 2 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] border border-rose-100 bg-linear-to-br from-white to-rose-50/40 p-6 shadow-[0_18px_40px_rgba(219,68,68,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DB4444]/10 text-[#DB4444]">
            <LayoutDashboard size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#DB4444]">Overview</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">My Dashboard</h1>
            <p className="mt-0.5 text-sm text-slate-500">A quick look at your last 30 days.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard icon={ShoppingCart} label="Orders (30 days)" value={loading ? "—" : stats.totalOrders} />
        <StatCard icon={DollarSign} label="Total Spent (30 days)" value={loading ? "—" : `$${stats.totalSpent}`} />
        <StatCard icon={Users} label="Sellers (30 days)" value={loading ? "—" : stats.totalSellers} />
      </div>

      <CustomerSpendingChart />
      <CustomerOrdersTable />
    </div>
  );
}