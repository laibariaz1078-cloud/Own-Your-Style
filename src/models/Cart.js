import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
  //jo documents mein ye field missing/undefined hai, unhe skip kar do.
  // mongoose.Schema.Types.ObjectId — bas batata hai field ka type ObjectId hoga (jaise SQL mein INT ya UUID type hota)
// ref: "User" — Mongoose ko batata hai ke agar .populate() use karo, to us ID se kis collection/model se data fetch karna hai
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true, sparse: true },
  sessionId: { type: String, unique: true, sparse: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: mongoose.Schema.Types.ObjectId,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: mongoose.Schema.Types.Decimal128, required: true },
    currency: String,
    addedAt: { type: Date, default: Date.now },
  }],
  couponCodes: [String],
  totals: { subtotal: mongoose.Schema.Types.Decimal128, discount: mongoose.Schema.Types.Decimal128, tax: mongoose.Schema.Types.Decimal128, shipping: mongoose.Schema.Types.Decimal128, grandTotal: mongoose.Schema.Types.Decimal128 },
  expiresAt: Date,
}, { timestamps: true });

// { expiresAt: 1 } — ye field batati hai kis field ko MongoDB monitor kare
// expireAfterSeconds: 0 — ye number batata hai ke expiresAt mein jo exact time/date stored hai, uske kitne seconds baad document delete ho
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export default mongoose.models.Cart || mongoose.model("Cart", CartSchema);