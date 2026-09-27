import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../controllers/authController";
import { getWishlist, addToWishlist, removeFromWishlist } from "../../../controllers/wishlistController";
import { isBuyerRole } from "../../../lib/permissions";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const wishlist = await getWishlist(user._id);
    const products = (wishlist?.items || [])
      .map(({ productId }) => {
        if (!productId?._id) return null;
        return {
          ...productId,
          id: String(productId._id),
          image: productId.images?.[0]?.url || "",
          price: productId.basePrice ?? 0,
        };
      })
      .filter(Boolean);
    return NextResponse.json({ success: true, wishlist: products });
  } catch (error) {
    return NextResponse.json({ success: true, wishlist: [] }, { status: 200 });
  }
}

export async function POST(request) {
  try {
    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const { productId } = body;
    const user = await getCurrentUser();
    if (user && !isBuyerRole(user.role)) {
      return NextResponse.json({ success: false, message: `Your account role is ${user.role}. Only buyers can save products to wishlist.` }, { status: 403 });
    }
    const wishlist = await addToWishlist({ userId: user._id, productId });
    return NextResponse.json({ success: true, wishlist }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Unable to add item to wishlist." }, { status: 200 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId") || (await request.clone().json().catch(() => ({}))).productId;
    const user = await getCurrentUser();
    if (user && !isBuyerRole(user.role)) {
      return NextResponse.json({ success: false, message: `Your account role is ${user.role}. Only buyers can remove products from wishlist.` }, { status: 403 });
    }
    const wishlist = await removeFromWishlist({ userId: user._id, productId });
    return NextResponse.json({ success: true, wishlist });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Unable to remove item from wishlist." }, { status: 200 });
  }
}
