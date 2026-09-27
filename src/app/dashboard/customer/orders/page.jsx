"use client";

import CustomerOrdersTable from "../../../../components/dashboard/CustomerOrdersTable";

export default function CustomerOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
        <p className="mt-1 text-sm text-slate-500">Track your recent purchases and order status.</p>
      </div>
      <CustomerOrdersTable />
    </div>
  );
}
