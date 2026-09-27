"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Star, Trash2, X } from "lucide-react";
import { showModal } from "../../../../lib/modal";

const emptyForm = { customerId: "", sellerId: "", rating: "5", comment: "", sellerReply: "" };

const displayName = (user) => `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || user?.email || "User";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [reviewsResponse, usersResponse] = await Promise.all([
        fetch("/api/dashboard/admin/reviews", { credentials: "include" }),
        fetch("/api/dashboard/admin/users", { credentials: "include" }),
      ]);
      const reviewsData = await reviewsResponse.json();
      const usersData = await usersResponse.json();
      if (!reviewsResponse.ok) throw new Error(reviewsData.error || "Unable to load reviews");
      setReviews(reviewsData.reviews || []);
      setCustomers(usersData.customers || []);
      setSellers(usersData.sellers || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadData, 0);
    return () => clearTimeout(timer);
  }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(editingId ? `/api/dashboard/admin/reviews/${editingId}` : "/api/dashboard/admin/reviews", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save review");
      resetForm();
      await loadData();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const editReview = (review) => {
    setEditingId(review._id);
    setForm({ customerId: review.customerId?._id || "", sellerId: review.sellerId?._id || "", rating: String(review.rating), comment: review.comment || "", sellerReply: review.sellerReply || "" });
  };

  const deleteReview = async (review) => {
    if (!(await showModal({ type: "confirm", title: "Delete review", message: "Delete this review?", confirmLabel: "Delete" }))) return;
    const response = await fetch(`/api/dashboard/admin/reviews/${review._id}`, { method: "DELETE", credentials: "include" });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Unable to delete review");
    else setReviews((current) => current.filter((item) => item._id !== review._id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-[#DB4444]">Moderation</p><h1 className="mt-2 text-3xl font-bold text-slate-900">All Reviews</h1></div><div className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">{reviews.length} reviews</div></div>
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit review" : "Create review"}</h2>{editingId && <button type="button" onClick={resetForm} aria-label="Cancel editing"><X size={18} /></button>}</div>
          {!editingId && <><label className="block text-sm font-medium text-slate-700">Customer<select required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal"><option value="">Select customer</option>{customers.map((user) => <option key={user._id} value={user._id}>{displayName(user)} ({user.email})</option>)}</select></label><label className="block text-sm font-medium text-slate-700">Seller<select required value={form.sellerId} onChange={(e) => setForm({ ...form, sellerId: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal"><option value="">Select seller</option>{sellers.map((user) => <option key={user._id} value={user._id}>{displayName(user)} ({user.email})</option>)}</select></label></>}
          <label className="block text-sm font-medium text-slate-700">Rating<select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-normal">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}/5</option>)}</select></label><label className="block text-sm font-medium text-slate-700">Review<textarea required value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={4} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><label className="block text-sm font-medium text-slate-700">Seller reply<textarea value={form.sellerReply} onChange={(e) => setForm({ ...form, sellerReply: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 font-normal" /></label><button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#DB4444] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{editingId ? "Update review" : "Create review"}</button>
        </form>
        <div className="space-y-4">{loading ? <div className="rounded-2xl bg-white p-8 text-slate-500">Loading reviews...</div> : reviews.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-slate-500">No reviews yet.</div> : reviews.map((review) => <div key={review._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="font-semibold text-slate-900">{displayName(review.customerId)} <span className="font-normal text-slate-400">({review.customerId?.email || ""})</span></p><p className="text-sm text-slate-600">Seller: {displayName(review.sellerId)} <span className="text-slate-400">({review.sellerId?.email || ""})</span></p><div className="mt-2 flex items-center gap-1 text-amber-500">{[1, 2, 3, 4, 5].map((value) => <Star key={value} size={15} className={value <= review.rating ? "fill-current" : "text-slate-300"} />)}</div></div><div className="flex gap-1"><button onClick={() => editReview(review)} aria-label="Edit review" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil size={16} /></button><button onClick={() => deleteReview(review)} aria-label="Delete review" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></div></div><p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>{review.sellerReply && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><strong>Seller reply:</strong> {review.sellerReply}</p>}</div>)}</div>
      </div>
    </div>
  );
}
