"use client";

import React, { useState, useEffect } from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Link } from "@/i18n/navigation";
import {
  ChevronDown,
  Search,
  Loader2,
  ReceiptText,
  ShieldCheck,
  Eye
} from "lucide-react";
import { useSession } from "next-auth/react";

import { 
  getAdminTransactions, 
  AdminTransaction, 
  getAdminFinanceSummary, 
  AdminFinanceSummary,
  getAdminPaymentAudits,
  PaymentAuditLog
} from "@/services/financeService";
import { getAdminSellers, Seller } from "@/services/sellerService";
import PaymentAuditDetailModal from "./components/PaymentAuditDetailModal";

function formatCurrency(value: number, locale: string, currency: string = "USD") {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function TransactionsListPanel() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  // View state
  type ViewMode = "orders" | "audit";
  const [viewMode, setViewMode] = useState<ViewMode>("orders");

  // Orders State
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [summary, setSummary] = useState<AdminFinanceSummary | null>(null);
  const [sellerId, setSellerId] = useState("all");

  // Audit State
  const [audits, setAudits] = useState<PaymentAuditLog[]>([]);
  const [totalAudits, setTotalAudits] = useState(0);
  const [auditStatus, setAuditStatus] = useState("all");
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  // Common State
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 20;
  
  // Total pages based on current view
  const currentTotal = viewMode === "orders" ? totalTransactions : totalAudits;
  const totalPages = Math.max(1, Math.ceil(currentTotal / itemsPerPage));

  // Switch tabs reset
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setPage(1);
    setQ("");
    setSellerId("all");
  };

  useEffect(() => {
    async function init() {
      if (!token) return;
      try {
        const [sellersData, sumData] = await Promise.all([
          getAdminSellers(token),
          getAdminFinanceSummary(token)
        ]);
        setSellers(sellersData);
        setSummary(sumData);
      } catch (err) {
        console.error("Failed to fetch admin financial metadata:", err);
      }
    }
    init();
  }, [token]);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      setLoading(true);
      try {
        if (viewMode === "orders") {
          const res = await getAdminTransactions(token, {
            page,
            limit: itemsPerPage,
            search: q,
            sellerId: sellerId === "all" ? "" : sellerId,
          });
          setTransactions(res.transactions);
          setTotalTransactions(res.total);
        } else {
          const res = await getAdminPaymentAudits(token, {
            page,
            limit: itemsPerPage,
            search: q,
            status: auditStatus === "all" ? "" : auditStatus
          });
          setAudits(res.audits);
          setTotalAudits(res.total);
        }
      } catch (err) {
        console.error("Failed to fetch admin transactions:", err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetchData, q ? 500 : 0);
    return () => clearTimeout(timer);
  }, [token, page, q, sellerId, viewMode, auditStatus]);

  const clearFilters = () => {
    setQ("");
    setSellerId("all");
    setAuditStatus("all");
    setPage(1);
  };

  const t = {
    totalMarketplaceVolume: isArabic ? "إجمالي حجم السوق" : "Total Marketplace Volume",
    totalPlatformRevenue: isArabic ? "إجمالي إيراد المنصة" : "Total Platform Revenue",
    averageOrderValue: isArabic ? "متوسط قيمة الطلب" : "Average Order Value",
    pendingPayouts: isArabic ? "مدفوعات معلّقة" : "Pending Payouts",
    allSellers: isArabic ? "كل البائعين" : "All Sellers",
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
      {/* KPI cards - Order Context Only for now as requested originally */}
      {viewMode === "orders" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: t.totalMarketplaceVolume,
              value: formatCurrency(summary?.totalGrossVolume || 0, locale),
              sub: "+12.5%",
              subTone: "text-emerald-600",
            },
            {
              label: t.totalPlatformRevenue,
              value: formatCurrency(summary?.totalPlatformCommission || 0, locale),
              sub: "+8.2%",
              subTone: "text-emerald-600",
            },
            {
              label: t.averageOrderValue,
              value: formatCurrency(
                (summary?.totalGrossVolume || 0) / (totalTransactions || 1),
                locale,
              ),
              sub: isArabic ? "مستقر" : "stable",
              subTone: "text-slate-500",
            },
            {
              label: t.pendingPayouts,
              value: formatCurrency(summary?.pendingPayouts || 0, locale),
              sub: isArabic ? "تقديري" : "estimated",
              subTone: "text-amber-700",
            },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-medium text-slate-600">{k.label}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-2xl font-extrabold text-slate-900">{k.value}</p>
                <span className={`text-xs font-semibold ${k.subTone}`}>
                  {k.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-max">
        <button
          onClick={() => handleViewModeChange("orders")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            viewMode === "orders" 
              ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/50" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ReceiptText className="h-4 w-4" />
          {isArabic ? "سجل الطلبات" : "Order Ledger"}
        </button>
        <button
          onClick={() => handleViewModeChange("audit")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            viewMode === "audit" 
              ? "bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/50" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ShieldCheck className="h-4 w-4" />
          {isArabic ? "سجل المدفوعات (Paymob)" : "Payment Audit (Paymob)"}
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full">
          <div className="shrink-0 text-sm font-extrabold text-slate-900 pr-4">
            {viewMode === "orders" 
              ? (isArabic ? "كل طلبات الشراء" : "All Order Transactions")
              : (isArabic ? "كل أحداث الدفع" : "All Payment Events")}
            <span className="text-slate-500 ml-2">
              ( {currentTotal.toLocaleString()} )
            </span>
          </div>

          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => {
                 setQ(e.target.value);
                 setPage(1);
              }}
              placeholder={
                viewMode === "orders" 
                  ? (isArabic ? "بحث في طلبات الشراء..." : "Search orders...")
                  : (isArabic ? "بحث بالمعرف..." : "Search by ID...")
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {viewMode === "orders" ? (
            <div className="relative">
              <select
                value={sellerId}
                onChange={(e) => {
                  setSellerId(e.target.value);
                  setPage(1);
                }}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">{t.allSellers}</option>
                {Array.isArray(sellers) && sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.storeName || s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          ) : (
            <div className="relative">
              <select
                value={auditStatus}
                onChange={(e) => {
                  setAuditStatus(e.target.value);
                  setPage(1);
                }}
                className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">{isArabic ? "كل الحالات" : "All Status"}</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          )}

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
          {viewMode === "orders" ? (
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
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-20 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
                    </td>
                  </tr>
                ) : Array.isArray(transactions) && transactions.length > 0 ? (
                  transactions.map((r) => {
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
                        key={r._id}
                        className="border-b border-slate-50/80 hover:bg-slate-50/50"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/orders/${encodeURIComponent(r.orderId)}`}
                            className="font-extrabold text-emerald-700 hover:underline"
                          >
                            #{r.orderNumber}
                          </Link>
                          <div className="mt-1 text-xs font-medium text-slate-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[11px] font-extrabold text-slate-600">
                              {r.sellerId?.brandName?.[0] ||
                                r.sellerId?.firstName?.[0] ||
                                "S"}
                            </div>
                            <div className="font-semibold text-slate-800">
                              {r.sellerId?.brandName ||
                                `${r.sellerId?.firstName} ${r.sellerId?.lastName}`}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-700">
                          Marketplace Customer
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {formatCurrency(r.totalAmount, locale)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-amber-700">
                            -{formatCurrency(r.platformCommission, locale)}
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {formatCurrency(r.netPayout, locale)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadge}`}
                          >
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right text-slate-400">⋮</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-20 text-center text-gray-400">
                      {isArabic ? "لا توجد معاملات شراء" : "No order transactions found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">{isArabic ? "الرقم التعريفي" : "Transaction ID"}</th>
                  <th className="px-5 py-3">{isArabic ? "الطلب" : "Order"}</th>
                  <th className="px-5 py-3">{isArabic ? "المبلغ" : "Amount"}</th>
                  <th className="px-5 py-3">{isArabic ? "البوابة" : "Gateway"}</th>
                  <th className="px-5 py-3">{isArabic ? "التاريخ" : "Timestamp"}</th>
                  <th className="px-5 py-3">{isArabic ? "الحالة" : "Status"}</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
                    </td>
                  </tr>
                ) : Array.isArray(audits) && audits.length > 0 ? (
                  audits.map((a) => {
                    const statusText = a.status?.toLowerCase();
                    const statusBadge =
                      statusText === "success" || statusText === "paid" || statusText === "completed"
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                        : statusText === "pending"
                          ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                          : "bg-rose-50 text-rose-700 ring-1 ring-rose-100";

                    return (
                      <tr
                        key={a._id || a.transactionId}
                        className="border-b border-slate-50/80 hover:bg-slate-50/50"
                      >
                        <td className="px-5 py-4 font-mono text-xs font-semibold text-slate-600">
                          {a.transactionId}
                        </td>
                        <td className="px-5 py-4">
                          {a.orderId ? (
                            <span className="font-extrabold text-emerald-700 hover:underline cursor-pointer">
                              {typeof a.orderId === "object" ? `#${a.orderId.orderNumber || a.orderId._id}` : `#${a.orderId}`}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs">N/A</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-black text-slate-900">
                          {formatCurrency(a.amount, locale, a.currency || "USD")}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-black uppercase text-slate-600">
                            {a.gateway || "Paymob"}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-slate-500 text-xs">
                          {new Date(a.createdAt).toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold capitalize ${statusBadge}`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button 
                            onClick={() => setSelectedAuditId(a.transactionId || a._id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            {isArabic ? "عرض" : "View"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center text-gray-400">
                      {isArabic ? "لا توجد سجلات دفع" : "No payment audit records found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination footer */}
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-medium text-slate-500">
            {t.showing} {currentTotal === 0 ? 0 : (page - 1) * itemsPerPage + 1}-
            {Math.min(page * itemsPerPage, currentTotal)} {t.of}{" "}
            {currentTotal.toLocaleString()} {t.transactions}
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              const n = page > 2 ? page - 1 + i : i + 1;
              if (n > totalPages) return null;
              return (
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
              );
            })}
            {totalPages > 3 && page < totalPages - 1 && (
              <span className="px-2 text-xs font-semibold text-slate-400">
                …
              </span>
            )}
            {totalPages > 3 && (
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
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <PaymentAuditDetailModal 
        isOpen={!!selectedAuditId} 
        onClose={() => setSelectedAuditId(null)} 
        transactionId={selectedAuditId} 
      />
    </div>
  );
}
