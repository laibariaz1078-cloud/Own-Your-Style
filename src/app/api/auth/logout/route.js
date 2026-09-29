import { NextResponse } from "next/server";
import { clearAuthCookie, getAuthUser } from "../../../../lib/auth";
import { clearUserCart } from "../../../../controllers/cartController";
import { clearUserWishlist } from "../../../../controllers/wishlistController";

export async function POST() {
  let succeeded = true;

  try {
    const user = await getAuthUser();
    if (user?._id) {
      await Promise.all([clearUserCart(user._id), clearUserWishlist(user._id)]);
    }
  } catch (error) {
    succeeded = false;
    console.error("Unable to clear user data during logout", error);
  }

  const response = NextResponse.json({ success: succeeded }, { status: succeeded ? 200 : 500 });
  clearAuthCookie(response);
  response.cookies.set("cart_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
