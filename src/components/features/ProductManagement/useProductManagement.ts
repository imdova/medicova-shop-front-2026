"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { approveProduct, ApiProduct, deleteProduct, getProducts } from "@/services/productService";
import { getAllSubCategoryChildren, getCategories, getSubCategories } from "@/services/categoryService";
import { getSellers, Seller } from "@/services/sellerService";
import { LanguageType } from "@/util/translations";
import { ProductDateFilter, ProductManagementMode, ProductPublishFilter } from "./types";
import { collectCurrentSellerIds, productBelongsToSeller } from "./ownership";
import { computeStats, filterProducts } from "./computations";
import { mapCategoryTitles, mapSellersById } from "./lookupMaps";

interface UseProductManagementArgs { mode: ProductManagementMode; locale: LanguageType; }

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
  const [sellerFilter, setSellerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [childCategoryFilter, setChildCategoryFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"" | "approved" | "pending">("");
  const [publishFilter, setPublishFilter] = useState<ProductPublishFilter>("");
  const [dateFilter, setDateFilter] = useState<ProductDateFilter>("");
  const [publishStatus, setPublishStatus] = useState<Record<string, "Published" | "Draft">>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ApiProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const sellerIds = useMemo(() => collectCurrentSellerIds(user), [user]);
  const filters = useMemo(
    () => ({ searchQuery, sellerFilter, categoryFilter, subCategoryFilter, childCategoryFilter, approvalFilter, publishFilter, dateFilter }),
    [searchQuery, sellerFilter, categoryFilter, subCategoryFilter, childCategoryFilter, approvalFilter, publishFilter, dateFilter],
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
    const [catsRes, subsRes, childrenRes, sellersRes] = await Promise.allSettled([
      getCategories(token),
      getSubCategories(undefined, token),
      getAllSubCategoryChildren(token),
      getSellers(token),
    ]);
    if (catsRes.status === "fulfilled") setCategoryMap(mapCategoryTitles(catsRes.value));
    if (subsRes.status === "fulfilled") setSubCategoryMap(mapCategoryTitles(subsRes.value));
    if (childrenRes.status === "fulfilled") setChildCategoryMap(mapCategoryTitles(childrenRes.value));
    if (sellersRes.status === "fulfilled") {
      setSellersList(sellersRes.value);
      setSellerMap(mapSellersById(sellersRes.value));
    }
  }, [token]);

  useEffect(() => { refreshProducts(); }, [refreshProducts]);
  useEffect(() => { refreshLookups(); }, [refreshLookups]);

  const scopedProducts = useMemo(
    () => (mode === "admin" ? products : products.filter((product) => productBelongsToSeller(product, sellerIds))),
    [mode, products, sellerIds],
  );

  const filteredProducts = useMemo(
    () => filterProducts({ products: scopedProducts, filters, sellerMap, categoryMap, subCategoryMap, childCategoryMap, publishStatus, locale, isAr }),
    [scopedProducts, filters, sellerMap, categoryMap, subCategoryMap, childCategoryMap, publishStatus, locale, isAr],
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
    isDeleting,
    productToDelete,
    showDeleteConfirm,
    publishStatus,
    filters,
    lookups: { sellersList, sellerMap, categoryMap, subCategoryMap, childCategoryMap },
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
    setApprovalFilter,
    setPublishFilter,
    setDateFilter,
    clearAllFilters: () => {
      setSearchQuery("");
      setSellerFilter("");
      setCategoryFilter("");
      setSubCategoryFilter("");
      setChildCategoryFilter("");
      setApprovalFilter("");
      setPublishFilter("");
      setDateFilter("");
    },
    setPublishValue: (id: string, value: "Published" | "Draft") => setPublishStatus((prev) => ({ ...prev, [id]: value })),
    requestDelete,
    closeDeleteModal: () => setShowDeleteConfirm(false),
    confirmDelete,
    toggleApprove,
  };
}
