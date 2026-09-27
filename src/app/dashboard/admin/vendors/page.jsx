"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Truck, Edit2, Package, Star, MessageSquare, Send, X, UserPlus } from "lucide-react";
import { showModal } from "../../../../lib/modal";

const emptyForm = { name: "", contactName: "", email: "", password: "", phone: "", address: "" };

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [contactModal, setContactModal] = useState(null);
  const [contactForm, setContactForm] = useState({ subject: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);
  const [chatVendor, setChatVendor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);

  const loadVendors = async () => {
    try {
      const response = await fetch("/api/dashboard/admin/vendors", { credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load vendors");
      setVendors(data.vendors || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadVendors, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!chatVendor) return undefined;
    const loadMessages = async () => {
      setChatLoading(true);
      try {
        const response = await fetch(`/api/dashboard/vendor/messages?vendorId=${chatVendor._id}`, { credentials: "include" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load chat");
        setMessages(data.messages || []);
      } catch (chatError) {
        setError(chatError.message);
      } finally {
        setChatLoading(false);
      }
    };
    loadMessages();
    return () => setMessages([]);
  }, [chatVendor]);

  const change = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/dashboard/admin/vendors", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to add vendor");
      setVendors((previous) => [data.vendor, ...previous]);
      setForm(emptyForm);
      setError("");
      setAddModalOpen(false);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (vendor) => {
    if (!(await showModal({ type: "confirm", title: "Remove vendor", message: `Remove vendor ${vendor.name}? Products using it will have no vendor.`, confirmLabel: "Remove" }))) return;
    const response = await fetch(`/api/dashboard/admin/vendors/${vendor._id}`, { method: "DELETE", credentials: "include" });
    if (response.ok) setVendors((previous) => previous.filter((item) => item._id !== vendor._id));
    else setError("Unable to remove vendor");
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      const response = await fetch(`/api/dashboard/admin/vendors/${contactModal._id}/contact`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to send message");
      await showModal({ variant: "success", title: "Message prepared", message: "Message prepared for sending!" });
      setContactModal(null);
      setContactForm({ subject: "", message: "" });
    } catch (err) {
      await showModal({ title: "Message failed", message: err.message });
    } finally {
      setContactLoading(false);
    }
  };

  const sendChatMessage = async (event) => {
    event.preventDefault();
    if (!draft.trim() || !chatVendor) return;
    setChatSending(true);
    try {
      const response = await fetch(`/api/dashboard/vendor/messages?vendorId=${chatVendor._id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: draft }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send message");
      setMessages((current) => [...current, data.message]);
      setDraft("");
    } catch (chatError) {
      setError(chatError.message);
    } finally {
      setChatSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[28px] border border-rose-100 bg-linear-to-br from-white to-rose-50/40 p-6 shadow-[0_18px_40px_rgba(219,68,68,0.06)]">
        <div>
          <p className="text-xs font-semibold text-[#DB4444]">Supply chain</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Vendors</h1>
          <p className="mt-2 text-sm text-slate-500">Manage suppliers, track revenue, and communicate with vendors.</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setError(""); setAddModalOpen(true); }}
          className="inline-flex items-center gap-2 rounded-full bg-[#DB4444] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#bf3636]"
        >
          <UserPlus size={16} /> Add Vendor
        </button>
      </div>

      {error && !addModalOpen && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-6 text-sm text-slate-500">Loading vendors...</p>
          ) : vendors.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No vendors added yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {vendors.map((vendor) => (
                <div key={vendor._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex gap-3 flex-1">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-[#DB4444]"><Truck size={20} /></div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{vendor.name}</p>
                        <p className="text-sm text-slate-500">{vendor.contactName || "No contact person"}</p>
                        <p className="mt-1 text-xs text-slate-400">{[vendor.email, vendor.phone].filter(Boolean).join(" · ") || "No contact details"}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${vendor.status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                        {vendor.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-2 mb-3 border-y border-slate-100 py-3 sm:grid-cols-3 lg:grid-cols-6">
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Products</p>
                      <p className="text-lg font-bold text-slate-900">{vendor.productCount || vendor.totalProducts || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Stock</p>
                      <p className={`text-lg font-bold ${vendor.lowStock ? "text-amber-600" : "text-slate-900"}`}>{vendor.stock || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Low stock</p>
                      <p className={`text-lg font-bold ${vendor.lowStock ? "text-amber-600" : "text-emerald-600"}`}>{vendor.lowStock || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Paid</p>
                      <p className="text-lg font-bold text-slate-900">${Number(vendor.paidAmount || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Remaining</p>
                      <p className={`text-lg font-bold ${vendor.paymentDue ? "text-red-600" : "text-emerald-600"}`}>${Number(vendor.paymentDue || 0).toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-slate-500">Rating</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-lg font-bold text-slate-900">{vendor.rating?.toFixed(1) || "0"}</span>
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                    <div className="col-span-2 text-center sm:col-span-3 lg:col-span-6 lg:border-t lg:border-slate-100 lg:pt-2">
                      <p className="text-xs text-slate-500">Payment status</p>
                      <p className={`text-sm font-bold ${Number(vendor.paymentDue || 0) <= 0 ? "text-emerald-600" : Number(vendor.paidAmount || 0) > 0 ? "text-amber-600" : "text-red-600"}`}>
                        {Number(vendor.paymentDue || 0) <= 0 ? "Payment done" : Number(vendor.paidAmount || 0) > 0 ? "Partially paid" : "Payment pending"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href={`/dashboard/admin/vendors/${vendor._id}/edit`}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
                    >
                      <Edit2 size={14} /> Edit
                    </Link>
                    <Link
                      href={`/dashboard/admin/vendors/${vendor._id}/products`}
                      className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-100"
                    >
                      <Package size={14} /> Products
                    </Link>
                    <button
                      onClick={() => { setChatVendor(vendor); setDraft(""); }}
                      className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-100"
                      aria-label={`Open chat with ${vendor.name}`}
                    >
                      <MessageSquare size={14} /> Chat
                    </button>
                    <button
                      onClick={() => {
                        setContactModal(vendor);
                        setContactForm({ subject: "", message: "" });
                      }}
                      className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-100"
                    >
                      <MessageSquare size={14} /> Contact
                    </button>
                    <button
                      onClick={() => remove(vendor)}
                      className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Vendor Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900"><Plus size={18} className="text-[#DB4444]" /> Add vendor</h2>
              <button onClick={() => setAddModalOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
                <X size={19} />
              </button>
            </div>
            {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
            <form onSubmit={submit} className="space-y-4">
              {[['name', 'Vendor name', true], ['contactName', 'Contact person'], ['email', 'Login email'], ['password', 'Login password'], ['phone', 'Phone'], ['address', 'Address']].map(([name, label, required]) => (
                <label key={name} className="block text-sm font-medium text-slate-700">{label}
                  <input type={name === "password" ? "password" : name === "email" ? "email" : "text"} required={required} name={name} value={form[name]} onChange={change} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#DB4444]" />
                </label>
              ))}
              <div className="flex gap-3">
                <button type="submit" disabled={saving} className="flex-1 rounded-full bg-[#DB4444] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#bf3636]">{saving ? "Adding..." : "Add vendor"}</button>
                <button type="button" onClick={() => setAddModalOpen(false)} className="flex-1 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {contactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Contact {contactModal.name}</h2>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#DB4444] focus:outline-none"
                  placeholder="Message subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  rows="5"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#DB4444] focus:outline-none"
                  placeholder="Your message here..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="flex-1 rounded-full bg-[#DB4444] px-4 py-2 font-semibold text-white hover:bg-[#bf3636] disabled:opacity-50"
                >
                  {contactLoading ? "Sending..." : "Send Message"}
                </button>
                <button
                  type="button"
                  onClick={() => setContactModal(null)}
                  className="flex-1 rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {chatVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4" role="dialog" aria-modal="true" aria-label={`Chat with ${chatVendor.name}`}>
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#DB4444]">Vendor chat</p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">{chatVendor.name}</h2>
              </div>
              <button onClick={() => setChatVendor(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close chat"><X size={19} /></button>
            </div>
            <div className="min-h-72 flex-1 space-y-3 overflow-y-auto p-5">
              {chatLoading ? <p className="text-sm text-slate-500">Loading messages...</p> : messages.length === 0 ? <p className="text-sm text-slate-400">No messages yet. Start the conversation.</p> : messages.map((item) => (
                <div key={item._id} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${item.senderRole === "admin" ? "ml-auto bg-[#DB4444] text-white" : "bg-slate-100 text-slate-700"}`}>
                  <p>{item.message}</p>
                  <p className="mt-1 text-[10px] opacity-70">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <form onSubmit={sendChatMessage} className="flex gap-2 border-t border-slate-100 p-4">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write to vendor..." className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#DB4444]" />
              <button disabled={chatSending} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DB4444] text-white disabled:opacity-50" aria-label="Send message"><Send size={16} /></button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}