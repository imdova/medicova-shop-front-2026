import { apiClient } from "@/lib/apiClient";
import { ProductOption } from "@/types/product";

export type VariantOptionValue = {
  optionName: string;
  price: number;
  stock: number;
  color?: string;
  hex?: string; // Add alternate naming just in case
};

export type VariantData = {
  nameEn: string;
  nameAr: string;
  type: string;
  optionsEn: VariantOptionValue[];
  optionsAr: VariantOptionValue[];
  createdBy: "admin" | "seller";
  storeId?: string;
  store?: string;
};

const VARIANTS_CACHE_KEY = "medicova:variants:v1";

function sanitizeVariantData<T extends Partial<VariantData>>(data: T): T {
  const sanitized = { ...data };
  const strip = (opt: any) => {
    const { color, colorHex, hex, ...rest } = opt;
    return {
      ...rest,
      optionName: rest.optionName || color || colorHex || hex || "",
    };
  };

  if (sanitized.optionsEn) {
    sanitized.optionsEn = sanitized.optionsEn.map(strip);
  }
  if (sanitized.optionsAr) {
    sanitized.optionsAr = sanitized.optionsAr.map(strip);
  }
  return sanitized;
}

function mapVariant(item: any): ProductOption {
  // Map new schema (optionsEn/optionsAr) to unified structure
  let unifiedOptions = [];
  if (item.optionsEn && Array.isArray(item.optionsEn)) {
    unifiedOptions = item.optionsEn.map((enOpt: any, index: number) => {
      const arOpt = (item.optionsAr && item.optionsAr[index]) || {};
      return {
        id: enOpt._id || enOpt.id || `opt-${index}`,
        label: {
          en: enOpt.optionName || enOpt.color || enOpt.hex || "",
          ar: arOpt.optionName || arOpt.color || arOpt.hex || enOpt.optionName || "",
        },
        price: enOpt.price?.toString() || "0",
        stock: enOpt.stock || 0,
        color: enOpt.color || enOpt.hex || arOpt.color || arOpt.hex,
        price_type: "fixed",
      };
    });
  } else {
    // Fallback to old or mixed schema
    unifiedOptions = (item.option_values || item.values || []).map((val: any) => ({
      id: val._id || val.id,
      label: {
        en: val.label?.en || val.labelEn || val.label || val.optionName || val.color || "",
        ar: val.label?.ar || val.labelAr || val.label || val.optionName || val.color || "",
      },
      price: val.price?.toString() || "0",
      stock: val.stock || 0,
      color: val.color || val.hex || val.value,
      price_type: val.price_type || "fixed",
    }));
  }

  return {
    id: item._id || item.id,
    slug: item.slug || "",
    name: {
      en: item.nameEn || item.name?.en || item.name || "Untitled",
      ar: item.nameAr || item.name?.ar || item.name || "بدون عنوان",
    },
    option_type: item.type || item.option_type || "dropdown",
    isRequired: !!item.isRequired,
    createdAt: item.createdAt || new Date().toISOString(),
    option_values: unifiedOptions,
    createdBy: item.createdBy,
    storeId: item.store || item.storeId || null,
  };
}

function cacheVariants(variants: ProductOption[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(VARIANTS_CACHE_KEY, JSON.stringify(variants));
  } catch {
    // Ignore storage errors (private mode/quota exceeded).
  }
}

function readCachedVariants(): ProductOption[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(VARIANTS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProductOption[]) : [];
  } catch {
    return [];
  }
}

function variantIdentity(item: ProductOption, index: number): string {
  const idKey = String(item.id || "").trim();
  if (idKey) return `id:${idKey}`;
  const en = String(item.name?.en || "").trim().toLowerCase();
  const ar = String(item.name?.ar || "").trim().toLowerCase();
  return `name:${en}|${ar}|${index}`;
}

export async function getVariants(token?: string): Promise<ProductOption[]> {
  const parseVariants = (res: any): ProductOption[] => {
    let items = [];
    if (res.data) {
      if (Array.isArray(res.data)) items = res.data;
      else if (res.data.variants && Array.isArray(res.data.variants)) items = res.data.variants;
      else if (res.data.items && Array.isArray(res.data.items)) items = res.data.items;
    } else if (res.variants && Array.isArray(res.variants)) {
      items = res.variants;
    } else if (Array.isArray(res)) {
      items = res;
    }
    return items.map(mapVariant);
  };

  const normalizedToken = token?.trim();
  if (!normalizedToken) {
    return readCachedVariants();
  }

  const candidateEndpoints = [
    "/product-variants?createdBy=admin&storeId=null&limit=1000",
    "/product-variants?createdBy=admin&storeId=&limit=1000",
    "/product-variants?createdBy=admin&limit=1000",
    "/product-variants?storeId=null&limit=1000",
    "/product-variants?isGlobal=true&limit=1000",
    "/product-variants?createdBy=admin&storeId=null",
    "/product-variants?createdBy=admin",
    "/product-variants?scope=public",
    "/product-variants?limit=1000",
    "/product-variants",
  ];

  const merged = new Map<string, ProductOption>();

  for (const endpoint of candidateEndpoints) {
    try {
      const res = await apiClient<any>({
        endpoint,
        method: "GET",
        token: normalizedToken,
        suppressErrorLog: true,
      });
      const parsed = parseVariants(res);
      console.log(
        `DEBUG: Variants response from ${endpoint} | count=${parsed.length}`,
      );
      parsed.forEach((item, index) => {
        const key = variantIdentity(item, index);
        if (!merged.has(key)) merged.set(key, item);
      });
    } catch (error: any) {
      const msg = String(error?.message || "").toLowerCase();
      const isExpected =
        msg.includes("permission") ||
        msg.includes("forbidden") ||
        msg.includes("unauthorized") ||
        msg.includes("invalid refresh token");
      if (!isExpected) {
        console.error(
          `DEBUG: Error fetching variants from ${endpoint}:`,
          error?.message,
        );
      }
    }
  }

  const finalVariants = Array.from(merged.values());
  if (finalVariants.length) {
    cacheVariants(finalVariants);
    return finalVariants;
  }

  return readCachedVariants();
}
export async function getVariantById(id: string, token?: string): Promise<ProductOption | null> {
  const cached = readCachedVariants();
  const fromCache = cached.find((v) => v.id === id);
  if (fromCache) return fromCache;

  try {
    const response = await apiClient<any>({
      endpoint: `/product-variants/${id}`,
      method: "GET",
      token,
    });
    return mapVariant(response.data || response);
  } catch (error) {
    console.error(`Failed to fetch variant ${id}:`, error);
    return null;
  }
}


export async function createVariant(data: VariantData, token?: string): Promise<ProductOption> {
  console.log("DEBUG: Creating variant. Payload:", JSON.stringify(data, null, 2), "Token present:", !!token);
  
  const maxRetries = 5;
  let attempt = 0;
  let currentData = { ...data };

  while (attempt < maxRetries) {
    try {
      const sanitized = sanitizeVariantData(currentData);
      const response = await apiClient<any>({
        endpoint: "/product-variants",
        method: "POST",
        body: sanitized as any,
        token,
      });
      console.log("DEBUG: Create variant success:", JSON.stringify(response, null, 2));
      return mapVariant(response.data || response);
    } catch (error: any) {
      const msg = (error.message || "").toLowerCase();
      // If it's a duplicate name error, retry with a suffix
      if (msg.includes("duplicate") || msg.includes("already exist") || msg.includes("unique")) {
        attempt++;
        const suffix = attempt + 1;
        currentData = {
          ...data,
          nameEn: `${data.nameEn}-${suffix}`,
          nameAr: `${data.nameAr}-${suffix}`,
        };
        console.log(`DEBUG: Variant name conflict, retrying with: ${currentData.nameEn}`);
        continue;
      }
      console.error("DEBUG: Create variant failed:", error.message);
      throw error;
    }
  }
  throw new Error("Failed to create variant after multiple attempts due to name conflicts");
}

export async function updateVariant(id: string, data: Partial<VariantData>, token?: string): Promise<ProductOption> {
  const sanitized = sanitizeVariantData(data);

  console.log(`DEBUG: Updating variant ${id}. Payload:`, JSON.stringify(sanitized, null, 2), "Token present:", !!token);
  try {
    const response = await apiClient<any>({
      endpoint: `/product-variants/${id}`,
      method: "PUT",
      body: sanitized as any,
      token,
    });
    console.log("DEBUG: Update variant success:", JSON.stringify(response, null, 2));
    return mapVariant(response.data || response);
  } catch (error: any) {
    console.error("DEBUG: Update variant failed:", error.message);
    throw error;
  }
}

export async function deleteVariant(id: string, token?: string): Promise<void> {
  await apiClient<void>({
    endpoint: `/product-variants/${id}`,
    method: "DELETE",
    token,
  });
}
