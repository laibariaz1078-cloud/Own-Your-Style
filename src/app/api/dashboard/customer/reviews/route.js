import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Review from "../../../../../models/Review";
import User from "../../../../../models/User";
import { getAuthUser } from "../../../../../lib/auth";
import { isBuyerRole } from "../../../../../lib/permissions";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || !isBuyerRole(user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const reviews = await Review.find({ customerId: user._id })
      .populate("sellerId", "email firstName lastName storeName")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    console.error("Customer reviews GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user || !isBuyerRole(user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const rating = Number(body.rating);
    const sellerId = String(body.sellerId || "");
    const comment = String(body.comment || "").trim();

    if (!sellerId || !comment || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: "Seller, rating, and comment are required" }, { status: 400 });
    }

    await dbConnect();
    const seller = await User.findOne({ _id: sellerId, role: "seller", status: "active" }).select("_id").lean();
    if (!seller) {
      return NextResponse.json({ success: false, error: "Please select an existing seller" }, { status: 400 });
    }

    const review = await Review.create({
      sellerId: seller._id,
      customerId: user._id,
      customerName: `${user.firstName} ${user.lastName || ""}`.trim(),
      rating,
      comment,
      productName: "Seller review",
      deliveryStatus: "Verified customer",
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    console.error("Customer reviews POST error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
