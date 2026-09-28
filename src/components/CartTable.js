"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { X, ChevronUp, ChevronDown } from "lucide-react";
import { clampCartQuantity } from "../lib/cartHelpers";

export default function CartTable({ items = [], onRemoveItem, onUpdateQuantity }) {
  const [quantities, setQuantities] = useState(Object.fromEntries(items.map((item) => [item.id, item.quantity])));
  const [pendingIds, setPendingIds] = useState([]);

  const updateQuantity = async (item, value) => {
    const nextQuantity = clampCartQuantity(value, item.stockLimit);
    if (nextQuantity === item.quantity) {
      setQuantities((previous) => {
        const nextQuantities = { ...previous };
        delete nextQuantities[item.id];
        return nextQuantities;
      });
      return;
    }

    setPendingIds((previous) => [...previous, item.id]);
    try {
      await onUpdateQuantity?.(item.id, nextQuantity);
    } catch (error) {
      setQuantities((previous) => ({ ...previous, [item.id]: item.quantity }));
    } finally {
      setQuantities((previous) => {
        const nextQuantities = { ...previous };
        delete nextQuantities[item.id];
        return nextQuantities;
      });
      setPendingIds((previous) => previous.filter((pendingId) => pendingId !== item.id));
    }
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
        const currentQty = Number(quantities[item.id] ?? item.quantity) || 1;
        const maximum = Math.max(item.quantity, Number(item.stockLimit) || item.quantity);
        const isPending = pendingIds.includes(item.id);

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

            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-between rounded border border-black/40 px-3 py-1.5 w-20">
                <input
                  type="number"
                  min="1"
                  max={maximum}
                  value={quantities[item.id] ?? item.quantity}
                  onChange={(event) => {
                    const value = event.target.value;
                    setQuantities((previous) => ({
                      ...previous,
                      [item.id]: value === "" ? "" : clampCartQuantity(value, maximum),
                    }));
                  }}
                  onBlur={(event) => updateQuantity(item, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                  }}
                  disabled={isPending}
                  aria-label={`${item.name} quantity`}
                  className="w-9 bg-transparent text-center text-base font-normal text-black outline-none disabled:text-neutral-400"
                />

                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item, currentQty + 1)}
                    disabled={isPending || currentQty >= maximum}
                    aria-label={`Increase ${item.name} quantity`}
                    className="text-black/60 transition-colors leading-none hover:text-black disabled:cursor-not-allowed disabled:text-black/20"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item, currentQty - 1)}
                    disabled={isPending || currentQty <= 1}
                    aria-label={`Decrease ${item.name} quantity`}
                    className="text-black/60 transition-colors leading-none hover:text-black disabled:cursor-not-allowed disabled:text-black/20"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {currentQty >= maximum && <p className="mt-1 text-center text-xs text-amber-700">Only {maximum} available.</p>}
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