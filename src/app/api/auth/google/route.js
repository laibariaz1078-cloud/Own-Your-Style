import { NextResponse } from "next/server";

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong.",
      },
      { status: 501 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const redirectUri = new URL("/api/auth/google/callback", appUrl).toString();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    //"Authorization Code Flow" hai, jo sabse secure tareeqa hai:
    // Google ek chhota sa code deta hai redirect mein
    // Aapka backend us code ko Google ke sath exchange karke asli token leta hai
    scope: "openid email profile",
    access_type: "offline",
    // online (default): sirf access token milta hai, jo expire ho jata hai (aksar 1 hour mein), aur dobara lene ke liye user ko phir se login karna padega
    // offline: access token ke sath ek refresh token bhi milta hai, jisse aap bina user ko dobara login karwaye naya access token le sakte ho
    prompt: "consent",
    //har baar consent screen dikhaye, chahe user pehle bhi permission de chuka ho.
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
