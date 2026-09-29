import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "../../../../controllers/authController";
import { connectToDatabase } from "../../../../lib/mongodb";
import { getCart } from "../../../../controllers/cartController";
import { validateCartStock } from "../../../../controllers/orderController";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ success: false, message: "Stripe is not configured on the server." }, { status: 500 });
    }

    const user = await getCurrentUser();
    const { billingDetails = {} } = await request.json();
    const requiredFields = ["firstName", "streetAddress", "city", "phone", "email"];
    if (requiredFields.some((field) => !billingDetails[field]?.trim())) {
      return NextResponse.json({ success: false, message: "Please complete all required billing details." }, { status: 400 });
    }

    await connectToDatabase();
    const cookieStore = await cookies();
    const cart = await getCart({ userId: user._id, sessionId: cookieStore.get("cart_session")?.value });
    if (!cart?.items?.length) {
      return NextResponse.json({ success: false, message: "Your cart is empty." }, { status: 400 });
    }
    validateCartStock(cart);

    const lineItems = cart.items.map((item) => {
      const product = item.productId;
      const price = Number(product?.basePrice || 0);
      if (!product || !Number.isFinite(price) || price <= 0) {
        throw new Error("A product in your cart is no longer available.");
      }
      return {
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity,
      };
    });

    const appUrl = new URL(request.url).origin;
    const stripe = new Stripe(stripeKey);
    const accountEmail = String(user.email || "").trim().toLowerCase();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: billingDetails.email.trim().toLowerCase(),
      metadata: {
        userId: String(user._id).trim(),
        userEmail: accountEmail,
        billingDetails: JSON.stringify(billingDetails).slice(0, 500),
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?payment=cancelled`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    return NextResponse.json({ success: false, message: error.message || "Unable to start Stripe checkout." }, { status: error.statusCode || 500 });
  }
}
