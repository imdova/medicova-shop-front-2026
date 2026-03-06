"use client";

import { use, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  Calendar,
  ChevronDown,
  Eye,
  Package,
  Pencil,
  Search,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { LanguageType } from "@/util/translations";
import { Product, ProductCollection } from "@/types/product";
import { ProductCollections } from "@/constants/productCollection";
import { products as allProducts } from "@/data";

function formatNumber(value: number, locale: LanguageType) {
  return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(
    value,
  );
}

function hashToNumber(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function formatCurrency(value: number, locale: LanguageType) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getCategoryLabel(p: Product, locale: LanguageType) {
  const title = p.category?.title?.[locale] || p.category?.title?.en;
  if (!title) return locale === "ar" ? "—" : "—";
  return title;
}

export default function CollectionOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const locale = useAppLocale();
  const isAr = locale === "ar";

  const collection = ProductCollections.find((c) => c.id === slug) ?? null;

  if (!collection) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <p className="text-slate-600">
          {isAr ? "المجموعة غير موجودة" : "Collection not found"}
        </p>
      </div>
    );
  }

  const name = collection.name[locale] || collection.name.en;
  const description =
    collection.description?.[locale] ||
    collection.description?.en ||
    (isAr ? "—" : "—");

  // Match the reference design (stable demo numbers)
  const totalProducts = 42;
  const totalViews = 12405;
  const addToCarts = 856;

  const displayStatus =
    collection.status === "published"
      ? isAr
        ? "نشط"
        : "ACTIVE"
      : isAr
        ? "مسودة"
        : "DRAFT";

  const [productSearch, setProductSearch] = useState("");
  const visibleProducts = useMemo(() => {
    const pool: Product[] = [...(collection.products ?? [])];
    for (const p of allProducts) {
      if (pool.length >= 8) break;
      if (!pool.some((x) => x.id === p.id)) pool.push(p);
    }
    const q = productSearch.trim().toLowerCase();
    const filtered = !q
      ? pool
      : pool.filter((p) => {
          const title = p.title?.[locale] || p.title?.en || "";
          const sku = p.sku || "";
          return (
            title.toLowerCase().includes(q) || sku.toLowerCase().includes(q)
          );
        });
    return filtered.slice(0, 3);
  }, [collection.products, locale, productSearch]);

  const t = {
    breadcrumbsAdmin: isAr ? "المدير" : "ADMIN",
    breadcrumbsCollections: isAr ? "المجموعات" : "COLLECTIONS",
    preview: isAr ? "معاينة" : "Preview",
    editCollection: isAr ? "تعديل المجموعة" : "Edit Collection",
    totalProducts: isAr ? "إجمالي المنتجات" : "Total Products",
    totalViews: isAr ? "إجمالي المشاهدات" : "Total Views",
    addToCarts: isAr ? "إضافة إلى السلة" : "Add-to-Carts",
    addProducts: isAr ? "إضافة منتجات إلى المجموعة" : "Add Products to Collection",
    quickAdd: isAr ? "إضافة سريعة" : "Quick Add",
    currentProducts: isAr ? "المنتجات الحالية" : "Current Products",
    recentlyAdded: isAr ? "أضيف مؤخراً" : "Recently Added",
    product: isAr ? "المنتج" : "PRODUCT",
    category: isAr ? "الفئة" : "CATEGORY",
    price: isAr ? "السعر" : "PRICE",
    actions: isAr ? "إجراءات" : "ACTIONS",
    collectionDetails: isAr ? "تفاصيل المجموعة" : "Collection Details",
    descriptionLabel: isAr ? "الوصف" : "DESCRIPTION",
    visibilityLabel: isAr ? "الظهور" : "VISIBILITY",
    visibilityValue: isAr ? "عام - واجهة المتجر" : "Public - Storefront",
    scheduling: isAr ? "الجدولة" : "Scheduling",
    startsOn: isAr ? "يبدأ في" : "STARTS ON",
    endsOn: isAr ? "ينتهي في" : "ENDS ON",
    showing: isAr ? "عرض" : "Showing",
    of: isAr ? "من" : "of",
    productsWord: isAr ? "منتج" : "products",
    previous: isAr ? "السابق" : "Previous",
    next: isAr ? "التالي" : "Next",
    searchProductsPlaceholder: isAr
      ? "ابحث بالاسم، SKU أو وسم..."
      : "Search products by name, SKU or tag...",
  };

  return (
    <div
      className="animate-in fade-in min-h-screen bg-[#F6F7F6] duration-300"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="mx-auto max-w-[1200px] space-y-6 p-4 md:p-8">
        {/* Breadcrumbs (exact style) */}
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          <span className="text-slate-400">{t.breadcrumbsAdmin}</span>
          <span className="mx-2 text-slate-300">/</span>
          <Link
            href="/admin/product-collections"
            className="text-slate-400 hover:text-emerald-700"
          >
            {t.breadcrumbsCollections}
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-500">{name}</span>
        </div>

        {/* Title row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              {name}
            </h1>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-100">
              {displayStatus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              {t.preview}
            </button>
            <Link
              href={`/admin/product-collections/edit/${collection.id}`}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              {t.editCollection}
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50"
              aria-label={isAr ? "حذف" : "Delete"}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* KPI cards (icon left like design) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: t.totalProducts,
              value: formatNumber(totalProducts, locale),
              icon: Package,
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-700",
            },
            {
              label: t.totalViews,
              value: formatNumber(totalViews, locale),
              icon: Eye,
              iconBg: "bg-blue-50",
              iconColor: "text-blue-700",
            },
            {
              label: t.addToCarts,
              value: formatNumber(addToCarts, locale),
              icon: ShoppingBag,
              iconBg: "bg-orange-50",
              iconColor: "text-orange-700",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} ${card.iconColor}`}
                >
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-600">
                    {card.label}
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-4">
            {/* Cover image card */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="relative h-64 w-full">
                <Image
                  src={collection.image}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 360px, 100vw"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 400' fill='%23e2e8f0'%3E%3Crect width='600' height='400'/%3E%3C/svg%3E";
                  }}
                />
              </div>
              {/* ribbon */}
              <div
                className="absolute left-0 top-0 h-0 w-0 border-b-[44px] border-l-[44px] border-b-transparent border-l-emerald-600"
                aria-hidden
              />
            </div>

            {/* Collection Details */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900">
                {t.collectionDetails}
              </h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {t.descriptionLabel}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">{description}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    {t.visibilityLabel}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {t.visibilityValue}
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-900">
                {t.scheduling}
              </h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/40 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      {t.startsOn}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      June 01, 2024
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/40 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      {t.endsOn}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-800">
                      Aug 31, 2024
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-8">
            {/* Add Products to Collection */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="p-5">
                <h3 className="text-base font-extrabold text-slate-900">
                  {t.addProducts}
                </h3>
              </div>
              <div className="border-t border-slate-100 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder={t.searchProductsPlaceholder}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    {t.quickAdd}
                  </button>
                </div>
              </div>
            </div>

            {/* Current Products */}
            <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 p-5">
                <h3 className="text-base font-extrabold text-slate-900">
                  {t.currentProducts} ({totalProducts})
                </h3>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  {t.recentlyAdded}
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              <div className="border-t border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3">{t.product}</th>
                        <th className="px-5 py-3">{t.category}</th>
                        <th className="px-5 py-3">{t.price}</th>
                        <th className="px-5 py-3 text-right">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProducts.map((p) => {
                        const title = p.title?.[locale] || p.title?.en || "—";
                        const sku = p.sku || "—";
                        const category = getCategoryLabel(p, locale);
                        const img = p.images?.[0];
                        return (
                          <tr
                            key={p.id}
                            className="border-t border-slate-50/80 hover:bg-slate-50/50"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-12 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                                  {img ? (
                                    <Image
                                      src={img}
                                      alt={title}
                                      width={48}
                                      height={40}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900">
                                    {title}
                                  </p>
                                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                                    SKU: {sku}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                                {category}
                              </span>
                            </td>
                            <td className="px-5 py-4 font-semibold text-slate-900">
                              {formatCurrency(p.price ?? 0, locale)}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                                aria-label={isAr ? "إزالة" : "Remove"}
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-medium text-slate-500">
                    {t.showing} {visibleProducts.length} {t.of} {totalProducts}{" "}
                    {t.productsWord}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      {t.previous}
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      {t.next}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
