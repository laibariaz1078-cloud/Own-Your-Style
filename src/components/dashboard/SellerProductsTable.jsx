"use client";

import { useEffect, useState } from "react";
import { mockProducts } from "../../app/dashboard/mock-data";

export default function SellerProductsTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/dashboard/products", { credentials: "include" });
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts(mockProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getStock = (product) => product.variants?.[0]?.inventory?.quantity ?? 0;
  const getStatusLabel = (product) => (getStock(product) <= 10 ? "Low Stock" : "In Stock");

  const statusClasses = {
    "In Stock": "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    "Low Stock": "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-900">Inventory</h3>
        <p className="text-sm text-slate-500">Your product listings and stock status</p>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">Loading inventory...</div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8 text-center text-sm text-slate-500">
          No products added yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-3 font-medium">Product</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium">Stock</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.slice(0, 6).map((product) => (
                <tr key={product._id} className="border-b border-slate-100 last:border-b-0">
                  <td className="py-3 font-medium text-slate-900">{product.name}</td>
                  <td className="py-3 text-slate-600">{product.categoryIds?.[0] || "General"}</td>
                  <td className="py-3 text-slate-900">${Number(product.basePrice || 0).toFixed(2)}</td>
                  <td className="py-3 text-slate-600">{getStock(product)}</td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses[getStatusLabel(product)]}`}>
                      {getStatusLabel(product)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
