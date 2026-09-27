import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../../../lib/dbConnect";
import Complaint from "../../../../../../models/Complaint";
import { getAuthUser } from "../../../../../../lib/auth";

async function getAdminComplaint(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  await dbConnect();
  return Complaint.findById(id);
}

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const complaint = await getAdminComplaint(id);
    if (!complaint) {
      return NextResponse.json({ success: false, error: "Complaint not found" }, { status: 404 });
    }

    const body = await request.json();
    if (body.status !== undefined) {
      const allowedStatuses = ["open", "in_review", "resolved", "closed"];
      if (!allowedStatuses.includes(body.status)) {
        return NextResponse.json({ success: false, error: "Invalid complaint status" }, { status: 400 });
      }
      complaint.status = body.status;
    }
    if (body.seen !== undefined) complaint.seen = Boolean(body.seen);
    await complaint.save();

    return NextResponse.json({ success: true, complaint: complaint.toObject() });
  } catch (error) {
    console.error("Admin complaint PATCH error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const complaint = await getAdminComplaint(id);
    if (!complaint) {
      return NextResponse.json({ success: false, error: "Complaint not found" }, { status: 404 });
    }

    await complaint.deleteOne();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin complaint DELETE error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
