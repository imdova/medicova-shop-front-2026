import { apiClient } from "@/lib/apiClient";
import { ProductCollection, Product } from "@/types/product";
import { mapApiProductToProduct } from "./productService";

export interface ApiProductCollection {
  _id: string;
  sellerId: string;
  nameAr: string;
  nameEn: string;
  link?: string;
  descriptionAr: string;
  descriptionEn: string;
  products: string[] | any[];
  descriptiveData?: string;
  status: boolean | string;
  images: string[];
  isFeatures: boolean;
  createdAt?: string;
  updatedAt?: string;
  slug?: string;
  orders?: number;
  totalOrders?: number;
  revenue?: number;
  totalRevenue?: number;
}

export interface CreateProductCollectionPayload {
  sellerId?: string | null;
  nameAr: string;
  nameEn: string;
  link?: string;
  descriptionAr: string;
  descriptionEn: string;
  products: string[];
  descriptiveData?: string | null;
  status: boolean;
  images: string[];
  isFeatures: boolean;
}

/**
 * Map API response to the frontend ProductCollection model
 */
function mapToProductCollection(apiCol: ApiProductCollection): ProductCollection {
  return {
    id: apiCol._id,
    image: apiCol.images?.[0] || "",
    name: {
      en: apiCol.nameEn,
      ar: apiCol.nameAr,
    },
    slug: apiCol.slug || apiCol._id,
    createdAt: apiCol.createdAt || new Date().toISOString(),
    status: apiCol.status === true || apiCol.status === "published" ? "published" : "draft",
    description: {
      en: apiCol.descriptionEn,
      ar: apiCol.descriptionAr,
    },
    isFeatures: apiCol.isFeatures,
    is_featured: apiCol.isFeatures,
    nameEn: apiCol.nameEn,
    nameAr: apiCol.nameAr,
    descriptionEn: apiCol.descriptionEn,
    descriptionAr: apiCol.descriptionAr,
    products: Array.isArray(apiCol.products) 
      ? apiCol.products.map(p => {
          if (typeof p === 'string') return { id: p } as Product;
          return mapApiProductToProduct(p);
        })
      : [],
    sellerId: apiCol.sellerId,
    descriptiveData: apiCol.descriptiveData,
    orders: apiCol.totalOrders ?? apiCol.orders ?? 0,
    revenue: apiCol.totalRevenue ?? apiCol.revenue ?? 0,
    link: apiCol.link || apiCol.slug || "",
    short_description: {
      en: apiCol.nameEn, // Fallback to name if short_description is missing in API
      ar: apiCol.nameAr,
    },
  };
}

export async function getProductCollections(token?: string): Promise<ProductCollection[]> {
  try {
    const res = await apiClient({
      endpoint: "/product-collections",
      method: "GET",
      token,
    });
    
    const data = (res as any)?.data || res;
    
    // Handle different response shapes:
    // 1. Array directly: [...]
    // 2. Wrapped in data: { data: [...] }
    // 3. Wrapped in collections: { collections: [...] }
    // 4. Wrapped in data object with collections: { data: { collections: [...] } }
    
    if (Array.isArray(data)) {
      return data.map(mapToProductCollection);
    }
    
    const items = data?.collections || data?.data || [];
    if (Array.isArray(items)) {
      return items.map(mapToProductCollection);
    }

    return [];
  } catch (error) {
    console.error("Failed to fetch product collections:", error);
    return [];
  }
}

export async function getProductCollectionById(id: string, token?: string): Promise<ProductCollection | null> {
  try {
    const res = await apiClient({
      endpoint: `/product-collections/${id}`,
      method: "GET",
      token,
    });
    
    const data = (res as any)?.data || res;
    const item = data?.collection || data;
    return mapToProductCollection(item);
  } catch (error) {
    console.error(`Failed to fetch product collection ${id}:`, error);
    return null;
  }
}

export async function createProductCollection(payload: CreateProductCollectionPayload, token?: string) {
  return apiClient({
    endpoint: "/product-collections",
    method: "POST",
    body: payload as any,
    token,
  });
}

export async function updateProductCollection(id: string, payload: Partial<CreateProductCollectionPayload>, token?: string) {
  return apiClient({
    endpoint: `/product-collections/${id}`,
    method: "PUT",
    body: payload as any,
    token,
  });
}

export async function deleteProductCollection(id: string, token?: string) {
  return apiClient({
    endpoint: `/product-collections/${id}`,
    method: "DELETE",
    token,
  });
}
