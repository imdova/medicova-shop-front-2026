"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Link } from "@/i18n/navigation";
import {
  BadgeCheck,
  ClipboardList,
  DollarSign,
  FileText,
  Package,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";

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

type ReturnStatus = "pending" | "approved" | "refunded" | "rejected";

export default function ReturnDetailsPage() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const params = useParams();
  const slug = decodeURIComponent(String(params.slug || ""));

  const model = useMemo(() => {
    const seed = hashToNumber(`return:${slug}`);
    const status: ReturnStatus =
      seed % 9 === 0
        ? "rejected"
        : seed % 4 === 0
          ? "refunded"
          : seed % 3 === 0
            ? "approved"
            : "pending";

    const customer =
      seed % 3 === 0
        ? "Alice Miller"
        : seed % 3 === 1
          ? "Robert Brown"
          : "Sarah Kane";
    const seller =
      seed % 3 === 0
        ? "MedSupply Co."
        : seed % 3 === 1
          ? "BioTech Solutions"
          : "HealthWare Direct";

    const items = [
      { name: "Sterile Surgical Gloves (Pack of 50)", sku: "SG-88-MED", qty: 2 + (seed % 3) },
      { name: "N95 Protective Masks", sku: "MSK-N95-PRO", qty: 10 + (seed % 40) },
    ];

    const refundValue = 120 + (seed % 950) + (seed % 100) / 100;
    const createdAt = new Date(Date.UTC(2023, 9, 20 + (seed % 6), 10, 30));

    return { status, customer, seller, items, refundValue, createdAt };
  }, [slug]);

  const statusTone =
    model.status === "approved"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
      : model.status === "refunded"
        ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
        : model.status === "rejected"
          ? "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-100";

  const statusLabel =
    model.status === "approved"
      ? isArabic
        ? "معتمد"
        : "Approved"
      : model.status === "refunded"
        ? isArabic
          ? "مسترد"
          : "Refunded"
        : model.status === "rejected"
          ? isArabic
            ? "مرفوض"
            : "Rejected"
          : isArabic
            ? "قيد الانتظار"
            : "Pending";

  const dateLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(model.createdAt);

  return (
    <div className="animate-in fade-in space-y-6 duration-700">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/admin/returns" className="hover:text-slate-700">
          {isArabic ? "المرتجعات" : "Returns"}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="truncate text-slate-600">{slug}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900">
                {isArabic ? "تفاصيل المرتجع" : "Return Details"}{" "}
                <span className="text-slate-400">{slug}</span>
              </h1>
              <div className="mt-1 text-sm font-medium text-slate-500">
                {isArabic ? "تم الإنشاء" : "Created"}: {dateLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${statusTone}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold text-slate-900">
              {isArabic ? "العناصر المرتجعة" : "Returned Items"}
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">{isArabic ? "العنصر" : "Item"}</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">{isArabic ? "الكمية" : "Qty"}</th>
                  </tr>
                </thead>
                <tbody>
                  {model.items.map((it) => (
                    <tr key={it.sku} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-3 font-semibold text-slate-900">{it.name}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-500">{it.sku}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">{it.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              {isArabic ? "السبب والملاحظات" : "Reason & Notes"}
            </div>
            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/40 p-4 text-sm font-medium text-slate-700">
              {isArabic
                ? "سبب افتراضي: تلف في التغليف أثناء الشحن."
                : "Default reason: Packaging damage during shipping."}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="text-sm font-extrabold text-slate-900">
              {isArabic ? "الملخص" : "Summary"}
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="h-4 w-4 text-slate-400" />
                <span className="font-semibold">{model.customer}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Package className="h-4 w-4 text-slate-400" />
                <span className="font-semibold">{model.seller}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Truck className="h-4 w-4 text-slate-400" />
                <span className="font-semibold">{isArabic ? "استلام المرتجع: قيد الانتظار" : "Pickup: Pending"}</span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/40 p-4">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                <span>{isArabic ? "قيمة الاسترداد" : "Refund Value"}</span>
                <span className="font-extrabold text-emerald-700">
                  {formatCurrency(model.refundValue, locale)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
              <BadgeCheck className="h-4 w-4 text-emerald-700" />
              {isArabic ? "الإجراءات" : "Actions"}
            </div>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <DollarSign className="h-4 w-4" />
                {isArabic ? "اعتماد الاسترداد" : "Approve Refund"}
              </button>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <FileText className="h-4 w-4" />
                {isArabic ? "تصدير PDF" : "Export PDF"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

