"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Info, Plus, X } from "lucide-react";
import { useState } from "react";

interface DetailsStepProps {
  product: {
    title?: string;
    description?: string;
    features?: string[];
    highlights?: string[];
    weightKg?: number;
    deliveryTime?: string;
  };
  onChange: (updates: any) => void;
  errors: any;
  locale: string;
}

export const DetailsStep = ({
  product,
  onChange,
  errors,
  locale,
}: DetailsStepProps) => {
  const t = useTranslations("create_product.details");
  const [newFeature, setNewFeature] = useState("");
  const [newHighlight, setNewHighlight] = useState("");

  const addItem = (
    type: "features" | "highlights",
    value: string,
    setter: (v: string) => void,
  ) => {
    if (value.trim()) {
      onChange({ [type]: [...(product[type] || []), value.trim()] });
      setter("");
    }
  };

  const removeItem = (type: "features" | "highlights", index: number) => {
    onChange({ [type]: product[type]?.filter((_, i) => i !== index) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {t("productTitle")}
          </label>
          <input
            type="text"
            placeholder={t("titlePlaceholder")}
            value={product.title || ""}
            onChange={(e) => onChange({ title: e.target.value })}
            className={`w-full rounded-2xl border bg-gray-50/50 p-4 font-bold outline-none transition-all ${
              errors.title
                ? "border-rose-200 bg-rose-50/30 ring-4 ring-rose-50"
                : "focus:ring-primary/10 border-gray-100 focus:border-primary focus:bg-white focus:ring-4"
            }`}
          />
          {errors.title && (
            <p className="text-xs font-bold text-rose-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {t("description")}
          </label>
          <textarea
            rows={5}
            placeholder={t("descPlaceholder")}
            value={product.description || ""}
            onChange={(e) => onChange({ description: e.target.value })}
            className={`w-full resize-none rounded-2xl border bg-gray-50/50 p-4 font-medium outline-none transition-all ${
              errors.description
                ? "border-rose-200 bg-rose-50/30 ring-4 ring-rose-50"
                : "focus:ring-primary/10 border-gray-100 focus:border-primary focus:bg-white focus:ring-4"
            }`}
          />
          {errors.description && (
            <p className="text-xs font-bold text-rose-600">
              {errors.description}
            </p>
          )}
        </div>

        {/* Delivery Info */}
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {t("deliveryTime")}
          </label>
          <div className="relative">
            <Info className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("deliveryPlaceholder")}
              value={product.deliveryTime || ""}
              onChange={(e) => onChange({ deliveryTime: e.target.value })}
              className="focus:ring-primary/10 w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 pl-12 font-bold outline-none transition-all focus:border-primary focus:bg-white focus:ring-4"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Lists: Features & Highlights */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Features */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {t("keyFeatures")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t("featurePlaceholder")}
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                addItem("features", newFeature, setNewFeature)
              }
              className="focus:ring-primary/10 flex-1 rounded-xl border border-gray-100 bg-gray-50/50 p-3 font-medium outline-none focus:ring-4"
            />
            <button
              onClick={() => addItem("features", newFeature, setNewFeature)}
              className="rounded-xl bg-gray-900 p-3 text-white transition-all hover:bg-black"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.features?.map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-sm font-bold italic text-emerald-700"
              >
                {item}
                <button
                  onClick={() => removeItem("features", i)}
                  className="text-emerald-400 hover:text-emerald-600"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {t("highlights")}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={t("highlightPlaceholder")}
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                addItem("highlights", newHighlight, setNewHighlight)
              }
              className="focus:ring-primary/10 flex-1 rounded-xl border border-gray-100 bg-gray-50/50 p-3 font-medium outline-none focus:ring-4"
            />
            <button
              onClick={() =>
                addItem("highlights", newHighlight, setNewHighlight)
              }
              className="rounded-xl bg-gray-900 p-3 text-white transition-all hover:bg-black"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {product.highlights?.map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-700"
              >
                {item}
                <button
                  onClick={() => removeItem("highlights", i)}
                  className="text-indigo-400 hover:text-indigo-600"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
