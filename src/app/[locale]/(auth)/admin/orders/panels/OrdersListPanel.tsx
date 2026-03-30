import React, { useMemo, useState, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";

import { orders, Order } from "../constants";
import { getOrders, deleteOrder, ApiOrder } from "@/services/orderService";
import { getSellers, Seller } from "@/services/sellerService";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import { confirmToast } from "@/utils/confirmToast";


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

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const [ordersData, setOrdersData] = useState<ApiOrder[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getSellers(token).then(setSellers).catch(console.error);
    }
  }, [token]);

  const sellerMap = useMemo(() => {
    const map: Record<string, string> = {};
    sellers.forEach((s) => {
      map[s.id] = s.storeName || s.name;
    });
    return map;
  }, [sellers]);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getOrders(token);
      setOrdersData(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      toast.error(isArabic ? "فشل في تحميل الطلبات" : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token, isArabic]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (
      !(await confirmToast(
        isArabic
          ? "هل أنت متأكد من حذف هذا الطلب؟"
          : "Are you sure you want to delete this order?",
        isArabic,
      ))
    )
      return;

    try {
      await deleteOrder(id, token);
      toast.success(isArabic ? "تم حذف الطلب" : "Order deleted");
      fetchOrders();
    } catch (err) {
      toast.error(isArabic ? "فشل في حذف الطلب" : "Failed to delete order");
    }
  };

  function hashToNumber(input: string) {
    let hash = 0;
    for (let i = 0; i < input.length; i++)
      hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
    return hash;
  }

  function parseAmount(value: string) {
    const m = value?.match(/[\d,.]+/);
    if (!m) return 0;
    return Number.parseFloat(m[0].replace(/,/g, "")) || 0;
  }

  function formatMoneyEGP(value: number) {
    const loc = locale === "ar" ? "ar-EG" : "en-US";
    return new Intl.NumberFormat(loc, {
      style: "currency",
      currency: "EGP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDateLabel(raw: string) {
    const parts = raw.split("/").map((x) => Number.parseInt(x, 10));
    const d =
      parts.length === 3
        ? new Date(parts[2]!, (parts[1] || 1) - 1, parts[0] || 1)
        : new Date();
    const loc = locale === "ar" ? "ar-EG" : "en-US";
    return new Intl.DateTimeFormat(loc, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(d);
  }

  const enriched = useMemo(() => {
    return ordersData.map((o) => {
      const oid = (o as any).orderId || o._id || (o as any).id || "unknown";
      const h = hashToNumber(`order:${oid}`);
      const orderIdLabel =
        (o as any).orderId
          ? `#HM-${(o as any).orderId.substring(Math.max(0, (o as any).orderId.length - 6))}`
          : "#HM-NEW";
      
      const customerName = (o as any).user?.name || o.name || "Customer";
      const customerSubtitle = (o as any).user?.email || o.email || (isArabic ? "عميل" : "Customer");
      const customerLocation = (o as any).address?.city ? `${(o as any).address.city}${ (o as any).address.area ? `, ${(o as any).address.area}` : ""}` : (isArabic ? "مصر" : "Egypt");

      const paymentStatus = o.paymentStatus || "pending";
      const fulfillmentStatus = (o as any).orderStatus || o.status || "pending";

      const orderType = h % 3 === 0 ? "b2b" : "b2c";

      const totalAmount =
        (o as any).totalPrice ||
        o.total ||
        (o as any).grandTotal ||
        (o as any).payment?.amount ||
        0;

      const sellerName =
        o.sellerId && typeof o.sellerId === "string"
          ? sellerMap[o.sellerId] || (isArabic ? "ميديكوفا" : "Medicova")
          : (o as any).sellerName ||
            (o as any).seller?.name ||
            (isArabic ? "ميديكوفا" : "Medicova");

      return {
        ...o,
        id: oid,
        orderIdLabel,
        customerName,
        customerLocation,
        customerSubtitle,
        paymentStatus,
        fulfillmentStatus,
        orderType,
        totalAmount,
        dateLabel: formatDateLabel(
          new Date(o.createdAt || new Date()).toLocaleDateString("en-GB"),
        ),
        sellerName,
      };
    });
  }, [isArabic, ordersData, sellerMap]);

  const sellerOptions = useMemo(() => {
    const unique = Array.from(
      new Set(enriched.map((o) => o.sellerName)),
    ).filter(Boolean);
    return unique.slice(0, 12);
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return enriched.filter((o) => {
      // Show only orders that are 'paid' or 'cash_on_delivery'
      const isPaidOrCod =
        o.paymentStatus === "paid" || o.paymentMethod === "cash_on_delivery";
      if (!isPaidOrCod) return false;

      const matchesSearch =
        !q ||
        o.orderIdLabel.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerLocation.toLowerCase().includes(q) ||
        o.sellerName.toLowerCase().includes(q);
      
      const sellerOk =
        sellerFilter === "all" ? true : o.sellerName === sellerFilter;

      const orderTypeOk =
        orderTypeFilter === "b2b-b2c" ? true : o.orderType === orderTypeFilter;

      return matchesSearch && sellerOk && orderTypeOk;
    });
  }, [enriched, orderTypeFilter, searchQuery, sellerFilter]);

  const paidOrCodOrders = useMemo(() => {
    return enriched.filter((o) =>
      o.paymentStatus === "paid" || o.paymentMethod === "cash_on_delivery"
    );
  }, [enriched]);

  const metrics = useMemo(() => {
    const totalOrders = paidOrCodOrders.length;
    const totalRevenue = paidOrCodOrders.reduce((acc, o) => acc + (o as any).totalAmount, 0);
    const avgOrder = totalOrders ? totalRevenue / totalOrders : 0;
    return { totalOrders, totalRevenue, avgOrder };
  }, [paidOrCodOrders]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(page, totalPages);
  const pageRows = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, safePage]);

  const showFrom =
    filtered.length === 0 ? 0 : (safePage - 1) * itemsPerPage + 1;
  const showTo = Math.min(safePage * itemsPerPage, filtered.length);

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: isArabic ? "إجمالي الطلبات" : "Total Orders",
            value: metrics.totalOrders.toLocaleString(),
            icon: ShoppingCart,
            iconTone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
          },
          {
            label: isArabic ? "إجمالي الإيراد" : "Total Revenue",
            value: formatMoneyEGP(metrics.totalRevenue),
            icon: Receipt,
            iconTone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
          },
          {
            label: isArabic ? "متوسط قيمة الطلب" : "Average Order Value",
            value: formatMoneyEGP(metrics.avgOrder),
            icon: TrendingUp,
            iconTone: "bg-indigo-50 text-indigo-700 ring-indigo-100",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                {k.label}
              </div>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${k.iconTone}`}
              >
                <k.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
              {k.value}
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
                <option value="last-30">
                  {isArabic ? "آخر 30 يومًا" : "Last 30 Days"}
                </option>
                <option value="last-7">
                  {isArabic ? "آخر 7 أيام" : "Last 7 Days"}
                </option>
                <option value="this-month">
                  {isArabic ? "هذا الشهر" : "This Month"}
                </option>
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
                <option value="all">
                  {isArabic ? "كل البائعين" : "All Sellers"}
                </option>
                {sellerOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
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
                <option value="b2b-b2c">
                  {isArabic ? "B2B و B2C" : "B2B & B2C"}
                </option>
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
      {!loading && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">
                    {isArabic ? "رقم الطلب" : "Order ID"}
                  </th>
                  <th className="px-5 py-3">
                    {isArabic ? "العميل" : "Customer"}
                  </th>
                  <th className="px-5 py-3">
                    {isArabic ? "البائع" : "Seller"}
                  </th>
                  <th className="px-5 py-3">{isArabic ? "التاريخ" : "Date"}</th>
                  <th className="px-5 py-3">
                    {isArabic ? "الإجمالي" : "Total"}
                  </th>
                  <th className="px-5 py-3">
                    {isArabic ? "الدفع" : "Payment"}
                  </th>
                  <th className="px-5 py-3 text-right">
                    {isArabic ? "الإجراءات" : "Actions"}
                  </th>
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
                    <tr
                      key={o.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/orders/${slug}`}
                          className="font-extrabold text-slate-900 underline-offset-4 hover:text-emerald-700 hover:underline"
                        >
                          {o.orderIdLabel}
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-slate-900">
                          {o.customerName}
                        </div>
                        <div className="text-xs font-semibold text-slate-500">
                          {o.customerSubtitle}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {o.sellerName}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                        {o.dateLabel}
                      </td>
                      <td className="px-5 py-4 text-sm font-extrabold text-slate-900">
                        {formatMoneyEGP((o as any).totalAmount)}
                      </td>
                      <td className="px-5 py-4 text-sm font-extrabold text-slate-900 uppercase">
                        {o.paymentMethod === "cash_on_delivery"
                          ? "COD"
                          : o.paymentMethod === "wallet"
                            ? (isArabic ? "محفظة" : "Wallet")
                            : o.paymentMethod === "card" || o.paymentMethod === "online" || o.paymentMethod === "credit_card"
                              ? (isArabic ? "بطاقة" : "Card")
                              : o.paymentMethod || "Other"}
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
                            onClick={() => handleDelete(o.id)}
                            className="rounded-xl p-2 text-rose-500 transition hover:bg-rose-50"
                            aria-label="Delete order"
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
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
                        {isArabic
                          ? "جرّب تغيير الفلاتر."
                          : "Try changing filters."}
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
      )}
    </div>
  );
}
