"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const categoryDefinitions = [
  { slug: "women", name: "Women's Fashion", hasSub: true },
  { slug: "men", name: "Men's Fashion", hasSub: true },
  { slug: "electronics", name: "Electronics" },
  { slug: "home", name: "Home & Lifestyle" },
  { slug: "medicine", name: "Medicine" },
  { slug: "sports", name: "Sports & Outdoor" },
  { slug: "baby", name: "Baby's & Toys" },
  { slug: "groceries", name: "Groceries & Pets" },
  { slug: "beauty", name: "Health & Beauty" },
  { slug: "phones", name: "Phones" },
  { slug: "computers", name: "Computers" },
  { slug: "smartwatch", name: "SmartWatch" },
  { slug: "camera", name: "Camera" },
  { slug: "headphones", name: "HeadPhones" },
  { slug: "gaming", name: "Gaming" },
];

export default function CategorySidebar({ selectedCategory = "all", onSelectCategory }) {
  const [categories, setCategories] = useState([]);

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

  return (
<nav className="hidden h-full min-h-0 w-49 shrink-0 self-stretch border-r border-gray-300 border-line pr-6 lg:flex lg:flex-col">
  <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto py-2 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <li>
          <button
            type="button"
            onClick={() => onSelectCategory?.("all")}
            className={`w-full text-left text-sm transition-colors ${selectedCategory === "all" ? "font-semibold text-brand" : "text-black hover:text-brand"}`}
          >
            All Categories
          </button>
        </li>
        {categories.map((category) => {
          const isActive = selectedCategory === category.slug;

          return (
            <li key={category.slug}>
              <button
                type="button"
                onClick={() => onSelectCategory?.(category.slug)}
                className={`flex w-full items-center justify-between text-left text-sm transition-colors ${
                  isActive ? "font-semibold text-brand" : "text-black hover:text-brand"
                }`}
              >
                <span>{category.name}</span>
                {category.hasSub && <ChevronRight className="h-4 w-4" />}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}