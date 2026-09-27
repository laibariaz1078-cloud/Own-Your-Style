import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../controllers/authController";
import { getOrdersByUser, createOrderFromCart } from "../../../controllers/orderController";
import { sendEmail } from "../../../lib/email";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const orders = await getOrdersByUser(user._id);
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Unable to load orders." },
      { status: error.statusCode || 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const user = await getCurrentUser();
    const customerName = `${user.firstName} ${user.lastName || ""}`.trim();
    const order = await createOrderFromCart({
      userId: user._id,
      customerName,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress,
      payment: body.payment,
      notes: body.notes,
    });

    const paymentMethod = body?.payment?.method || "cash_on_delivery";
    const customerEmail = body?.billingAddress?.email || body?.shippingAddress?.email || user?.email;

    if ((paymentMethod === "cash_on_delivery" || paymentMethod === "cod") && customerEmail) {
      try {
        const orderItems = order.items?.length
          ? order.items
            .map(
              (item) => `- ${item.productName} x${item.quantity} ($${Number(item.lineTotal || 0).toFixed(2)})`
            )
            .join("\n")
          : "- No product details available";

        const totalAmount = Number(order.pricing?.grandTotal || 0).toFixed(2);
        const trackingNumber = order.orderNumber || "N/A";

        await sendEmail({
          to: customerEmail,
          subject: `Your order is on the way - ${order.orderNumber || "Your Order"}`,
          text: `Your order has been placed successfully.\n\nOrder Number: ${order.orderNumber || "N/A"}\nTracking Number: ${order.trackingNumber || "N/A"}\nPayment Method: Cash on Delivery\nTotal: $${totalAmount}\n\nItems:\n${orderItems}\n\nYour order is on the way. Thank you for shopping with us.`,
          html: `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
    <h2 style="margin-bottom: 12px;">Order Confirmation</h2>
    <p>Your order is on the way!</p>
    <p><strong>Order Number:</strong> ${order.orderNumber || "N/A"}</p>
    <p><strong>Tracking Number:</strong> ${order.trackingNumber || "N/A"}</p>
    <p><strong>Payment Method:</strong> Cash on Delivery</p>
    <p><strong>Total:</strong> $${totalAmount}</p>
    <p><strong>Items:</strong></p>
    <ul>
      ${order.items?.map((item) => `<li>${item.productName} x${item.quantity} ($${Number(item.lineTotal || 0).toFixed(2)})</li>`).join("") || "<li>No product details available</li>"}
    </ul>
    <p>Thank you for shopping with us.</p>
  </div>
`,
        });
      } catch (emailError) {
        console.error("COD order confirmation email failed:", emailError);
      }
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Unable to create order." },
      { status: error.statusCode || 500 }
    );
  }
}
