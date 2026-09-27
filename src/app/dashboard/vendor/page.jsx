"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, CreditCard, Package, Send, Warehouse } from "lucide-react";
import VendorSupplyChart from "../../../components/dashboard/VendorSupplyChart";

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function VendorDashboardPage() {
  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [summaryResponse, messageResponse] = await Promise.all([
        fetch("/api/dashboard/vendor/summary", { credentials: "include" }),
        fetch("/api/dashboard/vendor/messages", { credentials: "include" }),
      ]);
      const summary = await summaryResponse.json();
      const messageData = await messageResponse.json();
      if (!summaryResponse.ok) throw new Error(summary.error || "Unable to load vendor dashboard");
      setData(summary);
      if (messageResponse.ok) setMessages(messageData.messages || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, []);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    try {
      const response = await fetch("/api/dashboard/vendor/messages", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: draft }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to send message");
      setMessages((current) => [...current, result.message]);
      setDraft("");
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">Loading vendor dashboard...</div>;
  if (!data) return <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">{error || "Unable to load dashboard"}</div>;

  const cards = [
    ["Products", data.totals.products, Package, "text-blue-600 bg-blue-50"],
    ["Total stock", data.totals.stock, Warehouse, "text-amber-600 bg-amber-50"],
    ["Paid", money(data.totals.paid), CreditCard, "text-emerald-600 bg-emerald-50"],
    ["Remaining", money(data.totals.due), CalendarClock, "text-rose-600 bg-rose-50"],
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-rose-100 bg-linear-to-br from-white to-rose-50/50 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#DB4444]">Vendor portal</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome, {data.vendor.name}</h1>
        <p className="mt-2 text-sm text-slate-500">Track the products supplied to the admin, inventory, and payment balance.</p>
      </div>

      {error && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon, color]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}><Icon size={19} /></div><p className="mt-4 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-slate-900">{value}</p></div>)}
      </div>

      <VendorSupplyChart products={data.products} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold text-slate-900">Products supplied to admin</h2><p className="mt-1 text-sm text-slate-500">Stock and payment status for every product.</p></div>
          {data.products.length === 0 ? <p className="p-6 text-sm text-slate-500">No products have been assigned to this vendor yet.</p> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr><th className="px-5 py-3">Product</th><th className="px-5 py-3">Stock</th><th className="px-5 py-3">Paid</th><th className="px-5 py-3">Remaining</th><th className="px-5 py-3">Due date</th></tr></thead><tbody>{data.products.map((product) => <tr key={product._id} className="border-t border-slate-100"><td className="px-5 py-4 font-medium text-slate-900">{product.name}</td><td className="px-5 py-4 text-slate-600">{product.stock}</td><td className="px-5 py-4 text-emerald-700">{money(product.paid)}</td><td className="px-5 py-4 font-semibold text-rose-600">{money(product.due)}</td><td className="px-5 py-4 text-slate-500">{product.vendorPaymentDueDate ? new Date(product.vendorPaymentDueDate).toLocaleDateString() : "Not set"}</td></tr>)}</tbody></table></div>}
        </section>

        <section className="flex min-h-105 flex-col rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold text-slate-900">Chat with admin</h2><p className="mt-1 text-sm text-slate-500">Ask about stock, payments, or due dates.</p></div>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">{messages.length === 0 ? <p className="text-sm text-slate-400">No messages yet. Send a message to start.</p> : messages.map((item) => <div key={item._id} className={`max-w-[90%] rounded-xl px-3 py-2 text-sm ${item.senderRole === "vendor" ? "ml-auto bg-[#DB4444] text-white" : "bg-slate-100 text-slate-700"}`}><p>{item.message}</p><p className={`mt-1 text-[10px] ${item.senderRole === "vendor" ? "text-red-100" : "text-slate-400"}`}>{new Date(item.createdAt).toLocaleString()}</p></div>)}</div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-slate-100 p-4"><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write to admin..." className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#DB4444]" /><button disabled={sending} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DB4444] text-white disabled:opacity-50" aria-label="Send message"><Send size={16} /></button></form>
        </section>
      </div>
      <Link href="/dashboard/vendor/messages" className="text-sm font-semibold text-[#DB4444]">Open full message view</Link>
    </div>
  );
}
