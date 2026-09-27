import { NextResponse } from "next/server";
import { getProductBySlug } from "../../../../controllers/productController";

export async function GET(_request, { params }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Unable to load product." },
      { status: error.statusCode || 500 }
    );
  }
}
