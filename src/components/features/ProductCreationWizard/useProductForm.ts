import { useState, useCallback } from "react";
import { ProductFormData } from "@/lib/validations/product-schema";
import { detailsStepSchema } from "@/lib/validations/product-schema";

export type Step =
  | "category"
  | "identity"
  | "details"
  | "pricing"
  | "media";

export const useProductForm = () => {
  const [currentStep, setCurrentStep] = useState<Step>("category");
  const [product, setProduct] = useState<ProductFormData>({
    pricingMethod: "manual",
    features: { en: [], ar: [] },
    highlights: { en: [], ar: [] },
    images: [],
    sizes: [],
    colors: [],
    specifications: [],
    title: { en: "", ar: "" },
    description: { en: "", ar: "" },
    sku: "",
    slug: { en: "", ar: "" },
    productType: "physical",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedProduct, setConfirmedProduct] =
    useState<ProductFormData>(product);

  const updateProduct = useCallback((updates: Partial<ProductFormData>) => {
    setProduct((prev) => {
      const updated = { ...prev, ...updates };
      return updated;
    });

    // Clear errors when user updates the field
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

  const validateStep = useCallback(async (): Promise<boolean> => {
    // Determine next step
    const steps: Step[] = [
      "category",
      "identity",
      "details",
      "pricing",
      "media",
    ];
    const currentIndex = steps.indexOf(currentStep);

    // Only validate on the media step (final submission)
    if (currentStep !== "media") {
      console.log(
        "🔄 Moving to next step from:",
        currentStep,
        "- just navigating",
      );

      if (currentIndex < steps.length - 1) {
        const nextStep = steps[currentIndex + 1];
        console.log("➡️ Moving to next step:", nextStep);
        setConfirmedProduct(product); // Confirm current data for health score
        setCurrentStep(nextStep);
        setErrors({}); // Clear errors when navigating
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return true;
    }

    // Only validate on the details step (final submission)
    console.log("🔄 Validating final submission on details step");
    setIsSubmitting(true);

    console.log(
      "📦 Product data for validation:",
      JSON.stringify(product, null, 2),
    );

    try {
      const result = detailsStepSchema.safeParse(product);

      if (result.success) {
        console.log("✅ Validation successful!");
        setErrors({});

        // Final submission
        console.log("🎉 Product submitted successfully:", product);
        alert("Product created successfully!");

        // Reset form
        setProduct({
          pricingMethod: "manual",
          images: [],
          features: { en: [], ar: [] },
          highlights: { en: [], ar: [] },
          sizes: [],
          colors: [],
          specifications: [],
          title: { en: "", ar: "" },
          description: { en: "", ar: "" },
          productType: "physical",
        });
        setCurrentStep("category");

        setIsSubmitting(false);
        return true;
      } else {
        console.log("❌ Validation failed. Issues:", result.error.issues);

        const newErrors: Record<string, string> = {};

        result.error.issues.forEach((err) => {
          if (err.path.length > 0) {
            const fieldPath = err.path.join(".");
            newErrors[fieldPath] = err.message;
            console.log(`📝 Error for ${fieldPath}:`, err.message);
          } else {
            newErrors["_root"] = err.message;
          }
        });

        console.log("📋 All validation errors:", newErrors);
        setErrors(newErrors);
        setIsSubmitting(false);

        // Scroll to first error
        if (Object.keys(newErrors).length > 0) {
          const firstErrorField = Object.keys(newErrors)[0];
          if (firstErrorField !== "_root") {
            const element = document.querySelector(
              `[data-field="${firstErrorField}"]`,
            );
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        }

        return false;
      }
    } catch (error) {
      console.error("💥 Validation error:", error);
      setIsSubmitting(false);
      return false;
    }
  }, [currentStep, product]);

  const goToStep = useCallback((step: Step) => {
    console.log("🎯 Navigating to step:", step);

    // Simple navigation without validation for step indicators
    setCurrentStep(step);
    setErrors({}); // Clear errors when navigating
  }, []);

  return {
    product,
    confirmedProduct,
    errors,
    currentStep,
    isSubmitting,
    setCurrentStep,
    updateProduct,
    validateStep,
    goToStep,
  };
};
