"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getProductImage } from "../lib/productImage";

export default function OrderSummary({ items = [], billingDetails = {} }) {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [status, setStatus] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showStripeConfirm, setShowStripeConfirm] = useState(false);
  const router = useRouter();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const startStripeCheckout = async () => {
    setStatus("Redirecting to Stripe...");
    try {
      const response = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingDetails }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to start Stripe checkout");
      window.location.href = data.url;
    } catch (error) {
      setStatus(error.message);
      setShowStripeConfirm(false);
    }
  };

  const placeOrder = async () => {
    const requiredFields = ["firstName", "streetAddress", "city", "phone", "email"];
    if (requiredFields.some((field) => !billingDetails[field]?.trim())) {
      setStatus("Please complete all required billing details.");
      return;
    }
    if (paymentMethod === "stripe") {
      setShowStripeConfirm(true);
      setStatus("");
      return;
    }

    setStatus("Placing order...");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: billingDetails,
          billingAddress: billingDetails,
          payment: { method: "cash_on_delivery" },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to place order");
      window.dispatchEvent(new CustomEvent("cart:updated"));
      setStatus("");
      setConfirmedOrder(data.order);
    } catch (error) {
      setStatus(error.message);
    }
  };

  const closeModal = () => {
    setConfirmedOrder(null);
    router.push("/dashboard/customer/orders");
  };

  return (
    <div className="flex w-full flex-col gap-8 lg:max-w-md lg:pt-12">
      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Image
                src={getProductImage(item)}
                alt={item.name}
                width={48}
                height={48}
                unoptimized
                className="h-12 w-12 object-contain"
              />
              <span className="text-base text-black">{item.name}</span>
            </div>
            <span className="text-base font-normal text-black">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 border-b border-black/20 pb-4">
        <div className="flex items-center justify-between text-base text-black">
          <span>Subtotal:</span>
          <span>${subtotal}</span>
        </div>
        <div className="flex items-center justify-between text-base text-black border-t border-black/20 pt-4">
          <span>Shipping:</span>
          <span>Free</span>
        </div>
        <div className="flex items-center justify-between text-base font-normal text-black border-t border-black/20 pt-4">
          <span>Total:</span>
          <span>${subtotal}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex cursor-pointer items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="payment"
              value="stripe"
              checked={paymentMethod === "stripe"}
              onChange={() => setPaymentMethod("stripe")}
              className="h-5 w-5 accent-black"
            />
            <span className="text-base text-black">Pay with Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/cards.png" alt="Visa" width={96} height={24} className="h-6 w-24" />
          </div>
        </label>

        <label className="flex cursor-pointer items-center gap-4">
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={paymentMethod === "cod"}
            onChange={() => setPaymentMethod("cod")}
            className="h-5 w-5 accent-black"
          />
          <span className="text-base text-black">Cash on delivery</span>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Coupon Code"
          className="w-full rounded border border-black/50 px-6 py-3 text-base outline-none focus:border-black"
        />
        <button className="whitespace-nowrap rounded bg-[#DB4444] px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90">
          Apply Coupon
        </button>
      </div>

      <div>
        <button onClick={placeOrder} disabled={!items.length || status === "Placing order..."} className="w-fit rounded bg-[#DB4444] px-12 py-3 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
          Place Order
        </button>
        {status && <p className="mt-3 text-sm text-slate-600">{status}</p>}
      </div>

      {showStripeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-black">Continue to Stripe?</h2>
            <p className="mt-3 text-base text-slate-700">You selected Stripe as your payment method. You will be redirected to Stripe to complete your payment securely.</p>
            <p className="mt-4 text-sm text-slate-600">Order total: <span className="font-semibold text-black">${subtotal}</span></p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setShowStripeConfirm(false)} className="flex-1 rounded border border-slate-300 px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" onClick={startStripeCheckout} className="flex-1 rounded bg-[#DB4444] px-4 py-3 text-base font-medium text-white transition-opacity hover:opacity-90">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-black">Order Confirmed</h2>
            <p className="mt-3 text-base text-slate-700">Your order is on the way.</p>
            <p className="mt-4 text-sm text-slate-600">Order Number: <span className="font-semibold text-black">{confirmedOrder.orderNumber}</span></p>
            <p className="mt-1 text-sm text-slate-600">Tracking Number: <span className="font-semibold text-black">{confirmedOrder.trackingNumber}</span></p>
            <p className="mt-4 text-xs text-slate-500">A confirmation email has also been sent to you.</p>
            <button onClick={closeModal} className="mt-6 w-full rounded bg-[#DB4444] px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90">
              View My Orders
            </button>
          </div>
        </div>
      )}
    </div>
  );
}