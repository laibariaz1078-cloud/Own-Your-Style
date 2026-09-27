"use client";

import { useState } from "react";
import { Store, DollarSign, ShoppingBag, Gift } from "lucide-react";

const stats = [
  { icon: Store, value: "10.5k", label: "Sellers active our site" },
  { icon: DollarSign, value: "33k", label: "Monthly Product Sale" },
  { icon: ShoppingBag, value: "45.5k", label: "Customer active in our site" },
  { icon: Gift, value: "25k", label: "Annual gross sale in our site" },
];

export default function StatsStrip() {
  const [selected, setSelected] = useState(1);

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const isSelected = selected === index;

        return (
          <div
            key={stat.label}
            onClick={() => setSelected(index)}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded border px-7 py-6 text-center transition-all ${
              isSelected
                ? "border-[#DB4444] bg-[#DB4444] text-white shadow-md"
                : "border-black/30 bg-white text-black"
            }`}
          >
            {/* Double Circle Icon Frame */}
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full transition-colors ${
                isSelected ? "bg-white/30" : "bg-black/30"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                  isSelected ? "bg-white text-black" : "bg-black text-white"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>

            <p className="text-3xl font-bold tracking-wide">{stat.value}</p>
            <p className="text-sm font-normal">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}