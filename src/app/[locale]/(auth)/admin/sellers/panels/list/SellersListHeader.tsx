import React from "react";
import { List } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageType } from "@/util/translations";

interface Props {
  filteredCount: number;
  locale: LanguageType;
}

export const SellersListHeader = ({ filteredCount, locale }: Props) => {
  const t = useTranslations("admin");

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400 shadow-inner">
          <List size={28} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{t("allSellers")}</h3>
          <p className="text-xs font-bold text-gray-400">
            {t("sellersFound", { count: filteredCount })}
          </p>
        </div>
      </div>

      <div className="flex h-14 items-center gap-4 rounded-[1.25rem] border border-white/60 bg-emerald-50 px-6 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#31533A]">
          {filteredCount} {t("sellers")}{" "}
          {locale === "ar" ? "تم العثور عليهم" : "Total Found"}
        </p>
      </div>
    </div>
  );
};
