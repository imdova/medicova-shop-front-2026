import { apiClient } from "@/lib/apiClient";
import { ProductOption } from "@/types/product";

export type VariantOptionValue = {
  optionName: string;
  price: number;
};

export type VariantData = {
  nameEn: string;
  nameAr: string;
  type: string;
  optionsEn: VariantOptionValue[];
  optionsAr: VariantOptionValue[];
};

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
      if (Array.isArray(res.data)) {
        items = res.data;
      } else if (res.data.variants && Array.isArray(res.data.variants)) {
        items = res.data.variants;
      } else if (res.data.items && Array.isArray(res.data.items)) {
        items = res.data.items;
      }
    } else if (res.variants && Array.isArray(res.variants)) {
      items = res.variants;
    } else if (Array.isArray(res)) {
      items = res;
    }

    return items.map((item: any) => {
      // Map new schema (optionsEn/optionsAr) to unified structure
      let unifiedOptions = [];
      if (item.optionsEn && item.optionsAr) {
        unifiedOptions = item.optionsEn.map((enOpt: any, index: number) => {
          const arOpt = item.optionsAr[index] || {};
          return {
            id: enOpt._id || enOpt.id || `opt-${index}`,
            label: {
              en: enOpt.optionName || "",
              ar: arOpt.optionName || "",
            },
            price: enOpt.price?.toString() || "0",
            price_type: "fixed",
          };
        });
      } else {
        // Fallback to old or mixed schema
        unifiedOptions = (item.option_values || item.values || []).map((val: any) => ({
          id: val._id || val.id,
          label: {
            en: val.label?.en || val.labelEn || val.label || val.optionName || "",
            ar: val.label?.ar || val.labelAr || val.label || val.optionName || "",
          },
          price: val.price?.toString() || "0",
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
      };
    });
  } catch (error: any) {
    console.error("DEBUG: Error fetching variants:", error.message);
    return [];
  }
}

export async function createVariant(data: VariantData, token?: string): Promise<ProductOption> {
  console.log("DEBUG: Creating variant. Payload:", JSON.stringify(data, null, 2), "Token present:", !!token);
  try {
    const response = await apiClient<ProductOption>({
      endpoint: "/product-variants",
      method: "POST",
      body: data as any,
      token,
    });
    console.log("DEBUG: Create variant success:", JSON.stringify(response, null, 2));
    return response;
  } catch (error: any) {
    console.error("DEBUG: Create variant failed:", error.message);
    throw error;
  }
}

export async function updateVariant(id: string, data: Partial<VariantData>, token?: string): Promise<ProductOption> {
  console.log(`DEBUG: Updating variant ${id}. Payload:`, JSON.stringify(data, null, 2), "Token present:", !!token);
  try {
    const response = await apiClient<ProductOption>({
      endpoint: `/product-variants/${id}`,
      method: "PUT",
      body: data as any,
      token,
    });
    console.log("DEBUG: Update variant success:", JSON.stringify(response, null, 2));
    return response;
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
