import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../../../lib/dbConnect";
import Vendor from "../../../../../../models/Vendor";
import Product from "../../../../../../models/Product";
import { getAuthUser } from "../../../../../../lib/auth";

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, error: "Invalid vendor" }, { status: 400 });
    await dbConnect();
    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
    await Product.updateMany({ vendorId: id }, { $set: { vendorId: null } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin vendors DELETE error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
