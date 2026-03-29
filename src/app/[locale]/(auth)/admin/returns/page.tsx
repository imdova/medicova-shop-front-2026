"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  DollarSign,
  Download,
  FileText,
  Loader2,
  MoreVertical,
  Plus,
  Search,
  X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getReturns, ApiReturn } from "@/services/orderService";
import { getAdminSellers, Seller } from "@/services/sellerService";
import { NextAuthProvider } from "@/NextAuthProvider";
import { Fragment } from "react";

type ReturnStatus = "pending" | "approved" | "refunded" | "rejected";

type ReturnRow = {
  id: string; // e.g. "#RET-4829"
  customerName: string;
  sellerName: string;
  itemLabel: string;
  status: ReturnStatus;
  dateLabel: string;
  rawId: string;
};

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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
}

export default function ReturnsPage() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [returns, setReturns] = useState<ApiReturn[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | ReturnStatus>("all");
  const [dateRange, setDateRange] = useState("last-30");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [page, setPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      try {
        setLoading(true);
        const [returnsData, sellersData] = await Promise.all([
          getReturns(token),
          getAdminSellers(token)
        ]);
        setReturns(returnsData);
        setSellers(sellersData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch returns data:", err);
        setError(err.message || "Failed to load returns data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token]);

  const rows = useMemo<ReturnRow[]>(() => {
    return returns.map((r) => ({
      id: `#${r._id.slice(-6).toUpperCase()}`,
      customerName: r.user?.name || (isArabic ? "عميل غير معروف" : "Unknown Customer"),
      sellerName: r.seller?.name || r.order?.sellerId || (isArabic ? "بائع غير معروف" : "Unknown Seller"),
      itemLabel: r.product?.nameEn || r.productId || (isArabic ? "منتج" : "Product"),
      status: r.status,
      dateLabel: (() => {
        const d = new Date(r.createdAt);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });
      })(),
      rawId: r._id
    }));
  }, [returns, isArabic]);

  const sellerOptions = useMemo(() => {
    // Map to { id, name } to avoid duplicate keys if names are same
    const map = new Map<string, string>();
    sellers.forEach(s => {
      if (s.name && s.id) map.set(s.id, s.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [sellers]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesQuery =
        !query ||
        r.id.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query);
      const matchesStatus = status === "all" ? true : r.status === status;
      const matchesSeller = sellerFilter === "all" ? true : r.sellerName === sellerFilter;
      return matchesQuery && matchesStatus && matchesSeller;
    });
  }, [q, rows, sellerFilter, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, safePage]);

  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const showingTo = Math.min(safePage * itemsPerPage, filtered.length);

  const clearFilters = () => {
    setQ("");
    setStatus("all");
    setDateRange("last-30");
    setSellerFilter("all");
    setPage(1);
  };

  const kpis = useMemo(() => {
    const totalCount = returns.length;
    const pendingCount = returns.filter((r) => r.status === "pending").length;
    const approvedCount = returns.filter((r) => r.status === "approved").length;
    const refundedValue = returns
      .filter((r) => r.status === "refunded")
      .reduce((sum, r) => sum + (r.order?.totalPrice || r.order?.total || 0), 0);

    return [
      {
        label: isArabic ? "إجمالي المرتجعات" : "Total Returns",
        value: formatNumber(totalCount, locale),
        delta: "v-Live",
        icon: ClipboardList,
        tone: "bg-blue-50 text-blue-700 ring-blue-100",
      },
      {
        label: isArabic ? "مراجعة معلّقة" : "Pending Review",
        value: formatNumber(pendingCount, locale),
        delta: isArabic ? "نشط" : "Active",
        icon: FileText,
        tone: "bg-amber-50 text-amber-700 ring-amber-100",
      },
      {
        label: isArabic ? "معتمد" : "Approved",
        value: formatNumber(approvedCount, locale),
        delta: "v-Live",
        icon: CheckCircle2,
        tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      },
      {
        label: isArabic ? "قيمة المسترد" : "Refunded Value",
        value: formatCurrency(refundedValue, locale),
        delta: "v-Live",
        icon: DollarSign,
        tone: "bg-indigo-50 text-indigo-700 ring-indigo-100",
      },
    ];
  }, [isArabic, locale, returns]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  const safeRows = pageRows as ReturnRow[];

  return (
    <NextAuthProvider session={session}>
      <div className="animate-in fade-in space-y-8 duration-700">
        {error && (
          <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-center text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {isArabic ? "إدارة المرتجعات" : "Returns Management"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            {isArabic ? "تصدير CSV" : "Export CSV"}
          </button>
          <Link
            href="/admin/returns/create"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            {isArabic ? "مرتجع يدوي" : "Manual Return"}
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${k.tone}`}>
                  <k.icon className="h-4 w-4" />
                </div>
                <div className="truncate text-3xl font-extrabold tracking-tight text-slate-900">
                  {k.value}
                </div>
              </div>
              <div className="shrink-0 text-xs font-extrabold text-emerald-600">{k.delta}</div>
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-500">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex w-full items-center gap-3 lg:w-auto">
              <div className="shrink-0 text-sm font-extrabold text-slate-900">
                {isArabic ? "كل المرتجعات" : "All Returns"}{" "}
                <span className="text-slate-500">( {returns.length} )</span>
              </div>

              <div className="relative w-full lg:w-[360px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder={
                  isArabic
                    ? "ابحث برقم المرتجع أو اسم العميل..."
                    : "Search Return ID or Customer name..."
                }
                className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            </div>

            <div className="relative">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as any);
                  setPage(1);
                }}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">{isArabic ? "الحالة: الكل" : "Status: All"}</option>
                <option value="pending">{isArabic ? "قيد الانتظار" : "Pending"}</option>
                <option value="approved">{isArabic ? "معتمد" : "Approved"}</option>
                <option value="refunded">{isArabic ? "مسترد" : "Refunded"}</option>
                <option value="rejected">{isArabic ? "مرفوض" : "Rejected"}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>

            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="last-30">{isArabic ? "التاريخ: آخر 30 يومًا" : "Date: Last 30 Days"}</option>
                <option value="last-7">{isArabic ? "آخر 7 أيام" : "Last 7 Days"}</option>
                <option value="this-month">{isArabic ? "هذا الشهر" : "This Month"}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>

            <div className="relative">
              <select
                value={sellerFilter}
                onChange={(e) => {
                  setSellerFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">{isArabic ? "البائع: الكل" : "Seller: All"}</option>
                {sellerOptions.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            <X className="h-4 w-4" />
            {isArabic ? "مسح الفلاتر" : "Clear Filters"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">{isArabic ? "المعرف" : "ID"}</th>
                <th className="px-5 py-3">{isArabic ? "العميل" : "Customer"}</th>
                <th className="px-5 py-3">{isArabic ? "البائع" : "Seller"}</th>
                <th className="px-5 py-3">{isArabic ? "العنصر" : "Item"}</th>
                <th className="px-5 py-3">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-5 py-3">{isArabic ? "التاريخ" : "Date"}</th>
                <th className="px-5 py-3 text-right">{isArabic ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                         <ClipboardList className="h-6 w-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {isArabic ? "لا توجد مرتجعات حالياً" : "No returns found"}
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        {isArabic ? "حاول تغيير الفلاتر أو البحث" : "Try adjusting your filters or search query"}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((r: ReturnRow) => {
                  const statusTone =
                    r.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                      : r.status === "refunded"
                        ? "bg-indigo-50 text-indigo-700 ring-indigo-100"
                        : r.status === "rejected"
                          ? "bg-rose-50 text-rose-700 ring-rose-100"
                          : "bg-amber-50 text-amber-700 ring-amber-100";

                  const statusLabel =
                    r.status === "approved"
                      ? isArabic
                        ? "معتمد"
                        : "Approved"
                      : r.status === "refunded"
                        ? isArabic
                          ? "مسترد"
                          : "Refunded"
                        : r.status === "rejected"
                          ? isArabic
                            ? "مرفوض"
                            : "Rejected"
                          : isArabic
                            ? "قيد الانتظار"
                            : "Pending";

                  return (
                    <tr key={r.rawId} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40">
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/returns/${r.rawId}`}
                          className="font-extrabold text-emerald-700 underline-offset-4 hover:underline"
                        >
                          {r.id}
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{r.customerName}</td>
                      <td className="px-5 py-4 text-xs font-bold text-slate-600">{r.sellerName}</td>
                      <td className="px-5 py-4 font-medium text-slate-700">{r.itemLabel}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ring-1 ${statusTone}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-500">{r.dateLabel}</td>
                      <td className="px-5 py-4 text-right">
                        <button className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition ml-auto">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium text-slate-500">
            {isArabic
              ? `عرض ${showingFrom} إلى ${showingTo} من ${formatNumber(filtered.length, locale)} نتيجة`
              : `Showing ${showingFrom} to ${showingTo} of ${formatNumber(filtered.length, locale)} results`}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
              .map((p, i, arr) => {
                const showEllipsis = i > 0 && p !== arr[i - 1] + 1;
                return (
                  <Fragment key={p}>
                    {showEllipsis && <span className="px-2 text-slate-400">...</span>}
                    <button
                      type="button"
                      onClick={() => setPage(p)}
                      className={[
                        "h-9 w-9 rounded-xl text-sm font-extrabold shadow-sm transition",
                        p === safePage
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      {p}
                    </button>
                  </Fragment>
                );
              })}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        </div>
      </div>
      </div>
    </NextAuthProvider>
  );
}
