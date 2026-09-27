import { NextResponse } from "next/server";
import dbConnect from "../../../../../../lib/dbConnect";
import Review from "../../../../../../models/Review";
import { getAuthUser } from "../../../../../../lib/auth";

async function isAdmin() {
  const user = await getAuthUser();
  return user?.role === "admin";
}

export async function PATCH(request, { params }) {
  try {
    if (!await isAdmin()) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const update = {};
    if (body.rating !== undefined) {
      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ success: false, error: "Rating must be between 1 and 5" }, { status: 400 });
      update.rating = rating;
    }
    if (body.comment !== undefined) update.comment = String(body.comment).trim();
    if (body.sellerReply !== undefined) {
      update.sellerReply = String(body.sellerReply).trim();
      update.sellerReplyAt = update.sellerReply ? new Date() : null;
    }
    await dbConnect();
    const review = await Review.findByIdAndUpdate(params.id, update, { new: true }).lean();
    if (!review) return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Admin review PATCH error:", error);
    return NextResponse.json({ success: false, error: "Unable to update review" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    if (!await isAdmin()) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const review = await Review.findByIdAndDelete(params.id);
    if (!review) return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin review DELETE error:", error);
    return NextResponse.json({ success: false, error: "Unable to delete review" }, { status: 500 });
  }
}
