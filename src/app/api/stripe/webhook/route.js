import { NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "../../../../lib/mongodb";
import { createOrderFromCart } from "../../../../controllers/orderController";
import Order from "../../../../models/Order";
import Payment from "../../../../models/Payment";
import User from "../../../../models/User";

export const runtime = "nodejs";

export async function POST(request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ success: false, message: "Stripe webhook is not configured on the server." }, { status: 503 });
  }

  try {
    const signature = request.headers.get("stripe-signature");
    const payload = await request.text();
    const stripe = new Stripe(stripeKey);
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type !== "checkout.session.completed") {
      return NextResponse.json({ received: true });
    }

    const session = event.data.object;
    if (session.payment_status !== "paid" || !session.metadata?.userId) {
      return NextResponse.json({ received: true });
    }

    await connectToDatabase();
    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    if (paymentIntentId) {
      const existingPayment = await Payment.findOne({ paymentIntentId }).lean();
      if (existingPayment) return NextResponse.json({ received: true });
    }

    const user = await User.findById(session.metadata.userId).lean();
    if (!user) return NextResponse.json({ success: false, message: "Payment user not found." }, { status: 400 });

    const billingDetails = JSON.parse(session.metadata.billingDetails || "{}");
    const customerName = `${user.firstName} ${user.lastName || ""}`.trim();
    let order = await Order.findOne({ "payment.paymentIntentId": paymentIntentId }).lean();

    if (!order) {
      order = await createOrderFromCart({
        userId: user._id,
        customerName,
        shippingAddress: billingDetails,
        billingAddress: billingDetails,
        payment: { method: "card", provider: "stripe", paymentIntentId, status: "captured", currency: session.currency, amount: (session.amount_total || 0) / 100 },
        status: "Paid",
      });
    }

    if (paymentIntentId) {
      await Payment.findOneAndUpdate(
        { paymentIntentId },
        {
          $setOnInsert: {
            orderId: order._id,
            userId: user._id,
            paymentIntentId,
            transactionId: session.id,
            method: "card",
            provider: "stripe",
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || "usd",
            status: "captured",
            capturedAt: new Date(),
            providerResponse: { checkoutSessionId: session.id },
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ success: false, message: "Invalid Stripe webhook." }, { status: 400 });
  }
}