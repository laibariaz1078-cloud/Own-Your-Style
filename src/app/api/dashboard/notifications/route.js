import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import { getAuthUser } from "../../../../lib/auth";
import Notification from "../../../../models/Notification";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const notifications = await Notification.find({ recipient: user._id }).sort({ createdAt: -1 }).limit(20).lean();
    const unreadCount = notifications.filter((notification) => !notification.readAt).length;
    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    await dbConnect();
    await Notification.updateMany({ recipient: user._id, readAt: null }, { $set: { readAt: new Date() } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}