import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import Order from "../../../../models/Order";
import { getAuthUser } from "../../../../lib/auth";
import { isBuyerRole } from "../../../../lib/permissions";

export async function GET(request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days");

    const query = {};

    if (isBuyerRole(user.role)) {
      query.customerId = user._id;
    } else if (user.role === "seller") {
      query["items.sellerId"] = user._id;
    }

    if (days) {
      const since = new Date();
      since.setDate(since.getDate() - Number(days));
      query.createdAt = { $gte: since };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
