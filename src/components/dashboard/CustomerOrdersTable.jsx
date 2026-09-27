"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { mockOrders } from "../../app/dashboard/mock-data";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  pending: { label: "Pending", tone: "bg-amber-50 text-amber-600 border-amber-200", icon: Clock3 },
  processing: { label: "Processing", tone: "bg-blue-50 text-blue-600 border-blue-200", icon: Clock3 },
  shipped: { label: "Shipped", tone: "bg-indigo-50 text-indigo-600 border-indigo-200", icon: Truck },
  arrived: { label: "Arrived", tone: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  delivered: { label: "Delivered", tone: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", tone: "bg-red-50 text-red-600 border-red-200", icon: XCircle },
};

export default function CustomerOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/dashboard/orders", { credentials: "include" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
        setOrders(mockOrders);
      setLoadError("Couldn't load your orders. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 0);
    return () => clearTimeout(timer);
  }, []);

  const getOrderName = (order) => {
    if (order.orderNumber) return `Order #${order.orderNumber}`;
    const firstItem = order.items?.[0];
    if (!firstItem) return "Order";
    const extra = order.items.length > 1 ? ` +${order.items.length - 1} more` : "";
    return `${firstItem.name || firstItem.title || "Item"}${extra}`;
  };

  const getStatus = (order) => {
    const key = (order.status || "pending").toLowerCase();
    return STATUS_STYLES[key] || STATUS_STYLES.pending;
  };

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const paginatedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (n) => {
    if (n < 1 || n > totalPages) return;
    setPage(n);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#DB4444]/10 text-[#DB4444]">
          <Package size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Your Orders</h2>
          <p className="text-sm text-slate-500">Track every purchase and its current status</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 p-8 text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Loading orders...
        </div>
      ) : loadError ? (
        <div className="p-8 text-sm text-red-600">
          {loadError}{" "}
          <button onClick={fetchOrders} className="ml-1 font-semibold underline underline-offset-2">
            Retry
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-12 text-center text-slate-400">
          <Package size={26} />
          <p className="text-sm">You haven&apos;t placed any orders yet.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3">Order</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => {
                  const status = getStatus(order);
                  const StatusIcon = status.icon;
                  return (
                    <tr
                      key={order._id}
                      className="border-t border-slate-100 transition-colors hover:bg-rose-50/30"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800">{getOrderName(order)}</td>
                      <td className="px-6 py-4 text-slate-800">
                        ${Number(order.pricing?.grandTotal || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${status.tone}`}
                        >
                          <StatusIcon size={12} /> {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, orders.length)} of {orders.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                .reduce((acc, n, idx, arr) => {
                  if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…");
                  acc.push(n);
                  return acc;
                }, [])
                .map((n, idx) =>
                  n === "…" ? (
                    <span key={`gap-${idx}`} className="px-1 text-xs text-slate-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => goToPage(n)}
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                        n === page ? "bg-[#DB4444] text-white" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {n}
                    </button>
                  )
                )}
              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}