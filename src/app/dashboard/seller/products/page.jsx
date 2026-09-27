"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { getProductImage } from "../../../../lib/productImage";
import Link from "next/link";
import {
  Trash2,
  Edit2,
  Plus,
  Eye,
  PackageSearch,
  TrendingUp,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AddProductModal from "../../../../components/dashboard/AddProductModal";
import { showModal } from "../../../../lib/modal";

const PAGE_LIMIT = 10;

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/dashboard/products", { credentials: "include" });
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-product-menu]")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (productId) => {
    if (!(await showModal({ type: "confirm", title: "Delete product", message: "Are you sure you want to delete this product?", confirmLabel: "Delete" }))) return;

    try {
      const res = await fetch(`/api/dashboard/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        if (selectedProduct?._id === productId) setSelectedProduct(null);
      } else {
        await showModal({ title: "Delete failed", message: "Failed to delete product" });
      }
    } catch (error) {
      console.error("Failed to delete product:", error);
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const getStock = (product) => product.variants?.[0]?.inventory?.quantity || 0;
  const getStatus = (product) => product.approvalStatus === "pending" ? "Waiting for approval" : product.status === "active" ? "Active" : "Deactive";

  const filteredProducts = products.filter((product) => {
    const term = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.status?.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.max(Math.ceil(filteredProducts.length / PAGE_LIMIT), 1);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PAGE_LIMIT,
    currentPage * PAGE_LIMIT
  );

  const getWeeklyData = (product) => {
    return (
      product?.weeklyAnalytics || [
        { day: "Mon", sales: 12 },
        { day: "Tue", sales: 19 },
        { day: "Wed", sales: 15 },
        { day: "Thu", sales: 22 },
        { day: "Fri", sales: 30 },
        { day: "Sat", sales: 28 },
        { day: "Sun", sales: 35 },
      ]
    );
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">Inventory</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Products</h1>
        </div>
        <div className="flex w-full max-w-md items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-slate-400" aria-hidden="true">
            <path
              d="M21 21L16.65 16.65M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search products..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-full bg-[#DB4444] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#bf3636]"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Image</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Name</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Category</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Price</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Stock</th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
              <th className="px-6 py-3 text-center font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product._id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="px-6 py-4">
                  <Image
                    src={getProductImage(product)}
                    alt={product.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 rounded-lg object-cover"
                  />
                </td>
                <td className="px-6 py-4 font-semibold text-slate-800">{product.name}</td>
                <td className="px-6 py-4 text-slate-600">{product.categoryIds?.length ? "Active" : "General"}</td>
                <td className="px-6 py-4 text-slate-800">${Number(product.basePrice || 0).toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-800">{getStock(product)}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.approvalStatus === "pending" ? "bg-amber-50 text-amber-700" : product.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {getStatus(product)}
                  </span>
                </td>
                <td className="relative px-6 py-4 text-center" data-product-menu>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === product._id ? null : product._id)}
                    className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuId === product._id && (
                    <div className="absolute right-6 top-12 z-10 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setOpenMenuId(null);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Eye size={14} /> View
                      </button>
                      <Link
                        href={`/dashboard/seller/products/${product._id}/edit`}
                        onClick={() => setOpenMenuId(null)}
                        aria-disabled={product.approvalStatus === "pending"}
                        className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm ${product.approvalStatus === "pending" ? "pointer-events-none text-slate-300" : "text-blue-600 hover:bg-slate-50"}`}
                      >
                        <Edit2 size={14} /> Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
                        disabled={product.approvalStatus === "pending"}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-slate-50 disabled:pointer-events-none disabled:text-slate-300"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500">
          No products match your search.
        </div>
      )}

      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-3 shadow-sm">
          <p className="text-sm text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {selectedProduct && (() => {
        const weeklyData = getWeeklyData(selectedProduct);
        const maxSales = Math.max(...weeklyData.map((d) => d.sales), 1);

        return (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[#DB4444]">Product Overview</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">{selectedProduct.name}</h2>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Price</p>
                <p className="mt-2 text-xl font-bold text-slate-900">${Number(selectedProduct.basePrice || 0).toFixed(2)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Stock</p>
                <p className="mt-2 text-xl font-bold text-slate-900">{getStock(selectedProduct)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Status</p>
                <p className="mt-2 text-xl font-bold text-slate-900 capitalize">{selectedProduct.status || "draft"}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  <TrendingUp size={14} className="text-[#DB4444]" /> Weekly Performance
                </div>
                <span className="text-xs text-slate-400 font-medium">Last 7 Days</span>
              </div>

              <div className="flex h-36 items-end justify-between gap-2 pt-4 px-2">
                {weeklyData.map((item, index) => {
                  const heightPercentage = Math.round((item.sales / maxSales) * 100);
                  return (
                    <div key={index} className="group relative flex flex-1 flex-col items-center gap-1 h-full justify-end">
                      <span className="absolute -top-7 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white opacity-0 transition group-hover:opacity-100">
                        {item.sales} sales
                      </span>
                      <div
                        style={{ height: `${heightPercentage}%` }}
                        className="w-full max-w-7 rounded-t-md bg-[#DB4444]/20 transition-all duration-300 group-hover:bg-[#DB4444]"
                      />
                      <span className="text-[11px] font-medium text-slate-500">{item.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <PackageSearch size={14} /> Description
              </div>
              <p className="text-sm leading-7 text-slate-600">
                {selectedProduct.description || "No product description provided yet."}
              </p>
            </div>
          </div>
        );
      })()}

      {showAddModal && (
        <AddProductModal onClose={() => setShowAddModal(false)} onProductAdded={handleProductAdded} />
      )}
    </div>
  );
}