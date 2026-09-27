"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function TopBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full bg-black text-white">
      <div className="page-shell flex items-center justify-between gap-2 py-3 text-sm">
        <div className="flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee whitespace-nowrap">
            <MarqueeContent />
            <MarqueeContent />
          </div>
        </div>

        <div className="relative hidden shrink-0 md:block">
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-sm text-white"
          >
            English
            <ChevronDown className="h-4 w-4" />
          </button>

          {open && (
            <div className="absolute z-50 right-0 top-full mt-2 w-28 rounded bg-white py-1 text-black shadow-lg">
              <button
                type="button"
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                English
              </button>
              <button
                type="button"
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50"
                onClick={() => setOpen(false)}
              >
                Urdu
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </div>
  );
}

function MarqueeContent() {
  return (
    <p className="flex items-center gap-1 px-4 text-xs sm:text-sm">
      Summer Sale For All Swim Suits And Free Express Delivery – OFF 50%!
      <Link href="/shop" className="font-medium underline underline-offset-2">
        ShopNow
      </Link>
    </p>
  );
}