import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../../../lib/dbConnect";
import { getAuthUser } from "../../../../../../lib/auth";
import Order from "../../../../../../models/Order";

const statuses = ["Processing", "Paid", "Shipped", "Delivered", "Delayed", "Cancelled"];

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser();
    if (user?.role !== "admin") return NextResponse.json({ success: false, error: "Forbidden" }, { status: user ? 403 : 401 });
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, error: "Invalid order" }, { status: 400 });
    const body = await request.json();
    if (body.status !== undefined && !statuses.includes(body.status)) return NextResponse.json({ success: false, error: "Invalid order status" }, { status: 400 });
    await dbConnect();
    const order = await Order.findByIdAndUpdate(id, { $set: { ...(body.status !== undefined && { status: body.status }), ...(body.notes !== undefined && { notes: String(body.notes) }) } }, { new: true, runValidators: true });
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Admin order PATCH error:", error);
    return NextResponse.json({ success: false, error: "Unable to update order" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();
    if (user?.role !== "admin") return NextResponse.json({ success: false, error: "Forbidden" }, { status: user ? 403 : 401 });
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return NextResponse.json({ success: false, error: "Invalid order" }, { status: 400 });
    await dbConnect();
    const order = await Order.findByIdAndDelete(id);
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin order DELETE error:", error);
    return NextResponse.json({ success: false, error: "Unable to delete order" }, { status: 500 });
  }
}