"use client";

import { ArrowUpRight } from "lucide-react";

export default function StatCard({ icon: Icon, label, value, trend = "+12.5%", accent = "#DB4444" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}1A`, color: accent }}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-600">
        <ArrowUpRight className="h-3.5 w-3.5" />
        <span>{trend}</span>
      </div>
    </div>
  );
}
