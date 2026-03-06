"use client";

import { Sellers } from "@/constants/sellers";
import { LanguageType } from "@/util/translations";
import Avatar from "@/components/shared/Avatar";
import { Link } from "@/i18n/navigation";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, Filter, Pencil, Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

function hashToNumber(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
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

  const status = (searchParams.get("status") || "active") as
    | "active"
    | "pending"
    | "suspended";
  const page = Number(searchParams.get("page") || "1") || 1;
  const [q, setQ] = useState(searchParams.get("q") || "");

  const derived = useMemo(() => {
    const categories = [
      isAr ? "مستلزمات طبية" : "Medical Supplies",
      isAr ? "معدات" : "Equipments",
      isAr ? "ملابس طبية" : "Scrubs & Apparel",
      isAr ? "أدوية" : "Pharmaceuticals",
    ];

    return Sellers.map((s) => {
      const seed = hashToNumber(`${s.id}-${s.name}`);
      const derivedStatus: "active" | "pending" | "suspended" = s.isActive
        ? seed % 7 === 0
          ? "pending"
          : "active"
        : "suspended";

      const category = categories[seed % categories.length];
      const sellerCode = `#SEL-${String(81000 + (seed % 9000))}`;
      const totalSales = Math.round((8000 + (seed % 52000)) * 100) / 100;
      const rating = Math.max(
        0,
        Math.min(5, (s.rating ? 3.6 + s.rating * 0.22 : 0) + ((seed % 7) / 10)),
      );

      return {
        ...s,
        derivedStatus,
        category,
        sellerCode,
        totalSales,
        rating,
      };
    });
  }, [isAr]);

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
      if (status && s.derivedStatus !== status) return false;
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
            value: formatNumber(counts.total, locale),
            sub: isAr ? "↑ 12% هذا الشهر" : "↑ 12% vs last month",
            iconBg: "bg-emerald-50",
            iconTone: "text-emerald-700",
          },
          {
            title: isAr ? "توثيق قيد الانتظار" : "Pending Verifications",
            value: formatNumber(counts.pending, locale),
            sub: isAr ? "يتطلب إجراء عاجل" : "Needs action: urgent",
            iconBg: "bg-amber-50",
            iconTone: "text-amber-700",
          },
          {
            title: isAr ? "أفضل المؤدين" : "Top Performers",
            value: formatNumber(Math.max(0, counts.active - 1), locale),
            sub: isAr ? "↑ 5% معدل النمو" : "↑ 5% growth rate",
            iconBg: "bg-emerald-50",
            iconTone: "text-emerald-700",
          },
          {
            title: isAr ? "إجمالي العمولة" : "Total Commission",
            value: formatCurrency(
              derived.reduce((sum, s) => sum + s.totalSales * 0.06, 0),
              locale,
            ),
            sub: isAr ? "↑ 18.4% هذا الربع" : "↑ 18.4% this quarter",
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
            <div className="mt-1 text-[11px] font-semibold text-emerald-600">
              {c.sub}
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
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <Filter className="h-4 w-4" />
              {isAr ? "فلتر" : "Filter"}
            </button>

            <div className="flex items-center rounded-2xl bg-slate-50 p-1 ring-1 ring-slate-200">
              {[
                { id: "active", label: isAr ? "نشط" : "Active", count: counts.active },
                { id: "pending", label: isAr ? "قيد الانتظار" : "Pending", count: counts.pending },
                { id: "suspended", label: isAr ? "موقوف" : "Suspended", count: counts.suspended },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setParam("status", t.id)}
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
                      status === t.id ? "bg-white/20 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200",
                    ].join(" ")}
                  >
                    {t.count}
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
                <th className="px-5 py-3">{isAr ? "اسم البائع" : "Seller Name"}</th>
                <th className="px-5 py-3">{isAr ? "بيانات التواصل" : "Contact Info"}</th>
                <th className="px-5 py-3">{isAr ? "الموقع" : "Location"}</th>
                <th className="px-5 py-3">{isAr ? "الأداء" : "Performance"}</th>
                <th className="px-5 py-3">{isAr ? "الفئة" : "Category"}</th>
                <th className="px-5 py-3">{isAr ? "الحالة" : "Status"}</th>
                <th className="px-5 py-3">{isAr ? "التقييم" : "Rating"}</th>
                <th className="px-5 py-3">{isAr ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((s) => {
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
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50/40">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/sellers/${encodeURIComponent(s.id)}`}
                        className="group flex items-center gap-3"
                        title={isAr ? "فتح تفاصيل البائع" : "Open seller details"}
                      >
                        <Avatar
                          className="h-11 w-11 rounded-2xl border border-white shadow-sm ring-1 ring-slate-100"
                          imageUrl={s.image}
                          name={s.name}
                        />
                        <div className="min-w-0">
                          <div className="block truncate text-sm font-extrabold text-slate-900 underline-offset-4 group-hover:text-emerald-700 group-hover:underline">
                            {s.name}
                          </div>
                          <div className="mt-0.5 text-[11px] font-semibold text-slate-500">
                            ID: {s.sellerCode}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <span className="text-slate-300">☎</span>
                        <span>01X-XXXX-XXXX</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
                        <span className="text-slate-300">⌁</span>
                        <span className="line-clamp-1">
                          {s.city}, {s.country}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-slate-900">
                            {formatNumber(s.sales ?? 0, locale)}{" "}
                            {isAr ? "جنيه" : "EGP"}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 ring-1 ring-emerald-100">
                            <span className="text-emerald-600">↗</span>
                            +12%
                          </span>
                        </div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                          {formatNumber(s.products ?? 0, locale)}{" "}
                          {isAr ? "منتجات" : "products"}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-xl bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200">
                        {s.category}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ${statusBadge.bg} ${statusBadge.text} ring-1 ${statusBadge.ring}`}>
                        <span className={`h-2 w-2 rounded-full ${statusBadge.text.replace("text", "bg")}`} />
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {s.rating > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm font-extrabold text-slate-900">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {s.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          {isAr ? "لا يوجد تقييم" : "No ratings yet"}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/sellers/${encodeURIComponent(s.id)}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                          aria-label={isAr ? "عرض" : "View"}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/sellers/${encodeURIComponent(s.id)}?edit=1`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
                          aria-label={isAr ? "تعديل" : "Edit"}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm font-semibold text-slate-500">
                    {isAr ? "لا توجد نتائج" : "No results"}
                  </td>
                </tr>
              ) : null}
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
              onClick={() => setParam("page", String(Math.max(1, safePage - 1)))}
              disabled={safePage === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={isAr ? "السابق" : "Previous"}
            >
              ‹
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((n) => (
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
