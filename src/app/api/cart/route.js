import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { getCurrentUser } from "../../../controllers/authController";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../../../controllers/cartController";
import { isBuyerRole } from "../../../lib/permissions";

async function getCartIdentity() {
  const user = await getCurrentUser().catch(() => null);
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("cart_session")?.value || (!user ? randomUUID() : undefined);
  return { user, sessionId };
}

function setGuestCartCookie(response, user, sessionId) {
  if (!user && sessionId) {
    response.cookies.set("cart_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

export async function GET() {
  try {
    const { user, sessionId } = await getCartIdentity();
    const cart = await getCart({ userId: user?._id, sessionId });
    return setGuestCartCookie(NextResponse.json({ success: true, cart: cart || { items: [] } }), user, sessionId);
  } catch (error) {
    return NextResponse.json({ success: true, cart: { items: [] }, message: "Cart temporarily unavailable." }, { status: 200 });
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const { user, sessionId } = await getCartIdentity();
    if (user && !isBuyerRole(user.role)) {
      return NextResponse.json({ success: false, message: `Your account role is ${user.role}. Only buyers can add products to cart.` }, { status: 403 });
    }
    const cart = await addToCart({
      userId: user?._id,
      sessionId,
      ...data,
    });

    return setGuestCartCookie(NextResponse.json({ success: true, cart }, { status: 201 }), user, sessionId);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Unable to add item to cart." }, { status: 200 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const { user, sessionId } = await getCartIdentity();
    if (user && !isBuyerRole(user.role)) {
      return NextResponse.json({ success: false, message: `Your account role is ${user.role}. Only buyers can update cart items.` }, { status: 403 });
    }
    const cart = await updateCartItem({ userId: user?._id, sessionId, ...data });
    return setGuestCartCookie(NextResponse.json({ success: true, cart }), user, sessionId);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Unable to update cart item." }, { status: 200 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const { user, sessionId } = await getCartIdentity();
    if (user && !isBuyerRole(user.role)) {
      return NextResponse.json({ success: false, message: `Your account role is ${user.role}. Only buyers can remove cart items.` }, { status: 403 });
    }
    const cart = await removeFromCart({ userId: user?._id, sessionId, productId });
    return setGuestCartCookie(NextResponse.json({ success: true, cart: cart || { items: [] } }), user, sessionId);
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Unable to remove cart item." }, { status: 200 });
  }
}
