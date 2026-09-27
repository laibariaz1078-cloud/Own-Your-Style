"use client";

import {
  Smartphone,
  Monitor,
  Watch,
  Camera,
  Headphones,
  Gamepad2,
  Shirt,
  House,
  Pill,
  Trophy,
  Baby,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const categoryDefinitions = [
  { slug: "women", name: "Women's Fashion", icon: Shirt },
  { slug: "men", name: "Men's Fashion", icon: Shirt },
  { slug: "electronics", name: "Electronics", icon: Monitor },
  { slug: "home", name: "Home & Lifestyle", icon: House },
  { slug: "medicine", name: "Medicine", icon: Pill },
  { slug: "sports", name: "Sports & Outdoor", icon: Trophy },
  { slug: "baby", name: "Baby's & Toys", icon: Baby },
  { slug: "groceries", name: "Groceries & Pets", icon: ShoppingBag },
  { slug: "beauty", name: "Health & Beauty", icon: Sparkles },
  { slug: "phones", name: "Phones", icon: Smartphone },
  { slug: "computers", name: "Computers", icon: Monitor },
  { slug: "smartwatch", name: "SmartWatch", icon: Watch },
  { slug: "camera", name: "Camera", icon: Camera },
  { slug: "headphones", name: "HeadPhones", icon: Headphones },
  { slug: "gaming", name: "Gaming", icon: Gamepad2 },
];

export default function CategoryTabs() {
  const [categories, setCategories] = useState([]);
  const [active, setActive] = useState("all");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    let activeRequest = true;
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load categories");
        const data = await response.json();
        if (!activeRequest) return;
        const categoryMap = new Map((data.categories || []).map((category) => [category.slug, category]));
        const mergedCategories = categoryDefinitions
          .map((definition) => ({ ...definition, ...(categoryMap.get(definition.slug) || {}) }))
          .filter((category) => category.name);
        setCategories(mergedCategories.length ? mergedCategories : categoryDefinitions);
      } catch {
        if (activeRequest) setCategories(categoryDefinitions);
      }
    };

    loadCategories();
    const refreshTimer = setInterval(loadCategories, 30_000);

    return () => {
      activeRequest = false;
      clearInterval(refreshTimer);
    };
  }, []);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [categories, updateArrows]);

  const scrollByPage = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (el.clientWidth + 32), behavior: "smooth" });
  };

  return (
       <div className="w-full">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-wider text-black sm:text-3xl">
          Browse By Category
        </h2>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={!canScrollLeft}
            aria-label="Previous categories"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F5F5] text-black transition-all duration-300 hover:bg-[#DB4444] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#F5F5F5] disabled:hover:text-black"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={!canScrollRight}
            aria-label="Next categories"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F5F5F5] text-black transition-all duration-300 hover:bg-[#DB4444] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#F5F5F5] disabled:hover:text-black"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = active === category.slug;

          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => {
                setActive(category.slug);
                router.push(`/shop?category=${encodeURIComponent(category.slug)}`);
              }}
              className={`flex h-[145px] w-[calc((100%_-_2rem)/2)] flex-none snap-start flex-col items-center justify-center gap-4 rounded-md border transition-all duration-300 sm:w-[calc((100%_-_4rem)/3)] md:w-[calc((100%_-_6rem)/4)] lg:w-[calc((100%_-_8rem)/5)] ${
                isActive
                  ? "border-[#DB4444] bg-[#DB4444] text-white shadow-sm"
                  : "border-black/30 bg-white text-black hover:border-[#DB4444] hover:bg-[#DB4444] hover:text-white"
              }`}
            >
              <Icon className="h-14 w-14 stroke-[1.25]" />
              <span className="text-base font-normal tracking-wide">
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}