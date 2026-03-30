"use client";

import React, { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Link } from "@/i18n/navigation";
import {
  ChevronDown,
  Copy,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";

// Types & Data
import { Discount } from "@/types/product";
import { getDiscounts, deleteDiscount } from "@/services/discountService";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Loading from "@/app/[locale]/loading";
import { useRouter } from "next/navigation";

function hashToNumber(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++)
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash;
}

function titleFromCode(code: string) {
  const s = code
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase();
  return s
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

function formatNumber(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc).format(value);
}

function formatCurrency(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.DateTimeFormat(loc, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function DiscountsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Discount["status"]>(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<
    "all" | Discount["discountType"]
  >("all");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const router = useRouter();

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDiscounts = React.useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getDiscounts(token);
      setDiscounts(data);
    } catch (error) {
      console.error("Failed to fetch discounts:", error);
      toast.error(isArabic ? "فشل تحميل الخصومات" : "Failed to load discounts");
    } finally {
      setIsLoading(false);
    }
  }, [token, isArabic]);

  React.useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } pointer-events-auto flex w-full max-w-md rounded-2xl border border-rose-100 bg-white shadow-2xl ring-1 ring-black/5`}
      >
        <div className="w-0 flex-1 p-5">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-inner">
                <Trash2 size={24} />
              </div>
            </div>
            <div className={`ml-4 flex-1 ${isArabic ? "mr-4 text-right" : ""}`}>
              <p className="text-sm font-black text-slate-900">
                {isArabic ? "تأكيد الحذف" : "Confirm Deletion"}
              </p>
              <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">
                {isArabic
                  ? "هل أنت متأكد من حذف هذا الخصم؟ لا يمكن التراجع عن هذا الإجراء."
                  : "Are you sure you want to delete this discount? This action cannot be undone."}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col border-l border-slate-100">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await deleteDiscount(id, token);
                toast.success(
                  isArabic ? "تم حذف الخصم بنجاح" : "Discount deleted successfully",
                );
                fetchDiscounts();
              } catch (error) {
                console.error("Delete failed:", error);
                toast.error(
                  isArabic ? "فشل حذف الخصم" : "Failed to delete discount",
                );
              }
            }}
            className="flex w-full items-center justify-center rounded-none rounded-tr-2xl border border-transparent p-4 text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 focus:outline-none"
          >
            {isArabic ? "حذف" : "Delete"}
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex w-full items-center justify-center rounded-none rounded-br-2xl border border-transparent p-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 focus:outline-none"
          >
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
        </div>
      </div>
    ));
  };

  const rows = useMemo(() => {
    return discounts.map((d) => {
      const h = hashToNumber(`discount:${d.id}:${d.discountCode}`);
      // Usage info might not be in API yet, use placeholders or derive if possible
      const usageLimit = (d as any).isUnlimited ? undefined : 1000;
      const usedCount = (d as any).usedCount || 0;

      const name = d.discountName;

      const typeLabel =
        d.discountType === "percentage"
          ? `${d.discountValue}% Off`
          : d.discountType === "fixed"
            ? `$${d.discountValue} Fixed`
            : isArabic
              ? "شحن مجاني"
              : "Free Shipping";

      const expiryLabel = d.active
        ? formatDate(d.endDate, locale)
        : isArabic
          ? "غير نشط"
          : "Inactive";

      const usageLabel =
        usageLimit == null
          ? `${formatNumber(usedCount, locale)} / ∞`
          : `${formatNumber(usedCount, locale)} / ${formatNumber(usageLimit, locale)}`;

      return {
        ...d,
        name,
        typeLabel,
        usedCount,
        usageLimit,
        usageLabel,
        expiryLabel,
        couponCode: d.discountCode, // sync for UI
      };
    });
  }, [discounts, isArabic, locale]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((d) => {
      const matchesSearch =
        !q ||
        d.couponCode.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        (d.store || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" ? true : d.status === statusFilter;
      const matchesType =
        typeFilter === "all" ? true : d.discountType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [rows, searchQuery, statusFilter, typeFilter]);

  const totals = useMemo(() => {
    const activeCount = rows.filter((d) => d.status === "active").length;
    const totalRedemptions = rows.reduce(
      (acc, d) => acc + (d.usedCount ?? 0),
      0,
    );
    const revenueSaved = rows.reduce((acc, d) => {
      const val = d.value ?? d.discountValue ?? 0;
      const unit =
        d.discountType === "percentage"
          ? Math.max(1, val) * 2.3
          : d.discountType === "shipping"
            ? Math.max(1, val)
            : Math.max(1, val);
      return acc + (d.usedCount ?? 0) * unit;
    }, 0);
    return { activeCount, totalRedemptions, revenueSaved };
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const paged = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, safePage]);

  const onReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setPage(1);
  };
  if (isLoading) return <Loading />;

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Tag className="h-3.5 w-3.5" />
            </span>
            <span>{isArabic ? "إدارة الخصومات" : "Manage Discounts"}</span>
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {isArabic ? "العروض" : "Promotions"}
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {isArabic
              ? "إدارة وتتبع الحملات الترويجية وخصومات الجملة."
              : "Manage and track your promotional campaigns and wholesale discounts."}
          </p>
        </div>

        <Link
          href="/admin/discounts/create"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          {isArabic ? "إنشاء خصم جديد" : "Create New Discount"}
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: isArabic ? "الخصومات النشطة" : "Active Discounts",
            value: formatNumber(totals.activeCount, locale),
            delta: "+2%",
            tone: "emerald",
          },
          {
            label: isArabic ? "إجمالي مرات الاستخدام" : "Total Redemptions",
            value: formatNumber(totals.totalRedemptions, locale),
            delta: "+15%",
            tone: "emerald",
          },
          {
            label: isArabic ? "قيمة التوفير" : "Revenue Saved",
            value: formatCurrency(totals.revenueSaved, locale),
            delta: "+10%",
            tone: "emerald",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
          >
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-emerald-500/5" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <Tag className="h-5 w-5" />
              </div>
              <div className="text-xs font-extrabold text-emerald-700">
                {k.delta}
              </div>
            </div>
            <div className="mt-4 text-sm font-semibold text-slate-500">
              {k.label}
            </div>
            <div className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as any);
                  setPage(1);
                }}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">
                  {isArabic ? "كل الحالات" : "All Statuses"}
                </option>
                <option value="active">{isArabic ? "نشط" : "Active"}</option>
                <option value="scheduled">
                  {isArabic ? "مجدول" : "Scheduled"}
                </option>
                <option value="expired">
                  {isArabic ? "منتهي" : "Expired"}
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>

            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as any);
                  setPage(1);
                }}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">
                  {isArabic ? "كل الأنواع" : "All Types"}
                </option>
                <option value="percentage">
                  {isArabic ? "نسبة" : "Percentage"}
                </option>
                <option value="fixed">{isArabic ? "ثابت" : "Fixed"}</option>
                <option value="shipping">
                  {isArabic ? "شحن" : "Shipping"}
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>

            <button
              type="button"
              onClick={onReset}
              className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              {isArabic ? "إعادة تعيين" : "Reset"}
            </button>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder={
                isArabic
                  ? "ابحث باسم الخصم أو الكود..."
                  : "Search discount name or code..."
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">
                  {isArabic ? "اسم الخصم" : "Discount Name"}
                </th>
                <th className="px-5 py-3">{isArabic ? "النوع" : "Type"}</th>
                <th className="px-5 py-3">{isArabic ? "الكود" : "Code"}</th>
                <th className="px-5 py-3">
                  {isArabic ? "الاستخدام" : "Usage"}
                </th>
                <th className="px-5 py-3">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-5 py-3">
                  {isArabic ? "تاريخ الانتهاء" : "Expiry Date"}
                </th>
                <th className="px-5 py-3 text-right">
                  {isArabic ? "الإجراءات" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody>
              {paged.map((d) => {
                const statusTone =
                  d.status === "active"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                    : d.status === "scheduled"
                      ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                      : "bg-slate-100 text-slate-500 ring-1 ring-slate-200";
                const codeTone =
                  d.status === "expired"
                    ? "bg-slate-100 text-slate-500"
                    : "bg-emerald-50 text-emerald-700";

                return (
                  <tr
                    key={d.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40"
                  >
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900">
                        {(d as any).name}
                      </div>
                      <div className="mt-1 text-xs font-medium text-slate-500">
                        {d.description || d.store}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {(d as any).typeLabel}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-lg px-2 py-1 text-xs font-extrabold ${codeTone}`}
                        >
                          {d.couponCode}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(d.couponCode)
                          }
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          aria-label="Copy code"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {(d as any).usageLabel}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${statusTone}`}
                      >
                        {d.status === "active"
                          ? isArabic
                            ? "نشط"
                            : "Active"
                          : d.status === "scheduled"
                            ? isArabic
                              ? "مجدول"
                              : "Scheduled"
                            : isArabic
                              ? "منتهي"
                              : "Expired"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                      {(d as any).expiryLabel}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/discounts/edit/${encodeURIComponent(d.id)}`}
                          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label="Edit discount"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            navigator.clipboard.writeText(d.couponCode)
                          }
                          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label="Copy discount"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(d.id)}
                          className="rounded-xl p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete discount"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {paged.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center">
                    <div className="text-sm font-extrabold text-slate-900">
                      {isArabic ? "لا توجد خصومات" : "No discounts found"}
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-500">
                      {isArabic
                        ? "جرّب تغيير الفلاتر أو البحث."
                        : "Try changing filters or search."}
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium text-slate-500">
            {isArabic
              ? `عرض ${(safePage - 1) * itemsPerPage + 1} - ${Math.min(
                  safePage * itemsPerPage,
                  filtered.length,
                )} من ${filtered.length}`
              : `Showing ${(safePage - 1) * itemsPerPage + 1}-${Math.min(
                  safePage * itemsPerPage,
                  filtered.length,
                )} of ${filtered.length} discounts`}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isArabic ? "السابق" : "Previous"}
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isArabic ? "التالي" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
