"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { getBuyerOnlyMessage, isBuyerRole } from "../lib/permissions";
import { showModal } from "../lib/modal";

export default function CartTotal({
  subtotal,
  shipping = "Free",
  ctaLabel,
  href = "/checkout",
}) {
  const total = typeof shipping === "number" ? subtotal + shipping : subtotal;
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(false);
  const { user } = useAppContext();
  const isRestrictedBuyerRole = !!user && !isBuyerRole(user.role);

  const handleContinue = async () => {
    setCheckingAuth(true);
    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });
      if (!response.ok) {
        router.push(`/login?returnTo=${encodeURIComponent(href)}`);
        return;
      }

      const data = await response.json();
      const role = data?.user?.role;
      if (user && !isBuyerRole(user.role)) {
        await showModal({
          title: "Buyer access required",
          message: getBuyerOnlyMessage(user.role),
        });
        return;
      }
      if (role && !isBuyerRole(role)) {
        await showModal({
          title: "Buyer access required",
          message: getBuyerOnlyMessage(role),
        });
        return;
      }
      router.push(href);
    } catch {
      router.push(`/login?returnTo=${encodeURIComponent(href)}`);
    } finally {
      setCheckingAuth(false);
    }
  };

  return (
    <div className="w-full rounded-sm border border-black px-6 py-8">
      <h3 className="mb-6 text-xl font-medium">Cart Total</h3>

      <div className="flex items-center justify-between border-b border-black/20 pb-4 text-base">
        <span>Subtotal:</span>
        <span>${subtotal}</span>
      </div>

      <div className="flex items-center justify-between border-b border-black/20 py-4 text-base">
        <span>Shipping:</span>
        <span>{shipping === "Free" ? "Free" : `$${shipping}`}</span>
      </div>

      <div className="flex items-center justify-between py-4 text-base">
        <span>Total:</span>
        <span>${total}</span>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={handleContinue}
          disabled={checkingAuth || isRestrictedBuyerRole}
          className="rounded-sm bg-[#DB4444] px-12 py-4 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:opacity-80"
        >
          {checkingAuth ? "Checking..." : ctaLabel}
        </button>
      </div>
    </div>
  );
}