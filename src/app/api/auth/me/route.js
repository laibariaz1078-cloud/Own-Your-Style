import { NextResponse } from "next/server";
import { getAuthUser } from "../../../../lib/auth";
import { normalizeRole } from "../../../../lib/permissions";

function createAuthResponse(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
    },
  });
}

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return createAuthResponse({ success: false, user: null }, 401);
    }

    return createAuthResponse({
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
    return createAuthResponse({ success: false, user: null }, 401);
  }
}
