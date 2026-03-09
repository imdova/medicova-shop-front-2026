"use client";

import { Package, Plus, RefreshCw, Trash2, Truck, X } from "lucide-react";
import { Input } from "@/components/shared/input";
import toast from "react-hot-toast";
import { Label } from "@/components/shared/label";
import { ProductFormData } from "@/lib/validations/product-schema";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSession } from "next-auth/react";
import { getVariants } from "@/services/variantService";
import { ProductOption } from "@/types/product";

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

type ColorOption = { id: string; nameEn: string; nameAr: string; hex: string };
type VariantStockEntry = {
  options: Record<string, string>; // e.g. { "Color": "Red", "Material": "Cotton" }
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
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

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

  const [adminVariants, setAdminVariants] = useState<ProductOption[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  useEffect(() => {
    const fetchAdminVariants = async () => {
      if (!token) return;
      setLoadingVariants(true);
      try {
        const allVariants = await getVariants(token);
        const filtered = allVariants.filter(
          (v) => v.createdBy === "admin" && v.storeId == null,
        );
        setAdminVariants(filtered);
      } catch (err) {
        console.error("Failed to fetch admin variants:", err);
      } finally {
        setLoadingVariants(false);
      }
    };
    fetchAdminVariants();
  }, [token]);

  const getParsedVariantValues = useCallback(
    (variantNameEn: string) => {
      const spec = (product.specifications || []).find(
        (s) => (s?.keyEn || "").toLowerCase() === variantNameEn.toLowerCase(),
      );
      const raw = (spec?.valueEn || "").trim();
      if (!raw) return [] as string[];
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    },
    [product.specifications],
  );

  const getVariantCombinations = useMemo(() => {
    // 1) Collect all active option sets
    const activeOptions: Array<{ key: string; values: string[] }> = [];

    // Colors
    if (selectedColors.length) {
      activeOptions.push({
        key: "Colors",
        values: selectedColors.map((c) => c.name),
      });
    }

    // Admin Variants
    adminVariants.forEach((v: any) => {
      const vals = getParsedVariantValues(v.name.en);
      if (vals.length) {
        activeOptions.push({ key: v.name.en, values: vals });
      }
    });

    if (activeOptions.length === 0) return [];

    // 2) Cartesian product
    let combinations: Array<Record<string, string>> = [{}];
    activeOptions.forEach((opt: any) => {
      const next: Array<Record<string, string>> = [];
      combinations.forEach((combo) => {
        opt.values.forEach((val: string) => {
          next.push({ ...combo, [opt.key]: val });
        });
      });
      combinations = next;
    });

    return combinations;
  }, [selectedColors, adminVariants, getParsedVariantValues]);

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
          options: typeof x?.options === "object" ? x.options : {},
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
      // Create a stable key from options
      const keys = Object.keys(e.options).sort();
      const key = keys.map((k) => `${k}:${e.options[k]}`).join("|");
      map.set(key, e);
    }
    return map;
  }, [parsedVariantStock]);

  const variantStockTotal = useMemo(() => {
    return parsedVariantStock.reduce(
      (sum, x) => sum + (Number.isFinite(x.stock) ? x.stock : 0),
      0,
    );
  }, [parsedVariantStock]);

  const upsertSpecs = useCallback(
    (updates: { colors?: ColorOption[] }) => {
      const vals = updates;
      let next = (product.specifications || []).filter((s) => {
        const k = (s?.keyEn || "").toLowerCase();
        if (k === "colors" && vals.colors) return false;
        return true;
      });

      if (vals.colors) {
        if (vals.colors.length) {
          next.push({
            keyEn: "Colors",
            keyAr: "الألوان",
            valueEn: vals.colors.map((c) => `${c.nameEn}|${c.hex}`).join("; "),
            valueAr: vals.colors
              .map((c) => `${c.nameAr || c.nameEn}|${c.hex}`)
              .join("; "),
          });
        }
      }

      // If a variant-stock spec exists, prune entries to the new colors set
      const nextColorNames = (
        vals.colors ??
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
              const options = x?.options || {};
              // For now, we only prune based on Colors if colors are updated.
              // Admin variant pruning happens when those selections change.
              if (vals.colors && options["Colors"]) {
                return nextColorNames.includes(options["Colors"]);
              }
              return true;
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
    [onUpdate, product.specifications, selectedColors],
  );

  const setVariantStockEntries = useCallback(
    (entries: VariantStockEntry[]) => {
      const cleaned = entries
        .map((e) => ({
          options: e.options || {},
          stock: Number.isFinite(e.stock)
            ? Math.max(0, Math.floor(e.stock))
            : 0,
        }))
        .filter((e) => Object.keys(e.options).length > 0 && e.stock >= 0);

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

  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [activeVariantId, setActiveVariantId] = useState<string | null>(null);
  const [tempVariantValues, setTempVariantValues] = useState<Set<string>>(
    new Set(),
  );

  const activeVariant = useMemo(
    () => adminVariants.find((v) => v.id === activeVariantId) || null,
    [adminVariants, activeVariantId],
  );

  const openVariantModal = (v: ProductOption) => {
    const existing = getParsedVariantValues(v.name.en);
    setTempVariantValues(new Set(existing));
    setActiveVariantId(v.id);
    setVariantModalOpen(true);
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
  const canDistribute = selectedColors.length > 0;

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
                  ? "إدارة المخزون والألوان."
                  : "Manage stock levels and colors."}
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
                    ? "يتم حساب المخزون تلقائيًا من توزيع الألوان."
                    : "Stock is auto-calculated from color distribution."}
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
                              id: preset?.id || r.name,
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

          {/* Admin Variants (Dynamic) */}
          {adminVariants.map((v) => {
            const values = getParsedVariantValues(v.name.en);
            return (
              <div key={v.id} className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {isAr ? v.name.ar : v.name.en}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {isAr
                        ? `اختر ${v.name.ar} المتاحة.`
                        : `Select available ${v.name.en.toLowerCase()}.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openVariantModal(v)}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/30 px-3 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                  >
                    <Plus className="h-4 w-4" />
                    {isAr ? `إضافة ${v.name.ar}` : `Add ${v.name.en}`}
                  </button>
                </div>

                {values.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {values.map((val) => (
                      <span
                        key={val}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100"
                      >
                        {val}
                        <button
                          type="button"
                          onClick={() => {
                            const next = values.filter((x) => x !== val);
                            upsertSpec({
                              keyEn: v.name.en,
                              keyAr: v.name.ar,
                              valueEn: next.join(", "),
                              valueAr: next.join(", "),
                            });
                          }}
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
                    {isAr
                      ? `لا توجد ${v.name.ar} محددة بعد.`
                      : `No ${v.name.en.toLowerCase()} selected yet.`}
                  </p>
                )}
              </div>
            );
          })}

          {/* Variant stock distribution */}
          <div className="mt-6 border-t pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {isAr
                    ? "توزيع المخزون حسب اللون"
                    : "Stock distribution by color"}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {isAr
                    ? "حدد كمية المخزون لكل لون. سيتم جمعها تلقائيًا في كمية المخزون."
                    : "Set stock for each color. Total will be summed automatically."}
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
                      getVariantCombinations.forEach((combo) => {
                        const stock = first ? seedTotal : 0;
                        first = false;
                        initial.push({
                          options: combo,
                          stock,
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
                  ? "لتفعيل التوزيع، قم باختيار الألوان أولاً."
                  : "To enable distribution, please select colors first."}
              </div>
            ) : null}

            {distributionEnabled && canDistribute ? (
              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[540px] rounded-2xl border border-gray-200 bg-white">
                  <div className="grid grid-cols-[1fr_160px] items-center border-b border-gray-200 bg-gray-50/60 px-3 py-3 text-xs font-bold text-gray-700">
                    <div className="px-2">
                      {isAr ? "التركيبة" : "Combination"}
                    </div>
                    <div className="px-2">{isAr ? "المخزون" : "Stock"}</div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {getVariantCombinations.map((combo) => {
                      const keys = Object.keys(combo).sort();
                      const key = keys.map((k) => `${k}:${combo[k]}`).join("|");
                      const current = variantStockMap.get(key)?.stock ?? 0;

                      // Display string: "Red / Cotton / Large"
                      const displayParts = keys.map((k) => combo[k]);
                      const displayStr = displayParts.join(" / ");

                      return (
                        <div
                          key={key}
                          className="grid grid-cols-[1fr_160px] items-center px-3 py-3"
                        >
                          <div className="px-2 text-sm font-bold text-gray-900">
                            {displayStr}
                          </div>
                          <div className="px-2">
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

                                getVariantCombinations.forEach((c) => {
                                  const cKeys = Object.keys(c).sort();
                                  const cKey = cKeys
                                    .map((k) => `${k}:${c[k]}`)
                                    .join("|");
                                  let stock =
                                    variantStockMap.get(cKey)?.stock ?? 0;
                                  if (cKey === key) stock = nextValue;
                                  nextEntries.push({ options: c, stock });
                                });

                                setVariantStockEntries(nextEntries);
                              }}
                              className="h-10 rounded-xl border-gray-200 px-3 text-sm"
                            />
                          </div>
                        </div>
                      );
                    })}
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

                  // prune existing variant-stock to current colors
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
                            const color =
                              typeof x?.color === "string" ? x.color : "";
                            const colorOk =
                              !color || nextColorNames.includes(color);
                            return colorOk;
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

      {/* Admin Variant Selection Modal */}
      {variantModalOpen && activeVariant ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setVariantModalOpen(false)}
            aria-label={isAr ? "إغلاق" : "Close"}
          />
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  {isAr
                    ? `اختر ${activeVariant.name.ar}`
                    : `Select ${activeVariant.name.en}`}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isAr
                    ? `اختر ${activeVariant.name.ar} المتاحة لمنتجك`
                    : `Select ${activeVariant.name.en.toLowerCase()} for your product`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVariantModalOpen(false)}
                className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-700"
                aria-label={isAr ? "إغلاق" : "Close"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5">
              <p className="text-sm font-bold text-gray-900">
                {isAr ? "الخيارات المتاحة" : "Available Options"}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activeVariant.option_values.map((opt) => {
                  const label =
                    (opt.label as any)[locale] || opt.label.en || "";
                  const checked = tempVariantValues.has(label);
                  return (
                    <label
                      key={opt.id}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(tempVariantValues);
                          if (e.target.checked) next.add(label);
                          else next.delete(label);
                          setTempVariantValues(next);
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-200"
                      />
                      <span className="text-sm font-bold text-gray-900">
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setVariantModalOpen(false)}
                className="h-10 rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const selected = Array.from(tempVariantValues);
                  upsertSpec({
                    keyEn: activeVariant.name.en,
                    keyAr: activeVariant.name.ar,
                    valueEn: selected.join(", "),
                    valueAr: selected.join(", "),
                  });
                  setVariantModalOpen(false);
                }}
                className="h-10 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                {isAr
                  ? `إضافة الخيارات المحددة (${tempVariantValues.size})`
                  : `Add Selected Options (${tempVariantValues.size})`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
