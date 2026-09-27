"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);
const GUEST_CART_KEY = "guest_cart_items";
const GUEST_WISHLIST_KEY = "guest_wishlist_ids";

function readGuestCartItems() {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeGuestCartItems(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function readGuestWishlistIds() {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function writeGuestWishlistIds(ids) {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(ids.map(String)));
}

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshSession = useCallback(async () => {
    if (typeof window === "undefined") return false;

    try {
      const response = await fetch("/api/auth/me", { credentials: "include" });

      if (response.status === 401) {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }

      const data = await response.json();

      if (response.ok && data?.success && data.user) {
        const fullName = [data.user.firstName, data.user.lastName].filter(Boolean).join(" ") || data.user.name || "User";
        setIsAuthenticated(true);
        setUser({ ...data.user, fullName });
        return true;
      }

      setIsAuthenticated(false);
      setUser(null);
      return false;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  }, []);

  const refreshCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      const guestItems = readGuestCartItems();
      const totalItems = guestItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      setCartCount(totalItems);
      return totalItems;
    }

    try {
      const response = await fetch("/api/cart", { credentials: "include" });
      const data = await response.json();

      if (!response.ok) {
        setCartCount(0);
        return 0;
      }

      const items = data?.cart?.items || [];
      const totalItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      setCartCount(totalItems);
      return totalItems;
    } catch (error) {
      setCartCount(0);
      return 0;
    }
  }, [isAuthenticated]);

  const refreshWishlistItems = useCallback(async () => {
    if (!isAuthenticated) {
      const ids = readGuestWishlistIds();
      setWishlistIds(ids);
      setWishlistCount(ids.length);
      return ids;
    }

    try {
      const response = await fetch("/api/wishlist", { credentials: "include" });
      const data = await response.json();

      if (!response.ok) {
        setWishlistIds([]);
        setWishlistCount(0);
        return [];
      }

      const ids = (Array.isArray(data?.wishlist) ? data.wishlist : [])
        .map((item) => String(item?.id || item?._id || item?.productId?._id || item?.productId || ""))
        .filter(Boolean);

      setWishlistIds(ids);
      setWishlistCount(ids.length);
      return ids;
    } catch (error) {
      setWishlistIds([]);
      setWishlistCount(0);
      return [];
    }
  }, [isAuthenticated]);

  const refreshWishlistCount = useCallback(async () => {
    const ids = await refreshWishlistItems();
    return ids.length;
  }, [refreshWishlistItems]);

  const toggleWishlistItem = useCallback(async ({ productId, isCurrentlyWishlisted }) => {
    const normalizedId = String(productId || "");

    if (!normalizedId) {
      return false;
    }

    if (!isAuthenticated) {
      const currentIds = readGuestWishlistIds();
      const nextIds = isCurrentlyWishlisted
        ? currentIds.filter((id) => id !== normalizedId)
        : [...new Set([...currentIds, normalizedId])];

      writeGuestWishlistIds(nextIds);
      setWishlistIds(nextIds);
      setWishlistCount(nextIds.length);
      window.dispatchEvent(new CustomEvent("wishlist:updated"));
      return nextIds.includes(normalizedId);
    }

    try {
      let response;

      if (isCurrentlyWishlisted) {
        const url = new URL("/api/wishlist", window.location.origin);
        url.searchParams.set("productId", normalizedId);

        response = await fetch(url.toString(), {
          method: "DELETE",
          credentials: "include",
        });
      } else {
        response = await fetch("/api/wishlist", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: normalizedId }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Unable to update wishlist");
      }

      const ids = await refreshWishlistItems();
      window.dispatchEvent(new CustomEvent("wishlist:updated"));
      return ids.includes(normalizedId);
    } catch (error) {
      console.error("Wishlist toggle failed", error);
      return isCurrentlyWishlisted;
    }
  }, [isAuthenticated, refreshWishlistItems]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshSession(), refreshCartCount(), refreshWishlistItems()]);
  }, [refreshSession, refreshCartCount, refreshWishlistItems]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setCartCount(readGuestCartItems().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0));
      const guestIds = readGuestWishlistIds();
      setWishlistIds(guestIds);
      setWishlistCount(guestIds.length);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshAll();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [refreshAll]);

  useEffect(() => {
    const handleCartUpdated = () => void refreshCartCount();
    const handleWishlistUpdated = () => void refreshWishlistItems();
    const handleAuthUpdated = async () => {
      await refreshSession();
      await refreshCartCount();
      await refreshWishlistItems();
    };

    window.addEventListener("cart:updated", handleCartUpdated);
    window.addEventListener("wishlist:updated", handleWishlistUpdated);
    window.addEventListener("auth:updated", handleAuthUpdated);

    return () => {
      window.removeEventListener("cart:updated", handleCartUpdated);
      window.removeEventListener("wishlist:updated", handleWishlistUpdated);
      window.removeEventListener("auth:updated", handleAuthUpdated);
    };
  }, [refreshCartCount, refreshSession, refreshWishlistItems]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      cartCount,
      wishlistIds,
      wishlistCount,
      refreshSession,
      refreshCartCount,
      refreshWishlistItems,
      refreshWishlistCount,
      toggleWishlistItem,
      refreshAll,
      logout,
      setIsAuthenticated,
      setUser,
    }),
    [isAuthenticated, user, cartCount, wishlistIds, wishlistCount, refreshSession, refreshCartCount, refreshWishlistItems, refreshWishlistCount, toggleWishlistItem, refreshAll, logout]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}
