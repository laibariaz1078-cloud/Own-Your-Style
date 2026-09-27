"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Star,
  Building2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function VendorEditPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id;

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
    rating: 0,
    reliabilityScore: 100,
  });

  useEffect(() => {
    const loadVendor = async () => {
      try {
        const response = await fetch(`/api/dashboard/admin/vendors/${vendorId}/stats`, {
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to load vendor");
        setVendor(data.vendor);
        setFormData({
          name: data.vendor.name,
          contactName: data.vendor.contactName || "",
          email: data.vendor.email || "",
          phone: data.vendor.phone || "",
          address: data.vendor.address || "",
          status: data.vendor.status || "active",
          rating: data.vendor.rating || 0,
          reliabilityScore: data.vendor.reliabilityScore || 100,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) loadVendor();
  }, [vendorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" || name === "reliabilityScore" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch(`/api/dashboard/admin/vendors/${vendorId}/stats`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update vendor");

      setSuccess("Vendor updated successfully!");
      setVendor(data.vendor);
      setTimeout(() => router.push("/dashboard/admin/vendors"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-slate-500">
        <Loader2 size={18} className="animate-spin" /> Loading vendor...
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/admin/vendors" className="inline-flex items-center gap-2 text-[#DB4444] hover:text-[#bf3636]">
          <ArrowLeft size={16} /> Back to Vendors
        </Link>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
          Vendor not found
        </div>
      </div>
    );
  }

  const initials = vendor.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const reliabilityColor =
    formData.reliabilityScore >= 80
      ? "#1F9D55"
      : formData.reliabilityScore >= 50
      ? "#DB9E44"
      : "#DB4444";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard/admin/vendors" className="inline-flex items-center gap-2 text-sm text-[#DB4444] hover:text-[#bf3636]">
        <ArrowLeft size={16} /> Back to Vendors
      </Link>

      <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#DB4444]/10 text-lg font-semibold text-[#DB4444]">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-slate-900">{vendor.name}</h1>
          <p className="mt-0.5 text-sm text-slate-500">Editing vendor profile</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-600">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-600">
          <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Business details</h2>

          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Vendor name</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 focus-within:border-[#DB4444]">
                <Building2 size={16} className="flex-shrink-0 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full py-2.5 text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Contact person</label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-[#DB4444] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 focus-within:border-[#DB4444]">
                <Mail size={16} className="flex-shrink-0 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full py-2.5 text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 focus-within:border-[#DB4444]">
                <Phone size={16} className="flex-shrink-0 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full py-2.5 text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">Address</label>
              <div className="flex gap-2 rounded-xl border border-slate-300 px-3 focus-within:border-[#DB4444]">
                <MapPin size={16} className="mt-3 flex-shrink-0 text-slate-400" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full resize-none py-2.5 text-slate-900 placeholder-slate-400 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Standing</h2>

          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Status</label>
              <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: "active" }))}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    formData.status === "active"
                      ? "bg-[#1F9D55] text-white"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, status: "inactive" }))}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    formData.status === "inactive"
                      ? "bg-slate-500 text-white"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Inactive
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, rating: n }))}
                    className="p-0.5"
                  >
                    <Star
                      size={22}
                      className={n <= Math.round(formData.rating) ? "fill-[#DB9E44] text-[#DB9E44]" : "text-slate-300"}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-slate-500">{formData.rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Reliability score</label>
                <span className="text-sm font-semibold" style={{ color: reliabilityColor }}>
                  {formData.reliabilityScore}
                </span>
              </div>
              <input
                type="range"
                name="reliabilityScore"
                value={formData.reliabilityScore}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                className="w-full accent-[#DB4444]"
                style={{ accentColor: reliabilityColor }}
              />
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${formData.reliabilityScore}%`, backgroundColor: reliabilityColor }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[#DB4444] px-6 py-2.5 font-semibold text-white transition hover:bg-[#bf3636] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
          <Link
            href="/dashboard/admin/vendors"
            className="rounded-full border border-slate-300 px-6 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}