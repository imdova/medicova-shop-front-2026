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
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className="space-y-4">
      {/* Dynamic Progress Bar */}
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-gray-100/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          style={{ backgroundColor: "lab(58.4941% -47.8529 35.5714)" }}
          className="absolute left-0 top-0 h-full shadow-[0_0_15px_rgba(0,128,128,0.2)]"
        />
      </div>

      <div className="flex items-center justify-between gap-1 px-1">
        {steps.map((step, idx) => {
          const isActive = step.key === currentStep;
          const isCompleted =
            steps.findIndex((s) => s.key === currentStep) > idx;

          return (
            <button
              key={step.key}
              onClick={() => onStepClick(step.key)}
              className="group relative flex flex-col gap-1 outline-none"
            >
              <div className="flex items-center gap-1.5">
                <div
                  style={
                    isCompleted || isActive
                      ? { backgroundColor: "lab(58.4941% -47.8529 35.5714)" }
                      : {}
                  }
                  className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all duration-500 ${
                    isActive
                      ? "scale-105 text-white shadow-lg"
                      : isCompleted
                        ? "text-white"
                        : "border border-gray-100 bg-white text-gray-300"
                  }`}
                >
                  {isCompleted ? (
                    <Check size={12} strokeWidth={3} />
                  ) : (
                    <span className="text-[10px] font-black">
                      {step.number}
                    </span>
                  )}
                </div>
                <div className="hidden text-left md:block">
                  <p
                    className={`text-[8px] font-black uppercase tracking-widest transition-colors ${
                      isActive ? "text-gray-900" : "text-gray-300"
                    }`}
                  >
                    {step.label || `P${step.number}`}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
