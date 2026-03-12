"use client";

import React from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  useProductForm,
  Step,
} from "@/components/features/ProductCreationWizard/useProductForm";
import { Step2PricingInventory } from "@/components/features/ProductCreationWizard/steps/Step2PricingInventory";
import { MediaStep } from "@/components/features/ProductCreationWizard/steps/MediaStep";
import { Step3Settings } from "@/components/features/ProductCreationWizard/steps/Step3Settings";
import { WizardHeader } from "@/components/features/ProductCreationWizard/WizardHeader";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";
import { ChevronLeft, ChevronRight, Check, Save } from "lucide-react";
import Step1CoreInfo from "@/components/features/ProductCreationWizard/steps/Step1CoreInfo";

export default function CreateProduct2WizardLayout() {
  const locale = useAppLocale();
  const isAr = locale === "ar";

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
  } = useProductForm();

  const steps = [
    {
      key: "step1_core" as const,
      number: 1,
      label: isAr ? "معلومات أساسية" : "Basic Info",
    },
    {
      key: "step2_pricing" as const,
      number: 2,
      label: isAr ? "التسعير والوسائط" : "Pricing & Media",
    },
    {
      key: "step3_media" as const,
      number: 3,
      label: isAr ? "المخزون والشحن" : "Inventory & Shipping",
    },
    {
      key: "step4_settings" as const,
      number: 4,
      label: isAr ? "معاينة المنتج" : "Product Preview",
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
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8F6]">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6">
          <p className="text-xs font-medium text-slate-500">
            {isAr ? "المخزون" : "Inventory"}{" "}
            <span className="mx-1 text-slate-300">›</span>{" "}
            {isAr ? "إضافة منتج جديد" : "Add New Product"}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
            {isAr ? "إضافة منتج رعاية صحية جديد" : "Add New Healthcare Product"}
          </h1>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
          <WizardHeader
            steps={steps}
            currentStep={currentStep}
            product={product as any}
            onStepClick={(step) => goToStep(step as Step)}
            errors={errors}
          />
        </div>

        <div className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="p-4 md:p-6">{renderStep()}</div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <DynamicButton
            variant="outline"
            onClick={() => {
              if (currentIndex > 0) goToStep(steps[currentIndex - 1].key);
            }}
            disabled={currentIndex === 0 || isSubmitting}
            className="h-10 rounded-xl px-4 text-xs font-bold"
            label={isAr ? "السابق" : "Back"}
            icon={isAr ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            iconPosition="left"
          />

          <DynamicButton
            variant={isLastStep ? "success" : "primary"}
            onClick={() => void validateStep({ submitMode: "publish" })}
            disabled={isSubmitting}
            style={{ backgroundColor: "lab(58.4941% -47.8529 35.5714)" }}
            className="h-10 rounded-xl px-6 text-xs font-extrabold text-white shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            label={
              isLastStep
                ? isAr
                  ? isEditMode
                    ? "حفظ التعديلات"
                    : "حفظ المنتج"
                  : isEditMode
                    ? "Save Changes"
                    : "Save Product"
                : isAr
                  ? "الخطوة التالية"
                  : "Next Step"
            }
            icon={
              isLastStep ? (
                <Check size={14} />
              ) : isAr ? (
                <ChevronLeft size={14} />
              ) : (
                <ChevronRight size={14} />
              )
            }
            iconPosition={isLastStep || !isAr ? "right" : "left"}
          />

          <DynamicButton
            variant="outline"
            onClick={() =>
              void validateStep({ submitMode: "draft", forceSubmit: true })
            }
            disabled={isSubmitting}
            className="h-10 rounded-xl px-4 text-xs font-bold"
            label={isAr ? "حفظ كمسودة" : "Draft"}
            icon={<Save size={14} />}
            iconPosition="left"
          />
        </div>
      </div>
    </div>
  );
}
