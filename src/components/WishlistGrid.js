"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, LoaderCircle, ShoppingCart, Trash2 } from "lucide-react";
import { getProductStock, LOW_STOCK_THRESHOLD } from "../lib/cartHelpers";

export default function WishlistGrid({ products = [], onRemove, onAddToCart, addedProductIds = [], pendingProductId = null, isRestrictedBuyerRole = false }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-90 flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-14 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#DB4444]">
          <Heart className="h-8 w-8" strokeWidth={1.6} />
        </div>
        <h2 className="text-xl font-semibold text-neutral-900">Your wishlist is empty</h2>
        <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-500">Save the pieces you love and they will be waiting for you here.</p>
        <Link href="/shop" className="mt-6 inline-flex items-center justify-center rounded-lg bg-[#DB4444] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c93636] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB4444] focus-visible:ring-offset-2 active:scale-[0.98]">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => {
        const productId = String(product.id || product._id || product.productId || "");
        const image = product.image || product.images?.[0]?.url || "/product1.png";
        const price = product.price ?? product.basePrice ?? 0;
        const isAdded = productId ? addedProductIds.includes(productId) : false;
        const isPending = pendingProductId && String(pendingProductId) === productId;
        const inventory = getProductStock(product);
        const isOutOfStock = inventory === 0;
        const isLowStock = inventory != null && inventory > 0 && inventory <= LOW_STOCK_THRESHOLD;
        const stockLabel = inventory == null ? "Availability unavailable" : isOutOfStock ? "Out of stock" : isLowStock ? `Low stock - ${inventory} left` : "In stock";
        const stockStyles = inventory == null
          ? "bg-neutral-100 text-neutral-600"
          : isOutOfStock
          ? "bg-red-50 text-red-700"
          : isLowStock
            ? "bg-orange-50 text-orange-700"
            : "bg-green-50 text-green-700";

        return (
          <article key={productId || product.name} className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg">
            <div className="relative flex aspect-[1.18] w-full items-center justify-center bg-neutral-50 p-5 sm:aspect-square">
              {product.discountPercent > 0 && (
                <span className="absolute left-3 top-3 z-10 rounded-md bg-[#DB4444] px-2.5 py-1 text-xs font-semibold text-white">
                  -{product.discountPercent}%
                </span>
              )}

              <button
                type="button"
                onClick={() => onRemove && onRemove(product.id || product._id || product.productId)}
                aria-label={`Remove ${product.name || "item"} from wishlist`}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-[#DB4444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB4444]"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.8} />
              </button>

              <div className="relative h-full w-full transition-transform duration-300 group-hover:scale-[1.03]">
                <Image
                  src={image}
                  alt={product.name || "Wishlist product"}
                  fill
                  unoptimized={String(image).startsWith("http")}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  className="object-contain"
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="line-clamp-2 min-h-12 text-sm font-semibold leading-6 text-neutral-900 sm:text-base">{product.name}</h3>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-lg font-bold text-[#DB4444]">${Number(price).toFixed(2)}</span>
                {product.oldPrice > 0 && (
                  <span className="text-sm text-neutral-400 line-through">${Number(product.oldPrice).toFixed(2)}</span>
                )}
              </div>
              <div className="mt-3 flex min-h-6 items-center">
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stockStyles}`}>{stockLabel}</span>
              </div>
              <button
                type="button"
                onClick={() => onAddToCart && onAddToCart(product)}
                disabled={isPending || isAdded || (isRestrictedBuyerRole && !isOutOfStock)}
                aria-disabled={isOutOfStock}
                className={`mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB4444] focus-visible:ring-offset-2 ${
                  isAdded
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : isPending || isRestrictedBuyerRole || isOutOfStock
                      ? "cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400"
                      : "border-neutral-300 bg-white text-neutral-800 hover:border-[#DB4444] hover:bg-red-50 hover:text-[#DB4444] active:scale-[0.98]"
                }`}
              >
                {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
                {isPending ? "Adding..." : isAdded ? "Added" : isOutOfStock ? "Out of Stock" : "Add to cart"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}