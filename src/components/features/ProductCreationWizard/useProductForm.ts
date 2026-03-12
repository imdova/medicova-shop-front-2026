import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ProductFormData } from "@/lib/validations/product-schema";
import {
  step1CoreSchema,
  step2MediaSchema,
  step3MediaSchema,
  step4SettingsSchema,
} from "@/lib/validations/product-schema";
import {
  createProduct,
  updateProductApi,
  getProductById,
  CreateProductPayload,
} from "@/services/productService";
import { uploadImage } from "@/lib/uploadService";
import { createVariant } from "@/services/variantService";
import { extractSessionToken } from "@/lib/auth/sessionToken";
import toast from "react-hot-toast";

export type Step =
  | "step1_core"
  | "step2_pricing"
  | "step3_media"
  | "step4_settings";

type SubmitMode = "publish" | "draft";
type ValidateStepOptions = {
  submitMode?: SubmitMode;
  forceSubmit?: boolean;
};

export const useProductForm = (productId?: string) => {
  const router = useRouter();
  const { data: session } = useSession();
  const token = extractSessionToken(session);
  const user = (session as any)?.user;
  const isEditMode = !!productId;

  const [currentStep, setCurrentStep] = useState<Step>("step1_core");
  const [isLoading, setIsLoading] = useState(!!productId);
  const [product, setProduct] = useState<ProductFormData>({
    highlightsEn: [],
    highlightsAr: [],
    title: { en: "", ar: "" },
    slugEn: "",
    slugAr: "",
    descriptions: { descriptionEn: "", descriptionAr: "" },
    identity: { sku: "", skuMode: "manual" },
    classification: {
      category: "",
      subcategory: "",
      childCategory: "",
      brand: "",
      productType: "Physical Product",
    },
    pricing: {
      originalPrice: 0,
      salePrice: 0,
      startDate: null,
      endDate: null,
    },
    inventory: {
      trackStock: true,
      stockQuantity: 0,
      stockStatus: "in_stock",
    },
    media: {
      galleryImages: [],
    },
    productVariants: [],
    tags: [],
    specifications: [],
    shipping: {
      shippingCostInsideCairo: 0,
      shippingCostRegion1: 0,
      shippingCostRegion2: 0,
      isPhysicalProduct: true,
    },
    packages: [],
    images: [],
    createdBy: "seller",
    approved: false,
    rate: 0,
    store: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedProduct, setConfirmedProduct] =
    useState<ProductFormData>(product);

  const updateProduct = useCallback((updates: Partial<ProductFormData>) => {
    setProduct((prev) => ({ ...prev, ...updates }));

    const updatedFields = Object.keys(updates);
    if (updatedFields.length > 0) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        updatedFields.forEach((field) => {
          Object.keys(newErrors).forEach((errorKey) => {
            if (errorKey.startsWith(field + ".") || errorKey === field) {
              delete newErrors[errorKey];
            }
          });
        });
        return newErrors;
      });
    }
  }, []);

  useEffect(() => {
    if (!productId || !token) return;
    setIsLoading(true);
    getProductById(productId, token)
      .then((data: any) => {
        if (data) {
          console.log("DEBUG: Full product data for edit:", JSON.stringify(data, null, 2));
          const d = data;

          // 1. Synthesize Specifications from Variants if they are missing
          const existingSpecs = d.specifications || [];
          const hasSizes = existingSpecs.some((s: any) => (s?.keyEn || "").toLowerCase() === "sizes");
          const hasColors = existingSpecs.some((s: any) => (s?.keyEn || "").toLowerCase() === "colors");
          const productVariants = d.variants || [];

          let synthesizedSpecs = [...existingSpecs];
          
          if (productVariants.length > 0 && (!hasSizes || !hasColors)) {
            console.log("DEBUG: Synthesizing specifications from variants...");
            const allSizes = new Set<string>();
            const allColors = new Map<string, string>(); // Name -> Hex
            const stockEntries: any[] = [];

            productVariants.forEach((v: any) => {
              if (typeof v === "string") return;
              
              const options = v.optionsEn || v.option_values || [];
              const type = (v.type || v.option_type || "").toLowerCase();

              options.forEach((opt: any) => {
                const name = opt.optionName || opt.label?.en || opt.color || opt.hex || "";
                const stock = opt.stock || 0;
                
                if (type === "dropdown" || v.nameEn === "Size") {
                  allSizes.add(name);
                  stockEntries.push({ size: name, stock });
                } else if (type === "color" || v.nameEn === "Color") {
                  const hex = opt.color || opt.hex || "";
                  allColors.set(name, hex);
                  stockEntries.push({ color: name, colorHex: hex, stock });
                }
              });
            });

            if (allSizes.size > 0 && !hasSizes) {
              const val = Array.from(allSizes).join(", ");
              synthesizedSpecs.push({ keyEn: "Sizes", keyAr: "المقاسات", valueEn: val, valueAr: val });
            }
            if (allColors.size > 0 && !hasColors) {
              const val = Array.from(allColors.entries()).map(([n, h]) => `${n}|${h}`).join("; ");
              synthesizedSpecs.push({ keyEn: "Colors", keyAr: "الألوان", valueEn: val, valueAr: val });
            }
            if (stockEntries.length > 0 && !existingSpecs.some((s: any) => (s?.keyEn || "").toLowerCase() === "variant stock")) {
              const val = JSON.stringify(stockEntries);
              synthesizedSpecs.push({ keyEn: "Variant Stock", keyAr: "مخزون المتغيرات", valueEn: val, valueAr: val });
            }
          }

          setProduct((prev) => ({
            ...prev,
            title: { en: d.nameEn || "", ar: d.nameAr || "" },
            slugEn: d.slugEn || "",
            slugAr: d.slugAr || "",
            descriptions: {
              descriptionEn: d.descriptions?.descriptionEn || d.descriptionEn || "",
              descriptionAr: d.descriptions?.descriptionAr || d.descriptionAr || "",
            },
            identity: {
              sku: d.identity?.sku || d.sku || "",
              skuMode: d.identity?.skuMode || d.skuMode || "manual",
            },
            classification: {
              category: d.classification?.category?._id || d.classification?.category || d.category?._id || d.category || "",
              subcategory: d.classification?.subcategory?._id || d.classification?.subcategory || d.subcategory?._id || d.subcategory || "",
              childCategory: d.classification?.childCategory?._id || d.classification?.childCategory || d.childCategory?._id || d.childCategory || "",
              brand: d.classification?.brand?._id || d.classification?.brand || d.brand?._id || d.brand || "",
              productType: d.classification?.productType || d.productType || "Physical Product",
            },
            pricing: {
              originalPrice: d.pricing?.originalPrice ?? d.originalPrice ?? d.price ?? 0,
              salePrice: d.pricing?.salePrice ?? d.salePrice ?? d.sale_price ?? 0,
              startDate: d.pricing?.startDate || d.startDate || null,
              endDate: d.pricing?.endDate || d.endDate || null,
            },
            inventory: d.inventory || {
              trackStock: d.trackStock ?? true,
              stockQuantity: d.stockQuantity ?? d.stock ?? 0,
              stockStatus: d.stockStatus || "in_stock",
            },
            highlightsEn: d.highlightsEn || [],
            highlightsAr: d.highlightsAr || [],
            specifications: synthesizedSpecs,
            shipping: {
              shippingCostInsideCairo: d.shipping?.shippingCostInsideCairo ?? d.shippingCostInsideCairo ?? 0,
              shippingCostRegion1: d.shipping?.shippingCostRegion1 ?? d.shippingCostRegion1 ?? 0,
              shippingCostRegion2: d.shipping?.shippingCostRegion2 ?? d.shippingCostRegion2 ?? 0,
              isPhysicalProduct: d.shipping?.isPhysicalProduct ?? d.isPhysicalProduct ?? true,
            },
            packages: (d.shipping?.packages || d.packages || []).map((p: any) => ({
              id: p?.id || p?._id || "",
              name: p?.name || "",
              weightKg: p?.weightKg,
              lengthCm: p?.lengthCm,
              widthCm: p?.widthCm,
              heightCm: p?.heightCm,
            })),
            images: d.media?.galleryImages || d.galleryImages || (d.media?.featuredImages ? [d.media.featuredImages] : d.featuredImages ? [d.featuredImages] : []),
            media: {
              galleryImages: d.media?.galleryImages || d.galleryImages || [],
              productVideo: d.media?.productVideo || d.productVideo,
            },
            approved: d.approved ?? false,
            store: d.store?._id || d.store || (typeof d.seller === "string" ? d.seller : d.seller?._id || ""),
            createdBy: d.createdBy || "seller",
            rate: d.rate || 0,
            productVariants: productVariants.map((v: any) =>
              typeof v === "string" ? { id: v } : { id: v._id || v.id, ...v }
            ),
            tags: (d.tags || []).map((t: any) => (typeof t === "string" ? t : t._id || t.id)),
          }));
        }
      })
      .finally(() => setIsLoading(false));
  }, [productId, token]);

  const validateStep = useCallback(
    async (options: ValidateStepOptions = {}): Promise<boolean> => {
    const submitMode = options.submitMode || "publish";
    const forceSubmit = options.forceSubmit === true;
    const steps: Step[] = [
      "step1_core",
      "step2_pricing",
      "step3_media",
      "step4_settings",
    ];
    const currentIndex = steps.indexOf(currentStep);
    const shouldSubmit = forceSubmit || currentStep === "step4_settings";

    let schema;
    if (currentStep === "step1_core") schema = step1CoreSchema;
    else if (currentStep === "step2_pricing") schema = step3MediaSchema; // Pricing & Media
    else if (currentStep === "step3_media") schema = step2MediaSchema; // Inventory & Shipping
    else if (currentStep === "step4_settings") schema = step4SettingsSchema;

    if (schema && submitMode === "publish" && !forceSubmit) {
      const result = schema.safeParse(product);
      if (!result.success) {
        const newErrors: Record<string, string> = {};
        result.error.issues.forEach((err) => {
          newErrors[err.path.join(".")] = err.message;
        });
        setErrors(newErrors);
        return false;
      }
    }

    setErrors({});
    if (shouldSubmit) {
      setIsSubmitting(true);
      try {
        // 1. Upload any File objects to get URLs
        const imageUrls: string[] = [];
        for (const img of product.images) {
          if (typeof img === "string") {
            imageUrls.push(img);
          } else if (img instanceof File) {
            try {
              const url = await uploadImage(img, "product", token);
              imageUrls.push(url);
            } catch (uploadErr) {
              console.error("Image upload failed:", uploadErr);
              // Continue with other images
            }
          }
        }

        // 2. Map form state to API payload
        const cleanedSpecifications: any[] = [];
        const variantsToEnsure: Array<any> = [];

        const sizesSpec = (product.specifications || []).find(
          (s: any) => (s?.keyEn || "").toLowerCase() === "sizes",
        );
        const colorsSpec = (product.specifications || []).find(
          (s: any) => (s?.keyEn || "").toLowerCase() === "colors",
        );
        const variantStockSpec = (product.specifications || []).find(
          (s: any) => (s?.keyEn || "").toLowerCase() === "variant stock",
        );

        const normalizeText = (value: unknown): string =>
          String(value || "").trim();
        const normalizeKey = (value: unknown): string =>
          normalizeText(value).toLowerCase();
        const normalizeCanonicalVariantKey = (value: unknown): string => {
          const key = normalizeKey(value);
          if (
            key === "color" ||
            key === "colors" ||
            key === "اللون" ||
            key === "الألوان"
          ) {
            return "color";
          }
          if (
            key === "size" ||
            key === "sizes" ||
            key === "المقاس" ||
            key === "المقاسات"
          ) {
            return "size";
          }
          return key;
        };

        type ParsedVariantStockEntry = {
          options: Record<string, string>;
          stock: number;
        };
        const parsedVariantStockEntries: ParsedVariantStockEntry[] = [];
        const optionStockByVariant = new Map<string, Map<string, number>>();
        const addOptionStock = (
          variantKey: unknown,
          optionName: unknown,
          stockAmount: number,
        ) => {
          const canonicalVariantKey = normalizeCanonicalVariantKey(variantKey);
          const optionKey = normalizeKey(optionName);
          if (!canonicalVariantKey || !optionKey || !stockAmount) return;

          if (!optionStockByVariant.has(canonicalVariantKey)) {
            optionStockByVariant.set(canonicalVariantKey, new Map());
          }
          const optionMap = optionStockByVariant.get(canonicalVariantKey)!;
          optionMap.set(optionKey, (optionMap.get(optionKey) || 0) + stockAmount);
        };

        if (variantStockSpec) {
          try {
            const entries = JSON.parse(variantStockSpec.valueEn || "[]");
            if (Array.isArray(entries)) {
              entries.forEach((entry: any) => {
                const stock = Number(entry?.stock);
                const safeStock = Number.isFinite(stock)
                  ? Math.max(0, Math.floor(stock))
                  : 0;
                const options: Record<string, string> = {};
                const rawOptions =
                  entry?.options && typeof entry.options === "object"
                    ? entry.options
                    : {};

                Object.entries(rawOptions).forEach(([rawKey, rawValue]) => {
                  const parsedValue = normalizeText(rawValue);
                  if (!parsedValue) return;
                  options[String(rawKey)] = parsedValue;
                  addOptionStock(rawKey, parsedValue, safeStock);
                });

                if (typeof entry?.size === "string" && entry.size.trim()) {
                  const size = entry.size.trim();
                  options.Size = size;
                  addOptionStock("size", size, safeStock);
                }
                if (typeof entry?.color === "string" && entry.color.trim()) {
                  const color = entry.color.trim();
                  options.Color = color;
                  addOptionStock("color", color, safeStock);
                }

                if (Object.keys(options).length) {
                  parsedVariantStockEntries.push({
                    options,
                    stock: safeStock,
                  });
                }
              });
            }
          } catch (e) {
            console.error("Failed to parse variant stock", e);
          }
        }

        const getOptionStock = (
          variantNames: Array<unknown>,
          optionName: unknown,
          fallbackStock: unknown,
        ): number => {
          const optionKey = normalizeKey(optionName);
          if (!optionKey) {
            const fallback = Number(fallbackStock);
            return Number.isFinite(fallback) ? Math.max(0, fallback) : 0;
          }

          for (const variantName of variantNames) {
            const canonicalVariantKey = normalizeCanonicalVariantKey(variantName);
            const optionMap = optionStockByVariant.get(canonicalVariantKey);
            if (!optionMap) continue;
            const matched = optionMap.get(optionKey);
            if (Number.isFinite(matched)) return Number(matched);
          }

          const fallback = Number(fallbackStock);
          return Number.isFinite(fallback) ? Math.max(0, fallback) : 0;
        };

        const hasVariantByCanonicalName = (name: string): boolean => {
          const canonical = normalizeCanonicalVariantKey(name);
          return (variantsToEnsure || []).some(
            (variant) =>
              normalizeCanonicalVariantKey(variant?.nameEn) === canonical ||
              normalizeCanonicalVariantKey(variant?.nameAr) === canonical,
          );
        };

        const draftProductVariants = (product.productVariants || []).filter(
          (variant: any) =>
            normalizeText(variant?.nameEn) &&
            Array.isArray(variant?.optionsEn) &&
            variant.optionsEn.length > 0,
        );

        draftProductVariants.forEach((variant: any) => {
          const safeOptionsEn = (variant.optionsEn || [])
            .map((option: any) => ({
              optionName: normalizeText(option?.optionName),
              price: Number.isFinite(Number(option?.price))
                ? Number(option.price)
                : 0,
              stock: Number.isFinite(Number(option?.stock))
                ? Number(option.stock)
                : 0,
            }))
            .filter((option: any) => option.optionName);
          if (!safeOptionsEn.length) return;

          const safeOptionsArSource = Array.isArray(variant?.optionsAr)
            ? variant.optionsAr
            : [];
          const safeOptionsAr = safeOptionsArSource
            .map((option: any) => ({
              optionName: normalizeText(option?.optionName),
              price: Number.isFinite(Number(option?.price))
                ? Number(option.price)
                : 0,
              stock: Number.isFinite(Number(option?.stock))
                ? Number(option.stock)
                : 0,
            }))
            .filter((option: any) => option.optionName);

          const optionsEnWithStock = safeOptionsEn.map((option: any) => {
            const stock = getOptionStock(
              [variant?.nameEn, variant?.nameAr],
              option.optionName,
              option.stock,
            );
            return { ...option, stock };
          });

          const optionsArWithStock = optionsEnWithStock.map(
            (enOption: any, index: number) => {
              const arOption = safeOptionsAr[index];
              return {
                optionName: arOption?.optionName || enOption.optionName,
                price:
                  arOption && Number.isFinite(Number(arOption.price))
                    ? Number(arOption.price)
                    : enOption.price,
                stock: enOption.stock,
              };
            },
          );

          variantsToEnsure.push({
            id: normalizeText(variant?.id) || undefined,
            nameEn: normalizeText(variant?.nameEn),
            nameAr: normalizeText(variant?.nameAr) || normalizeText(variant?.nameEn),
            type: normalizeText(variant?.type) || "dropdown",
            optionsEn: optionsEnWithStock,
            optionsAr: optionsArWithStock,
          });
        });

        if (sizesSpec && !hasVariantByCanonicalName("size")) {
          const sizes = (sizesSpec.valueEn || "")
            .split(",")
            .map((value: string) => value.trim())
            .filter(Boolean);
          if (sizes.length) {
            variantsToEnsure.push({
              nameEn: "Size",
              nameAr: "المقاس",
              type: "dropdown",
              optionsEn: sizes.map((size: string) => ({
                optionName: size,
                price: 0,
                stock: getOptionStock(["size", "sizes"], size, 0),
              })),
              optionsAr: sizes.map((size: string) => ({
                optionName: size,
                price: 0,
                stock: getOptionStock(["size", "sizes", "المقاس", "المقاسات"], size, 0),
              })),
            });
          }
        }

        if (colorsSpec && !hasVariantByCanonicalName("color")) {
          const colors = (colorsSpec.valueEn || "")
            .split(";")
            .map((part: string) => part.trim())
            .filter(Boolean)
            .map((token: string) => {
              const [name, hex] = token.split("|").map((x: string) => x.trim());
              return { name, hex };
            })
            .filter((item: any) => item.name);
          if (colors.length) {
            variantsToEnsure.push({
              nameEn: "Color",
              nameAr: "اللون",
              type: "color",
              optionsEn: colors.map((item: any) => ({
                optionName: item.name,
                price: 0,
                stock: getOptionStock(["color", "colors"], item.name, 0),
              })),
              optionsAr: colors.map((item: any) => ({
                optionName: item.name,
                price: 0,
                stock: getOptionStock(
                  ["color", "colors", "اللون", "الألوان"],
                  item.name,
                  0,
                ),
              })),
            });
          }
        }

        (product.specifications || []).forEach((s: any) => {
          const key = (s?.keyEn || "").toLowerCase();
          if (
            key !== "sizes" &&
            key !== "colors" &&
            key !== "variant stock" &&
            key !== "shipping required" &&
            key !== "shipping fees" &&
            key !== "shipping packages"
          ) {
            // Resolve "Color Images" index to URL
            if (key === "color images") {
              try {
                const raw = (s.valueEn || "").trim();
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (Array.isArray(parsed)) {
                    const resolved = parsed.map((e: any) => {
                      const idx = Number(e?.imageIdx);
                      const urlFromIdx = Number.isFinite(idx) ? imageUrls[idx] : undefined;
                      return { ...e, imageUrl: urlFromIdx || e.imageUrl };
                    });
                    cleanedSpecifications.push({
                      ...s,
                      valueEn: JSON.stringify(resolved),
                      valueAr: JSON.stringify(resolved),
                    });
                    return;
                  }
                }
              } catch (err) { /* ignore */ }
            }
            // Strip _id
            const { _id, ...rest } = s;
            cleanedSpecifications.push(rest);
          }
        });

        // Create variants on the fly if needed
        const finalVariantIds: string[] = [];

        const nameEn = product.title.en || "product";
        const nameAr = product.title.ar || "منتج";

        const slugEnBase = product.slugEn || nameEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const slugArBase = product.slugAr || nameAr.trim().replace(/\s+/g, "-");

        const finalSlugEn = slugEnBase;
        const finalSlugAr = slugArBase;

        const finalCreatedBy = user?.role === "admin" ? "admin" : "seller";
        const userStoreId =
          (user as any)?.storeId || (user as any)?.id || (user as any)?._id;
        const finalStoreId =
          finalCreatedBy === "admin"
            ? product.store || userStoreId || ""
            : userStoreId || product.store || "";

        if (variantsToEnsure.length) {
          console.log("DEBUG: Automating variant creation...");
          for (const variant of variantsToEnsure) {
            const existingId = normalizeText(variant?.id);
            if (existingId) {
              finalVariantIds.push(existingId);
              continue;
            }

            try {
              const createdVariant = await createVariant(
                {
                  nameEn: normalizeText(variant?.nameEn),
                  nameAr:
                    normalizeText(variant?.nameAr) ||
                    normalizeText(variant?.nameEn),
                  type: normalizeText(variant?.type) || "dropdown",
                  optionsEn: Array.isArray(variant?.optionsEn)
                    ? variant.optionsEn
                    : [],
                  optionsAr: Array.isArray(variant?.optionsAr)
                    ? variant.optionsAr
                    : [],
                  createdBy: finalCreatedBy,
                  storeId: finalStoreId,
                } as any,
                token,
              );
              if (createdVariant.id) finalVariantIds.push(createdVariant.id);
            } catch (vErr) {
              console.error("Variant creation failed:", vErr);
            }
          }
        }

        const existingVariantIdsFromProduct = (product.productVariants || [])
          .map((variant: any) => normalizeText(variant?.id))
          .filter(Boolean);
        const dedupedVariantIds = Array.from(
          new Set([
            ...existingVariantIdsFromProduct,
            ...finalVariantIds.filter(Boolean),
          ]),
        );

        const distributionTotal = parsedVariantStockEntries.reduce(
          (sum, entry) =>
            sum + (Number.isFinite(entry.stock) ? Number(entry.stock) : 0),
          0,
        );
        const normalizedStockQuantity = distributionTotal
          ? distributionTotal
          : Math.max(0, Number(product.inventory.stockQuantity || 0));

        const inventoryPayload: any = {
          ...product.inventory,
          stockQuantity: normalizedStockQuantity,
          stock: {
            total: normalizedStockQuantity,
            remaining: normalizedStockQuantity,
          },
        };

        if (parsedVariantStockEntries.length) {
          inventoryPayload.variantsStock = parsedVariantStockEntries.map(
            (entry, index) => {
              const label = Object.entries(entry.options || {})
                .map(([key, value]) => `${key}: ${value}`)
                .join(" / ");
              const stock = Number.isFinite(entry.stock)
                ? Number(entry.stock)
                : 0;
              return {
                name: label || `Variant ${index + 1}`,
                total: stock,
                remaining: stock,
              };
            },
          );
        }

        const payload: CreateProductPayload = {
          nameEn: product.title.en,
          nameAr: product.title.ar,
          slugEn: finalSlugEn,
          slugAr: finalSlugAr,
          highlightsEn: product.highlightsEn,
          highlightsAr: product.highlightsAr,
          identity: {
            sku: product.identity.sku || "",
            skuMode: product.identity.skuMode,
          },
          classification: {
            category: product.classification.category || "",
            subcategory: product.classification.subcategory || "",
            childCategory: product.classification.childCategory || "",
            brand: product.classification.brand || "",
            productType: product.classification.productType,
          },
          descriptions: product.descriptions,
          pricing: {
            originalPrice: product.pricing.originalPrice,
            salePrice: product.pricing.salePrice,
            startDate: product.pricing.startDate || null,
            endDate: product.pricing.endDate || null,
          },
          inventory: inventoryPayload,
          variants: dedupedVariantIds,
          specifications: cleanedSpecifications,
          store: finalStoreId,
          sellerId: finalStoreId || null,
          createdBy: finalCreatedBy as "admin" | "seller",
          media: {
            featuredImages: imageUrls[0] || "",
            galleryImages: imageUrls,
            productVideo: product.media?.productVideo
              ? (({ _id, ...rest }: any) => rest)(product.media.productVideo)
              : undefined,
          },
          approved: product.approved ?? true,
          rate: product.rate || 4,
          draft: submitMode === "draft",
          shipping: {
            isPhysicalProduct: product.shipping?.isPhysicalProduct ?? true,
            shippingCostInsideCairo: product.shipping?.shippingCostInsideCairo ?? 0,
            shippingCostRegion1: product.shipping?.shippingCostRegion1 ?? 0,
            shippingCostRegion2: product.shipping?.shippingCostRegion2 ?? 0,
            packages: (product.packages || []).map((p) => {
              const { id, ...rest } = p as any;
              return rest;
            }),
          },
        };

        console.log("DEBUG: Final Product Payload:", JSON.stringify(payload, null, 2));

        const nextProductsPath =
          user?.role === "admin" ? "/admin/products" : "/seller/products";

        let response;
        if (isEditMode && productId) {
          response = await updateProductApi(productId, payload, token);
          console.log("Product Updated Successfully:", response);
          toast.success(
            submitMode === "draft"
              ? "Draft updated successfully!"
              : "Product Updated Successfully!",
          );
          router.push(nextProductsPath);
        } else {
          response = await createProduct(payload, token);
          console.log("Product Created Successfully:", response);
          toast.success(
            submitMode === "draft"
              ? "Draft saved successfully!"
              : "Product Created Successfully!",
          );
          router.push(nextProductsPath);
        }
        setIsSubmitting(false);
        return true;
      } catch (e) {
        console.error("Failed to create product", e);
        const message =
          typeof (e as any)?.message === "string" && (e as any).message.trim()
            ? (e as any).message
            : "Failed to create product. Please check all fields.";
        setErrors({
          submit: message,
        });
        setIsSubmitting(false);
        return false;
      }
    } else {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    }
  }, [currentStep, product, token, user, router]);

  const goToStep = useCallback((step: Step) => {
    setCurrentStep(step);
    setErrors({});
  }, []);

  return {
    product,
    confirmedProduct,
    errors,
    currentStep,
    isSubmitting,
    isLoading,
    isEditMode,
    setCurrentStep,
    updateProduct,
    validateStep,
    goToStep,
    token,
    userRole: user?.role,
  };
};
