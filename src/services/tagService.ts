import { apiClient } from "@/lib/apiClient";
import { ProductTag } from "@/types/product";
import { LocalizedTitle } from "@/types/language";

export type TagData = {
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  categoryId: string;
  descriptionEn?: string;
  descriptionAr?: string;
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescriptionEn?: string;
  metaDescriptionAr?: string;
  noindex?: boolean;
};

const TAGS_CACHE_KEY = "medicova:tags:v1";

function mapTag(item: any): ProductTag {
  // Handle categoryId which could be a string or an object
  let catId = "";
  if (typeof item.categoryId === "string") {
    catId = item.categoryId;
  } else if (item.categoryId && typeof item.categoryId === "object") {
    catId = item.categoryId._id || item.categoryId.id || "";
  } else if (typeof item.category === "string") {
    catId = item.category;
  } else if (item.category && typeof item.category === "object") {
    catId = item.category._id || item.category.id || "";
  }

  return {
    id: item._id || item.id,
    name: {
      en: item.nameEn || item.name?.en || item.name || "Untitled",
      ar: item.nameAr || item.name?.ar || item.name || "بدون عنوان",
    },
    slug: item.slugEn || item.slug || "",
    slugAr: item.slugAr || "",
    categoryId: catId,
    createdAt: item.createdAt || new Date().toISOString(),
    status: {
      en: item.status?.en || item.status || "published",
      ar: item.status?.ar || item.status || "منشور",
    },
    description: {
      en: item.descriptionEn || item.description?.en || item.description || "",
      ar: item.descriptionAr || item.description?.ar || item.description || "",
    },
    meta_title: {
      en: item.metaTitleEn || item.meta_title?.en || item.metaTitle || "",
      ar: item.metaTitleAr || item.meta_title?.ar || item.metaTitle || "",
    },
    meta_description: {
      en: item.metaDescriptionEn || item.meta_description?.en || item.metaDescription || "",
      ar: item.metaDescriptionAr || item.meta_description?.ar || item.metaDescription || "",
    },
    noindex: item.noindex ? "true" : "false",
  };
}

function cacheTags(tags: ProductTag[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(TAGS_CACHE_KEY, JSON.stringify(tags));
  } catch {
    // Ignore storage errors.
  }
}

function readCachedTags(): ProductTag[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(TAGS_CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProductTag[]) : [];
  } catch {
    return [];
  }
}

function tagIdentity(item: ProductTag, index: number): string {
  const id = String(item.id || "").trim();
  if (id) return `id:${id}`;

  const slug = String(item.slug || "").trim().toLowerCase();
  if (slug) return `slug:${slug}`;

  const en = String(item.name?.en || "").trim().toLowerCase();
  const ar = String(item.name?.ar || "").trim().toLowerCase();
  return `name:${en}|${ar}|${index}`;
}

export async function getTags(token?: string): Promise<ProductTag[]> {
  const parseTags = (res: any): ProductTag[] => {
    let items = [];
    if (res.data) {
      if (Array.isArray(res.data)) items = res.data;
      else if (res.data.tags && Array.isArray(res.data.tags)) items = res.data.tags;
      else if (res.data.items && Array.isArray(res.data.items)) items = res.data.items;
    } else if (res.tags && Array.isArray(res.tags)) {
      items = res.tags;
    } else if (Array.isArray(res)) {
      items = res;
    }
    return items.map(mapTag);
  };

  const fetchWithToken = async (endpoint: string, authToken?: string) =>
    apiClient<any>({
      endpoint,
      method: "GET",
      token: authToken,
      suppressErrorLog: true,
    });

  const normalizedToken = token?.trim();
  const candidateEndpoints = ["/tags?limit=1000", "/tags"];
  const merged = new Map<string, ProductTag>();

  const runFetchCycle = async (authToken?: string) => {
    for (const endpoint of candidateEndpoints) {
      try {
        const res = await fetchWithToken(endpoint, authToken);
        const parsed = parseTags(res);
        parsed.forEach((item, index) => {
          const key = tagIdentity(item, index);
          if (!merged.has(key)) merged.set(key, item);
        });
      } catch (error) {
        const msg =
          typeof (error as any)?.message === "string"
            ? (error as any).message
            : "";
        const lowered = msg.toLowerCase();
        const isExpectedPermissionError =
          lowered.includes("unauthorized") ||
          lowered.includes("invalid refresh token") ||
          lowered.includes("permission") ||
          lowered.includes("forbidden");

        if (!isExpectedPermissionError) {
          console.error(`Error fetching tags from ${endpoint}:`, error);
        }
      }
    }
  };

  await runFetchCycle(normalizedToken || undefined);
  if (!merged.size && normalizedToken) {
    await runFetchCycle(undefined);
  }

  const finalTags = Array.from(merged.values());
  if (finalTags.length) {
    cacheTags(finalTags);
    return finalTags;
  }

  return readCachedTags();
}

export async function createTag(data: TagData, token?: string): Promise<ProductTag> {
  const res = await apiClient<any>({
    endpoint: "/tags",
    method: "POST",
    body: data as any,
    token,
  });
  return mapTag(res.data || res);
}

export async function updateTag(id: string, data: Partial<TagData>, token?: string): Promise<ProductTag> {
  const res = await apiClient<any>({
    endpoint: `/tags/${id}`,
    method: "PATCH",
    body: data as any,
    token,
  });
  return mapTag(res.data || res);
}

export async function deleteTag(id: string, token?: string): Promise<void> {
  await apiClient<void>({
    endpoint: `/tags/${id}`,
    method: "DELETE",
    token,
  });
}
