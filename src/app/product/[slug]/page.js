import TopBar from "../../../components/TopBar";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import Breadcrumb from "../../../components/Breadcrumb";
import ProductGallery from "../../../components/ProductGallery";
import ProductInfo from "../../../components/ProductInfo";
import SectionHeader from "../../../components/SectionHeader";
import ProductCard from "../../../components/ProductCard";
import { getProductBySlug, getProducts } from "../../../controllers/productController";
import { notFound } from "next/navigation";

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = (await getProducts({ limit: 100 }))
    .filter((item) => item._id.toString() !== product._id.toString() && item.categoryIds?.some((category) => product.categoryIds?.includes(category)))
    .slice(0, 4);
  const galleryImages = product.images?.map((image) => (typeof image === "string" ? image : image?.url)).filter(Boolean) || [];

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <TopBar />
      <Navbar />

      <Breadcrumb
        items={[
          { label: "Account", href: "/account" },
          { label: "Gaming", href: "/shop/gaming" },
          { label: "Havic HV G-92 Gamepad" },
        ]}
      />

      <main className="page-shell mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-16 pb-16">
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <ProductGallery images={galleryImages} productName={product.name} />
          <ProductInfo
            productId={product._id.toString()}
            name={product.name}
            rating={product.rating}
            reviewCount={product.reviewCount}
            inStock={product.variants?.some((variant) => variant.inventory?.quantity > 0)}
            price={product.basePrice}
            description={product.description}
            colors={product.colors}
            sizes={["XS", "S", "M", "L", "XL"]}
            vendor={product.vendorId}
          />
        </section>

        <section className="flex flex-col gap-10">
         <div className="flex items-center gap-4">
              <div className="h-10 w-4 rounded bg-[#DB4444]" />
              <span className="text-base font-semibold text-[#DB4444]">
              Related Item
              </span>
            </div>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}