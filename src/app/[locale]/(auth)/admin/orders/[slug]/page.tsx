"use client";

import { use, useMemo, useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Ban,
  Download,
  FileText,
  Phone,
  User,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useAppLocale } from "@/hooks/useAppLocale";

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

function formatDateTime(value: Date, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.DateTimeFormat(loc, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

type PaymentStatus = "paid" | "pending" | "refunded";
type FulfillmentStatus = "shipped" | "processing" | "delivered" | "cancelled";

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const locale = useAppLocale();
  const isAr = locale === "ar";

  const seed = useMemo(() => hashToNumber(slug), [slug]);
  const orderIdDisplay = useMemo(
    () => (slug.startsWith("#") ? slug : `#${slug}`),
    [slug],
  );

  const [note, setNote] = useState("");

  const fulfillment: FulfillmentStatus = useMemo(() => {
    const opts: FulfillmentStatus[] = ["shipped", "processing", "delivered", "cancelled"];
    return opts[seed % opts.length];
  }, [seed]);

  const statusBadge = useMemo(() => {
    if (fulfillment === "delivered")
      return { label: isAr ? "تم التسليم" : "Delivered", cls: "bg-emerald-50 text-emerald-700 ring-emerald-100" };
    if (fulfillment === "shipped")
      return { label: isAr ? "تم الشحن" : "Shipped", cls: "bg-blue-50 text-blue-700 ring-blue-100" };
    if (fulfillment === "processing")
      return { label: isAr ? "قيد المعالجة" : "Processing", cls: "bg-slate-100 text-slate-700 ring-slate-200" };
    return { label: isAr ? "ملغي" : "Cancelled", cls: "bg-rose-50 text-rose-700 ring-rose-100" };
  }, [fulfillment, isAr]);

  const payment: PaymentStatus = useMemo(() => {
    const opts: PaymentStatus[] = ["paid", "pending", "refunded"];
    return opts[(seed >> 2) % opts.length];
  }, [seed]);

  const placedAt = useMemo(() => new Date(Date.now() - ((seed % 14) + 1) * 60 * 60 * 1000), [seed]);

  const customer = useMemo(() => {
    const names = ["John Doe", "City General Hospital", "Riverside Clinic", "Advanced Diagnostics", "St. Mary's Pediatric"];
    const name = names[(seed >> 3) % names.length];
    const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "JD";
    return {
      name,
      initials,
      email: "j.doe@hospital.org",
      phone: "+1 (555) 012-3456",
    };
  }, [seed]);

  const addresses = useMemo(() => {
    return {
      shipping: {
        title: isAr ? "عنوان الشحن" : "Shipping Address",
        lines: ["City General Hospital", "123 Medical Plaza, North Wing", "Chicago, IL 60601"],
      },
      billing: {
        title: isAr ? "عنوان الفاتورة" : "Billing Address",
        lines: ["City General Hospital", "Central Accounts Office", "Chicago, IL 60601"],
      },
    };
  }, [isAr]);

  const items = useMemo(() => {
    const base = [
      { name: "Elite Flex Medical Scrubs", sku: "SCR-220-N", img: "/images/products/1.png", unit: 45, qty: 12, meta: "Size: Large, Color: Navy Blue" },
      { name: "Professional Lab Coat", sku: "LCO-110-W", img: "/images/products/2.png", unit: 60, qty: 5, meta: "Unisex, White" },
      { name: "N95 Protective Masks", sku: "MSK-N95-B", img: "/images/products/3.png", unit: 25, qty: 10, meta: "Box of 50" },
    ];
    // deterministic slight variations
    return base.map((it, i) => {
      const qty = it.qty + ((seed + i) % 3);
      return { ...it, qty };
    });
  }, [seed]);

  const money = useMemo(() => {
    const subtotal = items.reduce((sum, it) => sum + it.unit * it.qty, 0);
    const taxes = Math.round(subtotal * 0.085 * 100) / 100;
    const shipping = 0;
    const total = Math.round((subtotal + taxes + shipping) * 100) / 100;
    return { subtotal, taxes, shipping, total };
  }, [items]);

  const history = useMemo(() => {
    const steps = [
      { title: isAr ? "استلام من شركة الشحن" : "Picked up by Courier", time: "Oct 26, 2023, 02:30 PM", note: "Carrier: FedEx Express (#FDX-001)" },
      { title: isAr ? "تمت الطباعة بواسطة المسؤول" : "Label Printed by Admin", time: "Oct 25, 2023, 09:15 AM", note: "Alexander Davis" },
      { title: isAr ? "معالجة المخزن" : "Warehouse Processing", time: "Oct 24, 2023, 04:00 PM", note: "" },
      { title: isAr ? "تأكيد الدفع" : "Payment Confirmed", time: "Oct 24, 2023, 10:50 AM", note: "" },
      { title: isAr ? "تم إنشاء الطلب" : "Order Placed by Customer", time: "Oct 24, 2023, 10:45 AM", note: "" },
    ];
    const cut = Math.max(2, Math.min(steps.length, 2 + (seed % steps.length)));
    return steps.slice(0, cut);
  }, [seed, isAr]);

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F8FAFC] p-4 duration-700 md:p-8">
      <div className="mx-auto max-w-[1440px]">
        {/* Breadcrumb */}
        <div className="mb-4 text-xs font-medium text-slate-400">
          <Link href={`/${locale}/admin`} className="hover:text-slate-600">
            {isAr ? "لوحة التحكم" : "Dashboard"}
          </Link>{" "}
          <span className="mx-1">›</span>
          <Link href={`/${locale}/admin/orders`} className="hover:text-slate-600">
            {isAr ? "الطلبات" : "Orders"}
          </Link>{" "}
          <span className="mx-1">›</span>
          <span className="text-slate-700">{orderIdDisplay}</span>
        </div>

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
                {isAr ? "طلب" : "Order"} {orderIdDisplay}
              </h1>
              <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${statusBadge.cls}`}>
                <BadgeCheck className="h-4 w-4" />
                {statusBadge.label}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {isAr ? "تم الطلب في" : "Placed on"} {formatDateTime(placedAt, locale)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              {isAr ? "طباعة الفاتورة" : "Print Invoice"}
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <FileText className="h-4 w-4" />
              {isAr ? "تعديل الطلب" : "Edit Order"}
            </button>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-extrabold text-rose-700 shadow-sm transition hover:bg-rose-100/70"
            >
              <Ban className="h-4 w-4" />
              {isAr ? "إلغاء الطلب" : "Cancel Order"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-8">
            {/* Customer info */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <User className="h-4 w-4" />
                  </span>
                  <h2 className="text-sm font-extrabold">
                    {isAr ? "معلومات العميل" : "Customer Information"}
                  </h2>
                </div>
                <button type="button" className="text-xs font-extrabold text-emerald-700 hover:underline">
                  {isAr ? "عرض الملف" : "View Profile"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-4">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    {isAr ? "تفاصيل الاتصال" : "Contact Details"}
                  </div>
                  <div className="mt-3 flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-100">
                      {customer.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-slate-900">{customer.name}</div>
                      <div className="text-xs font-medium text-slate-500">{customer.email}</div>
                      <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    {addresses.shipping.title}
                  </div>
                  <div className="mt-3 space-y-1 text-xs font-semibold text-slate-600">
                    {addresses.shipping.lines.map((l) => (
                      <div key={l}>{l}</div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                    {addresses.billing.title}
                  </div>
                  <div className="mt-3 space-y-1 text-xs font-semibold text-slate-600">
                    {addresses.billing.lines.map((l) => (
                      <div key={l}>{l}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order items */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <FileText className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-extrabold">{isAr ? "عناصر الطلب" : "Order Items"}</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                      <th className="px-2 py-2">{isAr ? "المنتج" : "Product"}</th>
                      <th className="px-2 py-2">{isAr ? "SKU" : "SKU"}</th>
                      <th className="px-2 py-2">{isAr ? "الكمية" : "Quantity"}</th>
                      <th className="px-2 py-2">{isAr ? "سعر الوحدة" : "Unit Price"}</th>
                      <th className="px-2 py-2">{isAr ? "الإجمالي" : "Total"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.sku} className="border-t border-slate-100">
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/60">
                              <Image
                                src={it.img}
                                alt={it.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="truncate text-xs font-extrabold text-slate-900">{it.name}</div>
                              <div className="truncate text-[11px] font-semibold text-slate-500">{it.meta}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3 font-semibold text-slate-700">{it.sku}</td>
                        <td className="px-2 py-3 font-semibold text-slate-700">{it.qty}</td>
                        <td className="px-2 py-3 font-semibold text-slate-700">{formatCurrency(it.unit, locale)}</td>
                        <td className="px-2 py-3 font-extrabold text-slate-900">{formatCurrency(it.unit * it.qty, locale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <FileText className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-extrabold">{isAr ? "ملاحظات داخلية" : "Admin Internal Notes"}</h2>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={isAr ? "أضف ملاحظة عن هذا الطلب..." : "Add a note about this order..."}
                className="min-h-[110px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/40 p-4 text-sm outline-none ring-emerald-200 focus:ring-2"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="text-[11px] font-medium text-slate-400">
                  {isAr ? "الملاحظات مرئية لفريق المتجر فقط." : "Notes are only visible to marketplace staff."}
                </div>
                <button
                  type="button"
                  className="h-10 rounded-xl bg-emerald-600 px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  {isAr ? "حفظ الملاحظة" : "Save Note"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6 lg:col-span-4">
            {/* Payment summary */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-extrabold">{isAr ? "ملخص الدفع" : "Payment Summary"}</h2>
              </div>

              <div className="rounded-2xl bg-emerald-50/40 p-4 ring-1 ring-emerald-100">
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700/70">
                  {isAr ? "طريقة الدفع" : "Payment Method"}
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="text-xs font-extrabold text-slate-900">
                    {isAr ? "Visa تنتهي بـ 4242" : "Visa ending in 4242"}
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-700">
                    {payment === "paid" ? (isAr ? "مدفوع" : "PAID") : payment.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>{isAr ? "الإجمالي الفرعي" : "Subtotal"}</span>
                  <span className="font-semibold">{formatCurrency(money.subtotal, locale)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>{isAr ? "الضرائب (8.5%)" : "Taxes (8.5%)"}</span>
                  <span className="font-semibold">{formatCurrency(money.taxes, locale)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>{isAr ? "رسوم الشحن" : "Shipping Fees"}</span>
                  <span className="font-semibold">{money.shipping === 0 ? (isAr ? "مجاني" : "Free") : formatCurrency(money.shipping, locale)}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="flex items-end justify-between">
                  <div className="text-sm font-extrabold text-slate-900">{isAr ? "الإجمالي" : "Total Amount"}</div>
                  <div className="text-lg font-extrabold text-emerald-700">{formatCurrency(money.total, locale)}</div>
                </div>
                <div className="mt-3 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 ring-1 ring-emerald-100">
                  {payment === "paid" ? (isAr ? "مدفوع بالكامل" : "PAID IN FULL") : payment.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Order history */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-slate-900">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <BadgeCheck className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-extrabold">{isAr ? "سجل الطلب" : "Order History"}</h2>
              </div>

              <div className="relative space-y-4">
                <div className="absolute left-4 top-0 h-full w-px bg-slate-200" />
                {history.map((h, idx) => {
                  const active = idx < 2;
                  return (
                    <div key={h.title} className="relative flex gap-3 pl-10">
                      <div
                        className={[
                          "absolute left-[9px] top-1.5 flex h-8 w-8 items-center justify-center rounded-full ring-1",
                          active
                            ? "bg-emerald-600 text-white ring-emerald-200"
                            : "bg-slate-100 text-slate-500 ring-slate-200",
                        ].join(" ")}
                      >
                        <BadgeCheck className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-slate-900">{h.title}</div>
                        <div className="text-[11px] font-semibold text-slate-500">{h.time}</div>
                        {h.note ? (
                          <div className="mt-0.5 text-[11px] font-medium text-slate-500">
                            {h.note}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

