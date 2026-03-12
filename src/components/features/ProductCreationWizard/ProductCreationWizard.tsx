"use client";

import { useCallback } from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import Step1CoreInfo from "./steps/Step1CoreInfo";
import { Step3Settings } from "./steps/Step3Settings";
import { MediaStep } from "./steps/MediaStep";
import { Step2PricingInventory } from "./steps/Step2PricingInventory";
import { WizardHeader } from "./WizardHeader";
import { useProductForm, Step } from "./useProductForm";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";
import { ChevronRight, ChevronLeft, Check, Loader2 } from "lucide-react";

interface ProductCreationWizardProps {
  productId?: string;
}

const ProductCreationWizard = ({
  productId,
}: ProductCreationWizardProps = {}) => {
  const locale = useAppLocale();
  const {
    product,
    errors,
    currentStep,
    updateProduct,
    validateStep,
    goToStep,
    isSubmitting,
    isLoading,
    isEditMode,
    token,
    userRole,
  } = useProductForm(productId);

  const steps = [
    {
      key: "step1_core" as const,
      number: 1,
      label: locale === "ar" ? "البيانات الأساسية" : "Core Info",
    },
    {
      key: "step2_pricing" as const,
      number: 2,
      label: locale === "ar" ? "التسعير والوسائط" : "Pricing & Media",
    },
    {
      key: "step3_media" as const,
      number: 3,
      label: locale === "ar" ? "المخزون والشحن" : "Inventory & Shipping",
    },
    {
      key: "step4_settings" as const,
      number: 4,
      label: locale === "ar" ? "معاينة المنتج" : "Product Preview",
    },
  ];

  const currentIndex = steps.findIndex((s) => s.key === currentStep);
  const isLastStep = currentIndex === steps.length - 1;

  const renderStep = () => {
    const commonProps = {
      product,
      errors,
      onUpdate: updateProduct,
      locale,
      token,
      userRole,
    };

    switch (currentStep) {
      case "step1_core":
        return <Step1CoreInfo {...commonProps} />;
      case "step2_pricing":
        return <MediaStep {...commonProps} />;
      case "step3_media":
        return <Step2PricingInventory {...commonProps} />;
      case "step4_settings":
        return <Step3Settings {...commonProps} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className={`relative min-h-screen pb-12 ${locale === "ar" ? "font-arabic text-right" : "text-left font-sans"}`}
    >
      {/* Background Decorations */}
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full overflow-hidden opacity-30">
        <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-indigo-50/20 blur-[120px]" />
        <div className="absolute -right-20 top-[40%] h-[400px] w-[400px] rounded-full bg-rose-50/20 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pt-6">
        {/* Header & Top Navigation */}
        <div className="mb-6 rounded-[2rem] border border-white/80 bg-white/60 p-6 shadow-xl shadow-gray-200/10 backdrop-blur-2xl">
          {/* Step Indicator */}
          <div className="mb-4">
            <WizardHeader
              steps={steps}
              currentStep={currentStep}
              product={product as any}
              onStepClick={(step) => goToStep(step as Step)}
              errors={errors}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <DynamicButton
              variant="outline"
              onClick={() => {
                if (currentIndex > 0) goToStep(steps[currentIndex - 1].key);
              }}
              disabled={currentIndex === 0}
              className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all hover:text-gray-900 disabled:opacity-10"
              label={locale === "ar" ? "السابق" : "Prev"}
              icon={
                locale === "ar" ? (
                  <ChevronRight size={14} />
                ) : (
                  <ChevronLeft size={14} />
                )
              }
              iconPosition="left"
            />

            <DynamicButton
              variant={isLastStep ? "success" : "primary"}
              onClick={validateStep}
              style={{ backgroundColor: "lab(58.4941% -47.8529 35.5714)" }}
              className={`h-10 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] ${
                isLastStep ? "" : ""
              }`}
              label={
                isLastStep
                  ? locale === "ar"
                    ? isEditMode
                      ? "حفظ التعديلات"
                      : "حفظ المنتج"
                    : isEditMode
                      ? "Save Changes"
                      : "Complete"
                  : locale === "ar"
                    ? "التالي"
                    : "Next"
              }
              icon={
                isLastStep ? (
                  <Check size={14} strokeWidth={3} />
                ) : locale === "ar" ? (
                  <ChevronLeft size={14} />
                ) : (
                  <ChevronRight size={14} />
                )
              }
              iconPosition={isLastStep || locale !== "ar" ? "right" : "left"}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="rounded-[2.5rem] border border-gray-100 bg-gray-50/80 p-2 shadow-sm transition-all">
          <div className="p-4">{renderStep()}</div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreationWizard;
