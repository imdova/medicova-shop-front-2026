"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Package,
  Calendar,
  Sparkles,
  TrendingDown,
  Info,
  Clock,
} from "lucide-react";
import { ProductFormData } from "@/lib/validations/product-schema";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";

interface PricingStepProps {
  product: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
}

export const PricingStep = ({
  product,
  onUpdate,
  errors,
}: PricingStepProps) => {
  const t = useTranslations("create_product.pricing");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl space-y-10 pb-20"
    >
      {/* 1. Pricing Strategy Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-indigo-50 text-indigo-600 shadow-inner ring-1 ring-indigo-100/50">
            <DollarSign size={24} />
          </div>
          <div>
            <h2 className="mb-1 text-2xl font-black leading-none tracking-tight text-gray-900">
              Pricing Strategy
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Set your market value and promotions
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[3rem] border border-white/60 bg-white/40 p-10 shadow-sm backdrop-blur-xl transition-all hover:bg-white/60">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Base Price */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Base Price (Required)
                </Label>
                <Info size={14} className="text-gray-300" />
              </div>
              <div className="group relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-gray-900">
                  <DollarSign size={20} />
                </div>
                <Input
                  type="number"
                  value={product.del_price || ""}
                  onChange={(e) =>
                    onUpdate({ del_price: parseFloat(e.target.value) })
                  }
                  placeholder="0.00"
                  className={`h-20 rounded-3xl border-2 border-gray-100/50 bg-white/50 pl-14 pr-8 text-2xl font-black shadow-sm transition-all focus:border-gray-900 focus:bg-white ${errors.del_price ? "border-red-500" : ""}`}
                />
              </div>
            </div>

            {/* Sale Price */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                  Special Promotion Price
                </Label>
                <TrendingDown size={14} className="text-emerald-400" />
              </div>
              <div className="group relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-300 transition-colors group-focus-within:text-emerald-600">
                  <DollarSign size={20} />
                </div>
                <Input
                  type="number"
                  value={product.price || ""}
                  onChange={(e) =>
                    onUpdate({ price: parseFloat(e.target.value) })
                  }
                  placeholder="Optional"
                  className={`h-20 rounded-3xl border-2 border-emerald-50/50 bg-emerald-50/30 pl-14 pr-8 text-2xl font-black text-emerald-600 shadow-sm transition-all placeholder:text-emerald-200 focus:border-emerald-500 focus:bg-white ${errors.price ? "border-red-500" : ""}`}
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {product.price && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-10 border-t border-gray-100/50 pt-10"
              >
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <Calendar size={12} /> Promotion Start
                    </Label>
                    <Input
                      type="date"
                      value={product.saleStart || ""}
                      onChange={(e) => onUpdate({ saleStart: e.target.value })}
                      className="h-14 rounded-2xl border-2 border-gray-100/50 bg-white/60 px-6 font-bold transition-all focus:border-gray-900"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                      <Clock size={12} /> Promotion End
                    </Label>
                    <Input
                      type="date"
                      value={product.saleEnd || ""}
                      onChange={(e) => onUpdate({ saleEnd: e.target.value })}
                      className="h-14 rounded-2xl border-2 border-gray-100/50 bg-white/60 px-6 font-bold transition-all focus:border-gray-900"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Inventory & Stock Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-amber-50 text-amber-600 shadow-inner ring-1 ring-amber-100/50">
            <Package size={24} />
          </div>
          <div>
            <h2 className="mb-1 text-2xl font-black leading-none tracking-tight text-gray-900">
              Inventory Management
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Track your available units
            </p>
          </div>
        </div>

        <div className="rounded-[3rem] border border-white/60 bg-white/40 p-10 shadow-sm backdrop-blur-xl transition-all hover:bg-white/60">
          <div className="max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                Available Stock Quantity
              </Label>
              <Sparkles size={14} className="text-amber-400" />
            </div>
            <div className="group relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-amber-600">
                <Package size={20} />
              </div>
              <Input
                type="number"
                value={product.stock || ""}
                onChange={(e) => onUpdate({ stock: parseInt(e.target.value) })}
                placeholder="0"
                className={`h-20 rounded-3xl border-2 border-gray-100/50 bg-white/50 pl-14 pr-8 text-2xl font-black shadow-sm transition-all focus:border-amber-500 focus:bg-white ${errors.stock ? "border-red-500" : ""}`}
              />
            </div>
            <p className="text-[10px] font-medium italic text-gray-400">
              Set to 0 if out of stock
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
