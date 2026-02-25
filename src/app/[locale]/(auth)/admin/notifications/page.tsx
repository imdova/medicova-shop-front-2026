"use client";

import React, { useState } from "react";
import {
  Bell,
  Globe,
  Mail,
  MessageSquare,
  ShieldCheck,
  Save,
  Info,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import StatusToggle from "@/components/shared/Buttons/StatusToggle";

export default function NotificationsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";

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

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <Bell className="text-blue-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("notifications")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("marketingPreferences")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-blue-500">
              <ShieldCheck size={10} />
              Secure Gateway
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Status: <span className="text-gray-900">Synchronized</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Preferences */}
        <div className="space-y-8 lg:col-span-2">
          {/* Language Selection Card */}
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {t("receiveIn")}
                </h2>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Global Configuration
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 transition-colors group-focus-within:text-primary">
                <Globe size={18} />
              </div>
              <select
                className="focus:border-primary/30 focus:ring-primary/5 h-14 w-full appearance-none rounded-2xl border border-gray-100 bg-gray-50/50 pl-12 pr-4 text-sm font-bold text-gray-700 outline-none transition-all duration-300 focus:bg-white focus:ring-4"
                defaultValue={locale}
              >
                <option value="en">{t("english")}</option>
                <option value="ar">{t("arabic")}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Marketing preferences Grid */}
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
                <Mail size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {t("marketingPreferences")}
                </h2>
                <p className="mt-0.5 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Outbound Communications
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                {
                  id: "email",
                  icon: <Mail size={18} />,
                  color: "text-blue-500 bg-blue-50",
                },
                {
                  id: "sms",
                  icon: <MessageSquare size={18} />,
                  color: "text-emerald-500 bg-emerald-50",
                },
                {
                  id: "whatsapp",
                  icon: <Globe size={18} />,
                  color: "text-indigo-500 bg-indigo-50",
                },
              ].map((channel) => (
                <div
                  key={channel.id}
                  className="hover:border-primary/20 group relative rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${channel.color} transition-transform duration-500 group-hover:scale-110`}
                    >
                      {channel.icon}
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-black uppercase tracking-tight text-gray-900">
                        {t(channel.id)}
                      </p>
                      <p className="text-[10px] font-bold leading-tight text-gray-400">
                        Instant Delivery
                      </p>
                    </div>
                    <StatusToggle
                      onToggle={() =>
                        handlePrefChange(
                          channel.id as keyof typeof marketingPrefs,
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-blue-50 bg-blue-50/30 p-4">
              <div className="mt-0.5 text-blue-500">
                <Info size={16} />
              </div>
              <p className="text-xs font-bold italic leading-relaxed text-blue-700/80">
                {t("infoNote")}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Save */}
        <div className="space-y-8">
          <div className="sticky top-8 rounded-3xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
            <h3 className="mb-6 text-lg font-black uppercase tracking-wider text-gray-900">
              Settings Hub
            </h3>

            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <span className="text-xs font-bold uppercase text-gray-500">
                  Configuration
                </span>
                <span className="text-xs font-black uppercase text-gray-900">
                  Production
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <span className="text-xs font-bold uppercase text-gray-500">
                  API Status
                </span>
                <span className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-600">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 py-3">
                <span className="text-xs font-bold uppercase text-gray-500">
                  Last Updated
                </span>
                <span className="text-xs font-black uppercase text-gray-900">
                  Today
                </span>
              </div>
            </div>

            <button
              onClick={() => alert("Preferences saved successfully")}
              className="shadow-primary/20 group flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-primary text-sm font-black text-white shadow-xl transition-all duration-300 hover:brightness-110 active:scale-95"
            >
              <Save
                size={18}
                className="transition-transform group-hover:scale-110"
              />
              {t("savePreferences")}
            </button>

            <p className="mt-6 text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Changes take effect instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
