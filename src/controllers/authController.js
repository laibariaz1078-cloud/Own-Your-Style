import { connectToDatabase } from "../lib/mongodb";
import {
  comparePassword,
  hashPassword,
  getAuthUser,
  sanitizeUser,
  signToken,
} from "../lib/auth";
import User from "../models/User";

const verificationCodes = new Map();
const verifiedResetIdentifiers = new Map();

export function generateVerificationCode() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export function storeVerificationCode(identifier, code, method = "email", ttlMs = 5 * 60 * 1000) {
  const normalized = String(identifier || "").trim();
  if (!normalized) return null;

  const key = `${method}:${normalized.toLowerCase()}`;
  verificationCodes.set(key, { code, expiresAt: Date.now() + ttlMs });
  return code;
}

export function verifyStoredCode(identifier, code, method = "email") {
  const normalized = String(identifier || "").trim();
  if (!normalized) return false;

  const key = `${method}:${normalized.toLowerCase()}`;
  const record = verificationCodes.get(key);

  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    verificationCodes.delete(key);
    return false;
  }

  const isValid = String(record.code) === String(code);
  if (isValid) {
    verificationCodes.delete(key);
    verifiedResetIdentifiers.set(key, Date.now() + 10 * 60 * 1000);
  }
  return isValid;
}

export function consumeVerifiedReset(identifier, method = "email") {
  const normalizedIdentifier = String(identifier || "").trim().toLowerCase();
  const keys = [`${method}:${normalizedIdentifier}`];
  if (method === "email") keys.push(`phone:${normalizedIdentifier}`);
  const key = keys.find((candidate) => verifiedResetIdentifiers.has(candidate));
  const expiresAt = key ? verifiedResetIdentifiers.get(key) : null;

  if (!expiresAt || Date.now() > expiresAt) {
    verifiedResetIdentifiers.delete(key);
    return false;
  }

  verifiedResetIdentifiers.delete(key);
  return true;
}

export async function registerUser({ firstName, lastName, email, password, phone, role = "buyer" }) {
  const normalizedFirstName = String(firstName || "").trim();
  const normalizedLastName = String(lastName || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedFirstName || !normalizedEmail || !password) {
    throw new Error("First name, email, and password are required.");
  }

  const validRoles = ["buyer", "customer", "seller"];
  if (!validRoles.includes(role)) {
    throw new Error("Invalid role specified.");
  }

  await connectToDatabase();

  const existingUser = await User.findOne({ $expr: { $eq: [{ $toLower: "$email" }, normalizedEmail] } });
  if (existingUser) {
    const error = new Error("User with this email already exists.");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(String(password));

  const user = await User.create({
    firstName: normalizedFirstName,
    lastName: normalizedLastName || "",
    email: normalizedEmail,
    phone: phone ? String(phone).trim() : undefined,
    password: hashedPassword,
    role: role === "seller" ? "seller" : "buyer",
  });

  return {
    user: {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role === "customer" ? "buyer" : user.role,
    },
    token: signToken({ id: user._id.toString(), role: user.role }),
  };
}

export async function loginUser({ email, password, identifier }) {
  const loginIdentifier = String(email || identifier || "").trim();

  if (!loginIdentifier || !password) {
    throw new Error("Email/phone and password are required.");
  }

  await connectToDatabase();

  const normalizedEmail = loginIdentifier.toLowerCase();
  const user = await User.findOne({
    $or: [
      { $expr: { $eq: [{ $toLower: "$email" }, normalizedEmail] } },
      { phone: loginIdentifier },
    ],
  }).select("+password");

  if (!user) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await comparePassword(String(password), user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid credentials.");
    error.statusCode = 401;
    throw error;
  }

  if (user.role === "customer") user.role = "buyer";
  user.email = user.email.trim().toLowerCase();
  await user.save();

  return {
    user: { ...sanitizeUser(user), role: user.role },
    token: signToken({ id: user._id.toString(), role: user.role }),
  };
}

export async function findUserByEmailOrPhone(value) {
  await connectToDatabase();
  const normalized = String(value || "").trim();

  if (!normalized) return null;

  return User.findOne({
    $or: [
      { $expr: { $eq: [{ $toLower: "$email" }, normalized.toLowerCase()] } },
      { phone: normalized },
    ],
  });
}

export async function getCurrentUser() {
  const user = await getAuthUser();
  if (!user) {
    const error = new Error("Login to access this resource.");
    error.statusCode = 401;
    throw error;
  }
  return user;
}
