import { apiClient } from "@/lib/apiClient";
import { Brand } from "@/types";

export async function getBrands(): Promise<Brand[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/brands",
      method: "GET",
    });

    const items = res.data?.brands || [];

    return items.map((item: any) => ({
      id: item._id,
      name: { 
        en: item.name || "Untitled", 
        ar: item.nameAr || item.name || "بدون عنوان" 
      },
      slug: item.slug || "",
      slugAr: item.slugAr || item.slug || "",
      image: item.logo || item.image || "/images/placeholder.jpg",
      url: item.slug ? `/products?brand=${item.slug}` : undefined,
      hasStore: !!item.hasStore || true,
    })) as Brand[];
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}
