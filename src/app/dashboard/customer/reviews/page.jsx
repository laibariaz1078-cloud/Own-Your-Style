"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare, ShieldCheck, Star, Store } from "lucide-react";

const emptyForm = { sellerId: "", rating: "5", comment: "" };

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/customer/reviews", { credentials: "include" }),
      fetch("/api/dashboard/customer/sellers", { credentials: "include" }),
    ])
      .then(async ([reviewsResponse, sellersResponse]) => {
        const reviewsData = await reviewsResponse.json();
        const sellersData = await sellersResponse.json();
        if (!reviewsResponse.ok) throw new Error(reviewsData.error || "Unable to load reviews");
        if (!sellersResponse.ok) throw new Error(sellersData.error || "Unable to load sellers");
        setReviews(reviewsData.reviews || []);
        setSellers(sellersData.sellers || []);
      })
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/dashboard/customer/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit review");
      setReviews((current) => [data.review, ...current]);
      setForm(emptyForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-amber-100 bg-linear-to-br from-white to-amber-50/40 p-6 shadow-[0_18px_40px_rgba(245,158,11,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Star size={20} /></div>
          <div><p className="text-xs font-semibold text-amber-700">Your feedback</p><h1 className="mt-1 text-3xl font-bold text-slate-900">My Reviews</h1></div>
        </div>
      </div>

      {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><MessageSquare size={20} /></div><div><h2 className="text-xl font-bold text-slate-900">Write a review</h2><p className="text-sm text-slate-500">Tell us about your seller experience.</p></div></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700"><span className="mb-1.5 flex items-center gap-1.5"><Store size={14} className="text-slate-400" /> Seller</span><select required value={form.sellerId} onChange={(event) => setForm((current) => ({ ...current, sellerId: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-800 outline-none transition focus:border-[#DB4444] focus:bg-white"><option value="">Select a seller</option>{sellers.map((seller) => <option key={seller._id} value={seller._id}>{seller.name}{seller.storeName ? ` (${seller.storeName})` : ""}</option>)}</select></label>
            <label className="block text-sm font-medium text-slate-700">Rating<select required value={form.rating} onChange={(event) => setForm((current) => ({ ...current, rating: event.target.value }))} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-800 outline-none transition focus:border-[#DB4444] focus:bg-white">{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} {value === 1 ? "star" : "stars"}</option>)}</select></label>
            <label className="block text-sm font-medium text-slate-700">Comment<textarea required rows={6} value={form.comment} onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))} placeholder="Share your experience..." className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-800 outline-none transition focus:border-[#DB4444] focus:bg-white" /></label>
            <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-full bg-[#DB4444] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c33a3a] disabled:opacity-60">{submitting ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />}{submitting ? "Submitting..." : "Submit review"}</button>
          </form>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.04)]"><div className="mb-5 flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"><Star size={20} /></div><div><h2 className="text-xl font-bold text-slate-900">Recent reviews</h2><p className="text-sm text-slate-500">Your submitted feedback</p></div></div>{loading ? <div className="flex items-center gap-2 text-sm text-slate-500"><Loader2 size={15} className="animate-spin" /> Loading reviews...</div> : reviews.length === 0 ? <p className="text-sm text-slate-500">No reviews submitted yet.</p> : <div className="space-y-4">{reviews.map((review) => <div key={review._id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold text-slate-800">{review.sellerId?.storeName || review.sellerId?.firstName || "Seller review"}</p><p className="text-xs text-slate-400">{review.sellerId?.email || ""}</p></div><span className="flex items-center gap-1 text-sm text-amber-500">{review.rating}/5 <Star size={14} className="fill-current" /></span></div><p className="mt-2 text-sm leading-6 text-slate-600">{review.comment}</p>{review.sellerReply && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><strong>Seller reply:</strong> {review.sellerReply}</p>}<p className="mt-3 flex items-center gap-1 text-xs text-slate-400"><ShieldCheck size={12} /> {new Date(review.createdAt).toLocaleDateString()}</p></div>)}</div>}</div>
      </div>
    </div>
  );
}
