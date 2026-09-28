"use client";

import TopBar from "../../components/TopBar";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import WishlistGrid from "../../components/WishlistGrid";
import ProductCard from "../../components/ProductCard";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { flashSaleProducts, bestSellingProducts, exploreProducts } from "../home-data";
import { getBuyerOnlyMessage, isBuyerRole } from "../../lib/permissions";
import { showModal } from "../../lib/modal";
import { LoaderCircle, ShoppingBag } from "lucide-react";
import { addProductToCart as addCartItem, getProductStock } from "../../lib/cartHelpers";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [justForYouProducts, setJustForYouProducts] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [pendingAddToCartId, setPendingAddToCartId] = useState(null);
  const [addedProductIds, setAddedProductIds] = useState([]);
  const [isAddingAll, setIsAddingAll] = useState(false);
  const router = useRouter();
  const { refreshCartCount, refreshWishlistItems, user } = useAppContext();
  const isRestrictedBuyerRole = !!user && !isBuyerRole(user.role);

  const getGuestWishlistIds = () => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem("guest_wishlist_ids");
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  };

  const loadWishlistItems = useCallback(async () => {
    try {
      if (!user) {
        const ids = getGuestWishlistIds();
        if (!ids.length) {
          setWishlistItems([]);
          return;
        }

        const response = await fetch("/api/products?limit=100");
        const data = await response.json();
        const products = Array.isArray(data?.products) ? data.products : [];
        const catalog = [...flashSaleProducts, ...bestSellingProducts, ...exploreProducts];
        const productSources = [...products, ...catalog];
        const mappedItems = ids
          .map((id) => productSources.find((product) => String(product._id || product.id) === id))
          .filter(Boolean)
          .map((product) => ({
            ...product,
            id: String(product._id || product.id),
            image: product.image || product.images?.[0]?.url || "",
            price: product.basePrice ?? product.price ?? 0,
          }));

        setWishlistItems(mappedItems);
        return;
      }

      const response = await fetch("/api/wishlist", { credentials: "include" });
      const data = await response.json();
      setWishlistItems(data.success ? data.wishlist : []);
    } catch (error) {
      setWishlistItems([]);
    }
  }, [user]);

  const handleRemoveWishlistItem = async (productId) => {
    try {
      if (!user) {
        const ids = getGuestWishlistIds();
        const nextIds = ids.filter((id) => String(id) !== String(productId));
        localStorage.setItem("guest_wishlist_ids", JSON.stringify(nextIds));
        setWishlistItems((prevItems) => prevItems.filter((item) => String(item.id) !== String(productId)));
        window.dispatchEvent(new CustomEvent("wishlist:updated"));
        return;
      }

      const response = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to remove item from wishlist");
      }

      setWishlistItems((prevItems) => prevItems.filter((item) => String(item.id) !== String(productId)));
      await refreshWishlistItems();
      window.dispatchEvent(new CustomEvent("wishlist:updated"));
    } catch (error) {
      console.error("Remove wishlist item failed", error);
    }
  };

  const handleAddToCartFromWishlist = async (product) => {
    const productId = product?.id || product?._id || product?.productId;
    if (!productId) return;

    if (getProductStock(product) === 0) {
      setToastMessage("This item is out of stock");
      setToastType("error");
      window.setTimeout(() => setToastMessage(""), 2400);
      return;
    }

    if (user && !isBuyerRole(user.role)) {
      await showModal({
        title: "Buyer access required",
        message: getBuyerOnlyMessage(user.role),
      });
      return;
    }

    const normalizedProductId = String(productId);
    setPendingAddToCartId(normalizedProductId);
    setAddedProductIds((prev) => (prev.includes(normalizedProductId) ? prev : [...prev, normalizedProductId]));

    try {
      const result = await addCartItem({ product, user, refreshCartCount });
      setToastMessage(result.message);
      setToastType(result.isLowStock ? "warning" : "success");

      window.setTimeout(() => {
        setToastMessage("");
        setAddedProductIds((prev) => prev.filter((id) => String(id) !== normalizedProductId));
      }, 1700);
    } catch (error) {
      console.error("Add wishlist item to cart failed", error);
      setToastMessage(error.message || "Unable to add to cart");
      setToastType("error");
      setAddedProductIds((prev) => prev.filter((id) => String(id) !== normalizedProductId));
      window.setTimeout(() => setToastMessage(""), 2400);
    } finally {
      window.setTimeout(() => {
        setPendingAddToCartId((currentId) => (String(currentId) === normalizedProductId ? null : currentId));
      }, 300);
    }
  };

  const handleAddAllToCart = async () => {
    if (isAddingAll || !wishlistItems.length || isRestrictedBuyerRole) return;

    setIsAddingAll(true);
    let addedCount = 0;
    let failedCount = wishlistItems.filter((product) => getProductStock(product) === 0).length;
    let lowStockAdded = false;

    try {
      for (const product of wishlistItems) {
        try {
          const result = await addCartItem({ product, user, refreshCartCount });
          lowStockAdded = lowStockAdded || result.isLowStock;
          addedCount += 1;
        } catch (error) {
          if (getProductStock(product) !== 0) failedCount += 1;
        }
      }

      const message = addedCount
        ? `${addedCount} ${addedCount === 1 ? "item" : "items"} added to your bag${failedCount ? `; ${failedCount} could not be added` : ""}`
        : "No available items could be added";
      setToastMessage(message);
      setToastType(addedCount ? lowStockAdded ? "warning" : "success" : "error");
      window.setTimeout(() => setToastMessage(""), 2400);
    } catch (error) {
      console.error("Add all wishlist items to cart failed", error);
      setToastMessage("Unable to add wishlist items to your bag");
      setToastType("error");
      window.setTimeout(() => setToastMessage(""), 2400);
    } finally {
      setIsAddingAll(false);
    }
  };

  useEffect(() => {
    const syncWishlist = () => {
      void loadWishlistItems();
    };

    const timer = window.setTimeout(() => {
      void loadWishlistItems();
    }, 0);

    window.addEventListener("wishlist:updated", syncWishlist);

    fetch("/api/products?limit=4")
      .then((response) => response.json())
      .then((data) => setJustForYouProducts(data.success ? data.products : []))
      .catch(() => setJustForYouProducts([]));

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wishlist:updated", syncWishlist);
    };
  }, [loadWishlistItems]);

  return (
    <div className="min-h-screen bg-white font-sans text-black">
      <TopBar />
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-5">
        {toastMessage && (
          <div role="status" className={`fixed bottom-5 left-4 right-4 z-50 mx-auto max-w-sm rounded-lg px-4 py-3 text-center text-sm font-medium text-white shadow-xl sm:left-auto sm:right-6 sm:text-left ${toastType === "warning" ? "bg-amber-500" : toastType === "error" ? "bg-red-600" : "bg-neutral-900"}`}>
            {toastMessage}
          </div>
        )}

        <div className="mb-7 flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">Saved for later</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">My Wishlist <span className="text-lg font-medium text-neutral-400">({wishlistItems.length})</span></h1>
          </div>
          <button
            type="button"
            onClick={handleAddAllToCart}
            disabled={isAddingAll || !wishlistItems.length || isRestrictedBuyerRole}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-[#DB4444] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c93636] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DB4444] focus-visible:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 disabled:shadow-none sm:w-auto sm:min-w-48"
          >
            {isAddingAll ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
            {isAddingAll ? "Adding items..." : "Add all to bag"}
          </button>
        </div>

        <WishlistGrid
          products={wishlistItems}
          onRemove={handleRemoveWishlistItem}
          onAddToCart={handleAddToCartFromWishlist}
          addedProductIds={addedProductIds}
          pendingProductId={pendingAddToCartId}
          isRestrictedBuyerRole={isRestrictedBuyerRole}
        />

        <div className="mb-6 mt-14 flex items-center justify-between border-t border-neutral-200 pt-8 sm:mb-8 sm:mt-20">
          <div className="flex items-center gap-4">
            <span className="h-8 w-1.5 rounded-full bg-[#DB4444]" />
            <h2 className="text-xl font-semibold text-neutral-900">Just for you</h2>
          </div>
          <button type="button" onClick={() => router.push("/shop")} className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white">
            See All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {justForYouProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onWishlistChange={loadWishlistItems}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}