import { NextResponse } from "next/server"; //api routes middleware ke sath use hga, extension of WRA, manipulate ongoing res
import { getAuthUser, hashPassword, comparePassword } from "../../../../lib/auth";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";

export async function PATCH(request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "New password must be at least 6 characters" }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, message: "New password and confirm password do not match" }, { status: 400 });
    }

    await dbConnect();

    const userWithPassword = await User.findById(authUser._id).select("+password");

    if (!userWithPassword) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isMatch = await comparePassword(currentPassword, userWithPassword.password);

    if (!isMatch) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 401 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await User.findByIdAndUpdate(authUser._id, { password: hashedPassword });

    return NextResponse.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}