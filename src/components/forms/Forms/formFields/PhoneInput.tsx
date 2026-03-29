import { LanguageType } from "@/util/translations";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useFormContext, Controller } from "react-hook-form";

// Type definitions
type Country = {
  code: string;
  name: {
    en: string;
    ar: string;
  };
  dialCode: string;
  flag: string;
};

type PhoneInputProps = {
  name: string;
  required?: boolean;
  defaultValue?: string;
  locale?: LanguageType;
};

// Sample country data with Arabic names
const COUNTRIES: Country[] = [
  // Arab countries
  {
    code: "SA",
    name: { en: "Saudi Arabia", ar: "السعودية" },
    dialCode: "+966",
    flag: "sa",
  },
  {
    code: "AE",
    name: { en: "United Arab Emirates", ar: "الإمارات" },
    dialCode: "+971",
    flag: "ae",
  },
  { code: "EG", name: { en: "Egypt", ar: "مصر" }, dialCode: "+20", flag: "eg" },
  {
    code: "JO",
    name: { en: "Jordan", ar: "الأردن" },
    dialCode: "+962",
    flag: "jo",
  },
  {
    code: "KW",
    name: { en: "Kuwait", ar: "الكويت" },
    dialCode: "+965",
    flag: "kw",
  },
  {
    code: "QA",
    name: { en: "Qatar", ar: "قطر" },
    dialCode: "+974",
    flag: "qa",
  },
  {
    code: "BH",
    name: { en: "Bahrain", ar: "البحرين" },
    dialCode: "+973",
    flag: "bh",
  },
  {
    code: "OM",
    name: { en: "Oman", ar: "عُمان" },
    dialCode: "+968",
    flag: "om",
  },
  {
    code: "DZ",
    name: { en: "Algeria", ar: "الجزائر" },
    dialCode: "+213",
    flag: "dz",
  },
  {
    code: "MA",
    name: { en: "Morocco", ar: "المغرب" },
    dialCode: "+212",
    flag: "ma",
  },
  {
    code: "TN",
    name: { en: "Tunisia", ar: "تونس" },
    dialCode: "+216",
    flag: "tn",
  },
  {
    code: "LB",
    name: { en: "Lebanon", ar: "لبنان" },
    dialCode: "+961",
    flag: "lb",
  },
  {
    code: "IQ",
    name: { en: "Iraq", ar: "العراق" },
    dialCode: "+964",
    flag: "iq",
  },
  {
    code: "SY",
    name: { en: "Syria", ar: "سوريا" },
    dialCode: "+963",
    flag: "sy",
  },
  {
    code: "YE",
    name: { en: "Yemen", ar: "اليمن" },
    dialCode: "+967",
    flag: "ye",
  },
  {
    code: "SD",
    name: { en: "Sudan", ar: "السودان" },
    dialCode: "+249",
    flag: "sd",
  },
  {
    code: "PS",
    name: { en: "Palestine", ar: "فلسطين" },
    dialCode: "+970",
    flag: "ps",
  },

  // Common international countries
  {
    code: "US",
    name: { en: "United States", ar: "الولايات المتحدة" },
    dialCode: "+1",
    flag: "us",
  },
  {
    code: "GB",
    name: { en: "United Kingdom", ar: "المملكة المتحدة" },
    dialCode: "+44",
    flag: "gb",
  },
  {
    code: "CA",
    name: { en: "Canada", ar: "كندا" },
    dialCode: "+1",
    flag: "ca",
  },
  {
    code: "AU",
    name: { en: "Australia", ar: "أستراليا" },
    dialCode: "+61",
    flag: "au",
  },
  {
    code: "FR",
    name: { en: "France", ar: "فرنسا" },
    dialCode: "+33",
    flag: "fr",
  },
  {
    code: "DE",
    name: { en: "Germany", ar: "ألمانيا" },
    dialCode: "+49",
    flag: "de",
  },
  {
    code: "IN",
    name: { en: "India", ar: "الهند" },
    dialCode: "+91",
    flag: "in",
  },
  {
    code: "PK",
    name: { en: "Pakistan", ar: "باكستان" },
    dialCode: "+92",
    flag: "pk",
  },
];

import { useTranslations, useLocale } from "next-intl";

const PhoneInput: React.FC<PhoneInputProps> = ({
  name,
  required = false,
  defaultValue = "",
  locale: propsLocale,
}) => {
  const { control, setValue, register } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    COUNTRIES.find((c) => c.code === "EG") || COUNTRIES[0],
  );
  const t = useTranslations("common");
  const contextLocale = useLocale() as LanguageType;
  const locale = propsLocale || contextLocale;
  const isRTL = locale === "ar";

  useEffect(() => {
    setValue("phone_code", selectedCountry.dialCode);
  }, [selectedCountry, setValue]);

  const [searchTerm, setSearchTerm] = useState("");
  const filteredCountries = useMemo(() => {
    return COUNTRIES.filter(
      (country) =>
        country.name[locale].toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dialCode.includes(searchTerm),
    );
  }, [searchTerm, locale]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full" dir={isRTL ? "rtl" : "ltr"}>
      <div className="relative flex rounded-xl border border-gray-100 bg-gray-50/50 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/10 h-11">
        {/* Country code dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className={`flex h-full items-center justify-center gap-2 px-3 text-sm font-bold text-gray-700 hover:bg-gray-100/50 transition-colors ${
              isRTL ? "border-l border-gray-100 rounded-r-xl" : "border-r border-gray-100 rounded-l-xl"
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <Image
              width={20}
              height={20}
              src={`https://flagcdn.com/h20/${selectedCountry.flag.toString()}.png`}
              alt={selectedCountry.name[locale]}
              className="h-4 w-4 rounded-full object-cover"
            />
            <span className="text-gray-900">{selectedCountry.dialCode}</span>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {isOpen && (
            <div
              className={`absolute z-50 mt-2 max-h-60 w-64 overflow-auto rounded-xl border border-gray-100 bg-white p-2 shadow-xl ${
                isRTL ? "right-0" : "left-0"
              }`}
            >
              <div className="mb-2">
                <input
                  type="text"
                  placeholder={t("searchCountries")}
                  className="w-full rounded-lg border border-gray-100 bg-gray-50/50 p-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  dir={isRTL ? "rtl" : "ltr"}
                />
              </div>
              <ul className="space-y-0.5">
                {filteredCountries.map((country) => (
                  <li
                    key={country.code}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-emerald-50/50 ${
                      country.code === selectedCountry.code ? "bg-emerald-50 text-emerald-700" : "text-gray-600"
                    } ${isRTL ? "flex-row-reverse" : ""}`}
                    onClick={() => {
                      setSelectedCountry(country);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    <Image
                      width={20}
                      height={20}
                      src={`https://flagcdn.com/h20/${country.flag.toString()}.png`}
                      alt={country.name[locale]}
                      className="h-4 w-4 rounded-full object-cover"
                    />
                    <span className="flex-1 font-medium">{country.name[locale]}</span>
                    <span className="text-xs font-bold text-gray-400">{country.dialCode}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Phone number input */}
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          rules={{
            required: required ? t("phoneRequired") : false,
            pattern: {
              value: /^[\d\s\-()]+$/,
              message: t("invalidPhone"),
            },
          }}
          render={({ field }) => (
            <div className="flex-1">
              <input
                {...field}
                type="tel"
                className="h-full w-full bg-transparent px-4 py-2 text-sm font-bold text-gray-900 placeholder:font-medium placeholder:text-gray-300 focus:outline-none"
                placeholder={locale === "ar" ? "10 1234 5678" : "10 1234 5678"}
                dir={isRTL ? "rtl" : "ltr"}
              />
            </div>
          )}
        />
        <input
          type="hidden"
          value={selectedCountry.dialCode}
          {...register("phone_code")}
        />
      </div>
      <Controller
        name={name}
        control={control}
        render={({ fieldState: { error } }) => (
          error ? <p className="mt-1.5 text-[11px] font-bold text-red-500 pl-1">{error.message}</p> : <></>
        )}
      />
    </div>
  );
};

export default PhoneInput;
