"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { User, Store, ShieldCheck, Settings, Loader2 } from "lucide-react";

import { useAppLocale } from "@/hooks/useAppLocale";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileForm } from "./components/ProfileForm";
import { StoreManagement } from "./components/StoreManagement";
import { AccountSettings } from "./components/AccountSettings";
import { VerificationCenter } from "./components/VerificationCenter";

const ProfilePage = () => {
  const t = useTranslations("seller_profile");
  const locale = useAppLocale();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: t("tabs.profile"), icon: <User size={18} /> },
    { id: "stores", label: t("tabs.stores"), icon: <Store size={18} /> },
    {
      id: "verification",
      label: t("tabs.verification"),
      icon: <ShieldCheck size={18} />,
    },
    { id: "settings", label: t("tabs.settings"), icon: <Settings size={18} /> },
  ];

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" size={48} />
      </div>
    );
  }

  const user = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    image: session?.user?.image,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-6xl pb-20"
    >
      <ProfileHeader user={user} />

      {/* Premium Tab System */}
      <div className="mb-10 flex flex-wrap gap-2 rounded-[2rem] border border-white/60 bg-white/50 p-2 shadow-xl shadow-gray-200/40 backdrop-blur-2xl">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest transition-all ${
                isActive
                  ? "text-white"
                  : "text-gray-400 hover:bg-white/50 hover:text-gray-900"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-2xl bg-gray-900 shadow-xl shadow-black/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {activeTab === "profile" && (
          <ProfileForm initialData={user} locale={locale} />
        )}
        {activeTab === "stores" && <StoreManagement />}
        {activeTab === "verification" && <VerificationCenter />}
        {activeTab === "settings" && <AccountSettings />}
      </motion.div>
    </motion.div>
  );
};

export default ProfilePage;
