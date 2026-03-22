"use client";
import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Product } from "@/types/product";
import { LiquidSizeType, NumericSizeType, SizeType } from "@/types";

interface UnitSelection {
  size?: SizeType | NumericSizeType | LiquidSizeType;
  color?: string;
}

interface VolumeDiscountSelectorProps {
  product: Product;
  selectedVolume: number;
  unitSelections: UnitSelection[];
  onVolumeChange: (volume: number) => void;
  onUnitSelectionChange: (index: number, selection: UnitSelection) => void;
  locale: "en" | "ar";
}

const VolumeDiscountSelector: React.FC<VolumeDiscountSelectorProps> = ({
  product,
  selectedVolume,
  unitSelections,
  onVolumeChange,
  onUnitSelectionChange,
  locale,
}) => {
  const isAr = locale === "ar";
  
  const options = [
    { units: 1, label: isAr ? "1 وحدة" : "1 Unit", discount: 0 },
    { units: 2, label: isAr ? "2 وحدة" : "2 Units", discount: 0.1 }, // 10% off
    { units: 3, label: isAr ? "3 وحدة" : "3 Units", discount: 0.15 }, // 15% off
  ];

  const calculatePrice = (units: number, discount: number) => {
    const basePrice = (product.price ?? 0) * units;
    return basePrice * (1 - discount);
  };

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-[#1a4d2e]">
          {isAr ? "اشترِ أكثر - وفّر أكثر!" : "Buy More - Save More!"}
        </h3>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      </div>

      <div className="grid gap-4">
        {options.map((option) => {
          const isSelected = selectedVolume === option.units;
          const discountedPrice = calculatePrice(option.units, option.discount);
          const originalPrice = (product.price ?? 0) * option.units;

          return (
            <div
              key={option.units}
              onClick={() => onVolumeChange(option.units)}
              className={`relative overflow-hidden rounded-3xl border-2 transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "border-[#1a4d2e] bg-[#f8faf8] shadow-lg scale-[1.02]"
                  : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-md"
              }`}
            >
              <div className="p-5 flex items-start gap-4">
                <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected ? "border-[#1a4d2e] bg-[#1a4d2e]" : "border-gray-300 bg-white"
                }`}>
                  {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3px]" />}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{option.label}</span>
                    {option.discount > 0 && (
                      <span className="rounded-full bg-[#1a4d2e] px-2.5 py-0.5 text-[10px] font-bold text-white uppercase">
                        {isAr ? "سعر موفر" : "Standard price"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#1a4d2e]">
                      {discountedPrice.toLocaleString()} 
                      <span className="ml-1 text-sm">{isAr ? "ج.م" : "EGP"}</span>
                    </span>
                    {option.discount > 0 && (
                      <span className="text-sm text-gray-400 line-through">
                        {originalPrice.toLocaleString()} {isAr ? "ج.م" : "EGP"}
                      </span>
                    )}
                  </div>

                  {/* Individual Item Selectors */}
                  {isSelected && option.units > 0 && (
                    <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2">
                        <span>{isAr ? "المقاس" : "Size"}</span>
                        <span>{isAr ? "اللون" : "Color"}</span>
                      </div>
                      
                      {Array.from({ length: option.units }).map((_, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-gray-400 w-4">{idx + 1}.</span>
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            {/* Size Dropdown */}
                            <div className="relative">
                              <select
                                value={unitSelections[idx]?.size || ""}
                                onChange={(e) => onUnitSelectionChange(idx, { ...unitSelections[idx], size: e.target.value as any })}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium focus:border-[#1a4d2e] focus:outline-none transition-all"
                              >
                                <option value="" disabled>{isAr ? "اختر المقاس" : "Select Size"}</option>
                                {product.sizes?.map((size) => (
                                  <option key={size} value={size}>{size}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                            </div>

                            {/* Color Dropdown */}
                            <div className="relative">
                              <select
                                value={unitSelections[idx]?.color || ""}
                                onChange={(e) => onUnitSelectionChange(idx, { ...unitSelections[idx], color: e.target.value })}
                                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium focus:border-[#1a4d2e] focus:outline-none transition-all"
                              >
                                <option value="" disabled>{isAr ? "اختر اللون" : "Select Color"}</option>
                                {product.colors?.en.map((color) => (
                                  <option key={color} value={color}>{color}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative accent */}
              {isSelected && (
                <div className="absolute top-0 right-0 h-24 w-24 -mr-8 -mt-8 rounded-full bg-[#1a4d2e]/5 blur-2xl" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between px-2 pt-2">
        <span className="text-xs font-medium text-gray-500 italic">
          {isAr ? "لا تفوت العرض!" : "Don't Miss Now"}
        </span>
        <div className="text-right">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            {isAr ? "الإجمالي" : "Total"}
          </span>
          <span className="text-xl font-black text-gray-900">
            {calculatePrice(selectedVolume, options.find(o => o.units === selectedVolume)?.discount || 0).toLocaleString()} 
            <span className="ml-1 text-sm font-bold text-gray-500">{isAr ? "ج.م" : "EGP"}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default VolumeDiscountSelector;
