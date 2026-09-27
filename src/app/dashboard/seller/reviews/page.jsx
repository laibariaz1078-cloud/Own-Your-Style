"use client";

import { useEffect, useState } from "react";
import { Star, Truck, ShieldCheck } from "lucide-react";
import { showModal } from "../../../../lib/modal";

export default function SellerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState("0.0");
  const [loading, setLoading] = useState(true);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [savingReply, setSavingReply] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch("/api/dashboard/seller/reviews", { credentials: "include" });
        const data = await res.json();
        setReviews(data.reviews || []);
        setAverageRating(data.averageRating || "0.0");
      } catch (error) {
        console.error("Failed to load reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const saveReply = async (reviewId) => {
    const sellerReply = (replyDrafts[reviewId] || "").trim();
    if (!sellerReply) return;
    setSavingReply(reviewId);
    try {
      const response = await fetch("/api/dashboard/seller/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reviewId, sellerReply }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save reply");
      setReviews((current) => current.map((review) => review._id === reviewId ? { ...review, ...data.review } : review));
    } catch (error) {
      await showModal({ title: "Reply failed", message: error.message });
    } finally {
      setSavingReply(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Seller insights</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Customer Reviews</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700">
          <Star size={16} className="fill-current" />
          Average rating: {averageRating}/5
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-500">
          No reviews yet.
        </div>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700">
                    {review.customerName?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{review.customerName}</p>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-600">{review.productName}</p>
                    <div className="mt-2 flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} size={16} className={index < review.rating ? "fill-current" : "text-slate-300"} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                    <Truck size={12} /> {review.deliveryStatus}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                    <ShieldCheck size={12} /> Verified order
                  </span>
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">{review.comment}</p>
              {review.sellerReply && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900"><strong>Your reply:</strong> {review.sellerReply}</p>}
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  value={replyDrafts[review._id] ?? review.sellerReply ?? ""}
                  onChange={(event) => setReplyDrafts((current) => ({ ...current, [review._id]: event.target.value }))}
                  placeholder="Reply to this customer..."
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#DB4444]"
                />
                <button type="button" onClick={() => saveReply(review._id)} disabled={savingReply === review._id} className="rounded-lg bg-[#DB4444] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {savingReply === review._id ? "Saving..." : "Reply"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
