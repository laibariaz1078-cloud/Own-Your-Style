import { connectToDatabase } from "../lib/mongodb";
import Product from "../models/Product";
import "../models/Vendor";

function serializeProductPayload(data) {
  return JSON.parse(JSON.stringify(data));
}

export async function getProducts({ category, search, limit } = {}) {
  await connectToDatabase();

  const query = { status: "active" };

  if (category && category !== "all") {
    query.categoryIds = category;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const products = await Product.find(query)
    .populate("vendorId", "name contactName")
    .limit(limit ? Number(limit) : 0)
    .sort({ createdAt: -1 })
    .lean();

  return serializeProductPayload(
    products.map((product) => ({
      ...product,
      id: String(product._id),
      image: product.images?.[0]?.url || product.images?.[0] || "",
      price: product.basePrice,
      category: product.categoryIds?.[0] || "",
      isNew: product.newArrival,
      collection: product.storefrontSection,
    }))
  );
}

export async function getProductBySlug(slug) {
  await connectToDatabase();
  const query = /^[a-f\d]{24}$/i.test(slug) ? { $or: [{ slug }, { _id: slug }] } : { slug };
  const product = await Product.findOne({ ...query, status: "active" }).populate("vendorId", "name contactName").lean();

  if (!product) {
    return null;
  }

  return serializeProductPayload({
    ...product,
    id: String(product._id),
    image: product.images?.[0]?.url || product.images?.[0] || "",
    price: product.basePrice,
    category: product.categoryIds?.[0] || "",
    isNew: product.newArrival,
    collection: product.storefrontSection,
  });
}

export async function createProduct(data) {
  await connectToDatabase();
  const slug = data.slug || String(data.name || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return Product.create({ ...data, slug });
}
