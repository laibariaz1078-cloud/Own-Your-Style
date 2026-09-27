import { NextResponse } from "next/server";
import { findUserByEmailOrPhone, generateVerificationCode, storeVerificationCode } from "../../../../controllers/authController";
import { sendVerificationCodeEmail } from "../../../../lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const method = body?.method === "phone" ? "phone" : "email";
    const value = String(body?.value || "").trim();

    if (!value) {
      return NextResponse.json({ success: false, message: "Please provide a valid email or phone number." }, { status: 400 });
    }

    const user = await findUserByEmailOrPhone(value);
    if (!user) {
      return NextResponse.json({ success: false, message: "No account is associated with this email or phone number." }, { status: 404 });
    }

    const code = generateVerificationCode();
    storeVerificationCode(value, code, method);

    if (method === "email") {
      if (!user.email) {
        return NextResponse.json({ success: false, message: "This account does not have an email address on file." }, { status: 400 });
      }
      await sendVerificationCodeEmail({ to: user.email, code });
    }

    return NextResponse.json({ success: true, message: "Verification code sent successfully." });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ success: false, message: error.message || "Unable to send verification code." }, { status: 500 });
  }
}
