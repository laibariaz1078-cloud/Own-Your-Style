"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Users,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { mockSellers } from "../../mock-data";
import { showModal } from "../../../../lib/modal";

const PAGE_SIZE = 10;

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [page, setPage] = useState(1);
  const [removingId, setRemovingId] = useState(null);

  const fetchSellers = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/dashboard/admin/sellers", { credentials: "include" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setSellers(data.sellers || []);
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
      setSellers(mockSellers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchSellers, 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredSellers = sellers.filter((seller) => {
    const search = query.toLowerCase();
    return (
      seller.name?.toLowerCase().includes(search) || seller.email?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredSellers.length / PAGE_SIZE));
  const paginatedSellers = filteredSellers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (n) => {
    if (n < 1 || n > totalPages) return;
    setPage(n);
  };

  const handleRemove = async (sellerId, name) => {
    if (!(await showModal({ type: "confirm", title: "Remove seller", message: `Remove seller ${name}?`, confirmLabel: "Remove" }))) return;

    setRemovingId(sellerId);
    try {
      const res = await fetch(`/api/dashboard/admin/users/${sellerId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");

      setSellers((prev) => prev.filter((seller) => seller._id !== sellerId));
    } catch (error) {
      console.error("Failed to remove seller:", error);
      await showModal({ title: "Remove failed", message: "Unable to remove seller right now." });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] border border-rose-100 bg-linear-to-br from-white to-rose-50/40 p-6 shadow-[0_18px_40px_rgba(219,68,68,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DB4444]/10 text-[#DB4444]">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#DB4444]">Management</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">Sellers</h1>
            </div>
          </div>
          <div className="flex w-full max-w-md items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <Search size={16} className="text-slate-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search seller by name or email..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-white p-8 text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Loading sellers...
        </div>
      ) : loadError && sellers.length === 0 ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-sm text-red-600">
          {loadError}{" "}
          <button onClick={fetchSellers} className="ml-1 font-semibold underline underline-offset-2">
            Retry
          </button>
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <Users size={26} />
          <p className="text-sm">
            {sellers.length === 0 ? "No sellers registered yet." : "No sellers match your search."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Sales</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSellers.map((seller) => (
                <tr
                  key={seller._id}
                  className="border-t border-slate-100 transition-colors hover:bg-rose-50/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DB4444]/10 text-sm font-bold text-[#DB4444]">
                        {seller.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <p className="font-semibold text-slate-800">{seller.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{seller.email}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    ${Number(seller.sales || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        seller.status === "Active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {seller.status || "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemove(seller._id, seller.name)}
                      disabled={removingId === seller._id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {removingId === seller._id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredSellers.length)} of{" "}
              {filteredSellers.length}
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
        </div>
      )}
    </div>
  );
}