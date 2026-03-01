"use client";

import { useTranslations } from "next-intl";
import {
  Check,
  AlertCircle,
  Info,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { motion } from "framer-motion";

interface WizardHealthProps {
  checks: {
    invoicing: boolean;
    price: boolean;
    psku: boolean;
    stock: boolean;
    product: boolean;
  };
}

export const WizardHealth = ({ checks }: WizardHealthProps) => {
  const t = useTranslations("create_product.health");
  const allValid = Object.values(checks).every(Boolean);

  const checkItems = [
    { key: "invoicing", label: t("invoicing"), valid: checks.invoicing },
    { key: "price", label: t("price"), valid: checks.price },
    { key: "psku", label: t("psku"), valid: checks.psku },
    { key: "stock", label: t("stock"), valid: checks.stock },
    { key: "product", label: t("product"), valid: checks.product },
  ];

  return (
    <div className="flex h-full flex-col gap-8 rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black tracking-tight text-gray-900">
          {t("title")}
        </h3>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${
            allValid
              ? "bg-emerald-100 text-emerald-600"
              : "bg-amber-100 text-amber-600"
          }`}
        >
          {allValid ? (
            <Check size={24} strokeWidth={3} />
          ) : (
            <AlertCircle size={24} strokeWidth={3} />
          )}
        </div>
      </div>

    

      <div className="space-y-3">
        {checkItems.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between rounded-2xl border p-4 transition-all ${
              item.valid
                ? "border-gray-50 bg-white/50 text-gray-900 opacity-60 grayscale-[0.8]"
                : "border-white bg-white text-gray-900 shadow-sm shadow-gray-200/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                  item.valid
                    ? "bg-emerald-50 text-emerald-500"
                    : "bg-gray-50 text-gray-300"
                }`}
              >
                {item.valid ? (
                  <Check size={16} strokeWidth={3} />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                )}
              </div>
              <span className="text-sm font-bold">{item.label}</span>
            </div>

            {!item.valid && (
              <button className="p-1 text-primary hover:text-blue-700">
                <Info size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto rounded-3xl bg-gray-900 p-5 text-white shadow-xl shadow-gray-900/20">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          Quality Score
        </p>
        <div className="flex items-center justify-between gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(Object.values(checks).filter(Boolean).length / 5) * 100}%`,
              }}
              className="h-full bg-primary"
            />
          </div>
          <span className="text-xl font-black italic">
            {Math.round(
              (Object.values(checks).filter(Boolean).length / 5) * 100,
            )}
            %
          </span>
        </div>
      </div>
    </div>
  );
};
