"use client";

import { useState, useCallback } from "react";
import { Fingerprint, Globe, RefreshCw, Check, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ProductFormData } from "@/lib/validations/product-schema";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";

interface IdentityStepProps {
  product: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
  locale: string;
}

export const IdentityStep = ({
  product,
  onUpdate,
  errors,
  locale,
}: IdentityStepProps) => {
  const t = useTranslations("create_product.identity");
  const [skuGenerated, setSkuGenerated] = useState(false);

  const generateSku = useCallback(() => {
    const randomPart = Math.random()
      .toString(36)
      .substring(2, 11)
      .toUpperCase();
    onUpdate({ sku: `PX-${randomPart}` });
    setSkuGenerated(true);
    setTimeout(() => setSkuGenerated(false), 2000);
  }, [onUpdate]);

  const updateSlug = (lang: "en" | "ar", value: string) => {
    // Basic slugification
    let slugified = value.toLowerCase().trim();

    if (lang === "en") {
      // English: allow only alphanumeric and hyphens
      slugified = slugified
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    } else {
      // Arabic: Allow Arabic characters, alphanumeric, and hyphens
      // \u0600-\u06FF is the main Arabic block
      slugified = slugified
        .replace(/[^\u0600-\u06FF\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    onUpdate({
      slug: {
        ...product.slug,
        [lang]: slugified,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10 pb-10"
    >
      {/* Header Section */}
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-indigo-50 text-indigo-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
          <Fingerprint size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">
            {t("title")}
          </h2>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            Step 02: Unique Identification
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* SKU & Core Info */}
        <div className="space-y-8">
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-xl backdrop-blur-2xl transition-all hover:bg-white/60">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                  Inventory Identifier (SKU)
                </Label>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-400">
                  <Info size={12} />
                </div>
              </div>

              <div className="relative">
                <Input
                  value={product.sku || ""}
                  onChange={(e) => onUpdate({ sku: e.target.value })}
                  placeholder={t("skuPlaceholder")}
                  className={`h-16 rounded-2xl border-2 border-gray-100/60 bg-white/50 px-6 text-lg font-black tracking-wider shadow-sm transition-all focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/5 ${errors.sku ? "border-red-500 ring-red-500/5" : ""}`}
                />
                <button
                  onClick={generateSku}
                  className={`absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl transition-all ${skuGenerated ? "rotate-0 bg-emerald-500 text-white shadow-lg" : "bg-gray-900 text-white hover:bg-black active:scale-90"}`}
                >
                  {skuGenerated ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <RefreshCw size={18} strokeWidth={3} />
                  )}
                </button>
              </div>

              {errors.sku && (
                <p className="text-[10px] font-black uppercase tracking-widest text-red-500">
                  {errors.sku}
                </p>
              )}

              <div className="rounded-2xl border border-white/50 bg-gray-900/5 p-5">
                <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-gray-500">
                  {t("manualSku")}: Manually enter your internal tracking code
                  or use the auto-generator for a unique ID.
                </p>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-50/50 opacity-50 blur-3xl transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        {/* SEO & URL Slugs */}
        <div className="space-y-8">
          <div className="rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-xl backdrop-blur-2xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-sm">
                <Globe size={20} />
              </div>
              <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                SEO & Online Presence
              </Label>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* EN Slug */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {t("slugEn")}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter text-indigo-400">
                    Required
                  </span>
                </div>
                <Input
                  value={product.slug?.en || ""}
                  onChange={(e) => updateSlug("en", e.target.value)}
                  placeholder="awesome-product-name"
                  className={`h-14 rounded-2xl border-2 border-gray-100/60 bg-white/50 px-6 font-bold transition-all focus:border-gray-900 focus:bg-white ${errors["slug.en"] ? "border-red-500 shadow-red-500/5" : ""}`}
                />
              </div>

              {/* AR Slug */}
              <div className="space-y-3" dir="rtl">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {t("slugAr")}
                  </span>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter text-rose-400">
                    مطلوب
                  </span>
                </div>
                <Input
                  value={product.slug?.ar || ""}
                  onChange={(e) => updateSlug("ar", e.target.value)}
                  placeholder="اسم-المنتج-المميز"
                  className={`h-14 rounded-2xl border-2 border-gray-100/60 bg-white/50 px-6 text-right font-bold transition-all focus:border-gray-900 focus:bg-white ${errors["slug.ar"] ? "border-red-500" : ""}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex items-center justify-center gap-3 py-4 opacity-50">
        <div className="h-[1px] flex-1 bg-gray-200" />
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-300">
          Identity Verified
        </span>
        <div className="h-[1px] flex-1 bg-gray-200" />
      </div>
    </motion.div>
  );
};
