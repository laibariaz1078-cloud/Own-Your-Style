import { NextResponse } from "next/server";
import { getAuthUser } from "../../../lib/auth";
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";

export async function PATCH(request) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, phone } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ success: false, message: "First name, last name and email are required" }, { status: 400 });
    }

    await dbConnect();

    const existingEmail = await User.findOne({ email, _id: { $ne: authUser._id } }).lean();
    if (existingEmail) {
      return NextResponse.json({ success: false, message: "Email is already in use" }, { status: 409 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      authUser._id,
      { firstName, lastName, email, ...(phone !== undefined ? { phone } : {}) },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl || "",
      },
    });
  } catch (error) {
    console.error("Account update error:", error);
    return NextResponse.json({ success: false, message: "Something went wrong" }, { status: 500 });
  }
}