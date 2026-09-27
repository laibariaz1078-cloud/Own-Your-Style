"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { showModal } from "../../lib/modal";

export default function AddProductModal({ onClose, onProductAdded, isAdmin = false }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    vendorId: "",
    vendorUnitCost: "",
    vendorPaidAmount: "",
    vendorPaymentDueDate: "",
  });
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/dashboard/admin/vendors", { credentials: "include" })
      .then((response) => response.json())
      .then((vendorData) => {
        setVendors(vendorData.vendors || []);
      })
      .catch(() => {
        setVendors([]);
      });
  }, [isAdmin]);

  const selectedVendor = vendors.find((vendor) => vendor._id === formData.vendorId);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.image.trim()) {
      setError("Product image is required");
      return;
    }

    if (isAdmin && !formData.vendorId) {
      setError("Please select a vendor");
      return;
    }

    const price = Number(formData.price);
    const stock = Number(formData.stock || 0);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Enter a valid price greater than 0");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setError("Enter a valid stock quantity");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/dashboard/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          categoryIds: formData.category ? [formData.category] : [],
          vendorId: isAdmin ? formData.vendorId : undefined,
          vendorUnitCost: isAdmin ? formData.vendorUnitCost : undefined,
          vendorPaidAmount: isAdmin ? formData.vendorPaidAmount : undefined,
          vendorPaymentDueDate: isAdmin ? formData.vendorPaymentDueDate : undefined,
          basePrice: price,
          images: [{ url: formData.image }],
          variants: [
            {
              sku: `${formData.name.trim().toUpperCase().replace(/\s+/g, "-")}-${Date.now()}`,
              price,
              inventory: { quantity: stock },
            },
          ],
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.pending) {
          await showModal({ variant: "success", title: "Waiting for approval", message: data.message || "Your product was submitted for admin approval." });
        } else if (data.product) {
          onProductAdded(data.product);
        }
        onClose();
      } else {
        setError(data.error || data.message || "Failed to add product");
      }
    } catch (err) {
      setError("Something went wrong while adding the product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#DB4444] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#DB4444] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isAdmin && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700">Vendor</label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-[#DB4444] focus:outline-none"
                >
                  <option value="">Select vendor</option>
                  {vendors.map((vendor) => <option key={vendor._id} value={vendor._id}>{vendor.name}</option>)}
                </select>
              </div>
            )}
            {isAdmin && selectedVendor && (
              <div className="col-span-2 rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                <p className="text-sm font-semibold text-slate-900">Vendor supply record</p>
                <p className="mt-1 text-xs text-slate-500">Stock below 5 will be marked low stock for admin.</p>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <label className="text-sm font-medium text-slate-700">Vendor unit cost ($)
                    <input type="number" min="0" step="0.01" name="vendorUnitCost" value={formData.vendorUnitCost} onChange={handleChange} placeholder="0.00" className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900" />
                  </label>
                  <label className="text-sm font-medium text-slate-700">Paid to vendor ($)
                    <input type="number" min="0" step="0.01" name="vendorPaidAmount" value={formData.vendorPaidAmount} onChange={handleChange} placeholder="0.00" className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900" />
                  </label>
                  <label className="col-span-2 text-sm font-medium text-slate-700">Payment due date
                    <input type="date" name="vendorPaymentDueDate" value={formData.vendorPaymentDueDate} onChange={handleChange} className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900" />
                  </label>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#DB4444] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#DB4444] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Stock</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#DB4444] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Image URL *</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              required
              placeholder="https://..."
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-[#DB4444] focus:outline-none"
            />
            {formData.image && (
              <Image
                src={formData.image}
                alt="Preview"
                width={96}
                height={96}
                unoptimized
                className="mt-2 h-24 w-24 rounded-lg object-cover"
              />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#DB4444] px-6 py-2 text-sm font-medium text-white hover:bg-[#bf3636] disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Product"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}