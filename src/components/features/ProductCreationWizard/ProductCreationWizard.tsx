"use client";

import { useCallback } from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { CategoryStep } from "./steps/CategoryStep";
import { BrandStep } from "./steps/BrandStep";
import { IdentityStep } from "./steps/IdentityStep";
import { DetailsStep } from "./steps/DetailsStep";
import { PricingStep } from "./steps/PricingStep";
import { MediaStep } from "./steps/MediaStep";
import { WizardHeader } from "./WizardHeader";
import { useProductForm, Step } from "./useProductForm";
import { HealthStatus } from "./steps/HealthStatus";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

const ProductCreationWizard = () => {
  const locale = useAppLocale();
  const {
    product,
    confirmedProduct,
    errors,
    currentStep,
    updateProduct,
    validateStep,
    goToStep,
    isSubmitting,
  } = useProductForm();

  const steps = [
    { key: "category" as const, number: 1 },
    { key: "identity" as const, number: 2 },
    { key: "details" as const, number: 3 },
    { key: "pricing" as const, number: 4 },
    { key: "media" as const, number: 5 },
  ];

  const handleSubmit = useCallback(() => {
    validateStep();
  }, [validateStep]);

  const currentIndex = steps.findIndex((s) => s.key === currentStep);
  const isLastStep = currentIndex === steps.length - 1;

  const renderStep = () => {
    const commonProps = {
      product,
      errors,
      onUpdate: updateProduct,
      onValidate: validateStep,
      locale,
    };

    switch (currentStep) {
      case "category":
        return <CategoryStep {...commonProps} />;
      case "identity":
        return <IdentityStep {...commonProps} />;
      case "details":
        return <DetailsStep {...commonProps} />;
      case "pricing":
        return <PricingStep {...commonProps} />;
      case "media":
        return <MediaStep {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`relative min-h-[90vh] pb-24 ${locale === "ar" ? "font-arabic text-right" : "text-left font-sans"}`}
    >
      {/* Premium Background Decorations */}
      <div className="pointer-events-none absolute left-0 top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-indigo-50/40 blur-[120px]" />
        <div className="absolute -right-20 top-[40%] h-[400px] w-[400px] rounded-full bg-rose-50/30 blur-[100px]" />
        <div className="absolute bottom-20 left-[30%] h-[300px] w-[300px] rounded-full bg-emerald-50/20 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pt-12">
        <WizardHeader
          steps={steps}
          currentStep={currentStep}
          product={product}
          onStepClick={(step) => goToStep(step)}
          errors={errors}
        />

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Main Content Area */}
          <div className="space-y-8 lg:col-span-8">
            <div className="min-h-[600px] rounded-[1rem] border border-white/60 bg-white/70 px-3 py-3 shadow-2xl shadow-gray-200/40 backdrop-blur-3xl transition-all">
              {renderStep()}
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between rounded-[2.5rem] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
              <DynamicButton
                variant="outline"
                onClick={() => {
                  if (currentIndex > 0) goToStep(steps[currentIndex - 1].key);
                }}
                disabled={currentIndex === 0}
                className="h-16 rounded-2xl px-10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-gray-900 disabled:opacity-30"
                label={locale === "ar" ? "السابق" : "Back Step"}
                icon={
                  locale === "ar" ? (
                    <ChevronRight size={18} />
                  ) : (
                    <ChevronLeft size={18} />
                  )
                }
                iconPosition="left"
              />

              <DynamicButton
                variant={isLastStep ? "success" : "primary"}
                onClick={isLastStep ? handleSubmit : validateStep}
                className={`h-16 rounded-2xl px-14 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isLastStep
                    ? "bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700"
                    : "bg-gray-900 shadow-gray-200 hover:bg-black"
                }`}
                label={
                  isLastStep
                    ? locale === "ar"
                      ? "إنشاء المنتج"
                      : "Complete & Publish"
                    : locale === "ar"
                      ? "التالي"
                      : "Proceed with Next"
                }
                icon={
                  isLastStep ? (
                    <Check size={18} strokeWidth={3} />
                  ) : locale === "ar" ? (
                    <ChevronLeft size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )
                }
                iconPosition={isLastStep || locale !== "ar" ? "right" : "left"}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="h-fit lg:sticky lg:top-12 lg:col-span-4">
            <HealthStatus product={confirmedProduct} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreationWizard;
