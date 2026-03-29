"use client";

import { useForm, FormProvider } from "react-hook-form";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  KeyRound,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";
import { updateMyPassword, updateSellerRootEmail } from "@/services/userService";
import { useAppLocale } from "@/hooks/useAppLocale";

interface AccountSettingsProps {
  sellerData?: any;
}

export const AccountSettings = ({ sellerData }: AccountSettingsProps) => {
  const t = useTranslations("seller_profile.settings");
  const locale = useAppLocale();
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const passwordMethods = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onPasswordSubmit = async (data: any) => {
    if (!token) return;
    try {
      setIsUpdatingPassword(true);
      await updateMyPassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmPassword
      }, token);
      toast.success(locale === "ar" ? "تم تحديث كلمة المرور بنجاح" : "Password updated successfully");
      passwordMethods.reset();
    } catch (err: any) {
      toast.error(err.message || (locale === "ar" ? "حدث خطأ ما" : "An error occurred"));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-black tracking-tight text-gray-900">
          {t("title")}
        </h2>
        <p className="text-[13px] font-medium text-gray-500">{t("subtitle")}</p>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm ring-1 ring-gray-100/50">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-600 p-2 text-white shadow-lg shadow-emerald-500/20">
            <KeyRound size={18} />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
            {locale === "ar" ? "تغيير كلمة المرور" : "Change Password"}
          </h3>
        </div>

        <FormProvider {...passwordMethods}>
          <form onSubmit={passwordMethods.handleSubmit(onPasswordSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  {locale === "ar" ? "كلمة المرور الحالية" : "Current Password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    {...passwordMethods.register("currentPassword", { required: true })}
                    type="password"
                    className="h-11 rounded-xl border-gray-100 bg-gray-50/50 pl-10 text-sm font-bold transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  {locale === "ar" ? "كلمة المرور الجديدة" : "New Password"}
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    {...passwordMethods.register("newPassword", { required: true })}
                    type="password"
                    className="h-11 rounded-xl border-gray-100 bg-gray-50/50 pl-10 text-sm font-bold transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  {locale === "ar" ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    {...passwordMethods.register("confirmPassword", { required: true })}
                    type="password"
                    className="h-11 rounded-xl border-gray-100 bg-gray-50/50 pl-10 text-sm font-bold transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-gray-50 pt-6">
              <DynamicButton
                variant="primary"
                type="submit"
                disabled={isUpdatingPassword}
                label={isUpdatingPassword ? (locale === "ar" ? "جاري التحديث..." : "Updating...") : (locale === "ar" ? "تحديث كلمة المرور" : "Update Password")}
                className="h-10 rounded-xl bg-emerald-600 px-8 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-500/20"
              />
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
};
