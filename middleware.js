import { NextResponse } from "next/server";

function isDashboardPath(pathname) {
  return pathname.startsWith("/dashboard");
}

function redirectToLogin(request, pathname) {
  const url = new URL("/login", request.url);
  url.searchParams.set("redirect", pathname);
  url.searchParams.set("reason", "auth");
  return NextResponse.redirect(url);
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

async function hasValidAuthToken(token) {
  if (!token) return false;

  try {
    const [header, payload, signature, extra] = token.split(".");
    if (!header || !payload || !signature || extra !== undefined) return false;

    const decodedHeader = JSON.parse(new TextDecoder().decode(decodeBase64Url(header)));
    const decodedPayload = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload)));
    if (decodedHeader.alg !== "HS256" || !decodedPayload.id) return false;

    const now = Math.floor(Date.now() / 1000);
    if (typeof decodedPayload.exp !== "number" || decodedPayload.exp <= now) return false;
    if (typeof decodedPayload.nbf === "number" && decodedPayload.nbf > now) return false;

    const secret = process.env.JWT_SECRET?.trim() || "dev-secret-change-me";
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    return crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(signature),
      new TextEncoder().encode(`${header}.${payload}`)
    );
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (isDashboardPath(pathname)) {
    const hasSessionCookie = Boolean(
      request.cookies.get("token")?.value || request.cookies.get("session_token")?.value
    );

    if (!hasSessionCookie) return redirectToLogin(request, pathname);
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  if (!(await hasValidAuthToken(token))) return redirectToLogin(request, pathname);

  return NextResponse.next();
}

export const config = {
  matcher: ["/cart/:path*", "/wishlist/:path*", "/checkout/:path*", "/account/:path*", "/dashboard/:path*"],
};
