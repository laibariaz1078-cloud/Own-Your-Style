import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Vendor from "../../../../../models/Vendor";
import Product from "../../../../../models/Product";
import User from "../../../../../models/User";
import { getAuthUser } from "../../../../../lib/auth";
import { hashPassword } from "../../../../../lib/auth";

async function requireAdmin() {
  const user = await getAuthUser();
  return user?.role === "admin" ? user : null;
}

export async function GET() {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const [vendors, productStats] = await Promise.all([
      Vendor.find({}).sort({ createdAt: -1 }).lean(),
      Product.aggregate([
        { $match: { vendorId: { $ne: null } } },
        { $project: {
          vendorId: 1,
          stock: { $sum: { $map: { input: { $ifNull: ["$variants", []] }, as: "variant", in: { $ifNull: ["$$variant.inventory.quantity", 0] } } } },
          purchaseValue: { $multiply: [
            { $ifNull: ["$vendorUnitCost", 0] },
            { $sum: { $map: { input: { $ifNull: ["$variants", []] }, as: "variant", in: { $ifNull: ["$$variant.inventory.quantity", 0] } } } },
          ] },
          paidAmount: { $ifNull: ["$vendorPaidAmount", 0] },
          paymentDue: { $ifNull: ["$vendorPaymentDue", 0] },
        } },
        { $group: { _id: "$vendorId", productCount: { $sum: 1 }, stock: { $sum: "$stock" }, purchaseValue: { $sum: "$purchaseValue" }, paidAmount: { $sum: "$paidAmount" }, paymentDue: { $sum: "$paymentDue" }, lowStock: { $sum: { $cond: [{ $lt: ["$stock", 5] }, 1, 0] } } } },
      ]),
    ]);
    const statsByVendor = new Map(productStats.map((stats) => [stats._id.toString(), stats]));
    const vendorsWithStats = vendors.map((vendor) => ({ ...vendor, ...(statsByVendor.get(vendor._id.toString()) || { productCount: 0, stock: 0, purchaseValue: 0, paidAmount: 0, paymentDue: 0, lowStock: 0 }) }));
    return NextResponse.json({ success: true, vendors: vendorsWithStats });
  } catch (error) {
    console.error("Admin vendors GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!(await requireAdmin())) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    if (!String(body.name || "").trim()) return NextResponse.json({ success: false, error: "Vendor name is required" }, { status: 400 });
    await dbConnect();
    if (body.email && body.password && await User.exists({ email: body.email.toLowerCase() })) {
      return NextResponse.json({ success: false, error: "Email is already used by another account" }, { status: 409 });
    }
    const vendor = await Vendor.create({
      name: body.name,
      contactName: body.contactName,
      email: body.email,
      phone: body.phone,
      address: body.address,
    });
    if (body.email && body.password) {
      const account = await User.create({
        firstName: body.contactName || body.name,
        email: body.email.toLowerCase(),
        password: await hashPassword(body.password),
        role: "vendor",
        vendorId: vendor._id,
      });
      vendor.userId = account._id;
      await vendor.save();
    }
    return NextResponse.json({ success: true, vendor, accountCreated: Boolean(body.email && body.password) }, { status: 201 });
  } catch (error) {
    console.error("Admin vendors POST error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
