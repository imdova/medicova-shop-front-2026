import { Country } from "@/types";
import { LanguageType } from "@/util/translations";
import { Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

export const CountryDropdown: React.FC<{
  options: Country[];
  selected: string;
  onSelect: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
  locale?: LanguageType;
}> = ({ options, selected, onSelect, className, locale: propsLocale }) => {
  const contextLocale = useLocale() as LanguageType;
  const locale = propsLocale || contextLocale;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const t = useTranslations("common");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.name?.[locale]?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [options, searchTerm, locale]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === selected);
  console.log(selectedOption?.code.toLowerCase());
  return (
    <div ref={dropdownRef} className="relative inline-block w-full text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/50 px-4 text-sm font-bold text-gray-900 transition-all hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <Image
            width={20}
            height={20}
            src={`https://flagcdn.com/h20/${selectedOption?.code.toLowerCase()}.png`}
            alt={selectedOption?.name[locale] ?? "country"}
            className="h-4 w-4 rounded-full object-cover"
          />
          <span className="truncate">{selectedOption?.name[locale]}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl ring-1 ring-black/5">
          <div className="border-b border-gray-50 p-2">
            <input
              type="text"
              placeholder={t("searchCountries")}
              className="w-full rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.id}
                  onClick={() => {
                    onSelect(option.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-emerald-50/50 ${
                    option.id === selected ? "bg-emerald-50 text-emerald-700" : "text-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      width={20}
                      height={20}
                      src={`https://flagcdn.com/h20/${option.code.toLowerCase()}.png`}
                      alt={option?.name[locale] ?? "country"}
                      className="h-4 w-4 rounded-full object-cover"
                    />
                    <span className="font-medium">{option.name[locale]}</span>
                  </div>
                  {option.id === selected && (
                    <Check size={14} strokeWidth={3} className="text-emerald-600" />
                  )}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-xs font-medium text-gray-400 text-center">
                {t("noResults") || "No results found"}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
