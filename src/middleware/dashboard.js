import { NextResponse } from "next/server";

export function middleware(req) {
  const sessionToken = req.cookies.get("session_token")?.value || req.cookies.get("token")?.value;
  const url = req.nextUrl.clone();

  if (!sessionToken && url.pathname.startsWith("/dashboard")) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};