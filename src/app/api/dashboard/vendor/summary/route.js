import { NextResponse } from "next/server";
import dbConnect from "../../../../../lib/dbConnect";
import { getAuthUser } from "../../../../../lib/auth";
import Vendor from "../../../../../models/Vendor";
import Product from "../../../../../models/Product";

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "vendor" || !user.vendorId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    const vendor = await Vendor.findById(user.vendorId).lean();
    if (!vendor) return NextResponse.json({ success: false, error: "Vendor not found" }, { status: 404 });

    const products = await Product.find({ vendorId: vendor._id }).sort({ createdAt: -1 }).lean();
    const rows = products.map((product) => {
      const stock = (product.variants || []).reduce((total, variant) => total + Number(variant.inventory?.quantity || 0), 0);
      const paid = Number(product.vendorPaidAmount || 0);
      const due = Number(product.vendorPaymentDue || 0);
      return { ...product, stock, paid, due };
    });

    return NextResponse.json({
      success: true,
      vendor,
      products: rows,
      totals: {
        products: rows.length,
        stock: rows.reduce((total, product) => total + product.stock, 0),
        paid: rows.reduce((total, product) => total + product.paid, 0),
        due: rows.reduce((total, product) => total + product.due, 0),
      },
    });
  } catch (error) {
    console.error("Vendor summary error:", error);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
