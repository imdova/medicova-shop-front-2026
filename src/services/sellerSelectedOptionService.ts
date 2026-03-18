import { apiClient } from "@/lib/apiClient";

export interface SellerSelectedOptionPayload {
  sellerId: string;
  productId: string;
  options: Array<{
    variantId: string;
    values: string[];
  }> | null;
  distribution: Array<{
    [key: string]: string | number;
    stock: number;
  }>;
}

export async function createOrUpdateSellerSelectedOptions(
  payload: SellerSelectedOptionPayload,
  token?: string
) {
  return apiClient({
    endpoint: "/seller-selected-option",
    method: "POST", // Based on user schema description
    body: payload as any,
    token,
  });
}

export async function updateSellerSelectedOptions(
  id: string,
  payload: Partial<SellerSelectedOptionPayload>,
  token?: string
) {
  return apiClient({
    endpoint: `/seller-selected-option/${id}`,
    method: "PUT",
    body: payload as any,
    token,
  });
}

export async function getSellerSelectedOptions(
  productId: string,
  token?: string
) {
  return apiClient({
    endpoint: `/seller-selected-option/by-product/${productId}`,
    method: "GET",
    token,
  });
}
