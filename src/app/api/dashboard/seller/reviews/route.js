import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Review from "../../../../../models/Review";
import { getAuthUser } from "../../../../../lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const reviews = await Review.find({ sellerId: user._id })
      .populate("customerId", "email")
      .sort({ createdAt: -1 })
      .lean();

    const averageRating = reviews.length
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

    return NextResponse.json({ success: true, reviews, averageRating });
  } catch (error) {
    console.error("Seller reviews GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { reviewId, sellerReply } = await request.json();
    const reply = String(sellerReply || "").trim();
    if (!reviewId || !reply) {
      return NextResponse.json({ success: false, error: "Reply is required" }, { status: 400 });
    }

    await dbConnect();
    const review = await Review.findOneAndUpdate(
      { _id: reviewId, sellerId: user._id },
      { sellerReply: reply, sellerReplyAt: new Date() },
      { new: true }
    ).lean();

    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Seller review reply error:", error);
    return NextResponse.json({ success: false, error: "Unable to save reply" }, { status: 500 });
  }
}
