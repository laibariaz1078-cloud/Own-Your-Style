import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import { getAuthUser } from "../../../../../lib/auth";
import Order from "../../../../../models/Order";
import User from "../../../../../models/User";
import Product from "../../../../../models/Product";

const statuses = ["Processing", "Paid", "Shipped", "Delivered", "Delayed", "Cancelled"];

function adminOnly(user) {
  return user?.role === "admin";
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!adminOnly(user)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: user ? 403 : 401 });
    await dbConnect();

    const orders = await Order.find({})
      .populate("customerId", "firstName lastName email phone")
      .populate("items.productId", "name images")
      .populate("items.sellerId", "firstName lastName email storeName")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Admin orders GET error:", error);
    return NextResponse.json({ success: false, error: "Unable to load orders" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!adminOnly(user)) return NextResponse.json({ success: false, error: "Forbidden" }, { status: user ? 403 : 401 });
    const body = await request.json();
    if (!body.customerId || !body.productId || !Number(body.quantity) || Number(body.quantity) < 1) {
      return NextResponse.json({ success: false, error: "Customer, product and valid quantity are required" }, { status: 400 });
    }
    if (body.status !== undefined && !statuses.includes(body.status)) {
      return NextResponse.json({ success: false, error: "Invalid order status" }, { status: 400 });
    }

    await dbConnect();
    const [customer, product] = await Promise.all([
      User.findOne({ _id: body.customerId, role: { $in: ["buyer", "customer"] } }).lean(),
      Product.findById(body.productId).lean(),
    ]);
    if (!customer) return NextResponse.json({ success: false, error: "Customer not found" }, { status: 400 });
    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 400 });

    const quantity = Number(body.quantity);
    const unitPrice = Number(product.basePrice || 0);
    const lineTotal = unitPrice * quantity;
    const order = await Order.create({
      customerId: customer._id,
      customerName: `${customer.firstName} ${customer.lastName || ""}`.trim(),
      items: [{ productId: product._id, productName: product.name, sellerId: product.sellerId, quantity, unitPrice, lineTotal }],
      pricing: { subtotal: lineTotal, grandTotal: lineTotal },
      status: body.status || "Processing",
      notes: body.notes || "",
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error("Admin orders POST error:", error);
    return NextResponse.json({ success: false, error: "Unable to create order" }, { status: 500 });
  }
}