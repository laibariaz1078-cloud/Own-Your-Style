import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true },
    price: { type: Number, required: true },
    inventory: {
      quantity: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    description: { type: String, default: "" },
    categoryIds: { type: [String], default: [] },
    basePrice: { type: Number, required: true },
    images: {
      type: [{ url: { type: String } }],
      default: [],
    },
    oldPrice: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    newArrival: { type: Boolean, default: false },
    colors: { type: [String], default: [] },
    storefrontSection: { type: String, default: "explore" },
    status: { type: String, enum: ["draft", "active"], default: "active" },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return !this.vendorId;
      },
    },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", default: null },
    vendorUnitCost: { type: Number, default: 0, min: 0 },
    vendorPaidAmount: { type: Number, default: 0, min: 0 },
    vendorPaymentDue: { type: Number, default: 0, min: 0 },
    vendorPaymentDueDate: { type: Date, default: null },
    variants: { type: [VariantSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
