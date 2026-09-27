import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../../../../lib/dbConnect";
import Product from "../../../../../../../models/Product";
import { getAuthUser } from "../../../../../../../lib/auth";

export async function GET(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid vendor" }, { status: 400 });
    }

    await dbConnect();

    const products = await Product.find({ vendorId: id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      products: products || [],
      count: products?.length || 0,
    });
  } catch (error) {
    console.error("Vendor products error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
