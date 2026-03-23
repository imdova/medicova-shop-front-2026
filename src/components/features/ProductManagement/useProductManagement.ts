"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  approveProduct,
  ApiProduct,
  createProduct,
  CreateProductPayload,
  deleteProduct,
  getProductById,
  getProducts,
  updateProductApi,
} from "@/services/productService";
import { getAllSubCategoryChildren, getCategories, getSubCategories } from "@/services/categoryService";
import { getSellers, Seller } from "@/services/sellerService";
import { getBrands } from "@/services/brandService";
import { getSellerBrandsMe } from "@/services/sellerBrandService";
import { LanguageType } from "@/util/translations";
import { ProductDateFilter, ProductManagementMode, ProductPublishFilter } from "./types";
import { collectCurrentSellerIds, productBelongsToSeller } from "./ownership";
import { computeStats, filterProducts } from "./computations";
import { mapBrandsToLookup, mapCategoryTitles, mapSellersById } from "./lookupMaps";

interface UseProductManagementArgs { mode: ProductManagementMode; locale: LanguageType; }

function normalizeId(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    const objectValue = value as { _id?: string; id?: string };
    return String(objectValue._id || objectValue.id || "").trim();
  }
  return "";
}

function normalizeArrayOfStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => String(entry || "").trim())
    .filter(Boolean);
}

function getNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toStockStatus(value: unknown): "in_stock" | "out_of_stock" | "on_backorder" {
  const raw = String(value || "").trim().toLowerCase();
  if (raw === "out_of_stock") return "out_of_stock";
  if (raw === "on_backorder") return "on_backorder";
  return "in_stock";
}

function slugifyEn(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function slugifyAr(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}

function addCopySuffix(base: string, suffix: string, separator = " "): string {
  const trimmed = String(base || "").trim();
  if (!trimmed) return suffix;
  return `${trimmed}${separator}${suffix}`;
}

function stripCopySuffix(base: string): string {
  // REMOVED stripping logic as user requested additive suffixes now.
  return base;
}

function normalizeSpecification(spec: any): {
  keyEn?: string;
  keyAr?: string;
  valueEn?: string;
  valueAr?: string;
} {
  return {
    keyEn: typeof spec?.keyEn === "string" ? spec.keyEn : undefined,
    keyAr: typeof spec?.keyAr === "string" ? spec.keyAr : undefined,
    valueEn: typeof spec?.valueEn === "string" ? spec.valueEn : undefined,
    valueAr: typeof spec?.valueAr === "string" ? spec.valueAr : undefined,
  };
}

function buildDuplicatePayload(
  source: any,
  options: {
    mode: ProductManagementMode;
    userStoreId: string;
    copySuffix: string;
  },
): CreateProductPayload {
  const modeCreatedBy = options.mode === "admin" ? "admin" : "seller";
  const sourceCreatedBy =
    source?.createdBy === "admin" || source?.createdBy === "seller"
      ? source.createdBy
      : modeCreatedBy;
  const createdBy = modeCreatedBy || sourceCreatedBy;

  const sourceStore =
    normalizeId(source?.store) ||
    normalizeId(source?.sellerId) ||
    normalizeId(source?.seller);
  const store =
    options.mode === "seller"
      ? options.userStoreId || sourceStore
      : sourceStore || options.userStoreId;

  const identitySku = String(
    source?.identity?.sku || source?.sku || "",
  ).trim();

  const baseNameEn = String(source?.nameEn || source?.title?.en || "").trim();
  const baseNameAr = String(source?.nameAr || source?.title?.ar || "").trim();

  const baseSlugEn = String(
    source?.slugEn || slugifyEn(baseNameEn),
  ).trim();
  const baseSlugAr = String(
    source?.slugAr || slugifyAr(baseNameAr),
  ).trim();

  const duplicatedNameEn = addCopySuffix(baseNameEn, `- ${options.copySuffix}`, " ");
  const duplicatedNameAr = addCopySuffix(baseNameAr, `- ${options.copySuffix}`, " ");

  const duplicatedSlugEn = `${baseSlugEn || slugifyEn(duplicatedNameEn)}-${options.copySuffix
    .toLowerCase()
    .replace(/\s+/g, "-")}`.replace(/-{2,}/g, "-");
  const duplicatedSlugAr = `${baseSlugAr || slugifyAr(duplicatedNameAr)}-${options.copySuffix
    .toLowerCase()
    .replace(/\s+/g, "-")}`.replace(/-{2,}/g, "-");

  const duplicatedSku = identitySku
    ? `${identitySku}-${options.copySuffix.toUpperCase().replace(/\s+/g, "-")}`
    : options.copySuffix.toUpperCase().replace(/\s+/g, "-");

  const pricing = source?.pricing || {};
  const inventory = source?.inventory || {};
  const inventoryStock = inventory?.stock || source?.stock || {};
  const sourceShipping = source?.shipping || {};
  const sourcePackages = Array.isArray(sourceShipping?.packages)
    ? sourceShipping.packages
    : Array.isArray(source?.packages)
      ? source.packages
      : [];
  const media = source?.media || {};
  const mediaGalleryImages = normalizeArrayOfStrings(media?.galleryImages);
  const rootGalleryImages = normalizeArrayOfStrings(source?.galleryImages);
  const rootImages = normalizeArrayOfStrings(source?.images);
  const galleryImages = mediaGalleryImages.length
    ? mediaGalleryImages
    : rootGalleryImages.length
      ? rootGalleryImages
      : rootImages;

  const featuredImage = String(
    media?.featuredImages || source?.featuredImages || galleryImages[0] || "",
  ).trim();

  const specs = Array.isArray(source?.specifications)
    ? source.specifications.map(normalizeSpecification)
    : [];

  const variants = Array.isArray(source?.variants)
    ? source.variants
        .map((variant: any) => normalizeId(variant))
        .filter(Boolean)
    : [];

  const variantsStock = Array.isArray(inventory?.variantsStock)
    ? inventory.variantsStock
        .map((entry: any) => ({
          name: String(entry?.name || "").trim(),
          total: Math.max(0, Math.floor(getNumber(entry?.total, 0))),
          remaining: Math.max(0, Math.floor(getNumber(entry?.remaining, 0))),
        }))
        .filter((entry: any) => entry.name)
    : [];

  const stockTotal = Math.max(
    0,
    Math.floor(
      getNumber(
        inventoryStock?.total,
        getNumber(inventory?.stockQuantity, getNumber(source?.stockQuantity, 0)),
      ),
    ),
  );
  const stockRemaining = Math.max(
    0,
    Math.floor(getNumber(inventoryStock?.remaining, stockTotal)),
  );

  return {
    nameEn: duplicatedNameEn,
    nameAr: duplicatedNameAr,
    slugEn: duplicatedSlugEn,
    slugAr: duplicatedSlugAr,
    highlightsEn: normalizeArrayOfStrings(source?.highlightsEn),
    highlightsAr: normalizeArrayOfStrings(source?.highlightsAr),
    identity: {
      sku: duplicatedSku,
      skuMode:
        source?.identity?.skuMode === "auto" ? "auto" : "manual",
    },
    classification: {
      category: normalizeId(source?.classification?.category || source?.category),
      subcategory: normalizeId(
        source?.classification?.subcategory || source?.subcategory,
      ),
      childCategory: normalizeId(
        source?.classification?.childCategory || source?.childCategory,
      ),
      brand: normalizeId(source?.classification?.brand || source?.brand),
      productType:
        source?.classification?.productType === "Digital Product"
          ? "Digital Product"
          : "Physical Product",
    },
    descriptions: {
      descriptionEn: addCopySuffix(
        String(source?.descriptions?.descriptionEn || source?.descriptionEn || ""),
        `- ${options.copySuffix}`,
        " ",
      ),
      descriptionAr: addCopySuffix(
        String(source?.descriptions?.descriptionAr || source?.descriptionAr || ""),
        `- ${options.copySuffix}`,
        " ",
      ),
    },
    pricing: {
      originalPrice: getNumber(
        pricing?.originalPrice,
        getNumber(source?.originalPrice, getNumber(source?.price, 0)),
      ),
      salePrice: getNumber(
        pricing?.salePrice,
        getNumber(source?.salePrice, getNumber(source?.sale_price, 0)),
      ),
      startDate:
        typeof pricing?.startDate === "string" && pricing.startDate.trim()
          ? pricing.startDate
          : null,
      endDate:
        typeof pricing?.endDate === "string" && pricing.endDate.trim()
          ? pricing.endDate
          : null,
    },
    inventory: {
      trackStock:
        typeof inventory?.trackStock === "boolean" ? inventory.trackStock : true,
      stockQuantity: Math.max(
        0,
        Math.floor(getNumber(inventory?.stockQuantity, stockTotal)),
      ),
      stockStatus: toStockStatus(inventory?.stockStatus || source?.stockStatus),
      stock: {
        total: stockTotal,
        remaining: stockRemaining,
      },
      variantsStock,
    },
    variants,
    specifications: specs,
    shipping: {
      isPhysicalProduct:
        typeof sourceShipping?.isPhysicalProduct === "boolean"
          ? sourceShipping.isPhysicalProduct
          : true,
      shippingCostInsideCairo: getNumber(
        sourceShipping?.shippingCostInsideCairo,
        getNumber(source?.shippingCostInsideCairo, 0),
      ),
      shippingCostRegion1: getNumber(
        sourceShipping?.shippingCostRegion1,
        getNumber(source?.shippingCostRegion1, 0),
      ),
      shippingCostRegion2: getNumber(
        sourceShipping?.shippingCostRegion2,
        getNumber(source?.shippingCostRegion2, 0),
      ),
      packages: sourcePackages
        .map((pkg: any) => ({
          name: String(pkg?.name || "").trim(),
          weightKg: getNumber(pkg?.weightKg, 0),
          lengthCm: getNumber(pkg?.lengthCm, 0),
          widthCm: getNumber(pkg?.widthCm, 0),
          heightCm: getNumber(pkg?.heightCm, 0),
        }))
        .filter((pkg: any) => pkg.name),
    },
    store,
    sellerId: store || null,
    createdBy,
    media: {
      featuredImages: featuredImage || "",
      galleryImages,
      productVideo:
        source?.media?.productVideo || source?.productVideo
          ? {
              vedioUrl: String(
                source?.media?.productVideo?.vedioUrl ||
                  source?.productVideo?.vedioUrl ||
                  "",
              ).trim(),
              imageUrl: String(
                source?.media?.productVideo?.imageUrl ||
                  source?.productVideo?.imageUrl ||
                  "",
              ).trim(),
            }
          : undefined,
    },
    approved:
      options.mode === "admin"
        ? (typeof source?.approved === "boolean" ? source.approved : true)
        : false,
    rate: getNumber(source?.rate, 4),
    draft: options.mode === "admin" ? Boolean(source?.draft) : true,
  };
}

export function useProductManagement({ mode, locale }: UseProductManagementArgs) {
  const { data: session } = useSession();
  const safeSession = session as { accessToken?: string; user?: unknown } | null;
  const tokenCandidates = useMemo(() => {
    const sessionAny = safeSession as any;
    const userAny = sessionAny?.user as any;
    const raw = [
      sessionAny?.accessToken,
      userAny?.accessToken,
      userAny?.token,
      sessionAny?.token,
    ];
    return Array.from(
      new Set(
        raw
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    );
  }, [safeSession]);
  const token = tokenCandidates[0];
  const user = safeSession?.user;
  const isAr = locale === "ar";
  const page = Math.max(1, Number(useSearchParams().get("page")) || 1);
  const itemsPerPage = 20;
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [sellersList, setSellersList] = useState<Seller[]>([]);
  const [sellerMap, setSellerMap] = useState<Record<string, string>>({});
  const [categoryMap, setCategoryMap] = useState<Record<string, { en: string; ar: string }>>({});
  const [subCategoryMap, setSubCategoryMap] = useState<Record<string, { en: string; ar: string }>>({});
  const [childCategoryMap, setChildCategoryMap] = useState<Record<string, { en: string; ar: string }>>({});
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [brandsList, setBrandsList] = useState<any[]>([]);
  const [brandMap, setBrandMap] = useState<Record<string, { en: string; ar: string }>>({});
  const [sellerFilter, setSellerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [childCategoryFilter, setChildCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"" | "approved" | "pending">("");
  const [publishFilter, setPublishFilter] = useState<ProductPublishFilter>("");
  const [dateFilter, setDateFilter] = useState<ProductDateFilter>("");
  const [publishStatus, setPublishStatus] = useState<Record<string, "Published" | "Draft">>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ApiProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sellerIds = useMemo(() => collectCurrentSellerIds(user), [user]);
  const filters = useMemo(
    () => ({ searchQuery, sellerFilter, categoryFilter, subCategoryFilter, childCategoryFilter, brandFilter, approvalFilter, publishFilter, dateFilter }),
    [searchQuery, sellerFilter, categoryFilter, subCategoryFilter, childCategoryFilter, brandFilter, approvalFilter, publishFilter, dateFilter],
  );

  const refreshProducts = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try { setProducts(await getProducts(token)); } finally { setLoading(false); }
  }, [token]);

  const refreshLookups = useCallback(async () => {
    if (!token) return;
    const [catsRes, subsRes, childrenRes, sellersRes, brandsRes, sellerBrandsRes] =
      await Promise.allSettled([
        getCategories(token),
        getSubCategories(undefined, token),
        getAllSubCategoryChildren(token),
        getSellers(token),
        getBrands(token),
        getSellerBrandsMe(token),
      ]);

    if (catsRes.status === "fulfilled")
      setCategoryMap(mapCategoryTitles(catsRes.value));
    if (subsRes.status === "fulfilled")
      setSubCategoryMap(mapCategoryTitles(subsRes.value));
    if (childrenRes.status === "fulfilled")
      setChildCategoryMap(mapCategoryTitles(childrenRes.value));
    if (sellersRes.status === "fulfilled") {
      setSellersList(sellersRes.value);
      setSellerMap(mapSellersById(sellersRes.value));
    }
    if (brandsRes.status === "fulfilled") {
      const adminBrands = brandsRes.value;
      const sellerBrands =
        sellerBrandsRes.status === "fulfilled"
          ? (sellerBrandsRes.value as any[]).map((b) => ({
              id: b._id,
              name: { en: b.brandName, ar: b.brandName },
              image: b.brandLogo || "/images/placeholder.jpg",
              isSellerBrand: true,
            }))
          : [];

      const mergedBrands = [...adminBrands, ...sellerBrands];
      setBrandsList(mergedBrands);
      setBrandMap(mapBrandsToLookup(mergedBrands));
    }
  }, [token]);

  useEffect(() => { refreshProducts(); }, [refreshProducts]);
  useEffect(() => { refreshLookups(); }, [refreshLookups]);

  const scopedProducts = useMemo(
    () => (mode === "admin" ? products : products.filter((product) => productBelongsToSeller(product, sellerIds))),
    [mode, products, sellerIds],
  );

  const filteredProducts = useMemo(
    () => filterProducts({ products: scopedProducts, filters, sellerMap, categoryMap, subCategoryMap, childCategoryMap, brandMap, publishStatus, locale, isAr }),
    [scopedProducts, filters, sellerMap, categoryMap, subCategoryMap, childCategoryMap, brandMap, publishStatus, locale, isAr],
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const stats = useMemo(() => computeStats({ products: scopedProducts, locale, categoryMap }), [scopedProducts, locale, categoryMap]);

  const requestDelete = (product: ApiProduct) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    if (!tokenCandidates.length) {
      toast.error(isAr ? "انتهت الجلسة، برجاء تسجيل الدخول مرة أخرى" : "Session expired. Please sign in again.");
      return;
    }

    setIsDeleting(true);
    try {
      let deleted = false;
      let lastError: unknown = null;

      for (const candidateToken of tokenCandidates) {
        try {
          await deleteProduct(productToDelete._id, candidateToken);
          deleted = true;
          break;
        } catch (error: unknown) {
          lastError = error;
          const message = error instanceof Error ? error.message.toLowerCase() : "";
          const isAuthIssue =
            message.includes("unauthorized") ||
            message.includes("invalid refresh token") ||
            message.includes("jwt");
          if (!isAuthIssue) break;
        }
      }

      if (!deleted) throw lastError || new Error("Delete failed");

      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      toast.success(isAr ? "تم الحذف بنجاح" : "Deleted successfully");
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "";
      toast.error(message || (isAr ? "فشل الحذف" : "Delete failed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleApprove = async (product: ApiProduct) => {
    if (!token) return;
    setApprovingId(product._id);
    try {
      await approveProduct(product._id, !product.approved, token);
      setProducts((prev) => prev.map((p) => (p._id === product._id ? { ...p, approved: !p.approved } : p)));
      toast.success(isAr ? "تم تحديث الحالة" : "Status updated successfully");
    } catch {
      toast.error(isAr ? "فشل تحديث الحالة" : "Status update failed");
    } finally {
      setApprovingId(null);
    }
  };

  const duplicateProduct = useCallback(
    async (product: ApiProduct) => {
      if (!token) {
        toast.error(
          isAr
            ? "انتهت الجلسة، برجاء تسجيل الدخول مرة أخرى"
            : "Session expired. Please sign in again.",
        );
        return;
      }

      setDuplicatingId(product._id);
      try {
        const sourceProduct = await getProductById(product._id, token);
        if (!sourceProduct) {
          throw new Error("Failed to load source product details");
        }

        const userStoreId = sellerIds[0] || "";
        let created = false;
        let lastError: unknown = null;

        for (let attempt = 1; attempt <= 100; attempt++) {
          const copySuffix = attempt === 1 ? "copy" : `copy-${attempt}`;
          const payload = buildDuplicatePayload(sourceProduct, {
            mode,
            userStoreId,
            copySuffix,
          });

          try {
            await createProduct(payload, token, true);
            created = true;
            break;
          } catch (error: unknown) {
            lastError = error;
            const message =
              error instanceof Error
                ? error.message.toLowerCase()
                : String(error || "").toLowerCase();
            
            // Broaden detection to catch any SKU or conflict terminology
            const isDuplicateConflict =
              message.includes("duplicate") ||
              message.includes("already") ||
              message.includes("exist") ||
              message.includes("unique") ||
              message.includes("sku") ||
              message.includes("conflict") ||
              message.includes("400");
              
            if (!isDuplicateConflict) break;
            console.warn(`Duplication attempt ${attempt} failed with conflict ("${message}"), retrying with unique suffix...`);
          }
        }

        if (!created) {
          throw lastError || new Error("Failed to duplicate product");
        }

        toast.success(
          isAr ? "تم نسخ المنتج بنجاح" : "Product duplicated successfully",
        );
        await refreshProducts();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "";
        toast.error(
          message || (isAr ? "فشل نسخ المنتج" : "Failed to duplicate product"),
        );
      } finally {
        setDuplicatingId(null);
      }
    },
    [token, isAr, sellerIds, mode, refreshProducts],
  );

  const setPublishValue = useCallback(
    async (id: string, value: "Published" | "Draft") => {
      if (!token) return;
      setPublishingId(id);
      try {
        await updateProductApi(id, { draft: value === "Draft" }, token);
        setPublishStatus((prev) => ({ ...prev, [id]: value }));
        setProducts((prev) =>
          prev.map((p) =>
            p._id === id ? { ...p, draft: value === "Draft" } : p,
          ),
        );
        toast.success(isAr ? "تم تحديث حالة النشر" : "Publish status updated");
      } catch (error) {
        toast.error(isAr ? "فشل تحديث حالة النشر" : "Failed to update publish status");
      } finally {
        setPublishingId(null);
      }
    },
    [token, isAr],
  );

  return {
    locale,
    isAr,
    mode,
    loading,
    products: scopedProducts,
    filteredProducts,
    paginatedProducts,
    currentPage,
    totalPages,
    itemsPerPage,
    viewMode,
    approvingId,
    duplicatingId,
    publishingId,
    isDeleting,
    productToDelete,
    showDeleteConfirm,
    publishStatus,
    filters,
    lookups: { sellersList, sellerMap, categoryMap, subCategoryMap, childCategoryMap, brandMap, brandsList },
    stats,
    routes: {
      createPath: `/${locale}/${mode}/create-product`,
      detailsPath: (id: string) => `/${locale}/${mode}/products/details/${id}`,
      editPath: (id: string) => `/${locale}/${mode}/products/${id}`,
    },
    setViewMode,
    setSearchQuery,
    setSellerFilter,
    setCategoryFilter,
    setSubCategoryFilter,
    setChildCategoryFilter,
    setBrandFilter,
    setApprovalFilter,
    setPublishFilter,
    setDateFilter,
    clearAllFilters: () => {
      setSearchQuery("");
      setSellerFilter("");
      setCategoryFilter("");
      setSubCategoryFilter("");
      setChildCategoryFilter("");
      setBrandFilter("");
      setApprovalFilter("");
      setPublishFilter("");
      setDateFilter("");
    },
    setPublishValue,
    setPublishValueLocal: (id: string, value: "Published" | "Draft") => setPublishStatus((prev) => ({ ...prev, [id]: value })),
    requestDelete,
    closeDeleteModal: () => setShowDeleteConfirm(false),
    confirmDelete,
    toggleApprove,
    duplicateProduct,
  };
}
