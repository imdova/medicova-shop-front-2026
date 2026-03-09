"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus,
  Upload,
  Download,
  Package,
  FileCheck,
  AlertCircle,
  Star,
  Search,
  Pencil,
  Copy,
  Trash2,
  ChevronDown,
  X,
  LayoutGrid,
  LayoutList,
} from "lucide-react";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  getProducts,
  deleteProduct,
  approveProduct,
  ApiProduct,
} from "@/services/productService";
import {
  getCategories,
  getSubCategories,
  getAllSubCategoryChildren,
} from "@/services/categoryService";
import { getSellers, Seller } from "@/services/sellerService";
import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/dropdown-menu";
import { Pagination } from "@/components/shared/Pagination";
import { LanguageType } from "@/util/translations";
import { useSearchParams } from "next/navigation";
import Modal from "@/components/shared/Modals/DynamicModal";
import { Button } from "@/components/shared/button";
import { Loader2 } from "lucide-react";

function getSellerName(
  product: ApiProduct,
  sellerMap?: Record<string, string>,
): string {
  const s =
    product.seller || product.sellers || product.store || product.sellerId;
  if (!s) return product.createdBy || "—";

  // Handle populated object
  if (typeof s === "object") {
    const name =
      (s as any).name || (s as any).store_name || (s as any).storeName;
    if (name) return name;
    if ((s as any).firstName || (s as any).lastName) {
      return [(s as any).firstName, (s as any).lastName]
        .filter(Boolean)
        .join(" ");
    }
  }

  // Handle ID string
  if (typeof s === "string") {
    if (s === "admin") return "Admin";
    if (sellerMap?.[s]) return sellerMap[s];
    return s.slice(0, 12) + "…";
  }

  return String(s);
}

function getCategoryName(
  product: ApiProduct,
  locale: LanguageType,
  lookup?: Record<string, { en: string; ar: string }>,
): string {
  const c = product.category || product.classification?.category;
  if (!c) return "—";

  // Handle populated object
  if (typeof c === "object") {
    return (
      (c as any).title?.[locale] ??
      (c as any).nameAr?.[locale] ??
      (c as any).name ??
      "—"
    );
  }

  // Handle ID as string
  if (typeof c === "string" && lookup?.[c]) {
    return lookup[c][locale] || lookup[c].en || "—";
  }

  return "—";
}

function getSubCategoryName(
  product: ApiProduct,
  locale: LanguageType,
  lookup?: Record<string, { en: string; ar: string }>,
): string {
  const s = product.subcategory || product.classification?.subcategory;
  if (!s) return "—";

  // Handle populated object
  if (typeof s === "object") {
    return (
      (s as any).title?.[locale] ??
      (s as any).nameAr?.[locale] ??
      (s as any).name ??
      "—"
    );
  }

  if (typeof s === "string" && lookup?.[s]) {
    return lookup[s][locale] || lookup[s].en || "—";
  }

  return "—";
}

function getChildCategoryName(
  product: ApiProduct,
  locale: LanguageType,
  lookup?: Record<string, { en: string; ar: string }>,
): string {
  const ch = product.childCategory || product.classification?.childCategory;
  if (!ch) return "—";

  // Handle populated object
  if (typeof ch === "object") {
    return (
      (ch as any).title?.[locale] ??
      (ch as any).nameAr?.[locale] ??
      (ch as any).name ??
      "—"
    );
  }

  if (typeof ch === "string" && lookup?.[ch]) {
    return lookup[ch][locale] || lookup[ch].en || "—";
  }

  return "—";
}

function formatCreatedAt(
  createdAt: string | null | undefined,
  locale: LanguageType,
): string {
  if (!createdAt) return "—";
  try {
    const d = new Date(createdAt);
    const fmt = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return fmt.format(d);
  } catch {
    return "—";
  }
}

function formatNumber(n: number, locale: LanguageType): string {
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(n);
  } catch {
    return String(n);
  }
}

function getInitials(name: string): string {
  const cleaned = (name || "").trim();
  if (!cleaned) return "—";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second =
    parts.length > 1 ? (parts[1]?.[0] ?? "") : (parts[0]?.[1] ?? "");
  const initials = (first + second).toUpperCase();
  return initials || "—";
}

function formatPrice(
  n: number | string | null | undefined,
  locale: LanguageType,
): string {
  if (n === null || n === undefined) return "—";
  try {
    const num = typeof n === "string" ? parseFloat(n) : n;
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return typeof n === "number" ? n.toFixed(2) : String(n);
  }
}

function formatCurrency(amount: number, locale: LanguageType): string {
  try {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

function getStockStatus(product: ApiProduct): {
  label: string;
  dot: "green" | "red" | "orange";
} {
  const qty =
    product.stock ??
    product.stockQuantity ??
    product.inventory?.stockQuantity ??
    null;
  if (qty === null || qty === undefined) return { label: "—", dot: "green" };
  if (qty === 0) return { label: "Out of Stock", dot: "red" };
  if (qty < 10) return { label: `${qty} in stock (Low)`, dot: "orange" };
  return { label: `${qty} in stock`, dot: "green" };
}

export default function Products2Page() {
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [sellersList, setSellersList] = useState<Seller[]>([]);
  const [sellerMap, setSellerMap] = useState<Record<string, string>>({});
  const [categoryMap, setCategoryMap] = useState<
    Record<string, { en: string; ar: string }>
  >({});
  const [subCategoryMap, setSubCategoryMap] = useState<
    Record<string, { en: string; ar: string }>
  >({});
  const [childCategoryMap, setChildCategoryMap] = useState<
    Record<string, { en: string; ar: string }>
  >({});
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<
    "" | "approved" | "pending"
  >("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [childCategoryFilter, setChildCategoryFilter] = useState("");
  const [publishFilter, setPublishFilter] = useState<
    "" | "Published" | "Draft"
  >("");
  const [dateFilter, setDateFilter] = useState<
    "" | "7" | "30" | "90" | "no-date"
  >("");
  const [publishStatus, setPublishStatus] = useState<
    Record<string, "Published" | "Draft">
  >({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<ApiProduct | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const searchParams = useSearchParams();
  const pageFromUrl = Number(searchParams.get("page")) || 1;
  const currentPage = Math.max(1, pageFromUrl);
  const itemsPerPage = 20;

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getProducts(token);
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch categories, subcategories, child categories, and sellers for lookup maps
  useEffect(() => {
    async function fetchLookups() {
      if (!token) return;
      try {
        const results = await Promise.allSettled([
          getCategories(token),
          getSubCategories(undefined, token),
          getAllSubCategoryChildren(token),
          getSellers(token),
        ]);

        if (results[0].status === "fulfilled") {
          const cats = results[0].value;
          const catMap: Record<string, { en: string; ar: string }> = {};
          for (const c of cats) {
            catMap[c.id] = { en: c.title.en, ar: c.title.ar };
          }
          setCategoryMap(catMap);
        }

        if (results[1].status === "fulfilled") {
          const subs = results[1].value;
          const subMap: Record<string, { en: string; ar: string }> = {};
          for (const s of subs) {
            subMap[s.id] = { en: s.title.en, ar: s.title.ar };
          }
          setSubCategoryMap(subMap);
        }

        if (results[2].status === "fulfilled") {
          const children = results[2].value;
          const childMap: Record<string, { en: string; ar: string }> = {};
          for (const ch of children) {
            childMap[ch.id] = { en: ch.title.en, ar: ch.title.ar };
          }
          setChildCategoryMap(childMap);
        }

        if (results[3].status === "fulfilled") {
          const sellers = results[3].value;
          setSellersList(sellers);
          const sMap: Record<string, string> = {};
          for (const s of sellers) {
            sMap[s.id] = s.name;
          }
          setSellerMap(sMap);
        }
      } catch (err) {
        console.error("Failed to fetch lookups:", err);
      }
    }
    fetchLookups();
  }, [token]);

  const filteredProducts = React.useMemo(() => {
    return products.filter((p) => {
      const name = isAr ? p.nameAr || p.nameEn : p.nameEn || p.nameAr;
      const sku = p.sku ?? p.identity?.sku ?? "";
      const matchesSearch =
        !searchQuery ||
        name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(sku).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeller =
        !sellerFilter || getSellerName(p, sellerMap) === sellerFilter;
      const matchesCategory =
        !categoryFilter ||
        getCategoryName(p, locale, categoryMap) === categoryFilter;
      const matchesSubCategory =
        !subCategoryFilter ||
        getSubCategoryName(p, locale, subCategoryMap) === subCategoryFilter;
      const matchesChildCategory =
        !childCategoryFilter ||
        getChildCategoryName(p, locale, childCategoryMap) ===
          childCategoryFilter;
      const matchesApproval =
        !approvalFilter ||
        (approvalFilter === "approved" && p.approved) ||
        (approvalFilter === "pending" && !p.approved);
      const publish = publishStatus[p._id] ?? "Published";
      const matchesPublish = !publishFilter || publish === publishFilter;
      const matchesDate =
        !dateFilter ||
        (() => {
          if (!p.createdAt) return dateFilter === "no-date";
          if (dateFilter === "no-date") return false;
          const d = new Date(p.createdAt).getTime();
          const now = Date.now();
          const day = 86400000;
          if (dateFilter === "7") return now - d <= 7 * day;
          if (dateFilter === "30") return now - d <= 30 * day;
          if (dateFilter === "90") return now - d <= 90 * day;
          return true;
        })();
      return (
        matchesSearch &&
        matchesSeller &&
        matchesCategory &&
        matchesSubCategory &&
        matchesChildCategory &&
        matchesApproval &&
        matchesPublish &&
        matchesDate
      );
    });
  }, [
    products,
    searchQuery,
    sellerFilter,
    categoryFilter,
    approvalFilter,
    subCategoryFilter,
    childCategoryFilter,
    publishFilter,
    dateFilter,
    publishStatus,
    locale,
    isAr,
    categoryMap,
    subCategoryMap,
    childCategoryMap,
    sellerMap,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / itemsPerPage),
  );
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleDelete = (product: ApiProduct) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete || !token) return;
    setIsDeleting(true);
    try {
      await deleteProduct(productToDelete._id, token);
      setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
      toast.success(isAr ? "تم الحذف بنجاح" : "Deleted successfully");
    } catch (err: any) {
      toast.error(err?.message || (isAr ? "فشل الحذف" : "Delete failed"));
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  const handleToggleApprove = async (product: ApiProduct) => {
    setApprovingId(product._id);
    try {
      await approveProduct(product._id, !product.approved, token);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, approved: !p.approved } : p,
        ),
      );
      toast.success(isAr ? "تم تحديث الحالة" : "Status updated successfully");
    } catch (err) {
      toast.error(isAr ? "فشل تحديث الحالة" : "Status update failed");
    } finally {
      setApprovingId(null);
    }
  };

  const totalProducts = products.length;
  const pendingCount = products.filter((p) => !p.approved).length;
  const outOfStockCount = products.filter(
    (p) => (p.stockQuantity ?? p.inventory?.stockQuantity ?? 0) === 0,
  ).length;

  const topCategory = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const key = getCategoryName(p, locale, categoryMap) || "—";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    let best = "—";
    let bestCount = -1;
    for (const [k, c] of counts) {
      if (c > bestCount && k !== "—") {
        best = k;
        bestCount = c;
      }
    }
    return best;
  }, [products, locale, categoryMap]);

  return (
    <div className="animate-in fade-in min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 duration-700">
      <div className="mx-auto max-w-[1440px] p-4 md:p-8">
        {/* Page header: compact, modern */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              {isAr ? "إدارة المنتجات" : "Products Management"}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-slate-300 hover:shadow active:scale-[0.98]"
            >
              <Upload className="h-4 w-4 opacity-70" />
              {isAr ? "إجراءات جماعية" : "Bulk Actions"}
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-slate-300 hover:shadow active:scale-[0.98]"
            >
              <Download className="h-4 w-4 opacity-70" />
              {isAr ? "تصدير CSV" : "Export CSV"}
            </button>
            <Link
              href={`/${locale}/admin/create-product`}
              className="shadow-primary/25 hover:shadow-primary/30 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              {isAr ? "إضافة منتج جديد" : "Add New Product"}
            </Link>
          </div>
        </div>

        {/* Summary cards: smart, modern */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: Package,
              value: formatNumber(totalProducts, locale),
              label: isAr ? "إجمالي المنتجات" : "Total Products",
              accent: "emerald",
              gradient: "from-emerald-500/8 to-emerald-600/4",
              iconBg: "bg-emerald-500/15",
              iconColor: "text-emerald-600",
              ring: "ring-emerald-500/20",
              shadow: "hover:shadow-emerald-500/10",
            },
            {
              icon: FileCheck,
              value: String(pendingCount),
              label: isAr ? "قيد الموافقة" : "Pending Approval",
              accent: "amber",
              gradient: "from-amber-500/8 to-amber-600/4",
              iconBg: "bg-amber-500/15",
              iconColor: "text-amber-600",
              ring: "ring-amber-500/20",
              shadow: "hover:shadow-amber-500/10",
            },
            {
              icon: AlertCircle,
              value: String(outOfStockCount),
              label: isAr ? "نفد من المخزون" : "Out of Stock",
              accent: "rose",
              gradient: "from-rose-500/8 to-rose-600/4",
              iconBg: "bg-rose-500/15",
              iconColor: "text-rose-600",
              ring: "ring-rose-500/20",
              shadow: "hover:shadow-rose-500/10",
            },
            {
              icon: Star,
              value: topCategory,
              label: isAr ? "أفضل فئة مبيعاً" : "Top Selling Category",
              accent: "violet",
              gradient: "from-violet-500/8 to-violet-600/4",
              iconBg: "bg-violet-500/15",
              iconColor: "text-violet-600",
              ring: "ring-violet-500/20",
              shadow: "hover:shadow-violet-500/10",
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm ring-1 ring-slate-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${card.shadow} hover:ring-2 ${card.ring}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                aria-hidden
              />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor} transition-transform duration-300 group-hover:scale-105`}
                  >
                    <card.icon className="h-5 w-5" strokeWidth={2.25} />
                  </div>
                  <p className="text-2xl font-extrabold tabular-nums tracking-tight text-slate-900">
                    {card.value}
                  </p>
                </div>
              </div>
              <div className="relative mt-3">
                <p className="text-xs font-medium text-slate-500">
                  {card.label}
                </p>
              </div>
              <div
                className={`absolute left-0 top-0 h-0.5 w-14 rounded-r-full ${
                  card.accent === "emerald"
                    ? "bg-emerald-500"
                    : card.accent === "amber"
                      ? "bg-amber-500"
                      : card.accent === "rose"
                        ? "bg-rose-500"
                        : "bg-violet-500"
                }`}
                aria-hidden
              />
            </div>
          ))}
        </div>

        {/* Search & filters */}
        <div className="mb-6 rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
          {(() => {
            const hasActive =
              Boolean(searchQuery) ||
              Boolean(sellerFilter) ||
              Boolean(categoryFilter) ||
              Boolean(subCategoryFilter) ||
              Boolean(childCategoryFilter) ||
              Boolean(approvalFilter) ||
              Boolean(publishFilter) ||
              Boolean(dateFilter);

            const dateLabel =
              dateFilter === "7"
                ? isAr
                  ? "آخر 7 أيام"
                  : "Last 7 days"
                : dateFilter === "30"
                  ? isAr
                    ? "آخر 30 يومًا"
                    : "Last 30 days"
                  : dateFilter === "90"
                    ? isAr
                      ? "آخر 90 يومًا"
                      : "Last 90 days"
                    : dateFilter === "no-date"
                      ? isAr
                        ? "بدون تاريخ"
                        : "No date"
                      : "";

            const chips: Array<{
              key: string;
              label: string;
              value: string;
              clear: () => void;
            }> = [
              {
                key: "search",
                label: isAr ? "بحث" : "Search",
                value: searchQuery,
                clear: () => setSearchQuery(""),
              },
              {
                key: "seller",
                label: isAr ? "البائع" : "Seller",
                value: sellerFilter,
                clear: () => setSellerFilter(""),
              },
              {
                key: "category",
                label: isAr ? "الفئة" : "Category",
                value: categoryFilter,
                clear: () => setCategoryFilter(""),
              },
              {
                key: "subcategory",
                label: isAr ? "الفئة الفرعية" : "Subcategory",
                value: subCategoryFilter,
                clear: () => setSubCategoryFilter(""),
              },
              {
                key: "childCategory",
                label: isAr ? "الفئة الفرعية للطفل" : "Child Category",
                value: childCategoryFilter,
                clear: () => setChildCategoryFilter(""),
              },
              {
                key: "status",
                label: isAr ? "الحالة" : "Status",
                value:
                  approvalFilter === "approved"
                    ? isAr
                      ? "معتمد"
                      : "Approved"
                    : approvalFilter === "pending"
                      ? isAr
                        ? "قيد الانتظار"
                        : "Pending"
                      : "",
                clear: () => setApprovalFilter(""),
              },
              {
                key: "publish",
                label: isAr ? "النشر" : "Publish",
                value:
                  publishFilter === "Published"
                    ? isAr
                      ? "منشور"
                      : "Published"
                    : publishFilter === "Draft"
                      ? isAr
                        ? "مسودة"
                        : "Draft"
                      : "",
                clear: () => setPublishFilter(""),
              },
              {
                key: "date",
                label: isAr ? "التاريخ" : "Date",
                value: dateLabel,
                clear: () => setDateFilter(""),
              },
            ].filter((c) => c.value);

            return (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2 text-slate-900">
                      <span className="text-sm font-bold">
                        {isAr ? "كل المنتجات" : "All Products"}
                      </span>
                      <span className="text-sm font-bold">
                        ( {formatNumber(totalProducts, locale)} )
                      </span>
                    </div>
                    <div className="relative min-w-[240px] flex-1">
                      <Search
                        className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${isAr ? "right-3" : "left-3"}`}
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          isAr
                            ? "البحث بالاسم أو SKU..."
                            : "Search by name or SKU..."
                        }
                        className={`w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isAr ? "pl-4 pr-10" : "pl-10 pr-4"}`}
                      />
                    </div>
                    <p className="shrink-0 text-xs font-medium text-slate-500">
                      {isAr ? "النتائج" : "Results"}:{" "}
                      <span className="font-semibold text-slate-700">
                        {formatNumber(filteredProducts.length, locale)}
                      </span>
                    </p>

                    {/* List / Grid toggle (right of search) */}
                    <div className="flex w-fit rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          viewMode === "list"
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                        aria-label={isAr ? "عرض القائمة" : "List view"}
                      >
                        <LayoutList className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          viewMode === "grid"
                            ? "bg-slate-100 text-slate-900"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`}
                        aria-label={isAr ? "عرض الشبكة" : "Grid view"}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
                  <div className="flex flex-col gap-1">
                    <label
                      className={`text-xs font-semibold text-slate-700 ${isAr ? "text-right" : ""}`}
                    >
                      {isAr ? "البائع" : "Seller"}
                    </label>
                    <select
                      value={sellerFilter}
                      onChange={(e) => setSellerFilter(e.target.value)}
                      className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-[13px] text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">{isAr ? "الكل" : "All"}</option>
                      {sellersList.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      className={`text-xs font-semibold text-slate-700 ${isAr ? "text-right" : ""}`}
                    >
                      {isAr ? "الفئة" : "Category"}
                    </label>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-[13px] text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">{isAr ? "الكل" : "All"}</option>
                      {Object.entries(categoryMap).map(([id, title]) => (
                        <option key={id} value={title[locale] || title.en}>
                          {title[locale] || title.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      className={`text-xs font-semibold text-slate-700 ${isAr ? "text-right" : ""}`}
                    >
                      {isAr ? "الفئة الفرعية" : "Subcategory"}
                    </label>
                    <select
                      value={subCategoryFilter}
                      onChange={(e) => setSubCategoryFilter(e.target.value)}
                      className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-[13px] text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">{isAr ? "الكل" : "All"}</option>
                      {Object.entries(subCategoryMap).map(([id, title]) => (
                        <option key={id} value={title[locale] || title.en}>
                          {title[locale] || title.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      className={`text-xs font-semibold text-slate-700 ${isAr ? "text-right" : ""}`}
                    >
                      {isAr ? "الفئة الفرعية للطفل" : "Child Category"}
                    </label>
                    <select
                      value={childCategoryFilter}
                      onChange={(e) => setChildCategoryFilter(e.target.value)}
                      className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-[13px] text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">{isAr ? "الكل" : "All"}</option>
                      {Object.entries(childCategoryMap).map(([id, title]) => (
                        <option key={id} value={title[locale] || title.en}>
                          {title[locale] || title.en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      className={`text-xs font-semibold text-slate-700 ${isAr ? "text-right" : ""}`}
                    >
                      {isAr ? "الحالة" : "Status"}
                    </label>
                    <select
                      value={approvalFilter}
                      onChange={(e) =>
                        setApprovalFilter(
                          e.target.value as "" | "approved" | "pending",
                        )
                      }
                      className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-[13px] text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">{isAr ? "الكل" : "All"}</option>
                      <option value="approved">
                        {isAr ? "معتمد" : "Approved"}
                      </option>
                      <option value="pending">
                        {isAr ? "قيد الانتظار" : "Pending"}
                      </option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      className={`text-xs font-semibold text-slate-700 ${isAr ? "text-right" : ""}`}
                    >
                      {isAr ? "النشر" : "Publish"}
                    </label>
                    <select
                      value={publishFilter}
                      onChange={(e) =>
                        setPublishFilter(
                          e.target.value as "" | "Published" | "Draft",
                        )
                      }
                      className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-[13px] text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">{isAr ? "الكل" : "All"}</option>
                      <option value="Published">
                        {isAr ? "منشور" : "Published"}
                      </option>
                      <option value="Draft">{isAr ? "مسودة" : "Draft"}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label
                      className={`text-xs font-semibold text-slate-700 ${isAr ? "text-right" : ""}`}
                    >
                      {isAr ? "التاريخ" : "Date"}
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) =>
                        setDateFilter(
                          e.target.value as "" | "7" | "30" | "90" | "no-date",
                        )
                      }
                      className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-[13px] text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      <option value="">{isAr ? "الكل" : "All"}</option>
                      <option value="7">
                        {isAr ? "آخر 7 أيام" : "Last 7 days"}
                      </option>
                      <option value="30">
                        {isAr ? "آخر 30 يومًا" : "Last 30 days"}
                      </option>
                      <option value="90">
                        {isAr ? "آخر 90 يومًا" : "Last 90 days"}
                      </option>
                      <option value="no-date">
                        {isAr ? "بدون تاريخ" : "No date"}
                      </option>
                    </select>
                  </div>

                  {/* Clear all button at far right of filters */}
                  <div className="flex flex-col gap-1">
                    <div className="hidden text-xs font-semibold text-slate-700 xl:block">
                      {isAr ? " " : " "}
                    </div>
                    <button
                      type="button"
                      disabled={!hasActive}
                      onClick={() => {
                        setSellerFilter("");
                        setCategoryFilter("");
                        setSubCategoryFilter("");
                        setChildCategoryFilter("");
                        setApprovalFilter("");
                        setPublishFilter("");
                        setDateFilter("");
                        setSearchQuery("");
                      }}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
                    >
                      <X className="h-4 w-4" />
                      {isAr ? "مسح الكل" : "Clear all"}
                    </button>
                  </div>
                </div>

                {chips.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                      {isAr ? "فلاتر نشطة:" : "Active filters:"}
                    </span>
                    {chips.map((chip) => (
                      <span
                        key={chip.key}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80"
                      >
                        <span className="text-slate-500">{chip.label}</span>
                        <span className="max-w-[220px] truncate">
                          {chip.value}
                        </span>
                        <button
                          type="button"
                          onClick={chip.clear}
                          className="rounded-full p-0.5 text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-700"
                          aria-label={isAr ? "إزالة الفلتر" : "Remove filter"}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })()}
        </div>

        {/* Table: clean, modern */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 shadow-sm backdrop-blur-sm">
          {loading ? (
            <div className="flex flex-col gap-0">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border-b border-slate-100 px-4 py-4 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-200/60" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-slate-200/60" />
                      <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                  <div className="h-4 w-24 animate-pulse rounded bg-slate-200/60" />
                  <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-4 w-14 animate-pulse rounded bg-slate-200/60" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
              <div className="rounded-2xl bg-slate-100 p-4">
                <Package className="h-12 w-12 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">
                {isAr ? "لا توجد منتجات" : "No products found"}
              </p>
              <p className="max-w-sm text-xs text-slate-500">
                {isAr
                  ? "غيّر الفلاتر أو أضف منتجاً جديداً."
                  : "Try adjusting filters or add a new product."}
              </p>
              <Link
                href={`/${locale}/admin/create-product`}
                className="hover:bg-primary/90 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition"
              >
                {isAr ? "إضافة منتج" : "Add product"}
              </Link>
            </div>
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedProducts.map((item) => {
                  const name = isAr
                    ? item.nameAr || item.nameEn
                    : item.nameEn || item.nameAr;
                  const sku =
                    item.sku ??
                    item.identity?.sku ??
                    item._id.slice(-6).toUpperCase();
                  const salePrice =
                    item.sale_price ??
                    item.salePrice ??
                    item.pricing?.salePrice ??
                    item.pricing?.sale_price;
                  const originalPrice =
                    item.price ??
                    item.original_price ??
                    item.originalPrice ??
                    item.pricing?.originalPrice ??
                    item.pricing?.original_price ??
                    item.del_price;
                  const price =
                    salePrice && Number(salePrice) > 0
                      ? salePrice
                      : originalPrice;

                  const orders =
                    item.orders ??
                    item.total_orders ??
                    item.totalOrders ??
                    null;
                  const revenue =
                    item.revenue ??
                    item.total_revenue ??
                    item.totalRevenue ??
                    null;
                  const stock = getStockStatus(item);

                  return (
                    <div
                      key={item._id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] w-full bg-slate-100">
                        {item.media?.featuredImages ||
                        (item.media as any)?.galleryImages?.[0] ? (
                          <Image
                            src={
                              item.media?.featuredImages ||
                              (item.media as any).galleryImages[0]
                            }
                            alt={name || ""}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400">
                            <Package className="h-10 w-10" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col gap-2 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/${locale}/admin/products/details/${item._id}`}
                              className="line-clamp-2 font-semibold text-slate-900 transition-colors hover:text-primary"
                            >
                              {name || "—"}
                            </Link>
                            <p className="mt-1 text-xs text-slate-500">
                              SKU: {sku}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <Link
                              href={`/${locale}/admin/products/${item._id}`}
                              className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                              aria-label={isAr ? "تعديل" : "Edit"}
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => {}}
                              className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                              aria-label={isAr ? "نسخ" : "Copy"}
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                              aria-label={isAr ? "حذف" : "Delete"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100">
                            {getCategoryName(item, locale, categoryMap) || "—"}
                          </span>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-slate-200/80">
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${stock.dot === "green" ? "bg-emerald-500" : stock.dot === "red" ? "bg-rose-500" : "bg-amber-500"}`}
                            />
                            {stock.label}
                          </span>
                        </div>

                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                          <p className="font-semibold tabular-nums text-slate-900">
                            {price != null ? formatPrice(price, locale) : "—"}
                          </p>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={item.approved}
                              onClick={() => handleToggleApprove(item)}
                              disabled={approvingId === item._id}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 disabled:opacity-50 ${
                                item.approved
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-slate-200 bg-slate-100"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                                  item.approved
                                    ? "translate-x-5"
                                    : "translate-x-0.5"
                                }`}
                              />
                            </button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                >
                                  {publishStatus[item._id] ?? "Published"}
                                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="start"
                                className="w-36 rounded-xl border-slate-200/80 shadow-lg"
                              >
                                <DropdownMenuItem
                                  className="rounded-lg"
                                  onClick={() =>
                                    setPublishStatus(
                                      (
                                        s: Record<
                                          string,
                                          "Published" | "Draft"
                                        >,
                                      ) => ({
                                        ...s,
                                        [item._id]: "Published",
                                      }),
                                    )
                                  }
                                >
                                  Published
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="rounded-lg"
                                  onClick={() =>
                                    setPublishStatus(
                                      (
                                        s: Record<
                                          string,
                                          "Published" | "Draft"
                                        >,
                                      ) => ({
                                        ...s,
                                        [item._id]: "Draft",
                                      }),
                                    )
                                  }
                                >
                                  Draft
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <p className="pt-2 text-xs text-slate-500">
                          {isAr ? "تاريخ الإنشاء:" : "Created:"}{" "}
                          {formatCreatedAt(item.createdAt, locale)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-5 py-3">
                <Pagination
                  currentPage={safePage}
                  totalItems={filteredProducts.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            </>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1400px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-800">
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "المنتج" : "Product"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "تاريخ الإنشاء" : "Created at"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "البائع" : "Seller"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "الفئة" : "Category"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "الفئة الفرعية" : "Subcategory"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "الفئة الفرعية للطفل" : "Child Category"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "السعر" : "Price"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "الطلبات" : "Orders"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "الإيراد" : "Revenue"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "المخزون" : "Stock"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "الحالة" : "Status"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "النشر" : "Publish"}
                      </th>
                      <th className="whitespace-nowrap px-5 py-3.5">
                        {isAr ? "إجراءات" : "Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedProducts.map((item) => {
                      const name = isAr
                        ? item.nameAr || item.nameEn
                        : item.nameEn || item.nameAr;
                      const sku =
                        item.sku ??
                        item.identity?.sku ??
                        item._id.slice(-6).toUpperCase();
                      const salePrice =
                        item.sale_price ??
                        item.salePrice ??
                        item.pricing?.salePrice ??
                        item.pricing?.sale_price;
                      const originalPrice =
                        item.price ??
                        item.original_price ??
                        item.originalPrice ??
                        item.pricing?.originalPrice ??
                        item.pricing?.original_price ??
                        item.del_price;
                      const price =
                        salePrice && Number(salePrice) > 0
                          ? salePrice
                          : originalPrice;

                      const orders =
                        item.orders ??
                        item.total_orders ??
                        item.totalOrders ??
                        null;
                      const revenue =
                        item.revenue ??
                        item.total_revenue ??
                        item.totalRevenue ??
                        null;
                      const stock = getStockStatus(item);
                      return (
                        <tr
                          key={item._id}
                          className="border-b border-slate-50/80 transition-colors duration-150 hover:bg-slate-50/50"
                        >
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/50">
                                {item.media?.featuredImages ||
                                (item.media as any)?.galleryImages?.[0] ? (
                                  <Image
                                    src={
                                      item.media?.featuredImages ||
                                      (item.media as any).galleryImages[0]
                                    }
                                    alt={name || ""}
                                    fill
                                    className="object-cover"
                                    sizes="44px"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                                    <Package className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/${locale}/admin/products/details/${item._id}`}
                                  className="font-semibold text-slate-900 transition-colors hover:text-primary"
                                >
                                  {name || "—"}
                                </Link>
                                <p className="text-xs text-slate-500">
                                  SKU: {sku}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-xs text-slate-600">
                            {formatCreatedAt(item.createdAt, locale)}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200/70">
                                {getInitials(getSellerName(item, sellerMap))}
                              </div>
                              <span className="min-w-0 truncate">
                                {getSellerName(item, sellerMap)}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700 ring-1 ring-sky-100">
                              {getCategoryName(item, locale, categoryMap) ||
                                "—"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80">
                              {getSubCategoryName(
                                item,
                                locale,
                                subCategoryMap,
                              ) || "—"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <span className="inline-flex rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80">
                              {getChildCategoryName(
                                item,
                                locale,
                                childCategoryMap,
                              ) || "—"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 font-medium tabular-nums text-slate-900">
                            {price != null ? formatPrice(price, locale) : "—"}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 tabular-nums text-slate-700">
                            {orders != null
                              ? formatNumber(orders, locale)
                              : "—"}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 font-medium tabular-nums text-slate-900">
                            {revenue != null
                              ? formatCurrency(revenue, locale)
                              : "—"}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-slate-200/80">
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${stock.dot === "green" ? "bg-emerald-500" : stock.dot === "red" ? "bg-rose-500" : "bg-amber-500"}`}
                              />
                              {stock.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={item.approved}
                              onClick={() => handleToggleApprove(item)}
                              disabled={approvingId === item._id}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:ring-offset-2 disabled:opacity-50 ${
                                item.approved
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-slate-200 bg-slate-100"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition ${
                                  item.approved
                                    ? "translate-x-5"
                                    : "translate-x-0.5"
                                }`}
                              />
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                >
                                  {publishStatus[item._id] ?? "Published"}
                                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="start"
                                className="w-36 rounded-xl border-slate-200/80 shadow-lg"
                              >
                                <DropdownMenuItem
                                  className="rounded-lg"
                                  onClick={() =>
                                    setPublishStatus((s) => ({
                                      ...s,
                                      [item._id]: "Published",
                                    }))
                                  }
                                >
                                  Published
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="rounded-lg"
                                  onClick={() =>
                                    setPublishStatus((s) => ({
                                      ...s,
                                      [item._id]: "Draft",
                                    }))
                                  }
                                >
                                  Draft
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5">
                            <div className="flex items-center gap-1">
                              <Link
                                href={`/${locale}/admin/products/${item._id}`}
                                className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                                aria-label={isAr ? "تعديل" : "Edit"}
                              >
                                <Pencil className="h-4 w-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => {}}
                                className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                                aria-label={isAr ? "نسخ" : "Copy"}
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item)}
                                className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                                aria-label={isAr ? "حذف" : "Delete"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-5 py-3">
                <Pagination
                  currentPage={safePage}
                  totalItems={filteredProducts.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => !isDeleting && setShowDeleteConfirm(false)}
        size="sm"
      >
        <div className="p-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <Trash2 size={24} strokeWidth={2.5} />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-black text-gray-900">
              {isAr ? "حذف المنتج؟" : "Delete Product?"}
            </h3>
            <p className="mt-2 text-sm font-medium text-gray-500">
              {isAr
                ? `هل أنت متأكد من حذف "${productToDelete?.nameAr || productToDelete?.nameEn}"؟ لا يمكن التراجع عن هذا الإجراء.`
                : `Are you sure you want to delete "${productToDelete?.nameEn || productToDelete?.nameAr}"? This action cannot be undone.`}
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="h-10 rounded-xl border-gray-100 text-xs font-black"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="h-10 rounded-xl bg-rose-600 text-xs font-black text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 hover:shadow-rose-300 active:scale-[0.98] disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isAr ? "تأكيد الحذف" : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
