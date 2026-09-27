"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Activity,
  House
} from "lucide-react";
import { mockAdminStats } from "../mock-data";

const PAGE_SIZE = 10;

const statusIcon = {
  open: { icon: AlertCircle, color: "text-amber-500 bg-amber-50" },
  in_review: { icon: Clock, color: "text-blue-500 bg-blue-50" },
  resolved: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
  closed: { icon: CheckCircle2, color: "text-slate-500 bg-slate-50" },
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activityPage, setActivityPage] = useState(1);

  const fetchStats = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/dashboard/admin/stats", { credentials: "include" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      setData(mockAdminStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchStats, 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-white p-8 text-slate-500">
        <Loader2 size={18} className="animate-spin" /> Loading dashboard...
      </div>
    );
  }

  if (loadError && !data) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-sm text-red-600">
        {loadError}{" "}
        <button onClick={fetchStats} className="ml-1 font-semibold underline underline-offset-2">
          Retry
        </button>
      </div>
    );
  }

  const metrics = [
    { title: "Total Revenue", value: `$${Number(data?.metrics?.totalRevenue || 0).toFixed(2)}` },
    { title: "Total Orders", value: data?.metrics?.totalOrders || 0 },
    { title: "Active Sellers", value: data?.metrics?.activeSellers || 0 },
  ];

  const reportStats = [
    { label: "Customers", value: data?.reportStats?.customers || 0 },
    { label: "Products", value: data?.reportStats?.products || 0 },
    { label: "In Stock", value: data?.reportStats?.inStock || 0 },
    { label: "Low Stock", value: data?.reportStats?.lowStock || 0 },
  ];

  const weeklyVolumes = (data?.weeklyVolumes || []).map((day) => ({
    ...day,
    value: Number(day.value) || 0,
  }));
  const maxVolume = Math.max(...weeklyVolumes.map((day) => day.value), 1);
  const hasWeeklyOrders = weeklyVolumes.some((day) => day.value > 0);
  const activityFeed = data?.activity || [];

  const activityTotalPages = Math.max(1, Math.ceil(activityFeed.length / PAGE_SIZE));
  const paginatedActivity = activityFeed.slice(
    (activityPage - 1) * PAGE_SIZE,
    activityPage * PAGE_SIZE
  );

  const goToActivityPage = (n) => {
    if (n < 1 || n > activityTotalPages) return;
    setActivityPage(n);
  };

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
            <h1 className="mt-1 text-2xl font-bold text-slate-900">System Analytics</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Monitor platform performance, seller activities, and order metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {metrics.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(219,68,68,0.08)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{item.title}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <ArrowUpRight size={13} />
              </span>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly volumes + report stats */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)] lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Weekly Order Volumes</h3>
          </div>

          {/* <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {reportStats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-center"
              >
                <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div> */}

          {weeklyVolumes.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-slate-400">
              No order data for this period.
            </div>
          ) : (
            <div className="relative">
              <div className="pointer-events-none absolute inset-x-0 top-0 flex h-40 flex-col justify-between border-b border-slate-100 py-1">
                <span className="text-[10px] text-slate-300">{maxVolume}</span>
                <span className="text-[10px] text-slate-300">0</span>
              </div>
              <div className="flex h-48 items-end gap-3 pt-4">
                {weeklyVolumes.map((day) => (
                  <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                    <div
                      className="w-full rounded-t-xl bg-[#DB4444] transition-all duration-300 hover:bg-[#bf3636]"
                      style={{ height: `${day.value > 0 ? Math.max(8, Math.round((day.value / maxVolume) * 100)) : 3}%` }}
                      title={`${day.value} orders`}
                    />
                    <span className="text-xs font-medium text-slate-400">{day.label}</span>
                  </div>
                ))}
              </div>
              {!hasWeeklyOrders && <p className="absolute inset-x-0 top-1/2 text-center text-xs text-slate-400">No orders recorded this week</p>}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={16} className="text-[#DB4444]" />
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          </div>

          <div className="flex-1 space-y-3">
            {paginatedActivity.length === 0 ? (
              <p className="text-sm text-slate-400">No recent activity.</p>
            ) : (
              paginatedActivity.map((act, i) => {
                const { icon: Icon, color } = statusIcon[act.status] || statusIcon.open;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:bg-rose-50/30"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-slate-800">{act.title}</p>
                      <p className="text-[10px] text-slate-400">
                        {act.time ? new Date(act.time).toLocaleDateString() : "—"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {activityFeed.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-[11px] text-slate-400">
                {(activityPage - 1) * PAGE_SIZE + 1}–
                {Math.min(activityPage * PAGE_SIZE, activityFeed.length)} of {activityFeed.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToActivityPage(activityPage - 1)}
                  disabled={activityPage === 1}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="px-1 text-xs font-medium text-slate-600">
                  {activityPage}/{activityTotalPages}
                </span>
                <button
                  onClick={() => goToActivityPage(activityPage + 1)}
                  disabled={activityPage === activityTotalPages}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}