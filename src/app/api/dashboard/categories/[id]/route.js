import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../../lib/dbConnect";
import { getAuthUser } from "../../../../../lib/auth";
import Category from "../../../../../models/Category";
import Product from "../../../../../models/Product";
import { createApprovalRequest } from "../../../../../controllers/approvalController";

function canManageCategories(user) {
  return user?.role === "admin" || user?.role === "seller";
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!canManageCategories(user)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: user ? 403 : 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid category" }, { status: 400 });
    }
    const body = await request.json();
    await dbConnect();
    const categoryQuery = user.role === "admin"
      ? { _id: id }
      : { _id: id, ownerId: user._id };
    const category = await Category.findOne(categoryQuery);
    if (!category) return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });

    if (user.role === "seller") {
      const update = {};
      if (body.name !== undefined) {
        const name = String(body.name).trim();
        if (!name) return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
        update.name = name;
        update.slug = `${slugify(name)}-${Date.now().toString(36)}`;
      }
      if (body.description !== undefined) update.description = String(body.description).trim();
      if (body.isActive !== undefined) update.isActive = Boolean(body.isActive);
      if (body.sortOrder !== undefined) update.sortOrder = Number(body.sortOrder) || 0;
      if (body.parentId !== undefined) {
        if (body.parentId && (!mongoose.isValidObjectId(body.parentId) || body.parentId === id)) return NextResponse.json({ success: false, error: "Invalid parent category" }, { status: 400 });
        const parent = body.parentId ? await Category.findById(body.parentId).lean() : null;
        if (body.parentId && !parent) return NextResponse.json({ success: false, error: "Parent category not found" }, { status: 400 });
        if (parent?.path?.some((ancestor) => ancestor.toString() === id)) return NextResponse.json({ success: false, error: "A category cannot be its own descendant" }, { status: 400 });
        update.parentId = parent?._id || null;
        update.path = parent ? [...(parent.path || []), parent._id] : [];
        update.level = parent ? parent.level + 1 : 0;
      }
      const approval = await createApprovalRequest({ userId: user._id, operation: "update", entityType: "category", targetId: category._id, payload: update });
      return NextResponse.json({ success: true, pending: true, requestId: approval._id, message: "Category update submitted for admin approval" }, { status: 202 });
    }

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
      category.name = name;
      category.slug = `${slugify(name)}-${Date.now().toString(36)}`;
    }
    if (body.description !== undefined) category.description = String(body.description).trim();
    if (body.isActive !== undefined) category.isActive = Boolean(body.isActive);
    if (body.sortOrder !== undefined) category.sortOrder = Number(body.sortOrder) || 0;
    if (body.parentId !== undefined) {
      if (body.parentId && (!mongoose.isValidObjectId(body.parentId) || body.parentId === id)) {
        return NextResponse.json({ success: false, error: "Invalid parent category" }, { status: 400 });
      }
      const parent = body.parentId ? await Category.findById(body.parentId).lean() : null;
      if (body.parentId && !parent) return NextResponse.json({ success: false, error: "Parent category not found" }, { status: 400 });
      if (parent?.path?.some((ancestor) => ancestor.toString() === id)) {
        return NextResponse.json({ success: false, error: "A category cannot be its own descendant" }, { status: 400 });
      }
      category.parentId = parent?._id || null;
      category.path = parent ? [...(parent.path || []), parent._id] : [];
      category.level = parent ? parent.level + 1 : 0;
    }

    await category.save();
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Category PATCH error:", error);
    return NextResponse.json({ success: false, error: "Unable to update category" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!canManageCategories(user)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: user ? 403 : 401 });
    }
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, error: "Invalid category" }, { status: 400 });
    await dbConnect();
    const categoryQuery = user.role === "admin"
      ? { _id: id }
      : { _id: id, ownerId: user._id };
    const category = await Category.findOne(categoryQuery).lean();
    if (!category) return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    if (await Category.exists({ parentId: id })) {
      return NextResponse.json({ success: false, error: "Move or delete child categories first" }, { status: 409 });
    }
    if (await Product.exists({ categoryIds: id })) {
      return NextResponse.json({ success: false, error: "This category is assigned to a product" }, { status: 409 });
    }
    if (user.role === "seller") {
      const approval = await createApprovalRequest({ userId: user._id, operation: "delete", entityType: "category", targetId: id, payload: {} });
      return NextResponse.json({ success: true, pending: true, requestId: approval._id, message: "Category deletion submitted for admin approval" }, { status: 202 });
    }
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Category DELETE error:", error);
    return NextResponse.json({ success: false, error: "Unable to delete category" }, { status: 500 });
  }
}