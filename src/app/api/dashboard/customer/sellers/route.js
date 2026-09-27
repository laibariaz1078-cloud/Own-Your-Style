import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
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
    const sellers = await User.find({ role: "seller", status: "active" })
      .select("firstName lastName email storeName")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      sellers: sellers.map((seller) => ({
        _id: seller._id,
        name: `${seller.firstName} ${seller.lastName || ""}`.trim() || seller.storeName || "Seller",
        email: seller.email,
        storeName: seller.storeName || "",
      })),
    });
  } catch (error) {
    console.error("Customer sellers GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
