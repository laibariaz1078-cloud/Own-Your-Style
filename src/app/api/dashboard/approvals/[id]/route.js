import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import { getAuthUser } from "../../../../../lib/auth";
import ApprovalRequest from "../../../../../models/ApprovalRequest";
import Notification from "../../../../../models/Notification";
import { applyApprovalRequest } from "../../../../../controllers/approvalController";

export async function PATCH(request, { params }) {
  try {
    const user = await getAuthUser();
    if (!user || !["admin", "seller"].includes(user.role)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    const { id } = await params;
    const body = await request.json();
    await dbConnect();
    const approval = await ApprovalRequest.findById(id);
    if (!approval) return NextResponse.json({ success: false, error: "Approval request not found" }, { status: 404 });
    if (approval.status !== "pending") return NextResponse.json({ success: false, error: "This request is no longer pending" }, { status: 409 });

    if (user.role === "seller") {
      if (approval.requestedBy.toString() !== user._id.toString() || body.action !== "cancel") return NextResponse.json({ success: false, error: "You can only cancel your own pending request" }, { status: 403 });
      approval.status = "cancelled";
      approval.reviewNote = "Cancelled by seller";
      await approval.save();
      await Notification.create({
        recipient: approval.requestedBy,
        type: "approval_update",
        title: "Request cancelled",
        message: `Your ${approval.operation} ${approval.entityType} request was cancelled.`,
        approvalRequestId: approval._id,
      });
      return NextResponse.json({ success: true, request: approval });
    }

    if (body.action === "dismiss") {
      approval.status = "dismissed";
      approval.reviewedBy = user._id;
      approval.reviewedAt = new Date();
      approval.reviewNote = String(body.note || "Dismissed by admin");
      await approval.save();
      await Notification.create({
        recipient: approval.requestedBy,
        type: "approval_update",
        title: "Request dismissed",
        message: `Your ${approval.operation} ${approval.entityType} request was dismissed by admin.`,
        approvalRequestId: approval._id,
      });
      return NextResponse.json({ success: true, request: approval });
    }
    if (body.action !== "approve") return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    const result = await applyApprovalRequest(approval, user._id);
    return NextResponse.json({ success: true, request: approval, result });
  } catch (error) {
    console.error("Approval action error:", error);
    return NextResponse.json({ success: false, error: error.message || "Unable to process approval" }, { status: 500 });
  }
}
