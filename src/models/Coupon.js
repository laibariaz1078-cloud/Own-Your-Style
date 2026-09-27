import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  description: String,
  discountType: { type: String, enum: ["percentage", "fixed", "free_shipping"], required: true },
  discountValue: { type: mongoose.Schema.Types.Decimal128, required: true, min: 0 },
  maximumDiscount: mongoose.Schema.Types.Decimal128,
  // ye coupon sirf tab lagega jab order kam se kam itne ka ho." Jaise "Rs. 1000 se upar order pe hi ye coupon valid hoga.
  minimumOrderAmount: mongoose.Schema.Types.Decimal128,
  usageLimit: Number,
  usageCount: { type: Number, default: 0 },
  perUserLimit: Number,
  applicableProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  applicableCategoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  applicableSellerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  excludedProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  excludedCategoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  startAt: Date,
  expiresAt: Date,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

CouponSchema.index({ isActive: 1, startAt: 1, expiresAt: 1 });
export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);