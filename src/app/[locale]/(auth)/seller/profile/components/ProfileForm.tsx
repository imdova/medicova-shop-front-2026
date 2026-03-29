"use client";

import { useForm, Controller, FormProvider } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useState, useCallback, useEffect } from "react";
import { LanguageType } from "@/util/translations";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  ImageIcon,
  X,
  MapPin,
  Phone as PhoneIcon,
  Mail,
  User as UserIcon,
  Globe,
} from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import { CountryDropdown } from "@/components/features/CountryDropdown";
import PhoneInput from "@/components/forms/Forms/formFields/PhoneInput";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";
import { updateSellerProfile } from "@/services/userService";

const DEFAULT_COUNTRIES = [
  { id: "EG", code: "eg", name: { en: "Egypt", ar: "مصر" } },
  { id: "SA", code: "sa", name: { en: "Saudi Arabia", ar: "السعودية" } },
  {
    id: "AE",
    code: "ae",
    name: { en: "United Arab Emirates", ar: "الإمارات" },
  },
];

interface ProfileFormProps {
  initialData: any;
  locale: LanguageType;
}

export const ProfileForm = ({ initialData, locale }: ProfileFormProps) => {
  const t = useTranslations("seller_profile.personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.image || null,
  );
  const [isDragging, setIsDragging] = useState(false);
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const methods = useForm({
    defaultValues: {
      fullName: initialData?.fullName || initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      country: initialData?.country || "EG",
      state: initialData?.state || "",
      city: initialData?.city || "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (initialData) {
      reset({
      fullName: initialData?.fullName || initialData?.name || session?.user?.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        country: initialData.country || "EG",
        state: initialData.state || "",
        city: initialData.city || "",
      });
      if (initialData.image) setPreviewImage(initialData.image);
    }
  }, [initialData, reset]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewImage(url);
      }
    },
    [],
  );

  const onSubmit = async (data: any) => {
    if (!token) return;
    try {
      setIsSubmitting(true);
      await updateSellerProfile({
        fullName: data.fullName,
        phone: data.phone,
        country: data.country,
        state: data.state,
        city: data.city,
      }, token);
      
      toast.success(locale === "ar" ? "تم تحديث الملف الشخصي بنجاح" : "Profile updated successfully");
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (err: any) {
      toast.error(err.message || (locale === "ar" ? "حدث خطأ ما" : "An error occurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-black tracking-tight text-gray-900">
          {t("title")}
        </h2>
        <p className="text-[13px] font-medium text-gray-500">
          {t("subtitle")}
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
              <div className="group relative">
                <label
                  className={`relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 transition-all hover:border-emerald-500 ${isDragging ? "border-emerald-500" : ""}`}
                >
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-gray-400">
                      <ImageIcon size={24} />
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {t("image")}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-600/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <UploadCloud className="text-white" size={24} />
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                {previewImage && (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="absolute -right-2 -top-2 rounded-lg bg-red-500 p-1.5 text-white transition-all hover:bg-red-600 active:scale-90"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                )}
              </div>

              <div className="w-full flex-1 space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                      {t("fullName")}
                    </Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        {...register("fullName", { required: true })}
                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50 pl-10 text-sm font-bold transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                      {t("email")}
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
                      <Input
                        {...register("email")}
                        disabled
                        className="h-11 rounded-xl border-gray-100 bg-gray-100/30 pl-10 text-sm font-bold text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                      {t("phone")}
                    </Label>
                    <PhoneInput name="phone" required locale={locale} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                      {t("country")}
                    </Label>
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => (
                        <CountryDropdown
                          options={DEFAULT_COUNTRIES}
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={locale}
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                      {t("state")}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        {...register("state")}
                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50 pl-10 text-sm font-bold transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                      {t("city")}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        {...register("city")}
                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50 pl-10 text-sm font-bold transition-all focus:bg-white focus:ring-2 focus:ring-emerald-500/10"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
                  <DynamicButton
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    label={isSubmitting ? (locale === "ar" ? "جاري الحفظ..." : "Saving...") : (locale === "ar" ? "حفظ التغييرات" : "Save Changes")}
                    className="h-10 rounded-xl bg-emerald-600 px-8 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-700 active:scale-95 shadow-lg shadow-emerald-500/20"
                  />
                </div>
              </div>
            </div>
          </section>
        </form>
      </FormProvider>
    </div>
  );
};
