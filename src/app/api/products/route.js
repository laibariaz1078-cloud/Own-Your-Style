import { NextResponse } from "next/server";
import { getProducts, createProduct as createProductRecord } from "../../../controllers/productController";
import { getAuthUser } from "../../../lib/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const search = searchParams.get("search") || "";
    const limit = searchParams.get("limit") || "";

    const products = await getProducts({ category, search, limit });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: true, products: [] }, { status: 200 });
  }
}

export async function POST(request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Use the dashboard product workflow." }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, categoryIds, basePrice, image, images, status, stock, variants, slug } = body;
    const product = await createProductRecord({
      name,
      description,
      categoryIds,
      basePrice: Number(basePrice),
      images: images || (image ? [{ url: image }] : []),
      status,
      variants: variants || (stock !== undefined ? [{ sku: `${name}-${Date.now()}`, price: Number(basePrice), inventory: { quantity: Number(stock) } }] : []),
      slug,
      sellerId: user._id,
    });
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Unable to create product." },
      { status: error.statusCode || 500 }
    );
  }
}

