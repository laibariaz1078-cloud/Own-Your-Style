import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Review from "../../../../../models/Review";
import User from "../../../../../models/User";
import { getAuthUser } from "../../../../../lib/auth";

async function requireAdmin() {
  const user = await getAuthUser();
  return user?.role === "admin" ? user : null;
}

export async function GET() {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const reviews = await Review.find({})
      .populate("customerId", "firstName lastName email")
      .populate("sellerId", "firstName lastName email storeName")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Admin reviews GET error:", error);
    return NextResponse.json({ success: false, error: "Unable to load reviews" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const rating = Number(body.rating);
    if (!body.customerId || !body.sellerId || !String(body.comment || "").trim() || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Customer, seller, rating, and comment are required" }, { status: 400 });
    }

    await dbConnect();
    const [customer, seller] = await Promise.all([
      User.findOne({ _id: body.customerId, role: { $in: ["buyer", "customer"] } }).lean(),
      User.findOne({ _id: body.sellerId, role: "seller" }).lean(),
    ]);
    if (!customer || !seller) return NextResponse.json({ success: false, error: "Invalid customer or seller" }, { status: 400 });

    const review = await Review.create({
      customerId: customer._id,
      customerName: `${customer.firstName} ${customer.lastName || ""}`.trim(),
      sellerId: seller._id,
      rating,
      comment: String(body.comment).trim(),
      productName: "Seller review",
      sellerReply: String(body.sellerReply || "").trim(),
    });
    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("Admin reviews POST error:", error);
    return NextResponse.json({ success: false, error: "Unable to create review" }, { status: 500 });
  }
}
