import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import { getAuthUser } from "../../../../lib/auth";
import ApprovalRequest from "../../../../models/ApprovalRequest";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || !["admin", "seller"].includes(user.role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    await dbConnect();
    const query = user.role === "admin" ? {} : { requestedBy: user._id };
    const requests = await ApprovalRequest.find(query)
      .populate("requestedBy", "firstName lastName email storeName")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error("Approvals GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
