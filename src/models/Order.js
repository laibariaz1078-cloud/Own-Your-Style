import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    lineTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    orderNumber: { type: String, unique: true, sparse: true },
    trackingNumber: { type: String, unique: true, sparse: true },
    shippingAddress: { type: mongoose.Schema.Types.Mixed },
    billingAddress: { type: mongoose.Schema.Types.Mixed },
    payment: { type: mongoose.Schema.Types.Mixed },
    items: { type: [OrderItemSchema], default: [] },
    pricing: {
      subtotal: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["Processing", "Paid", "Shipped", "Delivered", "Delayed", "Cancelled"],
      default: "Processing",
    },
    notes: { type: String, default: "" },
    statusHistory: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
