"use client";

import React, { useMemo, useState } from "react";
import { LanguageType } from "@/util/translations";
import { Link } from "@/i18n/navigation";
import {
  CalendarDays,
  ChevronDown,
  Eye,
  Mail,
  Package,
  Search,
  Receipt,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import { orders, Order } from "../constants";

export default function OrdersListPanel({
  locale = "en",
}: {
  locale: LanguageType;
}) {
  const isArabic = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("last-30");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("any");
  const [orderTypeFilter, setOrderTypeFilter] = useState("b2b-b2c");
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  function hashToNumber(input: string) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    return hash;
  }

  function parseAmount(value: string) {
    const m = value?.match(/[\d,.]+/);
    if (!m) return 0;
    return Number.parseFloat(m[0].replace(/,/g, "")) || 0;
  }

  function formatMoneyUSD(value: number) {
    const loc = locale === "ar" ? "ar-EG" : "en-US";
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatDateLabel(raw: string) {
    // raw like "15/5/2025" (d/m/yyyy)
    const parts = raw.split("/").map((x) => Number.parseInt(x, 10));
    const d = parts.length === 3 ? new Date(parts[2]!, (parts[1] || 1) - 1, parts[0] || 1) : new Date();
    const loc = locale === "ar" ? "ar-EG" : "en-US";
    return new Intl.DateTimeFormat(loc, { month: "short", day: "2-digit", year: "numeric" }).format(d);
  }

  const sellerOptions = useMemo(() => {
    const unique = Array.from(new Set(orders.map((o) => o.seller))).filter(Boolean);
    return unique.slice(0, 12);
  }, []);

  const enriched = useMemo(() => {
    return orders.map((o) => {
      const h = hashToNumber(`order:${o.id}:${o.seller}`);
      const orderIdLabel = o.id.startsWith("#") ? o.id : `#HM-${o.id.replace(/\D+/g, "") || (9000 + (h % 999)).toString()}`;
      const customerSubtitle =
        h % 4 === 0
          ? isArabic
            ? "قسم المشتريات"
            : "Procurement Dept."
          : h % 4 === 1
            ? isArabic
              ? "مدير التوريد"
              : "Supply Manager"
            : h % 4 === 2
              ? isArabic
                ? "صيدلية داخلية"
                : "Internal Pharmacy"
              : isArabic
                ? "إدارة العمليات"
                : "Operations";

      const paymentStatus =
        o.status === "Returned"
          ? "refunded"
          : o.status === "Pending" || o.payment.method === "cash"
            ? "pending"
            : "paid";

      const fulfillmentStatus =
        o.status === "Delivered"
          ? "delivered"
          : o.status === "For Delivery"
            ? "shipped"
            : o.status === "Packaging" || o.status === "Pending"
              ? "processing"
              : o.status === "Cancelled" || o.status === "Returned"
                ? "cancelled"
                : "processing";

      const orderType = h % 3 === 0 ? "b2b" : "b2c";

      const totalNumber = parseAmount(o.total);
      const totalUSD = totalNumber ? totalNumber / 50 : 0; // stable conversion for nicer USD scale

      return {
        ...o,
        orderIdLabel,
        customerSubtitle,
        paymentStatus,
        fulfillmentStatus,
        orderType,
        totalUSD,
        dateLabel: formatDateLabel(o.date),
      };
    });
  }, [isArabic, locale]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enriched.filter((o) => {
      const matchesSearch =
        !q ||
        o.orderIdLabel.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.customer.name.toLowerCase().includes(q) ||
        o.customer.location.toLowerCase().includes(q) ||
        o.seller.toLowerCase().includes(q);
      const sellerOk = sellerFilter === "all" ? true : o.seller === sellerFilter;
      const fulfillmentOk = fulfillmentFilter === "any" ? true : o.fulfillmentStatus === fulfillmentFilter;
      const orderTypeOk =
        orderTypeFilter === "b2b-b2c" ? true : o.orderType === orderTypeFilter;

      // dateRange is cosmetic for now (mock data); keep state for UI
      return matchesSearch && sellerOk && fulfillmentOk && orderTypeOk;
    });
  }, [enriched, fulfillmentFilter, orderTypeFilter, searchQuery, sellerFilter]);

  const metrics = useMemo(() => {
    const totalOrders = enriched.length;
    const pendingFulfillment = enriched.filter((o) => o.fulfillmentStatus === "processing").length;
    const totalRevenue = enriched.reduce((acc, o) => acc + o.totalUSD, 0);
    const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
    return { totalOrders, pendingFulfillment, totalRevenue, avgOrder };
  }, [enriched]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, safePage]);

  const showFrom = filtered.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const showTo = Math.min(safePage * itemsPerPage, filtered.length);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: isArabic ? "إجمالي الطلبات" : "Total Orders",
            value: metrics.totalOrders.toLocaleString(),
            delta: "+12.5%",
            icon: ShoppingCart,
            iconTone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
          },
          {
            label: isArabic ? "بانتظار التجهيز" : "Pending Fulfillment",
            value: metrics.pendingFulfillment.toLocaleString(),
            delta: "-4.2%",
            icon: Package,
            iconTone: "bg-amber-50 text-amber-700 ring-amber-100",
          },
          {
            label: isArabic ? "إجمالي الإيراد" : "Total Revenue",
            value: formatMoneyUSD(metrics.totalRevenue),
            delta: "+8.1%",
            icon: Receipt,
            iconTone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
          },
          {
            label: isArabic ? "متوسط قيمة الطلب" : "Average Order Value",
            value: formatMoneyUSD(metrics.avgOrder),
            delta: "+2.4%",
            icon: TrendingUp,
            iconTone: "bg-indigo-50 text-indigo-700 ring-indigo-100",
          },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                {k.label}
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${k.iconTone}`}>
                <k.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              {k.value}
            </div>
            <div className="mt-1 text-xs font-semibold text-slate-500">
              <span className={k.delta.startsWith("-") ? "text-rose-600" : "text-emerald-600"}>
                {k.delta}
              </span>{" "}
              {isArabic ? "مقارنة بالشهر الماضي" : "vs last month"}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-4">
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {isArabic ? "بحث" : "Search"}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={
                  isArabic
                    ? "ابحث في الطلبات أو العملاء أو البائعين..."
                    : "Search orders, customers, or sellers..."
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {isArabic ? "نطاق التاريخ" : "Date Range"}
            </div>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="last-30">{isArabic ? "آخر 30 يومًا" : "Last 30 Days"}</option>
                <option value="last-7">{isArabic ? "آخر 7 أيام" : "Last 7 Days"}</option>
                <option value="this-month">{isArabic ? "هذا الشهر" : "This Month"}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {isArabic ? "البائع" : "Seller"}
            </div>
            <div className="relative">
              <select
                value={sellerFilter}
                onChange={(e) => {
                  setSellerFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">{isArabic ? "كل البائعين" : "All Sellers"}</option>
                {sellerOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {isArabic ? "حالة التجهيز" : "Fulfillment Status"}
            </div>
            <div className="relative">
              <select
                value={fulfillmentFilter}
                onChange={(e) => {
                  setFulfillmentFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="any">{isArabic ? "أي حالة" : "Any Status"}</option>
                <option value="processing">{isArabic ? "قيد المعالجة" : "Processing"}</option>
                <option value="shipped">{isArabic ? "تم الشحن" : "Shipped"}</option>
                <option value="delivered">{isArabic ? "تم التسليم" : "Delivered"}</option>
                <option value="cancelled">{isArabic ? "ملغي" : "Cancelled"}</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              {isArabic ? "نوع الطلب" : "Order Type"}
            </div>
            <div className="relative">
              <select
                value={orderTypeFilter}
                onChange={(e) => {
                  setOrderTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="b2b-b2c">{isArabic ? "B2B و B2C" : "B2B & B2C"}</option>
                <option value="b2b">B2B</option>
                <option value="b2c">B2C</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          <div className="lg:col-span-1">
            <button
              type="button"
              onClick={() => setPage(1)}
              className="h-11 w-full rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              {isArabic ? "تطبيق" : "Apply"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3">{isArabic ? "رقم الطلب" : "Order ID"}</th>
                <th className="px-5 py-3">{isArabic ? "العميل" : "Customer"}</th>
                <th className="px-5 py-3">{isArabic ? "البائع" : "Seller"}</th>
                <th className="px-5 py-3">{isArabic ? "التاريخ" : "Date"}</th>
                <th className="px-5 py-3">{isArabic ? "الإجمالي" : "Total"}</th>
                <th className="px-5 py-3">{isArabic ? "الدفع" : "Payment"}</th>
                <th className="px-5 py-3">{isArabic ? "التجهيز" : "Fulfillment"}</th>
                <th className="px-5 py-3 text-right">{isArabic ? "الإجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((o) => {
                const paymentTone =
                  o.paymentStatus === "paid"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                    : o.paymentStatus === "pending"
                      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                      : "bg-rose-50 text-rose-700 ring-1 ring-rose-100";

                const fulfillmentTone =
                  o.fulfillmentStatus === "delivered"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                    : o.fulfillmentStatus === "shipped"
                      ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                      : o.fulfillmentStatus === "processing"
                        ? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-100";

                const slug = encodeURIComponent(o.id.replace(/^#/, ""));

                return (
                  <tr key={o.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${slug}`}
                        className="font-extrabold text-slate-900 underline-offset-4 hover:text-emerald-700 hover:underline"
                      >
                        {o.orderIdLabel}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900">{o.customer.name}</div>
                      <div className="text-xs font-semibold text-slate-500">{o.customerSubtitle}</div>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">{o.seller}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600">{o.dateLabel}</td>
                    <td className="px-5 py-4 text-sm font-extrabold text-slate-900">
                      {formatMoneyUSD(o.totalUSD)}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${paymentTone}`}>
                        {o.paymentStatus === "paid"
                          ? isArabic
                            ? "مدفوع"
                            : "Paid"
                          : o.paymentStatus === "pending"
                            ? isArabic
                              ? "معلق"
                              : "Pending"
                            : isArabic
                              ? "مسترجع"
                              : "Refunded"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${fulfillmentTone}`}>
                        {o.fulfillmentStatus === "shipped"
                          ? isArabic
                            ? "تم الشحن"
                            : "Shipped"
                          : o.fulfillmentStatus === "processing"
                            ? isArabic
                              ? "قيد المعالجة"
                              : "Processing"
                            : o.fulfillmentStatus === "delivered"
                              ? isArabic
                                ? "تم التسليم"
                                : "Delivered"
                              : isArabic
                                ? "ملغي"
                                : "Cancelled"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/orders/${slug}`}
                          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label="View order"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => console.log("message", o.id)}
                          className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label="Message"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center">
                    <div className="text-sm font-extrabold text-slate-900">
                      {isArabic ? "لا توجد طلبات" : "No orders found"}
                    </div>
                    <div className="mt-1 text-sm font-medium text-slate-500">
                      {isArabic ? "جرّب تغيير الفلاتر." : "Try changing filters."}
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium text-slate-500">
            {isArabic
              ? `عرض ${showFrom} إلى ${showTo} من ${filtered.length} نتيجة`
              : `Showing ${showFrom} to ${showTo} of ${filtered.length} results`}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isArabic ? "السابق" : "Previous"}
            </button>
            {Array.from({ length: Math.min(4, totalPages) }).map((_, idx) => {
              const p = idx + 1;
              const active = p === safePage;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={[
                    "h-9 w-9 rounded-xl text-sm font-extrabold shadow-sm transition",
                    active
                      ? "bg-emerald-600 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  {p}
                </button>
              );
            })}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isArabic ? "التالي" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
