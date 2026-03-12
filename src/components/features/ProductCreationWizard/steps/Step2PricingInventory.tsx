"use client";

import { Check, Package, Plus, RefreshCw, Trash2, Truck, X } from "lucide-react";
import { Input } from "@/components/shared/input";
import toast from "react-hot-toast";
import { Label } from "@/components/shared/label";
import { ProductFormData } from "@/lib/validations/product-schema";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSession } from "next-auth/react";
import { getVariants } from "@/services/variantService";
import {
  createPackage,
  deletePackage,
  getPackages,
} from "@/services/packageService";
import { extractSessionToken } from "@/lib/auth/sessionToken";
import { getProducts } from "@/services/productService";
import { ProductOption } from "@/types/product";

interface Step2PricingInventoryProps {
  product: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
  locale: string;
  token?: string;
  userRole?: string;
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

function normalizeRole(value: unknown): string {
  if (typeof value === "string") return value.trim().toLowerCase();
  return "";
}

function normalizeStoreId(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized === "null" || normalized === "undefined") {
      return null;
    }
    return normalized;
  }
  if (typeof value === "object") {
    const id = (value as any)?._id || (value as any)?.id;
    if (typeof id === "string" && id.trim()) return id.trim().toLowerCase();
  }
  return null;
}

function normalizePackageNumber(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function packageIdentity(item: ShippingPackage): string {
  const id = String(item.id || "").trim();
  if (id) return `id:${id}`;

  const name = String(item.name || "").trim().toLowerCase();
  return `shape:${name}|${item.weightKg ?? ""}|${item.lengthCm ?? ""}|${item.widthCm ?? ""}|${item.heightCm ?? ""}`;
}

function mergeShippingPackageLists(
  current: ShippingPackage[],
  incoming: ShippingPackage[],
): ShippingPackage[] {
  const merged = [...current];
  const seen = new Set(current.map(packageIdentity));

  incoming.forEach((item) => {
    const normalized: ShippingPackage = {
      id: String(item.id || makeId()),
      name: String(item.name || "").trim(),
      weightKg: normalizePackageNumber(item.weightKg),
      lengthCm: normalizePackageNumber(item.lengthCm),
      widthCm: normalizePackageNumber(item.widthCm),
      heightCm: normalizePackageNumber(item.heightCm),
    };
    if (!normalized.name) return;

    const key = packageIdentity(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    merged.push(normalized);
  });

  return merged;
}

function isColorVariant(item: ProductOption): boolean {
  const names = [item.name?.en, item.name?.ar]
    .map((x) => String(x || "").trim().toLowerCase())
    .filter(Boolean);
  return names.some(
    (name) =>
      name === "color" ||
      name === "colors" ||
      name === "اللون" ||
      name === "الألوان",
  );
}

function dedupeVariants(items: ProductOption[]): ProductOption[] {
  const seen = new Set<string>();
  const output: ProductOption[] = [];

  items.forEach((item, index) => {
    const key = item.id
      ? `id:${item.id}`
      : `name:${String(item.name?.en || "").toLowerCase()}|${String(item.name?.ar || "").toLowerCase()}|${index}`;
    if (seen.has(key)) return;
    seen.add(key);
    output.push(item);
  });

  return output;
}

function resolveVisibleVariants(items: ProductOption[]): ProductOption[] {
  const cleaned = dedupeVariants(items).filter(
    (item) =>
      Array.isArray(item.option_values) &&
      item.option_values.length > 0 &&
      !isColorVariant(item),
  );

  const strictAdminGlobal = cleaned.filter((item) => {
    const role = normalizeRole(item.createdBy);
    const storeId = normalizeStoreId((item as any).storeId);
    return role === "admin" && storeId == null;
  });
  if (strictAdminGlobal.length) return strictAdminGlobal;

  const adminOrUnknown = cleaned.filter(
    (item) => normalizeRole(item.createdBy) !== "seller",
  );
  if (adminOrUnknown.length) return adminOrUnknown;

  return cleaned;
}

function getTemplateOptionId(option: any): string {
  const rawId = option?.id ?? option?._id;
  if (rawId != null) {
    const normalized = String(rawId).trim();
    if (normalized) return normalized;
  }
  const en = String(option?.label?.en || "").trim().toLowerCase();
  const ar = String(option?.label?.ar || "").trim().toLowerCase();
  return `${en}|${ar}`;
}

export const Step2PricingInventory = ({
  product,
  onUpdate,
  errors,
  locale,
  token: propToken,
  userRole,
}: Step2PricingInventoryProps) => {
  const isAr = locale === "ar";
  const { data: session } = useSession();
  const token = propToken || extractSessionToken(session);
  const normalizedUserRole = normalizeRole(
    userRole || (session as any)?.user?.role,
  );
  const sellerStoreId =
    (session as any)?.user?.storeId ||
    (session as any)?.user?.id ||
    (session as any)?.user?._id ||
    product.store ||
    "";
  const normalizeSku = useCallback((value: string) => value.trim().toUpperCase(), []);

  const objectUrlCacheRef = useRef<Map<File, string>>(new Map());
  const initialSkuRef = useRef("");
  const [knownSkuSet, setKnownSkuSet] = useState<Set<string>>(new Set());
  const sellerPackagesHydratedRef = useRef(false);
  const [sellerSavedPackages, setSellerSavedPackages] = useState<
    ShippingPackage[]
  >([]);
  const [isSavingPackage, setIsSavingPackage] = useState(false);
  const [deletingPackageId, setDeletingPackageId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    return () => {
      objectUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlCacheRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!initialSkuRef.current && product.identity?.sku) {
      initialSkuRef.current = normalizeSku(product.identity.sku);
    }
  }, [product.identity?.sku, normalizeSku]);

  useEffect(() => {
    const normalizedToken = token?.trim();
    if (!normalizedToken) return;
    let cancelled = false;

    const loadKnownSkus = async () => {
      try {
        const products = await getProducts(normalizedToken);
        if (cancelled) return;
        const nextSet = new Set<string>();
        products.forEach((item: any) => {
          if (item?.sku) nextSet.add(normalizeSku(String(item.sku)));
          if (item?.identity?.sku) {
            nextSet.add(normalizeSku(String(item.identity.sku)));
          }
        });
        setKnownSkuSet(nextSet);
      } catch {
        if (!cancelled) setKnownSkuSet(new Set());
      }
    };

    void loadKnownSkus();
    return () => {
      cancelled = true;
    };
  }, [token, normalizeSku]);

  const normalizedSku = normalizeSku(product.identity?.sku || "");
  const isSkuTaken =
    !!normalizedSku &&
    knownSkuSet.has(normalizedSku) &&
    normalizedSku !== initialSkuRef.current;

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
      if (!token) {
        setAdminVariants([]);
        return;
      }
      setLoadingVariants(true);
      try {
        const allVariants = await getVariants(token);
        const resolved = resolveVisibleVariants(allVariants);
        if (resolved.length) {
          setAdminVariants(resolved);
        } else {
          setAdminVariants([]);
        }
      } catch (err) {
        console.error("Failed to fetch admin variants:", err);
        setAdminVariants([]);
      } finally {
        setLoadingVariants(false);
      }
    };
    fetchAdminVariants();
  }, [token, userRole]);

  const findDraftVariantForTemplate = useCallback(
    (template: ProductOption) => {
      const templateId = String(template.id || "").trim();
      return (product.productVariants || []).find((item: any) => {
        const byTemplateId =
          templateId &&
          String((item as any)?.templateVariantId || "").trim() === templateId;
        const byName =
          String((item as any)?.nameEn || "")
            .trim()
            .toLowerCase() ===
          String(template.name.en || "")
            .trim()
            .toLowerCase();
        return byTemplateId || byName;
      }) as any | undefined;
    },
    [product.productVariants],
  );

  const getSelectedOptionIdsForTemplate = useCallback(
    (template: ProductOption): string[] => {
      const draft = findDraftVariantForTemplate(template);
      if (!draft || !Array.isArray(draft.optionsEn)) return [];

      return template.option_values
        .filter((opt) =>
          draft.optionsEn.some((entry: any) => {
            const optionName = String(entry?.optionName || "")
              .trim()
              .toLowerCase();
            const enLabel = String((opt.label as any)?.en || "")
              .trim()
              .toLowerCase();
            const arLabel = String((opt.label as any)?.ar || "")
              .trim()
              .toLowerCase();
            return optionName && (optionName === enLabel || optionName === arLabel);
          }),
        )
        .map((opt) => getTemplateOptionId(opt));
    },
    [findDraftVariantForTemplate],
  );

  const getSelectedVariantValues = useCallback(
    (template: ProductOption): string[] => {
      const draft = findDraftVariantForTemplate(template);
      if (!draft || !Array.isArray(draft.optionsEn)) return [];

      return draft.optionsEn
        .map((entry: any) => String(entry?.optionName || "").trim())
        .filter(Boolean);
    },
    [findDraftVariantForTemplate],
  );

  const upsertVariantSelectionFromTemplate = useCallback(
    (template: ProductOption, selectedOptionIds: string[]) => {
      const selectedSet = new Set(selectedOptionIds.map((id) => String(id)));
      const selectedOptions = template.option_values.filter((opt) =>
        selectedSet.has(getTemplateOptionId(opt)),
      );
      const templateId = String(template.id || "").trim();

      const existingList = (product.productVariants || []) as any[];
      const remaining = existingList.filter((item: any) => {
        const byTemplateId =
          templateId &&
          String(item?.templateVariantId || "").trim() === templateId;
        const byName =
          String(item?.nameEn || "")
            .trim()
            .toLowerCase() ===
          String(template.name.en || "")
            .trim()
            .toLowerCase();
        return !(byTemplateId || byName);
      });

      if (!selectedOptions.length) {
        onUpdate({ productVariants: remaining as any });
        return;
      }

      const existing = existingList.find((item: any) => {
        const byTemplateId =
          templateId &&
          String(item?.templateVariantId || "").trim() === templateId;
        const byName =
          String(item?.nameEn || "")
            .trim()
            .toLowerCase() ===
          String(template.name.en || "")
            .trim()
            .toLowerCase();
        return byTemplateId || byName;
      }) as any;

      const priceByName = new Map<string, number>();
      selectedOptions.forEach((opt) => {
        const enName = String((opt.label as any)?.en || "")
          .trim()
          .toLowerCase();
        const arName = String((opt.label as any)?.ar || "")
          .trim()
          .toLowerCase();
        const rawPrice = Number((opt as any)?.price || 0);
        const price = Number.isFinite(rawPrice) ? rawPrice : 0;
        if (enName) priceByName.set(enName, price);
        if (arName) priceByName.set(arName, price);
      });

      const nextVariant = {
        id: existing?.id,
        nameEn: template.name.en,
        nameAr: template.name.ar || template.name.en,
        type: String((template as any).option_type || "dropdown"),
        optionsEn: selectedOptions.map((opt) => ({
          optionName:
            String((opt.label as any)?.en || (opt.label as any)?.ar || "").trim(),
          price: Number((opt as any)?.price || 0) || 0,
          stock: 0,
        })),
        optionsAr: selectedOptions.map((opt) => ({
          optionName:
            String((opt.label as any)?.ar || (opt.label as any)?.en || "").trim(),
          price: Number((opt as any)?.price || 0) || 0,
          stock: 0,
        })),
        createdBy: normalizedUserRole === "admin" ? "admin" : "seller",
        storeId:
          normalizedUserRole === "admin"
            ? product.store || sellerStoreId || ""
            : sellerStoreId || product.store || "",
        templateVariantId: template.id,
      };

      onUpdate({
        productVariants: [...remaining, nextVariant as any].map((variant: any) => {
          if (!Array.isArray(variant?.optionsEn) || !Array.isArray(variant?.optionsAr)) {
            return variant;
          }
          return {
            ...variant,
            optionsEn: variant.optionsEn.map((opt: any) => {
              const key = String(opt?.optionName || "").trim().toLowerCase();
              const price = priceByName.get(key);
              return {
                optionName: String(opt?.optionName || "").trim(),
                price:
                  price ??
                  (Number.isFinite(Number(opt?.price)) ? Number(opt.price) : 0),
                stock: Number.isFinite(Number(opt?.stock)) ? Number(opt.stock) : 0,
              };
            }),
            optionsAr: variant.optionsAr.map((opt: any) => {
              const key = String(opt?.optionName || "").trim().toLowerCase();
              const price = priceByName.get(key);
              return {
                optionName: String(opt?.optionName || "").trim(),
                price:
                  price ??
                  (Number.isFinite(Number(opt?.price)) ? Number(opt.price) : 0),
                stock: Number.isFinite(Number(opt?.stock)) ? Number(opt.stock) : 0,
              };
            }),
          };
        }) as any,
      });
    },
    [
      normalizedUserRole,
      onUpdate,
      product.productVariants,
      product.store,
      sellerStoreId,
    ],
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

    // Selected variants from seller selection
    adminVariants.forEach((v: any) => {
      const vals = getSelectedVariantValues(v);
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
  }, [selectedColors, adminVariants, getSelectedVariantValues]);

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

  useEffect(() => {
    if (normalizedUserRole !== "seller") return;
    const normalizedToken = token?.trim();
    if (!normalizedToken) return;
    if (sellerPackagesHydratedRef.current) return;
    sellerPackagesHydratedRef.current = true;

    let cancelled = false;
    const hydrateSellerPackages = async () => {
      try {
        const sellerPackages = await getPackages(normalizedToken);
        if (cancelled || !sellerPackages.length) return;

        const remotePackages: ShippingPackage[] = sellerPackages.map((pkg) => ({
          id: pkg.id,
          name: pkg.name,
          weightKg: pkg.weightKg,
          lengthCm: pkg.lengthCm,
          widthCm: pkg.widthCm,
          heightCm: pkg.heightCm,
        }));
        setSellerSavedPackages(remotePackages);
      } catch (error) {
        console.error("Failed to preload seller packages:", error);
      }
    };

    void hydrateSellerPackages();
    return () => {
      cancelled = true;
    };
  }, [normalizedUserRole, token]);

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
    const existing = getSelectedOptionIdsForTemplate(v);
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
  const [distributionCap, setDistributionCap] = useState(0);

  const colorHexByName = useMemo(() => {
    const map = new Map<string, string>();
    selectedColors.forEach((c) => {
      map.set(c.name.trim().toLowerCase(), c.hex || "#9ca3af");
    });
    return map;
  }, [selectedColors]);

  useEffect(() => {
    if (!distributionEnabled) return;
    if (!distributionCap) {
      setDistributionCap(
        Math.max(
          0,
          Math.floor(product.inventory.stockQuantity || variantStockTotal || 0),
        ),
      );
    }
  }, [
    distributionEnabled,
    distributionCap,
    product.inventory.stockQuantity,
    variantStockTotal,
  ]);

  const [draftPackage, setDraftPackage] = useState<ShippingPackage>({
    id: "",
    name: "",
    weightKg: undefined,
    lengthCm: undefined,
    widthCm: undefined,
    heightCm: undefined,
  });

  const resetDraftPackage = useCallback(() => {
    setDraftPackage({
      id: "",
      name: "",
      weightKg: undefined,
      lengthCm: undefined,
      widthCm: undefined,
      heightCm: undefined,
    });
  }, []);

  const isPackageSelected = useCallback(
    (candidate: ShippingPackage) =>
      shippingPackages.some(
        (item) =>
          item.id === candidate.id ||
          packageIdentity(item) === packageIdentity(candidate),
      ),
    [shippingPackages],
  );

  const togglePackageSelection = useCallback(
    (candidate: ShippingPackage) => {
      const selected = isPackageSelected(candidate);
      if (selected) {
        const nextList = shippingPackages.filter(
          (item) =>
            item.id !== candidate.id &&
            packageIdentity(item) !== packageIdentity(candidate),
        );
        onUpdate({ packages: nextList });
        return;
      }

      const nextList = mergeShippingPackageLists(shippingPackages, [candidate]);
      onUpdate({ packages: nextList });
    },
    [isPackageSelected, onUpdate, shippingPackages],
  );

  const handleDeleteSavedPackage = useCallback(
    async (candidate: ShippingPackage) => {
      const packageId = String(candidate.id || "").trim();
      if (!packageId) return;

      const authToken = token?.trim();
      if (!authToken) {
        toast.error(isAr ? "يجب تسجيل الدخول أولًا." : "Please login first.");
        return;
      }

      setDeletingPackageId(packageId);
      try {
        await deletePackage(packageId, authToken);

        setSellerSavedPackages((prev) =>
          prev.filter(
            (item) =>
              item.id !== packageId &&
              packageIdentity(item) !== packageIdentity(candidate),
          ),
        );

        const nextSelectedPackages = shippingPackages.filter(
          (item) =>
            item.id !== packageId &&
            packageIdentity(item) !== packageIdentity(candidate),
        );
        onUpdate({ packages: nextSelectedPackages });

        toast.success(
          isAr ? "تم حذف الحزمة بنجاح." : "Package deleted successfully.",
        );
      } catch (error) {
        console.error("Failed to delete seller package:", error);
        toast.error(
          isAr
            ? "تعذر حذف الحزمة. حاول مرة أخرى."
            : "Failed to delete package. Please try again.",
        );
      } finally {
        setDeletingPackageId(null);
      }
    },
    [isAr, onUpdate, shippingPackages, token],
  );

  const handleAddPackage = useCallback(async () => {
    if (!shippingRequired) return;
    const name = draftPackage.name.trim();
    if (!name) return;

    const payload = {
      name,
      weightKg: normalizePackageNumber(draftPackage.weightKg),
      lengthCm: normalizePackageNumber(draftPackage.lengthCm),
      widthCm: normalizePackageNumber(draftPackage.widthCm),
      heightCm: normalizePackageNumber(draftPackage.heightCm),
    };

    const localPackage: ShippingPackage = {
      id: makeId(),
      name: payload.name,
      weightKg: payload.weightKg,
      lengthCm: payload.lengthCm,
      widthCm: payload.widthCm,
      heightCm: payload.heightCm,
    };

    let packageToAppend = localPackage;
    let createdInSellerLibrary = false;

    if (normalizedUserRole === "seller") {
      const authToken = token?.trim();
      if (authToken) {
        setIsSavingPackage(true);
        try {
          const saved = await createPackage(payload, authToken);
          packageToAppend = {
            id: saved.id || localPackage.id,
            name: saved.name,
            weightKg: saved.weightKg,
            lengthCm: saved.lengthCm,
            widthCm: saved.widthCm,
            heightCm: saved.heightCm,
          };
          setSellerSavedPackages((prev) =>
            mergeShippingPackageLists(prev, [packageToAppend]),
          );
          createdInSellerLibrary = true;
          toast.success(
            isAr
              ? "تم حفظ الحزمة. اضغط علامة الصح لإضافتها لهذا المنتج."
              : "Package saved. Use the check button to include it in this product.",
          );
        } catch (error) {
          console.error("Failed to persist seller package:", error);
          toast.error(
            isAr
              ? "تعذر حفظ الحزمة في حسابك. تمت إضافتها لهذا المنتج فقط."
              : "Could not save package to your account. Added to this product only.",
          );
        } finally {
          setIsSavingPackage(false);
        }
      }
    }

    if (createdInSellerLibrary) {
      resetDraftPackage();
      return;
    }

    const nextList = mergeShippingPackageLists(shippingPackages, [
      packageToAppend,
    ]);
    onUpdate({ packages: nextList });
    resetDraftPackage();
  }, [
    shippingRequired,
    draftPackage.name,
    draftPackage.weightKg,
    draftPackage.lengthCm,
    draftPackage.widthCm,
    draftPackage.heightCm,
    normalizedUserRole,
    token,
    shippingPackages,
    onUpdate,
    resetDraftPackage,
    isAr,
  ]);

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
                      identity: {
                        ...product.identity,
                        sku: normalizeSku(e.target.value),
                      },
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
              {isSkuTaken ? (
                <p className="text-[10px] font-semibold text-red-500">
                  {isAr ? "هذا الـ SKU مستخدم بالفعل." : "This SKU is already in use."}
                </p>
              ) : null}
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
            const values = getSelectedVariantValues(v);
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
                    {values.map((val: string) => (
                      <span
                        key={val}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100"
                      >
                        {val}
                        <button
                          type="button"
                          onClick={() => {
                            const selectedIds =
                              getSelectedOptionIdsForTemplate(v);
                            const nextIds = selectedIds.filter((optionId) => {
                              const targetOption = v.option_values.find(
                                (opt) => getTemplateOptionId(opt) === optionId,
                              );
                              if (!targetOption) return false;

                              const target = val.trim().toLowerCase();
                              const enLabel = String(
                                (targetOption.label as any)?.en || "",
                              )
                                .trim()
                                .toLowerCase();
                              const arLabel = String(
                                (targetOption.label as any)?.ar || "",
                              )
                                .trim()
                                .toLowerCase();

                              return enLabel !== target && arLabel !== target;
                            });

                            upsertVariantSelectionFromTemplate(v, nextIds);
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
                    ? `${variantStockTotal}${distributionCap ? ` / ${distributionCap}` : ""}`
                    : product.inventory.stockQuantity || 0}
                </span>
                {distributionEnabled ? (
                  <button
                    type="button"
                    onClick={() => {
                      clearVariantStock();
                      setDistributionCap(0);
                    }}
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
                      const seedTotal = Math.max(
                        0,
                        Math.floor(product.inventory.stockQuantity || 0),
                      );
                      setDistributionCap(seedTotal);
                      const initial: VariantStockEntry[] =
                        getVariantCombinations.map((combo) => ({
                          options: combo,
                          stock: 0,
                        }));
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

                      const isColorKey = (k: string) => {
                        const normalized = k.trim().toLowerCase();
                        return normalized === "colors" || normalized === "color";
                      };

                      return (
                        <div
                          key={key}
                          className="grid grid-cols-[1fr_160px] items-center px-3 py-3"
                        >
                          <div className="px-2 text-sm font-bold text-gray-900">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {keys.map((k, idx) => {
                                const value = combo[k];
                                const hex = isColorKey(k)
                                  ? colorHexByName.get(
                                      String(value).trim().toLowerCase(),
                                    ) || "#9ca3af"
                                  : null;

                                return (
                                  <span
                                    key={`${key}-${k}-${value}`}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2 py-0.5 text-xs font-bold text-gray-800 ring-1 ring-gray-200"
                                  >
                                    {hex ? (
                                      <span
                                        className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                                        style={{ backgroundColor: hex }}
                                      />
                                    ) : null}
                                    <span>{value}</span>
                                    {idx < keys.length - 1 ? (
                                      <span className="text-gray-400">/</span>
                                    ) : null}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <div className="px-2">
                            <Input
                              type="number"
                              min={0}
                              value={current}
                              onChange={(e) => {
                                const requestedValue = Math.max(
                                  0,
                                  parseInt(e.target.value || "0"),
                                );
                                const nextEntries: VariantStockEntry[] = [];
                                let totalWithoutCurrent = 0;

                                getVariantCombinations.forEach((c) => {
                                  const cKeys = Object.keys(c).sort();
                                  const cKey = cKeys
                                    .map((x) => `${x}:${c[x]}`)
                                    .join("|");
                                  if (cKey !== key) {
                                    totalWithoutCurrent +=
                                      variantStockMap.get(cKey)?.stock ?? 0;
                                  }
                                });

                                const cap = Math.max(
                                  0,
                                  Math.floor(distributionCap || 0),
                                );
                                const maxForCurrent = Math.max(
                                  0,
                                  cap - totalWithoutCurrent,
                                );
                                const nextValue = Math.min(
                                  requestedValue,
                                  maxForCurrent,
                                );

                                if (requestedValue > maxForCurrent) {
                                  toast.error(
                                    isAr
                                      ? `لا يمكن تجاوز إجمالي المخزون (${cap}).`
                                      : `Cannot exceed total stock (${cap}).`,
                                  );
                                }

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
                  disabled={
                    !shippingRequired || !draftPackage.name.trim() || isSavingPackage
                  }
                  onClick={() => {
                    void handleAddPackage();
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

              {normalizedUserRole === "seller" && sellerSavedPackages.length ? (
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/30 p-3">
                  <p className="text-xs font-bold text-emerald-800">
                    {isAr
                      ? "حزمك المحفوظة (اضغط علامة الصح لإضافتها للمنتج)"
                      : "Your saved packages (tap check to add to this product)"}
                  </p>
                  <div className="mt-2 space-y-2">
                    {sellerSavedPackages.map((pkg) => {
                      const selected = isPackageSelected(pkg);
                      return (
                        <div
                          key={`saved-${packageIdentity(pkg)}`}
                          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-white px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {pkg.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {pkg.lengthCm ?? 0}×{pkg.widthCm ?? 0}×
                              {pkg.heightCm ?? 0} cm • {pkg.weightKg ?? 0} kg
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                void handleDeleteSavedPackage(pkg);
                              }}
                              disabled={deletingPackageId === pkg.id}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                              aria-label={isAr ? "حذف الحزمة" : "Delete package"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => togglePackageSelection(pkg)}
                              className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                                selected
                                  ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                                  : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                              }`}
                              aria-label={isAr ? "تحديد الحزمة" : "Select package"}
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

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
                            const directColor =
                              typeof x?.color === "string" ? x.color : "";
                            const optionColor =
                              x?.options && typeof x.options === "object"
                                ? typeof x.options?.Color === "string"
                                  ? x.options.Color
                                  : typeof x.options?.Colors === "string"
                                    ? x.options.Colors
                                    : ""
                                : "";
                            const color = directColor || optionColor;
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
                  const optionId = getTemplateOptionId(opt);
                  const checked = tempVariantValues.has(optionId);
                  return (
                    <label
                      key={optionId}
                      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(tempVariantValues);
                          if (e.target.checked) next.add(optionId);
                          else next.delete(optionId);
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
                  upsertVariantSelectionFromTemplate(activeVariant, selected);
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
