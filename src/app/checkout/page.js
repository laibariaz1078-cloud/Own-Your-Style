"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import BillingForm from "../../components/BillingForm";
import OrderSummary from "../../components/OrderSummary";
import { getProductImage } from "../../lib/productImage";
import { getBuyerOnlyMessage, isBuyerRole } from "../../lib/permissions";
import { showModal } from "../../lib/modal";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");
  const [billingDetails, setBillingDetails] = useState({});

  useEffect(() => {
    let isCurrent = true;

    const timer = setTimeout(async () => {
      try {
        const authResponse = await fetch("/api/auth/me", { credentials: "include" });
        const authData = await authResponse.json();

        if (!authResponse.ok || !authData?.success || !authData.user) {
          router.replace(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
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

        if (isCurrent) setCheckingAuth(false);
      } catch {
        router.replace(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }

      const buyNowName = searchParams.get("name");
      const buyNowPrice = searchParams.get("price");

      if (buyNowName && buyNowPrice) {
        if (!isCurrent) return;
        setOrderItems([{
          id: searchParams.get("productId") || buyNowName,
          name: buyNowName,
          image: getProductImage({ image: searchParams.get("image") }),
          price: Number(buyNowPrice) || 0,
          quantity: Number(searchParams.get("quantity")) || 1,
          color: searchParams.get("color") || undefined,
          size: searchParams.get("size") || undefined,
        }]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/cart");
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load cart");
        if (!isCurrent) return;
        setOrderItems((data.cart?.items || []).map((item) => ({
          id: item.productId?._id || item.productId,
          name: item.productId?.name || "Product",
          image: getProductImage(item.productId),
          price: Number(item.unitPrice?.$numberDecimal || item.unitPrice || item.productId?.basePrice || 0),
          quantity: item.quantity,
        })));
      } catch (loadError) {
        if (isCurrent) setError(loadError.message);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }, 0);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <TopBar />
      <Navbar />

      <Breadcrumb
        items={[
          { label: "Account", href: "/account" },
          { label: "My Account", href: "/account" },
          { label: "Product", href: "/" },
          { label: "View Cart", href: "/cart" },
          { label: "CheckOut" },
        ]}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-20">
        {checkingAuth ? <p>Checking your account...</p> : (
        <div className="grid grid-cols-1 gap-16 pb-20 lg:grid-cols-2 lg:gap-28">
          <BillingForm values={billingDetails} onChange={(name, value) => setBillingDetails((previous) => ({ ...previous, [name]: value }))} />
          {loading ? <p>Loading order summary...</p> : error ? <p className="text-sm text-red-600">{error}</p> : <OrderSummary items={orderItems} billingDetails={billingDetails} />}
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white p-10 text-black">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}