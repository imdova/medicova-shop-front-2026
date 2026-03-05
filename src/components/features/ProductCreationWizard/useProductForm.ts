import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ProductFormData } from "@/lib/validations/product-schema";
import { 
  step1CoreSchema, 
  step2MediaSchema, 
  step3SettingsSchema 
} from "@/lib/validations/product-schema";
import { createProduct, updateProductApi, getProductById, CreateProductPayload } from "@/services/productService";
import { uploadImage } from "@/lib/uploadService";

export type Step =
  | "step1_core"
  | "step2_media"
  | "step3_settings";

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
      productType: "Physical Product" 
    },
    pricing: { 
      originalPrice: 0, 
      salePrice: 0, 
      startDate: null, 
      endDate: null 
    },
    inventory: { 
      trackStock: true, 
      stockQuantity: 0, 
      stockStatus: "in_stock" 
    },
    media: { 
      galleryImages: [] 
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
    getProductById(productId, token).then((data) => {
      if (data) {
        setProduct((prev) => ({
          ...prev,
          title: { en: data.nameEn || "", ar: data.nameAr || "" },
          slugEn: data.slugEn || "",
          slugAr: data.slugAr || "",
          descriptions: {
            descriptionEn: (data as any).descriptions?.descriptionEn || "",
            descriptionAr: (data as any).descriptions?.descriptionAr || "",
          },
          identity: {
            sku: (data as any).identity?.sku || "",
            skuMode: (data as any).identity?.skuMode || "manual",
          },
          classification: {
            category: data.classification?.category || "",
            subcategory: data.classification?.subcategory || "",
            childCategory: (data as any).classification?.childCategory || "",
            brand: data.classification?.brand || "",
            productType: (data as any).classification?.productType || "Physical Product",
          },
          pricing: {
            originalPrice: data.pricing?.originalPrice || 0,
            salePrice: data.pricing?.salePrice || 0,
            startDate: (data as any).pricing?.startDate || null,
            endDate: (data as any).pricing?.endDate || null,
          },
          inventory: (data as any).inventory || { trackStock: true, stockQuantity: 0, stockStatus: "in_stock" },
          highlightsEn: (data as any).highlightsEn || [],
          highlightsAr: (data as any).highlightsAr || [],
          specifications: (data as any).specifications || [],
          images: data.media?.galleryImages || (data.media?.featuredImages ? [data.media.featuredImages] : []),
          media: {
            galleryImages: data.media?.galleryImages || [],
            productVideo: (data as any).media?.productVideo,
          },
          approved: data.approved ?? false,
          store: data.store || (typeof data.seller === "string" ? data.seller : (data.seller as any)?._id || ""),
          createdBy: (data.createdBy as any) || "seller",
          rate: (data as any).rate || 0,
        }));
      }
    }).finally(() => setIsLoading(false));
  }, [productId, token]);

  const validateStep = useCallback(async (): Promise<boolean> => {
    const steps: Step[] = ["step1_core", "step2_media", "step3_settings"];
    const currentIndex = steps.indexOf(currentStep);

    let schema;
    if (currentStep === "step1_core") schema = step1CoreSchema;
    else if (currentStep === "step2_media") schema = step2MediaSchema;
    else if (currentStep === "step3_settings") schema = step3SettingsSchema;

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
    if (currentStep === "step3_settings") {
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
        const payload: CreateProductPayload = {
          nameEn: product.title.en,
          nameAr: product.title.ar,
          slugEn: product.slugEn || product.title.en.toLowerCase().replace(/ /g, "-"),
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
          variants: product.productVariants.map(v => v.id).filter(Boolean) as string[],
          specifications: product.specifications,
          store: product.store || (user as any)?.storeId || "",
          createdBy: user?.role === "admin" ? "admin" : "seller",
          media: {
            featuredImages: imageUrls[0] || "",
            galleryImages: imageUrls,
            productVideo: product.media?.productVideo 
          },
          approved: false,
          rate: product.rate || 0,
        };

        let response;
        if (isEditMode && productId) {
          response = await updateProductApi(productId, payload, token);
          console.log("Product Updated Successfully:", response);
          alert(isEditMode ? "Product Updated Successfully!" : "Product Created Successfully!");
        } else {
          response = await createProduct(payload, token);
          console.log("Product Created Successfully:", response);
          alert("Product Created Successfully!");
        }
        setIsSubmitting(false);
        return true;
      } catch (e) {
        console.error("Failed to create product", e);
        setErrors({ submit: "Failed to create product. Please check all fields." });
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
