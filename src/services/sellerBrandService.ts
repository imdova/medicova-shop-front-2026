import { apiClient } from "@/lib/apiClient";
import { LocalizedTitle } from "@/types/language";

export interface SellerBrand {
  _id: string;
  brandName: string;
  brandLogo: string;
  brandWebsiteLink?: string;
  sellerId: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface CreateSellerBrandPayload {
  sellerId: string;
  brandName: string;
  brandWebsiteLink?: string;
  brandLogo: string;
}

export async function getSellerBrandsMe(token?: string): Promise<SellerBrand[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/seller-brands/me",
      method: "GET",
      token,
      suppressErrorLog: true,
    });
    const data = res.data?.brands || res.data || [];
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    const isPermissionError = 
      error?.message?.includes("permission") || 
      error?.message?.includes("403");
    
    if (!isPermissionError) {
      console.error("Error fetching seller brands:", error);
    }
    return [];
  }
}

export async function createSellerBrand(payload: CreateSellerBrandPayload, token?: string) {
  return apiClient({
    endpoint: "/seller-brands",
    method: "POST",
    body: payload as any,
    token,
  });
}

export async function updateSellerBrand(id: string, payload: Partial<CreateSellerBrandPayload>, token?: string) {
  return apiClient({
    endpoint: `/seller-brands/${id}`,
    method: "PUT",
    body: payload as any,
    token,
  });
}

export async function deleteSellerBrand(id: string, token?: string) {
  return apiClient({
    endpoint: `/seller-brands/${id}`,
    method: "DELETE",
    token,
  });
}

export async function checkSellerBrandExists(name: string, token?: string): Promise<boolean> {
  const brands = await getSellerBrandsMe(token);
  return brands.some((b) => b.brandName.toLowerCase() === name.trim().toLowerCase());
}
