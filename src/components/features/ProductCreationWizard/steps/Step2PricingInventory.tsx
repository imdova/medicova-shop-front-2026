"use client";

import { Package, Plus, RefreshCw, Trash2, Truck, X } from "lucide-react";
import { Input } from "@/components/shared/input";
import toast from "react-hot-toast";
import { Label } from "@/components/shared/label";
import { ProductFormData } from "@/lib/validations/product-schema";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Step2PricingInventoryProps {
  product: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
  locale: string;
}

const COLORS = {
  focus: "focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
  label: "text-sm font-semibold text-gray-800",
};

type SizeOption = { id: string; label: string };
type ColorOption = { id: string; nameEn: string; nameAr: string; hex: string };
type VariantStockEntry = {
  size?: string;
  color?: string;
  colorHex?: string;
  stock: number;
};
type ColorImageEntry = {
  color: string;
  colorHex?: string;
  imageIdx?: number;
  imageUrl?: string;
};
type ShippingFees = { insideCairo: number; region1: number; region2: number };
type ShippingPackage = {
  id: string;
  name: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
};

const SIZE_OPTIONS: SizeOption[] = [
  { id: "XS", label: "XS" },
  { id: "S", label: "S" },
  { id: "M", label: "M" },
  { id: "L", label: "L" },
  { id: "XL", label: "XL" },
  { id: "XXL", label: "XXL" },
  { id: "XXXL", label: "XXXL" },
];

const COLOR_OPTIONS: ColorOption[] = [
  { id: "red", nameEn: "Red", nameAr: "أحمر", hex: "#ef4444" },
  { id: "blue", nameEn: "Blue", nameAr: "أزرق", hex: "#3b82f6" },
  { id: "green", nameEn: "Green", nameAr: "أخضر", hex: "#22c55e" },
  { id: "black", nameEn: "Black", nameAr: "أسود", hex: "#000000" },
  { id: "white", nameEn: "White", nameAr: "أبيض", hex: "#ffffff" },
  { id: "yellow", nameEn: "Yellow", nameAr: "أصفر", hex: "#f59e0b" },
  { id: "purple", nameEn: "Purple", nameAr: "بنفسجي", hex: "#8b5cf6" },
  { id: "pink", nameEn: "Pink", nameAr: "وردي", hex: "#ec4899" },
  { id: "orange", nameEn: "Orange", nameAr: "برتقالي", hex: "#f97316" },
  { id: "gray", nameEn: "Gray", nameAr: "رمادي", hex: "#6b7280" },
];

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const Step2PricingInventory = ({
  product,
  onUpdate,
  errors,
  locale,
}: Step2PricingInventoryProps) => {
  const isAr = locale === "ar";
  const objectUrlCacheRef = useRef<Map<File, string>>(new Map());

  useEffect(() => {
    return () => {
      objectUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlCacheRef.current.clear();
    };
  }, []);

  const resolveImageSrc = useCallback((img: unknown) => {
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
  }, []);

  const generateSku = useCallback(() => {
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    onUpdate({ identity: { ...product.identity, sku: `PX-${randomPart}` } });
  }, [onUpdate, product.identity]);

  const parsedSizes = useMemo(() => {
    const spec = (product.specifications || []).find(
      (s) => (s?.keyEn || "").toLowerCase() === "sizes",
    );
    const raw = (spec?.valueEn || "").trim();
    if (!raw) return [] as string[];
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [product.specifications]);

  const parsedColors = useMemo(() => {
    const spec = (product.specifications || []).find(
      (s) => (s?.keyEn || "").toLowerCase() === "colors",
    );
    const raw = (spec?.valueEn || "").trim();
    if (!raw) return [] as Array<{ name: string; hex?: string }>;
    // Stored as: "Red|#ef4444; Blue|#3b82f6"
    return raw
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((token) => {
        const [name, hex] = token.split("|").map((x) => (x || "").trim());
        return { name, hex: hex || undefined };
      })
      .filter((c) => c.name);
  }, [product.specifications]);

  const specs = product.specifications || [];
  const getSpecByKey = useCallback(
    (keyEn: string) =>
      specs.find(
        (s) =>
          String(s?.keyEn || "")
            .trim()
            .toLowerCase() === keyEn.toLowerCase(),
      ),
    [specs],
  );

  const upsertSpec = useCallback(
    (item: {
      keyEn: string;
      keyAr: string;
      valueEn: string;
      valueAr: string;
    }) => {
      const key = item.keyEn.trim().toLowerCase();
      const next = specs.filter(
        (s) =>
          String(s?.keyEn || "")
            .trim()
            .toLowerCase() !== key,
      );
      next.push(item as any);
      onUpdate({ specifications: next as any });
    },
    [onUpdate, specs],
  );

  const removeSpecByKey = useCallback(
    (keyEn: string) => {
      const key = keyEn.trim().toLowerCase();
      onUpdate({
        specifications: specs.filter(
          (s) =>
            String(s?.keyEn || "")
              .trim()
              .toLowerCase() !== key,
        ) as any,
      });
    },
    [onUpdate, specs],
  );

  const shippingRequired = product.shipping?.isPhysicalProduct ?? true;

  const shippingFees = useMemo<ShippingFees>(
    () => ({
      insideCairo: product.shipping?.shippingCostInsideCairo ?? 0,
      region1: product.shipping?.shippingCostRegion1 ?? 0,
      region2: product.shipping?.shippingCostRegion2 ?? 0,
    }),
    [product.shipping],
  );

  const shippingPackages = useMemo<ShippingPackage[]>(() => {
    return (product.packages || []).map((p: any) => ({
      id: String(p?.id || makeId()),
      name: String(p?.name || ""),
      weightKg: p?.weightKg !== undefined ? Number(p.weightKg) : undefined,
      lengthCm: p?.lengthCm !== undefined ? Number(p.lengthCm) : undefined,
      widthCm: p?.widthCm !== undefined ? Number(p.widthCm) : undefined,
      heightCm: p?.heightCm !== undefined ? Number(p.heightCm) : undefined,
    }));
  }, [product.packages]);

  const colorImagesSpec = useMemo(() => {
    return (product.specifications || []).find(
      (s) => (s?.keyEn || "").toLowerCase() === "color images",
    );
  }, [product.specifications]);

  const parsedColorImages = useMemo(() => {
    const raw = (colorImagesSpec?.valueEn || "").trim();
    if (!raw) return [] as ColorImageEntry[];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [] as ColorImageEntry[];
      return parsed
        .map((x: any) => ({
          color: typeof x?.color === "string" ? x.color : "",
          colorHex: typeof x?.colorHex === "string" ? x.colorHex : undefined,
          imageIdx: Number.isFinite(Number(x?.imageIdx))
            ? Number(x.imageIdx)
            : undefined,
          imageUrl: typeof x?.imageUrl === "string" ? x.imageUrl : undefined,
        }))
        .filter((x: ColorImageEntry) => !!x.color);
    } catch {
      return [] as ColorImageEntry[];
    }
  }, [colorImagesSpec?.valueEn]);

  const colorImageByKey = useMemo(() => {
    const map = new Map<string, ColorImageEntry>();
    parsedColorImages.forEach((e) => map.set(e.color.toLowerCase(), e));
    return map;
  }, [parsedColorImages]);

  const selectedSizes = parsedSizes;
  const selectedColors = useMemo(() => {
    return parsedColors.map((c) => {
      const preset = COLOR_OPTIONS.find(
        (p) => p.nameEn.toLowerCase() === c.name.toLowerCase(),
      );
      return {
        name: c.name,
        hex: c.hex || preset?.hex || "#9ca3af",
      };
    });
  }, [parsedColors]);

  const variantStockSpec = useMemo(() => {
    return (product.specifications || []).find(
      (s) => (s?.keyEn || "").toLowerCase() === "variant stock",
    );
  }, [product.specifications]);

  const parsedVariantStock = useMemo(() => {
    const raw = (variantStockSpec?.valueEn || "").trim();
    if (!raw) return [] as VariantStockEntry[];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [] as VariantStockEntry[];
      return parsed
        .map((x: any) => ({
          size: typeof x?.size === "string" ? x.size : undefined,
          color: typeof x?.color === "string" ? x.color : undefined,
          colorHex: typeof x?.colorHex === "string" ? x.colorHex : undefined,
          stock: Number.isFinite(Number(x?.stock)) ? Number(x.stock) : 0,
        }))
        .filter((x: VariantStockEntry) => x.stock >= 0);
    } catch {
      return [] as VariantStockEntry[];
    }
  }, [variantStockSpec?.valueEn]);

  const variantStockMap = useMemo(() => {
    const map = new Map<string, VariantStockEntry>();
    for (const e of parsedVariantStock) {
      const key = `${e.size || ""}__${e.color || ""}`;
      map.set(key, e);
    }
    return map;
  }, [parsedVariantStock]);

  const variantStockTotal = useMemo(() => {
    let total = 0;
    parsedVariantStock.forEach((e) => {
      total += Number.isFinite(e.stock) ? e.stock : 0;
    });
    return total;
  }, [parsedVariantStock]);

  const upsertSpecs = useCallback(
    (updates: {
      sizes?: string[];
      colors?: Array<{ nameEn: string; nameAr: string; hex: string }>;
    }) => {
      const next = (product.specifications || []).filter((s) => {
        const k = (s?.keyEn || "").toLowerCase();
        if (k === "sizes" && updates.sizes) return false;
        if (k === "colors" && updates.colors) return false;
        return true;
      });

      if (updates.sizes) {
        const sizes = updates.sizes;
        if (sizes.length) {
          next.push({
            keyEn: "Sizes",
            keyAr: "المقاسات",
            valueEn: sizes.join(", "),
            valueAr: sizes.join(", "),
          });
        }
      }

      if (updates.colors) {
        const colors = updates.colors;
        if (colors.length) {
          next.push({
            keyEn: "Colors",
            keyAr: "الألوان",
            valueEn: colors.map((c) => `${c.nameEn}|${c.hex}`).join("; "),
            valueAr: colors
              .map((c) => `${c.nameAr || c.nameEn}|${c.hex}`)
              .join("; "),
          });
        }
      }

      // If a variant-stock spec exists, prune entries to the new sizes/colors set
      const nextSizes = updates.sizes ?? selectedSizes;
      const nextColorNames = (
        updates.colors ??
        selectedColors.map((c) => ({
          nameEn: c.name,
          nameAr: c.name,
          hex: c.hex,
        }))
      ).map((c) => c.nameEn);
      const existingVariantSpec = (product.specifications || []).find(
        (s) => (s?.keyEn || "").toLowerCase() === "variant stock",
      );
      const existingRaw = (existingVariantSpec?.valueEn || "").trim();
      if (existingRaw) {
        try {
          const parsed = JSON.parse(existingRaw);
          if (Array.isArray(parsed)) {
            const pruned: VariantStockEntry[] = parsed.filter((x: any) => {
              const size = typeof x?.size === "string" ? x.size : "";
              const color = typeof x?.color === "string" ? x.color : "";
              const sizeOk = !size || nextSizes.includes(size);
              const colorOk = !color || nextColorNames.includes(color);
              return sizeOk && colorOk;
            });
            next.push({
              keyEn: "Variant Stock",
              keyAr: "مخزون المتغيرات",
              valueEn: JSON.stringify(pruned),
              valueAr: JSON.stringify(pruned),
            });
          }
        } catch {
          // ignore
        }
      }

      onUpdate({ specifications: next });
    },
    [onUpdate, product.specifications, selectedColors, selectedSizes],
  );

  const setVariantStockEntries = useCallback(
    (entries: VariantStockEntry[]) => {
      const cleaned = entries
        .map((e) => ({
          size: e.size || undefined,
          color: e.color || undefined,
          colorHex: e.colorHex || undefined,
          stock: Number.isFinite(e.stock)
            ? Math.max(0, Math.floor(e.stock))
            : 0,
        }))
        .filter((e) => (e.size || e.color) && e.stock >= 0);

      const next = (product.specifications || []).filter(
        (s) => (s?.keyEn || "").toLowerCase() !== "variant stock",
      );
      if (cleaned.length) {
        next.push({
          keyEn: "Variant Stock",
          keyAr: "مخزون المتغيرات",
          valueEn: JSON.stringify(cleaned),
          valueAr: JSON.stringify(cleaned),
        });
      }

      const total = cleaned.reduce(
        (sum, x) => sum + (Number.isFinite(x.stock) ? x.stock : 0),
        0,
      );
      onUpdate({
        specifications: next,
        inventory: { ...product.inventory, stockQuantity: total },
      });
    },
    [onUpdate, product.inventory, product.specifications],
  );

  const clearVariantStock = useCallback(() => {
    const next = (product.specifications || []).filter(
      (s) => (s?.keyEn || "").toLowerCase() !== "variant stock",
    );
    onUpdate({ specifications: next });
  }, [onUpdate, product.specifications]);

  // If current selections exist and variant stock is present, ensure stockQuantity matches total
  useEffect(() => {
    if (!parsedVariantStock.length) return;
    if (product.inventory.stockQuantity !== variantStockTotal) {
      onUpdate({
        inventory: { ...product.inventory, stockQuantity: variantStockTotal },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantStockTotal, parsedVariantStock.length]);

  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [tempSizes, setTempSizes] = useState<Set<string>>(new Set());

  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [tempColors, setTempColors] = useState<
    Map<string, { nameEn: string; nameAr: string; hex: string }>
  >(new Map());
  const [tempColorImageAssignments, setTempColorImageAssignments] = useState<
    Map<string, { imageIdx?: number; imageUrl?: string }>
  >(new Map());
  const [tempColorImageFiles, setTempColorImageFiles] = useState<
    Map<string, File>
  >(new Map());
  const [customColorHex, setCustomColorHex] = useState("#000000");
  const [customColorName, setCustomColorName] = useState("");

  const openSizeModal = () => {
    setTempSizes(new Set(parsedSizes));
    setSizeModalOpen(true);
  };

  const openColorModal = () => {
    const map = new Map<
      string,
      { nameEn: string; nameAr: string; hex: string }
    >();
    parsedColors.forEach((c) => {
      const preset = COLOR_OPTIONS.find(
        (p) => p.nameEn.toLowerCase() === c.name.toLowerCase(),
      );
      const hex = c.hex || preset?.hex || "#6b7280";
      const nameEn = preset?.nameEn || c.name;
      const nameAr = preset?.nameAr || c.name;
      map.set(nameEn.toLowerCase(), { nameEn, nameAr, hex });
    });
    setTempColors(map);
    const assignments = new Map<
      string,
      { imageIdx?: number; imageUrl?: string }
    >();
    map.forEach((v, k) => {
      const existing = colorImageByKey.get(v.nameEn.toLowerCase());
      if (existing) {
        assignments.set(k, {
          imageIdx: existing.imageIdx,
          imageUrl: existing.imageUrl,
        });
      }
    });
    setTempColorImageAssignments(assignments);
    setTempColorImageFiles(new Map());
    setColorModalOpen(true);
  };

  const distributionEnabled = parsedVariantStock.length > 0;
  const canDistribute = selectedSizes.length > 0 && selectedColors.length > 0;

  const [draftPackage, setDraftPackage] = useState<ShippingPackage>({
    id: "",
    name: "",
    weightKg: undefined,
    lengthCm: undefined,
    widthCm: undefined,
    heightCm: undefined,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <div className="space-y-5">
        {/* Inventory & Weight */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                {isAr ? "المخزون والوزن" : "Inventory & Weight"}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {isAr
                  ? "إدارة المخزون والمقاسات والألوان."
                  : "Manage stock levels, sizes and colors."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Stock Quantity */}
            <div className="space-y-1.5">
              <Label
                className={`${COLORS.label} ${errors["inventory.stockQuantity"] ? "text-red-500" : ""}`}
              >
                {isAr ? "كمية المخزون" : "Stock Quantity"}{" "}
                <span className="text-red-500">*</span>{" "}
                <span className="text-xs font-bold text-gray-500">
                  ({isAr ? "الإجمالي" : "Total"}:{" "}
                  {distributionEnabled
                    ? variantStockTotal
                    : product.inventory.stockQuantity || 0}
                  )
                </span>
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={product.inventory.stockQuantity || 0}
                onChange={(e) =>
                  onUpdate({
                    inventory: {
                      ...product.inventory,
                      stockQuantity: parseInt(e.target.value || "0"),
                    },
                  })
                }
                disabled={distributionEnabled}
                className={`h-10 rounded-xl px-3 ${errors["inventory.stockQuantity"] ? "border-red-300" : "border-gray-200"} ${COLORS.focus} text-sm placeholder:text-gray-300 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500`}
              />
              {distributionEnabled ? (
                <p className="text-[11px] font-medium text-gray-500">
                  {isAr
                    ? "يتم حساب المخزون تلقائيًا من توزيع المقاسات/الألوان."
                    : "Stock is auto-calculated from size/color distribution."}
                </p>
              ) : null}
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <Label
                className={`${COLORS.label} ${errors["identity.sku"] ? "text-red-500" : ""}`}
              >
                SKU <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  placeholder="e.g. PX-12345"
                  value={product.identity.sku || ""}
                  onChange={(e) =>
                    onUpdate({
                      identity: { ...product.identity, sku: e.target.value },
                    })
                  }
                  className={`h-10 rounded-xl px-3 pr-9 ${errors["identity.sku"] ? "border-red-300" : "border-gray-200"} ${COLORS.focus} text-sm placeholder:text-gray-300`}
                />
                <button
                  type="button"
                  onClick={generateSku}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-gray-50 hover:text-gray-700"
                  aria-label={isAr ? "توليد SKU" : "Generate SKU"}
                >
                  <RefreshCw size={14} />
                </button>
              </div>
              {errors["identity.sku"] ? (
                <p className="text-[10px] font-medium text-red-500">
                  {errors["identity.sku"]}
                </p>
              ) : null}
            </div>
          </div>

          {/* Sizes */}
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {isAr ? "المقاسات" : "Sizes"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {isAr
                    ? "اختر المقاسات المتاحة للمنتج."
                    : "Select available sizes."}
                </p>
              </div>
              <button
                type="button"
                onClick={openSizeModal}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/30 px-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                <Plus className="h-4 w-4" />
                {isAr ? "إضافة مقاس" : "Add Size"}
              </button>
            </div>

            {parsedSizes.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {parsedSizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() =>
                        upsertSpecs({
                          sizes: parsedSizes.filter((x) => x !== s),
                        })
                      }
                      className="rounded-full p-0.5 text-emerald-700 transition-colors hover:bg-emerald-100"
                      aria-label={isAr ? "حذف" : "Remove"}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-400">
                {isAr ? "لا توجد مقاسات محددة بعد." : "No sizes selected yet."}
              </p>
            )}
          </div>

          {/* Colors */}
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {isAr ? "الألوان" : "Colors"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {isAr
                    ? "اختر الألوان أو أضف لونًا مخصصًا."
                    : "Select colors or add custom ones."}
                </p>
              </div>
              <button
                type="button"
                onClick={openColorModal}
                className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/30 px-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                <Plus className="h-4 w-4" />
                {isAr ? "إضافة لون" : "Add Color"}
              </button>
            </div>

            {parsedColors.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {parsedColors.map((c) => {
                  const dot =
                    c.hex ||
                    COLOR_OPTIONS.find(
                      (p) => p.nameEn.toLowerCase() === c.name.toLowerCase(),
                    )?.hex ||
                    "#9ca3af";
                  const imgEntry = colorImageByKey.get(c.name.toLowerCase());
                  const src =
                    (imgEntry?.imageIdx !== undefined
                      ? resolveImageSrc(product.images?.[imgEntry.imageIdx])
                      : null) ||
                    (imgEntry?.imageUrl ? imgEntry.imageUrl : null);
                  return (
                    <span
                      key={`${c.name}-${c.hex || ""}`}
                      className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-bold text-gray-800 ring-1 ring-gray-200"
                    >
                      {src ? (
                        <img
                          src={src}
                          alt={c.name}
                          className="h-5 w-5 rounded-md object-cover ring-1 ring-gray-200"
                        />
                      ) : null}
                      <span
                        className={`h-3.5 w-3.5 rounded-full ring-1 ${dot.toLowerCase() === "#ffffff" ? "ring-gray-200" : "ring-black/5"}`}
                        style={{ backgroundColor: dot }}
                      />
                      <span className="max-w-[160px] truncate">{c.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const remaining = parsedColors.filter(
                            (x) =>
                              !(
                                x.name === c.name &&
                                (x.hex || "") === (c.hex || "")
                              ),
                          );
                          const mapped = remaining.map((r) => {
                            const preset = COLOR_OPTIONS.find(
                              (p) =>
                                p.nameEn.toLowerCase() === r.name.toLowerCase(),
                            );
                            return {
                              nameEn: preset?.nameEn || r.name,
                              nameAr: preset?.nameAr || r.name,
                              hex: r.hex || preset?.hex || "#6b7280",
                            };
                          });
                          upsertSpecs({ colors: mapped });
                        }}
                        className="rounded-full p-0.5 text-gray-500 transition-colors hover:bg-gray-200/60 hover:text-gray-700"
                        aria-label={isAr ? "حذف" : "Remove"}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-xs text-gray-400">
                {isAr ? "لا توجد ألوان محددة بعد." : "No colors selected yet."}
              </p>
            )}
          </div>

          {/* Variant stock distribution */}
          <div className="mt-6 border-t pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {isAr
                    ? "توزيع المخزون حسب المقاس واللون"
                    : "Stock distribution by size & color"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {isAr
                    ? "حدد كمية المخزون لكل تركيبة (مقاس + لون). سيتم جمعها تلقائيًا في كمية المخزون."
                    : "Set stock for each (Size + Color) combination. Total will be summed automatically."}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
                    distributionEnabled
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
                      : "bg-gray-50 text-gray-800 ring-gray-200"
                  }`}
                >
                  {isAr ? "كمية المخزون (الإجمالي)" : "Total stock quantity"}:{" "}
                  {distributionEnabled
                    ? variantStockTotal
                    : product.inventory.stockQuantity || 0}
                </span>
                {distributionEnabled ? (
                  <button
                    type="button"
                    onClick={clearVariantStock}
                    className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {isAr ? "مسح التوزيع" : "Clear distribution"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!canDistribute}
                    onClick={() => {
                      if (!canDistribute) return;
                      const initial: VariantStockEntry[] = [];
                      const seedTotal = Math.max(
                        0,
                        Math.floor(product.inventory.stockQuantity || 0),
                      );
                      let first = true;
                      selectedSizes.forEach((size) => {
                        selectedColors.forEach((color) => {
                          const stock = first ? seedTotal : 0;
                          first = false;
                          initial.push({
                            size,
                            color: color.name,
                            colorHex: color.hex,
                            stock,
                          });
                        });
                      });
                      setVariantStockEntries(initial);
                    }}
                    className="h-9 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
                  >
                    {isAr ? "تفعيل التوزيع" : "Enable distribution"}
                  </button>
                )}
              </div>
            </div>

            {!canDistribute ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/40 p-3 text-xs font-medium text-amber-800">
                {isAr
                  ? "لتفعيل التوزيع، قم باختيار مقاسات وألوان أولاً."
                  : "To enable distribution, please select both sizes and colors first."}
              </div>
            ) : null}

            {distributionEnabled && canDistribute ? (
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[720px] rounded-2xl border border-gray-200 bg-white">
                  <div
                    className="grid grid-cols-[160px_repeat(var(--cols),1fr)] items-center border-b border-gray-200 bg-gray-50/60 px-3 py-3 text-xs font-bold text-gray-700"
                    style={{ ["--cols" as any]: selectedColors.length }}
                  >
                    <div className="px-2">{isAr ? "المقاس" : "Size"}</div>
                    {selectedColors.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center gap-2 px-2"
                      >
                        <span
                          className={`h-3.5 w-3.5 rounded-full ring-1 ${c.hex.toLowerCase() === "#ffffff" ? "ring-gray-200" : "ring-black/5"}`}
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="truncate">{c.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="divide-y divide-gray-200">
                    {selectedSizes.map((size) => (
                      <div
                        key={size}
                        className="grid grid-cols-[160px_repeat(var(--cols),1fr)] items-center px-3 py-3"
                        style={{ ["--cols" as any]: selectedColors.length }}
                      >
                        <div className="px-2 text-sm font-bold text-gray-900">
                          {size}
                        </div>
                        {selectedColors.map((c) => {
                          const key = `${size}__${c.name}`;
                          const current = variantStockMap.get(key)?.stock ?? 0;
                          return (
                            <div key={key} className="px-2">
                              <Input
                                type="number"
                                min={0}
                                value={current}
                                onChange={(e) => {
                                  const nextValue = Math.max(
                                    0,
                                    parseInt(e.target.value || "0"),
                                  );
                                  const nextEntries: VariantStockEntry[] = [];
                                  const seen = new Set<string>();

                                  // Start from current grid (not from parsedVariantStock to avoid losing zeros)
                                  selectedSizes.forEach((s) => {
                                    selectedColors.forEach((col) => {
                                      const k = `${s}__${col.name}`;
                                      let stock =
                                        variantStockMap.get(k)?.stock ?? 0;
                                      if (k === key) stock = nextValue;
                                      const entry: VariantStockEntry = {
                                        size: s,
                                        color: col.name,
                                        colorHex: col.hex,
                                        stock,
                                      };
                                      nextEntries.push(entry);
                                      seen.add(k);
                                    });
                                  });

                                  // Preserve any existing entries that are still valid but not in current grid (shouldn't happen)
                                  parsedVariantStock.forEach((old) => {
                                    const k = `${old.size || ""}__${old.color || ""}`;
                                    const sizeOk = old.size
                                      ? selectedSizes.includes(old.size)
                                      : false;
                                    const colorOk = old.color
                                      ? selectedColors.some(
                                          (x) => x.name === old.color,
                                        )
                                      : false;
                                    if (!seen.has(k) && sizeOk && colorOk)
                                      nextEntries.push(old);
                                  });

                                  setVariantStockEntries(nextEntries);
                                }}
                                className="h-10 rounded-xl border-gray-200 px-3 text-sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Shipping Settings */}
          <div className="mt-6 border-t pt-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {isAr ? "إعدادات الشحن" : "Shipping Settings"}
                  </h3>
                  <p className="mt-1 text-xs text-gray-500">
                    {isAr
                      ? "تهيئة خيارات الشحن لمنتجك"
                      : "Configure shipping options for your product"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-600">
                  {isAr ? "منتج مادي" : "Physical Product"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdate({
                      shipping: {
                        ...product.shipping,
                        isPhysicalProduct: !shippingRequired,
                      },
                    })
                  }
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    shippingRequired ? "bg-emerald-600" : "bg-gray-200"
                  }`}
                  aria-label={isAr ? "تبديل الشحن" : "Toggle shipping"}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      shippingRequired ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div
              className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${shippingRequired ? "" : "opacity-60"}`}
            >
              <div className="space-y-1.5">
                <Label className={COLORS.label}>
                  {isAr ? "داخل القاهرة" : "Inside Cairo"}
                </Label>
                <Input
                  type="number"
                  disabled={!shippingRequired}
                  value={shippingFees.insideCairo}
                  onChange={(e) => {
                    onUpdate({
                      shipping: {
                        ...product.shipping,
                        shippingCostInsideCairo: Number(e.target.value || 0),
                      },
                    });
                  }}
                  className={`h-10 rounded-xl border-gray-200 px-3 text-sm ${COLORS.focus}`}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label className={COLORS.label}>
                  {isAr ? "المنطقة 1" : "Region 1"}
                </Label>
                <Input
                  type="number"
                  disabled={!shippingRequired}
                  value={shippingFees.region1}
                  onChange={(e) => {
                    onUpdate({
                      shipping: {
                        ...product.shipping,
                        shippingCostRegion1: Number(e.target.value || 0),
                      },
                    });
                  }}
                  className={`h-10 rounded-xl border-gray-200 px-3 text-sm ${COLORS.focus}`}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label className={COLORS.label}>
                  {isAr ? "المنطقة 2" : "Region 2"}
                </Label>
                <Input
                  type="number"
                  disabled={!shippingRequired}
                  value={shippingFees.region2}
                  onChange={(e) => {
                    onUpdate({
                      shipping: {
                        ...product.shipping,
                        shippingCostRegion2: Number(e.target.value || 0),
                      },
                    });
                  }}
                  className={`h-10 rounded-xl border-gray-200 px-3 text-sm ${COLORS.focus}`}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <p className="text-xs font-bold text-gray-900">
                    {isAr ? "اسم الحزمة" : "Package name"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!shippingRequired || !draftPackage.name.trim()}
                  onClick={() => {
                    const nextList = [
                      ...shippingPackages,
                      {
                        ...draftPackage,
                        id: makeId(),
                        name: draftPackage.name.trim(),
                      },
                    ];
                    onUpdate({ packages: nextList });
                    setDraftPackage({
                      id: "",
                      name: "",
                      weightKg: undefined,
                      lengthCm: undefined,
                      widthCm: undefined,
                      heightCm: undefined,
                    });
                  }}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-bold text-white disabled:bg-emerald-200"
                >
                  <Plus className="h-4 w-4" />
                  {isAr ? "إضافة حزمة" : "Add package"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className={COLORS.label}>
                    {isAr ? "اسم الحزمة" : "Package name"}
                  </Label>
                  <Input
                    disabled={!shippingRequired}
                    value={draftPackage.name}
                    onChange={(e) =>
                      setDraftPackage((p) => ({ ...p, name: e.target.value }))
                    }
                    className={`h-10 rounded-xl border-gray-200 px-3 text-sm ${COLORS.focus}`}
                    placeholder={isAr ? "مثال: Sample box" : "e.g. Sample box"}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className={COLORS.label}>
                      {isAr ? "الوزن (كجم)" : "Weight (kg)"}
                    </Label>
                    <Input
                      type="number"
                      disabled={!shippingRequired}
                      value={draftPackage.weightKg ?? ""}
                      onChange={(e) =>
                        setDraftPackage((p) => ({
                          ...p,
                          weightKg: Number(e.target.value || 0),
                        }))
                      }
                      className={`h-10 rounded-xl border-gray-200 px-3 text-sm ${COLORS.focus}`}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={COLORS.label}>
                      {isAr ? "الطول (سم)" : "Length (cm)"}
                    </Label>
                    <Input
                      type="number"
                      disabled={!shippingRequired}
                      value={draftPackage.lengthCm ?? ""}
                      onChange={(e) =>
                        setDraftPackage((p) => ({
                          ...p,
                          lengthCm: Number(e.target.value || 0),
                        }))
                      }
                      className={`h-10 rounded-xl border-gray-200 px-3 text-sm ${COLORS.focus}`}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:col-span-2 md:max-w-[340px]">
                  <div className="space-y-1.5">
                    <Label className={COLORS.label}>
                      {isAr ? "العرض (سم)" : "Width (cm)"}
                    </Label>
                    <Input
                      type="number"
                      disabled={!shippingRequired}
                      value={draftPackage.widthCm ?? ""}
                      onChange={(e) =>
                        setDraftPackage((p) => ({
                          ...p,
                          widthCm: Number(e.target.value || 0),
                        }))
                      }
                      className={`h-10 rounded-xl border-gray-200 px-3 text-sm ${COLORS.focus}`}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className={COLORS.label}>
                      {isAr ? "الارتفاع (سم)" : "Height (cm)"}
                    </Label>
                    <Input
                      type="number"
                      disabled={!shippingRequired}
                      value={draftPackage.heightCm ?? ""}
                      onChange={(e) =>
                        setDraftPackage((p) => ({
                          ...p,
                          heightCm: Number(e.target.value || 0),
                        }))
                      }
                      className={`h-10 rounded-xl border-gray-200 px-3 text-sm ${COLORS.focus}`}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {shippingPackages.length ? (
                <div className="mt-4 space-y-2">
                  {shippingPackages.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {p.lengthCm ?? 0}×{p.widthCm ?? 0}×{p.heightCm ?? 0}{" "}
                          cm • {p.weightKg ?? 0} kg
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextList = shippingPackages.filter(
                            (x) => x.id !== p.id,
                          );
                          onUpdate({ packages: nextList });
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        aria-label={isAr ? "حذف" : "Delete"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs text-gray-400">
                  {isAr ? "لا توجد حزم بعد." : "No packages yet."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size Modal */}
      {sizeModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setSizeModalOpen(false)}
            aria-label={isAr ? "إغلاق" : "Close"}
          />
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  {isAr ? "اختر المقاسات" : "Select Size"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isAr
                    ? "اختر المقاسات المتاحة لمنتجك"
                    : "Select sizes for your product"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSizeModalOpen(false)}
                className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                aria-label={isAr ? "إغلاق" : "Close"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5">
              <p className="text-sm font-bold text-gray-900">
                {isAr ? "المقاسات المتاحة" : "Available Sizes"}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SIZE_OPTIONS.map((opt) => {
                  const checked = tempSizes.has(opt.id);
                  return (
                    <label
                      key={opt.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(tempSizes);
                          if (e.target.checked) next.add(opt.id);
                          else next.delete(opt.id);
                          setTempSizes(next);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-200"
                      />
                      <span className="text-sm font-bold text-gray-900">
                        {opt.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSizeModalOpen(false)}
                className="h-10 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const selected = Array.from(tempSizes);
                  upsertSpecs({ sizes: selected });
                  setSizeModalOpen(false);
                }}
                className="h-10 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {isAr
                  ? `إضافة المقاسات المحددة (${tempSizes.size})`
                  : `Add Selected Sizes (${tempSizes.size})`}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Color Modal */}
      {colorModalOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setColorModalOpen(false)}
            aria-label={isAr ? "إغلاق" : "Close"}
          />
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  {isAr ? "اختر اللون" : "Select Color"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isAr
                    ? "اختر الألوان من الخيارات المحددة أو أضف لونًا مخصصًا"
                    : "Select colors from predefined options or add custom colors"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setColorModalOpen(false)}
                className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                aria-label={isAr ? "إغلاق" : "Close"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Color Images (first section) */}
            <div className="mt-5">
              <p className="text-sm font-bold text-gray-900">
                {isAr ? "صور الألوان" : "Color Images"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {isAr
                  ? "ارفع صورة لكل لون (اختياري)."
                  : "Upload an image for each color (optional)."}
              </p>

              {tempColors.size ? (
                <div className="mt-3 space-y-3">
                  {Array.from(tempColors.entries()).map(([k, c]) => {
                    const tempFile = tempColorImageFiles.get(k);
                    const assigned = tempColorImageAssignments.get(k);
                    const existingEntry = colorImageByKey.get(
                      c.nameEn.toLowerCase(),
                    );
                    const existingSrc =
                      (assigned?.imageIdx !== undefined
                        ? resolveImageSrc(product.images?.[assigned.imageIdx])
                        : null) ||
                      (assigned?.imageUrl ? assigned.imageUrl : null) ||
                      (existingEntry?.imageIdx !== undefined
                        ? resolveImageSrc(
                            product.images?.[existingEntry.imageIdx],
                          )
                        : null) ||
                      (existingEntry?.imageUrl ? existingEntry.imageUrl : null);
                    const preview = tempFile
                      ? resolveImageSrc(tempFile)
                      : existingSrc;

                    return (
                      <div
                        key={k}
                        className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {preview ? (
                            <img
                              src={preview}
                              alt={c.nameEn}
                              className="h-12 w-12 rounded-xl object-cover ring-1 ring-gray-200"
                            />
                          ) : (
                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gray-50 text-xs font-bold text-gray-400 ring-1 ring-gray-200">
                              IMG
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-5 w-5 rounded-full ring-1 ${c.hex.toLowerCase() === "#ffffff" ? "ring-gray-200" : "ring-black/5"}`}
                              style={{ backgroundColor: c.hex }}
                            />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-gray-900">
                                {isAr ? c.nameAr : c.nameEn}
                              </p>
                              <p className="text-xs text-gray-500">
                                {isAr ? "صورة اللون" : "Color image"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setTempColorImageFiles((prev) => {
                                  const next = new Map(prev);
                                  next.set(k, file);
                                  return next;
                                });
                              }}
                            />
                            {preview
                              ? isAr
                                ? "تغيير"
                                : "Replace"
                              : isAr
                                ? "رفع"
                                : "Upload"}
                          </label>
                          {preview ? (
                            <button
                              type="button"
                              onClick={() => {
                                setTempColorImageFiles((prev) => {
                                  const next = new Map(prev);
                                  next.delete(k);
                                  return next;
                                });
                                setTempColorImageAssignments((prev) => {
                                  const next = new Map(prev);
                                  next.delete(k);
                                  return next;
                                });
                              }}
                              className="inline-flex h-9 items-center justify-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                            >
                              {isAr ? "إزالة" : "Remove"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-xs text-gray-400">
                  {isAr
                    ? "اختر الألوان أولاً لإضافة صور."
                    : "Select colors first to add images."}
                </p>
              )}
            </div>

            <div className="mt-6 border-t pt-5">
              <p className="text-sm font-bold text-gray-900">
                {isAr ? "ألوان محددة" : "Predefined Colors"}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {COLOR_OPTIONS.map((opt) => {
                  const key = opt.nameEn.toLowerCase();
                  const checked = tempColors.has(key);
                  return (
                    <label
                      key={opt.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Map(tempColors);
                          const nextAssignments = new Map(
                            tempColorImageAssignments,
                          );
                          const nextFiles = new Map(tempColorImageFiles);
                          if (e.target.checked)
                            next.set(key, {
                              nameEn: opt.nameEn,
                              nameAr: opt.nameAr,
                              hex: opt.hex,
                            });
                          else {
                            next.delete(key);
                            nextAssignments.delete(key);
                            nextFiles.delete(key);
                          }
                          setTempColors(next);
                          setTempColorImageAssignments(nextAssignments);
                          setTempColorImageFiles(nextFiles);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-200"
                      />
                      <span
                        className={`h-6 w-6 rounded-full ring-1 ${opt.hex.toLowerCase() === "#ffffff" ? "ring-gray-200" : "ring-black/5"}`}
                        style={{ backgroundColor: opt.hex }}
                      />
                      <span className="text-sm font-bold text-gray-900">
                        {isAr ? opt.nameAr : opt.nameEn}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t pt-5">
              <p className="text-sm font-bold text-gray-900">
                {isAr ? "لون مخصص" : "Custom Color"}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
                <div className="space-y-1.5">
                  <Label className={COLORS.label}>
                    {isAr ? "اللون" : "Color"}
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className="h-10 w-12 cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                      aria-label={isAr ? "اختيار اللون" : "Pick color"}
                    />
                    <Input
                      value={customColorHex}
                      onChange={(e) => setCustomColorHex(e.target.value)}
                      className={`h-10 rounded-xl border-gray-200 font-mono text-sm ${COLORS.focus}`}
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className={COLORS.label}>
                    {isAr ? "اسم اللون" : "Color Name"}
                  </Label>
                  <Input
                    value={customColorName}
                    onChange={(e) => setCustomColorName(e.target.value)}
                    className={`h-10 rounded-xl border-gray-200 text-sm ${COLORS.focus}`}
                    placeholder={isAr ? "أدخل اسم اللون" : "Enter color name"}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const name = customColorName.trim();
                    if (!name) return;
                    const key = name.toLowerCase();
                    const next = new Map(tempColors);
                    next.set(key, {
                      nameEn: name,
                      nameAr: name,
                      hex: customColorHex,
                    });
                    setTempColors(next);
                    setCustomColorName("");
                  }}
                  className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                  aria-label={isAr ? "إضافة" : "Add"}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setColorModalOpen(false)}
                className="h-10 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const selected = Array.from(tempColors.values());

                  // 1) Update color list (and prune variant-stock as needed)
                  const nextSpecsBase = (product.specifications || []).filter(
                    (s) => {
                      const k = (s?.keyEn || "").toLowerCase();
                      return k !== "colors" && k !== "color images";
                    },
                  );
                  if (selected.length) {
                    nextSpecsBase.push({
                      keyEn: "Colors",
                      keyAr: "الألوان",
                      valueEn: selected
                        .map((c) => `${c.nameEn}|${c.hex}`)
                        .join("; "),
                      valueAr: selected
                        .map((c) => `${c.nameAr || c.nameEn}|${c.hex}`)
                        .join("; "),
                    });
                  }

                  // prune existing variant-stock to current sizes/colors
                  const nextSizes = selectedSizes;
                  const nextColorNames = selected.map((c) => c.nameEn);
                  const existingVariantSpec = (
                    product.specifications || []
                  ).find(
                    (s) => (s?.keyEn || "").toLowerCase() === "variant stock",
                  );
                  const existingRaw = (
                    existingVariantSpec?.valueEn || ""
                  ).trim();
                  if (existingRaw) {
                    try {
                      const parsed = JSON.parse(existingRaw);
                      if (Array.isArray(parsed)) {
                        const pruned: VariantStockEntry[] = parsed.filter(
                          (x: any) => {
                            const size =
                              typeof x?.size === "string" ? x.size : "";
                            const color =
                              typeof x?.color === "string" ? x.color : "";
                            const sizeOk = !size || nextSizes.includes(size);
                            const colorOk =
                              !color || nextColorNames.includes(color);
                            return sizeOk && colorOk;
                          },
                        );
                        nextSpecsBase.push({
                          keyEn: "Variant Stock",
                          keyAr: "مخزون المتغيرات",
                          valueEn: JSON.stringify(pruned),
                          valueAr: JSON.stringify(pruned),
                        });
                      }
                    } catch {
                      // ignore
                    }
                  }

                  // 2) Commit color images mapping (store indices into product.images)
                  const existingMappings = parsedColorImages;
                  const existingMap = new Map<string, ColorImageEntry>();
                  existingMappings.forEach((e) =>
                    existingMap.set(e.color.toLowerCase(), e),
                  );

                  const imagesBase = Array.isArray(product.images)
                    ? product.images.slice()
                    : [];
                  const capacity = Math.max(0, 10 - imagesBase.length);
                  const filesToAppend: Array<{ key: string; file: File }> = [];
                  Array.from(tempColorImageFiles.entries()).forEach(
                    ([k, file]) => {
                      if (filesToAppend.length < capacity)
                        filesToAppend.push({ key: k, file });
                    },
                  );
                  const imagesNext = imagesBase.concat(
                    filesToAppend.map((x) => x.file),
                  );

                  const colorImagesNext: ColorImageEntry[] = [];
                  selected.forEach((c) => {
                    const key = c.nameEn.toLowerCase();
                    const newFile = tempColorImageFiles.get(key);
                    if (newFile) {
                      const appended = filesToAppend.find((x) => x.key === key);
                      if (appended) {
                        const idx =
                          imagesBase.length + filesToAppend.indexOf(appended);
                        colorImagesNext.push({
                          color: c.nameEn,
                          colorHex: c.hex,
                          imageIdx: idx,
                        });
                      }
                      return;
                    }

                    const assigned = tempColorImageAssignments.get(key);
                    const fallback = existingMap.get(key);
                    const imageIdx = assigned?.imageIdx ?? fallback?.imageIdx;
                    const imageUrl = assigned?.imageUrl ?? fallback?.imageUrl;
                    if (imageIdx !== undefined || imageUrl) {
                      colorImagesNext.push({
                        color: c.nameEn,
                        colorHex: c.hex,
                        imageIdx,
                        imageUrl,
                      });
                    }
                  });

                  if (colorImagesNext.length) {
                    nextSpecsBase.push({
                      keyEn: "Color Images",
                      keyAr: "صور الألوان",
                      valueEn: JSON.stringify(colorImagesNext),
                      valueAr: JSON.stringify(colorImagesNext),
                    });
                  }

                  if (filesToAppend.length < tempColorImageFiles.size) {
                    // over limit; keep it simple for now
                    toast.error(
                      isAr
                        ? "الحد الأقصى 10 صور. تم تجاهل بعض صور الألوان."
                        : "Max 10 images. Some color images were ignored.",
                    );
                  }

                  onUpdate({
                    specifications: nextSpecsBase,
                    images: imagesNext,
                  });
                  setColorModalOpen(false);
                }}
                className="h-10 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {isAr
                  ? `إضافة الألوان المحددة (${tempColors.size})`
                  : `Add Selected Colors (${tempColors.size})`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
