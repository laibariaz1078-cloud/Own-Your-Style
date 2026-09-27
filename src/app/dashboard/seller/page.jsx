"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";
import StatCard from "../../../components/dashboard/StatCard";
import SellerRevenueChart from "../../../components/dashboard/SellerRevenueChart";
import SellerProductsTable from "../../../components/dashboard/SellerProductsTable";
import { mockSellerStats } from "../mock-data";

export default function SellerDashboard() {
  const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0, monthlyRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsRes = await fetch("/api/dashboard/products", { credentials: "include" });
        const productsData = await productsRes.json();

        const ordersRes = await fetch("/api/dashboard/orders?days=30", { credentials: "include" });
        const ordersData = await ordersRes.json();

        const monthlyRevenue =
          ordersData.orders?.reduce((sum, order) => {
            const itemsRevenue = order.items?.reduce((itemSum, item) => itemSum + (Number(item.lineTotal) || 0), 0) || 0;
            return sum + itemsRevenue;
          }, 0) || 0;

        setStats({
          totalProducts: productsData.products?.length || 0,
          totalOrders: ordersData.orders?.length || 0,
          monthlyRevenue: monthlyRevenue.toFixed(2),
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
        setStats(mockSellerStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts} />
        <StatCard icon={ShoppingCart} label="Orders (30 days)" value={stats.totalOrders} />
        <StatCard icon={DollarSign} label="Revenue (30 days)" value={`$${stats.monthlyRevenue}`} />
      </div>

      <SellerRevenueChart />

      <SellerProductsTable />
    </div>
  );
}
