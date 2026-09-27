import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import { hashPassword, signToken, setAuthCookie } from "../../../../lib/auth";
import { shouldBypassRecaptcha, verifyRecaptchaToken } from "../../../../lib/recaptcha";

export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, password, captchaToken } = body;
    const email = String(body.email || "").trim().toLowerCase();
    const requestedRole = body.role;

    if (!firstName || !email || !password) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!shouldBypassRecaptcha() && !captchaToken) {
      return NextResponse.json({ success: false, error: "Please complete the captcha" }, { status: 400 });
    }

    if (captchaToken || !shouldBypassRecaptcha()) {
      await verifyRecaptchaToken(captchaToken);
    }

    await dbConnect();

    const existing = await User.findOne({ $expr: { $eq: [{ $toLower: "$email" }, email] } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
    }

    const finalRole = requestedRole === "seller" ? "seller" : "buyer";

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      firstName,
      lastName: lastName || "",
      email,
      phone: String(body.phone || "").trim() || undefined,
      password: hashedPassword,
      role: finalRole,
    });

    const token = signToken({ id: user._id.toString(), role: user.role });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email.trim().toLowerCase(),
          role: user.role,
        },
      },
      { status: 201 }
    );

    return setAuthCookie(response, token);
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Something went wrong" },
      { status: error.statusCode || 500 }
    );
  }
}