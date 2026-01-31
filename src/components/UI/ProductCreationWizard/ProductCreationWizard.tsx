"use client";

import { useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SetupStep } from "./steps/SetupStep";
import { DetailsStep } from "./steps/DetailsStep";
import { WizardHeader } from "./WizardHeader";
import { useProductForm } from "./useProductForm";
import { HealthStatus } from "./steps/HealthStatus";

export type Step = "setup" | "details";

const ProductCreationWizard = () => {
  const { language } = useLanguage();
  const {
    product,
    errors,
    currentStep,
    updateProduct,
    validateStep,
    goToStep,
  } = useProductForm();

  const steps = [
    { key: "setup" as const, number: 1 },
    { key: "details" as const, number: 2 },
  ];

  // Add this handler for the create product button
  const handleSubmit = useCallback(() => {
    console.log("Create product button clicked");
    validateStep(); // This will trigger the submission logic
  }, [validateStep]);

  const renderStep = () => {
    const commonProps = {
      product,
      errors,
      onUpdate: updateProduct,
      onValidate: validateStep,
      onBack: () => {
        const currentIndex = steps.findIndex((s) => s.key === currentStep);
        if (currentIndex > 0) {
          goToStep(steps[currentIndex - 1].key);
        }
      },
    };

    switch (currentStep) {
      case "setup":
        return <SetupStep {...commonProps} />;
      case "details":
        return (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-9 overflow-visible">
            <div className="col-span-1 lg:col-span-6 overflow-visible">
              <DetailsStep {...commonProps} />
            </div>
            <div className="col-span-1 h-fit lg:col-span-3">
              <HealthStatus product={product} errors={errors} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={language === "ar" ? "text-right" : "text-left"}>
      <WizardHeader
        steps={steps}
        currentStep={currentStep}
        product={product}
        onStepClick={(step) => goToStep(step)}
        onSubmit={handleSubmit}
        errors={errors}
      />

      {renderStep()}
    </div>
  );
};

export default ProductCreationWizard;
