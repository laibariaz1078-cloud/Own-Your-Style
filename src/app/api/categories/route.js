import { NextResponse } from "next/server";
import dbConnect from "../../../lib/dbConnect";
import Category from "../../../models/Category";

const fallbackCategories = [
  { name: "Women's Fashion", slug: "women", parentId: null, level: 0, sortOrder: 10 },
  { name: "Men's Fashion", slug: "men", parentId: null, level: 0, sortOrder: 20 },
  { name: "Electronics", slug: "electronics", parentId: null, level: 0, sortOrder: 30 },
  { name: "Home & Lifestyle", slug: "home", parentId: null, level: 0, sortOrder: 40 },
  { name: "Medicine", slug: "medicine", parentId: null, level: 0, sortOrder: 50 },
  { name: "Sports & Outdoor", slug: "sports", parentId: null, level: 0, sortOrder: 60 },
  { name: "Baby's & Toys", slug: "baby", parentId: null, level: 0, sortOrder: 70 },
  { name: "Groceries & Pets", slug: "groceries", parentId: null, level: 0, sortOrder: 80 },
  { name: "Health & Beauty", slug: "beauty", parentId: null, level: 0, sortOrder: 90 },
  { name: "Phones", slug: "phones", parentId: null, level: 0, sortOrder: 100 },
  { name: "Computers", slug: "computers", parentId: null, level: 0, sortOrder: 110 },
  { name: "SmartWatch", slug: "smartwatch", parentId: null, level: 0, sortOrder: 120 },
  { name: "Camera", slug: "camera", parentId: null, level: 0, sortOrder: 130 },
  { name: "HeadPhones", slug: "headphones", parentId: null, level: 0, sortOrder: 140 },
  { name: "Gaming", slug: "gaming", parentId: null, level: 0, sortOrder: 150 },
];

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true })
      .select("name slug parentId level sortOrder")
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    const finalCategories = categories.length ? categories : fallbackCategories;

    return NextResponse.json(
      { success: true, categories: finalCategories },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: true, categories: fallbackCategories },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}