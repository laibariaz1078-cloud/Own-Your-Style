import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/dbConnect";
import User from "../../../../models/User";
import { comparePassword, signToken, setAuthCookie } from "../../../../lib/auth";
import { shouldBypassRecaptcha, verifyRecaptchaToken } from "../../../../lib/recaptcha";

export async function POST(request) {
  try {
    const { email, identifier, password, captchaToken } = await request.json();

    if (!shouldBypassRecaptcha() && captchaToken) {
      await verifyRecaptchaToken(captchaToken);
    }

    if (!shouldBypassRecaptcha() && !captchaToken) {
      await verifyRecaptchaToken(captchaToken);
    }

    const loginIdentifier = String(email || identifier || "").trim();
    if (!loginIdentifier || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 });
    }

    await dbConnect();

    const normalizedEmail = loginIdentifier.toLowerCase();
    const user = await User.findOne({
      $or: [{ $expr: { $eq: [{ $toLower: "$email" }, normalizedEmail] } }, { phone: loginIdentifier }],
    }).select("+password");

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status === "suspended" && user.suspensionType === "temporary" && user.suspendedUntil && user.suspendedUntil <= new Date()) {
      user.status = "active";
      user.suspensionType = "none";
      user.suspendedUntil = null;
      user.suspensionReason = "";
      await user.save();
    }

    if (user.status === "suspended") {
      const until = user.suspensionType === "temporary" && user.suspendedUntil
        ? ` until ${new Date(user.suspendedUntil).toLocaleDateString()}`
        : " permanently";
      return NextResponse.json({ success: false, error: `This account is suspended${until}` }, { status: 403 });
    }

    if (!user.password) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    user.lastLoginAt = new Date();
    user.email = user.email.trim().toLowerCase();
    if (user.role === "customer") user.role = "buyer";
    await user.save();

    const token = signToken({ id: user._id.toString(), role: user.role });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    return setAuthCookie(response, token);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
