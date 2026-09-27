import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, default: "Seller review" },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerName: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, default: "" },
    deliveryStatus: { type: String, default: "Delivered on time" },
    sellerReply: { type: String, default: "" },
    sellerReplyAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
