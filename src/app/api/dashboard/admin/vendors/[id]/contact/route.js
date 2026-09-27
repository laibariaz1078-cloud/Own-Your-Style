import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "../../../../../../../lib/dbConnect";
import Vendor from "../../../../../../../models/Vendor";
import { getAuthUser } from "../../../../../../../lib/auth";
import { sendEmail } from "../../../../../../../lib/email";

export async function POST(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: "Invalid vendor" }, { status: 400 });
    }

    const body = await request.json();
    const { subject, message } = body;

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json(
        { success: false, error: "Subject and message are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const vendor = await Vendor.findById(id).lean();
    if (!vendor) {
      return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });
    }

    if (!vendor.email) {
      return NextResponse.json(
        { success: false, error: "Vendor has no email address on file" },
        { status: 400 }
      );
    }

 await sendEmail({
      to: vendor.email,
      subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;"><p>${message.replace(/\n/g, "<br/>")}</p></div>`,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent to vendor.",
      vendorEmail: vendor.email,
    });
  } catch (error) {
    console.error("Vendor contact error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
