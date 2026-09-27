export const ROLE_HOME = {
  admin: "/dashboard/admin",
  seller: "/dashboard/seller",
  buyer: "/dashboard/customer",
};

export function normalizeRole(role) {
  return role === "customer" ? "buyer" : role;
}

export function isBuyerRole(role) {
  return normalizeRole(role) === "buyer";
}

export function getBuyerOnlyMessage(role) {
  const currentRole = role || "guest";
  return `Your account role is ${currentRole}. Only buyers can add products to cart, save them to wishlist, or proceed to payment.`;
}

export function canAccess(role, pathname) {
  if (!role) return false;

  if (pathname.startsWith("/dashboard/admin")) {
    return role === "admin";
  }
  if (pathname.startsWith("/dashboard/seller")) {
    return role === "seller" || role === "admin";
  }
  if (pathname.startsWith("/dashboard/customer")) {
    return isBuyerRole(role) || role === "admin";
  }

  return true;
}
