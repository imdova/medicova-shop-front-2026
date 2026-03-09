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
  store?: string;
};

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

export async function getVariants(token?: string): Promise<ProductOption[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/product-variants",
      method: "GET",
      token,
    });

    console.log("DEBUG: Raw Variants API Response:", JSON.stringify(res, null, 2));

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
  } catch (error: any) {
    console.error("DEBUG: Error fetching variants:", error.message);
    return [];
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
