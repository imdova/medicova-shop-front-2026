"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Checkbox } from "@/components/shared/Check-Box";
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  Clipboard,
  ImagePlus,
  Search,
  ShieldCheck,
  Upload,
} from "lucide-react";

type ReturnItem = {
  id: string;
  name: string;
  sku: string;
  orderQty: number;
  maxReturnQty: number;
};

type ResolutionType = "refund" | "exchange" | "store_credit";

function formatDateLabel(locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.DateTimeFormat(loc, { month: "short", day: "2-digit", year: "numeric" }).format(
    new Date(),
  );
}

export default function CreateReturnRequestPage() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  // Step 1: Order lookup
  const [orderRef, setOrderRef] = useState("HM-2024-8831");
  const [customerLookup, setCustomerLookup] = useState("");
  const [verified, setVerified] = useState(false);

  // Step 2: Items
  const [items, setItems] = useState<ReturnItem[]>([
    {
      id: "gloves",
      name: "Sterile Surgical Gloves (Pack of 50)",
      sku: "SG-88-MED",
      orderQty: 10,
      maxReturnQty: 10,
    },
    {
      id: "monitor",
      name: "Portable Digital BP Monitor",
      sku: "BP-70-DIG",
      orderQty: 1,
      maxReturnQty: 1,
    },
    {
      id: "masks",
      name: "N95 Protective Masks",
      sku: "MSK-N95-PRO",
      orderQty: 100,
      maxReturnQty: 100,
    },
  ]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>(["gloves", "masks"]);
  const [returnQty, setReturnQty] = useState<Record<string, number>>({
    gloves: 2,
    monitor: 0,
    masks: 50,
  });

  // Step 3: Reason + Resolution
  const [primaryReason, setPrimaryReason] = useState("damaged_packaging");
  const [resolution, setResolution] = useState<ResolutionType>("refund");
  const [notes, setNotes] = useState("");

  // Step 4: Evidence upload
  const [files, setFiles] = useState<File[]>([]);
  const previews = useMemo(() => {
    return files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));
  }, [files]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  const selectedItems = useMemo(() => {
    const s = new Set(selectedItemIds);
    return items
      .filter((i) => s.has(i.id))
      .map((i) => ({
        ...i,
        qty: Math.max(0, Math.min(i.maxReturnQty, returnQty[i.id] ?? 0)),
      }))
      .filter((i) => i.qty > 0);
  }, [items, returnQty, selectedItemIds]);

  const canSubmit = verified && selectedItems.length > 0;

  const onVerify = () => {
    setVerified(true);
  };

  const onCancel = () => {
    alert(isArabic ? "تم الإلغاء (واجهة فقط)" : "Cancelled (UI only)");
  };

  const onSaveDraft = () => {
    alert(isArabic ? "تم حفظ المسودة (واجهة فقط)" : "Saved as draft (UI only)");
  };

  const onSubmit = () => {
    alert(isArabic ? "تم إرسال الطلب (واجهة فقط)" : "Return request submitted (UI only)");
  };

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F8FAFC] p-4 duration-700 md:p-8" dir={isArabic ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-[1200px]">
        {/* Breadcrumbs */}
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/admin/returns" className="hover:text-slate-700">
            {isArabic ? "المرتجعات" : "Returns"}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{isArabic ? "إضافة مرتجع" : "Add New Return"}</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {isArabic ? "إنشاء طلب مرتجع" : "Create Return Request"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
              {isArabic
                ? "ابدأ ووثّق طلب إرجاع جديد للإمدادات الطبية ومعدات الرعاية الصحية."
                : "Initiate and document a new return for medical supplies and healthcare equipment."}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Step 1 */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                1
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {isArabic ? "بحث الطلب" : "Order Lookup"}
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-[12px] font-semibold text-slate-600">
                    {isArabic ? "رقم الطلب أو المرجع" : "Order ID or Reference"}
                  </div>
                  <div className="relative">
                    <Clipboard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={orderRef}
                      onChange={(e) => setOrderRef(e.target.value)}
                      className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-[12px] font-semibold text-slate-600">
                    {isArabic ? "اسم العميل / رقم" : "Customer Name / ID"}
                  </div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={customerLookup}
                      onChange={(e) => setCustomerLookup(e.target.value)}
                      placeholder={isArabic ? "ابحث بالاسم" : "Search by name"}
                      className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onVerify}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {isArabic ? "تحقق من الطلب" : "Verify Order"}
                </button>
              </div>

              {verified ? (
                <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 ring-1 ring-emerald-100">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-slate-900">
                        {isArabic ? "تم التحقق من الطلب" : "Order Verified"}
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-500">
                        {isArabic ? "التاريخ" : "Date"}: {formatDateLabel(locale)} •{" "}
                        {isArabic ? "المرجع" : "Ref"}: {orderRef}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* Step 2 */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                2
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {isArabic ? "اختيار العناصر" : "Item Selection"}
              </div>
            </div>

            <div className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <th className="px-3 py-3">{isArabic ? "اختر" : "Select"}</th>
                      <th className="px-3 py-3">{isArabic ? "العنصر الطبي" : "Medical Item"}</th>
                      <th className="px-3 py-3">SKU</th>
                      <th className="px-3 py-3">{isArabic ? "كمية الطلب" : "Order Qty"}</th>
                      <th className="px-3 py-3">{isArabic ? "كمية المرتجع" : "Return Qty"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => {
                      const checked = selectedItemIds.includes(it.id);
                      const qty = returnQty[it.id] ?? 0;
                      return (
                        <tr key={it.id} className="border-b border-slate-100 last:border-b-0">
                          <td className="px-3 py-3">
                            <Checkbox
                              id={`sel-${it.id}`}
                              checked={checked}
                              onCheckedChange={() => {
                                setSelectedItemIds((prev) =>
                                  prev.includes(it.id)
                                    ? prev.filter((x) => x !== it.id)
                                    : [...prev, it.id],
                                );
                              }}
                            />
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-semibold text-slate-900">{it.name}</div>
                          </td>
                          <td className="px-3 py-3 text-xs font-semibold text-slate-500">{it.sku}</td>
                          <td className="px-3 py-3 text-sm font-semibold text-slate-700">{it.orderQty}</td>
                          <td className="px-3 py-3">
                            <Input
                              type="number"
                              value={qty}
                              onChange={(e) => {
                                const v = Number.parseInt(e.target.value || "0", 10) || 0;
                                setReturnQty((prev) => ({
                                  ...prev,
                                  [it.id]: Math.max(0, Math.min(it.maxReturnQty, v)),
                                }));
                              }}
                              disabled={!checked}
                              className="h-10 w-24 rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-50"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-xs font-semibold text-slate-500">
                {isArabic ? "العناصر المحددة" : "Selected items"}:{" "}
                <span className="font-extrabold text-slate-900">{selectedItems.length}</span>
              </div>
            </div>
          </section>

          {/* Step 3 */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                3
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {isArabic ? "سبب المرتجع والحل" : "Return Reason & Resolution"}
              </div>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                <div className="lg:col-span-6">
                  <div className="mb-1 text-[12px] font-semibold text-slate-600">
                    {isArabic ? "سبب المرتجع الأساسي" : "Primary Return Reason"}
                  </div>
                  <select
                    value={primaryReason}
                    onChange={(e) => setPrimaryReason(e.target.value)}
                    className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="damaged_packaging">{isArabic ? "تلف التغليف" : "Damaged Packaging"}</option>
                    <option value="wrong_item">{isArabic ? "عنصر غير صحيح" : "Wrong Item"}</option>
                    <option value="defective">{isArabic ? "منتج معيب" : "Defective"}</option>
                    <option value="other">{isArabic ? "أخرى" : "Other"}</option>
                  </select>

                  <div className="mt-5 text-[12px] font-semibold text-slate-600">
                    {isArabic ? "نوع الحل" : "Resolution Type"}
                  </div>
                  <div className="mt-2 space-y-3">
                    {[
                      {
                        key: "refund" as const,
                        title: isArabic ? "استرداد" : "Refund",
                        desc: isArabic
                          ? "إرجاع الأموال إلى طريقة الدفع الأصلية."
                          : "Return funds to original payment method.",
                      },
                      {
                        key: "exchange" as const,
                        title: isArabic ? "استبدال" : "Exchange",
                        desc: isArabic
                          ? "استبدال العنصر وإرساله للعميل."
                          : "Replace item(s) and ship to customer.",
                      },
                      {
                        key: "store_credit" as const,
                        title: isArabic ? "رصيد متجر" : "Store Credit",
                        desc: isArabic
                          ? "إصدار رصيد/قسيمة لاستخدام مستقبلي."
                          : "Issue credit/voucher for future use.",
                      },
                    ].map((opt) => {
                      const active = resolution === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => setResolution(opt.key)}
                          className={[
                            "w-full rounded-2xl border p-4 text-left transition",
                            active
                              ? "border-emerald-200 bg-emerald-50/40 ring-1 ring-emerald-100"
                              : "border-slate-200/70 bg-white hover:bg-slate-50/40",
                          ].join(" ")}
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={[
                                "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-1",
                                active
                                  ? "bg-emerald-600 text-white ring-emerald-200"
                                  : "bg-white text-slate-300 ring-slate-200",
                              ].join(" ")}
                            >
                              {active ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                            </span>
                            <div>
                              <div className="text-sm font-extrabold text-slate-900">{opt.title}</div>
                              <div className="mt-0.5 text-xs font-semibold text-slate-500">{opt.desc}</div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="mb-1 text-[12px] font-semibold text-slate-600">
                    {isArabic ? "ملاحظات وتفاصيل الفحص" : "Inspection Notes & Details"}
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={isArabic ? "أضف ملاحظات الفحص هنا..." : "Add detailed inspection notes here..."}
                    className="min-h-[210px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 4 */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                4
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                {isArabic ? "الأدلة ورفع الصور" : "Evidence & Photo Upload"}
              </div>
            </div>

            <div className="p-5">
              <div className="flex flex-wrap gap-4">
                <label className="group flex h-28 w-44 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-slate-500 transition hover:bg-slate-50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const list = Array.from(e.target.files ?? []);
                      if (!list.length) return;
                      setFiles((prev) => [...prev, ...list].slice(0, 6));
                      e.currentTarget.value = "";
                    }}
                  />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                    <Upload className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="mt-2 text-xs font-extrabold">
                    {isArabic ? "رفع صورة" : "Upload Photo"}
                  </div>
                </label>

                {previews.map((p) => (
                  <div key={p.url} className="relative h-28 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <Image src={p.url} alt={p.file.name} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setFiles((prev) => prev.filter((f) => f !== p.file))}
                      className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/90 text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-white"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-xs font-semibold text-slate-500">
                {isArabic
                  ? "الصيغ المدعومة: JPG, PNG. الحد الأقصى: 10MB لكل ملف."
                  : "Supported formats: JPG, PNG. Max size: 10MB per file."}
              </div>
            </div>
          </section>

          {/* Footer actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="h-11 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              {isArabic ? "إلغاء المرتجع" : "Cancel Return"}
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                className="h-11 rounded-xl border-emerald-200 bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-100"
              >
                {isArabic ? "حفظ كمسودة" : "Save as Draft"}
              </Button>
              <Button
                type="button"
                onClick={onSubmit}
                disabled={!canSubmit}
                className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
                {isArabic ? "إرسال طلب المرتجع" : "Submit Return Request"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

