"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { getBrandsData, getCategoriesData } from "@/data";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";

// Modular Components
import { StepIndicator } from "./components/StepIndicator";
import { CategoryStep } from "./components/CategoryStep";
import { BrandStep } from "./components/BrandStep";
import { IdentityStep } from "./components/IdentityStep";
import { DetailsStep } from "./components/DetailsStep";
import { PricingInventoryStep } from "./components/PricingInventoryStep";
import { MediaStep } from "./components/MediaStep";
import { WizardHealth } from "./components/WizardHealth";

const { allCategories } = getCategoriesData();
const allBrands = getBrandsData();

type Step = "category" | "brand" | "identity" | "details" | "pricing" | "media";

const ProductCreationWizard = () => {
  const t = useTranslations("create_product");
  const locale = useAppLocale();
  const [step, setStep] = useState<Step>("category");
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [product, setProduct] = useState<any>({
    category: null,
    brand: null,
    sku: "",
    skuGenerated: false,
    title: "",
    description: "",
    features: [],
    highlights: [],
    deliveryTime: "",
    price: 0,
    del_price: 0,
    saleStart: "",
    saleEnd: "",
    stock: 0,
    weightKg: 0,
    sizes: [],
    colors: [],
    specifications: [],
    images: [],
  });

  const [errors, setErrors] = useState<any>({});

  const updateProduct = (updates: any) => {
    setProduct((prev: any) => ({ ...prev, ...updates }));
  };

  const checks = useMemo(
    () => ({
      invoicing: true, // Placeholder for actual invoicing logic
      price: (product.del_price || 0) > 0,
      psku: !!product.sku && product.sku.length >= 3,
      stock: (product.stock || 0) > 0,
      product:
        !!product.title && !!product.description && product.images.length > 0,
    }),
    [product],
  );

  const handleNext = () => {
    const steps: Step[] = [
      "category",
      "brand",
      "identity",
      "details",
      "pricing",
      "media",
    ];
    const currentIndex = steps.indexOf(step);

    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }

    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    const steps: Step[] = [
      "category",
      "brand",
      "identity",
      "details",
      "pricing",
      "media",
    ];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    setSubmitting(false);
    alert("Product created successfully!");
  };

  const renderStep = () => {
    switch (step) {
      case "category":
        return (
          <CategoryStep
            categories={allCategories}
            selectedCategory={product.category}
            onSelect={(category) => updateProduct({ category })}
            locale={locale}
          />
        );
      case "brand":
        return (
          <BrandStep
            brands={allBrands}
            selectedBrand={product.brand}
            onSelect={(brand) => updateProduct({ brand })}
            locale={locale}
          />
        );
      case "identity":
        return (
          <IdentityStep
            sku={product.sku}
            skuGenerated={product.skuGenerated}
            onSkuChange={(sku) => updateProduct({ sku, skuGenerated: false })}
            onGenerateSku={() =>
              updateProduct({
                sku: `PSKU-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                skuGenerated: true,
              })
            }
            errors={errors}
          />
        );
      case "details":
        return (
          <DetailsStep
            product={product}
            onChange={updateProduct}
            errors={errors}
            locale={locale}
          />
        );
      case "pricing":
        return (
          <PricingInventoryStep
            product={product}
            onChange={updateProduct}
            errors={errors}
          />
        );
      case "media":
        return (
          <MediaStep
            images={product.images}
            onUpload={(files) => {
              if (files) {
                updateProduct({
                  images: [...product.images, ...Array.from(files)],
                });
              }
            }}
            onRemove={(index) => {
              const newImages = [...product.images];
              newImages.splice(index, 1);
              updateProduct({ images: newImages });
            }}
            locale={locale}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 pb-24">
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("title")}
            </h1>
            <p className="text-sm font-medium text-gray-500">
              List a new product to your catalog with guided steps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DynamicButton
              variant="outline"
              label={t("actions.preview")}
              className="rounded-2xl border-white bg-white/50 px-6 py-3 font-bold shadow-sm backdrop-blur-md hover:bg-white"
            />
            <DynamicButton
              variant="outline"
              label={t("actions.save")}
              className="rounded-2xl border-white bg-white/50 px-6 py-3 font-bold shadow-sm backdrop-blur-md hover:bg-white"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Form Area */}
          <div className="space-y-8 lg:col-span-8">
            <div className="rounded-[2.5rem] border border-white/60 bg-white/70 p-4 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
              <StepIndicator
                currentStep={step}
                completedSteps={completedSteps}
                onStepClick={setStep}
                locale={locale}
              />
            </div>

            <div className="min-h-[500px] rounded-[2.5rem] border border-white/60 bg-white/80 p-8 shadow-2xl shadow-gray-200/40 backdrop-blur-3xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sticky/Bottom Navigation */}
            <div className="flex items-center justify-between gap-4 rounded-[2.5rem] border border-white/60 bg-white/80 p-6 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
              <DynamicButton
                variant="outline"
                label={t("actions.back")}
                disabled={step === "category"}
                onClick={handleBack}
                className="rounded-2xl border-gray-100 px-8 py-4 font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 disabled:opacity-30"
              />

              <DynamicButton
                variant="primary"
                label={
                  submitting
                    ? t("actions.submitting")
                    : step === "media"
                      ? t("actions.publish")
                      : t("actions.next")
                }
                onClick={handleNext}
                disabled={submitting}
                className="rounded-2xl bg-gray-900 px-12 py-4 font-black uppercase tracking-widest text-white shadow-xl shadow-black/10 transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98]"
              />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="h-fit lg:sticky lg:top-8 lg:col-span-4">
            <WizardHealth checks={checks} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCreationWizard;
