import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { isBuyerRole } from "./src/lib/permissions";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function getRequiredRole(pathname) {
  if (pathname.startsWith("/dashboard/admin")) return "admin";
  if (pathname.startsWith("/dashboard/seller")) return "seller";
  if (pathname.startsWith("/dashboard/vendor")) return "vendor";
  if (pathname.startsWith("/dashboard/customer")) return "buyer";
  if (pathname === "/cart" || pathname === "/checkout") return "buyer";
  return null;
}

function redirectToLogin(request, pathname) {
  const url = new URL("/login", request.url);
  url.searchParams.set("returnTo", pathname);
  return NextResponse.redirect(url);
}

function getTokenPayload(token) {
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("token")?.value || request.cookies.get("session_token")?.value;
  const requiredRole = getRequiredRole(pathname);

  if (!requiredRole) {
    return NextResponse.next();
  }

  if (!token) {
    return redirectToLogin(request, `${pathname}${search}`);
  }

  const payload = getTokenPayload(token);
  if (!payload?.role) {
    return redirectToLogin(request, `${pathname}${search}`);
  }

  if (requiredRole === "buyer" ? !isBuyerRole(payload.role) : payload.role !== requiredRole) {
    return redirectToLogin(request, `${pathname}${search}`);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cart",
    "/checkout",
  ],
};
