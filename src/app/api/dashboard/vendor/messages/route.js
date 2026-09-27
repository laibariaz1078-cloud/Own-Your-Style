import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../../lib/dbConnect";
import { getAuthUser } from "../../../../../lib/auth";
import Vendor from "../../../../../models/Vendor";
import VendorMessage from "../../../../../models/VendorMessage";

async function resolveAccess(request) {
  const user = await getAuthUser();
  if (!user || !["admin", "vendor"].includes(user.role)) return null;
  const requestedVendorId = new URL(request.url).searchParams.get("vendorId");
  const vendorId = user.role === "vendor" ? user.vendorId?.toString() : requestedVendorId;
  return vendorId && mongoose.isValidObjectId(vendorId) ? { user, vendorId } : null;
}

export async function GET(request) {
  try {
    const access = await resolveAccess(request);
    if (!access) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const messages = await VendorMessage.find({ vendorId: access.vendorId }).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Vendor messages GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const access = await resolveAccess(request);
    if (!access) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const body = await request.json();
    const message = String(body.message || "").trim();
    if (!message) return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });
    await dbConnect();
    if (!(await Vendor.exists({ _id: access.vendorId }))) return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
    const created = await VendorMessage.create({ vendorId: access.vendorId, senderId: access.user._id, senderRole: access.user.role, message });
    return NextResponse.json({ success: true, message: created }, { status: 201 });
  } catch (error) {
    console.error("Vendor messages POST error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
