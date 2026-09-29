import { NextResponse } from "next/server";

function isProtectedPath(pathname) {
  return pathname.startsWith("/dashboard");
}

function redirectToLogin(request, pathname) {
  const url = new URL("/login", request.url);
  url.searchParams.set("returnTo", pathname);
  return NextResponse.redirect(url);
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const hasSessionCookie = Boolean(
    request.cookies.get("token")?.value || request.cookies.get("session_token")?.value
  );

  if (!hasSessionCookie) {
    return redirectToLogin(request, `${pathname}${search}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
