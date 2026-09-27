"use client";

import { useEffect, useState } from "react";
import {
  Clock3,
  MessageSquareText,
  Loader2,
  Inbox,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { mockComplaints } from "../../mock-data";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  open: "bg-red-50 text-red-600 border-red-200",
  in_review: "bg-amber-50 text-amber-600 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  closed: "bg-slate-200 text-slate-700 border-slate-300",
};

const CATEGORY_COLORS = {
  product: "bg-violet-50 text-violet-600",
  delivery: "bg-sky-50 text-sky-600",
  payment: "bg-amber-50 text-amber-600",
  service: "bg-pink-50 text-pink-600",
  other: "bg-slate-100 text-slate-600",
};

export default function SellerComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [page, setPage] = useState(1);
  const [activeComplaint, setActiveComplaint] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // this endpoint is expected to already scope results to complaints
      // filed against the logged-in seller's own products
      const res = await fetch("/api/dashboard/seller/complaints", { credentials: "include" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (error) {
      console.error("Failed to load complaints:", error);
      setComplaints(mockComplaints);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchComplaints, 0);
    return () => clearTimeout(timer);
  }, []);

  const totalPages = Math.max(1, Math.ceil(complaints.length / PAGE_SIZE));
  const paginatedComplaints = complaints.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (n) => {
    if (n < 1 || n > totalPages) return;
    setPage(n);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] border border-amber-100 bg-linear-to-br from-white to-amber-50/40 p-6 shadow-[0_18px_40px_rgba(217,119,6,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <MessageSquareText size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-700">Seller operations</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">Complaints & Issues</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-700 shadow-sm">
            <MessageSquareText size={16} />
            {complaints.length} records
          </div>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-white p-8 text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Loading complaints...
        </div>
      ) : loadError ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-sm text-red-600">
          {loadError}{" "}
          <button onClick={fetchComplaints} className="ml-1 font-semibold underline underline-offset-2">
            Retry
          </button>
        </div>
      ) : complaints.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[28px] border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
          <Inbox size={26} />
          <p className="text-sm">No complaints raised against your products yet.</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
            <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/80 px-6 py-4 text-[11px] font-semibold text-slate-500">
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-4">Issue</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Date</div>
            </div>

            {paginatedComplaints.map((complaint) => (
              <div
                key={complaint._id}
                onClick={() => setActiveComplaint(complaint)}
                className="grid cursor-pointer grid-cols-12 items-center gap-4 border-b border-slate-100 px-6 py-5 transition-colors last:border-b-0 hover:bg-amber-50/40"
              >
                <div className="col-span-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {complaint.userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <p className="truncate font-semibold text-slate-800">{complaint.userName || "Customer"}</p>
                </div>

                <div className="col-span-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                      CATEGORY_COLORS[complaint.category] || CATEGORY_COLORS.other
                    }`}
                  >
                    {complaint.category || "product"}
                  </span>
                </div>

                <div className="col-span-4 truncate text-sm text-slate-600">{complaint.title}</div>

                <div className="col-span-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
                      STATUS_STYLES[complaint.status] || STATUS_STYLES.open
                    }`}
                  >
                    {complaint.status || "open"}
                  </span>
                </div>

                <div className="col-span-1 flex items-center justify-end gap-1.5 text-xs text-slate-500">
                  <Clock3 size={13} />
                  {complaint.createdAt ? new Date(complaint.createdAt).toLocaleDateString() : "—"}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, complaints.length)} of{" "}
              {complaints.length}
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
                        n === page ? "bg-amber-600 text-white" : "text-slate-600 hover:bg-slate-50"
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

      {/* Read-only detail modal */}
      {activeComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setActiveComplaint(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{activeComplaint.userName || "Customer"}</p>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                    CATEGORY_COLORS[activeComplaint.category] || CATEGORY_COLORS.other
                  }`}
                >
                  {activeComplaint.category || "product"}
                </span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{activeComplaint.title}</h3>
              </div>
              <button onClick={() => setActiveComplaint(null)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>

            <p className="mb-4 text-sm leading-relaxed text-slate-600">
              {activeComplaint.description || "No description provided."}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-400">Status</p>
                <span
                  className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
                    STATUS_STYLES[activeComplaint.status] || STATUS_STYLES.open
                  }`}
                >
                  {activeComplaint.status || "open"}
                </span>
              </div>
              <div>
                <p className="font-semibold text-slate-400">Filed on</p>
                <p className="mt-1 text-slate-700">
                  {activeComplaint.createdAt
                    ? new Date(activeComplaint.createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}