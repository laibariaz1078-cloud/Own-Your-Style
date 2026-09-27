import { NextResponse } from "next/server";
import { getAuthUser } from "../../../../lib/auth";
import { normalizeRole } from "../../../../lib/permissions";

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: String(user.email || "").trim().toLowerCase(),
        role: normalizeRole(user.role),
        avatarUrl: user.avatarUrl || "",
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }
}
