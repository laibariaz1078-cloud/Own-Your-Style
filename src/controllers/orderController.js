import { connectToDatabase } from "../lib/mongodb";
import Order from "../models/Order";
import Cart from "../models/Cart";
import Product from "../models/Product";

export async function getOrdersByUser(customerId) {
  await connectToDatabase();
  return Order.find({ customerId }).sort({ createdAt: -1 }).lean();
}

export async function getOrderById(orderId) {
  await connectToDatabase();
  return Order.findById(orderId).lean();
}

export async function createOrder({ userId, customerName, items = [], shippingAddress, billingAddress, payment, totals, pricing, status = "Processing", notes }) {
  await connectToDatabase();

  const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const trackingNumber = `TRK${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 900 + 100)}`;
  const normalizedStatus = status.toLowerCase() === "pending" ? "Processing" : status;

  const order = await Order.create({
    orderNumber,
    trackingNumber,
    customerId: userId,
    customerName: customerName || "Customer",
    items,
    shippingAddress,
    billingAddress,
    payment,
    pricing: pricing || totals || {},
    status: normalizedStatus,
    notes: notes || "",
    statusHistory: [{ status: normalizedStatus, note: "Order created", updatedAt: new Date() }],
  });

  return order;
}

export async function createOrderFromCart({ userId, customerName, shippingAddress, billingAddress, payment, notes, status = "Processing" }) {
  await connectToDatabase();
  const cart = await Cart.findOne({ userId }).populate("items.productId");
  if (!cart?.items?.length) throw new Error("Your cart is empty.");

  const items = cart.items.map((item) => {
    const product = item.productId;
    if (!product) throw new Error("A product in your cart is no longer available.");
    const unitPrice = Number(product.basePrice || 0);
    return {
      productId: product._id,
      productName: product.name,
      sellerId: product.sellerId,
      quantity: item.quantity,
      unitPrice,
      lineTotal: unitPrice * item.quantity,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const order = await createOrder({
    userId,
    customerName,
    items,
    shippingAddress,
    billingAddress,
    payment,
    status,
    pricing: { subtotal, tax: 0, shipping: 0, grandTotal: subtotal },
    notes,
  });
  await Cart.deleteOne({ _id: cart._id });
  return order;
}

export async function updateOrderStatus(orderId, status, note = "Status updated") {
  await connectToDatabase();
  const currentOrder = await Order.findById(orderId);
  if (!currentOrder) return null;

  if (status === "Cancelled" && currentOrder.status !== "Cancelled") {
    await Promise.all(currentOrder.items.map((item) => Product.findByIdAndUpdate(item.productId, { $inc: { "variants.0.inventory.quantity": item.quantity } })));
  }

  return Order.findByIdAndUpdate(
    orderId,
    {
      $set: { status },
      $push: {
        statusHistory: { status, note, updatedAt: new Date() },
      },
    },
    { new: true }
  );
}
