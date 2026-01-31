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
  locale: LanguageType;
};

// Translation dictionary
const translations = {
  en: {
    phoneNumber: "Phone Number",
    searchCountries: "Search countries...",
    phoneRequired: "Phone number is required",
    invalidPhone: "Please enter a valid phone number",
    placeholder: "(201) 555-0124",
  },
  ar: {
    phoneNumber: "رقم الهاتف",
    searchCountries: "ابحث عن الدول...",
    phoneRequired: "رقم الهاتف مطلوب",
    invalidPhone: "الرجاء إدخال رقم هاتف صحيح",
    placeholder: "(201) 555-0124",
  },
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

const PhoneInput: React.FC<PhoneInputProps> = ({
  name,
  required = false,
  defaultValue = "",
  locale = "en",
}) => {
  const { control, setValue, register } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const t = translations[locale];
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
      <label
        htmlFor={name}
        className={`mb-1 block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
      >
        {t.phoneNumber}
      </label>

      <div className="relative flex rounded-md shadow-sm">
        {/* Phone number input */}
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValue}
          rules={{
            required: required ? t.phoneRequired : false,
            pattern: {
              value: /^[\d\s\-()]+$/,
              message: t.invalidPhone,
            },
          }}
          render={({ field, fieldState: { error } }) => (
            <div className="flex-1">
              <div className="flex flex-row-reverse">
                <input
                  {...field}
                  type="tel"
                  className={`block w-full rounded-r-md border border-gray-300 px-3 py-2 text-sm focus:outline-none ${
                    isRTL ? "rounded-l-md rounded-r-none" : ""
                  }`}
                  placeholder={t.placeholder}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                {/* Country code dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    className={`inline-flex h-full items-center justify-center gap-1 text-sm ${locale === "ar" ? "rounded-r-md" : "rounded-l-md"} border border-gray-300 bg-gray-50 px-2 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <Image
                      width={300}
                      height={300}
                      src={`https://flagcdn.com/h20/${selectedCountry.flag.toString()}.png`}
                      alt={selectedCountry.name[locale]}
                      className={`h-4 w-4 rounded-full ${isRTL ? "ml-1" : "mr-1"}`}
                    />
                    <span>{selectedCountry.dialCode}</span>
                    <ChevronDown className={`h-4 w-4 text-gray-700`} />
                  </button>

                  {isOpen && (
                    <div
                      className={`absolute z-10 mt-1 max-h-60 w-64 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg ${
                        isRTL ? "right-0" : "left-0"
                      }`}
                    >
                      <div className="p-2">
                        <input
                          type="text"
                          placeholder={t.searchCountries}
                          className="mb-2 w-full rounded-md border border-gray-300 p-2 outline-none"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          dir={isRTL ? "rtl" : "ltr"}
                        />
                      </div>
                      <ul>
                        {filteredCountries.map((country) => (
                          <li
                            key={country.code}
                            className={`flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100 ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}
                            onClick={() => {
                              setSelectedCountry(country);
                              setIsOpen(false);
                              setSearchTerm("");
                            }}
                          >
                            <Image
                              width={300}
                              height={300}
                              src={`https://flagcdn.com/h20/${country.flag.toString()}.png`}
                              alt={country.name[locale]}
                              className={`h-5 w-5 rounded-full ${isRTL ? "ml-1" : "mr-1"}`}
                            />
                            <span className={isRTL ? "ml-2" : "mr-2"}>
                              {country.dialCode}
                            </span>
                            <span className="text-sm text-gray-600">
                              {country.name[locale]}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              {error && (
                <p className="mt-1 text-sm text-red-600">{error.message}</p>
              )}
            </div>
          )}
        />
        <input
          type="hidden"
          value={selectedCountry.dialCode}
          {...register("phone_code")}
        />
      </div>
    </div>
  );
};

export default PhoneInput;
