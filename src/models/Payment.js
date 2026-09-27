import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  paymentIntentId: { type: String, unique: true, sparse: true },
  transactionId: String,
  method: { type: String, enum: ["card", "paypal", "apple_pay", "google_pay", "bank_transfer", "cash_on_delivery", "wallet"], required: true },
  provider: String,
  amount: { type: mongoose.Schema.Types.Decimal128, required: true, min: 0 },
  currency: String,
  status: { type: String, enum: ["pending", "authorized", "captured", "failed", "cancelled", "refunded", "partially_refunded"], default: "pending" },
  failureReason: String,
  providerResponse: mongoose.Schema.Types.Mixed,
  refunds: [{ refundId: String, amount: mongoose.Schema.Types.Decimal128, reason: String, status: String, createdAt: Date }],
  authorizedAt: Date,
  capturedAt: Date,
  failedAt: Date,
}, { timestamps: true });

PaymentSchema.index({ orderId: 1, createdAt: -1 });
export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);