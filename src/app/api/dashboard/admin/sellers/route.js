import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import User from "../../../../../models/User";
import Order from "../../../../../models/Order";
import { getAuthUser } from "../../../../../lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const sellers = await User.find({ role: "seller" }).sort({ createdAt: -1 }).lean();

    const revenueBySeller = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.sellerId", totalSales: { $sum: "$items.lineTotal" } } },
    ]);

    const revenueMap = {};
    revenueBySeller.forEach((entry) => {
      revenueMap[entry._id.toString()] = entry.totalSales;
    });

    const result = sellers.map((seller) => ({
      _id: seller._id,
      name: `${seller.firstName} ${seller.lastName || ""}`.trim() || seller.storeName || "Seller",
      email: seller.email,
      sales: revenueMap[seller._id.toString()] || 0,
      status: seller.status === "active" ? "Active" : "Inactive",
    }));

    return NextResponse.json({ success: true, sellers: result });
  } catch (error) {
    console.error("Admin sellers GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
