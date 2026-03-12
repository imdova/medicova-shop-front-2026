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
    stock?: {
      total: number;
      remaining: number;
    };
    variantsStock?: Array<{
      name: string;
      total: number;
      remaining: number;
    }>;
  };
  variants: string[];
  specifications: Array<{
    keyEn?: string;
    keyAr?: string;
    valueEn?: string;
    valueAr?: string;
  }>;
  shippingCostInsideCairo?: number;
  shippingCostRegion1?: number;
  shippingCostRegion2?: number;
  isPhysicalProduct?: boolean;
  packages?: Array<{
    name: string;
    weightKg?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
  }>;
  shipping?: {
    isPhysicalProduct: boolean;
    shippingCostInsideCairo: number;
    shippingCostRegion1: number;
    shippingCostRegion2: number;
    packages: Array<{
      name: string;
      weightKg?: number;
      lengthCm?: number;
      widthCm?: number;
      heightCm?: number;
    }>;
  };
  store: string;
  sellerId?: string | null;
  createdBy: "seller" | "admin";
  media: {
    featuredImages?: string;
    galleryImages: string[];
    productVideo?: {
      vedioUrl?: string;
      imageUrl?: string;
    };
  };
  tags?: string[];
  approved: boolean;
  rate: number;
  draft?: boolean;
}

export interface ApiProduct {
  _id: string;
  nameEn: string;
  nameAr: string;
  slugEn?: string;
  slugAr?: string;
  approved: boolean;
  createdBy?: string;
  store?: string;
  sku?: string;
  media?: {
    featuredImages?: string;
    galleryImages?: string[];
  };
  // root level fields often found in list responses
  category?: string | any;
  subcategory?: string | any;
  childCategory?: string | any;
  brand?: string | any;
  price?: number;
  sale_price?: number;
  salePrice?: number;
  original_price?: number;
  originalPrice?: number;
  del_price?: number;
  stock?: number;
  // nested fields used in creation/details
  pricing?: {
    originalPrice?: number;
    salePrice?: number;
    sale_price?: number;
    original_price?: number;
  };
  classification?: {
    category?: string;
    subcategory?: string;
    childCategory?: string;
    brand?: string;
  };
  identity?: {
    sku?: string;
    skuMode?: string;
  };
  inventory?: {
    trackStock?: boolean;
    stockQuantity?: number;
    stockStatus?: string;
  };
  stockQuantity?: number;
  shipping_fee?: number;
  shippingMethod?: any;
  orders?: number;
  totalOrders?: number;
  total_orders?: number;
  revenue?: number;
  total_revenue?: number;
  totalRevenue?: number;
  createdAt?: string;
  sellerId?: string | null;
  seller?: {
    _id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  } | string;
  sellers?: any; // sometimes plural in dummy data
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
  const parseProducts = (res: any): ApiProduct[] => {
    const data = (res as any)?.data || res;
    console.log(
      "DEBUG getProducts raw response sample:",
      JSON.stringify(Array.isArray(data) ? data[0] : data, null, 2),
    );
    if (Array.isArray(data)) return data;
    if (data?.products && Array.isArray(data.products)) return data.products;
    if (data?.data && Array.isArray(data.data)) return data.data;
    console.warn("Unexpected getProducts response shape:", res);
    return [];
  };

  const fetchProducts = (authToken?: string) =>
    apiClient({
      endpoint: "/products?limit=1000",
      method: "GET",
      token: authToken,
      suppressErrorLog: true,
    });

  try {
    const res = await fetchProducts(token?.trim() || undefined);
    return parseProducts(res);
  } catch (err) {
    const msg = String((err as any)?.message || "").toLowerCase();
    const isPermissionError =
      msg.includes("permission") ||
      msg.includes("forbidden") ||
      msg.includes("unauthorized");

    if (token?.trim() && isPermissionError) {
      try {
        const fallback = await fetchProducts(undefined);
        return parseProducts(fallback);
      } catch (fallbackErr) {
        console.error("getProducts fallback failed:", fallbackErr);
        return [];
      }
    }

    console.error("getProducts failed:", err);
    return [];
  }
}

export async function getProductById(id: string, token?: string): Promise<ApiProduct | null> {
  const fetchById = (authToken?: string) =>
    apiClient({
      endpoint: `/products/${id}`,
      method: "GET",
      token: authToken,
      suppressErrorLog: true,
    });

  try {
    const res = await fetchById(token?.trim() || undefined);
    const data = (res as any)?.data || res;
    return data as ApiProduct;
  } catch (err) {
    const msg = String((err as any)?.message || "").toLowerCase();
    const isPermissionError =
      msg.includes("permission") ||
      msg.includes("forbidden") ||
      msg.includes("unauthorized");

    if (token?.trim() && isPermissionError) {
      try {
        const fallback = await fetchById(undefined);
        const data = (fallback as any)?.data || fallback;
        return data as ApiProduct;
      } catch (fallbackErr) {
        console.error("getProductById fallback failed:", fallbackErr);
        return null;
      }
    }

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
