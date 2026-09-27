import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../../lib/dbConnect";
import Product from "../../../../../models/Product";
import Vendor from "../../../../../models/Vendor";
import { getAuthUser } from "../../../../../lib/auth";
import { createApprovalRequest } from "../../../../../controllers/approvalController";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const product = await Product.findById(id).populate("vendorId", "name contactName email phone").lean();

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (user.role === "seller" && product.sellerId.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Product GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (user.role === "seller" && product.sellerId.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, categoryIds, basePrice, image, images, status, stock, vendorId, vendorUnitCost, vendorPaidAmount, vendorPaymentDue } = body;

    if (user.role === "seller") {
      const update = {};
      if (name !== undefined) update.name = name;
      if (description !== undefined) update.description = description;
      if (categoryIds !== undefined) update.categoryIds = categoryIds;
      if (basePrice !== undefined) update.basePrice = Number(basePrice);
      if (status !== undefined) update.status = status;
      if (vendorId !== undefined) update.vendorId = vendorId || null;
      if (vendorUnitCost !== undefined) update.vendorUnitCost = Math.max(0, Number(vendorUnitCost) || 0);
      if (vendorPaidAmount !== undefined) update.vendorPaidAmount = Math.max(0, Number(vendorPaidAmount) || 0);
      if (vendorPaymentDue !== undefined) update.vendorPaymentDue = Math.max(0, Number(vendorPaymentDue) || 0);
      if (images !== undefined) update.images = images;
      else if (image !== undefined) update.images = image ? [{ url: image }] : [];
      if (stock !== undefined) {
        update.variants = product.variants.length
          ? product.variants.map((variant, index) => index === 0 ? { ...variant.toObject(), inventory: { quantity: Number(stock) } } : variant.toObject())
          : [{ sku: `${product.name.toLowerCase()}-${Date.now()}`, price: product.basePrice, inventory: { quantity: Number(stock) } }];
      }
      const approval = await createApprovalRequest({ userId: user._id, operation: "update", entityType: "product", targetId: product._id, payload: update });
      return NextResponse.json({ success: true, pending: true, requestId: approval._id, message: "Product update submitted for admin approval" }, { status: 202 });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (categoryIds !== undefined) product.categoryIds = categoryIds;
    if (basePrice !== undefined) product.basePrice = Number(basePrice);
    if (status !== undefined) product.status = status;
    if (vendorId !== undefined) {
      if (vendorId && (!mongoose.isValidObjectId(vendorId) || !(await Vendor.exists({ _id: vendorId })))) {
        return NextResponse.json({ success: false, error: "Selected vendor not found" }, { status: 400 });
      }
      product.vendorId = vendorId || null;
    }
    if (vendorUnitCost !== undefined) product.vendorUnitCost = Math.max(0, Number(vendorUnitCost) || 0);
    if (vendorPaidAmount !== undefined) product.vendorPaidAmount = Math.max(0, Number(vendorPaidAmount) || 0);
    if (vendorPaymentDue !== undefined) product.vendorPaymentDue = Math.max(0, Number(vendorPaymentDue) || 0);
    if (images !== undefined) product.images = images;
    else if (image !== undefined) product.images = image ? [{ url: image }] : [];

    if (stock !== undefined) {
      if (!product.variants.length) {
        product.variants.push({ sku: `${product.name.toLowerCase()}-${Date.now()}`, price: product.basePrice, inventory: { quantity: Number(stock) } });
      } else {
        product.variants[0].inventory.quantity = Number(stock);
      }
    }

    await product.save();

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error("Product PUT error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (user.role === "seller" && product.sellerId.toString() !== user._id.toString()) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (user.role === "seller") {
      const approval = await createApprovalRequest({ userId: user._id, operation: "delete", entityType: "product", targetId: product._id, payload: {} });
      return NextResponse.json({ success: true, pending: true, requestId: approval._id, message: "Product deletion submitted for admin approval" }, { status: 202 });
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Product DELETE error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
