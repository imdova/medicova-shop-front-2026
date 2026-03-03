import { Check, ChevronRight, ChevronLeft, X } from "lucide-react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useTranslations } from "next-intl";
import { ProductFormData } from "@/lib/validations/product-schema";
import { Step } from "./useProductForm";
import { motion } from "framer-motion";

interface WizardHeaderProps {
  steps: { key: string; number: number }[];
  currentStep: string;
  product: ProductFormData;
  errors: Record<string, string>;
  onStepClick: (step: Step) => void;
}

export const WizardHeader = ({
  steps,
  currentStep,
  product,
  onStepClick,
  errors,
}: WizardHeaderProps) => {
  const locale = useAppLocale();
  const stepT = useTranslations("create_product.wizard.steps");

  const isStepCompleted = (stepKey: string) => {
    switch (stepKey) {
      case "category":
        return !!product.category && !!product.brand;
      case "identity":
        return !!product.sku;
      case "details":
        return !!(product.title?.en && product.description?.en);
      case "pricing":
        return !!product.del_price;
      case "media":
        return product.images.length > 0;
      default:
        return false;
    }
  };

  const stepHasErrors = (stepKey: string): boolean => {
    switch (stepKey) {
      case "category":
        return !!errors.category || !!errors.brand;
      case "identity":
        return !!errors.sku || !!errors.slug;
      case "details":
        return !!(
          errors["title.en"] ||
          errors["description.en"] ||
          errors.deliveryTime
        );
      case "pricing":
        return !!(
          errors.del_price ||
          errors.price ||
          errors.stock ||
          errors.weightKg
        );
      case "media":
        return !!errors.images;
      default:
        return false;
    }
  };

  return (
    <div className="no-scrollbar relative mb-12 flex w-full items-center justify-between gap-2 overflow-x-auto pb-4">
      {steps.map((step, idx) => {
        const isActive = currentStep === step.key;
        const isCompleted = isStepCompleted(step.key);
        const hasErrors = stepHasErrors(step.key);

        return (
          <div key={step.key} className="flex flex-1 items-center">
            <button
              type="button"
              onClick={() => onStepClick(step.key as Step)}
              className="group relative flex flex-col items-center gap-3 outline-none transition-all"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 transition-all duration-300 ${
                  isActive
                    ? "scale-110 border-gray-900 bg-gray-900 text-white shadow-2xl"
                    : isCompleted
                      ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                      : hasErrors
                        ? "border-rose-500 bg-rose-50 text-rose-600"
                        : "border-gray-100 bg-white text-gray-300 group-hover:border-gray-200"
                }`}
              >
                {hasErrors ? (
                  <X size={18} strokeWidth={3} />
                ) : isCompleted ? (
                  <Check size={18} strokeWidth={3} />
                ) : (
                  <span className="text-sm font-black">{step.number}</span>
                )}
              </div>
              <span
                className={`whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                  isActive
                    ? "text-gray-900"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              >
                {stepT(step.key)}
              </span>

              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-2 h-1 w-8 rounded-full bg-gray-900"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>

            {idx < steps.length - 1 && (
              <div className="mx-4 h-[2px] min-w-[30px] flex-1 rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full bg-emerald-500 transition-all duration-500 ${isCompleted ? "w-full" : "w-0"}`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
