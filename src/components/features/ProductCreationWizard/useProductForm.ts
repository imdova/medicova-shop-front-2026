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

  // Load existing product data when in edit mode
  useEffect(() => {
    if (!productId || !token) return;
    setIsLoading(true);
    getProductById(productId, token)
      .then((data: any) => {
        if (data) {
          // Log full response so we can see every field the API returns
          console.log(
            "DEBUG: Full product data for edit:",
            JSON.stringify(data, null, 2),
          );

          const d = data; // shorthand

          setProduct((prev) => ({
            ...prev,
            title: { en: d.nameEn || "", ar: d.nameAr || "" },
            slugEn: d.slugEn || "",
            slugAr: d.slugAr || "",

            // Descriptions — handle nested or flat
            descriptions: {
              descriptionEn:
                d.descriptions?.descriptionEn || d.descriptionEn || "",
              descriptionAr:
                d.descriptions?.descriptionAr || d.descriptionAr || "",
            },

            // Identity — handle nested or flat
            identity: {
              sku: d.identity?.sku || d.sku || "",
              skuMode: d.identity?.skuMode || d.skuMode || "manual",
            },

            // Classification — handle nested object or direct IDs
            classification: {
              category:
                d.classification?.category?._id ||
                d.classification?.category ||
                d.categoryId ||
                d.category ||
                "",
              subcategory:
                d.classification?.subcategory?._id ||
                d.classification?.subcategory ||
                d.subcategoryId ||
                d.subcategory ||
                "",
              childCategory:
                d.classification?.childCategory?._id ||
                d.classification?.childCategory ||
                d.childCategoryId ||
                d.childCategory ||
                "",
              brand:
                d.classification?.brand?._id ||
                d.classification?.brand ||
                d.brandId ||
                d.brand ||
                "",
              productType:
                d.classification?.productType ||
                d.productType ||
                "Physical Product",
            },

            // Pricing — handle nested or flat
            pricing: {
              originalPrice:
                d.pricing?.originalPrice ?? d.originalPrice ?? d.price ?? 0,
              salePrice:
                d.pricing?.salePrice ?? d.salePrice ?? d.sale_price ?? 0,
              startDate: d.pricing?.startDate || d.startDate || null,
              endDate: d.pricing?.endDate || d.endDate || null,
            },

            // Inventory — handle nested or flat
            inventory: d.inventory || {
              trackStock: d.trackStock ?? true,
              stockQuantity: d.stockQuantity ?? d.stock ?? 0,
              stockStatus: d.stockStatus || "in_stock",
            },

            highlightsEn: d.highlightsEn || [],
            highlightsAr: d.highlightsAr || [],
            specifications: d.specifications || [],

            // Images — handle both media-wrapped and flat
            images:
              d.media?.galleryImages ||
              d.galleryImages ||
              (d.media?.featuredImages
                ? [d.media.featuredImages]
                : d.featuredImages
                  ? [d.featuredImages]
                  : []),
            media: {
              galleryImages: d.media?.galleryImages || d.galleryImages || [],
              productVideo: d.media?.productVideo || d.productVideo,
            },

            approved: d.approved ?? false,
            store:
              d.store?._id ||
              d.store ||
              (typeof d.seller === "string" ? d.seller : d.seller?._id || ""),
            createdBy: d.createdBy || "seller",
            rate: d.rate || 0,

            // Variants — pre-fill productVariants if they exist
            productVariants: (d.variants || []).map((v: any) =>
              typeof v === "string" ? { id: v } : { id: v._id || v.id, ...v },
            ),
            tags: d.tags || [],
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
        const mappedSpecifications = (product.specifications || []).map(
          ({ _id, ...rest }: any) => {
            const key = String(rest?.keyEn || "").toLowerCase();
            if (key === "color images") {
              try {
                const raw = String(rest?.valueEn || "").trim();
                if (!raw) return rest;
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed)) return rest;
                const next = parsed.map((e: any) => {
                  const color = typeof e?.color === "string" ? e.color : "";
                  const colorHex =
                    typeof e?.colorHex === "string" ? e.colorHex : undefined;
                  const idx = Number.isFinite(Number(e?.imageIdx))
                    ? Number(e.imageIdx)
                    : undefined;
                  const imageUrl =
                    typeof e?.imageUrl === "string" ? e.imageUrl : undefined;
                  const urlFromIdx =
                    idx !== undefined && imageUrls[idx]
                      ? imageUrls[idx]
                      : undefined;
                  return {
                    color,
                    colorHex,
                    imageUrl: urlFromIdx || imageUrl,
                  };
                });
                return {
                  ...rest,
                  valueEn: JSON.stringify(next),
                  valueAr: JSON.stringify(next),
                };
              } catch {
                return rest;
              }
            }
            return rest;
          },
        );

        const payload: CreateProductPayload = {
          nameEn: product.title.en,
          nameAr: product.title.ar,
          slugEn:
            product.slugEn || product.title.en.toLowerCase().replace(/ /g, "-"),
          slugAr: product.slugAr || product.title.ar.replace(/ /g, "-"),
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
          variants: product.productVariants
            .map((v) => v.id)
            .filter(Boolean) as string[],
          // Strip _id from specifications (MongoDB adds them but API rejects them)
          // Also resolve any "Color Images" indices to uploaded URLs
          specifications: mappedSpecifications as any,
          store: product.store || (user as any)?.storeId || "",
          createdBy: user?.role === "admin" ? "admin" : "seller",
          media: {
            featuredImages: imageUrls[0] || "",
            galleryImages: imageUrls,
            // Strip _id from productVideo (MongoDB adds it but API rejects it)
            productVideo: product.media?.productVideo
              ? (({ _id, ...rest }: any) => rest)(product.media.productVideo)
              : undefined,
          },
          approved: false,
          rate: product.rate || 0,
        } as any;

        let response;
        if (isEditMode && productId) {
          response = await updateProductApi(productId, payload, token);
          console.log("Product Updated Successfully:", response);
          alert(
            isEditMode
              ? "Product Updated Successfully!"
              : "Product Created Successfully!",
          );
        } else {
          response = await createProduct(payload, token);
          console.log("Product Created Successfully:", response);
          alert("Product Created Successfully!");
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
  };
};
