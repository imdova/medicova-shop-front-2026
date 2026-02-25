"use client";

import { Check, ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

type Step = "category" | "brand" | "identity" | "details" | "pricing" | "media";

interface StepIndicatorProps {
  currentStep: Step;
  completedSteps: Step[];
  onStepClick: (step: Step) => void;
  locale: string;
}

export const StepIndicator = ({
  currentStep,
  completedSteps,
  onStepClick,
  locale,
}: StepIndicatorProps) => {
  const t = useTranslations("create_product.wizard.steps");
  const steps: Step[] = [
    "category",
    "brand",
    "identity",
    "details",
    "pricing",
    "media",
  ];
  const isArabic = locale === "ar";

  return (
    <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto pb-4 ">
      {steps.map((step, index) => {
        const isActive = currentStep === step;
        const isCompleted = completedSteps.includes(step);
        const canClick =
          isCompleted ||
          steps[index - 1] === undefined ||
          completedSteps.includes(steps[index - 1]);

        return (
          <div key={step} className="flex shrink-0 items-center">
            <button
              onClick={() => canClick && onStepClick(step)}
              disabled={!canClick}
              className={`flex items-center gap-2 rounded-2xl px-2 py-2 transition-all ${
                isActive
                  ? "shadow-primary/30 bg-primary text-white shadow-lg"
                  : isCompleted
                    ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    : "cursor-not-allowed bg-gray-100/50 text-gray-400"
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black ${
                  isActive
                    ? "bg-white/20"
                    : isCompleted
                      ? "bg-emerald-500/10"
                      : "bg-gray-200/50"
                }`}
              >
                {isCompleted && !isActive ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs font-black uppercase tracking-widest">
                {t(step)}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div className="px-1 opacity-20">
                {isArabic ? (
                  <ChevronLeft size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
