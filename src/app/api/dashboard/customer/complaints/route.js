import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Complaint from "../../../../../models/Complaint";
import { getAuthUser } from "../../../../../lib/auth";
import { isBuyerRole } from "../../../../../lib/permissions";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || !isBuyerRole(user.role)) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const complaints = await Complaint.find({ userId: user._id }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    console.error("Customer complaints GET error:", error);
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
    const { title, description, category, priority, productId, sellerId, sellerName } = body;

    if (!title || !description) {
      return NextResponse.json({ success: false, error: "Title and description are required" }, { status: 400 });
    }

    await dbConnect();

    const complaint = await Complaint.create({
      userId: user._id,
      userName: `${user.firstName} ${user.lastName || ""}`.trim(),
      title,
      description,
      category: category || "product",
      priority: priority || "medium",
      productId: productId || undefined,
      sellerId: sellerId || undefined,
      sellerName: String(sellerName || "").trim(),
    });

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (error) {
    console.error("Customer complaints POST error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
