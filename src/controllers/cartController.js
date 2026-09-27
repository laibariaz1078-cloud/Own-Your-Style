import { connectToDatabase } from "../lib/mongodb";
import Cart from "../models/Cart";
import Product from "../models/Product";

function normalizeQuantity(quantity) {
  const parsed = Number(quantity);
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error("Quantity must be a positive whole number.");
  return parsed;
}

async function reserveStock(productId, quantity) {
  const product = await Product.findOneAndUpdate(
    { _id: productId, "variants.0.inventory.quantity": { $gte: quantity } },
    { $inc: { "variants.0.inventory.quantity": -quantity } },
    { new: true }
  );
  if (!product) throw new Error("Not enough stock available.");
  return product;
}

async function releaseStock(productId, quantity) {
  await Product.findByIdAndUpdate(productId, { $inc: { "variants.0.inventory.quantity": quantity } });
}

export async function getCart({ userId, sessionId }) {
  await connectToDatabase();

  if (userId) {
    const userCart = await Cart.findOne({ userId });
    if (userCart) return userCart.populate("items.productId", "name basePrice images sellerId");
    if (sessionId) {
      const guestCart = await Cart.findOne({ sessionId });
      if (guestCart?.items?.length) {
        guestCart.userId = userId;
        guestCart.sessionId = undefined;
        await guestCart.save();
        return guestCart.populate("items.productId", "name basePrice images sellerId");
      }
    }
    return null;
  }

  if (!sessionId) return null;
  return Cart.findOne({ sessionId }).populate("items.productId", "name basePrice images sellerId").lean();
}

export async function addToCart({ userId, sessionId, productId, quantity = 1, unitPrice, currency = "USD" }) {
  await connectToDatabase();
  const requestedQuantity = normalizeQuantity(quantity);
  const product = await Product.findById(productId).lean();
  if (!product) throw new Error("Product not found.");

  const filter = userId ? { userId } : { sessionId };
  if (userId && !(await Cart.exists(filter))) {
    const guestCart = await Cart.findOne({ sessionId: "guest" });
    if (guestCart) {
      guestCart.userId = userId;
      guestCart.sessionId = undefined;
      await guestCart.save();
    }
  }
  const existingCart = await Cart.findOne(filter);
  const existingItem = existingCart?.items.find((item) => item.productId?._id?.toString() === productId.toString() || item.productId?.toString() === productId.toString());
  await reserveStock(productId, requestedQuantity);

  if (existingItem) {
    return Cart.findOneAndUpdate(
      { ...filter, "items.productId": productId },
      { $inc: { "items.$.quantity": requestedQuantity }, $set: { "items.$.unitPrice": product.basePrice } },
      { new: true }
    );
  }

  const update = {
    $setOnInsert: { ...filter, currency },
    $push: {
      items: {
        productId,
        quantity: requestedQuantity,
        unitPrice: product.basePrice,
        currency,
        addedAt: new Date(),
      },
    },
  };

  return Cart.findOneAndUpdate(filter, update, { upsert: true, new: true, setDefaultsOnInsert: true });
}

export async function updateCartItem({ userId, sessionId, productId, quantity }) {
  await connectToDatabase();
  const requestedQuantity = normalizeQuantity(quantity);

  const filter = userId ? { userId } : { sessionId };
  const cart = await Cart.findOne(filter);
  const item = cart?.items.find((cartItem) => cartItem.productId?._id?.toString() === productId.toString() || cartItem.productId?.toString() === productId.toString());
  if (!item) throw new Error("Cart item not found.");

  const difference = requestedQuantity - item.quantity;
  if (difference > 0) await reserveStock(productId, difference);
  if (difference < 0) await releaseStock(productId, Math.abs(difference));

  const updatedCart = await Cart.findOneAndUpdate(
    { ...filter, "items.productId": productId },
    { $set: { "items.$.quantity": requestedQuantity } },
    { new: true }
  );

  return updatedCart.populate("items.productId", "name basePrice images sellerId");
}

export async function removeFromCart({ userId, sessionId, productId }) {
  await connectToDatabase();

  const filter = userId ? { userId } : { sessionId };
  const cart = await Cart.findOne(filter);
  const item = cart?.items.find((cartItem) => cartItem.productId.toString() === productId.toString());
  if (item) await releaseStock(productId, item.quantity);

  const updatedCart = await Cart.findOneAndUpdate(
    filter,
    { $pull: { items: { productId } } },
    { new: true }
  );

  return updatedCart?.populate("items.productId", "name basePrice images sellerId");
}
