"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

// Assuming LanguageType is defined as "en" | "ar" from the translation-helper Canvas
type LanguageType = "en" | "ar";

type LanguageContextType = {
  language: LanguageType; // Use LanguageType
  setLanguage: (lang: LanguageType) => void; // Use LanguageType for the parameter
  direction: "rtl" | "ltr";
  isArabic: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize language state with LanguageType, defaulting to "en"
  const [language, setLanguageState] = useState<LanguageType>("en");

  useEffect(() => {
    // Check localStorage for saved language preference
    const savedLanguage =
      typeof window !== "undefined" ? localStorage.getItem("language") : null;
    // Ensure the saved language is a valid LanguageType before setting the state
    if (savedLanguage === "en" || savedLanguage === "ar") {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Function to set the language, ensuring the type is LanguageType
  const setLanguage = (lang: LanguageType) => {
    // Parameter now is LanguageType
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
  };

  const direction = language === "ar" ? "rtl" : "ltr";
  const isArabic = language === "ar";

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, direction, isArabic }}
    >
      <div
        dir={direction}
        className={language === "ar" ? "font-cairo" : "font-sans"}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
