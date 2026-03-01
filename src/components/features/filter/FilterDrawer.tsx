"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Drawer } from "@/components/layouts/Drawer";
import DynamicCheckbox from "@/components/shared/DynamicCheckbox";
import { FilterDrawerGroup } from "@/types";
import { useLocale, useTranslations } from "next-intl";
import { LanguageType } from "@/util/translations";
import { LocalizedTitle } from "@/types/language";

export const Filters = ({
  isOpen,
  onClose,
  filtersData,
  locale: propsLocale,
}: {
  isOpen: boolean;
  onClose: () => void;
  filtersData: FilterDrawerGroup[];
  locale?: LanguageType;
}) => {
  const contextLocale = useLocale() as LanguageType;
  const locale = propsLocale || contextLocale;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterDrawerGroup[]>(filtersData);

  const isRTL = locale === "ar";

  const t = useTranslations("filter");
  const tCommon = useTranslations("common");

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    setFilters((prevFilters) =>
      prevFilters.map((group) => ({
        ...group,
        options: group.options.map((option) => ({
          ...option,
          selected: params.getAll(group.id).includes(option.id),
        })),
      })),
    );
  }, [searchParams]);

  const toggleGroup = (groupId: string) => {
    setFilters((prevFilters) =>
      prevFilters.map((group) =>
        group.id === groupId
          ? { ...group, collapsed: !group.collapsed }
          : group,
      ),
    );
  };

  const toggleOption = (groupId: string, optionId: string) => {
    const params = new URLSearchParams(searchParams);
    const group = filters.find((g) => g.id === groupId);

    if (group?.isSingleSelect) {
      params.delete(groupId);
      params.append(groupId, optionId);
    } else {
      const currentValues = params.getAll(groupId);
      if (currentValues.includes(optionId)) {
        params.delete(groupId);
        currentValues
          .filter((id) => id !== optionId)
          .forEach((id) => params.append(groupId, id));
      } else {
        params.append(groupId, optionId);
      }
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.replace(pathname, { scroll: false });
  };

  return (
    <Drawer
      hiddenCloseBtn
      mobile={false}
      isOpen={isOpen}
      onClose={onClose}
      width="w-[400px]"
      position={isRTL ? "left" : "right"}
    >
      <div className="flex h-full flex-col bg-slate-50/30 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white bg-white/40 p-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900">
              {t("allFilters")}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#B39371]">
              {t("refine")}
            </p>
          </div>
          <button
            onClick={clearAllFilters}
            className="flex h-10 items-center justify-center rounded-xl bg-rose-50 px-4 text-[10px] font-black uppercase tracking-wider text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
          >
            {t("clearAll")}
          </button>
        </div>

        {/* Content */}
        <div className="no-scrollbar flex-1 space-y-8 overflow-y-auto p-8">
          {filters.map((group) => (
            <div key={group.id} className="space-y-4">
              <button
                className="group flex w-full items-center justify-between"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex flex-col items-start">
                  <span className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 transition-colors group-hover:text-gray-600">
                    {group.label[locale as keyof typeof group.label]}
                  </span>
                </div>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/50 text-gray-400 shadow-sm ring-1 ring-black/5 transition-transform duration-300 ${group.collapsed ? "" : "rotate-180"}`}
                >
                  <ChevronDown size={14} />
                </div>
              </button>

              {!group.collapsed && (
                <div className="animate-in fade-in slide-in-from-top-2 grid grid-cols-1 gap-2 pt-2 duration-300">
                  {group.options.map((option) => {
                    const isSelected = searchParams
                      .getAll(group.id)
                      .includes(option.id);
                    return (
                      <button
                        key={option.id}
                        onClick={() => toggleOption(group.id, option.id)}
                        className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-300 ${
                          isSelected
                            ? "border-[#31533A]/20 bg-[#31533A] text-white shadow-lg shadow-emerald-900/10"
                            : "border-slate-100 bg-white/50 text-gray-600 hover:border-[#31533A]/20 hover:bg-white hover:text-gray-900 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <DynamicCheckbox
                            label=""
                            checked={isSelected}
                            onChange={() => {}} // Controlled by button parent
                          />
                          <span
                            className={`text-xs font-bold ${isSelected ? "text-white" : "text-gray-700"}`}
                          >
                            {option.label[locale as keyof typeof option.label]}
                          </span>
                        </div>
                        {option.count !== undefined && (
                          <div
                            className={`flex h-6 min-w-[24px] items-center justify-center rounded-lg px-2 text-[10px] font-black ${
                              isSelected
                                ? "bg-white/20 text-white"
                                : "bg-slate-100 text-gray-400"
                            }`}
                          >
                            {option.count}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white bg-white/60 p-8 backdrop-blur-md">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="h-14 flex-1 rounded-2xl border border-slate-100 bg-white text-xs font-black uppercase tracking-widest text-gray-600 transition-all hover:bg-rose-50 hover:text-rose-500 hover:shadow-md"
            >
              {tCommon("cancel")}
            </button>
            <button
              onClick={onClose}
              className="h-14 flex-[2] rounded-2xl bg-[#31533A] text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.02] hover:bg-[#26412d] active:scale-[0.98]"
            >
              {t("applyFilters")}
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  );
};
