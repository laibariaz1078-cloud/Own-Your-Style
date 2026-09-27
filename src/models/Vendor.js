import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactName: { type: String, default: "", trim: true },
    email: { type: String, default: "", trim: true, lowercase: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    totalProducts: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    reliabilityScore: { type: Number, default: 100, min: 0, max: 100 },
  },
  { timestamps: true }
);

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
