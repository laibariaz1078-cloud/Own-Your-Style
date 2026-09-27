"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, X, ImagePlus } from "lucide-react";
import { showModal } from "../../../../../lib/modal";

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    image: "",
    status: "active",
    sku: "",
    variantPrice: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/dashboard/upload", {
        method: "POST",
        credentials: "include",
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        const imageUrl = data.imageUrl || data.url;
        setUploadedImageUrl(imageUrl);
        setFormData((prev) => ({ ...prev, image: imageUrl }));
      } else {
        await showModal({ title: "Upload failed", message: "Failed to upload image" });
        setImagePreview("");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      await showModal({ title: "Upload failed", message: "Error uploading image" });
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setUploadedImageUrl("");
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/dashboard/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          categoryIds: formData.category ? [formData.category] : [],
          basePrice: formData.price,
          images: formData.image ? [{ url: formData.image }] : [],
          status: formData.status,
          variants: [{
            sku: formData.sku || `${formData.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
            price: formData.variantPrice || formData.price,
            inventory: { quantity: formData.stock },
          }],
        }),
      });

      if (res.ok) {
        router.push("/dashboard/seller/products");
      } else {
        await showModal({ title: "Product creation failed", message: "Failed to create product" });
      }
    } catch (error) {
      console.error("Failed to create product:", error);
      await showModal({ title: "Product creation failed", message: "Error creating product" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/seller/products" className="flex items-center gap-2 text-brand hover:text-brand/80">
        <ArrowLeft size={20} />
        Back to Products
      </Link>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Add New Product</h1>

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
              placeholder="Product name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand focus:outline-none"
              placeholder="Product description"
              rows="4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Product Image</label>

            {imagePreview ? (
              <div className="relative mt-2 h-48 w-48 overflow-hidden rounded-lg border border-gray-300">
                <Image src={imagePreview} alt="Preview" width={192} height={192} unoptimized className="h-full w-full object-cover" />
                {uploadingImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-white">
                    Uploading...
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="mt-2 flex h-48 w-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 text-center hover:border-brand hover:bg-blue-50">
                <Upload size={22} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                <span className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            )}

            <button
              type="button"
              onClick={() => setShowUrlInput((prev) => !prev)}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-brand hover:underline"
            >
              <ImagePlus size={14} />
              {showUrlInput ? "Hide URL option" : "Or paste an image URL instead"}
            </button>

            {showUrlInput && (
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="mt-2 w-full max-w-md rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand focus:outline-none"
                placeholder="https://example.com/image.jpg"
              />
            )}
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
                placeholder="e.g., Electronics"
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
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand focus:outline-none"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="rounded border border-gray-200 bg-gray-50 p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Variant Details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand focus:outline-none"
                  placeholder="Auto-generated if empty"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Variant Price ($)</label>
                <input
                  type="number"
                  name="variantPrice"
                  value={formData.variantPrice}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-brand focus:outline-none"
                  placeholder="Uses base price if empty"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="rounded bg-brand px-6 py-2 text-white hover:bg-brand/90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Product"}
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