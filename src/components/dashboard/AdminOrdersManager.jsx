"use client";

import { useEffect, useRef, useState } from "react";
import { ClipboardList, Eye, Loader2, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import { showModal } from "../../lib/modal";

const statuses = ["Processing", "Paid", "Shipped", "Delivered", "Delayed", "Cancelled"];

const statusStyles = {
  Processing: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  Paid: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  Shipped: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  Delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  Delayed: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
  Cancelled: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
};

function StatusBadge({ status }) {
  const style = statusStyles[status] || "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style}`}>{status}</span>;
}

function sellerName(seller) {
  if (!seller) return "Unknown seller";
  return `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || seller.storeName || "Seller";
}

function ActionMenu({ order, onView, onEdit, onCancel }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Order actions"
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <button
            onClick={() => { setOpen(false); onView(order); }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Eye size={15} /> View
          </button>
          <button
            onClick={() => { setOpen(false); onEdit(order); }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <Pencil size={15} /> Edit
          </button>
          <button
            onClick={() => { setOpen(false); onCancel(order); }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={15} /> Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersManager() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ customerId: "", productId: "", quantity: 1, status: "Processing", notes: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [ordersResponse, usersResponse, productsResponse] = await Promise.all([
        fetch("/api/dashboard/admin/orders", { credentials: "include" }),
        fetch("/api/dashboard/admin/users", { credentials: "include" }),
        fetch("/api/dashboard/products", { credentials: "include" }),
      ]);
      const ordersData = await ordersResponse.json();
      const usersData = await usersResponse.json();
      const productsData = await productsResponse.json();
      if (!ordersResponse.ok) throw new Error(ordersData.error || "Unable to load orders");
      setOrders(ordersData.orders || []);
      setCustomers(usersData.customers || []);
      setProducts(productsData.products || []);
      setError("");
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

  const updateOrder = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`/api/dashboard/admin/orders/${editingOrder._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ status: editingOrder.status, notes: editingOrder.notes }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update order");
      setOrders((previous) => previous.map((order) => order._id === data.order._id ? { ...order, ...data.order } : order));
      setEditingOrder(null);
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setSaving(false);
    }
  };

  const createOrder = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/dashboard/admin/orders", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to create order");
      setShowCreate(false);
      setForm({ customerId: "", productId: "", quantity: 1, status: "Processing", notes: "" });
      await load();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setSaving(false);
    }
  };

  const cancelOrder = async (order) => {
    if (!(await showModal({ type: "confirm", title: "Cancel order", message: `Cancel ${order.orderNumber ? `order #${order.orderNumber}` : "this order"}?`, confirmLabel: "Cancel" }))) return;

    try {
      const response = await fetch(`/api/dashboard/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: "Cancelled", notes: order.notes || "Cancelled by admin" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to cancel order");

      setOrders((previous) => previous.map((item) => item._id === order._id ? { ...item, ...data.order, status: "Cancelled" } : item));
      setError("");
    } catch (cancelError) {
      setError(cancelError.message);
    }
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-[#DB4444]">Operations</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Customer orders</h1><p className="mt-1 text-sm text-slate-500">See customers, ordered products, and their sellers.</p></div></div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><ClipboardList size={19} className="text-[#DB4444]" /><h2 className="font-semibold text-slate-900">All orders <span className="ml-1 text-sm font-normal text-slate-500">({orders.length})</span></h2></div>
      {loading ? <div className="flex items-center gap-2 p-8 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Loading orders...</div> : orders.length === 0 ? <div className="p-10 text-center text-sm text-slate-400">No customer orders yet.</div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Products and sellers</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id} className="border-t border-slate-100 align-top transition-colors hover:bg-rose-50/30"><td className="px-5 py-4 font-semibold text-slate-800">{order.orderNumber ? `#${order.orderNumber}` : order._id.slice(-8)}<p className="mt-1 text-xs font-normal text-slate-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</p></td><td className="px-5 py-4 text-slate-700">{order.customerName || order.customerId?.firstName || "Customer"}<p className="mt-1 text-xs text-slate-400">{order.customerId?.email || ""}</p></td><td className="max-w-sm px-5 py-4">{order.items?.map((item, index) => <div key={`${order._id}-${index}`} className="mb-2 last:mb-0"><p className="font-medium text-slate-800">{item.productId?.name || item.productName} <span className="text-xs font-normal text-slate-500">x{item.quantity}</span></p><p className="text-xs text-slate-500">Seller: {sellerName(item.sellerId)}</p></div>)}</td><td className="px-5 py-4 font-semibold text-slate-800">${Number(order.pricing?.grandTotal || 0).toFixed(2)}</td><td className="px-5 py-4"><StatusBadge status={order.status} /></td><td className="px-5 py-4 text-right"><ActionMenu order={order} onView={setSelectedOrder} onEdit={(item) => setEditingOrder({ ...item, notes: item.notes || "" })} onCancel={cancelOrder} /></td></tr>)}</tbody></table></div>}
    </div>
    {(showCreate || editingOrder || selectedOrder) && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => { setShowCreate(false); setEditingOrder(null); setSelectedOrder(null); }}><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>{showCreate && <><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-slate-900">Create order</h2><button onClick={() => setShowCreate(false)} aria-label="Close create order"><X size={18} /></button></div><form onSubmit={createOrder} className="space-y-4"><label className="block text-sm font-medium text-slate-700">Customer<select required value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5"><option value="">Select customer</option>{customers.map((customer) => <option key={customer._id} value={customer._id}>{customer.firstName} {customer.lastName || ""} ({customer.email})</option>)}</select></label><label className="block text-sm font-medium text-slate-700">Product<select required value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5"><option value="">Select product</option>{products.map((product) => <option key={product._id} value={product._id}>{product.name} - ${Number(product.basePrice || 0).toFixed(2)}</option>)}</select></label><label className="block text-sm font-medium text-slate-700">Quantity<input required min="1" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><button disabled={saving} className="rounded-lg bg-[#DB4444] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Creating..." : "Create order"}</button></form></>}{editingOrder && <><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-slate-900">Edit order</h2><button onClick={() => setEditingOrder(null)} aria-label="Close edit order"><X size={18} /></button></div><form onSubmit={updateOrder} className="space-y-4"><label className="block text-sm font-medium text-slate-700">Status<select value={editingOrder.status} onChange={(event) => setEditingOrder({ ...editingOrder, status: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="block text-sm font-medium text-slate-700">Notes<textarea rows={4} value={editingOrder.notes} onChange={(event) => setEditingOrder({ ...editingOrder, notes: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label><button disabled={saving} className="rounded-lg bg-[#DB4444] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Updating..." : "Update order"}</button></form></>}{selectedOrder && <><div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-bold text-slate-900">Order details</h2><button onClick={() => setSelectedOrder(null)} aria-label="Close order details"><X size={18} /></button></div><div className="space-y-3 text-sm"><p><strong>Customer:</strong> {selectedOrder.customerName} {selectedOrder.customerId?.email && `(${selectedOrder.customerId.email})`}</p>{selectedOrder.items?.map((item, index) => <div key={index} className="rounded-lg bg-slate-50 p-3"><p className="font-semibold">{item.productId?.name || item.productName} x{item.quantity}</p><p className="mt-1 text-slate-500">Seller: {sellerName(item.sellerId)}</p><p className="mt-1 text-slate-500">${Number(item.lineTotal || 0).toFixed(2)}</p></div>)}<p className="pt-2 font-semibold">Grand total: ${Number(selectedOrder.pricing?.grandTotal || 0).toFixed(2)}</p></div></>}</div></div>}
  </div>;
}