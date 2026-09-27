import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import { getAuthUser } from "../../../../lib/auth";
import Category from "../../../../models/Category";
import { createApprovalRequest } from "../../../../controllers/approvalController";
import ApprovalRequest from "../../../../models/ApprovalRequest";

function canManageCategories(user) {
  return user?.role === "admin" || user?.role === "seller";
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!canManageCategories(user)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: user ? 403 : 401 });
    }

    await dbConnect();
    const categories = await Category.find({})
      .populate("parentId", "name")
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const pendingRequests = user.role === "seller"
      ? await ApprovalRequest.find({ requestedBy: user._id, entityType: "category", status: "pending" }).lean()
      : [];

    const pendingUpdates = new Map(
      pendingRequests
        .filter((request) => request.operation === "update")
        .map((request) => [request.targetId.toString(), request])
    );

    const result = categories.map((category) => ({
      ...category,
      approvalStatus: pendingUpdates.has(category._id.toString()) ? "pending" : "approved",
      approvalRequestId: pendingUpdates.get(category._id.toString())?._id || null,
      canManage: user.role === "admin"
        || category.ownerId?.toString() === user._id.toString(),
    }));

    const pendingCategories = pendingRequests.map((request) => ({
      ...request.payload,
      _id: `pending-${request._id}`,
      approvalStatus: "pending",
      approvalRequestId: request._id,
      canManage: false,
      createdAt: request.createdAt,
    }));

    return NextResponse.json({ success: true, categories: [...pendingCategories, ...result], userRole: user.role });
  } catch (error) {
    console.error("Categories GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!canManageCategories(user)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: user ? 403 : 401 });
    }

    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ success: false, error: "Category name is required" }, { status: 400 });
    }

    await dbConnect();
    const parent = body.parentId ? await Category.findById(body.parentId).lean() : null;
    if (body.parentId && !parent) {
      return NextResponse.json({ success: false, error: "Parent category not found" }, { status: 400 });
    }

    if (user.role === "seller") {
      const approval = await createApprovalRequest({
        userId: user._id,
        operation: "create",
        entityType: "category",
        payload: {
          name,
          slug: `${slugify(name)}-${Date.now().toString(36)}`,
          description: String(body.description || "").trim(),
          parentId: parent?._id || null,
          path: parent ? [...(parent.path || []), parent._id] : [],
          level: parent ? parent.level + 1 : 0,
          isActive: body.isActive !== false,
          sortOrder: Number(body.sortOrder) || 0,
          ownerId: user._id,
        },
      });
      return NextResponse.json({ success: true, pending: true, requestId: approval._id, message: "Category submitted for admin approval" }, { status: 202 });
    }

    const category = await Category.create({
      name,
      slug: `${slugify(name)}-${Date.now().toString(36)}`,
      description: String(body.description || "").trim(),
      parentId: parent?._id || null,
      path: parent ? [...(parent.path || []), parent._id] : [],
      level: parent ? parent.level + 1 : 0,
      isActive: body.isActive !== false,
      sortOrder: Number(body.sortOrder) || 0,
      ownerId: user.role === "seller" ? user._id : null,
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error("Categories POST error:", error);
    return NextResponse.json({ success: false, error: "Unable to create category" }, { status: 500 });
  }
}