"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";

interface BrandHeaderProps {
  onCreateClick: () => void;
}

export const BrandHeader = ({ onCreateClick }: BrandHeaderProps) => {
  const t = useTranslations("seller_brand_management");

  return (
    <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">
          {t("title")}
        </h1>
        <p className="text-sm font-medium text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="flex items-center gap-3">
        <DynamicButton
          variant="primary"
          onClick={onCreateClick}
          label={t("createBrand")}
          style={{ backgroundColor: "lab(58.4941% -47.8529 35.5714)" }}
          icon={<Plus size={18} strokeWidth={3} />}
          className="rounded-xl px-8 py-3.5 font-bold text-white shadow-lg shadow-emerald-200/50 transition-all hover:scale-[1.02] active:scale-[0.98] md:px-10"
        />
      </div>
    </header>
  );
};
