"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Trash2,
  CheckCircle2,
  Loader2,
  Sparkles,
  Inbox,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { mockComplaints } from "../../mock-data";
import { showModal } from "../../../../lib/modal";

const PAGE_SIZE = 10;

const STATUS_FLOW = ["open", "in_review", "resolved", "closed"];

const STATUS_LABELS = {
  open: "Open",
  in_review: "In review",
  resolved: "Resolved",
  closed: "Closed",
};

const CATEGORY_COLORS = {
  product: "bg-violet-50 text-violet-600",
  delivery: "bg-sky-50 text-sky-600",
  payment: "bg-amber-50 text-amber-600",
  service: "bg-pink-50 text-pink-600",
  other: "bg-slate-100 text-slate-600",
};

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [page, setPage] = useState(1);

  const [activeComplaint, setActiveComplaint] = useState(null);
  const [draftStatus, setDraftStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [justSaved, setJustSaved] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/dashboard/admin/complaints", { credentials: "include" });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch (error) {
      console.error("Failed to fetch complaints:", error);
      setComplaints(mockComplaints);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchComplaints, 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredComplaints = complaints.filter((item) => {
    const search = query.toLowerCase();
    return (
      item.title?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.category?.toLowerCase().includes(search) ||
      item.userName?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredComplaints.length / PAGE_SIZE));
  const paginatedComplaints = filteredComplaints.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (n) => {
    if (n < 1 || n > totalPages) return;
    setPage(n);
  };

  const getStatusTone = (status) => {
    const map = {
      open: "bg-red-50 text-red-600 border-red-200",
      in_review: "bg-amber-50 text-amber-600 border-amber-200",
      resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
      closed: "bg-slate-200 text-slate-700 border-slate-300",
    };
    return map[status] || map.open;
  };

  const markSeen = async (item) => {
    if (item.seen) return;
    setComplaints((prev) => prev.map((c) => (c._id === item._id ? { ...c, seen: true } : c)));
    try {
      await fetch(`/api/dashboard/admin/complaints/${item._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seen: true }),
      });
    } catch (error) {
      console.error("Failed to mark complaint as seen:", error);
    }
  };

  const openComplaint = (item) => {
    setActiveComplaint(item);
    setDraftStatus(item.status || "open");
    setSaveError(null);
    setJustSaved(false);
    markSeen(item);
  };

  const closeModal = () => {
    setActiveComplaint(null);
    setDraftStatus(null);
    setSaveError(null);
    setJustSaved(false);
  };

  const saveStatus = async () => {
    if (!activeComplaint) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch(`/api/dashboard/admin/complaints/${activeComplaint._id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: draftStatus }),
      });
      if (!res.ok) throw new Error(`Update failed (${res.status})`);

      setComplaints((prev) =>
        prev.map((c) => (c._id === activeComplaint._id ? { ...c, status: draftStatus } : c))
      );
      setActiveComplaint((prev) => (prev ? { ...prev, status: draftStatus } : prev));
      setJustSaved(true);
    } catch (error) {
      console.error("Failed to update complaint:", error);
      setSaveError("Couldn't save that change. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    if (!(await showModal({ type: "confirm", title: "Delete complaint", message: `Delete complaint from ${item.userName || "this customer"}?`, confirmLabel: "Delete" }))) return;

    try {
      const res = await fetch(`/api/dashboard/admin/complaints/${item._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Delete failed");

      setComplaints((prev) => prev.filter((c) => c._id !== item._id));
      if (activeComplaint?._id === item._id) closeModal();
    } catch (error) {
      console.error("Failed to delete complaint:", error);
      await showModal({ title: "Delete failed", message: "Unable to delete this complaint right now." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] border border-rose-100 bg-linear-to-br from-white to-rose-50/40 p-6 shadow-[0_18px_40px_rgba(219,68,68,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DB4444]/10 text-[#DB4444]">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#DB4444]">Operations</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">Complaints Center</h1>
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
              placeholder="Search complaint..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
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
      ) : filteredComplaints.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[28px] border border-slate-200 bg-white p-12 text-center text-slate-400">
          <Inbox size={28} />
          <p className="text-sm">No complaints match your search.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {paginatedComplaints.map((item) => (
              <div
                key={item._id}
                onClick={() => openComplaint(item)}
                className={`group relative cursor-pointer rounded-3xl border bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(219,68,68,0.1)] ${
                  item.seen ? "border-slate-200" : "border-[#DB4444]/30"
                }`}
              >
                {/* new/seen indicator */}
                <div className="absolute right-5 top-5">
                  {item.seen ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                      <CheckCircle2 size={12} /> Seen
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#DB4444]/10 px-2 py-0.5 text-[11px] font-semibold text-[#DB4444]">
                      <Circle size={7} className="fill-[#DB4444] text-[#DB4444]" /> New
                    </span>
                  )}
                </div>

                {/* customer name + role */}
                <div className="flex items-center gap-3 pr-16">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DB4444]/10 text-sm font-bold text-[#DB4444]">
                    {item.userName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-800">{item.userName || "Customer"}</p>
                    <p className="text-xs capitalize text-slate-400">{item.userRole === "customer" ? "buyer" : item.userRole || "buyer"}</p>
                  </div>
                </div>

                {/* complaint text */}
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.description}</p>
                </div>

                {/* footer: badges + trash */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${
                        CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other
                      }`}
                    >
                      {item.category || "product"}
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${getStatusTone(item.status)}`}
                    >
                      {STATUS_LABELS[item.status] || "Open"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, item)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500"
                    title="Delete complaint"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredComplaints.length)} of{" "}
              {filteredComplaints.length}
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

      {/* Detail / update modal */}
      {activeComplaint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {justSaved ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Submitted!</h3>
                <p className="text-sm text-slate-500">
                  The complaint status was updated to{" "}
                  <span className="font-semibold text-slate-700">{STATUS_LABELS[draftStatus]}</span>.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-2 rounded-full bg-[#DB4444] px-5 py-2 text-sm font-semibold text-white hover:bg-[#c93b3b]"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{activeComplaint.userName || "Customer"}</p>
                    <p className="text-[11px] capitalize text-slate-400">{activeComplaint.userRole === "customer" ? "buyer" : activeComplaint.userRole || "buyer"}</p>
                    <span
                      className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                        CATEGORY_COLORS[activeComplaint.category] || CATEGORY_COLORS.other
                      }`}
                    >
                      {activeComplaint.category || "product"}
                    </span>
                    <h3 className="mt-2 text-lg font-bold text-slate-900">{activeComplaint.title}</h3>
                  </div>
                  <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  {activeComplaint.description || "No description provided."}
                </p>

                <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-400">Filed on</p>
                    <p className="mt-0.5 text-slate-700">
                      {activeComplaint.createdAt
                        ? new Date(activeComplaint.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-400">Priority</p>
                    <p className="mt-0.5 capitalize text-slate-700">{activeComplaint.priority || "medium"}</p>
                  </div>
                </div>

                <label className="mb-1 block text-xs font-semibold text-slate-500">Status</label>
                <select
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value)}
                  className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#DB4444]/40"
                >
                  {STATUS_FLOW.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>

                {saveError && <p className="mb-3 text-xs text-red-500">{saveError}</p>}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={(e) => handleDelete(e, activeComplaint)}
                    className="mr-auto inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                  <button
                    onClick={closeModal}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveStatus}
                    disabled={saving || draftStatus === activeComplaint.status}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#DB4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c93b3b] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    Save changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}