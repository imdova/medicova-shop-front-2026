import { useState } from "react";
import { useLocale } from "next-intl";
import { FormLabel } from "@/components/shared/form";
import { Button } from "@/components/shared/button";
import TextEditor from "@/components/forms/CustomTextEditor";
import { Textarea } from "@/components/shared/textarea";
import { Input } from "@/components/shared/input";

// ---------------- Types ----------------
type BilingualText = {
  en: string;
  ar: string;
};

// ---------------- Bilingual Text Editor Component ----------------
export function BilingualTextEditor({
  value = { en: "", ar: "" },
  onChange,
  required = false,
  forPage = false,
}: {
  value?: BilingualText;
  onChange: (value: BilingualText) => void;
  required?: boolean;
  forPage?: boolean;
}) {
  const locale = useLocale() as "en" | "ar";
  const [activeLang, setActiveLang] = useState<"en" | "ar">(locale);

  const t = {
    en: {
      english: "English",
      arabic: "Arabic",
      switch_language: "Switch language",
      content_english: "Content (English)",
      content_arabic: "Content (Arabic)",
    },
    ar: {
      english: "الإنجليزية",
      arabic: "العربية",
      switch_language: "تبديل اللغة",
      content_english: "المحتوى (الإنجليزية)",
      content_arabic: "المحتوى (العربية)",
    },
  }[locale];

  const handleValueChange = (lang: "en" | "ar", newValue: string) => {
    onChange({
      ...value,
      [lang]: newValue,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base font-medium">
          {activeLang === "en" ? t.content_english : t.content_arabic}
          {required && "*"}
        </FormLabel>
        <div className="flex rounded-lg border border-gray-200 p-1">
          <Button
            type="button"
            variant={activeLang === "en" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setActiveLang("en")}
          >
            EN
          </Button>
          <Button
            type="button"
            variant={activeLang === "ar" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setActiveLang("ar")}
          >
            AR
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <TextEditor
          value={value[activeLang] || ""}
          onChange={(content) => handleValueChange(activeLang, content)}
          language={activeLang}
          forPage={forPage}
        />
      </div>

      <div className="flex gap-2 text-xs text-gray-500">
        <span className={`${value.en ? "text-green-600" : ""}`}>
          EN: {value.en ? "✓" : "✗"}
        </span>
        <span className={`${value.ar ? "text-green-600" : ""}`}>
          AR: {value.ar ? "✓" : "✗"}
        </span>
      </div>
    </div>
  );
}

// ---------------- Bilingual Input Component ----------------
export function BilingualInput({
  value = { en: "", ar: "" },
  onChange,
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  value?: BilingualText;
  onChange: (value: BilingualText) => void;
  label: string;
  placeholder?: { en: string; ar: string };
  type?: "text" | "textarea";
  required?: boolean;
}) {
  const locale = useLocale() as "en" | "ar";
  const [activeLang, setActiveLang] = useState<"en" | "ar">(locale);

  const handleValueChange = (lang: "en" | "ar", newValue: string) => {
    onChange({
      ...value,
      [lang]: newValue,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <FormLabel className="text-base font-medium">
          {label} {required && "*"}
        </FormLabel>
        <div className="flex rounded-lg border border-gray-200 p-1">
          <Button
            type="button"
            variant={activeLang === "en" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setActiveLang("en")}
          >
            EN
          </Button>
          <Button
            type="button"
            variant={activeLang === "ar" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setActiveLang("ar")}
          >
            AR
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {type === "textarea" ? (
          <Textarea
            value={value[activeLang] || ""}
            onChange={(e) => handleValueChange(activeLang, e.target.value)}
            placeholder={placeholder?.[activeLang]}
            rows={4}
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
        ) : (
          <Input
            value={value[activeLang] || ""}
            onChange={(e) => handleValueChange(activeLang, e.target.value)}
            placeholder={placeholder?.[activeLang]}
            dir={activeLang === "ar" ? "rtl" : "ltr"}
          />
        )}
      </div>

      <div className="flex gap-2 text-xs text-gray-500">
        <span className={`${value.en ? "text-green-600" : ""}`}>
          EN: {value.en ? "✓" : "✗"}
        </span>
        <span className={`${value.ar ? "text-green-600" : ""}`}>
          AR: {value.ar ? "✓" : "✗"}
        </span>
      </div>
    </div>
  );
}
