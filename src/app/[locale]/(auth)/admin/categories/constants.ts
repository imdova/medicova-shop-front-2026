import { LocalizedTitle } from "@/types/language";
import { apiClient } from "@/lib/apiClient";

export type Category = {
  id: string;
  image: string;
  name: LocalizedTitle;
  slug: string;
  slugAr: string;
  description: string;
  date: string;
  products: number;
  orders: number;
  totalSales: LocalizedTitle;
  status: "active" | "inactive";
  isActive: boolean;
  headline?: LocalizedTitle;
  sortOrder: number;
};

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiClient<any>({
    endpoint: "/category",
    method: "GET",
  });

  const items = res.data.categories;
  return items.map((item: any) => ({
    id: item._id,
    image: item.image || "/images/placeholder.jpg",
    name: { en: item.name, ar: item.nameAr || item.name },
    slug: item.slug || "",
    slugAr: item.slugAr || "",
    description: item.description || "",
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
    products: item.products || 0,
    orders: item.totalOrders || 0,
    totalSales: {
      en: `${item.totalSales || 0} EGP`,
      ar: `${item.totalSales || 0} ج.م`,
    },
    status: item.status ? "active" : "inactive",
    isActive: !!item.status,
    headline: { en: item.headlineEn || item.headline || "", ar: item.headlineAr || item.headline || "" },
    sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : 999,
  })).sort((a: Category, b: Category) => a.sortOrder - b.sortOrder) as Category[];
}

export async function createCategory(body: Record<string, unknown>, token?: string) {
  return apiClient({ endpoint: "/category", method: "POST", body, token });
}

export async function fetchCategoryById(id: string, token?: string) {
  const res = await apiClient<any>({ endpoint: `/category/${id}`, method: "GET", token });
  return res.data;
}

export async function updateCategory(id: string, body: Record<string, unknown>, token?: string) {
  return apiClient({ endpoint: `/category/${id}`, method: "PUT", body, token });
}

export async function toggleCategoryStatus(id: string, active: boolean, token?: string) {
  return apiClient({ endpoint: `/category/${id}/status`, method: "PATCH", body: { active }, token });
}

export async function deleteCategory(id: string, token?: string) {
  return apiClient({ endpoint: `/category/${id}`, method: "DELETE", token });
}

export async function updateCategorySortOrder(id: string, sortOrder: number, token?: string) {
  return apiClient({ endpoint: `/category/${id}`, method: "PUT", body: { sortOrder }, token });
}

export type SubCategory = {
  id: string;
  image: string;
  name: LocalizedTitle;
  slug: string;
  slugAr: string;
  parentCategory: LocalizedTitle;
  categoryId: string;
  date: string;
  products: number;
  orders: number;
  totalSales: LocalizedTitle;
  status: "active" | "inactive";
  isActive: boolean;
  headline?: LocalizedTitle;
  sortOrder: number;
};

export async function fetchSubCategories(): Promise<SubCategory[]> {
  const res = await apiClient<any>({
    endpoint: "/subcategory",
    method: "GET",
  });
  const items = res.data.subCategories;
  return items.map((item: any) => {
    const parent = item.parentCategory || item.category;
    return {
      id: item._id,
      image: item.image || "/images/placeholder.jpg",
      name: { en: item.name, ar: item.nameAr || item.name },
      slug: item.slug || "",
      slugAr: item.slugAr || "",
      parentCategory: {
        en: parent?.name || "N/A",
        ar: parent?.nameAr || parent?.name || "N/A",
      },
      categoryId: parent?._id || "",
      date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
      products: item.products || 0,
      orders: item.totalOrders || 0,
      totalSales: {
        en: `${item.totalSales || 0} EGP`,
        ar: `${item.totalSales || 0} ج.م`,
      },
      status: (item.active || item.status) ? "active" : "inactive",
      isActive: !!(item.active || item.status),
      headline: { en: item.headlineEn || item.headline || "", ar: item.headlineAr || item.headline || "" },
      sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : 999,
    };
  }).sort((a: SubCategory, b: SubCategory) => a.sortOrder - b.sortOrder) as SubCategory[];
}

export async function createSubCategory(body: Record<string, unknown>, token?: string) {
  return apiClient({ endpoint: "/subcategory", method: "POST", body, token });
}

export async function fetchSubCategoryById(id: string, token?: string) {
  const res = await apiClient<any>({ endpoint: `/subcategory/${id}`, method: "GET", token });
  return res.data;
}

export async function updateSubCategory(id: string, body: Record<string, unknown>, token?: string) {
  return apiClient({ endpoint: `/subcategory/${id}`, method: "PUT", body, token });
}

export async function toggleSubCategoryStatus(id: string, active: boolean, token?: string) {
  return apiClient({ endpoint: `/subcategory/${id}/status`, method: "PATCH", body: { active }, token });
}

export async function deleteSubCategory(id: string, token?: string) {
  return apiClient({ endpoint: `/subcategory/${id}`, method: "DELETE", token });
}

export async function updateSubCategorySortOrder(id: string, sortOrder: number, token?: string) {
  // We must fetch the full subcategory first because the PUT endpoint requires mandatory fields like name, slug, etc.
  const sub = await fetchSubCategoryById(id, token);
  if (!sub) throw new Error("Subcategory not found");

  const { _id, createdAt, updatedAt, __v, ...rest } = sub;

  const body = {
    ...rest,
    sortOrder,
    // Ensure parentCategory is sent as an ID if it's currently an object
    parentCategory: typeof sub.parentCategory === "object" ? sub.parentCategory._id : sub.parentCategory,
  };

  return apiClient({ endpoint: `/subcategory/${id}`, method: "PUT", body, token });
}

export type Brand = {
  id: string;
  logo: string;
  name: LocalizedTitle;
  date: string;
  products: number;
  orders: number;
  totalSales: LocalizedTitle;
  status: "active" | "inactive";
  isActive: boolean;
};

export async function fetchBrands(): Promise<Brand[]> {
  const res = await apiClient<any>({
    endpoint: "/brands",
    method: "GET",
  });
  const items = res.data.brands;
  return items.map((item: any) => ({
    id: item._id,
    logo: item.logo || item.image || "/images/placeholder.jpg",
    name: { en: item.name, ar: item.nameAr || item.name },
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
    products: item.products || 0,
    orders: item.totalOrders || 0,
    totalSales: {
      en: `${item.totalSales || 0} EGP`,
      ar: `${item.totalSales || 0} ج.م`,
    },
    status: item.status ? "active" : "inactive",
    isActive: !!item.status,
  })) as Brand[];
}

export async function createBrand(body: Record<string, unknown>, token?: string) {
  return apiClient({ endpoint: "/brands", method: "POST", body, token });
}

export async function fetchBrandById(id: string, token?: string) {
  const res = await apiClient<any>({ endpoint: `/brands/${id}`, method: "GET", token });
  return res.data;
}

export async function updateBrand(id: string, body: Record<string, unknown>, token?: string) {
  return apiClient({ endpoint: `/brands/${id}`, method: "PUT", body, token });
}

export async function toggleBrandStatus(id: string, active: boolean, token?: string) {
  return apiClient({ endpoint: `/brands/${id}/status`, method: "PATCH", body: { active }, token });
}

export async function deleteBrand(id: string, token?: string) {
  return apiClient({ endpoint: `/brands/${id}`, method: "DELETE", token });
}

/* ─── SubCategoryChild ─── */

export type SubCategoryChild = {
  id: string;
  image: string;
  icon: string;
  name: LocalizedTitle;
  slug: string;
  slugAr: string;
  parentSubCategory: LocalizedTitle;
  parentSubCategoryId: string;
  description: string;
  headline: LocalizedTitle;
  active: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  faqs: { question: string; answer: string }[];
  products: number;
  orders: number;
  totalSales: LocalizedTitle;
  status: "active" | "inactive";
  isActive: boolean;
};

export async function fetchSubCategoryChildren(): Promise<SubCategoryChild[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/subcategory-child",
      method: "GET",
    });

    const items = res.data?.subcategoryChildren || [];

    return items.map((item: any) => {
      const parent = item.parentSubCategory || item.subCategory;
      return {
        id: item._id,
        image: item.image || "/images/placeholder.jpg",
        icon: item.icon || "",
        name: { en: item.name || "Untitled", ar: item.nameAr || item.name || "بدون عنوان" },
        slug: item.slug || "",
        slugAr: item.slugAr || "",
        parentSubCategory: {
          en: parent?.name || "N/A",
          ar: parent?.nameAr || parent?.name || "N/A",
        },
        parentSubCategoryId: parent?._id || "",
        description: item.description || "",
        headline: { en: item.headlineEn || item.headline || "", ar: item.headlineAr || item.headline || "" },
        active: !!(item.active || item.status),
        products: item.products || 0,
        orders: item.totalOrders || item.orders || 0,
        totalSales: {
          en: `${item.totalSales || 0} EGP`,
          ar: `${item.totalSales || 0} ج.م`,
        },
        status: (item.active || item.status) ? "active" : "inactive",
        isActive: !!(item.active || item.status),
      };
    }) as SubCategoryChild[];
  } catch (error) {
    console.error("Error in fetchSubCategoryChildren:", error);
    return [];
  }
}

export async function createSubCategoryChild(body: Record<string, unknown>, token?: string) {
  return apiClient({ endpoint: "/subcategory-child", method: "POST", body, token });
}

export async function fetchSubCategoryChildById(id: string, token?: string) {
  const res = await apiClient<any>({ endpoint: `/subcategory-child/${id}`, method: "GET", token });
  return res.data;
}

export async function updateSubCategoryChild(id: string, body: Record<string, unknown>, token?: string) {
  return apiClient({ endpoint: `/subcategory-child/${id}`, method: "PUT", body, token });
}

export async function toggleSubCategoryChildStatus(id: string, active: boolean, token?: string) {
  return apiClient({ endpoint: `/subcategory-child/${id}/status`, method: "PATCH", body: { active }, token });
}

export async function deleteSubCategoryChild(id: string, token?: string) {
  return apiClient({ endpoint: `/subcategory-child/${id}`, method: "DELETE", token });
}

