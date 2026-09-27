import mongoose from "mongoose";
import { connectToDatabase } from "../lib/mongodb";
import Wishlist from "../models/Wishlist";

export async function getWishlist(userId) {
  await connectToDatabase();
  return Wishlist.findOne({ userId }).populate("items.productId").lean();
}

export async function addToWishlist({ userId, productId }) {
  await connectToDatabase();

  const normalizedProductId = mongoose.Types.ObjectId.isValid(productId)
    ? new mongoose.Types.ObjectId(productId)
    : productId;

  const existingWishlist = await Wishlist.findOne({
    userId,
    "items.productId": normalizedProductId,
  }).lean();

  if (existingWishlist) {
    return existingWishlist;
  }

  return Wishlist.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: { userId, name: "My Wishlist", isDefault: true },
      $addToSet: { items: { productId: normalizedProductId, addedAt: new Date() } },
    },
    { upsert: true, new: true }
  );
}

export async function removeFromWishlist({ userId, productId }) {
  await connectToDatabase();

  return Wishlist.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId } } },
    { new: true }
  );
}
