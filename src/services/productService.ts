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
  variants?: string[];
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
  selectedOptions?: {
    options: Array<{
      variantId: string;
      values: string[];
    }>;
    distribution: Array<{
      [key: string]: string | number;
      stock: number;
    }>;
  };
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
  draft?: boolean;
  tags?: string[];
  seller?: {
    _id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
  } | string;
  sellers?: any; // sometimes plural in dummy data
}

export async function createProduct(payload: CreateProductPayload, token?: string, suppressErrorLog?: boolean) {
  return apiClient({
    endpoint: "/products",
    method: "POST",
    body: payload as any,
    token,
    suppressErrorLog,
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
      suppressAutoLogout: true,
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
      suppressAutoLogout: true,
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

/**
 * Maps ApiProduct from the backend to the Product type used in the UI components.
 */
export function mapApiProductToProduct(item: any): any {
  const enName = item.nameEn || item.title?.en || "Untitled";
  const arName = item.nameAr || item.title?.ar || enName || "بدون عنوان";

  // Handle images based on the provided schema (root level featuredImages/galleryImages)
  const apiBaseUrl = "https://shop-api.medicova.net";
  const ensureAbsoluteUrl = (url: any) => {
    if (!url || typeof url !== "string") return "/images/placeholder.jpg";
    if (url.startsWith("http")) return url;
    return `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // The schema shows featuredImages as a string at the root, and galleryImages as an array at the root.
  // We also check item.media for backward compatibility if some products still use it.
  const featuredImageRaw = item.featuredImages || item.media?.featuredImages || (Array.isArray(item.galleryImages) ? item.galleryImages[0] : (Array.isArray(item.media?.galleryImages) ? item.media.galleryImages[0] : null));
  const featuredImage = ensureAbsoluteUrl(featuredImageRaw);

  const galleryImagesRaw = Array.isArray(item.galleryImages) ? item.galleryImages : (Array.isArray(item.media?.galleryImages) ? item.media.galleryImages : []);
  const galleryImages = galleryImagesRaw.length > 0 
    ? galleryImagesRaw.map((img: any) => ensureAbsoluteUrl(img)) 
    : [featuredImage];

  // Price mapping based on schema: originalPrice and salePrice at root
  const price = item.salePrice || item.price || item.pricing?.salePrice || item.pricing?.originalPrice || item.sale_price || 0;
  const delPrice = item.originalPrice || item.del_price || item.original_price || (item.pricing?.salePrice ? item.pricing?.originalPrice : undefined);
  
  // Calculate sale percentage if not provided
  let saleText = item.sale;
  if (!saleText && price > 0 && delPrice && delPrice > price) {
    const discount = Math.round(((delPrice - price) / delPrice) * 100);
    saleText = `${discount}% OFF`;
  }

  return {
    id: item._id || item.id,
    sku: item.sku || item.identity?.sku,
    title: {
      en: enName,
      ar: arName,
    },
    slug: {
      en: item.slugEn || item.slug || item._id || item.id,
      ar: item.slugAr || item.slug || item._id || item.id,
    },
    price: price,
    del_price: delPrice,
    sale: saleText,
    images: galleryImages,
    rating: item.rate || 0,
    reviewCount: item.reviewCount || 0,
    isBestSaller: !!item.isBestSaller || (item.rate >= 4.5),
    stock: (() => {
      const rawStock = item.stockQuantity ?? 
                      (typeof item.stock === 'number' ? item.stock : item.stock?.remaining) ?? 
                      item.inventory?.stockQuantity ?? 
                      0;
      const stockStatus = item.inventory?.stockStatus || item.stockStatus;
      
      const n = Number(rawStock);
      if (!isNaN(n) && n > 0) return n;
      
      // Fallback if numeric stock is 0 or missing but status is "in_stock"
      if (stockStatus === "in_stock") return 99;
      
      return isNaN(n) ? 0 : n;
    })(),
    brand: (typeof item.brand === "object" && item.brand !== null) ? {
      id: item.brand._id || item.brand.id,
      name: { en: item.brand.nameEn || item.brand.name || "Brand", ar: item.brand.nameAr || item.brand.name || "براند" },
      image: ensureAbsoluteUrl(item.brand.image || item.brand.logo)
    } : { id: item.brand || "unknown", name: { en: "Brand", ar: "براند" }, image: "/images/placeholder.jpg" },
    category: (typeof item.category === "object" && item.category !== null) ? {
      id: item.category._id || item.category.id,
      slug: item.category.slug || item.category.slugEn || item.category.url?.split("/").pop() || (item.category.name?.toLowerCase().replace(/\s+/g, '-')),
      title: { en: item.category.name || item.category.title?.en || "Category", ar: item.category.nameAr || item.category.title?.ar || "قسم" }
    } : { id: item.category || "unknown", slug: item.category?.toLowerCase() || "category", title: { en: "Category", ar: "قسم" } },
    subcategory: item.subcategory || item.category?.subcategory ? {
      slug: (() => {
        const raw = item.subcategory?.slug || item.subcategory?.slugEn || item.category?.subcategory?.url?.split("/").pop();
        if (typeof raw === "string") return raw;
        if (typeof item.subcategory === "string") return item.subcategory;
        if (typeof item.subcategory === "object" && item.subcategory !== null) {
          return item.subcategory._id || item.subcategory.id || "subcategory";
        }
        return "subcategory";
      })(),
      title: { 
        en: item.subcategory?.name || item.subcategory?.title?.en || item.category?.subcategory?.title?.en || "Subcategory", 
        ar: item.subcategory?.nameAr || item.subcategory?.title?.ar || item.category?.subcategory?.title?.ar || "قسم فرعي" 
      }
    } : undefined,
    description: {
      en: item.descriptions?.descriptionEn || item.descriptionEn || item.description?.en || item.description || "",
      ar: item.descriptions?.descriptionAr || item.descriptionAr || item.description?.ar || item.descriptionAr || "",
    },
    nudges: item.nudges || { en: [], ar: [] },
    features: item.features || { en: [], ar: [] },
    highlights: {
      en: item.highlightsEn || item.highlights?.en || [],
      ar: item.highlightsAr || item.highlights?.ar || [],
    },
    overview_desc: {
      en: item.descriptions?.descriptionEn || item.descriptionEn || item.description?.en || item.description || "",
      ar: item.descriptions?.descriptionAr || item.descriptionAr || item.description?.ar || item.descriptionAr || "",
    },
    specifications: (item.specifications || []).map((spec: any) => ({
      label: { en: spec.keyEn || "Label", ar: spec.keyAr || "العنوان" },
      content: { en: spec.valueEn || "-", ar: spec.valueAr || "-" }
    })),
    weightKg: item.weightKg || 0,
    shipping_fee: item.shipping_fee || 0,
    shippingMethod: item.shippingMethod || { en: "standard", ar: "قياسي" },
    sellers: item.sellers || {
      id: typeof item.sellerId === "object" ? item.sellerId?._id : (item.sellerId || "unknown"),
      name: typeof item.sellerId === "object" ? (item.sellerId?.brandName || `${item.sellerId?.firstName} ${item.sellerId?.lastName}`) : "Medicova Seller",
      rating: 5,
      isActive: true,
      returnPolicy: { en: "Standard Policy", ar: "سياسة قياسية" },
      status: { en: "Active", ar: "نشط" }
    },
    tags: item.tags || item.classification?.tags || [],
    shippingCostInsideCairo: item.shippingCostInsideCairo,
    shippingCostRegion1: item.shippingCostRegion1,
    shippingCostRegion2: item.shippingCostRegion2,
  };
}
