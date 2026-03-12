"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  BadgeCheck,
  Calendar,
  CircleDollarSign,
  ClipboardList,
  Package,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { ProductFormData } from "@/lib/validations/product-schema";

interface Step3SettingsProps {
  product: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
  locale: string;
}

type ColorImageEntry = { color: string; colorHex?: string; imageIdx?: number; imageUrl?: string };
type VariantStockEntry = {
  options?: Record<string, string>;
  size?: string;
  color?: string;
  colorHex?: string;
  stock: number;
};
type ShippingFees = { insideCairo: number; region1: number; region2: number };
type ShippingPackage = { id?: string; name?: string; weightKg?: number; lengthCm?: number; widthCm?: number; heightCm?: number };

const RESERVED_SPEC_KEYS = new Set(
  [
    "sizes",
    "colors",
    "variant stock",
    "color images",
    "shipping required",
    "shipping fees",
    "shipping packages",
  ].map((s) => s.toLowerCase()),
);

export const Step3Settings = ({ product, errors, locale }: Step3SettingsProps) => {
  const isAr = locale === "ar";
  const objectUrlCacheRef = useRef<Map<File, string>>(new Map());

  useEffect(() => {
    return () => {
      objectUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlCacheRef.current.clear();
    };
  }, []);

  const resolveImageSrc = (img: unknown) => {
    if (!img) return null;
    if (typeof img === "string") return img;
    if (img instanceof File) {
      const cached = objectUrlCacheRef.current.get(img);
      if (cached) return cached;
      const url = URL.createObjectURL(img);
      objectUrlCacheRef.current.set(img, url);
      return url;
    }
    return null;
  };

  const images = product.images || [];
  const primaryImageSrc = resolveImageSrc(images[0]) || null;

  const getSpec = (keyEn: string) =>
    (product.specifications || []).find((s) => String((s as any)?.keyEn || "").trim().toLowerCase() === keyEn.toLowerCase());

  const sizes = useMemo(() => {
    const raw = String(getSpec("Sizes")?.valueEn || "").trim();
    if (!raw) return [] as string[];
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.specifications]);

  const colors = useMemo(() => {
    const raw = String(getSpec("Colors")?.valueEn || "").trim();
    if (!raw) return [] as Array<{ name: string; hex?: string }>;
    return raw
      .split(";")
      .map((p) => p.trim())
      .filter(Boolean)
      .map((token) => {
        const [name, hex] = token.split("|").map((x) => (x || "").trim());
        return { name, hex: hex || undefined };
      })
      .filter((c) => c.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.specifications]);

  const colorImages = useMemo(() => {
    const raw = String(getSpec("Color Images")?.valueEn || "").trim();
    if (!raw) return [] as ColorImageEntry[];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [] as ColorImageEntry[];
      return parsed
        .map((x: any) => ({
          color: typeof x?.color === "string" ? x.color : "",
          colorHex: typeof x?.colorHex === "string" ? x.colorHex : undefined,
          imageIdx: Number.isFinite(Number(x?.imageIdx)) ? Number(x.imageIdx) : undefined,
          imageUrl: typeof x?.imageUrl === "string" ? x.imageUrl : undefined,
        }))
        .filter((x: ColorImageEntry) => !!x.color);
    } catch {
      return [] as ColorImageEntry[];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.specifications]);

  const colorImageByName = useMemo(() => {
    const m = new Map<string, ColorImageEntry>();
    colorImages.forEach((e) => m.set(e.color.toLowerCase(), e));
    return m;
  }, [colorImages]);

  const colorHexByName = useMemo(() => {
    const m = new Map<string, string>();
    colors.forEach((entry) => {
      if (entry.name) m.set(entry.name.toLowerCase(), entry.hex || "#9ca3af");
    });
    return m;
  }, [colors]);

  const variantStock = useMemo(() => {
    const raw = String(getSpec("Variant Stock")?.valueEn || "").trim();
    if (!raw) return [] as VariantStockEntry[];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [] as VariantStockEntry[];
      return parsed
        .map((x: any) => ({
          options:
            x?.options && typeof x.options === "object" ? x.options : undefined,
          size: typeof x?.size === "string" ? x.size : undefined,
          color: typeof x?.color === "string" ? x.color : undefined,
          colorHex: typeof x?.colorHex === "string" ? x.colorHex : undefined,
          stock: Number.isFinite(Number(x?.stock)) ? Number(x.stock) : 0,
        }))
        .filter((x: VariantStockEntry) => x.stock >= 0);
    } catch {
      return [] as VariantStockEntry[];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.specifications]);

  const variantTotal = useMemo(() => variantStock.reduce((sum, e) => sum + (Number.isFinite(e.stock) ? e.stock : 0), 0), [variantStock]);

  const shippingRequired = useMemo(() => {
    if (typeof product.shipping?.isPhysicalProduct === "boolean") {
      return product.shipping.isPhysicalProduct;
    }
    const v = String(getSpec("Shipping Required")?.valueEn || "").toLowerCase();
    if (!v) return true;
    return v === "true" || v === "1" || v === "yes";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.shipping?.isPhysicalProduct, product.specifications]);

  const shippingFees = useMemo<ShippingFees>(() => {
    const fromProduct = product.shipping;
    if (fromProduct) {
      return {
        insideCairo: Number(fromProduct.shippingCostInsideCairo) || 0,
        region1: Number(fromProduct.shippingCostRegion1) || 0,
        region2: Number(fromProduct.shippingCostRegion2) || 0,
      };
    }

    const raw = String(getSpec("Shipping Fees")?.valueEn || "").trim();
    if (!raw) return { insideCairo: 0, region1: 0, region2: 0 };
    try {
      const parsed = JSON.parse(raw);
      return {
        insideCairo: Number(parsed?.insideCairo) || 0,
        region1: Number(parsed?.region1) || 0,
        region2: Number(parsed?.region2) || 0,
      };
    } catch {
      return { insideCairo: 0, region1: 0, region2: 0 };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    product.shipping?.shippingCostInsideCairo,
    product.shipping?.shippingCostRegion1,
    product.shipping?.shippingCostRegion2,
    product.specifications,
  ]);

  const shippingPackages = useMemo<ShippingPackage[]>(() => {
    if (Array.isArray(product.packages) && product.packages.length) {
      return product.packages.map((p: any) => ({
        id: p?.id || p?._id || "",
        name: p?.name || "",
        weightKg: Number(p?.weightKg) || 0,
        lengthCm: Number(p?.lengthCm) || 0,
        widthCm: Number(p?.widthCm) || 0,
        heightCm: Number(p?.heightCm) || 0,
      }));
    }

    const raw = String(getSpec("Shipping Packages")?.valueEn || "").trim();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed as ShippingPackage[];
    } catch {
      return [];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.packages, product.specifications]);

  const userSpecs = useMemo(() => {
    const specs = (product.specifications || []) as any[];
    return specs.filter((s) => {
      const k = String(s?.keyEn || "").trim().toLowerCase();
      if (!k) return false;
      return !RESERVED_SPEC_KEYS.has(k);
    });
  }, [product.specifications]);

  const originalPrice = Number(product.pricing.originalPrice || 0);
  const salePrice = Number(product.pricing.salePrice || 0);
  const discountActive = originalPrice > 0 && salePrice > 0 && salePrice < originalPrice;
  const discountPercent = useMemo(() => {
    if (!discountActive) return 0;
    const pct = (1 - salePrice / originalPrice) * 100;
    return Math.max(0, Math.min(100, Math.round(pct * 10) / 10));
  }, [discountActive, originalPrice, salePrice]);

  const [tab, setTab] = useState<"card" | "details">("card");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-1 py-1">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold">{isAr ? "معاينة المنتج" : "Product Preview"}</h2>
                <p className="text-xs font-medium text-slate-500">
                  {isAr ? "راجع كل التفاصيل قبل الحفظ النهائي." : "Review everything before final save."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-fit items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTab("card")}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                tab === "card" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {isAr ? "بطاقة" : "Card"}
            </button>
            <button
              type="button"
              onClick={() => setTab("details")}
              className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors ${
                tab === "details" ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {isAr ? "تفاصيل" : "Details"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* LEFT: Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Identity & Status */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                  <h3 className="text-sm font-extrabold text-slate-900">{isAr ? "الهوية والحالة" : "Identity & status"}</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                  <BadgeCheck className="h-4 w-4" />
                  {isAr ? "جاهز للمراجعة" : "Ready to review"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">SKU</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{product.identity?.sku || "—"}</p>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <CircleDollarSign className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-extrabold text-slate-900">{isAr ? "التسعير" : "Pricing"}</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {isAr ? "السعر الأصلي" : "Original"}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{originalPrice || 0}</p>
                </div>
                <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700/70">
                    {isAr ? "سعر الخصم" : "Sale"}
                  </p>
                  <p className="mt-1 text-sm font-extrabold text-emerald-800">{salePrice || 0}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isAr ? "الخصم" : "Discount"}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{discountActive ? `${discountPercent}%` : "—"}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isAr ? "بداية الخصم" : "Discount start"}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {product.pricing.startDate ? product.pricing.startDate.split("T")[0] : "—"}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isAr ? "نهاية الخصم" : "Discount end"}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-extrabold text-slate-900">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {product.pricing.endDate ? product.pricing.endDate.split("T")[0] : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-extrabold text-slate-900">{isAr ? "المخزون" : "Inventory"}</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isAr ? "الإجمالي" : "Total stock"}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">
                    {(variantStock.length ? variantTotal : product.inventory?.stockQuantity) ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isAr ? "المقاسات" : "Sizes"}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{sizes.length ? sizes.join(", ") : "—"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isAr ? "الألوان" : "Colors"}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{colors.length ? colors.map((c) => c.name).join(", ") : "—"}</p>
                </div>
              </div>

              {variantStock.length ? (
                <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-extrabold text-slate-900">{isAr ? "توزيع المخزون" : "Stock distribution"}</p>
                    <span className="text-xs font-bold text-slate-500">{isAr ? "الإجمالي" : "Total"}: {variantTotal}</span>
                  </div>
                  <div className="max-h-[220px] overflow-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr className="border-b border-slate-200">
                          <th className="py-2 pr-3 font-extrabold text-slate-600">{isAr ? "التركيبة" : "Combination"}</th>
                          <th className="py-2 pr-0 text-right font-extrabold text-slate-600">{isAr ? "المخزون" : "Stock"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {variantStock.slice(0, 120).map((e, i) => {
                          const options = e.options && Object.keys(e.options).length
                            ? e.options
                            : {
                                ...(e.size ? { Size: e.size } : {}),
                                ...(e.color ? { Color: e.color } : {}),
                              };
                          const optionEntries = Object.entries(options || {});
                          return (
                          <tr key={i}>
                            <td className="py-2 pr-3">
                              <div className="flex flex-wrap items-center gap-1.5">
                                {optionEntries.length ? (
                                  optionEntries.map(([key, value], idx) => {
                                    const isColor =
                                      key.trim().toLowerCase() === "color" ||
                                      key.trim().toLowerCase() === "colors";
                                    const dot = isColor
                                      ? colorHexByName.get(String(value).toLowerCase()) ||
                                        e.colorHex ||
                                        "#9ca3af"
                                      : null;
                                    return (
                                      <span
                                        key={`${i}-${key}-${value}`}
                                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 font-bold text-slate-900 ring-1 ring-slate-200"
                                      >
                                        {dot ? (
                                          <span
                                            className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                                            style={{ backgroundColor: dot }}
                                          />
                                        ) : null}
                                        <span>{String(value)}</span>
                                        {idx < optionEntries.length - 1 ? (
                                          <span className="text-slate-400">/</span>
                                        ) : null}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="font-bold text-slate-900">—</span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 pr-0 text-right font-extrabold text-slate-900">{e.stock}</td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Shipping */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Truck className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-extrabold text-slate-900">{isAr ? "الشحن" : "Shipping"}</h3>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4 md:col-span-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isAr ? "يتطلب الشحن" : "Required"}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{shippingRequired ? (isAr ? "نعم" : "Yes") : isAr ? "لا" : "No"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isAr ? "داخل القاهرة" : "Inside Cairo"}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{shippingFees.insideCairo}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isAr ? "منطقة 1" : "Region 1"}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{shippingFees.region1}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{isAr ? "منطقة 2" : "Region 2"}</p>
                  <p className="mt-1 text-sm font-extrabold text-slate-900">{shippingFees.region2}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white p-4">
                <p className="text-xs font-extrabold text-slate-900">{isAr ? "الحزم" : "Packages"}</p>
                {shippingPackages.length ? (
                  <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {shippingPackages.slice(0, 8).map((p, i) => (
                      <div key={i} className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-3">
                        <p className="truncate text-sm font-extrabold text-slate-900">{p.name || "—"}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          {(p.lengthCm ?? 0)}×{(p.widthCm ?? 0)}×{(p.heightCm ?? 0)} cm • {(p.weightKg ?? 0)} kg
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">{isAr ? "لا توجد حزم بعد." : "No packages yet."}</p>
                )}
              </div>
            </div>

            {/* Specs (user only) */}
            <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-slate-400" />
                <h3 className="text-sm font-extrabold text-slate-900">{isAr ? "مواصفات المنتج" : "Product specifications"}</h3>
              </div>
              {userSpecs.length ? (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {userSpecs.slice(0, 12).map((s, i) => (
                    <div key={i} className="rounded-2xl border border-slate-200/70 bg-slate-50/40 p-3">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="rounded-xl border border-slate-200/70 bg-white p-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">EN</p>
                          <p className="mt-0.5 text-xs font-extrabold text-slate-900">{s.keyEn || "—"}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-600">{s.valueEn || "—"}</p>
                        </div>
                        <div dir="rtl" className="rounded-xl border border-slate-200/70 bg-white p-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AR</p>
                          <p className="mt-0.5 text-xs font-extrabold text-slate-900">{s.keyAr || s.keyEn || "—"}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-600">{s.valueAr || s.valueEn || "—"}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">{isAr ? "لا توجد مواصفات بعد." : "No specifications yet."}</p>
              )}
            </div>
          </div>

          {/* RIGHT: Preview card */}
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm lg:sticky lg:top-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-extrabold text-slate-900">{isAr ? "معاينة البطاقة" : "Card preview"}</p>
                <span className="text-[11px] font-bold text-slate-500">{isAr ? "السوق" : "Marketplace"}</span>
              </div>

              <div className="group relative mx-auto h-full min-h-[300px] w-full overflow-hidden rounded-[20px] bg-white p-3 shadow-sm ring-1 ring-gray-100">
                <div className="relative overflow-hidden rounded-[16px] bg-gray-50 transition-colors group-hover:bg-gray-100/50">
                  <div className="relative h-48 w-full sm:h-64">
                    {primaryImageSrc ? (
                      <Image
                        src={primaryImageSrc}
                        alt={product.title?.en || "Product"}
                        fill
                        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                        sizes="420px"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">
                        {isAr ? "لا توجد صورة" : "No image"}
                      </div>
                    )}
                  </div>

                  {discountActive ? (
                    <span className="absolute left-3 top-3 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 ring-1 ring-red-100">
                      -{discountPercent}%
                    </span>
                  ) : null}

                  <div className="absolute bottom-2 left-2 rounded-md bg-white px-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-600">
                        {Number(product.rate || 4).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex h-full flex-1 flex-col justify-between px-1 pb-1 pt-3">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-800">
                    {isAr
                      ? product.title?.ar || product.title?.en || "—"
                      : product.title?.en || product.title?.ar || "—"}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-baseline gap-2">
                    <p
                      className={`flex items-baseline gap-1 ${isAr ? "flex-row-reverse" : ""}`}
                    >
                      <span className="text-lg font-bold text-gray-900">
                        {(discountActive ? salePrice : originalPrice || 0).toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {isAr ? "جنيه" : "EGP"}
                      </span>
                    </p>
                    {discountActive ? (
                      <del className="text-xs font-medium text-gray-400">
                        {originalPrice.toLocaleString()} {isAr ? "جنيه" : "EGP"}
                      </del>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-gray-500">
                      SKU: {product.identity?.sku || "—"}
                    </p>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-200/70">
                      {(variantStock.length ? variantTotal : product.inventory?.stockQuantity) ?? 0}{" "}
                      {isAr ? "متوفر" : "in stock"}
                    </span>
                  </div>

                  {colors.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {colors.slice(0, 6).map((c) => {
                        const dot = c.hex || "#9ca3af";
                        return (
                          <span
                            key={`${c.name}-${dot}`}
                            className="h-3 w-3 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: dot }}
                            title={c.name}
                          />
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>

              {errors?.submit ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50/40 p-3 text-xs font-semibold text-red-700">
                  {errors.submit}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
