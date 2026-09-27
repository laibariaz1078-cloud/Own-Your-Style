import { NextResponse } from "next/server";
import { verifyStoredCode } from "../../../../controllers/authController";

export async function POST(request) {
  try {
    const body = await request.json();
    const value = String(body?.value || "").trim();
    const code = String(body?.code || "").trim();

    if (!value || !code) {
      return NextResponse.json({ success: false, message: "Verification details are required." }, { status: 400 });
    }

    const valid = verifyStoredCode(value, code, body?.method === "phone" ? "phone" : "email");
    if (!valid) {
      return NextResponse.json({ success: false, message: "The code is invalid or has expired." }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Code verified successfully." });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ success: false, message: error.message || "Unable to verify code." }, { status: 500 });
  }
}
