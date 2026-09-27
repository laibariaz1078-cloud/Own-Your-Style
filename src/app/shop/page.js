"use client";

import { useMemo, useState, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Breadcrumb from "../../components/Breadcrumb";
import SectionHeader from "../../components/SectionHeader";
import ProductCard from "../../components/ProductCard";
import CategorySidebar from "../../components/CategorySidebar";

const fallbackProductsByCategory = {
  phones: [
    { id: "fallback-phone-1", name: "Classic Bomber Jacket", image: "/1.png", price: 799, rating: 5, reviewCount: 42 },
    { id: "fallback-phone-2", name: "Pro Wireless Gamepad", image: "/2.png", price: 499, rating: 4, reviewCount: 28 },
  ],
  computers: [
    { id: "fallback-computer-1", name: "Cesar Dog Food", image: "/5.png", price: 370, rating: 5, reviewCount: 36 },
    { id: "fallback-computer-2", name: "S-Series Comfort Chair", image: "/10.png", price: 1200, rating: 5, reviewCount: 51 },
  ],
  smartwatch: [
    { id: "fallback-watch-1", name: "Classic Bomber Jacket", image: "/1.png", price: 229, rating: 4, reviewCount: 31 },
    { id: "fallback-watch-2", name: "Pro Wireless Gamepad", image: "/2.png", price: 179, rating: 4, reviewCount: 24 },
  ],
  camera: [
    { id: "fallback-camera-1", name: "Cesar Dog Food", image: "/5.png", price: 360, rating: 5, reviewCount: 95 },
    { id: "fallback-camera-2", name: "S-Series Comfort Chair", image: "/10.png", price: 289, rating: 4, reviewCount: 19 },
  ],
  headphones: [
    { id: "fallback-headphones-1", name: "Classic Bomber Jacket", image: "/1.png", price: 149, rating: 5, reviewCount: 63 },
    { id: "fallback-headphones-2", name: "Pro Wireless Gamepad", image: "/2.png", price: 119, rating: 4, reviewCount: 38 },
  ],
  gaming: [
    { id: "fallback-gaming-1", name: "Pro Wireless Gamepad", image: "/2.png", price: 660, rating: 5, reviewCount: 55 },
    { id: "fallback-gaming-2", name: "Cesar Dog Food", image: "/5.png", price: 899, rating: 5, reviewCount: 47 },
  ],
};

const fallbackCatalog = Object.entries(fallbackProductsByCategory)
  .flatMap(([category, categoryProducts]) => categoryProducts.map((product) => ({
    ...product,
    category,
    addToCartVisible: true,
    collection: "explore",
  })));

const normalizeCategoryMatchValue = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const matchesFilters = (product, selectedCategory, searchTerm) => {
  const normalizedCategory = selectedCategory || "all";
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const categoryCandidates = [
    product.category,
    product.categorySlug,
    product.categoryId,
    product.categoryName,
    product.categoryIds,
    product.category_id,
  ].flatMap((value) => {
    if (Array.isArray(value)) return value;
    return [value];
  });

  const categoryMatches =
    normalizedCategory === "all" ||
    categoryCandidates.some((candidate) => {
      const value = normalizeCategoryMatchValue(candidate);
      if (!value) return false;
      return value === normalizedCategory || normalizeCategoryMatchValue(product.name).includes(normalizedCategory) || value.includes(normalizedCategory);
    });

  return categoryMatches && (!normalizedSearch || product.name.toLowerCase().includes(normalizedSearch));
};

export default function ShopPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const categoryFromUrl = new URLSearchParams(window.location.search).get("category");
    const categorySync = setTimeout(() => {
      setSelectedCategory(categoryFromUrl || "all");
    }, 0);

    fetch("/api/products?limit=100")
      .then((response) => response.json())
      .then((data) => setProducts(data.success ? data.products : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));

    return () => clearTimeout(categorySync);
  }, []);

  const filteredFlashSale = useMemo(
    () => products.filter((product) => product.collection === "flashSale" && matchesFilters(product, selectedCategory, searchTerm)),
    [products, selectedCategory, searchTerm]
  );

  const filteredBestSelling = useMemo(
    () => products.filter((product) => product.collection === "bestSelling" && matchesFilters(product, selectedCategory, searchTerm)),
    [products, selectedCategory, searchTerm]
  );

  const filteredExplore = useMemo(
    () => products.filter((product) => product.collection === "explore" && matchesFilters(product, selectedCategory, searchTerm)),
    [products, selectedCategory, searchTerm]
  );

  const filteredFallback = useMemo(
    () => fallbackCatalog.filter((product) => matchesFilters(product, selectedCategory, searchTerm)),
    [selectedCategory, searchTerm]
  );

  const displayedExplore = filteredExplore.length > 0 ? filteredExplore : filteredFallback;

  const totalCount = filteredFlashSale.length + filteredBestSelling.length + displayedExplore.length;
  const hasAnyProducts = totalCount > 0;

  const gridColsClass = sidebarOpen
    ? "grid-cols-2 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  return (
    <>
      <TopBar />
      <Navbar searchValue={searchTerm} onSearchChange={setSearchTerm} />

      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Shop" }]} />

      <main className="page-shell flex flex-col gap-14 pb-20">
        {/* Intro strip */}
        <div className="flex flex-col gap-1 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((previous) => !previous)}
              className="flex h-9 w-9 items-center justify-center rounded border border-black/10 text-gray-600 hover:border-black/30 hover:text-black"
              aria-label={sidebarOpen ? "Hide categories" : "Show categories"}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-black">Shop</h1>
              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Loading products..."
                  : searchTerm
                  ? `${totalCount} result${totalCount === 1 ? "" : "s"} for "${searchTerm}"`
                  : `${totalCount} product${totalCount === 1 ? "" : "s"} available`}
              </p>
            </div>
          </div>
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="w-fit text-sm text-[#DB4444] underline-offset-4 hover:underline"
            >
              Clear category filter
            </button>
          )}
        </div>

        <section className="flex flex-col gap-10 lg:flex-row lg:gap-8">
          {sidebarOpen && (
            <CategorySidebar
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          )}

          <div className="flex-1 space-y-16">
            {loading && (
              <div className={`grid gap-6 ${gridColsClass}`}>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="aspect-3/4 animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            )}

            {!loading && !hasAnyProducts && (
              <div className="flex flex-col items-center gap-2 rounded border border-dashed border-gray-200 bg-gray-50 px-6 py-16 text-center">
                <p className="text-base font-medium text-black">No products found</p>
                <p className="text-sm text-gray-500">
                  Try a different category or clear your search to see everything in stock.
                </p>
              </div>
            )}

            {!loading && filteredFlashSale.length > 0 && (
              <section className="flex flex-col gap-8">
                <SectionHeader eyebrow="Featured" title="Flash Sale" showViewAll />
                <div className={`grid gap-x-6 gap-y-10 ${gridColsClass}`}>
                  {filteredFlashSale.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {!loading && filteredBestSelling.length > 0 && (
              <section className="flex flex-col gap-8">
                <SectionHeader eyebrow="Popular" title="Best Selling" showViewAll />
                <div className={`grid gap-x-6 gap-y-10 ${gridColsClass}`}>
                  {filteredBestSelling.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}

            {!loading && displayedExplore.length > 0 && (
              <section className="flex flex-col gap-8">
                <SectionHeader eyebrow="Browse" title={selectedCategory === "all" ? "All Products" : "Related Products"} showViewAll />
                <div className={`grid gap-x-6 gap-y-10 ${gridColsClass}`}>
                  {displayedExplore.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}