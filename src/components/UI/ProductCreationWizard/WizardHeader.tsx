import { Check, ChevronRight, ChevronLeft, Eye, Save, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductFormData } from "@/lib/validations/product-schema";
import { Button } from "../button";
import { Step } from "./useProductForm";

interface WizardHeaderProps {
  steps: { key: string; number: number }[];
  currentStep: string;
  product: ProductFormData;
  errors: Record<string, string>;
  onStepClick: (step: Step) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
}

const translations = {
  en: {
    productCreation: "Product Creation",
    setup: "Setup",
    details: "Details",
    category: "Category",
    brand: "Brand",
    viewOnStore: "View on store",
    createProduct: "Create Product",
  },
  ar: {
    productCreation: "إنشاء المنتج",
    setup: "الإعداد",
    details: "التفاصيل",
    category: "الفئة",
    brand: "العلامة التجارية",
    viewOnStore: "عرض في المتجر",
    createProduct: "إنشاء المنتج",
  },
};

export const WizardHeader = ({
  steps,
  currentStep,
  product,
  onStepClick,
  onSubmit,
  errors,
  isSubmitting,
}: WizardHeaderProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const isStepCompleted = (stepKey: string) => {
    switch (stepKey) {
      case "setup":
        return !!(product.category && product.brand && product.sku);
      case "details":
        return true; // Details step is always considered "completable" for navigation
      default:
        return false;
    }
  };

  // Check if a specific step has errors
  const stepHasErrors = (stepKey: string): boolean => {
    switch (stepKey) {
      case "setup":
        return !!(errors.category || errors.brand || errors.sku);
      case "details":
        // Check for details step errors (title, description, price, etc.)
        return Object.keys(errors).some(
          (key) =>
            key.startsWith("title.") ||
            key.startsWith("description.") ||
            key === "del_price" ||
            key === "price" ||
            key === "saleStart" ||
            key === "saleEnd" ||
            key === "weightKg" ||
            key === "stock",
        );
      default:
        return false;
    }
  };

  const renderStepIndicator = (
    step: { key: string; number: number },
    labelKey: string,
  ) => {
    const isActive = currentStep === step.key;
    const isCompleted = isStepCompleted(step.key);
    const hasErrors = stepHasErrors(step.key);

    const canNavigate =
      step.key === "setup" ||
      isStepCompleted("setup");

    return (
      <button
        key={step.key}
        type="button"
        className={`flex items-center gap-1 transition-colors ${
          isActive
            ? hasErrors
              ? "text-red-600"
              : isCompleted
                ? "text-green-500"
                : "text-gray-500"
            : "font-medium text-green-600"
        } ${!canNavigate ? "cursor-not-allowed opacity-50" : "hover:text-gray-700"}`}
        onClick={() => canNavigate && onStepClick(step.key as Step)}
        disabled={!canNavigate}
      >
        <span
          className={`mr-2 hidden h-6 w-6 items-center justify-center rounded-full transition-colors md:flex ${
            isActive
              ? hasErrors
                ? "bg-red-100 text-red-600"
                : isCompleted
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100"
              : "bg-green-100"
          }`}
        >
          {hasErrors ? (
            <X size={15} />
          ) : isCompleted && !isActive ? (
            <Check size={15} />
          ) : (
            step.number
          )}
        </span>
        {t[labelKey as keyof typeof t]}
        {step.key !== "details" &&
          (language === "ar" ? (
            <ChevronLeft className="mx-2" size={16} />
          ) : (
            <ChevronRight className="mx-2" size={16} />
          ))}
      </button>
    );
  };

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">
        {t.productCreation}
      </h1>

      {/* Product Preview Bar */}
      {currentStep === "details" && (
        <div className="mb-4 flex flex-col justify-between gap-3 rounded-lg border border-gray-200 bg-white p-2 lg:flex-row">
          <div className="flex gap-2">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-200">
              <span className="text-sm text-gray-400">Image</span>
            </div>
            <div>
              <h2 className="font-semibold">
                {product.brand ? product.brand.name[language] : t.brand}
              </h2>
              <span className="text-sm">
                {product.category
                  ? product.category.title[language]
                  : t.category}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => console.log("View on store")}
            >
              <Eye size={15} className="mr-1" />
              {t.viewOnStore}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              <Save size={15} className="mr-1" />
              {isSubmitting ? "Creating..." : t.createProduct}
            </Button>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="mb-8 flex w-full min-w-[270px] snap-x gap-2 overflow-x-auto rounded-lg border border-gray-200 bg-white p-2">
        {steps.map((step) => renderStepIndicator(step, step.key))}
      </div>
    </>
  );
};
