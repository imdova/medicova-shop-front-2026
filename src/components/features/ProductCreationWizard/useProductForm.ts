import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import toast from "react-hot-toast";

export type Step =
  | "step1_core"
  | "step2_pricing"
  | "step3_media"
  | "step4_settings";

export const useProductForm = (productId?: string) => {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
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

  const validateStep = useCallback(async (): Promise<boolean> => {
    const steps: Step[] = [
      "step1_core",
      "step2_pricing",
      "step3_media",
      "step4_settings",
    ];
    const currentIndex = steps.indexOf(currentStep);

    let schema;
    if (currentStep === "step1_core") schema = step1CoreSchema;
    else if (currentStep === "step2_pricing") schema = step3MediaSchema; // Pricing & Media
    else if (currentStep === "step3_media") schema = step2MediaSchema; // Inventory & Shipping
    else if (currentStep === "step4_settings") schema = step4SettingsSchema;

    if (schema) {
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
    if (currentStep === "step4_settings") {
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
        const apiVariants: any[] = [];

        // Extract Sizes and Colors to variants if they exist
        const sizesSpec = (product.specifications || []).find(
          (s: any) => (s?.keyEn || "").toLowerCase() === "sizes",
        );
        const colorsSpec = (product.specifications || []).find(
          (s: any) => (s?.keyEn || "").toLowerCase() === "colors",
        );
        const variantStockSpec = (product.specifications || []).find(
          (s: any) => (s?.keyEn || "").toLowerCase() === "variant stock",
        );

        let sizeStockMap: Record<string, number> = {};
        let colorStockMap: Record<string, number> = {};
        if (variantStockSpec) {
          try {
            const entries = JSON.parse(variantStockSpec.valueEn || "[]");
            if (Array.isArray(entries)) {
              entries.forEach((e: any) => {
                if (e.size) {
                  sizeStockMap[e.size] =
                    (sizeStockMap[e.size] || 0) + (e.stock || 0);
                }
                if (e.color) {
                  colorStockMap[e.color] =
                    (colorStockMap[e.color] || 0) + (e.stock || 0);
                }
              });
            }
          } catch (e) {
            console.error("Failed to parse variant stock", e);
          }
        }

        if (sizesSpec) {
          const sizes = (sizesSpec.valueEn || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (sizes.length) {
            apiVariants.push({
              nameEn: "Size",
              nameAr: "المقاس",
              type: "dropdown",
              optionsEn: sizes.map((s) => ({
                optionName: s,
                price: 0,
                stock: sizeStockMap[s] || 0,
              })),
              optionsAr: sizes.map((s) => ({
                optionName: s,
                price: 0,
                stock: sizeStockMap[s] || 0,
              })),
            });
          }
        }

        if (colorsSpec) {
          const colors = (colorsSpec.valueEn || "")
            .split(";")
            .map((part) => part.trim())
            .filter(Boolean)
            .map((token) => {
              const [name, hex] = token.split("|").map((x) => x.trim());
              return { name, hex };
            });
          if (colors.length) {
            apiVariants.push({
              nameEn: "Color",
              nameAr: "اللون",
              type: "color",
              optionsEn: colors.map((c) => ({
                optionName: c.name,
                price: 0,
                stock: colorStockMap[c.name] || 0,
              })),
              optionsAr: colors.map((c) => ({
                optionName: c.name,
                price: 0,
                stock: colorStockMap[c.name] || 0,
              })),
            });
          }
        }

        // Add Variant Stock as a spec or transform if needed? 
        // User said "Sizes Colors الخ" (and others) should be in variants. 
        // For now, I'll keep Variant Stock in specs if it's JSON, 
        // but Sizes and Colors are now in variants.

        (product.specifications || []).forEach((s: any) => {
          const key = (s?.keyEn || "").toLowerCase();
          if (key !== "sizes" && key !== "colors" && key !== "shipping required" && key !== "shipping fees" && key !== "shipping packages") {
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

        if (apiVariants.length) {
          console.log("DEBUG: Automating variant creation...");
          const targetIsAdmin = user?.role === "admin";
          const targetStoreId = product.store || (user as any)?.storeId || "";
          const targetCreatedBy = targetIsAdmin ? "admin" : "seller";

          for (const vData of apiVariants) {
            try {
              const v = await createVariant({
                ...vData,
                createdBy: targetCreatedBy,
                storeId: targetStoreId,
              }, token);
              if (v.id) finalVariantIds.push(v.id);
            } catch (vErr) {
              console.error("Variant creation failed:", vErr);
            }
          }
        }

        const randomSuffix = Math.random().toString(36).substring(2, 7);
        const nameEn = product.title.en || "product";
        const nameAr = product.title.ar || "منتج";

        const slugEnBase = product.slugEn || nameEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        const slugArBase = product.slugAr || nameAr.trim().replace(/\s+/g, "-");

        const finalSlugEn = isEditMode ? slugEnBase : `${slugEnBase}-${randomSuffix}`;
        const finalSlugAr = isEditMode ? slugArBase : `${slugArBase}-${randomSuffix}`;

          const finalStoreId = product.store || (user as any)?.storeId || "";
          const finalCreatedBy = (user?.role === "admin") ? "admin" : "seller";

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
            inventory: product.inventory,
            variants: finalVariantIds.length
              ? finalVariantIds
              : (product.productVariants
                  .map((v) => v.id)
                  .filter(Boolean) as string[]),
            specifications: cleanedSpecifications,
            store: finalStoreId,
            sellerId: product.store || null,
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

        let response;
        if (isEditMode && productId) {
          response = await updateProductApi(productId, payload, token);
          console.log("Product Updated Successfully:", response);
          toast.success("Product Updated Successfully!");
        } else {
          response = await createProduct(payload, token);
          console.log("Product Created Successfully:", response);
          toast.success("Product Created Successfully!");
        }
        setIsSubmitting(false);
        return true;
      } catch (e) {
        console.error("Failed to create product", e);
        setErrors({
          submit: "Failed to create product. Please check all fields.",
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
  }, [currentStep, product, token, user]);

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
