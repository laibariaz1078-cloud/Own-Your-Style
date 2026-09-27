"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function CheckoutSuccessPage() {
  const [status, setStatus] = useState("Confirming your payment...");
  const [error, setError] = useState("");

  // window.location.search → "?session_id=cs_test_a1b2c3..." (URL ka query string part)
  // new URLSearchParams(...) → is string ko parse karke ek object banata hai jisse aap query params easily nikal sakte ho
  // .get("session_id") → us object se session_id ki value nikal leta hai
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      Promise.resolve().then(() => setError("Payment session is missing."));
      return;
    }

    fetch("/api/stripe/checkout-session/complete", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to confirm payment.");
        window.dispatchEvent(new CustomEvent("cart:updated"));
        setStatus("Payment successful. Your order has been placed.");
      })
      .catch((completionError) => setError(completionError.message));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        {error ? (
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-rose-600">!</div>
        ) : status.startsWith("Confirming") ? (
          <Loader2 size={52} className="mx-auto animate-spin text-[#DB4444]" />
        ) : (
          <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
        )}
        <h1 className="mt-5 text-2xl font-bold text-slate-900">{error ? "Payment confirmation failed" : status.startsWith("Confirming") ? "Please wait" : "Thank you"}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{error || status}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/dashboard/customer/orders" className="rounded-lg bg-[#DB4444] px-5 py-2.5 text-sm font-semibold text-white">View orders</Link>
          <Link href="/shop" className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700">Continue shopping</Link>
        </div>
      </div>
    </main>
  );
}
