"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AdminEditProductPage({ params }) {
  const router = useRouter();
  const [productId, setProductId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", category: "", price: "", stock: "", image: "", status: "active", vendorId: "", vendorUnitCost: "", vendorPaidAmount: "", vendorPaymentDue: "" });
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.resolve(params).then(({ id }) => {
      setProductId(id);
      return Promise.all([
        fetch(`/api/dashboard/products/${id}`, { credentials: "include" }),
        fetch("/api/dashboard/admin/vendors", { credentials: "include" }),
      ]);
    }).then(async ([productResponse, vendorsResponse]) => {
      const data = await productResponse.json();
      const vendorData = await vendorsResponse.json();
      if (!data.success) throw new Error(data.error || "Unable to load product");
      setVendors(vendorData.vendors || []);
      const product = data.product;
      setForm({ name: product.name || "", description: product.description || "", category: product.categoryIds?.[0] || "", price: product.basePrice || "", stock: product.variants?.[0]?.inventory?.quantity || 0, image: product.images?.[0]?.url || "", status: product.status || "active", vendorId: product.vendorId?._id || product.vendorId || "", vendorUnitCost: product.vendorUnitCost || 0, vendorPaidAmount: product.vendorPaidAmount || 0, vendorPaymentDue: product.vendorPaymentDue || 0 });
    }).catch((loadError) => setError(loadError.message)).finally(() => setLoading(false));
  }, [params]);

  const change = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/dashboard/products/${productId}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, description: form.description, categoryIds: form.category ? [form.category] : [], basePrice: form.price, stock: form.stock, status: form.status, vendorId: form.vendorId || null, vendorUnitCost: form.vendorUnitCost, vendorPaidAmount: form.vendorPaidAmount, vendorPaymentDue: form.vendorPaymentDue, images: form.image ? [{ url: form.image }] : [] }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update product");
      router.push("/dashboard/admin/products");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12 text-slate-500"><Loader2 size={18} className="mr-2 animate-spin" /> Loading product...</div>;

  return <div className="space-y-6"><Link href="/dashboard/admin/products" className="flex items-center gap-2 text-[#DB4444] hover:opacity-80"><ArrowLeft size={18} /> Back to products</Link><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h1 className="mb-6 text-2xl font-bold text-slate-900">Edit product</h1>{error && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>}<form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium text-slate-700">Product name<input required name="name" value={form.name} onChange={change} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#DB4444]" /></label><label className="block text-sm font-medium text-slate-700">Description<textarea name="description" value={form.description} onChange={change} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#DB4444]" /></label><div className="grid gap-4 md:grid-cols-2"><label className="block text-sm font-medium text-slate-700">Category<input name="category" value={form.category} onChange={change} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#DB4444]" /></label><label className="block text-sm font-medium text-slate-700">Price<input required type="number" step="0.01" name="price" value={form.price} onChange={change} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#DB4444]" /></label><label className="block text-sm font-medium text-slate-700">Stock<input type="number" min="0" name="stock" value={form.stock} onChange={change} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#DB4444]" /></label><label className="block text-sm font-medium text-slate-700">Status<select name="status" value={form.status} onChange={change} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-[#DB4444]"><option value="active">Active</option><option value="draft">Draft</option></select></label></div><label className="block text-sm font-medium text-slate-700">Image URL<input type="url" name="image" value={form.image} onChange={change} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#DB4444]" /></label><button disabled={saving} className="flex items-center gap-2 rounded-lg bg-[#DB4444] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#bf3636] disabled:opacity-60">{saving && <Loader2 size={16} className="animate-spin" />} {saving ? "Updating..." : "Update product"}</button></form></div></div>;
}