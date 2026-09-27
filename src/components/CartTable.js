"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";

export default function CartTable({ items = [], onRemoveItem, onUpdateQuantity }) {
  const [quantities, setQuantities] = useState(Object.fromEntries(items.map((item) => [item.id, item.quantity])));

  const updateQuantity = (id, delta) => {
    setQuantities((prev) => {
      const current = prev[id] || 1;
      const updated = Math.max(1, current + delta);
      onUpdateQuantity?.(id, updated);
      return { ...prev, [id]: updated };
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="hidden grid-cols-4 items-center rounded-sm bg-white px-10 py-6 text-base font-normal shadow-[0_1px_13px_0_rgba(0,0,0,0.05)] sm:grid">
        <span>Product</span>
        <span className="text-center">Price</span>
        <span className="text-center">Quantity</span>
        <span className="text-right">Subtotal</span>
      </div>

      {items.map((item) => {
        const currentQty = quantities[item.id] ?? item.quantity;
        const formattedQty = currentQty < 10 ? `0${currentQty}` : currentQty;

        return (
          <div
            key={item.id}
            className="grid grid-cols-2 items-center gap-4 rounded-sm bg-white px-10 py-6 shadow-[0_1px_13px_0_rgba(0,0,0,0.05)] sm:grid-cols-4"
          >
            <div className="relative flex items-center gap-5">
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center p-1">
                <button
                  type="button"
                  onClick={() => onRemoveItem && onRemoveItem(item.id)}
                  className="absolute -left-2 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#DB4444] text-white transition-transform hover:scale-110"
                >
                  <X className="h-3 w-3" />
                </button>
                <Image
                  src={item.image}
                  alt={item.name}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 object-contain"
                />
              </div>
              <span className="text-base font-normal text-black">{item.name}</span>
            </div>

            <span className="text-center text-base font-normal text-black">
              ${item.price}
            </span>

            <div className="flex justify-center">
              <div className="flex items-center justify-between rounded border border-black/40 px-3 py-1.5 w-20">
                <span className="text-base font-normal text-black select-none">
                  {formattedQty}
                </span>

                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="text-black/60 hover:text-black transition-colors leading-none"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    className="text-black/60 hover:text-black transition-colors leading-none"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <span className="text-right text-base font-normal text-black">
              ${item.price * currentQty}
            </span>
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-2">
        <Link
          href="/"
          className="rounded-sm border border-black/50 px-6 py-3 text-base font-medium transition-colors hover:bg-black hover:text-white"
        >
          Return To Shop
        </Link>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-sm border border-black/50 px-6 py-3 text-base font-medium transition-colors hover:bg-black hover:text-white"
        >
          Update Cart
        </button>
      </div>
    </div>
  );
}