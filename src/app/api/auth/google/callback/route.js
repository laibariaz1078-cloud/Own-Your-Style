import { NextResponse } from "next/server";
import { setAuthCookie, signToken } from "../../../../../lib/auth";
import dbConnect from "../../../../../lib/dbConnect";
import User from "../../../../../models/User";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ success: false, message: "Google authorization code missing." }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 501 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin; //protocol + domain + port
  const redirectUri = new URL("/api/auth/google/callback", appUrl).toString();

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || "Google token exchange failed.");
    }

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const profile = await userResponse.json();

    if (!userResponse.ok || !profile.email) {
      throw new Error(profile.error_description || "Failed to fetch Google account details.");
    }

    await dbConnect();

    const email = String(profile.email).trim().toLowerCase();
    const existingUser = await User.findOne({ $expr: { $eq: [{ $toLower: "$email" }, email] } });

    let user = existingUser;
    if (!user) {
      user = await User.create({
        firstName: profile.firstName || "Google",
        lastName: profile.lastName || "User",
        email,
        password: "oauth-user",
        role: "buyer",
        avatarUrl: profile.picture || "",
      });
    }

    if (user.role === "customer") user.role = "buyer";
    if (user.email !== email) user.email = email;
    await user.save();

    const nextResponse = NextResponse.redirect(new URL("/", appUrl));
    const token = signToken({ id: user._id.toString(), role: user.role });

    return setAuthCookie(nextResponse, token);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message || "Google sign-in failed")}`, appUrl));
  }
}
