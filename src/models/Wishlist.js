import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  name: { type: String, default: "My Wishlist" },
  isDefault: { type: Boolean, default: true },
  items: [{ productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, variantId: mongoose.Schema.Types.ObjectId, addedAt: { type: Date, default: Date.now } }],
}, { timestamps: true });

export default mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);