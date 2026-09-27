"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { mockProducts } from "../../mock-data";
import Link from "next/link";
import AddProductModal from "../../../../components/dashboard/AddProductModal";
import { showModal } from "../../../../lib/modal";
import { getProductImage } from "../../../../lib/productImage";
import {
  Eye,
  Trash2,
  PackageSearch,
  MoreVertical,
  Mail,
  ImageOff,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Pencil,
} from "lucide-react";

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const [emailTarget, setEmailTarget] = useState(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const response = await fetch("/api/dashboard/products", { credentials: "include" });
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const data = await response.json();
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

  // close the 3-dot menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getStock = (product) => product.variants?.[0]?.inventory?.quantity ?? 0;
  const getImage = (product) => {
    const image = getProductImage(product);
    return image !== "/product1.png" ? image : null;
  };
  const getSeller = (product) => product.seller || {};

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const paginatedProducts = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToPage = (n) => {
    if (n < 1 || n > totalPages) return;
    setPage(n);
    setOpenMenuId(null);
  };

  const handleDelete = async (productId, productName) => {
    if (!(await showModal({ type: "confirm", title: "Delete product", message: `Delete product ${productName}?`, confirmLabel: "Delete" }))) return;

    try {
      const response = await fetch(`/api/dashboard/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Delete failed");

      setProducts((prev) => prev.filter((product) => product._id !== productId));
      if (selectedProduct?._id === productId) setSelectedProduct(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      await showModal({ title: "Delete failed", message: "Unable to delete product right now." });
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleProductAdded = (product) => {
    setProducts((previous) => [product, ...previous]);
    setPage(1);
  };

  const openEmailModal = (product) => {
    const seller = getSeller(product);
    setEmailTarget(product);
    setEmailSubject(`Regarding your product: ${product.name}`);
    setEmailMessage(`Hi ${seller.name || "there"},\n\n`);
    setEmailError(null);
    setEmailSent(false);
    setOpenMenuId(null);
  };

  const closeEmailModal = () => {
    setEmailTarget(null);
    setEmailSubject("");
    setEmailMessage("");
    setEmailError(null);
    setEmailSent(false);
  };

  const sendSellerEmail = async () => {
    if (!emailTarget) return;
    setSendingEmail(true);
    setEmailError(null);
    try {
      const seller = getSeller(emailTarget);
      if (!seller.email) throw new Error("Seller email is unavailable");
      window.location.href = `mailto:${seller.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailMessage)}`;
      setEmailSent(true);
    } catch (error) {
      console.error("Failed to email seller:", error);
      setEmailError("Couldn't send that email. Try again.");
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[28px] border border-rose-100 bg-linear-to-br from-white to-rose-50/40 p-6 shadow-[0_18px_40px_rgba(219,68,68,0.06)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold text-[#DB4444]">Catalog</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Products</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
              <PackageSearch size={16} className="text-[#DB4444]" />
              {products.length} items
            </div>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 rounded-full bg-[#DB4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#bf3636]"><Plus size={16} /> Add product</button>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-white p-8 text-slate-500">
          <Loader2 size={18} className="animate-spin" /> Loading products...
        </div>
      ) : loadError ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 p-8 text-sm text-red-600">{loadError}</div>
      ) : (
        <div className="overflow-visible rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3">Image</th>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Seller</th>
                  <th className="px-5 py-3">Vendor</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      No products to show.
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => {
                    const image = getImage(product);
                    const seller = getSeller(product);
                    return (
                      <tr key={product._id} className="border-t border-slate-100 transition-colors hover:bg-rose-50/30">
                        <td className="px-5 py-4">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                            {image ? (
                              <Image src={image} alt={product.name} width={48} height={48} unoptimized className="h-full w-full object-cover" />
                            ) : (
                              <ImageOff size={16} className="text-slate-300" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-800">{product.name}</td>
                        <td className="px-5 py-4 text-slate-600">
                          <p className="font-medium text-slate-700">{seller.name || "_"}</p>
                          {seller.email && <p className="text-xs text-slate-400">{seller.email}</p>}
                        </td>
                        <td className="px-5 py-4 text-slate-600">{product.vendor?.name || product.vendorId?.name || "-"}</td>
                        <td className="px-5 py-4 text-slate-800">${Number(product.basePrice || 0).toFixed(2)}</td>
                        <td className="px-5 py-4">
                          <span className={getStock(product) < 5 ? "font-semibold text-amber-600" : "text-slate-800"}>{getStock(product)}</span>
                          {getStock(product) < 5 && <span className="ml-2 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Low stock</span>}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              product.status === "active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {product.status || "draft"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="relative inline-block" ref={openMenuId === product._id ? menuRef : null}>
                            <button
                              onClick={() => setOpenMenuId(openMenuId === product._id ? null : product._id)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {openMenuId === product._id && (
                              <div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
                                <button
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setOpenMenuId(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Eye size={14} /> View details
                                </button>
                                <Link
                                  href={`/dashboard/admin/products/${product._id}/edit`}
                                  onClick={() => setOpenMenuId(null)}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Pencil size={14} /> Edit product
                                </Link>
                                <button
                                  onClick={() => openEmailModal(product)}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <Mail size={14} /> Email seller
                                </button>
                                <button
                                  onClick={() => handleDelete(product._id, product.name)}
                                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {products.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <p className="text-xs text-slate-500">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, products.length)} of {products.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce((acc, n, idx, arr) => {
                    if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…");
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, idx) =>
                    n === "…" ? (
                      <span key={`gap-${idx}`} className="px-1 text-xs text-slate-400">
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        onClick={() => goToPage(n)}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                          n === page ? "bg-[#DB4444] text-white" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View details modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
                  {getImage(selectedProduct) ? (
                    <Image
                      src={getImage(selectedProduct)}
                      alt={selectedProduct.name}
                      width={56}
                      height={56}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageOff size={18} className="text-slate-300" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#DB4444]">Product details</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{selectedProduct.name}</h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[11px] font-semibold text-slate-500">Price</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  ${Number(selectedProduct.basePrice || 0).toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[11px] font-semibold text-slate-500">Stock</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{getStock(selectedProduct)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-[11px] font-semibold text-slate-500">Status</p>
                <p className="mt-1 text-lg font-bold capitalize text-slate-900">{selectedProduct.status || "draft"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold text-slate-500">Seller</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {getSeller(selectedProduct).name || "_"}
              </p>
              {getSeller(selectedProduct).email && (
                <p className="text-xs text-slate-500">{getSeller(selectedProduct).email}</p>
              )}
            </div>

            <div className="mt-3 rounded-xl bg-slate-50 p-4">
              <p className="text-[11px] font-semibold text-slate-500">Vendor</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{selectedProduct.vendor?.name || "No vendor assigned"}</p>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              {selectedProduct.description || "No description available for this product."}
            </p>
          </div>
        </div>
      )}

      {/* Email seller modal */}
      {emailTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={closeEmailModal}
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {emailSent ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Email sent!</h3>
                <p className="text-sm text-slate-500">
                  {getSeller(emailTarget).name || "The seller"} has been notified about{" "}
                  <span className="font-semibold text-slate-700">{emailTarget.name}</span>.
                </p>
                <button
                  onClick={closeEmailModal}
                  className="mt-2 rounded-full bg-[#DB4444] px-5 py-2 text-sm font-semibold text-white hover:bg-[#c93b3b]"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[#DB4444]">Email seller</p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900">
                      {getSeller(emailTarget).name || "_"}
                    </h3>
                    {getSeller(emailTarget).email && (
                      <p className="text-xs text-slate-400">{getSeller(emailTarget).email}</p>
                    )}
                  </div>
                  <button onClick={closeEmailModal} className="text-slate-400 hover:text-slate-600">
                    ✕
                  </button>
                </div>

                <label className="mb-1 block text-xs font-semibold text-slate-500">Subject</label>
                <input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="mb-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#DB4444]/40"
                />

                <label className="mb-1 block text-xs font-semibold text-slate-500">Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={5}
                  className="mb-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#DB4444]/40"
                />

                {emailError && <p className="mb-3 text-xs text-red-500">{emailError}</p>}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={closeEmailModal}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendSellerEmail}
                    disabled={sendingEmail || !emailSubject.trim() || !emailMessage.trim()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#DB4444] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c93b3b] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sendingEmail && <Loader2 size={14} className="animate-spin" />}
                    Send email
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showAddModal && <AddProductModal isAdmin onClose={() => setShowAddModal(false)} onProductAdded={handleProductAdded} />}
    </div>
  );
}