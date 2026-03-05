"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Truck, Sparkles, Plus, X, Globe } from "lucide-react";
import { ProductFormData } from "@/lib/validations/product-schema";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import { Textarea } from "@/components/shared/textarea";

interface DetailsStepProps {
  product: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
  locale: string;
}

export const DetailsStep = ({
  product,
  onUpdate,
  errors,
  locale,
}: DetailsStepProps) => {
  const t = useTranslations("create_product.details");

  const getHighlightsKey = (lang: "en" | "ar") =>
    lang === "en" ? "highlightsEn" : "highlightsAr";

  const getHighlights = (lang: "en" | "ar"): string[] =>
    lang === "en" ? product.highlightsEn : product.highlightsAr;

  const addHighlight = (lang: "en" | "ar") => {
    const key = getHighlightsKey(lang);
    onUpdate({ [key]: [...getHighlights(lang), ""] });
  };

  const updateHighlight = (lang: "en" | "ar", index: number, value: string) => {
    const key = getHighlightsKey(lang);
    const current = [...getHighlights(lang)];
    current[index] = value;
    onUpdate({ [key]: current });
  };

  const removeHighlight = (lang: "en" | "ar", index: number) => {
    const key = getHighlightsKey(lang);
    onUpdate({
      [key]: getHighlights(lang).filter((_: string, i: number) => i !== index),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-12"
    >
      {/* 1. Basic Information (Bilingual Name & Description) */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">{t("title")}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Step 03: Content & Context
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* English Details */}
          <div className="space-y-6 rounded-[2.5rem] border border-white/60 bg-white/40 p-10 shadow-sm backdrop-blur-xl transition-all hover:bg-white/60">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-indigo-600">
                EN
              </span>
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                English Content
              </Label>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700">
                {t("productTitle")}
              </Label>
              <Input
                value={product.title?.en || ""}
                onChange={(e) =>
                  onUpdate({ title: { ...product.title, en: e.target.value } })
                }
                placeholder={t("titlePlaceholder")}
                className={`h-14 rounded-2xl border-2 border-gray-100/50 bg-white/50 px-6 font-bold shadow-sm transition-all focus:border-gray-900 focus:bg-white ${errors["title.en"] ? "border-red-500" : ""}`}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-700">
                {t("description")}
              </Label>
              <Textarea
                value={product.descriptions?.descriptionEn || ""}
                onChange={(e) =>
                  onUpdate({
                    descriptions: {
                      ...product.descriptions,
                      descriptionEn: e.target.value,
                    },
                  })
                }
                placeholder={t("descPlaceholder")}
                className={`min-h-[160px] rounded-2xl border-2 border-gray-100/50 bg-white/50 p-6 font-bold shadow-sm transition-all focus:border-gray-900 focus:bg-white ${errors["descriptions.descriptionEn"] ? "border-red-500" : ""}`}
              />
            </div>
          </div>

          {/* Arabic Details */}
          <div
            className="space-y-6 rounded-[2.5rem] border border-white/60 bg-white/40 p-10 shadow-sm backdrop-blur-xl transition-all hover:bg-white/60"
            dir="rtl"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-rose-600">
                AR
              </span>
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                المحتوى العربي
              </Label>
            </div>

            <div className="space-y-2 text-right">
              <Label className="text-xs font-bold text-gray-700">
                اسم المنتج
              </Label>
              <Input
                value={product.title?.ar || ""}
                onChange={(e) =>
                  onUpdate({ title: { ...product.title, ar: e.target.value } })
                }
                placeholder="أدخل اسم المنتج"
                className={`h-14 rounded-2xl border-2 border-gray-100/50 bg-white/50 px-6 text-right font-bold shadow-sm transition-all focus:border-gray-900 focus:bg-white ${errors["title.ar"] ? "border-red-500" : ""}`}
              />
            </div>
            <div className="space-y-2 text-right">
              <Label className="text-xs font-bold text-gray-700">
                وصف المنتج
              </Label>
              <Textarea
                value={product.descriptions?.descriptionAr || ""}
                onChange={(e) =>
                  onUpdate({
                    descriptions: {
                      ...product.descriptions,
                      descriptionAr: e.target.value,
                    },
                  })
                }
                placeholder="أدخل وصفاً مفصلاً للمنتج..."
                className={`min-h-[160px] rounded-2xl border-2 border-gray-100/50 bg-white/50 p-6 text-right font-bold shadow-sm transition-all focus:border-gray-900 focus:bg-white ${errors["descriptions.descriptionAr"] ? "border-red-500" : ""}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Highlights Section (Bilingual Bullet Points) */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {t("highlights")}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Key Selling Points
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* EN Highlights */}
          <div className="space-y-6 rounded-[2.5rem] border border-white/60 bg-white/40 p-10 shadow-sm backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Highlights (English)
              </Label>
              <button
                onClick={() => addHighlight("en")}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-900 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {(product.highlightsEn || []).map(
                  (highlight: string, index: number) => (
                    <motion.div
                      key={`en-highlight-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="group relative"
                    >
                      <Input
                        value={highlight}
                        onChange={(e) =>
                          updateHighlight("en", index, e.target.value)
                        }
                        placeholder={t("highlightPlaceholder")}
                        className="h-12 rounded-xl border-2 border-gray-100/50 bg-white/50 pl-4 pr-12 font-medium transition-all focus:border-gray-900"
                      />
                      <button
                        onClick={() => removeHighlight("en", index)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 transition-colors hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ),
                )}
              </AnimatePresence>
              {(product.highlightsEn?.length || 0) === 0 && (
                <p className="py-8 text-center text-xs font-black uppercase tracking-widest text-gray-300">
                  No highlights added yet
                </p>
              )}
            </div>
          </div>

          {/* AR Highlights */}
          <div
            className="space-y-6 rounded-[2.5rem] border border-white/60 bg-white/40 p-10 shadow-sm backdrop-blur-xl"
            dir="rtl"
          >
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                النقاط البارزة (عربي)
              </Label>
              <button
                onClick={() => addHighlight("ar")}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-900 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {(product.highlightsAr || []).map(
                  (highlight: string, index: number) => (
                    <motion.div
                      key={`ar-highlight-${index}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="group relative"
                    >
                      <Input
                        value={highlight}
                        onChange={(e) =>
                          updateHighlight("ar", index, e.target.value)
                        }
                        placeholder={t("highlightPlaceholder")}
                        className="h-12 rounded-xl border-2 border-gray-100/50 bg-white/50 pl-12 pr-4 text-right font-medium transition-all focus:border-gray-900"
                      />
                      <button
                        onClick={() => removeHighlight("ar", index)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 transition-colors hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </motion.div>
                  ),
                )}
              </AnimatePresence>
              {(product.highlightsAr?.length || 0) === 0 && (
                <p className="font-arabic py-8 text-center text-xs font-black uppercase tracking-widest text-gray-300">
                  لا توجد نقاط بارزة مضافة
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Logistics (Delivery Time) */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-inner">
            <Truck size={22} />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900">
              {t("deliveryTime")}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Logistics & Service
            </p>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-white/60 bg-white/40 p-10 shadow-sm backdrop-blur-xl">
          <div className="max-w-md space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              وقت التوصيل | Delivery Time
            </Label>
            <div className="relative">
              <Input
                placeholder="مثال: 3-5 أيام عمل | e.g. 3-5 days"
                className="h-14 rounded-2xl border-2 border-gray-100/50 bg-white/50 px-6 font-bold shadow-sm transition-all focus:border-gray-900 focus:bg-white"
              />
              <div className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                <Globe size={18} />
              </div>
            </div>
            <p className="text-[10px] font-medium italic text-gray-400">
              Example: "3-5 business days" or "Next day delivery"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
