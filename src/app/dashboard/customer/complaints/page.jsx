"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  Loader2,
  Store,
  ShieldCheck,
} from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  category: "product",
  priority: "medium",
  sellerName: "",
};

export default function CustomerComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sellerError, setSellerError] = useState(null);
  const [formError, setFormError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [complaintsRes, sellersRes] = await Promise.all([
          fetch("/api/dashboard/customer/complaints", { credentials: "include" }),
          fetch("/api/dashboard/customer/sellers", { credentials: "include" }),
        ]);

        if (complaintsRes.ok) {
          const complaintsData = await complaintsRes.json();
          setComplaints(complaintsData.complaints || []);
        }
        if (sellersRes.ok) {
          const sellersData = await sellersRes.json();
          setSellers(sellersData.sellers || []);
        }
      } catch (error) {
        console.error("Failed to fetch complaints page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // seller must exist before the complaint can go through
  const findSeller = (name) =>
    sellers.find((s) => s.name?.trim().toLowerCase() === name.trim().toLowerCase());

  const handleSellerChange = (value) => {
    setForm((prev) => ({ ...prev, sellerName: value }));
    setSellerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSellerError(null);

    const seller = findSeller(form.sellerName);
    if (!form.sellerName.trim()) {
      setSellerError("Enter the seller you're reporting.");
      return;
    }
    if (!seller) {
      setSellerError("We couldn't find a seller with that name. Pick one from the list.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/customer/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, sellerId: seller._id, sellerName: seller.name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit complaint");
      }

      setComplaints((prev) => [data.complaint, ...prev]);
      setForm(emptyForm);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setFormError(error.message || "Unable to submit complaint");
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] border border-rose-100 bg-linear-to-br from-white to-rose-50/40 p-6 shadow-[0_18px_40px_rgba(219,68,68,0.06)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DB4444]/10 text-[#DB4444]">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#DB4444]">Support</p>
              <h1 className="mt-1 text-3xl font-bold text-slate-900">My Complaints</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
            <AlertTriangle size={15} className="text-[#DB4444]" />
            {complaints.length} complaints
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Submit form */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DB4444]/10 text-[#DB4444]">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Submit complaint</h2>
              <p className="text-sm text-slate-500">Report delivery, product, or service issues.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Issue title"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[#DB4444] focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Store size={14} className="text-slate-400" /> Seller
              </label>
              <select
                required
                value={form.sellerName}
                onChange={(e) => handleSellerChange(e.target.value)}
                className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:bg-white ${
                  sellerError ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-[#DB4444]"
                }`}
              >
                <option value="">Select a seller</option>
                {sellers.map((s) => (
                  <option key={s._id} value={s.name}>{s.name}{s.storeName ? ` (${s.storeName})` : ""}</option>
                ))}
              </select>
              {sellerError ? (
                <p className="mt-1.5 text-xs text-red-500">{sellerError}</p>
              ) : (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                  <ShieldCheck size={12} /> We verify the seller exists before submitting.
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[#DB4444] focus:bg-white"
                >
                  <option value="product">Product</option>
                  <option value="delivery">Delivery</option>
                  <option value="payment">Payment</option>
                  <option value="service">Service</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[#DB4444] focus:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
              <textarea
                required
                rows={6}
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue in detail..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-[#DB4444] focus:bg-white"
              />
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#DB4444] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_25px_rgba(219,68,68,0.25)] transition hover:bg-[#c33a3a] disabled:opacity-60"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? "Submitting..." : "Submit complaint"}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <Clock3 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Recent complaints</h2>
              <p className="text-sm text-slate-500">Your issue history</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={15} className="animate-spin" /> Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              No complaints submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:bg-rose-50/30"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.category} {item.sellerName ? `· ${item.sellerName}` : ""}
                      </p>
                    </div>
                    <span
                      className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${getStatusTone(item.status)}`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Success modal */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setShowSuccess(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle2 size={30} />
            </div>
            <h3 className="mt-3 text-lg font-bold text-slate-900">Complaint submitted!</h3>
            <p className="mt-1 text-sm text-slate-500">The team will review your issue.</p>
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-5 rounded-full bg-[#DB4444] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#c33a3a]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}