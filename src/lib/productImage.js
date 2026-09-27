const FALLBACK_PRODUCT_IMAGE = "/product1.png";

export function getProductImage(product) {
  const firstImage = Array.isArray(product?.images) ? product.images[0] : null;
  const image = product?.image || product?.thumbnail || firstImage?.url || firstImage;

  return typeof image === "string" && image.trim() ? image : FALLBACK_PRODUCT_IMAGE;
}
