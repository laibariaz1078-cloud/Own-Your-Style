import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Order from "../../../../../models/Order";
import { getAuthUser } from "../../../../../lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "seller") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const orders = await Order.find({ "items.sellerId": user._id })
      .sort({ createdAt: -1 })
      .lean();

    const sellerOrders = orders.map((order) => {
      const sellerItems = (order.items || []).filter(
        (item) => item.sellerId?.toString() === user._id.toString()
      );
      const sellerTotal = sellerItems.reduce(
        (total, item) => total + Number(item.lineTotal || item.unitPrice || 0) * Number(item.quantity || 1),
        0
      );
      return { ...order, items: sellerItems, sellerTotal };
    });

    return NextResponse.json({ success: true, orders: sellerOrders });
  } catch (error) {
    console.error("Seller orders GET error:", error);
    return NextResponse.json({ success: false, error: "Unable to load seller orders" }, { status: 500 });
  }
}
