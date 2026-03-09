"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle,
  ChevronDown,
  ExternalLink,
  FileStack,
  Filter,
  Layers,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { LanguageType } from "@/util/translations";
import { ProductCollection } from "@/types/product";
import {
  getProductCollections,
  deleteProductCollection,
} from "@/services/productCollectionService";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

function formatDate(dateStr: string, locale: LanguageType) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatNumber(value: number, locale: LanguageType) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(
    value,
  );
}

function formatCurrency(value: number, locale: LanguageType) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function hashToNumber(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// ---------------- Helper Functions ----------------

// Derive seller from first product in collection, or mock from id for display/filter
function getCollectionSellerName(col: ProductCollection): string {
  // 1. Check if collection has a populated sellerId object
  const anyCol = col as any;
  const sellerObj = anyCol.sellerId || anyCol.seller;

  if (sellerObj && typeof sellerObj === "object") {
    // If it's the admin store, return "Admin"
    if (
      sellerObj.brandName?.toLowerCase() === "admin" ||
      sellerObj.name?.toLowerCase() === "admin"
    ) {
      return "Admin";
    }
    return (
      sellerObj.brandName ||
      sellerObj.name ||
      (sellerObj.firstName
        ? `${sellerObj.firstName} ${sellerObj.lastName || ""}`.trim()
        : "") ||
      sellerObj._id ||
      "—"
    );
  }

  // 2. Check first product
  const first = col.products?.[0] as any;
  if (first) {
    // Check if created by admin
    if (first.createdBy === "admin") return "Admin";

    const s = first.sellers ?? first.seller;
    if (s) {
      if (typeof s === "string")
        return s.toLowerCase() === "admin" ? "Admin" : s;

      if (
        s.brandName?.toLowerCase() === "admin" ||
        s.name?.toLowerCase() === "admin"
      ) {
        return "Admin";
      }

      return (
        s.brandName ||
        s.name ||
        (s.firstName ? `${s.firstName} ${s.lastName || ""}`.trim() : "") ||
        ""
      );
    }
    if (first.createdBy)
      return first.createdBy === "admin" ? "Admin" : first.createdBy;
  }

  return "—";
}

// Stats from collection object
function getCollectionOrders(col: ProductCollection): number {
  return col.orders || 0;
}

function getCollectionRevenue(col: ProductCollection): number {
  return col.revenue || 0;
}

// Derive display status: some as "scheduled" for design variety (optional)
function getDisplayStatus(
  item: ProductCollection,
  locale: LanguageType,
): "active" | "scheduled" | "draft" {
  if (item.status === "draft") return "draft";
  // Show "scheduled" for a couple of collections for UI demo
  if (item.id === "COL-002" || item.id === "COL-004") return "scheduled";
  return "active";
}

export default function ProductCollectionsListPanel() {
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const [collections, setCollections] = useState<ProductCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sellerFilter, setSellerFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const { data: session, status } = useSession();
  const token = (session as any)?.accessToken;

  useEffect(() => {
    console.log(
      `DEBUG [CollectionsPage]: Session status: ${status} | Token: ${token ? `${token.substring(0, 10)}...` : "MISSING"}`,
      session,
    );
    if (token) {
      fetchCollections();
    }
  }, [token, session, status]);

  const fetchCollections = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getProductCollections(token);
      setCollections(data);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
      toast.error(
        isAr ? "فشل في تحميل المجموعات" : "Failed to load collections",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        isAr
          ? "هل أنت متأكد من حذف هذه المجموعة؟"
          : "Are you sure you want to delete this collection?",
      )
    ) {
      return;
    }

    try {
      await deleteProductCollection(id, token);
      toast.success(
        isAr ? "تم حذف المجموعة بنجاح" : "Collection deleted successfully",
      );
      fetchCollections();
    } catch (error) {
      console.error("Failed to delete collection:", error);
      toast.error(isAr ? "فشل في حذف المجموعة" : "Failed to delete collection");
    }
  };

  const totalCollections = collections.length;
  const activeCount = collections.filter(
    (c) => c.status === "published",
  ).length;
  const totalProductReach = useMemo(
    () => collections.reduce((sum, c) => sum + (c.products?.length ?? 0), 0),
    [collections],
  );

  const uniqueSellers = useMemo(() => {
    const set = new Set<string>();
    collections.forEach((col) => {
      const name = getCollectionSellerName(col);
      if (name && name !== "—") set.add(name);
    });
    return Array.from(set).sort();
  }, [collections]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return collections.filter((col) => {
      const name = (col.name[locale] || col.name.en).toLowerCase();
      const desc = (
        col.description?.[locale] ||
        col.description?.en ||
        ""
      ).toLowerCase();
      const matchSearch = !q || name.includes(q) || desc.includes(q);
      const displayStatus = getDisplayStatus(col, locale);
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && displayStatus === "active") ||
        (statusFilter === "scheduled" && displayStatus === "scheduled") ||
        (statusFilter === "draft" && displayStatus === "draft");
      const sellerName = getCollectionSellerName(col);
      const matchSeller = !sellerFilter || sellerName === sellerFilter;
      return matchSearch && matchStatus && matchSeller;
    });
  }, [locale, searchQuery, statusFilter, sellerFilter, collections]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (safePage - 1) * itemsPerPage;
  const pageItems = filtered.slice(start, start + itemsPerPage);

  return (
    <div className="animate-in fade-in min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 duration-700">
      <div className="mx-auto max-w-[1440px] space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            {isAr ? "إدارة المجموعات" : "Collection Management"}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:border-slate-300 hover:shadow"
              aria-label={isAr ? "الإشعارات" : "Notifications"}
            >
              <Bell className="h-5 w-5" />
            </button>
            <Link
              href="/admin/product-collections/create"
              className="shadow-primary/25 hover:shadow-primary/30 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
            >
              <span className="text-lg leading-none">+</span>
              {isAr ? "إنشاء مجموعة جديدة" : "Create New Collection"}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              icon: Layers,
              label: isAr ? "إجمالي المجموعات" : "Total Collections",
              value: String(totalCollections),
              accent: "emerald",
              gradient: "from-emerald-500/8 to-emerald-600/4",
              iconBg: "bg-emerald-500/15",
              iconColor: "text-emerald-600",
              ring: "ring-emerald-500/20",
              shadow: "hover:shadow-emerald-500/10",
            },
            {
              icon: CheckCircle,
              label: isAr ? "المجموعات النشطة" : "Active Collections",
              value: String(activeCount),
              accent: "emerald",
              gradient: "from-emerald-500/8 to-emerald-600/4",
              iconBg: "bg-emerald-500/15",
              iconColor: "text-emerald-600",
              ring: "ring-emerald-500/20",
              shadow: "hover:shadow-emerald-500/10",
            },
            {
              icon: FileStack,
              label: isAr ? "إجمالي وصول المنتجات" : "Total Product Reach",
              value: String(totalProductReach),
              accent: "violet",
              gradient: "from-violet-500/8 to-violet-600/4",
              iconBg: "bg-violet-500/15",
              iconColor: "text-violet-600",
              ring: "ring-violet-500/20",
              shadow: "hover:shadow-violet-500/10",
            },
          ].map((card) => (
            <div
              key={card.label}
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
                  card.accent === "emerald" ? "bg-emerald-500" : "bg-violet-500"
                }`}
                aria-hidden
              />
            </div>
          ))}
        </div>

        {/* Search and filters: card container */}
        <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-md">
              <Search
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${isAr ? "right-3" : "left-3"}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={
                  isAr ? "بحث في المجموعات..." : "Search collections..."
                }
                className={`h-11 w-full rounded-xl border border-slate-200/80 bg-slate-50/50 text-[13px] text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${isAr ? "pl-4 pr-10" : "pl-10 pr-4"}`}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <label className="sr-only">{isAr ? "البائع" : "Seller"}</label>
                <select
                  value={sellerFilter}
                  onChange={(e) => {
                    setSellerFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 appearance-none rounded-xl border border-slate-200/80 bg-white pl-4 pr-10 text-[13px] font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">
                    {isAr ? "كل البائعين" : "All Sellers"}
                  </option>
                  {uniqueSellers.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="h-11 appearance-none rounded-xl border border-slate-200/80 bg-white pl-4 pr-10 text-[13px] font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">
                    {isAr ? "كل الحالة" : "All Status"}
                  </option>
                  <option value="active">{isAr ? "نشط" : "Active"}</option>
                  <option value="scheduled">
                    {isAr ? "مجدول" : "Scheduled"}
                  </option>
                  <option value="draft">{isAr ? "مسودة" : "Draft"}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              </div>
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 text-[13px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Filter className="h-4 w-4" />
                {isAr ? "المزيد من الفلاتر" : "More Filters"}
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  <th className="px-5 py-3.5">
                    {isAr ? "المجموعة" : "COLLECTION"}
                  </th>
                  <th className="px-5 py-3.5">{isAr ? "البائع" : "SELLER"}</th>
                  <th className="px-5 py-3.5">
                    {isAr ? "المنتجات" : "PRODUCTS"}
                  </th>
                  <th className="px-5 py-3.5">{isAr ? "الطلبات" : "ORDERS"}</th>
                  <th className="px-5 py-3.5">
                    {isAr ? "الإيراد" : "REVENUE"}
                  </th>
                  <th className="px-5 py-3.5">{isAr ? "الحالة" : "STATUS"}</th>
                  <th className="px-5 py-3.5">
                    {isAr ? "آخر تحديث" : "LAST UPDATED"}
                  </th>
                  <th className="px-5 py-3.5">
                    {isAr ? "إجراءات" : "ACTIONS"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => {
                  const displayStatus = getDisplayStatus(item, locale);
                  const statusConfig =
                    displayStatus === "active"
                      ? {
                          bg: "bg-emerald-50",
                          text: "text-emerald-700",
                          label: isAr ? "نشط" : "Active",
                        }
                      : displayStatus === "scheduled"
                        ? {
                            bg: "bg-indigo-50",
                            text: "text-indigo-700",
                            label: isAr ? "مجدول" : "Scheduled",
                          }
                        : {
                            bg: "bg-slate-100",
                            text: "text-slate-700",
                            label: isAr ? "مسودة" : "Draft",
                          };
                  const name = item.name[locale] || item.name.en;
                  const desc =
                    item.description?.[locale] || item.description?.en || "";
                  const productCount = item.products?.length ?? 0;
                  const sellerName = getCollectionSellerName(item);
                  const orders = getCollectionOrders(item);
                  const revenue = getCollectionRevenue(item);
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-slate-50/80 transition-colors duration-150 hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ring-1 ring-slate-100">
                            <Image
                              src={item.image}
                              alt={name}
                              width={48}
                              height={48}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' fill='%23e2e8f0'%3E%3Crect width='48' height='48'/%3E%3C/svg%3E";
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/product-collections/edit/${item.id}`}
                              className="font-semibold text-slate-900 underline-offset-4 hover:text-emerald-700 hover:underline"
                            >
                              {name}
                            </Link>
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {item.slug || item.link || item.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {sellerName}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-slate-700">
                          <FileStack className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium">
                            {productCount} {isAr ? "منتج" : "Products"}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold tabular-nums text-slate-900">
                          {formatNumber(orders, locale)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatCurrency(revenue, locale)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">
                        {formatDate(item.createdAt, locale)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/product-collections/edit/${item.id}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                            aria-label={isAr ? "تعديل" : "Edit"}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <a
                            href={`/collections/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
                            aria-label={
                              isAr ? "فتح في نافذة جديدة" : "Open in new tab"
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-rose-50 hover:text-rose-700"
                            aria-label={isAr ? "حذف" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                        <span>{isAr ? "جاري التحميل..." : "Loading..."}</span>
                      </div>
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      {isAr ? "لا توجد مجموعات" : "No collections found"}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-semibold text-slate-600">
              {isAr
                ? `عرض ${start + 1} إلى ${Math.min(start + itemsPerPage, filtered.length)} من ${filtered.length} مجموعة`
                : `Showing ${start + 1} to ${Math.min(start + itemsPerPage, filtered.length)} of ${filtered.length} collections`}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                aria-label={isAr ? "السابق" : "Previous"}
              >
                ‹
              </button>
              {Array.from(
                { length: Math.min(3, totalPages) },
                (_, i) => i + 1,
              ).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCurrentPage(n)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-semibold transition ${
                    n === safePage
                      ? "border-emerald-200 bg-emerald-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={safePage === totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                aria-label={isAr ? "التالي" : "Next"}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Promotional banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 px-6 py-8 text-white shadow-xl md:px-8">
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent"
            aria-hidden
          />
          <h2 className="relative text-xl font-bold md:text-2xl">
            {isAr ? "زد ظهورك" : "Grow your visibility"}
          </h2>
          <p className="relative mt-2 max-w-2xl text-sm opacity-95">
            {isAr
              ? "المجموعات المروجة تحصل على مشاهدات أكثر بثلاث مرات من مقدمي الرعاية الصحية والمرافق الطبية."
              : "Promoted collections get 3x more views from healthcare providers and medical facilities."}
          </p>
          <Link
            href="#"
            className="relative mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:scale-[1.02] hover:bg-emerald-50 active:scale-[0.98]"
          >
            {isAr
              ? "اعرف المزيد عن المجموعات المروجة"
              : "Learn About Promoted Collections"}
            <span className="text-emerald-600">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
