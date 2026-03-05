import { apiClient } from "@/lib/apiClient";

export interface CreateProductPayload {
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  highlightsEn: string[];
  highlightsAr: string[];
  identity: {
    sku: string;
    skuMode: "manual" | "auto";
  };
  classification: {
    category: string;
    subcategory: string;
    childCategory: string;
    brand: string;
    productType: "Physical Product" | "Digital Product";
  };
  descriptions: {
    descriptionEn: string;
    descriptionAr: string;
  };
  pricing: {
    originalPrice: number;
    salePrice: number;
    startDate: string | null;
    endDate: string | null;
  };
  inventory: {
    trackStock: boolean;
    stockQuantity: number;
    stockStatus: "in_stock" | "out_of_stock" | "on_backorder";
  };
  variants: string[];
  specifications: Array<{
    keyEn?: string;
    keyAr?: string;
    valueEn?: string;
    valueAr?: string;
  }>;
  store: string;
  createdBy: "seller" | "admin";
  media: {
    featuredImages?: string;
    galleryImages: string[];
    productVideo?: {
      vedioUrl?: string;
      imageUrl?: string;
    };
  };
  approved: boolean;
  rate: number;
}

// Lightweight type for the admin products table
export interface ApiProduct {
  _id: string;
  nameEn: string;
  nameAr: string;
  slugEn?: string;
  slugAr?: string;
  approved: boolean;
  createdBy?: string;
  store?: string;
  media?: {
    featuredImages?: string;
    galleryImages?: string[];
  };
  pricing?: {
    originalPrice?: number;
    salePrice?: number;
  };
  classification?: {
    category?: string;
    subcategory?: string;
    brand?: string;
  };
  createdAt?: string;
  seller?: {
    _id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  } | string;
}

export async function createProduct(payload: CreateProductPayload, token?: string) {
  return apiClient({
    endpoint: "/products",
    method: "POST",
    body: payload as any,
    token,
  });
}

export async function getProducts(token?: string): Promise<ApiProduct[]> {
  try {
    const res = await apiClient({
      endpoint: "/products",
      method: "GET",
      token,
    });
    const data = (res as any)?.data || res;
    console.log("DEBUG getProducts raw response sample:", JSON.stringify(Array.isArray(data) ? data[0] : data, null, 2));
    if (Array.isArray(data)) return data;
    if (data?.products && Array.isArray(data.products)) return data.products;
    if (data?.data && Array.isArray(data.data)) return data.data;
    console.warn("Unexpected getProducts response shape:", res);
    return [];
  } catch (err) {
    console.error("getProducts failed:", err);
    return [];
  }
}

export async function getProductById(id: string, token?: string): Promise<ApiProduct | null> {
  try {
    const res = await apiClient({
      endpoint: `/products/${id}`,
      method: "GET",
      token,
    });
    const data = (res as any)?.data || res;
    return data as ApiProduct;
  } catch (err) {
    console.error("getProductById failed:", err);
    return null;
  }
}

export async function deleteProduct(id: string, token?: string) {
  return apiClient({
    endpoint: `/products/${id}`,
    method: "DELETE",
    token,
  });
}

export async function approveProduct(id: string, approved: boolean, token?: string) {
  return apiClient({
    endpoint: `/products/${id}/approve`,
    method: "PATCH",
    body: { approved },
    token,
  });
}

export async function updateProductApi(id: string, payload: Partial<CreateProductPayload>, token?: string) {
  return apiClient({
    endpoint: `/products/${id}`,
    method: "PUT",
    body: payload as any,
    token,
  });
}
