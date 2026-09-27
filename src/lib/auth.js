import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { cookies } from "next/headers";
import dbConnect from "./dbConnect";
import User from "../models/User";
import Session from "../models/Session";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const COOKIE_NAME = "token";

async function getUsableUser(user) {
  if (!user) return null;
  if (user.status === "suspended" && user.suspensionType === "temporary" && user.suspendedUntil && user.suspendedUntil <= new Date()) {
    return User.findByIdAndUpdate(
      user._id,
      { $set: { status: "active", suspensionType: "none", suspendedUntil: null, suspensionReason: "" } },
      { new: true }
    ).lean();
  }
  return user.status === "suspended" ? null : user;
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

export function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  };
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("session_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  try {
    await dbConnect();
  } catch (error) {
    return null;
  }

  if (token) {
    const decoded = verifyToken(token);
    if (decoded?.id) {
      try {
        const user = await getUsableUser(await User.findById(decoded.id).lean());
        if (user) return user;
      } catch (error) {
        return null;
      }
    }
  }

  const sessionToken = cookieStore.get("session_token")?.value;
  if (!sessionToken) return null;

  try {
    const session = await Session.findOne({
      tokenHash: hashToken(sessionToken),
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).lean();
    const user = await getUsableUser(session ? await User.findById(session.userId).lean() : null);
    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}
