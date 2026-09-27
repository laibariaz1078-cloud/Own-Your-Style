"use client";

import { Star, Heart, Truck, RotateCcw, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { showModal } from "../lib/modal";
import { useAppContext } from "../context/AppContext";
import { getBuyerOnlyMessage, isBuyerRole } from "../lib/permissions";

export default function ProductInfo({
  name = "Havic HV G-92 Gamepad",
  rating = 4,
  reviewCount = 150,
  inStock = true,
  price = 192,
  description = "PlayStation 5 Controller Skin High quality vinyl with air channel adhesive for easy bubble free install & mess free removal Pressure sensitive.",
  colors = ["#A0BCE0", "#E07575"],
  sizes = ["XS", "S", "M", "L", "XL"],
  vendor,
  productId,
}) {
  const router = useRouter();
  const { wishlistIds, toggleWishlistItem, user } = useAppContext();
  const isRestrictedBuyerRole = !!user && !isBuyerRole(user.role);
  const [selectedColor, setSelectedColor] = useState(() => colors?.[0] ?? null);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(2);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [buying, setBuying] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "success" });
  const contextWishlisted = productId ? wishlistIds.includes(String(productId)) : false;
  const isWishlistedState = contextWishlisted || isWishlisted;
  const activeColor = colors?.includes(selectedColor) ? selectedColor : colors?.[0] ?? null;
  const selectedVariantText = [
    activeColor ? `Color: ${activeColor}` : null,
    selectedSize ? `Size: ${selectedSize}` : null,
  ].filter(Boolean).join(" • ");

  const showToast = (message, type = "success") => {
    setToast({ visible: true, message, type });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2200);
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
    window.clearTimeout(showToast.timer);
  };

  const handleBuyNow = async () => {
    if (!productId || buying) return;

    if (user && !isBuyerRole(user.role)) {
      await showModal({
        title: "Buyer access required",
        message: getBuyerOnlyMessage(user.role),
      });
      return;
    }

    setBuying(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          unitPrice: price,
          currency: "USD",
          color: activeColor,
          size: selectedSize,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to add product to cart");
      window.dispatchEvent(new CustomEvent("cart:updated"));

      const checkoutParams = new URLSearchParams({
        productId: String(productId),
        name,
        price: String(price),
        quantity: String(quantity),
        color: activeColor || "",
        size: selectedSize || "",
      });

      router.push(`/checkout?${checkoutParams.toString()}`);
    } catch (error) {
      await showModal({ title: "Unable to continue", message: error.message });
    } finally {
      setBuying(false);
    }
  };

  const handleAddToCart = async () => {
    if (!productId || addingToCart) return;

    if (user && !isBuyerRole(user.role)) {
      await showModal({
        title: "Buyer access required",
        message: getBuyerOnlyMessage(user.role),
      });
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          unitPrice: price,
          currency: "USD",
          color: activeColor,
          size: selectedSize,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to add product to cart");

      window.dispatchEvent(new CustomEvent("cart:updated"));
      showToast(`${name} • ${selectedVariantText || "No variant selected"}`);
    } catch (error) {
      showToast(error.message || "Unable to add to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!productId || wishlistLoading) return;

    if (user && !isBuyerRole(user.role)) {
      await showModal({
        title: "Buyer access required",
        message: getBuyerOnlyMessage(user.role),
      });
      return;
    }

    setWishlistLoading(true);
    try {
      const nextState = await toggleWishlistItem({
        productId: String(productId),
        isCurrentlyWishlisted: isWishlistedState,
      });

      setIsWishlisted(nextState);
    } catch (error) {
      await showModal({
        title: "Unable to save wishlist",
        message: error.message || "Please try again.",
      });
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <>
      {toast.visible && (
        <div
          className={`fixed right-6 top-24 z-[80] max-w-sm rounded-xl border px-4 py-3 text-sm font-medium shadow-[0_20px_40px_rgba(15,23,42,0.16)] backdrop-blur-sm transition-all duration-300 ease-out ${
            toast.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          } animate-[slideInRight_0.28s_ease-out]`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${toast.type === "error" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
              <ShoppingCart className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold">{toast.type === "error" ? "Cart error" : "Added to cart"}</span>
                <button
                  type="button"
                  onClick={hideToast}
                  className="flex h-5 w-5 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Close toast"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-1 leading-relaxed">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <div className="ml-auto flex w-full max-w-[400px] flex-col gap-4 text-black">
        <h1 className="text-2xl font-semibold tracking-wide">{name}</h1>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4"
                fill={i < rating ? "#FFAD33" : "none"}
                stroke={i < rating ? "#FFAD33" : "#D1D5DB"}
              />
            ))}
          </div>
          <span className="text-black/50">({reviewCount} Reviews)</span>
          <span className="h-4 w-px bg-black/30" />
          <span className={inStock ? "text-[#00FF66]" : "text-red-500"}>
            {inStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        <p className="text-2xl font-normal tracking-wide">${price.toFixed(2)}</p>

        {vendor?.name && (
          <p className="text-sm text-black/60">
            Vendor: <span className="font-medium text-black">{vendor.name}</span>
          </p>
        )}

        <p className="border-b border-black/30 pb-6 text-xs leading-relaxed text-black">
          {description}
        </p>

        <div className="flex items-center gap-6 pt-1">
          <span className="text-lg font-normal">Colours:</span>
          <div className="flex items-center gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                aria-label={`Select color ${color}`}
                className={`flex h-5 w-5 items-center justify-center rounded-full transition-all ${
                  activeColor === color ? "ring-2 ring-black ring-offset-2" : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-10">
          <span className="text-lg font-normal">Size:</span>
          <div className="flex items-center gap-3">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`flex h-8 w-8 items-center justify-center rounded border text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? "border-[#DB4444] bg-[#DB4444] text-white"
                    : "border-black/50 bg-white text-black hover:border-[#DB4444]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex w-full items-center justify-between gap-3">
          <div className="flex h-10 items-center overflow-hidden rounded border border-black/50">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-full w-10 items-center justify-center text-xl font-medium hover:bg-[#DB4444] hover:text-white"
            >
              −
            </button>
            <span className="flex h-full w-12 items-center justify-center border-x border-black/50 text-base font-semibold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="flex h-full w-10 items-center justify-center text-xl font-medium hover:bg-[#DB4444] hover:text-white"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!inStock || isRestrictedBuyerRole || buying}
            className="h-10 flex-1 rounded bg-[#DB4444] text-sm font-medium text-white transition-colors hover:bg-[#c33b3b] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:opacity-80"
          >
            {buying ? "Adding..." : "Buy Now"}
          </button>

          <button
            type="button"
            aria-label="Add to cart"
            onClick={handleAddToCart}
            disabled={!inStock || isRestrictedBuyerRole || addingToCart}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-black/50 bg-white text-black transition-colors hover:border-[#DB4444] hover:text-[#DB4444] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Add to wishlist"
            onClick={handleWishlistToggle}
            disabled={wishlistLoading || isRestrictedBuyerRole}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded border transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
              isWishlistedState
                ? "border-[#DB4444] text-[#DB4444]"
                : "border-black/50 hover:border-[#DB4444] hover:text-[#DB4444]"
            }`}
          >
            <Heart className="h-5 w-5" fill={isWishlistedState ? "#DB4444" : "none"} />
          </button>
        </div>

        <div className="mt-4 flex w-full flex-col divide-y divide-black/50 rounded border border-black/50">
          <div className="flex items-center gap-4 p-4">
            <Truck className="h-10 w-10 text-black shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="text-base font-medium">Free Delivery</p>
              <p className="text-xs font-medium text-black underline cursor-pointer">
                Enter your postal code for Delivery Availability
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <RotateCcw className="h-10 w-10 text-black shrink-0" />
            <div className="flex flex-col gap-1">
              <p className="text-base font-medium">Return Delivery</p>
              <p className="text-xs font-medium text-black">
                Free 30 Days Delivery Returns. <span className="underline cursor-pointer">Details</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}