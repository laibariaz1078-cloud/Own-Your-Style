import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../../../../lib/dbConnect";
import Vendor from "../../../../../../../models/Vendor";
import Product from "../../../../../../../models/Product";
import Order from "../../../../../../../models/Order";
import { getAuthUser } from "../../../../../../../lib/auth";

export async function GET(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid vendor" }, { status: 400 });
    }

    await dbConnect();

    // Get vendor
    const vendor = await Vendor.findById(id).lean();
    if (!vendor) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
    }

    const productStats = await Product.aggregate([
      { $match: { vendorId: mongoose.Types.ObjectId.createFromHexString(id) } },
      { $project: {
        stock: { $ifNull: [{ $arrayElemAt: ["$variants.inventory.quantity", 0] }, 0] },
        purchaseValue: { $multiply: [{ $ifNull: ["$vendorUnitCost", 0] }, { $ifNull: [{ $arrayElemAt: ["$variants.inventory.quantity", 0] }, 0] }] },
        paidAmount: { $ifNull: ["$vendorPaidAmount", 0] },
        paymentDue: { $ifNull: ["$vendorPaymentDue", 0] },
      } },
      { $group: { _id: null, productCount: { $sum: 1 }, stock: { $sum: "$stock" }, purchaseValue: { $sum: "$purchaseValue" }, paidAmount: { $sum: "$paidAmount" }, paymentDue: { $sum: "$paymentDue" }, lowStock: { $sum: { $cond: [{ $lt: ["$stock", 5] }, 1, 0] } } } },
    ]);

    // Get vendor revenue from orders
    const vendorOrders = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.vendorId": mongoose.Types.ObjectId.createFromHexString(id) } },
      { $group: { _id: null, totalRevenue: { $sum: "$items.lineTotal" }, totalOrders: { $sum: 1 } } },
    ]);

    const vendorStats = vendorOrders[0] || { totalRevenue: 0, totalOrders: 0 };

    return NextResponse.json({
      success: true,
      vendor: {
        ...vendor,
        ...(productStats[0] || { productCount: 0, stock: 0, purchaseValue: 0, paidAmount: 0, paymentDue: 0, lowStock: 0 }),
        totalRevenue: vendorStats.totalRevenue,
        totalOrders: vendorStats.totalOrders,
      },
    });
  } catch (error) {
    console.error("Vendor stats error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid vendor" }, { status: 400 });
    }

    const body = await request.json();
    const { name, contactName, email, phone, address, status, rating, reliabilityScore } = body;

    if (!String(name || "").trim()) {
      return NextResponse.json({ success: false, error: "Vendor name is required" }, { status: 400 });
    }

    await dbConnect();

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      {
        name: name?.trim(),
        contactName: contactName?.trim() || "",
        email: email?.trim().toLowerCase() || "",
        phone: phone?.trim() || "",
        address: address?.trim() || "",
        status: status || "active",
        rating: rating !== undefined ? Math.min(5, Math.max(0, rating)) : undefined,
        reliabilityScore: reliabilityScore !== undefined ? Math.min(100, Math.max(0, reliabilityScore)) : undefined,
      },
      { new: true }
    );

    if (!vendor) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, vendor });
  } catch (error) {
    console.error("Vendor update error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
