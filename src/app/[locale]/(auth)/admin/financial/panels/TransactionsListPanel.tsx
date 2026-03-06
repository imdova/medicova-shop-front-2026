"use client";

import React, { useMemo, useState } from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Link } from "@/i18n/navigation";
import {
  CalendarDays,
  ChevronDown,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { dummyVendors } from "@/constants/vendors";
import { dummyCustomers } from "@/constants/customers";

function formatCurrency(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function hashToNumber(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash;
}

type TxStatus = "completed" | "processing" | "refunded";

type TxRow = {
  orderId: string; // without '#'
  orderLabel: string; // with '#'
  dateLabel: string;
  timeLabel: string;
  sellerName: string;
  sellerInitials: string;
  buyerName: string;
  totalAmount: number;
  fee: number;
  feeNote: string;
  netPayout: number;
  status: TxStatus;
};

export default function TransactionsListPanel() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  const [q, setQ] = useState("");
  const [dateRange, setDateRange] = useState("oct-2023");
  const [sellerFilter, setSellerFilter] = useState("all");
  const [txType, setTxType] = useState("all");
  const [page, setPage] = useState(1);

  const itemsPerPage = 25;
  const totalTransactions = 1250;
  const totalPages = Math.max(1, Math.ceil(totalTransactions / itemsPerPage));

  const sellerOptions = useMemo(() => {
    const names = dummyVendors.map((v) => v.storeName || v.name).filter(Boolean);
    return Array.from(new Set(names)).slice(0, 8);
  }, []);

  const rows = useMemo<TxRow[]>(() => {
    // build 25 rows for current page (stable)
    const baseIdx = (page - 1) * itemsPerPage;
    const out: TxRow[] = [];

    for (let i = 0; i < itemsPerPage; i++) {
      const idx = baseIdx + i;
      const h = hashToNumber(`tx:${idx}`);
      const orderNum = 94281 - idx;
      const orderId = `ORD-${orderNum}`;
      const vendor = dummyVendors[h % dummyVendors.length];
      const sellerName = vendor.storeName || vendor.name;
      const buyer = dummyCustomers[(h + 3) % dummyCustomers.length];
      const buyerName = `${buyer.firstName} ${buyer.lastName}`;
      const total = Math.round((45 + (h % 1400) + (h % 100) / 100) * 100) / 100;
      const feeRate = 0.1 + ((h % 6) * 0.01);
      const fee = Math.round(total * feeRate * 100) / 100;
      const status: TxStatus =
        h % 11 === 0 ? "refunded" : h % 4 === 0 ? "processing" : "completed";
      const net = status === "refunded" ? -total : Math.round((total - fee) * 100) / 100;
      const d = new Date(Date.UTC(2023, 9, 24, 8 + (h % 8), 10 + (h % 40)));
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
      const timeLabel = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      const initials = sellerName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase())
        .join("");
      const feeNote = status === "refunded" ? "Refund" : `${Math.round(feeRate * 100)}% standard`;

      out.push({
        orderId,
        orderLabel: `#${orderId}`,
        dateLabel,
        timeLabel,
        sellerName,
        sellerInitials: initials || "ST",
        buyerName,
        totalAmount: total,
        fee,
        feeNote,
        netPayout: net,
        status,
      });
    }

    return out;
  }, [page]);

  const filteredRows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchQ =
        !query ||
        r.orderId.toLowerCase().includes(query) ||
        r.sellerName.toLowerCase().includes(query) ||
        r.buyerName.toLowerCase().includes(query);

      const matchSeller =
        sellerFilter === "all" ? true : r.sellerName === sellerFilter;

      const matchType =
        txType === "all"
          ? true
          : txType === "refund"
            ? r.status === "refunded"
            : txType === "payout"
              ? r.status !== "refunded"
              : true;

      return matchQ && matchSeller && matchType;
    });
  }, [q, rows, sellerFilter, txType]);

  const clearFilters = () => {
    setQ("");
    setDateRange("oct-2023");
    setSellerFilter("all");
    setTxType("all");
    setPage(1);
  };

  const t = {
    totalMarketplaceVolume: isArabic ? "إجمالي حجم السوق" : "Total Marketplace Volume",
    totalPlatformRevenue: isArabic ? "إجمالي إيراد المنصة" : "Total Platform Revenue",
    averageOrderValue: isArabic ? "متوسط قيمة الطلب" : "Average Order Value",
    pendingPayouts: isArabic ? "مدفوعات معلّقة" : "Pending Payouts",
    dateRange: isArabic ? "نطاق التاريخ" : "Date Range",
    allSellers: isArabic ? "كل البائعين" : "All Sellers",
    transactionType: isArabic ? "نوع المعاملة" : "Transaction Type",
    clearFilters: isArabic ? "مسح الفلاتر" : "Clear Filters",
    orderId: isArabic ? "معرف الطلب" : "Order ID",
    seller: isArabic ? "البائع" : "Seller",
    buyer: isArabic ? "المشتري" : "Buyer",
    totalAmount: isArabic ? "إجمالي المبلغ" : "Total Amount",
    platformFee: isArabic ? "رسوم المنصة" : "Platform Fee",
    netPayout: isArabic ? "صافي الدفع" : "Net Payout",
    status: isArabic ? "الحالة" : "Status",
    showing: isArabic ? "عرض" : "Showing",
    of: isArabic ? "من" : "of",
    transactions: isArabic ? "معاملة" : "transactions",
  };

  return (
    <div className="animate-in fade-in space-y-6 duration-700">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: t.totalMarketplaceVolume,
            value: "$1,284,500.00",
            sub: "+12.5%",
            subTone: "text-emerald-600",
          },
          {
            label: t.totalPlatformRevenue,
            value: "$128,450.00",
            sub: "+8.2%",
            subTone: "text-emerald-600",
          },
          {
            label: t.averageOrderValue,
            value: "$185.20",
            sub: isArabic ? "مستقر" : "stable",
            subTone: "text-slate-500",
          },
          {
            label: t.pendingPayouts,
            value: "$42,305.50",
            sub: isArabic ? "12 دفعات" : "12 batches",
            subTone: "text-amber-700",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-medium text-slate-600">{k.label}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-2xl font-extrabold text-slate-900">
                {k.value}
              </p>
              <span className={`text-xs font-semibold ${k.subTone}`}>
                {k.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="shrink-0 text-sm font-extrabold text-slate-900">
            {isArabic ? "كل المعاملات" : "All Transactions"}{" "}
            <span className="text-slate-500">
              ( {totalTransactions.toLocaleString()} )
            </span>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder=""
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="oct-2023">Oct 1, 2023 - Oct 31, 2023</option>
              <option value="last-7">{isArabic ? "آخر 7 أيام" : "Last 7 days"}</option>
              <option value="last-30">{isArabic ? "آخر 30 يومًا" : "Last 30 days"}</option>
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
              <option value="all">{t.allSellers}</option>
              {sellerOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>

          <div className="relative">
            <select
              value={txType}
              onChange={(e) => {
                setTxType(e.target.value);
                setPage(1);
              }}
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">{t.transactionType}</option>
              <option value="payout">{isArabic ? "دفع" : "Payout"}</option>
              <option value="refund">{isArabic ? "استرداد" : "Refund"}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-semibold text-emerald-700 hover:underline"
          >
            {t.clearFilters}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">{t.orderId}</th>
                  <th className="px-5 py-3">{t.seller}</th>
                  <th className="px-5 py-3">{t.buyer}</th>
                  <th className="px-5 py-3">{t.totalAmount}</th>
                  <th className="px-5 py-3">{t.platformFee}</th>
                  <th className="px-5 py-3">{t.netPayout}</th>
                  <th className="px-5 py-3">{t.status}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => {
                  const statusBadge =
                    r.status === "completed"
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : r.status === "processing"
                        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-100";
                  const statusLabel =
                    r.status === "completed"
                      ? isArabic
                        ? "مكتمل"
                        : "Completed"
                      : r.status === "processing"
                        ? isArabic
                          ? "قيد المعالجة"
                          : "Processing"
                        : isArabic
                          ? "مسترجع"
                          : "Refunded";

                  return (
                    <tr
                      key={r.orderId}
                      className="border-b border-slate-50/80 hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${encodeURIComponent(
                            r.orderId.replace(/^ORD-/, ""),
                          )}`}
                          className="font-extrabold text-emerald-700 hover:underline"
                        >
                          {r.orderLabel}
                        </Link>
                        <div className="mt-1 text-xs font-medium text-slate-400">
                          {r.dateLabel}
                        </div>
                        <div className="text-xs font-medium text-slate-400">
                          {r.timeLabel}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-extrabold text-slate-600">
                            {r.sellerInitials}
                          </div>
                          <div className="font-semibold text-slate-800">
                            {r.sellerName}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">
                        {r.buyerName}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatCurrency(r.totalAmount, locale)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-amber-700">
                          -{formatCurrency(r.fee, locale)}
                        </div>
                        <div className="mt-0.5 text-xs font-medium text-slate-400">
                          {r.feeNote}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {formatCurrency(r.netPayout, locale)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-slate-400">
                        ⋮
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">
              {t.showing} {(page - 1) * itemsPerPage + 1}-
              {Math.min(page * itemsPerPage, totalTransactions)} {t.of}{" "}
              {totalTransactions.toLocaleString()} {t.transactions}
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                aria-label={isArabic ? "السابق" : "Previous"}
              >
                ‹
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-extrabold transition ${
                    page === n
                      ? "border-emerald-200 bg-emerald-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <span className="px-2 text-xs font-semibold text-slate-400">
                …
              </span>
              <button
                type="button"
                onClick={() => setPage(totalPages)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-extrabold transition ${
                  page === totalPages
                    ? "border-emerald-200 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {totalPages}
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                aria-label={isArabic ? "التالي" : "Next"}
              >
                ›
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
