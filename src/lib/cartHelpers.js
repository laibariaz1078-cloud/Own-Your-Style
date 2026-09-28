export const LOW_STOCK_THRESHOLD = 5;

export function getProductStock(product) {
  if (Array.isArray(product?.variants) && product.variants.length === 0) return 0;
  const rawStock = product?.variants?.[0]?.inventory?.quantity
    ?? product?.inventory?.quantity
    ?? product?.stock;
  if (rawStock == null || rawStock === "") return null;
  const stock = Number(rawStock);
  return Number.isFinite(stock) ? Math.max(0, Math.floor(stock)) : null;
}

export function getCartQuantityLimit(product, currentQuantity = 0) {
  const stock = getProductStock(product);
  return (stock ?? 0) + Math.max(0, Number(currentQuantity) || 0);
}

export function clampCartQuantity(value, maximum) {
  const parsed = Number.parseInt(value, 10);
  const maxQuantity = Math.max(1, Math.floor(Number(maximum) || 1));
  return Math.min(maxQuantity, Math.max(1, Number.isFinite(parsed) ? parsed : 1));
}

export async function addProductToCart({ product, user, refreshCartCount, quantity = 1 }) {
  const productId = String(product?.id || product?._id || product?.productId || "");
  const requestedQuantity = Number(quantity);
  const stock = getProductStock(product);

  if (!productId) throw new Error("This product is unavailable.");
  if (!Number.isInteger(requestedQuantity) || requestedQuantity < 1) {
    throw new Error("Quantity must be a positive whole number.");
  }
  if (stock === 0) throw new Error("This item is out of stock");

  let alreadyInCart = 0;
  let remainingStock = stock == null ? null : Math.max(0, stock - requestedQuantity);

  if (!user) {
    let guestItems = [];
    try {
      const stored = JSON.parse(localStorage.getItem("guest_cart_items") || "[]");
      guestItems = Array.isArray(stored) ? stored : [];
    } catch {
      guestItems = [];
    }

    const existingItem = guestItems.find((item) => String(item.productId) === productId);
    alreadyInCart = Number(existingItem?.quantity) || 0;
    if (stock != null && alreadyInCart + requestedQuantity > stock) {
      throw new Error(`Only ${Math.max(0, stock - alreadyInCart)} available.`);
    }

    if (/^[a-f\d]{24}$/i.test(productId)) {
      const response = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: requestedQuantity,
          unitPrice: Number(product.basePrice ?? product.price ?? 0),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to add to cart");
      remainingStock = data.availableStock != null && Number.isFinite(Number(data.availableStock))
        ? Math.max(0, Number(data.availableStock))
        : remainingStock;
    }

    const nextItems = existingItem
      ? guestItems.map((item) => String(item.productId) === productId
        ? { ...item, quantity: alreadyInCart + requestedQuantity }
        : item)
      : [...guestItems, { productId, quantity: requestedQuantity }];
    localStorage.setItem("guest_cart_items", JSON.stringify(nextItems));
    remainingStock = stock == null ? null : Math.max(0, stock - alreadyInCart - requestedQuantity);
  } else {
    if (stock != null && requestedQuantity > stock) throw new Error(`Only ${stock} available.`);

    const response = await fetch("/api/cart", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        quantity: requestedQuantity,
        unitPrice: Number(product.basePrice ?? product.price ?? 0),
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Unable to add to cart");
    remainingStock = data.availableStock != null && Number.isFinite(Number(data.availableStock))
      ? Math.max(0, Number(data.availableStock))
      : remainingStock;
  }

  window.dispatchEvent(new CustomEvent("cart:updated"));
  await refreshCartCount?.();

  const isLowStock = remainingStock != null && remainingStock <= LOW_STOCK_THRESHOLD;

  return {
    isLowStock,
    remainingStock,
    message: isLowStock
      ? `Added to cart — only ${remainingStock} left in stock.`
      : "Added to cart.",
  };
}