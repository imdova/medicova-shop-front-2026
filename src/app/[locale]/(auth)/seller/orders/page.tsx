"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  Eye,
  Package,
  Search,
  Receipt,
  ShoppingCart,
  TrendingUp,
  Loader2,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useAppLocale } from "@/hooks/useAppLocale";
import { getSellerOrders, ApiOrder } from "@/services/orderService";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

export default function SellerOrdersPage() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const sellerId = (session as any)?.user?.id;

  const [ordersData, setOrdersData] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getSellerOrders(token);
      const filtered = data.filter(o => {
        const method = String(o.paymentMethod || "").toLowerCase();
        const status = String(o.paymentStatus || "").toLowerCase();
        const isPaidOrCod = status === "paid" || method === "cash_on_delivery" || method === "cod";
        return isPaidOrCod;
      });
      setOrdersData(filtered);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error(isArabic ? "فشل في تحميل الطلبات" : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token, sellerId, isArabic]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function formatMoneyEGP(value: number) {
    const loc = locale === "ar" ? "ar-EG" : "en-US";
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  const enriched = useMemo(() => {
    return ordersData.map((o) => {
      const oid = o.orderId || o._id || (o as any).id || "unknown";
      const orderIdLabel = o.orderNumber || (o.orderId ? `#HM-${o.orderId.substring(Math.max(0, o.orderId.length - 6))}` : "#HM-NEW");
      const customerName = (o as any).user?.name || o.name || "Customer";
      const customerSubtitle = (o as any).user?.email || o.email || "";
      
      const totalAmount = o.totalPrice || o.total || (o as any).grandTotal || 0;

      return {
        ...o,
        id: oid,
        orderIdLabel,
        customerName,
        customerSubtitle,
        totalAmount,
        dateLabel: new Date(o.createdAt || new Date()).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
      };
    });
  }, [isArabic, ordersData]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enriched.filter((o) => {
      const matchesSearch =
        !q ||
        o.orderIdLabel.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerSubtitle.toLowerCase().includes(q);
      
      return matchesSearch;
    });
  }, [enriched, searchQuery]);

  const metrics = useMemo(() => {
    const totalOrders = filtered.length;
    const totalRevenue = filtered.reduce((acc, o) => acc + o.totalAmount, 0);
    const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
    return { totalOrders, totalRevenue, avgOrder };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const pageRows = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  if (loading && ordersData.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm font-bold text-gray-400">
            {isArabic ? "جاري تحميل الطلبات..." : "Loading orders..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-black text-gray-900">
          {isArabic ? "طلباتي" : "My Orders"}
        </h1>
        <p className="mt-1 text-sm font-semibold text-gray-400">
          {isArabic ? "تتبع وإدارة طلبات عملائك" : "Track and manage your customer orders"}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: isArabic ? "إجمالي الطلبات" : "Total Orders",
            value: metrics.totalOrders.toLocaleString(),
            icon: ShoppingCart,
            color: "text-emerald-600 bg-emerald-50 ring-emerald-100",
          },
          {
            label: isArabic ? "إجمالي الإيراد" : "Total Revenue",
            value: formatMoneyEGP(metrics.totalRevenue),
            icon: Receipt,
            color: "text-blue-600 bg-blue-50 ring-blue-100",
          },
          {
            label: isArabic ? "متوسط الطلب" : "Avg Order",
            value: formatMoneyEGP(metrics.avgOrder),
            icon: TrendingUp,
            color: "text-indigo-600 bg-indigo-50 ring-indigo-100",
          },
        ].map((k) => (
          <div key={k.label} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{k.label}</p>
                <p className="text-2xl font-black text-gray-900">{k.value}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${k.color}`}>
                <k.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isArabic ? "ابحث برقم الطلب أو العميل..." : "Search by order ID or customer..."}
            className="h-12 w-full rounded-2xl border-none bg-gray-50/50 pl-12 pr-4 text-sm font-bold text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">{isArabic ? "رقم الطلب" : "Order ID"}</th>
                <th className="px-6 py-4">{isArabic ? "العميل" : "Customer"}</th>
                <th className="px-6 py-4">{isArabic ? "التاريخ" : "Date"}</th>
                <th className="px-6 py-4">{isArabic ? "الإجمالي" : "Total"}</th>
                <th className="px-6 py-4">{isArabic ? "الدفع" : "Payment"}</th>
                <th className="px-6 py-4 text-right">{isArabic ? "إجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-bold text-gray-700">
              {pageRows.map((o) => (
                <tr key={o.id} className="transition-colors hover:bg-gray-50/50">
                  <td className="px-6 py-5">
                    <Link href={`/${locale}/seller/orders/${o.id}`} className="text-primary hover:underline">
                      {o.orderIdLabel}
                    </Link>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-gray-900">{o.customerName}</p>
                    <p className="text-[10px] text-gray-400">{o.customerSubtitle}</p>
                  </td>
                  <td className="px-6 py-5 text-gray-500">{o.dateLabel}</td>
                  <td className="px-6 py-5 text-gray-900">{formatMoneyEGP(o.totalAmount)}</td>
                  <td className="px-6 py-5">
                    <span className="uppercase text-[10px] font-black tracking-widest">
                      {o.paymentMethod === "cash_on_delivery" ? "COD" : (isArabic ? "بطاقة/محفظة" : "Card/Wallet")}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link
                      href={`/${locale}/seller/orders/${o.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition-colors hover:bg-primary hover:text-white"
                    >
                      <Eye size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Package size={48} className="mx-auto text-gray-100 mb-4" />
                    <p className="text-sm font-bold text-gray-400">
                      {isArabic ? "لا توجد طلبات لعرضها" : "No orders found"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-50 px-6 py-4">
            <p className="text-xs font-bold text-gray-400">
              {isArabic ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="h-9 rounded-xl border border-gray-100 bg-white px-4 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {isArabic ? "السابق" : "Prev"}
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="h-9 rounded-xl border border-gray-100 bg-white px-4 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                {isArabic ? "التالي" : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
