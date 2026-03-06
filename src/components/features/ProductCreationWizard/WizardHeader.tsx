"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepItem {
  key: string;
  number: number;
  label?: string;
}

interface WizardHeaderProps {
  steps: StepItem[];
  currentStep: string;
  product: any;
  onStepClick: (step: string) => void;
  errors: Record<string, string>;
}

export const WizardHeader = ({
  steps,
  currentStep,
  onStepClick,
}: WizardHeaderProps) => {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full py-2">
      <div className="flex items-start justify-center">
        {steps.map((step, idx) => {
          const isActive = step.key === currentStep;
          const isCompleted = currentIndex > idx;
          const isLast = idx === steps.length - 1;

          return (
            <div
              key={step.key}
              className={`flex items-start ${!isLast ? "flex-1" : ""}`}
            >
              {/* Step circle + label */}
              <button
                onClick={() => onStepClick(step.key)}
                className="group relative flex flex-col items-center gap-2 outline-none"
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.05 : 1,
                  }}
                  className={`relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : isActive
                        ? "border-emerald-500 bg-white text-emerald-600 shadow-md shadow-emerald-100"
                        : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} strokeWidth={3} />
                  ) : (
                    <span className="text-sm font-bold">{step.number}</span>
                  )}
                </motion.div>
                <span
                  className={`whitespace-nowrap text-[11px] font-semibold transition-colors ${
                    isActive
                      ? "text-emerald-600"
                      : isCompleted
                        ? "text-emerald-500"
                        : "text-gray-400"
                  }`}
                >
                  {step.label || `Step ${step.number}`}
                </span>
              </button>

              {/* Connecting line */}
              {!isLast && (
                <div className="relative mt-[18px] flex h-[2px] flex-1 items-center px-2">
                  <div className="h-full w-full rounded-full bg-gray-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: isCompleted ? "100%" : "0%",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 60,
                        damping: 20,
                      }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
