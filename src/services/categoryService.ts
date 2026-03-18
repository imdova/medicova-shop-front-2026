import { apiClient } from "@/lib/apiClient";
import { CategoryType, MultiCategory } from "@/types";


export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") 
    .replace(/[^\w\u0600-\u06FF-]+/g, "") 
    .replace(/--+/g, "-"); 
}


export function mapCategory(item: any): MultiCategory {
  const enName = item.name || "Untitled";
  const arName = item.nameAr || item.name || "بدون عنوان";
  
  const generatedSlug = slugify(enName);
  const generatedSlugAr = slugify(arName);

  const slug = item.slug || (generatedSlug !== "" ? generatedSlug : item._id);
  const slugAr = item.slugAr || item.slug || (generatedSlugAr !== "" ? generatedSlugAr : (generatedSlug !== "" ? generatedSlug : item._id));

  const rawSubCategories = item.subCategories || item.subcategoryChildren || [];

  return {
    id: item._id,
    slug: slug,
    slugAr: slugAr,
    title: { 
      en: enName, 
      ar: arName 
    },
    image: item.image || "/images/placeholder.jpg",
    cover: item.cover || item.image || "/images/placeholder.jpg",
    isSale: !!item.isSale,
    banner: item.banner ? {
      image: item.banner.image || "/images/placeholder.jpg",
      url: item.banner.url || "#",
    } : undefined,
    subCategories: rawSubCategories.map((sub: any) => mapCategory(sub)), 
    headline: {
      en: item.headline || item.headlineEn || "",
      ar: item.headlineAr || item.headline || item.headlineAr || "" 
    }
  };
}

export async function getCategories(token?: string): Promise<MultiCategory[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/category",
      method: "GET",
      token,
    });

    const items = res.data?.categories || [];
    return items.map(mapCategory);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}


export async function getSubCategoryChildren(parentSubCategoryId: string, token?: string): Promise<MultiCategory[]> {
  try {
    const res = await apiClient<any>({
      endpoint: `/subcategory-child?subCategory=${parentSubCategoryId}`,
      method: "GET",
      token,
    });

    const items = res.data?.subcategoryChildren || [];
    return items.map(mapCategory);
  } catch (error) {
    console.error(`Error fetching children for sub-category ${parentSubCategoryId}:`, error);
    return [];
  }
}

export async function getSubCategories(categoryId?: string, token?: string): Promise<MultiCategory[]> {
  try {
    const res = await apiClient<any>({
      endpoint: categoryId ? `/subcategory?category=${categoryId}` : "/subcategory",
      method: "GET",
      token,
    });

    const items = res.data?.subCategories || [];
    return items.map(mapCategory);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return [];
  }
}

export async function getAllSubCategoryChildren(token?: string): Promise<MultiCategory[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/subcategory-child",
      method: "GET",
      token,
    });

    const items = res.data?.subcategoryChildren || [];
    return items.map(mapCategory);
  } catch (error) {
    console.error("Error fetching all sub-category children:", error);
    return [];
  }
}

