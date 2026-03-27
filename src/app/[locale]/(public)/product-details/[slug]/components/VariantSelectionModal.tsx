"use client";
import React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Product } from "@/types/product";
import { LiquidSizeType, NumericSizeType, SizeType } from "@/types";
import Modal from "@/components/shared/Modals/DynamicModal";

interface UnitSelection {
  size?: SizeType | NumericSizeType | LiquidSizeType;
  color?: string;
}

interface VariantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  quantity: number;
  selectedOptions: { label: { en: string; ar: string }; values: { name: string; color: string }[] }[];
  unitSelections: UnitSelection[];
  onUnitSelectionChange: (index: number, selection: any) => void;
  onConfirm: () => void;
  locale: "en" | "ar";
}

const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({
  isOpen,
  onClose,
  product,
  quantity,
  unitSelections,
  onUnitSelectionChange,
  onConfirm,
  locale,
  selectedOptions,
}) => {
  const isAr = locale === "ar";

  // Discount logic matching the reference style
  const getDiscount = (qty: number) => {
    if (qty >= 3) return 0.15;
    if (qty >= 2) return 0.1;
    return 0;
  };

  const discount = getDiscount(quantity);
  const originalPrice = (product.price ?? 0) * quantity;
  const finalPrice = originalPrice * (1 - discount);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="relative p-6 bg-white rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {isAr ? "تحديد خيارات المنتج" : "Select Product Options"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Pricing Info */}
        <div className="mb-8 p-5 rounded-2xl bg-[#f8faf8] border border-[#1a4d2e]/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-gray-500">
                {quantity} {isAr ? "قطع" : "Units"}
              </span>
              {discount > 0 && (
                <span className="rounded-full bg-[#1a4d2e] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                  {isAr ? "خصم الكمية" : "Volume Discount"}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#1a4d2e]">
                {finalPrice.toLocaleString()} 
                <span className="ml-1 text-sm">{isAr ? "ج.م" : "EGP"}</span>
              </span>
              {discount > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  {originalPrice.toLocaleString()} {isAr ? "ج.م" : "EGP"}
                </span>
              )}
            </div>
          </div>
          <div className="text-[10px] font-medium text-gray-400 italic">
            {isAr ? "اشترِ أكثر - وفّر أكثر!" : "Buy More - Save More!"}
          </div>
        </div>

        {/* Variant Rows */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {Array.from({ length: quantity }).map((_, idx) => (
            <div 
              key={idx} 
              className="group flex flex-col gap-4 p-5 rounded-2xl border border-gray-100 bg-white transition-all hover:border-gray-200 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1a4d2e] text-[10px] font-bold text-white">
                  {idx + 1}
                </div>
                <span className="text-sm font-black text-gray-900">
                  {isAr ? `القطعة رقم ${idx + 1}` : `Unit #${idx + 1}`}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedOptions.map((opt, optIdx) => {
                  const label = isAr ? opt.label.ar : opt.label.en;
                  const key = opt.label.en;
                  
                  return (
                    <div key={optIdx} className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-1">
                        {label}
                      </label>
                      <div className="relative">
                        <select
                          value={(unitSelections[idx] as any)?.[key] || ""}
                          onChange={(e) => {
                            const newSelection = { ...unitSelections[idx], [key]: e.target.value };
                            onUnitSelectionChange(idx, newSelection);
                          }}
                          className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-700 focus:border-[#1a4d2e] focus:ring-4 focus:ring-[#1a4d2e]/5 focus:outline-none transition-all cursor-pointer"
                        >
                          <option value="" disabled>{isAr ? `اختر ${label}` : `Select ${label}`}</option>
                          {opt.values.map((val) => (
                            <option key={val.name} value={val.name}>
                              {val.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none group-hover:text-[#1a4d2e] transition-colors" />
                      </div>
                    </div>
                  );
                })}
                {selectedOptions.length === 0 && (
                  <div className="col-span-2 py-4 text-center text-xs text-gray-400 italic">
                    {isAr ? "لا توجد خيارات متاحة" : "No options available"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={onConfirm}
            className="w-full rounded-2xl bg-[#1a4d2e] py-4 text-sm font-black text-white shadow-xl shadow-[#1a4d2e]/20 transition-all hover:scale-[1.02] hover:bg-[#153d24] active:scale-95 flex items-center justify-center gap-2"
          >
            <Check className="h-5 w-5 stroke-[3px]" />
            {isAr ? "تأكيد وإضافة للسلة" : "Confirm & Add to Cart"}
          </button>
        </div>

        {/* Decorative corner */}
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#1a4d2e]/5 blur-3xl pointer-events-none" />
      </div>
    </Modal>
  );
};

export default VariantSelectionModal;
