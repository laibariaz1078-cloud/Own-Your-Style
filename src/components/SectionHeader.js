"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function SectionHeader({
  eyebrow,
  title,
  countdown,
  showArrows,
  showViewAll,
  onPrev,
  onNext,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <span className="h-10 w-5 rounded bg-brand" />
        <span className="text-sm font-semibold text-brand">{eyebrow}</span>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex items-end gap-14">
          <h2 className="text-3xl font-semibold text-black">{title}</h2>

          {countdown && (
            <div className="flex items-center gap-4">
              {[
                { label: "Days", value: countdown.days },
                { label: "Hours", value: countdown.hours },
                { label: "Minutes", value: countdown.minutes },
                { label: "Seconds", value: countdown.seconds },
              ].map((unit) => (
                <div key={unit.label} className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">{unit.label}</span>
                  <span className="text-2xl font-semibold text-black">
                    {unit.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {showViewAll && (
         <Link
      href="/shop"
      className="rounded bg-[#DB4444] px-12 py-4 text-base font-medium text-white transition-colors hover:bg-[#c33838]"
    >
      View All Products
    </Link>
        )}

        {showArrows && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}