"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useAppLocale } from "@/hooks/useAppLocale";
import { getMyProfile, updateMyProfile } from "@/services/userService";
import { User, Mail, Phone, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const translations = {
  title: { en: "Profile Settings", ar: "إعدادات الملف الشخصي" },
  personalInfo: { en: "Personal Information", ar: "المعلومات الشخصية" },
  firstName: { en: "First Name", ar: "الاسم الأول" },
  lastName: { en: "Last Name", ar: "اسم العائلة" },
  email: { en: "Email Address", ar: "البريد الإلكتروني" },
  phone: { en: "Phone Number", ar: "رقم الهاتف" },
  saveProfile: { en: "Update Profile", ar: "تحديث الملف الشخصي" },
  required: { en: "is required", ar: "مطلوب" },
  minLength: { en: "Must be at least {n} characters", ar: "يجب أن يكون {n} أحرف على الأقل" },
  successProfile: { en: "Profile updated successfully!", ar: "تم تحديث الملف الشخصي بنجاح!" },
  error: { en: "Something went wrong. Please try again.", ar: "حدث خطأ ما. يرجى المحاولة مرة أخرى." },
};

const ProfilePage: React.FC = () => {
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const { data: session, update } = useSession();
  const token = (session as any)?.accessToken;

  const [loading, setLoading] = useState(true);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>();

  useEffect(() => {
    async function loadProfile() {
      if (!token) return;
      try {
        setLoading(true);
        const user = await getMyProfile(token);
        resetProfile({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      } catch (err) {
        console.error("Load profile failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [token, resetProfile]);

  const onUpdateProfile = async (data: ProfileFormData) => {
    if (!token) return;
    try {
      setUpdatingProfile(true);
      await updateMyProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      }, token);
      
      // Update the local session to reflect the new name in the header
      await update({
        ...session,
        user: {
          ...session?.user,
          name: `${data.firstName} ${data.lastName}`,
        }
      });

      // Dispatch a custom event to notify components that the profile has updated
      window.dispatchEvent(new Event("profileUpdated"));

      toast.success(translations.successProfile[locale]);
    } catch (err: any) {
      toast.error(err.message || translations.error[locale]);
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20 pt-4" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {translations.title[locale]}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-1">
        <div className="animate-in fade-in slide-in-from-bottom-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm duration-500">
          <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-bold text-slate-800">{translations.personalInfo[locale]}</h2>
            </div>
          </div>
          
          <form className="p-6 md:p-8" onSubmit={handleSubmitProfile(onUpdateProfile)}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  {translations.firstName[locale]}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    {...registerProfile("firstName", { required: true })}
                    className={`h-11 w-full rounded-xl border bg-white ${isAr ? 'pr-4 pl-10' : 'pl-10 pr-4'} text-sm font-medium transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 ${
                      profileErrors.firstName ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  {translations.lastName[locale]}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    {...registerProfile("lastName", { required: true })}
                    className={`h-11 w-full rounded-xl border bg-white ${isAr ? 'pr-4 pl-10' : 'pl-10 pr-4'} text-sm font-medium transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 ${
                      profileErrors.lastName ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  {translations.email[locale]}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    {...registerProfile("email")}
                    disabled
                    className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">
                  {translations.phone[locale]}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    {...registerProfile("phone", { required: true })}
                    className={`h-11 w-full rounded-xl border bg-white ${isAr ? 'pr-4 pl-10' : 'pl-10 pr-4'} text-sm font-medium transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 ${
                      profileErrors.phone ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                disabled={updatingProfile}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 px-8 text-sm font-extrabold text-white shadow-lg shadow-green-600/20 transition hover:bg-green-700 disabled:opacity-50"
              >
                {updatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {translations.saveProfile[locale]}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
