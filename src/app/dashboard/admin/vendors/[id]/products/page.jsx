"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Loader2 } from "lucide-react";

export default function VendorProductsPage() {
  const params = useParams();
  const vendorId = params.id;

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vendorRes, productsRes] = await Promise.all([
          fetch(`/api/dashboard/admin/vendors/${vendorId}/stats`, { credentials: "include" }),
          fetch(`/api/dashboard/admin/vendors/${vendorId}/products`, { credentials: "include" }),
        ]);

        if (!vendorRes.ok) throw new Error("Failed to load vendor");
        if (!productsRes.ok) throw new Error("Failed to load products");

        const vendorData = await vendorRes.json();
        const productsData = await productsRes.json();

        setVendor(vendorData.vendor);
        setProducts(productsData.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) loadData();
  }, [vendorId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-8 text-slate-500">
        <Loader2 size={18} className="animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/admin/vendors" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">
        <ArrowLeft size={16} /> Back to Vendors
      </Link>

      <div className="rounded-[28px] border border-rose-100 bg-linear-to-br from-white to-rose-50/40 p-6">
        <p className="text-xs font-semibold text-[#DB4444]">Vendor Products</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{vendor?.name}</h1>
        <p className="mt-2 text-sm text-slate-500">Total Products: {products.length}</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {products.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No products for this vendor yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3">Product Name</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Paid / Remaining</th>
                    <th className="px-5 py-3">Due date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/admin/products/${product._id}/edit`}
                        className="font-medium text-slate-900 hover:text-[#DB4444]"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      ${product.basePrice?.toFixed(2) || "0.00"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={Number(product.variants?.[0]?.inventory?.quantity || 0) < 5 ? "font-semibold text-amber-600" : "text-slate-700"}>
                        {product.variants?.[0]?.inventory?.quantity || 0}
                      </span>
                      {Number(product.variants?.[0]?.inventory?.quantity || 0) < 5 && <span className="ml-2 text-xs font-semibold text-amber-600">Low</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">${Number(product.vendorPaidAmount || 0).toFixed(2)} / <span className="font-semibold text-red-600">${Number(product.vendorPaymentDue || 0).toFixed(2)}</span></td>
                    <td className="px-5 py-3 text-xs text-slate-500">{product.vendorPaymentDueDate ? new Date(product.vendorPaymentDueDate).toLocaleDateString() : "Not set"}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          product.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {product.status || "unknown"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
