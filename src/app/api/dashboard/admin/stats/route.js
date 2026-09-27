import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import User from "../../../../../models/User";
import Product from "../../../../../models/Product";
import Order from "../../../../../models/Order";
import Complaint from "../../../../../models/Complaint";
import { getAuthUser } from "../../../../../lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const [totalOrders, activeSellers, totalCustomers, totalProducts, products, orders, recentComplaints] = await Promise.all([
      Order.countDocuments({}),
      User.countDocuments({ role: "seller", status: "active" }),
      User.countDocuments({ role: { $in: ["buyer", "customer"] } }),
      Product.countDocuments({}),
      Product.find({}).lean(),
      Order.find({}).sort({ createdAt: -1 }).limit(200).lean(),
      Complaint.find({}).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.pricing?.grandTotal) || 0), 0);

    let inStock = 0;
    let lowStock = 0;
    products.forEach((product) => {
      const quantity = product.variants?.[0]?.inventory?.quantity ?? 0;
      if (quantity < 5) lowStock += 1;
      else inStock += 1;
    });

    const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyVolumes = new Array(7).fill(0);
    const since = new Date();
    since.setDate(since.getDate() - 7);

    orders
      .filter((order) => new Date(order.createdAt) >= since)
      .forEach((order) => {
        const dayIndex = new Date(order.createdAt).getDay();
        weeklyVolumes[dayIndex] += 1;
      });

    const activity = recentComplaints.map((complaint) => ({
      title: `${complaint.title}`,
      time: complaint.createdAt,
      status: complaint.status,
    }));

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders,
        activeSellers,
      },
      reportStats: {
        customers: totalCustomers,
        products: totalProducts,
        inStock,
        lowStock,
      },
      weeklyVolumes: dayLabels.map((label, index) => ({ label, value: weeklyVolumes[index] })),
      activity,
    });
  } catch (error) {
    console.error("Admin stats GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
