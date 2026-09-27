"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import CartTable from "../../components/CartTable";
import CartTotal from "../../components/CartTotal";
import { getProductImage } from "../../lib/productImage";
import { getBuyerOnlyMessage, isBuyerRole } from "../../lib/permissions";
import { showModal } from "../../lib/modal";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [error, setError] = useState("");
  const router = useRouter();
  const loadCart = async () => {
    const response = await fetch("/api/cart");
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to load cart");
    setCart(data.cart);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const authResponse = await fetch("/api/auth/me", { credentials: "include" });
        const authData = await authResponse.json();

        if (!authResponse.ok || !authData?.success || !authData.user) {
          router.replace(`/login?returnTo=${encodeURIComponent("/cart")}`);
          return;
        }

        if (!isBuyerRole(authData.user.role)) {
          await showModal({
            title: "Buyer access required",
            message: getBuyerOnlyMessage(authData.user.role),
          });
          router.replace(authData.user.role === "admin" ? "/dashboard/admin" : authData.user.role === "seller" ? "/dashboard/seller" : "/");
          return;
        }

        await loadCart();
      } catch (loadError) {
        setError(loadError.message || "Unable to load cart");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  const updateQuantity = async (id, quantity) => {
    const response = await fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: id, quantity }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to update quantity");
    setCart(data.cart);
    window.dispatchEvent(new CustomEvent("cart:updated"));
  };

  const removeItem = async (id) => {
    const response = await fetch(`/api/cart?productId=${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to remove item");
    setCart(data.cart);
    window.dispatchEvent(new CustomEvent("cart:updated"));
  };

  const cartItems = (cart?.items || []).map((item) => ({
    id: item.productId?._id || item.productId,
    name: item.productId?.name || "Product",
    image: getProductImage(item.productId),
    price: Number(item.unitPrice?.$numberDecimal || item.unitPrice || item.productId?.basePrice || 0),
    quantity: item.quantity,
  }));
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <TopBar />
      <Navbar />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />

      <main className="mx-auto flex max-w-7xl flex-col gap-20 px-4 py-10 pb-20 sm:px-6 lg:px-20">
        {error && <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</p>}
        {!cart && !error ? <p>Loading cart...</p> : cartItems.length === 0 ? <p className="rounded border border-dashed border-black/20 p-8">Your cart is empty.</p> : <CartTable items={cartItems} onRemoveItem={(id) => removeItem(id).catch((removeError) => setError(removeError.message))} onUpdateQuantity={(id, quantity) => updateQuantity(id, quantity).catch((updateError) => setError(updateError.message))} />}

        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row">
          <div className="flex w-full max-w-md items-center gap-4">
            <input
              type="text"
              placeholder="Coupon Code"
              className="w-full rounded-sm border border-black/50 px-6 py-3 text-base outline-none focus:border-black"
            />
            <button
              type="button"
              className="whitespace-nowrap rounded-sm bg-[#DB4444] px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
            >
              Apply Coupon
            </button>
          </div>

          <div className="w-full max-w-md">
            <CartTotal subtotal={subtotal} ctaLabel="Proceed to checkout" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}