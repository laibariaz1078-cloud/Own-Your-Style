import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import User from "../../../../../models/User";
import { getAuthUser } from "../../../../../lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    await User.updateMany(
      { status: "suspended", suspensionType: "temporary", suspendedUntil: { $lte: new Date() } },
      { $set: { status: "active", suspensionType: "none", suspendedUntil: null, suspensionReason: "" } }
    );

    const customers = await User.find({ role: { $in: ["buyer", "customer"] } }).sort({ createdAt: -1 }).lean();
    const sellers = await User.find({ role: "seller" }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      customers: customers.map((customer) => ({ ...customer, _id: customer._id.toString(), id: customer._id.toString(), email: String(customer.email || "").trim().toLowerCase(), role: "buyer" })),
      sellers: sellers.map((seller) => ({ ...seller, _id: seller._id.toString(), id: seller._id.toString(), email: String(seller.email || "").trim().toLowerCase() })),
    });
  } catch (error) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
