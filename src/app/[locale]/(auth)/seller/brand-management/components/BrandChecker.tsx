"use client";

import { CheckCircle, XCircle, Search, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";

interface BrandCheckerProps {
  onCheck: (name: string) => Promise<"exists" | "not-exists" | null>;
}

export const BrandChecker = ({ onCheck }: BrandCheckerProps) => {
  const t = useTranslations("seller_brand_management.checker");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"exists" | "not-exists" | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = async () => {
    if (!input.trim()) {
      setResult(null);
      return;
    }
    setIsChecking(true);
    const res = await onCheck(input);
    setResult(res);
    setIsChecking(false);
  };

  return (
    <div className="mb-10 rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
      <div className="mb-8 space-y-2">
        <h2 className="text-xl font-black tracking-tight text-gray-900">
          {t("title")}
        </h2>
        <p className="text-sm font-medium text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t("placeholder")}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setResult(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            className="focus:ring-primary/10 w-full rounded-2xl border border-gray-100 bg-gray-50/50 py-4 pl-12 pr-4 font-bold outline-none transition-all focus:border-primary focus:bg-white focus:ring-4"
          />
        </div>
        <DynamicButton
          variant="primary"
          onClick={handleCheck}
          disabled={isChecking}
          label={isChecking ? "" : t("check")}
          icon={
            isChecking ? <Loader2 className="animate-spin" size={18} /> : null
          }
          className="rounded-2xl bg-gray-900 px-8 py-4 font-black uppercase tracking-widest text-white shadow-xl shadow-black/10 transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98] sm:w-auto"
        />
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mt-6 flex items-center gap-3 rounded-2xl border p-4 ${
              result === "exists"
                ? "border-rose-100 bg-rose-50 font-bold text-rose-700"
                : "border-emerald-100 bg-emerald-50 font-bold text-emerald-700"
            }`}
          >
            {result === "exists" ? (
              <XCircle size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            <p className="text-sm">
              {result === "exists"
                ? t("exists", { name: input })
                : t("available", { name: input })}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
