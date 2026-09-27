"use client";

import { useEffect, useState } from "react";
import { FolderTree, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { showModal } from "../../lib/modal";

const emptyForm = { name: "", description: "", parentId: "", isActive: true, sortOrder: 0 };

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userRole, setUserRole] = useState("");

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/dashboard/categories", { credentials: "include" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to load categories");
      setCategories(data.categories || []);
      setUserRole(data.userRole || "");
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    fetch("/api/dashboard/categories", { credentials: "include" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load categories");
        if (active) {
          setCategories(data.categories || []);
          setUserRole(data.userRole || "");
          setError("");
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const resetForm = () => { setForm(emptyForm); setEditingId(null); };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(editingId ? `/api/dashboard/categories/${editingId}` : "/api/dashboard/categories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, sortOrder: Number(form.sortOrder) || 0 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save category");
      resetForm();
      await loadCategories();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  const editCategory = (category) => {
    setForm({
      name: category.name,
      description: category.description || "",
      parentId: category.parentId?._id || category.parentId || "",
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder || 0,
    });
    setEditingId(category._id);
  };

  const deleteCategory = async (category) => {
    if (!(await showModal({ type: "confirm", title: "Delete category", message: `Delete category "${category.name}"?`, confirmLabel: "Delete" }))) return;
    const response = await fetch(`/api/dashboard/categories/${category._id}`, { method: "DELETE", credentials: "include" });
    const data = await response.json();
    if (!response.ok) setError(data.error || "Unable to delete category");
    else await loadCategories();
  };

  const visibleCategories = categories.filter((category) => {
    if (userRole !== "seller" || categoryFilter === "all") return true;
    if (categoryFilter === "mine") return category.canManage;
    return !category.canManage;
  });

  const getCategoryStatus = (category) => category.approvalStatus === "pending" ? "Waiting for approval" : category.isActive === false ? "Deactive" : "Active";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><p className="text-sm font-medium uppercase tracking-[0.18em] text-[#DB4444]">Catalog</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Categories</h1></div>
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-sm"><FolderTree size={16} className="text-[#DB4444]" /> {categories.length} categories</div>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold text-slate-900">{editingId ? "Edit category" : "Add category"}</h2>{editingId && <button type="button" onClick={resetForm} aria-label="Cancel editing" className="text-slate-400 hover:text-slate-700"><X size={18} /></button>}</div>
          <label className="block text-sm font-medium text-slate-700">Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#DB4444]" placeholder="e.g. Electronics" /></label>
          <label className="block text-sm font-medium text-slate-700">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#DB4444]" /></label>
          <label className="block text-sm font-medium text-slate-700">Parent category<select value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-[#DB4444]"><option value="">No parent</option>{categories.filter((category) => category._id !== editingId).map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-3"><label className="block text-sm font-medium text-slate-700">Sort order<input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#DB4444]" /></label><label className="flex items-end gap-2 pb-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 accent-[#DB4444]" /> Active</label></div>
          <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#DB4444] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#bf3636] disabled:opacity-60">{saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}{editingId ? "Update category" : "Create category"}</button>
        </form>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><h2 className="font-semibold text-slate-900">{userRole === "seller" ? "Seller categories" : "All categories"}</h2>{userRole === "seller" && <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} aria-label="Filter categories" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#DB4444]"><option value="all">All Categories</option><option value="others">Categories Created by Others</option><option value="mine">Categories Added by Me</option></select>}</div>{loading ? <div className="flex items-center gap-2 p-8 text-sm text-slate-500"><Loader2 size={16} className="animate-spin" /> Loading categories...</div> : visibleCategories.length === 0 ? <div className="p-8 text-center text-sm text-slate-400">No categories in this filter.</div> : <div className="divide-y divide-slate-100">{visibleCategories.map((category) => <div key={category._id} className="flex items-center justify-between gap-3 px-5 py-4"><div className="min-w-0"><p className="truncate font-medium text-slate-800">{category.name}</p><p className="mt-1 truncate text-xs text-slate-500">{category.parentId?.name ? `Under ${category.parentId.name}` : "Top-level"}{category.description ? ` · ${category.description}` : ""}</p></div><div className="flex shrink-0 items-center gap-1"><span className={`mr-2 rounded-full px-2 py-1 text-[11px] font-semibold ${category.approvalStatus === "pending" ? "bg-amber-50 text-amber-700" : category.isActive === false ? "bg-slate-100 text-slate-500" : "bg-emerald-50 text-emerald-600"}`}>{getCategoryStatus(category)}</span>{category.canManage && <><button onClick={() => editCategory(category)} aria-label={`Edit ${category.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Pencil size={16} /></button><button onClick={() => deleteCategory(category)} aria-label={`Delete ${category.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button></>}</div></div>)}</div>}</div>
      </div>
    </div>
  );
}