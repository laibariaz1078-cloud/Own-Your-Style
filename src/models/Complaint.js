import mongoose from "mongoose";

const ComplaintSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["product", "delivery", "payment", "service", "other"],
      default: "product",
    },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "closed"],
      default: "open",
    },
    seen: { type: Boolean, default: false },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sellerName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Complaint || mongoose.model("Complaint", ComplaintSchema);
