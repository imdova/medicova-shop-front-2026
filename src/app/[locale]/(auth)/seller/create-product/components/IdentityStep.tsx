"use client";

import { Check, Clipboard, Info, AlertCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface ProductIdentityProps {
  sku: string;
  onSkuChange: (sku: string) => void;
  onGenerateSku: () => void;
  skuGenerated: boolean;
  errors: { sku?: string };
}

export const IdentityStep = ({
  sku,
  onSkuChange,
  onGenerateSku,
  skuGenerated,
  errors,
}: ProductIdentityProps) => {
  const t = useTranslations("create_product.identity");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>
        <p className="max-w-lg text-sm text-gray-500">
          Every product in your catalog needs a unique SKU (Stock Keeping Unit).
          You can enter yours manually or let us generate one for you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Manual Entry */}
        <div
          className={`rounded-[2rem] border-2 p-6 transition-all ${
            !skuGenerated && sku
              ? "bg-primary/5 shadow-primary/5 border-primary shadow-xl"
              : "border-gray-50 bg-white"
          }`}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                !skuGenerated && sku
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Clipboard size={20} />
            </div>
            <h3 className="font-bold text-gray-900">{t("manualSku")}</h3>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder={t("skuPlaceholder")}
              value={skuGenerated ? "" : sku}
              onChange={(e) => onSkuChange(e.target.value)}
              className={`w-full rounded-2xl border bg-gray-50/50 p-4 font-mono font-bold tracking-wider outline-none transition-all ${
                errors.sku
                  ? "border-rose-200 bg-rose-50/30 ring-4 ring-rose-50"
                  : "focus:ring-primary/10 border-gray-100 focus:border-primary focus:bg-white focus:ring-4"
              }`}
            />
            {errors.sku && (
              <p className="flex items-center gap-1.5 px-1 text-xs font-bold text-rose-600">
                <AlertCircle size={14} />
                {errors.sku}
              </p>
            )}
          </div>
        </div>

        {/* Auto Generation */}
        <div
          className={`rounded-[2rem] border-2 p-6 transition-all ${
            skuGenerated
              ? "border-emerald-200 bg-emerald-50/50 shadow-xl shadow-emerald-100/20"
              : "border-gray-50 bg-white"
          }`}
        >
          <div className="mb-6 flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                skuGenerated
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              <Check size={20} strokeWidth={3} />
            </div>
            <h3 className="font-bold text-gray-900">{t("autoSku")}</h3>
          </div>

          <button
            onClick={onGenerateSku}
            className={`w-full rounded-2xl py-4 font-black uppercase tracking-widest transition-all ${
              skuGenerated
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                : "bg-gray-900 text-white shadow-lg shadow-black/10 hover:bg-black active:scale-95"
            }`}
          >
            {skuGenerated ? t("skuGenerated") : t("autoSku")}
          </button>

          {skuGenerated && (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-100 bg-white p-4">
              <span className="font-mono text-lg font-black tracking-tighter text-emerald-900">
                {sku}
              </span>
              <button
                onClick={() => onSkuChange("")}
                className="text-xs font-bold text-emerald-500 hover:text-emerald-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4">
        <Info className="shrink-0 text-amber-500" size={20} />
        <p className="text-xs font-medium leading-relaxed text-amber-800">
          <strong>Tip:</strong> An ideal SKU is descriptive and consistent.
          Example:{" "}
          <code className="rounded bg-amber-100 px-1 text-amber-900">
            BRND-CT-001
          </code>{" "}
          for Brand, Category, and Item Number.
        </p>
      </div>
    </motion.div>
  );
};
