"use client";

import Image from "next/image";
import { use, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Calendar,
  Eye,
  LineChart,
  Mail,
  Pencil,
  PlayCircle,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useAppLocale } from "@/hooks/useAppLocale";
import { getProductById, type ApiProduct } from "@/services/productService";

function hashToNumber(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  return hash;
}

function formatCurrency(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, { maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string | undefined, locale: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.DateTimeFormat(loc, { month: "short", day: "numeric", year: "numeric" }).format(d);
}

function resolvePrimaryImage(p: ApiProduct | null) {
  const featured = p?.media?.featuredImages;
  const gallery0 = (p?.media as any)?.galleryImages?.[0];
  return featured || gallery0 || "";
}

export default function ProductDetails2Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [tab, setTab] = useState<"overview" | "orders">("overview");
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ApiProduct | null>(null);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!token) {
        setLoading(false);
        setProduct(null);
        return;
      }
      setLoading(true);
      const p = await getProductById(slug, token);
      if (!mounted) return;
      setProduct(p);
      setLoading(false);
    };
    run();
    return () => {
      mounted = false;
    };
  }, [slug, token]);

  const name = useMemo(() => {
    if (!product) return "";
    return isAr ? product.nameAr || product.nameEn : product.nameEn || product.nameAr;
  }, [product, isAr]);

  const imageSrc = useMemo(() => resolvePrimaryImage(product), [product]);

  const price = useMemo(() => {
    const v = product?.pricing?.salePrice ?? product?.pricing?.originalPrice;
    return typeof v === "number" ? v : null;
  }, [product]);

  const stats = useMemo(() => {
    const seed = hashToNumber(slug);
    const views = 4500 + (seed % 6000);
    const purchases = 900 + (seed % 2100);
    const sales = price != null ? Math.round(price * (18 + (seed % 18))) : 12500 + (seed % 8000);
    const commission = 70 + (seed % 25);
    return { views, purchases, sales, commission };
  }, [slug, price]);

  const chartPoints = useMemo(() => {
    const seed = hashToNumber(slug + "-chart");
    const values = Array.from({ length: 12 }, (_, i) => 18 + ((seed + i * 17) % 60));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const w = 520;
    const h = 160;
    const pad = 14;
    const toX = (i: number) => pad + (i * (w - pad * 2)) / (values.length - 1);
    const toY = (v: number) => pad + ((max - v) * (h - pad * 2)) / Math.max(1, max - min);
    const d = values.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
    return { d, values };
  }, [slug]);

  const orders = useMemo(() => {
    const seed = hashToNumber(slug + "-orders");
    const names = [
      "Alice Johnson",
      "Bob Smith",
      "Catherine Lee",
      "Daniel Green",
      "Dianne Russell",
      "Wade Warren",
      "Albert Flores",
      "Bessie Cooper",
    ];
    const customerSubs = [
      "Procurement Dept.",
      "Dr. Sarah Jenkins",
      "Supply Manager",
      "Internal Pharmacy",
      "Purchasing",
      "Pharmacist",
      "Operations",
      "Admin",
    ];
    const sellers = [
      { name: "MedTech Solutions", sub: "Vendor" },
      { name: "Gloves & More Inc.", sub: "Supplier" },
      { name: "BioLab Supplies", sub: "Wholesaler" },
      { name: "PharmaDirect", sub: "Partner" },
    ];
    const paymentStatuses = ["paid", "pending", "refunded"] as const;
    const fulfillmentStatuses = ["shipped", "processing", "delivered", "cancelled"] as const;
    return Array.from({ length: 6 }, (_, i) => {
      const id = `#HM-${String(9250 + ((seed + i * 7) % 60))}`;
      const customer = names[(seed + i * 3) % names.length];
      const customerSub = customerSubs[(seed + i * 5) % customerSubs.length];
      const seller = sellers[(seed + i * 2) % sellers.length];
      const total = price != null ? Math.round(price * (1 + ((seed + i) % 3))) : 120 + ((seed + i * 11) % 600);
      const payment = paymentStatuses[(seed + i) % paymentStatuses.length];
      const fulfillment = fulfillmentStatuses[(seed + i * 3) % fulfillmentStatuses.length];
      const status =
        fulfillment === "cancelled"
          ? "cancelled"
          : fulfillment === "shipped"
            ? "shipped"
            : payment === "paid"
              ? "paid"
              : "pending";
      const qty = 1 + ((seed + i * 7) % 4);
      const date = new Date(Date.now() - ((seed + i * 3) % 12) * 24 * 60 * 60 * 1000).toISOString();
      const orderType = ((seed + i) % 3 === 0 ? "B2B" : "B2C") as
        | "B2B"
        | "B2C";
      return {
        id,
        customer,
        customerSub,
        sellerName: seller.name,
        sellerSub: seller.sub,
        date,
        total,
        payment,
        fulfillment,
        status,
        qty,
        orderType,
      };
    });
  }, [slug, price]);

  const transactions = useMemo(() => {
    const seed = hashToNumber(slug + "-tx");
    const items = [
      { title: "Paytm", sub: "Starbucks", amount: -520 },
      { title: "PayPal", sub: "Client Payment", amount: +800 },
      { title: "Stripe", sub: "Ordered: iPhone 14", amount: -300 },
      { title: "Razorpay", sub: "Refund", amount: +500 },
      { title: "Paytm", sub: "Starbucks", amount: -1500 },
    ];
    return items.map((it, i) => ({
      ...it,
      amount: it.amount + ((seed + i * 13) % 7) * (it.amount < 0 ? -10 : 10),
    }));
  }, [slug]);

  return (
    <div className="animate-in fade-in min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 duration-700">
      <div className="mx-auto max-w-[1440px] p-4 md:p-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/admin/products-2`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              aria-label={isAr ? "رجوع" : "Back"}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="text-xs font-semibold text-slate-500">
                {isAr ? "المخزون / تفاصيل المنتج" : "Inventory / Product Details"}
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
                {isAr ? "تفاصيل المنتج" : "Product Details"}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/${locale}/admin/products-2/${slug}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              {isAr ? "تعديل" : "Edit"}
            </Link>
            <Link
              href={product?.slugEn ? `/${locale}/product-details/${product.slugEn}` : `/${locale}/admin/products-2/details/${slug}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <PlayCircle className="h-4 w-4" />
              {isAr ? "معاينة" : "Preview"}
            </Link>
          </div>
        </div>

        {/* Header card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:gap-6 md:p-6">
            <div className="relative h-28 w-40 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200/50 md:h-28 md:w-44">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={name || ""}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 160px, 176px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">
                  <Sparkles className="h-8 w-8" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 md:text-xl">
                  {loading ? (isAr ? "جارٍ التحميل..." : "Loading...") : name || "—"}
                </h2>
                {product ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                    {(hashToNumber(product._id) % 2) === 0 ? (isAr ? "مخزون محدود" : "Limited stock") : (isAr ? "متوفر" : "In stock")}
                  </span>
                ) : null}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[11px] font-extrabold text-slate-700">
                    {(product?.seller && typeof product.seller === "object"
                      ? (product.seller.name || product.seller.firstName || "S")
                      : "S"
                    )
                      .toString()
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                  <span className="min-w-0 truncate">
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {isAr ? "البائع" : "Seller"}
                    </span>
                    <span className="block font-semibold text-slate-700">
                      {typeof product?.seller === "string"
                        ? product?.seller
                        : product?.seller?.name ||
                          [product?.seller?.firstName, product?.seller?.lastName]
                            .filter(Boolean)
                            .join(" ") ||
                          "—"}
                    </span>
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {isAr ? "الفئة" : "Category"}
                  </div>
                  <div className="font-semibold text-slate-700">
                    {product?.classification?.category || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {isAr ? "الفئة الفرعية" : "Subcategory"}
                  </div>
                  <div className="font-semibold text-slate-700">
                    {product?.classification?.subcategory || "—"}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {isAr ? "آخر تحديث" : "Last Update"}
                  </div>
                  <div className="font-semibold text-slate-700">
                    {formatDate(product?.createdAt, locale)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/60">
                  <Store className="h-4 w-4 text-slate-500" />
                  {product?.store || (isAr ? "متجر" : "Store")}
                </span>
                <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/60">
                  <BadgeCheck className="h-4 w-4 text-emerald-600" />
                  {product?.approved ? (isAr ? "موافق عليه" : "Approved") : isAr ? "غير موافق" : "Not approved"}
                </span>
                {price != null ? (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/60">
                    <ShoppingCart className="h-4 w-4 text-slate-500" />
                    {formatCurrency(price, locale)}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 bg-white px-4 py-2 md:px-6">
            <button
              type="button"
              onClick={() => setTab("overview")}
              className={[
                "inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition",
                tab === "overview"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
              ].join(" ")}
            >
              <BarChart3 className="h-4 w-4" />
              {isAr ? "نظرة عامة" : "Product Overview"}
            </button>
            <button
              type="button"
              onClick={() => setTab("orders")}
              className={[
                "inline-flex h-9 items-center gap-2 rounded-xl px-3 text-xs font-extrabold transition",
                tab === "orders"
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
              ].join(" ")}
            >
              <Users className="h-4 w-4" />
              {isAr ? "الطلبات" : "Orders"}
            </button>
          </div>
        </div>

        {!token ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
            {isAr
              ? "سجّل الدخول كمسؤول لعرض بيانات المنتج."
              : "Sign in as admin to view product data."}
          </div>
        ) : null}

        {tab === "overview" ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-9">
              {/* KPI cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    title: isAr ? "تكرار الشراء" : "Purchase Frequency",
                    value: formatNumber(stats.purchases, locale),
                    sub: isAr ? "↑ 12% من الشهر الماضي" : "↑ 12% from last month",
                    icon: ShoppingCart,
                    tint: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    title: isAr ? "إجمالي المبيعات" : "Total Sales",
                    value: formatCurrency(stats.sales, locale),
                    sub: isAr ? "↑ 9% من الشهر الماضي" : "↑ 9% from last month",
                    icon: BadgeCheck,
                    tint: "text-emerald-600",
                    bg: "bg-emerald-50",
                  },
                  {
                    title: isAr ? "إجمالي المشاهدات" : "Total Views",
                    value: formatNumber(stats.views, locale),
                    sub: isAr ? "↑ 15% من الشهر الماضي" : "↑ 15% from last month",
                    icon: Eye,
                    tint: "text-violet-600",
                    bg: "bg-violet-50",
                  },
                  {
                    title: isAr ? "العمولة" : "Commission",
                    value: `${stats.commission}%`,
                    sub: isAr ? "↑ 3% من الشهر الماضي" : "↑ 3% from last month",
                    icon: LineChart,
                    tint: "text-amber-600",
                    bg: "bg-amber-50",
                  },
                ].map((c, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="text-xs font-semibold text-slate-400">
                        {c.title}
                      </div>
                      <div className={`rounded-xl p-2 ${c.bg} ${c.tint}`}>
                        <c.icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="mt-2 text-lg font-extrabold text-slate-900">
                      {c.value}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-600">
                      {c.sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart + Transactions row */}
              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold text-slate-900">
                          {isAr ? "نظرة على المشاهدات عبر الوقت" : "Enrollment And Views Over Time"}
                        </div>
                        <div className="mt-0.5 text-xs font-medium text-slate-500">
                          {isAr ? "بيانات تقديرية للعرض فقط" : "Estimated demo data for UI"}
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                        <Calendar className="h-4 w-4 text-slate-500" />
                        {isAr ? "سنوي" : "Yearly"}
                      </div>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-xl bg-gradient-to-b from-slate-50 to-white ring-1 ring-slate-200/60">
                      <svg viewBox="0 0 520 160" className="h-44 w-full">
                        <defs>
                          <linearGradient id="lineGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d={`${chartPoints.d} L 506 146 L 14 146 Z`}
                          fill="url(#lineGrad)"
                        />
                        <path
                          d={chartPoints.d}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4">
                  <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold text-slate-900">
                        {isAr ? "المعاملات" : "Transactions"}
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700">
                        {isAr ? "هذا الشهر" : "This Month"}
                      </div>
                    </div>
                    <div className="mt-3 space-y-3">
                      {transactions.map((tx, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/60 p-3 ring-1 ring-slate-200/60">
                          <div className="min-w-0">
                            <div className="truncate text-xs font-extrabold text-slate-900">
                              {tx.title}
                            </div>
                            <div className="truncate text-[11px] font-semibold text-slate-500">
                              {tx.sub}
                            </div>
                          </div>
                          <div className={`text-xs font-extrabold ${tx.amount < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                            {tx.amount < 0 ? "-" : "+"}
                            {formatCurrency(Math.abs(tx.amount), locale)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent orders */}
              <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-slate-900">
                    {isAr ? "الطلبات الأخيرة" : "Recent Orders"}
                  </div>
                  <Link
                    href={`/${locale}/admin/orders`}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    {isAr ? "عرض الكل" : "View All"}
                  </Link>
                </div>

                <div className="mt-3 overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-xs">
                    <thead>
                      <tr className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        <th className="px-2 py-2">{isAr ? "رقم" : "Order ID"}</th>
                        <th className="px-2 py-2">{isAr ? "العميل" : "Customer"}</th>
                        <th className="px-2 py-2">{isAr ? "الإجمالي" : "Total"}</th>
                        <th className="px-2 py-2">{isAr ? "الحالة" : "Status"}</th>
                        <th className="px-2 py-2">{isAr ? "الكمية" : "Qty"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-t border-slate-100">
                          <td className="px-2 py-2 font-bold text-slate-700">
                            <Link
                              href={`/${locale}/admin/orders/${encodeURIComponent(
                                o.id.replace(/^#/, ""),
                              )}`}
                              className="underline-offset-4 hover:text-primary hover:underline"
                            >
                              {o.id}
                            </Link>
                          </td>
                          <td className="px-2 py-2 text-slate-700">{o.customer}</td>
                          <td className="px-2 py-2 font-bold text-slate-900">{formatCurrency(o.total, locale)}</td>
                          <td className="px-2 py-2">
                            <span
                              className={[
                                "inline-flex rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider",
                                o.status === "paid"
                                  ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                  : o.status === "pending"
                                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                                    : o.status === "shipped"
                                      ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                                      : "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
                              ].join(" ")}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="px-2 py-2 font-bold text-slate-700">{o.qty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* RIGHT: Top customers */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-extrabold text-slate-900">
                    {isAr ? "أفضل العملاء" : "Top Customers"}
                  </div>
                  <Link
                    href={`/${locale}/admin/customers`}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    {isAr ? "عرض الكل" : "View All"}
                  </Link>
                </div>

                <div className="mt-3 space-y-2">
                  {["Dianne Russell", "Wade Warren", "Albert Flores", "Bessie Cooper", "Arlene McCoy"].map((n, i) => {
                    const seed = hashToNumber(slug + n);
                    const ordersCount = 20 + (seed % 20);
                    const initial = n.slice(0, 1).toUpperCase();
                    return (
                      <div key={n} className="flex items-center justify-between rounded-xl bg-slate-50/60 p-3 ring-1 ring-slate-200/60">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-extrabold ${i % 2 === 0 ? "bg-blue-600 text-white" : "bg-rose-600 text-white"}`}>
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-extrabold text-slate-900">{n}</div>
                            <div className="text-[11px] font-semibold text-slate-500">017****{String(58 + (seed % 30))}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                            {isAr ? "طلبات" : "Orders"}
                          </div>
                          <div className="text-xs font-extrabold text-slate-900">{ordersCount}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <OrdersTab
            isAr={isAr}
            locale={locale}
            slug={slug}
            tokenPresent={!!token}
            rows={orders}
          />
        )}
      </div>
    </div>
  );
}

function OrdersTab({
  isAr,
  locale,
  slug,
  tokenPresent,
  rows,
}: {
  isAr: boolean;
  locale: string;
  slug: string;
  tokenPresent: boolean;
  rows: Array<{
    id: string;
    customer: string;
    customerSub: string;
    sellerName: string;
    sellerSub: string;
    date: string;
    total: number;
    payment: "paid" | "pending" | "refunded";
    fulfillment: "shipped" | "processing" | "delivered" | "cancelled";
    qty: number;
    orderType: "B2B" | "B2C";
  }>;
}) {
  const seed = useMemo(() => hashToNumber(slug + "-orders-metrics"), [slug]);
  const baseTotalOrders = 1180 + (seed % 420);
  const basePending = 120 + (seed % 120);
  const baseRevenue = 240000 + (seed % 320000);
  const baseAov = Math.max(80, Math.round(baseRevenue / Math.max(1, baseTotalOrders)));

  const sellers = useMemo(() => {
    const set = new Set(rows.map((r) => r.sellerName));
    return ["All Sellers", ...Array.from(set)];
  }, [rows]);

  const [filtersDraft, setFiltersDraft] = useState({
    dateRange: "last_30",
    seller: "All Sellers",
    fulfillment: "any",
    orderType: "b2b_b2c",
  });
  const [filtersApplied, setFiltersApplied] = useState(filtersDraft);
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filtersApplied.seller !== "All Sellers" && r.sellerName !== filtersApplied.seller) return false;
      if (filtersApplied.fulfillment !== "any" && r.fulfillment !== (filtersApplied.fulfillment as any)) return false;
      if (filtersApplied.orderType === "b2b" && r.orderType !== "B2B") return false;
      if (filtersApplied.orderType === "b2c" && r.orderType !== "B2C") return false;
      return true;
    });
  }, [rows, filtersApplied]);

  const totalPages = Math.max(1, Math.ceil(baseTotalOrders / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(baseTotalOrders, safePage * pageSize);

  const visibleRows = useMemo(() => {
    const startIdx = (safePage - 1) * pageSize;
    return filtered.slice(startIdx, startIdx + pageSize);
  }, [filtered, safePage]);

  useEffect(() => {
    setPage(1);
  }, [filtersApplied]);

  const applyFilters = () => setFiltersApplied(filtersDraft);

  return (
    <div className="mt-6 space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: isAr ? "إجمالي الطلبات" : "Total Orders",
            value: formatNumber(baseTotalOrders, locale),
            sub: isAr ? "↑ 12.5% مقابل الشهر الماضي" : "↑ 12.5% vs last month",
            subTone: "text-emerald-600",
            iconBg: "bg-emerald-50",
            iconTone: "text-emerald-700",
            icon: ShoppingCart,
          },
          {
            title: isAr ? "طلبات قيد التنفيذ" : "Pending Fulfillment",
            value: formatNumber(basePending, locale),
            sub: isAr ? "↓ 4.2% مقابل الأمس" : "↓ 4.2% vs yesterday",
            subTone: "text-rose-600",
            iconBg: "bg-orange-50",
            iconTone: "text-orange-700",
            icon: Users,
          },
          {
            title: isAr ? "إجمالي الإيراد" : "Total Revenue",
            value: formatCurrency(baseRevenue, locale),
            sub: isAr ? "↑ 8.1% مقابل الشهر الماضي" : "↑ 8.1% vs last month",
            subTone: "text-emerald-600",
            iconBg: "bg-emerald-50",
            iconTone: "text-emerald-700",
            icon: LineChart,
          },
          {
            title: isAr ? "متوسط قيمة الطلب" : "Average Order Value",
            value: formatCurrency(baseAov, locale),
            sub: isAr ? "↑ 2.4% مقابل المتوسط" : "↑ 2.4% vs avg.",
            subTone: "text-emerald-600",
            iconBg: "bg-blue-50",
            iconTone: "text-blue-700",
            icon: BarChart3,
          },
        ].map((c, i) => (
          <div key={i} className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="text-[11px] font-extrabold uppercase tracking-widest text-slate-500">
                {c.title}
              </div>
              <div className={`rounded-xl p-2 ${c.iconBg} ${c.iconTone}`}>
                <c.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-xl font-extrabold text-slate-900">{c.value}</div>
            <div className={`mt-1 text-[11px] font-semibold ${c.subTone}`}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
          <div className="md:col-span-3">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {isAr ? "نطاق التاريخ" : "Date Range"}
            </div>
            <select
              value={filtersDraft.dateRange}
              onChange={(e) => setFiltersDraft((s) => ({ ...s, dateRange: e.target.value }))}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
            >
              <option value="last_7">{isAr ? "آخر 7 أيام" : "Last 7 Days"}</option>
              <option value="last_30">{isAr ? "آخر 30 يوم" : "Last 30 Days"}</option>
              <option value="last_90">{isAr ? "آخر 90 يوم" : "Last 90 Days"}</option>
              <option value="this_year">{isAr ? "هذا العام" : "This Year"}</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {isAr ? "البائع" : "Seller"}
            </div>
            <select
              value={filtersDraft.seller}
              onChange={(e) => setFiltersDraft((s) => ({ ...s, seller: e.target.value }))}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
            >
              {sellers.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {isAr ? "حالة التنفيذ" : "Fulfillment Status"}
            </div>
            <select
              value={filtersDraft.fulfillment}
              onChange={(e) => setFiltersDraft((s) => ({ ...s, fulfillment: e.target.value }))}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
            >
              <option value="any">{isAr ? "أي حالة" : "Any Status"}</option>
              <option value="processing">{isAr ? "قيد المعالجة" : "Processing"}</option>
              <option value="shipped">{isAr ? "تم الشحن" : "Shipped"}</option>
              <option value="delivered">{isAr ? "تم التسليم" : "Delivered"}</option>
              <option value="cancelled">{isAr ? "ملغي" : "Cancelled"}</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {isAr ? "نوع الطلب" : "Order Type"}
            </div>
            <select
              value={filtersDraft.orderType}
              onChange={(e) => setFiltersDraft((s) => ({ ...s, orderType: e.target.value }))}
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
            >
              <option value="b2b_b2c">{isAr ? "B2B & B2C" : "B2B & B2C"}</option>
              <option value="b2b">{isAr ? "B2B فقط" : "B2B only"}</option>
              <option value="b2c">{isAr ? "B2C فقط" : "B2C only"}</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              type="button"
              onClick={applyFilters}
              disabled={!tokenPresent}
              className="h-10 w-full rounded-xl bg-slate-900 px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAr ? "تطبيق" : "Apply Filters"}
            </button>
          </div>
        </div>
        {!tokenPresent ? (
          <div className="mt-2 text-xs font-medium text-slate-400">
            {isAr ? "سجّل الدخول لعرض بيانات الطلبات." : "Sign in to view orders data."}
          </div>
        ) : null}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50/60 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="px-4 py-3">{isAr ? "رقم الطلب" : "Order ID"}</th>
                <th className="px-4 py-3">{isAr ? "العميل" : "Customer"}</th>
                <th className="px-4 py-3">{isAr ? "البائع" : "Seller"}</th>
                <th className="px-4 py-3">{isAr ? "التاريخ" : "Date"}</th>
                <th className="px-4 py-3">{isAr ? "الإجمالي" : "Total"}</th>
                <th className="px-4 py-3">{isAr ? "الدفع" : "Payment"}</th>
                <th className="px-4 py-3">{isAr ? "التنفيذ" : "Fulfillment"}</th>
                <th className="px-4 py-3">{isAr ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/40">
                  <td className="px-4 py-4 font-extrabold text-slate-900">
                    <Link
                      href={`/${locale}/admin/orders/${encodeURIComponent(
                        r.id.replace("#", ""),
                      )}`}
                      className="inline-flex cursor-pointer items-center text-slate-900 underline-offset-4 hover:text-primary hover:underline"
                      title={isAr ? "فتح تفاصيل الطلب" : "Open order details"}
                    >
                      {r.id}
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900">{r.customer}</div>
                    <div className="text-[11px] font-semibold text-slate-500">{r.customerSub}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-slate-900">{r.sellerName}</div>
                    <div className="text-[11px] font-semibold text-slate-500">{r.sellerSub}</div>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{formatDate(r.date, locale)}</td>
                  <td className="px-4 py-4 font-extrabold text-slate-900">{formatCurrency(r.total, locale)}</td>
                  <td className="px-4 py-4">
                    <span
                      className={[
                        "inline-flex rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest",
                        r.payment === "paid"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : r.payment === "pending"
                            ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                            : "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
                      ].join(" ")}
                    >
                      {r.payment}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={[
                        "inline-flex rounded-md px-2 py-1 text-[10px] font-extrabold uppercase tracking-widest",
                        r.fulfillment === "delivered"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : r.fulfillment === "shipped"
                            ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                            : r.fulfillment === "processing"
                              ? "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
                              : "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
                      ].join(" ")}
                    >
                      {r.fulfillment}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Link
                        href={`/${locale}/admin/orders/${encodeURIComponent(
                          r.id.replace("#", ""),
                        )}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50"
                        aria-label={isAr ? "عرض" : "View"}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50"
                        aria-label={isAr ? "رسالة" : "Message"}
                      >
                        <Mail className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visibleRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm font-semibold text-slate-500">
                    {isAr ? "لا توجد نتائج" : "No results"}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-medium text-slate-500">
            {isAr
              ? `عرض ${start} إلى ${end} من ${formatNumber(baseTotalOrders, locale)} نتيجة`
              : `Showing ${start} to ${end} of ${formatNumber(baseTotalOrders, locale)} results`}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={isAr ? "السابق" : "Previous"}
            >
              ‹
            </button>
            {[safePage - 1, safePage, safePage + 1]
              .filter((n) => n >= 1 && n <= totalPages)
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

