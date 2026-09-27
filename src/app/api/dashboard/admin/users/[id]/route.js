import { NextResponse } from "next/server";
import dbConnect from "../../../../../../lib/dbConnect";
import User from "../../../../../../models/User";
import { getAuthUser } from "../../../../../../lib/auth";
import { isBuyerRole } from "../../../../../../lib/permissions";

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (id === user._id.toString()) {
      return NextResponse.json({ success: false, error: "You cannot delete your own account" }, { status: 400 });
    }

    await dbConnect();
    await User.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete user error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const admin = await getAuthUser();
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    if (id === admin._id.toString()) {
      return NextResponse.json({ success: false, error: "You cannot change your own account status" }, { status: 400 });
    }

    const { action, durationDays, reason } = await request.json();
    await dbConnect();
    const target = await User.findById(id);
    if (!target) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    if (!['seller', 'customer'].includes(target.role)) {
      return NextResponse.json({ success: false, error: "Only sellers and customers can be managed here" }, { status: 400 });
    }

    if (action === "activate") {
      target.status = "active";
      target.suspensionType = "none";
      target.suspendedUntil = null;
      target.suspensionReason = "";
    } else if (target.role === "seller" && action === "deactivate") {
      target.status = "suspended";
      target.suspensionType = "permanent";
      target.suspendedUntil = null;
      target.suspensionReason = String(reason || "Deactivated by admin");
    } else if (isBuyerRole(target.role) && action === "suspend_permanent") {
      target.status = "suspended";
      target.suspensionType = "permanent";
      target.suspendedUntil = null;
      target.suspensionReason = String(reason || "Suspended by admin");
    } else if (isBuyerRole(target.role) && action === "suspend_temporary") {
      const days = Number(durationDays || 15);
      if (!Number.isFinite(days) || days <= 0 || days > 3650) {
        return NextResponse.json({ success: false, error: "Duration must be between 1 and 3650 days" }, { status: 400 });
      }
      target.status = "suspended";
      target.suspensionType = "temporary";
      target.suspendedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
      target.suspensionReason = String(reason || `Suspended for ${days} days by admin`);
    } else {
      return NextResponse.json({ success: false, error: "Invalid status action" }, { status: 400 });
    }

    await target.save();
    return NextResponse.json({ success: true, user: target.toObject() });
  } catch (error) {
    console.error("Admin update user status error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
