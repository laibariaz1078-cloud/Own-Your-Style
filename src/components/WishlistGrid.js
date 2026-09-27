"use client";

import Image from "next/image";
import { Trash2, ShoppingCart } from "lucide-react";

export default function WishlistGrid({ products = [], onRemove, onAddToCart, addedProductIds = [], pendingProductId = null, isRestrictedBuyerRole = false }) {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-gray-500">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const productId = String(product.id || product._id || product.productId || "");
        const image = product.image || product.images?.[0]?.url || "/product1.png";
        const price = product.price ?? product.basePrice ?? 0;
        const isAdded = productId ? addedProductIds.includes(productId) : false;
        const isPending = pendingProductId && String(pendingProductId) === productId;

        return (
          <div key={productId || product.name} className="group flex flex-col">
            <div className="relative flex h-[250px] w-full items-center justify-center rounded-sm bg-[#F5F5F5] p-6">
              {product.discountPercent > 0 && (
                <span className="absolute left-3 top-3 z-10 rounded bg-[#DB4444] px-3 py-1 text-xs text-white">
                  -{product.discountPercent}%
                </span>
              )}

              <button
                type="button"
                onClick={() => onRemove && onRemove(product.id || product._id || product.productId)}
                aria-label="Remove item"
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-colors hover:bg-black hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="relative h-[150px] w-[180px] transition-transform duration-300 group-hover:scale-105">
                {String(image).startsWith("http") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={product.name || "Wishlist product"}
                    className="h-full w-full object-contain mix-blend-multiply drop-shadow-[0_8px_15px_rgba(0,0,0,0.1)]"
                  />
                ) : (
                  <Image
                    src={image}
                    alt={product.name || "Wishlist product"}
                    fill
                    sizes="(max-width: 768px) 100vw, 250px"
                    className="object-contain mix-blend-multiply drop-shadow-[0_8px_15px_rgba(0,0,0,0.1)]"
                    priority
                  />
                )}
              </div>

              <button
                type="button"
                onClick={() => onAddToCart && onAddToCart(product)}
                disabled={isPending || isAdded || isRestrictedBuyerRole}
                className={`absolute inset-x-0 bottom-0 flex h-10 w-full items-center justify-center gap-2 text-xs font-medium transition-opacity ${
                  isAdded ? "text-white bg-black" : isRestrictedBuyerRole ? "bg-slate-400 text-white" : "bg-black text-white hover:opacity-90"
                } ${(isPending || isAdded || isRestrictedBuyerRole) ? "cursor-not-allowed opacity-80" : ""}`}
              >
                <ShoppingCart className="h-4 w-4" />
                {isPending ? "Adding..." : isAdded ? "Added" : "Add To Cart"}
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <h3 className="truncate text-base font-medium text-black">{product.name}</h3>
              <div className="flex items-center gap-3 text-base font-medium">
                <span className="text-[#DB4444]">${price}</span>
                {product.oldPrice > 0 && (
                  <span className="text-gray-400 line-through">${product.oldPrice}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}