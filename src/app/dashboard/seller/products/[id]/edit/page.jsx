"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { showModal } from "../../../../../../lib/modal";

export default function EditProduct({ params }) {
  const router = useRouter();
  const { id } = params;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image: "",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/dashboard/products/${id}`, { credentials: "include" });
        const data = await res.json();

        if (data.success) {
          const product = data.product;
          setFormData({
            name: product.name || "",
            description: product.description || "",
            category: product.categoryIds?.[0] || "",
            price: product.basePrice || "",
            stock: product.variants?.[0]?.inventory?.quantity || "",
            image: product.images?.[0]?.url || "",
          });
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/dashboard/products/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          categoryIds: formData.category ? [formData.category] : [],
          basePrice: formData.price,
          images: formData.image ? [{ url: formData.image }] : [],
        }),
      });

      if (res.ok) {
        router.push("/dashboard/seller/products");
      } else {
        await showModal({ title: "Update failed", message: "Failed to update product" });
      }
    } catch (error) {
      console.error("Failed to update product:", error);
      await showModal({ title: "Update failed", message: "Error updating product" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/seller/products" className="flex items-center gap-2 text-brand hover:text-brand/80">
        <ArrowLeft size={20} />
        Back to Products
      </Link>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Product</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand focus:outline-none"
              rows="4"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                step="0.01"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-brand px-6 py-2 text-white hover:bg-brand/90 disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Product"}
            </button>
            <Link
              href="/dashboard/seller/products"
              className="rounded border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
