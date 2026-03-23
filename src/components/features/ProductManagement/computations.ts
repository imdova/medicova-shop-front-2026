import { ApiProduct } from "@/services/productService";
import { LanguageType } from "@/util/translations";
import { ProductComputedStats, ProductFilterState } from "./types";
import {
  getCategoryName,
  getChildCategoryName,
  getBrandName,
  getSellerName,
  getSubCategoryName,
} from "./utils";

interface FilterProductsArgs {
  products: ApiProduct[];
  filters: ProductFilterState;
  sellerMap: Record<string, string>;
  categoryMap: Record<string, { en: string; ar: string }>;
  subCategoryMap: Record<string, { en: string; ar: string }>;
  childCategoryMap: Record<string, { en: string; ar: string }>;
  brandMap: Record<string, { en: string; ar: string }>;
  publishStatus: Record<string, "Published" | "Draft">;
  locale: LanguageType;
  isAr: boolean;
}

export function filterProducts({
  products,
  filters,
  sellerMap,
  categoryMap,
  subCategoryMap,
  childCategoryMap,
  brandMap,
  publishStatus,
  locale,
  isAr,
}: FilterProductsArgs): ApiProduct[] {
  return products.filter((product) => {
    const name = isAr ? product.nameAr || product.nameEn : product.nameEn || product.nameAr;
    const sku = product.sku ?? product.identity?.sku ?? "";
    const publish = publishStatus[product._id] || (product.draft ? "Draft" : "Published");
    const createdTime = product.createdAt ? new Date(product.createdAt).getTime() : null;

    const matchesSearch = !filters.searchQuery || name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) || String(sku).toLowerCase().includes(filters.searchQuery.toLowerCase());
    const matchesSeller = !filters.sellerFilter || getSellerName(product, sellerMap) === filters.sellerFilter;
    const matchesCategory = !filters.categoryFilter || getCategoryName(product, locale, categoryMap) === filters.categoryFilter;
    const matchesSubCategory = !filters.subCategoryFilter || getSubCategoryName(product, locale, subCategoryMap) === filters.subCategoryFilter;
    const matchesChildCategory = !filters.childCategoryFilter || getChildCategoryName(product, locale, childCategoryMap) === filters.childCategoryFilter;
    const matchesBrand = !filters.brandFilter || getBrandName(product, locale, brandMap) === filters.brandFilter;
    const matchesApproval = !filters.approvalFilter || (filters.approvalFilter === "approved" ? product.approved : !product.approved);
    const matchesPublish = !filters.publishFilter || publish === filters.publishFilter;

    const matchesDate = !filters.dateFilter || (() => {
      if (!createdTime) return filters.dateFilter === "no-date";
      if (filters.dateFilter === "no-date") return false;
      const diff = Date.now() - createdTime;
      const day = 86400000;
      if (filters.dateFilter === "7") return diff <= 7 * day;
      if (filters.dateFilter === "30") return diff <= 30 * day;
      return diff <= 90 * day;
    })();

    return matchesSearch && matchesSeller && matchesCategory && matchesSubCategory && matchesChildCategory && matchesBrand && matchesApproval && matchesPublish && matchesDate;
  });
}

interface ComputeStatsArgs {
  products: ApiProduct[];
  locale: LanguageType;
  categoryMap: Record<string, { en: string; ar: string }>;
}

export function computeStats({
  products,
  locale,
  categoryMap,
}: ComputeStatsArgs): ProductComputedStats {
  const pendingCount = products.filter((product) => !product.approved).length;
  const outOfStockCount = products.filter((product) => (product.stockQuantity ?? product.inventory?.stockQuantity ?? 0) === 0).length;
  const counts = new Map<string, number>();

  products.forEach((product) => {
    const category = getCategoryName(product, locale, categoryMap) || "—";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  });

  const topCategory = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .find(([name]) => name !== "—")?.[0] || "—";

  return {
    totalProducts: products.length,
    pendingCount,
    outOfStockCount,
    topCategory,
  };
}
