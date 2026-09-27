import { NextResponse } from "next/server";
import { consumeVerifiedReset, findUserByEmailOrPhone } from "../../../../controllers/authController";
import { hashPassword } from "../../../../lib/auth";
import { connectToDatabase } from "../../../../lib/mongodb";


export async function POST(request) {
  try {
    const body = await request.json();
    const identifier = String(body?.identifier || "").trim();
    const password = String(body?.password || "");
    const method = body?.method === "phone" ? "phone" : "email";

    if (!identifier || password.length < 6) {
      return NextResponse.json({ success: false, message: "A valid identifier and password are required." }, { status: 400 });
    }

    if (!consumeVerifiedReset(identifier, method)) {
      return NextResponse.json({ success: false, message: "Please verify the code before resetting your password." }, { status: 403 });
    }

    const user = await findUserByEmailOrPhone(identifier);
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    await connectToDatabase();
    user.password = await hashPassword(password);
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ success: false, message: error.message || "Unable to reset password." }, { status: 500 });
  }
}
