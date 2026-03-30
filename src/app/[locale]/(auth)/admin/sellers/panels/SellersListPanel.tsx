"use client";

import { Sellers } from "@/constants/sellers";
import { LanguageType } from "@/util/translations";
import Avatar from "@/components/shared/Avatar";
import { Link } from "@/i18n/navigation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, Eye, Search, Star, Loader2, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getAdminSellers,
  Seller,
  deleteSeller,
} from "@/services/sellerService";
import { MultiCategory } from "@/types";
import { toast } from "react-hot-toast";
import { getProducts, ApiProduct } from "@/services/productService";
import { useSession } from "next-auth/react";

function hashToNumber(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++)
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash;
}

function formatCurrency(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc).format(value);
}

export default function SellersListPanel({ locale }: { locale: LanguageType }) {
  const isAr = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = (searchParams.get("status") || "") as
    | ""
    | "active"
    | "pending"
    | "suspended";
  const page = Number(searchParams.get("page") || "1") || 1;
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [sellersData, productsData] = await Promise.all([
        getAdminSellers(token),
        getProducts(token),
      ]);
      setSellers(sellersData);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(
        isAr
          ? `هل أنت متأكد من حذف البائع ${name}؟`
          : `Are you sure you want to delete seller ${name}?`,
      )
    ) {
      return;
    }

    try {
      await deleteSeller(id, token);
      toast.success(
        isAr ? "تم حذف البائع بنجاح" : "Seller deleted successfully",
      );
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Failed to delete seller:", error);
      toast.error(isAr ? "فشل حذف البائع" : "Failed to delete seller");
    }
  };
  const derived = useMemo(() => {
    return sellers.map((s: any) => {
      const seed = hashToNumber(`${s.id}-${s.name}`);

      // Dynamic priority
      const derivedStatus: "active" | "pending" | "suspended" =
        s.status || (s.isActive === false ? "suspended" : "active");

      const sellerCode =
        s.sellerCode || `#SEL-${String(81000 + (seed % 9000))}`;

      const totalSales = Number(s.sales || 0);

      // Calculate dynamic products count from products list
      const dynamicProductsCount = products.filter((p) => {
        const productSellerId =
          p.sellerId ||
          (typeof p.seller === "object"
            ? p.seller?._id || (p.seller as any)?.id
            : p.seller);

        // Match against seller ID
        if (productSellerId === s.id) return true;

        // Fallback match: if product.store or product.createdBy matches s.id
        if (p.store === s.id || p.createdBy === s.id) return true;

        return false;
      }).length;

      const productsCount = Math.max(
        dynamicProductsCount,
        s.productsCount || 0,
      );

      return {
        ...s,
        derivedStatus,
        sellerCode,
        totalSales,
        productsCount,
        commission: Number(s.commission || 0),
      };
    });
  }, [sellers, products]);

  const counts = useMemo(() => {
    return derived.reduce(
      (acc, s) => {
        acc.total += 1;
        acc[s.derivedStatus] += 1;
        return acc;
      },
      { total: 0, active: 0, pending: 0, suspended: 0 },
    );
  }, [derived]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return derived.filter((s) => {
      if (status !== "" && s.derivedStatus !== status) return false;
      if (!query) return true;
      return (
        s.name.toLowerCase().includes(query) ||
        s.sellerCode.toLowerCase().includes(query)
      );
    });
  }, [derived, q, status]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const pageRows = filtered.slice(startIndex, startIndex + itemsPerPage);

  const setParam = (key: string, value?: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (!value) p.delete(key);
    else p.set(key, value);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  return (
    <div className="space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: isAr ? "إجمالي البائعين" : "Total Sellers",
            value: loading ? "..." : formatNumber(counts.total, locale),
            iconBg: "bg-emerald-50",
            iconTone: "text-emerald-700",
          },
          {
            title: isAr ? "توثيق قيد الانتظار" : "Pending Verifications",
            value: loading ? "..." : formatNumber(counts.pending, locale),
            iconBg: "bg-amber-50",
            iconTone: "text-amber-700",
          },
          {
            title: isAr ? "أفضل المؤدين" : "Top Performers",
            value: loading
              ? "..."
              : formatNumber(
                  derived.filter((s) => (s.rating || 0) >= 4).length,
                  locale,
                ),
            iconBg: "bg-emerald-50",
            iconTone: "text-emerald-700",
          },
          {
            title: isAr ? "إجمالي العمولة" : "Total Commission",
            value: loading
              ? "..."
              : formatCurrency(
                  derived.reduce((sum, s) => sum + (s.commission || 0), 0),
                  locale,
                ),
            iconBg: "bg-emerald-50",
            iconTone: "text-emerald-700",
          },
        ].map((c, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                {c.title}
              </div>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.iconBg} ${c.iconTone}`}
              >
                <Star className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search + status tabs */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isAr ? "ابحث عن بائع..." : "Search sellers..."}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/40 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none ring-emerald-100 focus:bg-white focus:ring-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-2xl bg-slate-50 p-1 ring-1 ring-slate-200">
              {[
                {
                  id: "",
                  label: isAr ? "كل البائعين" : "All Sellers",
                  count: counts.total,
                },
                {
                  id: "active",
                  label: isAr ? "نشط" : "Active",
                  count: counts.active,
                },
                {
                  id: "pending",
                  label: isAr ? "قيد الانتظار" : "Pending",
                  count: counts.pending,
                },
                {
                  id: "suspended",
                  label: isAr ? "موقوف" : "Suspended",
                  count: counts.suspended,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setParam("status", t.id as any)}
                  className={[
                    "inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition",
                    status === t.id
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-white hover:text-slate-700",
                  ].join(" ")}
                >
                  {t.label}
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] font-black",
                      status === t.id
                        ? "bg-white/20 text-white"
                        : "bg-white text-slate-600 ring-1 ring-slate-200",
                    ].join(" ")}
                  >
                    {loading ? "..." : t.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="whitespace-nowrap px-5 py-3">
                  {isAr ? "اسم البائع" : "Seller Name"}
                </th>
                <th className="whitespace-nowrap px-5 py-3">
                  {isAr ? "بايانات التواصل" : "Contact Info"}
                </th>
                <th className="whitespace-nowrap px-5 py-3">
                  {isAr ? "الموقع" : "Location"}
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-center">
                  {isAr ? "إجمالي المنتجات" : "Total Products"}
                </th>
                <th className="whitespace-nowrap px-5 py-3 text-center">
                  {isAr ? "المبيعات" : "Sales"}
                </th>
                <th className="whitespace-nowrap px-5 py-3">
                  {isAr ? "الحالة" : "Status"}
                </th>
                <th className="whitespace-nowrap px-5 py-3">
                  {isAr ? "إجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                      <p className="text-sm font-bold text-slate-500">
                        {isAr ? "جاري تحميل البيانات..." : "Loading sellers..."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : pageRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-20 text-center text-sm font-semibold text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-10 w-10 text-slate-200" />
                      <p>{isAr ? "لا توجد نتائج" : "No results found"}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((s: any) => {
                  const statusBadge =
                    s.derivedStatus === "active"
                      ? {
                          bg: "bg-emerald-50",
                          ring: "ring-emerald-100",
                          text: "text-emerald-700",
                          label: isAr ? "نشط" : "Active",
                        }
                      : s.derivedStatus === "pending"
                        ? {
                            bg: "bg-amber-50",
                            ring: "ring-amber-100",
                            text: "text-amber-700",
                            label: isAr ? "قيد الانتظار" : "Pending",
                          }
                        : {
                            bg: "bg-rose-50",
                            ring: "ring-rose-100",
                            text: "text-rose-700",
                            label: isAr ? "موقوف" : "Suspended",
                          };

                  return (
                    <tr
                      key={s.id}
                      className="border-t border-slate-100 hover:bg-slate-50/40"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <Link
                          href={`/admin/sellers/${encodeURIComponent(s.id)}`}
                          className="group flex items-center gap-3"
                          title={
                            isAr ? "فتح تفاصيل البائع" : "Open seller details"
                          }
                        >
                          <Avatar
                            className="h-11 w-11 rounded-2xl border border-white shadow-sm ring-1 ring-slate-100"
                            imageUrl={s.image}
                            name={s.name}
                          />
                          <div className="min-w-0">
                            <div className="block text-sm font-extrabold text-slate-900 underline-offset-4 group-hover:text-emerald-700 group-hover:underline">
                              {s.name}
                            </div>
                            <div className="mt-0.5 text-[11px] font-semibold text-slate-500">
                              ID: {s.sellerCode}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <span className="text-slate-300">✉</span>
                            <span>{s.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <span className="text-slate-300">☎</span>
                            <span>{s.phone || "N/A"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                          <span className="text-slate-300">⌁</span>
                          <span>
                            {s.city}, {s.country}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <Link
                          href={`/${locale}/admin/products?sellerId=${s.id}`}
                          className="text-sm font-extrabold text-slate-900 transition-colors hover:text-emerald-700 hover:underline"
                        >
                          {formatNumber(s.productsCount ?? 0, locale)}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-extrabold text-slate-900">
                            {formatNumber(s.totalSales ?? 0, locale)} {isAr ? "جنيه" : "EGP"}
                          </span>
                          {s.rating > 0 && (
                            <div className="flex items-center gap-0.5 text-amber-500">
                              <Star className="h-2.5 w-2.5 fill-current" />
                              <span className="text-[10px] font-bold">
                                {s.rating}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ${statusBadge.bg} ${statusBadge.text} ring-1 ${statusBadge.ring}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${statusBadge.text.replace("text", "bg")}`}
                          />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/sellers/${encodeURIComponent(s.id)}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                            aria-label={isAr ? "عرض" : "View"}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id, s.name)}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-500 transition hover:bg-rose-50"
                            aria-label={isAr ? "حذف" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-medium text-slate-500">
            {isAr
              ? `عرض ${startIndex + 1} إلى ${Math.min(
                  startIndex + itemsPerPage,
                  filtered.length,
                )} من ${formatNumber(filtered.length, locale)} بائع`
              : `Showing ${startIndex + 1} to ${Math.min(
                  startIndex + itemsPerPage,
                  filtered.length,
                )} of ${formatNumber(filtered.length, locale)} sellers`}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                setParam("page", String(Math.max(1, safePage - 1)))
              }
              disabled={safePage === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
                onClick={() => setParam("page", String(n))}
                className={[
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-extrabold transition",
                  n === safePage
                    ? "border-emerald-200 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() =>
                setParam("page", String(Math.min(totalPages, safePage + 1)))
              }
              disabled={safePage === totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={isAr ? "التالي" : "Next"}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
