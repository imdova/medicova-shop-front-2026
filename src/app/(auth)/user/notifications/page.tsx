"use client";
import StatusToggle from "@/components/UI/Buttons/StatusToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import React, { useState } from "react";

const translations = {
  notifications: { en: "Notifications", ar: "الإشعارات" },
  receiveIn: { en: "Receive Communications In", ar: "تلقي الرسائل بـ" },
  language: { en: "Language", ar: "اللغة" },
  english: { en: "English", ar: "الإنجليزية" },
  arabic: { en: "Arabic", ar: "العربية" },
  marketingPreferences: { en: "Marketing Preferences", ar: "تفضيلات التسويق" },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  sms: { en: "SMS", ar: "رسائل قصيرة" },
  whatsapp: { en: "WhatsApp", ar: "واتساب" },
  infoNote: {
    en: "Opting out halts promotional messages, but you'll still receive important service updates.",
    ar: "إلغاء الاشتراك يوقف الرسائل الترويجية، لكنك ستظل تتلقى التحديثات الهامة.",
  },
  save: { en: "Save Preferences", ar: "حفظ التفضيلات" },
};

const NotificationsPage = () => {
  const { language: locale } = useLanguage();
  const [marketingPrefs, setMarketingPrefs] = useState({
    email: false,
    sms: true,
    whatsapp: true,
  });

  const handlePrefChange = (channel: keyof typeof marketingPrefs) => {
    setMarketingPrefs({
      ...marketingPrefs,
      [channel]: !marketingPrefs[channel],
    });
  };

  const t = (key: keyof typeof translations) => translations[key][locale];

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-700">
          {t("notifications")}
        </h1>
      </div>

      {/* Language Selection */}
      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          {t("receiveIn")}
        </h2>

        <div className="flex items-center gap-3">
          <label
            htmlFor="language"
            className="mr-3 block text-sm font-medium text-gray-700"
          >
            {t("language")}
          </label>
          <div className="relative">
            <select
              id="language"
              className="appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:outline-none"
            >
              <option value="en">{t("english")}</option>
              <option value="ar">{t("arabic")}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Marketing Preferences */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          {t("marketingPreferences")}
        </h2>

        <div className="flex flex-col items-center gap-3 md:flex-col lg:flex-row xl:flex-row">
          {(["email", "sms", "whatsapp"] as const).map((channel) => (
            <div
              key={channel}
              className="flex w-full items-center justify-between rounded-md border border-gray-300 p-3"
            >
              <span className="text-sm font-medium text-gray-700">
                {t(channel)}
              </span>

              <StatusToggle onToggle={() => handlePrefChange(channel)} />
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-md border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs text-gray-600">{t("infoNote")}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => alert("Preferences saved successfully")}
            className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-green-700"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
