import { apiClient } from "@/lib/apiClient";
import { mapApiProductToProduct } from "./productService";

export async function getWishlist(token: string) {
  const res = await apiClient<any>({
    endpoint: "/customer-wishlists",
    method: "GET",
    token,
  });
  
  // The API returns { status: "success", data: { products: [...], ... }, ... }
  // or it might return an array directly in some scenarios.
  const data = res?.data?.products || res?.products || res?.data || res || [];
  
  return Array.isArray(data) 
    ? data.map((item: any) => mapApiProductToProduct(item.product || item)) 
    : [];
}

export async function addToWishlist(productId: string, token: string) {
  return apiClient<any>({
    endpoint: "/customer-wishlists/add",
    method: "POST",
    body: { productIds: [productId] },
    token,
  });
}

export async function removeFromWishlist(productId: string, token: string) {
  return apiClient<any>({
    endpoint: "/customer-wishlists/remove",
    method: "POST",
    body: { productIds: [productId] },
    token,
  });
}

export async function clearWishlist(token: string) {
  return apiClient<any>({
    endpoint: "/customer-wishlists/clear",
    method: "POST",
    token,
  });
}
