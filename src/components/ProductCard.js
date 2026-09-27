"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, Eye, Star, ShoppingCart } from "lucide-react";
import { getProductImage } from "../lib/productImage";
import { useAppContext } from "../context/AppContext";
import { isBuyerRole, getBuyerOnlyMessage } from "../lib/permissions";
import { showModal } from "../lib/modal";

const makeSlug = (value) =>
  String(value || "product")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "product";

export default function ProductCard({ product, onWishlistChange }) {
  const {
    name,
    image: productImage,
    images,
    slug,
    price,
    oldPrice,
    discountPercent,
    rating = 5,
    reviewCount = 0,
    isNew,
    colors,
    addToCartVisible = true,
    isWishlisted = false,
  } = product;

  const productId = product._id || product.id;

  const [isLiked, setIsLiked] = useState(isWishlisted);
  const [isHeartHovered, setIsHeartHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(() => colors?.[0] || null);
  const [cartMessage, setCartMessage] = useState("");
  const [cartPending, setCartPending] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [wishlistPending, setWishlistPending] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const toastTimerRef = useRef(null);
  const router = useRouter();
  const { refreshCartCount, wishlistIds, toggleWishlistItem, user } = useAppContext();
  const productIdValue = String(productId || "");
  const contextWishlisted = productIdValue ? wishlistIds.includes(productIdValue) : false;
  const isLikedState = contextWishlisted || isLiked;
  const isRestrictedBuyerRole = !!user && !isBuyerRole(user.role);

  const productSlug = slug || makeSlug(name);
  const image = getProductImage({ ...product, image: productImage, images });
  const validImageSrc =
    image &&
    (image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("/"))
      ? image
      : "/product1.png";
  const activeColor = colors?.includes(selectedColor) ? selectedColor : colors?.[0] || null;

  const handleActionClick = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    if (callback) callback();
  };

  const showToast = (message, duration = 1800) => {
    setToastMessage(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(""), duration);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleWishlistToggle = async () => {
    if (!productIdValue || wishlistPending) return;

    if (user && !isBuyerRole(user.role)) {
      await showModal({
        title: "Buyer access required",
        message: getBuyerOnlyMessage(user.role),
      });
      return;
    }

    setWishlistPending(true);
    try {
      const nextState = await toggleWishlistItem({
        productId: productIdValue,
        isCurrentlyWishlisted: isLiked,
      });

      setIsLiked(nextState);
      setWishlistMessage(nextState ? "Saved" : "Removed");
      onWishlistChange?.(productIdValue, nextState);

      if (nextState) {
        showToast("Saved to wishlist");
      } else {
        showToast("Removed from wishlist");
      }

      setTimeout(() => setWishlistMessage(""), 1600);
    } catch (error) {
      setWishlistMessage(error.message || "Unable to update wishlist");
      setTimeout(() => setWishlistMessage(""), 2200);
    } finally {
      setWishlistPending(false);
    }
  };

  const addProductToCart = async () => {
    if (user && !isBuyerRole(user.role)) {
      await showModal({
        title: "Buyer access required",
        message: getBuyerOnlyMessage(user.role),
      });
      return;
    }

    setCartPending(true);
    setCartMessage("Adding...");

    try {
      if (!user) {
        const guestItems = JSON.parse(localStorage.getItem("guest_cart_items") || "[]");
        const existingItem = guestItems.find((item) => String(item.productId) === String(productId));
        const nextItems = existingItem
          ? guestItems.map((item) => String(item.productId) === String(productId)
              ? { ...item, quantity: Number(item.quantity || 0) + 1 }
              : item)
          : [...guestItems, { productId: String(productId), quantity: 1 }];

        localStorage.setItem("guest_cart_items", JSON.stringify(nextItems));
        window.dispatchEvent(new CustomEvent("cart:updated"));
        await refreshCartCount();
        setCartMessage("Added");
        showToast("Added to cart");
        setTimeout(() => setCartMessage(""), 1800);
        return;
      }

      const response = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1, unitPrice: product.basePrice ?? price }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to add to cart");
      window.dispatchEvent(new CustomEvent("cart:updated"));
      await refreshCartCount();
      setCartMessage("Added");
      showToast("Added to cart");
      setTimeout(() => setCartMessage(""), 1800);
    } catch (error) {
      setCartMessage(error.message);
      setTimeout(() => setCartMessage(""), 2500);
    } finally {
      setCartPending(false);
    }
  };

  return (
    <div className="group w-full">
      <Link href={`/product/${productSlug}`} className="block">
        <div className="relative flex h-[230px] w-[250px] items-center justify-center overflow-hidden  bg-[#F5F5F5] p-3">
          <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
            {discountPercent > 0 && (
              <span className="rounded bg-[#DB4444] px-2.5 py-1 text-[12px] font-normal text-white">
                -{discountPercent}%
              </span>
            )}
            {isNew && (
              <span className="rounded bg-[#00FF66] px-2.5 py-1 text-[12px] font-medium text-black">
                NEW
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button
              type="button"
              aria-label="Add to wishlist"
              disabled={wishlistPending || isRestrictedBuyerRole}
              onClick={(e) => handleActionClick(e, handleWishlistToggle)}
              onMouseEnter={() => setIsHeartHovered(true)}
              onMouseLeave={() => setIsHeartHovered(false)}
              className={`flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white transition-all duration-200 hover:bg-[#DB4444] disabled:cursor-not-allowed disabled:opacity-40 ${
                isLikedState ? "text-[#DB4444]" : "text-black"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${
                  isHeartHovered
                    ? "fill-current text-white"
                    : isLikedState
                    ? "fill-[#DB4444] text-[#DB4444]"
                    : "text-black"
                }`}
              />
            </button>

            <button
              type="button"
              aria-label="Quick view"
              onClick={(e) => handleActionClick(e)}
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white text-black transition-all duration-200 hover:bg-[#DB4444] hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>

          <div className="relative h-[150px] w-full">
            <Image
              src={validImageSrc}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, 250px"
              className="object-contain p-2 mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {addToCartVisible && (
            <button
              type="button"
              onClick={(e) => handleActionClick(e, addProductToCart)}
              disabled={isRestrictedBuyerRole || cartPending}
              className="absolute inset-x-0 bottom-0 z-20 flex h-9 w-full items-center justify-center bg-black text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:opacity-100"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              {cartPending ? "Adding..." : cartMessage || "Add To Cart"}
            </button>
          )}

          {wishlistMessage && (
            <div className="absolute inset-x-0 bottom-10 z-20 flex justify-center">
              <span className="rounded bg-black/80 px-2 py-1 text-[10px] font-medium text-white">
                {wishlistMessage}
              </span>
            </div>
          )}
        </div>
      </Link>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[60] rounded-lg bg-[#DB4444] px-4 py-2 text-sm font-medium text-white shadow-lg">
          {toastMessage}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-1">
        <Link
          href={`/product/${productSlug}`}
          className="line-clamp-1 text-sm font-medium text-black hover:text-[#DB4444]"
        >
          {name}
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#DB4444]">${price}</span>
          {Number(oldPrice) > 0 && (
            <span className="text-sm font-medium text-gray-500 line-through">
              ${oldPrice}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5"
                fill={i < rating ? "#FFAD33" : "#D1D5DB"}
                stroke="none"
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-500">
            ({reviewCount})
          </span>
        </div>

        {colors && colors.length > 0 && (
          <div className="flex items-center gap-1.5 pt-1">
            {colors.map((color, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Select color ${color}`}
                title={color}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                className={`h-4 w-4 rounded-full border border-black p-[2px] transition-all ${
                  activeColor === color ? "ring-2 ring-[#DB4444] ring-offset-1" : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}