"use client";
import { useTranslations } from "next-intl";
import { LiquidSizeType, NumericSizeType, SizeType } from "@/types";

interface VariantSelectorProps {
  colors?: { en: string[]; ar: string[] };
  sizes?: SizeType[] | NumericSizeType[] | LiquidSizeType[];
  selectedColor?: string;
  selectedSize?: SizeType | NumericSizeType | LiquidSizeType;
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: SizeType | NumericSizeType | LiquidSizeType) => void;
  locale: "en" | "ar";
}

const VariantSelector = ({
  colors,
  sizes,
  selectedColor,
  selectedSize,
  onColorSelect,
  onSizeSelect,
  locale,
}: VariantSelectorProps) => {
  const t = useTranslations("product");
  return (
    <div className="mt-6 space-y-5">
      {/* Colors */}
      {colors && (
        <fieldset className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <legend className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            {t("colorGuide")}
          </legend>
          <div className="mt-4 flex flex-wrap gap-3" role="radiogroup">
            {colors.en.map((color, index) => {
              const isActive = selectedColor === color;
              return (
                <button
                  key={index}
                  type="button"
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSelect(color)}
                  aria-pressed={isActive}
                  aria-label={`${t("colorGuide")}: ${color}`}
                  className={`group relative h-10 w-10 rounded-full border-2 shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 ${
                    isActive
                      ? "ring-primary/20 border-primary ring-4"
                      : "hover:border-primary/50 border-white ring-1 ring-gray-200"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          color.toLowerCase() === "white"
                            ? "bg-gray-800"
                            : "bg-white"
                        } shadow-sm`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Sizes */}
      {sizes && (
        <fieldset className="animate-in fade-in slide-in-from-bottom-2 delay-100 duration-500">
          <legend className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            {t("sizeGuide")}
          </legend>
          <div className="mt-4 flex flex-wrap gap-3" role="radiogroup">
            {sizes.map((size, index) => {
              const isActive = selectedSize === size;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSizeSelect(size)}
                  aria-pressed={isActive}
                  className={`min-w-[56px] rounded-xl border-2 px-6 py-2.5 text-xs font-bold tracking-wider transition-all duration-300 hover:shadow-md active:scale-95 ${
                    isActive
                      ? "bg-primary/5 border-primary text-primary shadow-inner"
                      : "hover:border-primary/30 border-gray-100 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
};

export default VariantSelector;
