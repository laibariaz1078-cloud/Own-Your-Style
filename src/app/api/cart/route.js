import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../controllers/authController";
import { getCart, addToCart, updateCartItem, removeFromCart } from "../../../controllers/cartController";
import { isBuyerRole } from "../../../lib/permissions";

async function getCartIdentity() {
  return { user: await getCurrentUser() };
}

export async function GET() {
  try {
    const { user } = await getCartIdentity();
    const cart = await getCart({ userId: user._id });
    return NextResponse.json({ success: true, cart: cart || { items: [] } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.statusCode === 401 ? error.message : "Cart temporarily unavailable." }, { status: error.statusCode || 200 });
  }
}

export async function POST(request) {
  try {
    const { user } = await getCartIdentity();
    const data = await request.json();
    if (!isBuyerRole(user.role)) {
      return NextResponse.json({ success: false, message: `Your account role is ${user.role}. Only buyers can add products to cart.` }, { status: 403 });
    }
    const { cart, availableStock } = await addToCart({ userId: user._id, ...data });

    return NextResponse.json({ success: true, cart, availableStock }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Unable to add item to cart." }, { status: error.statusCode || 400 });
  }
}

export async function PUT(request) {
  try {
    const { user } = await getCartIdentity();
    const data = await request.json();
    if (!isBuyerRole(user.role)) {
      return NextResponse.json({ success: false, message: `Your account role is ${user.role}. Only buyers can update cart items.` }, { status: 403 });
    }
    const cart = await updateCartItem({ userId: user._id, ...data });
    return NextResponse.json({ success: true, cart });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Unable to update cart item." }, { status: error.statusCode || 400 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const { user } = await getCartIdentity();
    if (!isBuyerRole(user.role)) {
      return NextResponse.json({ success: false, message: `Your account role is ${user.role}. Only buyers can remove cart items.` }, { status: 403 });
    }
    const cart = await removeFromCart({ userId: user._id, productId });
    return NextResponse.json({ success: true, cart: cart || { items: [] } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Unable to remove item from cart." }, { status: error.statusCode || 400 });
  }
}
