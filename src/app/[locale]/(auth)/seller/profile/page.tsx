"use client";

import React, { useState, useEffect } from "react";
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
import { getMyProfile } from "@/services/userService";

const ProfilePage = () => {
  const t = useTranslations("seller_profile");
  const locale = useAppLocale();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [sellerData, setSellerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = (session as any)?.accessToken;

  useEffect(() => {
    async function fetchProfile() {
      if (!token) return;
      try {
        setLoading(true);
        const data = await getMyProfile(token);
        setSellerData(data);
      } catch (err) {
        console.error("Failed to fetch seller profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  const tabs = [
    { id: "profile", label: t("tabs.profile"), icon: <User size={18} /> },
    {
      id: "verification",
      label: t("tabs.verification"),
      icon: <ShieldCheck size={18} />,
    },
    { id: "settings", label: t("tabs.settings"), icon: <Settings size={18} /> },
  ];

  if (status === "loading" || (loading && token)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-green-600" />
      </div>
    );
  }

  const user = {
    name: sellerData?.fullName || sellerData?.name || session?.user?.name || "",
    email: sellerData?.email || session?.user?.email || "",
    image: session?.user?.image,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-6xl pb-20"
    >
      <ProfileHeader user={user} />

      {/* Compact Tab System */}
      <div className="mb-8 flex w-fit gap-1 rounded-2xl border border-gray-100 bg-gray-50/50 p-1.5 shadow-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 rounded-xl px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                isActive
                  ? "text-white shadow-lg shadow-emerald-500/20"
                  : "text-gray-400 hover:bg-white hover:text-gray-900"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-emerald-600"
                  transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
                />
              )}
              <span className="relative z-10">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "profile" && (
              <ProfileForm initialData={sellerData} locale={locale} />
            )}
            {activeTab === "verification" && <VerificationCenter />}
            {activeTab === "settings" && <AccountSettings sellerData={sellerData} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
