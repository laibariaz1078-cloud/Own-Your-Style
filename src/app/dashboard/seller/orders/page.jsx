"use client";

import { Package } from "lucide-react";
import SellerOrdersTable from "../../../../components/dashboard/SellerOrdersTable";

export default function SellerOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-amber-100 bg-linear-to-br from-white to-amber-50/40 p-6 shadow-[0_18px_40px_rgba(217,119,6,0.06)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Package size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700">Seller operations</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Sales Orders</h1>
            <p className="mt-0.5 text-sm text-slate-500">Review recent customer orders and delivery progress.</p>
          </div>
        </div>
      </div>

      <SellerOrdersTable />
    </div>
  );
}
