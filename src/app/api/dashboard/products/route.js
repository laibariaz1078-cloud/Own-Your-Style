import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../lib/dbConnect";
import Product from "../../../../models/Product";
import User from "../../../../models/User";
import Vendor from "../../../../models/Vendor";
import { getAuthUser } from "../../../../lib/auth";
import { isBuyerRole } from "../../../../lib/permissions";
import { createApprovalRequest } from "../../../../controllers/approvalController";
import ApprovalRequest from "../../../../models/ApprovalRequest";

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    let query = {};
    if (user.role === "seller") {
      query = { sellerId: user._id };
    } else if (isBuyerRole(user.role)) {
      query = { status: "active" };
    }

    const products = await Product.find(query)
      .populate("sellerId", "firstName lastName email storeName")
      .populate("vendorId", "name contactName email phone")
      .sort({ createdAt: -1 })
      .lean();

    const pendingRequests = user.role === "seller"
      ? await ApprovalRequest.find({ requestedBy: user._id, entityType: "product", status: "pending" }).lean()
      : [];

    const pendingUpdates = new Map(
      pendingRequests
        .filter((request) => request.operation === "update")
        .map((request) => [request.targetId.toString(), request])
    );

    const productsWithSeller = products.map((product) => ({
      ...product,
      approvalStatus: pendingUpdates.has(product._id.toString()) ? "pending" : "approved",
      approvalRequestId: pendingUpdates.get(product._id.toString())?._id || null,
      seller: product.sellerId
        ? {
            _id: product.sellerId._id,
            name: `${product.sellerId.firstName} ${product.sellerId.lastName || ""}`.trim() || product.sellerId.storeName || "Seller",
            email: product.sellerId.email,
          }
        : null,
      vendor: product.vendorId || null,
    }));

    const pendingProducts = pendingRequests
      .filter((request) => request.operation === "create")
      .map((request) => ({
        ...request.payload,
        _id: `pending-${request._id}`,
        approvalStatus: "pending",
        approvalRequestId: request._id,
        createdAt: request.createdAt,
      }));

    return NextResponse.json({ success: true, products: [...pendingProducts, ...productsWithSeller] });
  } catch (error) {
    console.error("Products GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();

    if (!user || (user.role !== "seller" && user.role !== "admin")) {
      return NextResponse.json({ success: false, error: "Only sellers and admins can add products" }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, categoryIds, basePrice, image, images, status, variants, sellerId, vendorId, vendorUnitCost, vendorPaidAmount, vendorPaymentDue, vendorPaymentDueDate } = body;

    if (!name || !basePrice) {
      return NextResponse.json({ success: false, error: "Name and price are required" }, { status: 400 });
    }

    await dbConnect();

    // For sellers: seller is always the current user
    // For admins: vendor is required, seller is optional
    if (user.role === "seller") {
      const productSellerId = user._id;
      if (!productSellerId) {
        return NextResponse.json({ success: false, error: "Select a seller for this product" }, { status: 400 });
      }
    } else if (user.role === "admin") {
      // Admin must select a vendor
      if (!vendorId) {
        return NextResponse.json({ success: false, error: "Please select a vendor for this product" }, { status: 400 });
      }
      if (!mongoose.isValidObjectId(vendorId) || !(await Vendor.exists({ _id: vendorId }))) {
        return NextResponse.json({ success: false, error: "Selected vendor not found" }, { status: 400 });
      }
    }

    if (vendorId) {
      if (!mongoose.isValidObjectId(vendorId) || !(await Vendor.exists({ _id: vendorId }))) {
        return NextResponse.json({ success: false, error: "Selected vendor not found" }, { status: 400 });
      }
    }

    const finalImages = images && images.length ? images : image ? [{ url: image }] : [];
    const normalizedVendorUnitCost = Math.max(0, Number(vendorUnitCost) || 0);
    const normalizedVendorPaidAmount = Math.max(0, Number(vendorPaidAmount) || 0);
    const normalizedVendorPaymentDue = vendorPaymentDue === undefined
      ? Math.max(0, normalizedVendorUnitCost * (Number(variants?.[0]?.inventory?.quantity) || 0) - normalizedVendorPaidAmount)
      : Math.max(0, Number(vendorPaymentDue) || 0);
    const normalizedVendorPaymentDueDate = vendorPaymentDueDate ? new Date(vendorPaymentDueDate) : null;

    if (user.role === "seller") {
      const approval = await createApprovalRequest({
        userId: user._id,
        operation: "create",
        entityType: "product",
        payload: {
          name,
          description: description || "",
          categoryIds: categoryIds || [],
          basePrice: Number(basePrice),
          images: finalImages,
          status: status === "draft" ? "draft" : "active",
          sellerId: user._id,
          vendorId: vendorId || null,
          vendorUnitCost: normalizedVendorUnitCost,
          vendorPaidAmount: normalizedVendorPaidAmount,
          vendorPaymentDue: normalizedVendorPaymentDue,
          vendorPaymentDueDate: normalizedVendorPaymentDueDate,
          variants: (variants || []).map((variant) => ({
            sku: variant.sku,
            price: Number(variant.price) || Number(basePrice),
            inventory: { quantity: Number(variant?.inventory?.quantity) || 0 },
          })),
        },
      });
      return NextResponse.json({ success: true, pending: true, requestId: approval._id, message: "Product submitted for admin approval" }, { status: 202 });
    }

    // Admin creates product directly with vendor
    const product = await Product.create({
      name,
      description: description || "",
      categoryIds: categoryIds || [],
      basePrice: Number(basePrice),
      images: finalImages,
      status: status === "draft" ? "draft" : "active",
      sellerId: user.role === "seller" ? user._id : null,
      vendorId: vendorId || null,
      vendorUnitCost: normalizedVendorUnitCost,
      vendorPaidAmount: normalizedVendorPaidAmount,
      vendorPaymentDue: normalizedVendorPaymentDue,
      vendorPaymentDueDate: normalizedVendorPaymentDueDate,
      variants: (variants || []).map((variant) => ({
        sku: variant.sku,
        price: Number(variant.price) || Number(basePrice),
        inventory: { quantity: Number(variant?.inventory?.quantity) || 0 },
      })),
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("Products POST error:", error);
    if (error?.name === "ValidationError") {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
