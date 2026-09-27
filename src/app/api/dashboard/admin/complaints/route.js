import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import Complaint from "../../../../../models/Complaint";
import { getAuthUser } from "../../../../../lib/auth";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const complaints = await Complaint.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    console.error("Admin complaints GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
