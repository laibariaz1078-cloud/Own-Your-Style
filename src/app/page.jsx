"use client";

import { useMemo, useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CategorySidebar from "../components/CategorySidebar";
import HeroBanner from "../components/HeroBanner";
import ProductCard from "../components/ProductCard";
import CategoryTabs from "../components/CategoryTabs";
import MusicPromoBanner from "../components/MusicPromoBanner";
import NewArrivalGrid from "../components/NewArrivalGrid";
import FeaturesStrip from "../components/FeaturesStrip";
import { flashSaleProducts, bestSellingProducts, exploreProducts } from "./home-data";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
      return value === normalizedCategory || value.includes(normalizedCategory);
    });

  return categoryMatches && (!normalizedSearch || product.name.toLowerCase().includes(normalizedSearch));
};

function SectionBadge({ label }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="h-6 w-3 rounded bg-[#DB4444] sm:h-8 sm:w-3.5 md:h-10 md:w-4" />
      <span className="text-sm font-semibold text-[#DB4444] sm:text-base">
        {label}
      </span>
    </div>
  );
}

function NavArrows({ prevLabel, nextLabel }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        aria-label={prevLabel}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-black transition-colors hover:bg-gray-200 sm:h-10 sm:w-10 md:h-11 md:w-11"
      >
        <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F5F5F5] text-black transition-colors hover:bg-gray-200 sm:h-10 sm:w-10 md:h-11 md:w-11"
      >
        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
      </button>
    </div>
  );
}

function ViewAllButton({ href, children }) {
  return (
    <Link
      href={href}
      className="rounded bg-[#DB4444] px-5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#c33838] sm:px-8 sm:py-3 sm:text-sm md:px-12 md:py-4 md:text-base"
    >
      {children}
    </Link>
  );
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const fallbackProducts = useMemo(
    () => [
      ...flashSaleProducts.map((product) => ({ ...product, collection: "flashSale" })),
      ...bestSellingProducts.map((product) => ({ ...product, collection: "bestSelling" })),
      ...exploreProducts.map((product) => ({ ...product, collection: "explore" })),
    ],
    []
  );
  const [products, setProducts] = useState(fallbackProducts);

  useEffect(() => {
    let isCurrent = true;

    fetch("/api/products?limit=100")
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load products");
        return response.json();
      })
      .then((data) => {
        if (isCurrent && data.success && data.products.length > 0) {
          setProducts(data.products);
        }
      })
      .catch(() => {
        // Keep the local catalog visible if the database is temporarily unavailable.
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const [timeLeft, setTimeLeft] = useState({
    days: "03",
    hours: "23",
    minutes: "19",
    seconds: "56",
  });

  useEffect(() => {
    const target = Date.now() + 3 * 24 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      const diff = target - Date.now();

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(timer);
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

  const hasAnyProducts =
    filteredFlashSale.length || filteredBestSelling.length || filteredExplore.length;

  return (
    <>
      <TopBar />
      <Navbar searchValue={searchTerm} onSearchChange={setSearchTerm} />

      <main className="page-shell flex flex-col gap-6 py-6 overflow-x-hidden sm:gap-8">
        <section className="flex flex-col gap-6 md:flex-row md:gap-8">
          <CategorySidebar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          <HeroBanner />
        </section>

        {!hasAnyProducts && (
          <div className="rounded border border-dashed border-line bg-gray-50 px-4 py-8 text-center text-sm text-gray-600 sm:px-6 sm:py-10">
            No products match the selected category or search.
          </div>
        )}

        <section className="flex flex-col gap-6 mt-5">
          <div className="flex flex-col gap-3">
            <SectionBadge label="Today's" />

            <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
              <div className="flex flex-wrap items-end gap-6 sm:gap-10 md:gap-20">
                <h2 className="text-2xl font-semibold tracking-wider text-black sm:text-3xl md:text-4xl">
                  Flash Sales
                </h2>

                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-black sm:text-xs">Days</span>
                    <span className="text-xl font-bold tracking-wider text-black sm:text-2xl md:text-3xl">
                      {timeLeft.days}
                    </span>
                  </div>

                  <span className="self-end pb-1 text-lg font-bold text-[#DB4444] sm:text-2xl">
                    :
                  </span>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-black sm:text-xs">Hours</span>
                    <span className="text-xl font-bold tracking-wider text-black sm:text-2xl md:text-3xl">
                      {timeLeft.hours}
                    </span>
                  </div>

                  <span className="self-end pb-1 text-lg font-bold text-[#DB4444] sm:text-2xl">
                    :
                  </span>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-black sm:text-xs">Minutes</span>
                    <span className="text-xl font-bold tracking-wider text-black sm:text-2xl md:text-3xl">
                      {timeLeft.minutes}
                    </span>
                  </div>

                  <span className="self-end pb-1 text-lg font-bold text-[#DB4444] sm:text-2xl">
                    :
                  </span>

                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-black sm:text-xs">Seconds</span>
                    <span className="text-xl font-bold tracking-wider text-black sm:text-2xl md:text-3xl">
                      {timeLeft.seconds}
                    </span>
                  </div>
                </div>
              </div>

              <NavArrows prevLabel="Previous" nextLabel="Next" />
            </div>
          </div>

          <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
            {filteredFlashSale.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredFlashSale.length > 0 && (
            <div className="flex justify-center pt-4">
              <ViewAllButton href="/shop">View All Products</ViewAllButton>
            </div>
          )}
        </section>

        <hr className="border-line border-gray-300" />

        <section className="flex flex-col gap-6 py-2">
          <div className="flex flex-col gap-4 sm:gap-5">
            <SectionBadge label="Categories" />

            {/* <div className="flex items-center justify-between gap-3"> */}
             

              {/* <NavArrows prevLabel="Previous category" nextLabel="Next category" /> */}
            {/* </div> */}
          </div>

          <CategoryTabs />
        </section>

        <hr className="border-line border-gray-300" />

        <section className="flex flex-col gap-6 py-2">
          <div className="flex flex-col gap-3 sm:gap-4">
            <SectionBadge label="This Month" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-wider text-black sm:text-3xl md:text-4xl">
                Best Selling Products
              </h2>

              <ViewAllButton href="/shop">View All</ViewAllButton>
            </div>
          </div>

          <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
            {filteredBestSelling.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <MusicPromoBanner />

        <section className="flex flex-col gap-6 py-2 mt-5 sm:gap-8">
          <div className="flex flex-col gap-4 sm:gap-5">
            <SectionBadge label="Our Products" />

            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-wider text-black sm:text-3xl md:text-4xl">
                Explore Our Products
              </h2>

              <NavArrows prevLabel="Previous products" nextLabel="Next products" />
            </div>
          </div>

          <div className="grid grid-cols-1 justify-items-center gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-12">
            {filteredExplore.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredExplore.length > 0 && (
            <div className="flex justify-center pt-4">
              <ViewAllButton href="/shop">View All Products</ViewAllButton>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-6 py-2 mt-5">
          <div className="flex flex-col gap-4 sm:gap-5">
            <SectionBadge label="Featured" />

            <h2 className="text-2xl font-semibold tracking-wider text-black sm:text-3xl md:text-4xl">
              New Arrival
            </h2>
          </div>

          <NewArrivalGrid />
        </section>

        <FeaturesStrip />
      </main>

      <Footer />
    </>
  );
}