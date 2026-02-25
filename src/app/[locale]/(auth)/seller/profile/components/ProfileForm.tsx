"use client";

import { useForm, Controller, FormProvider } from "react-hook-form";
import { useTranslations } from "next-intl";
import { useState, useCallback } from "react";
import { LanguageType } from "@/util/translations";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  ImageIcon,
  X,
  MapPin,
  Phone as PhoneIcon,
  Mail,
} from "lucide-react";
import Image from "next/image";

import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import { CountryDropdown } from "@/components/features/CountryDropdown";
import PhoneInput from "@/components/forms/Forms/formFields/PhoneInput";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";

const DEFAULT_COUNTRIES = [
  { id: "SA", code: "sa", name: { en: "Saudi Arabia", ar: "السعودية" } },
  {
    id: "AE",
    code: "ae",
    name: { en: "United Arab Emirates", ar: "الإمارات" },
  },
  { id: "EG", code: "eg", name: { en: "Egypt", ar: "مصر" } },
];

interface ProfileFormProps {
  initialData: any;
  locale: LanguageType;
}

export const ProfileForm = ({ initialData, locale }: ProfileFormProps) => {
  const t = useTranslations("seller_profile.personal");
  const [isSaving, setIsSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData.image || null,
  );
  const [isDragging, setIsDragging] = useState(false);

  const methods = useForm({
    defaultValues: {
      fullName: initialData.name || "",
      email: initialData.email || "",
      phone: initialData.phone || "",
      country: initialData.country || "",
      state: initialData.state || "",
      city: initialData.city || "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

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
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    console.log("Profile updated:", data);
    setIsSaving(false);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <section className="rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
          <div className="mb-8 space-y-1 text-center sm:text-left">
            <h2 className="text-xl font-black tracking-tight text-gray-900">
              {t("title")}
            </h2>
            <p className="text-sm font-medium text-gray-500">{t("subtitle")}</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-start lg:gap-12">
            {/* Avatar Upload */}
            <div className="group relative">
              <label
                className={`relative flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-[3rem] border-4 border-white bg-gray-50 shadow-2xl transition-all hover:scale-[1.02] ${isDragging ? "ring-primary/20 ring-4" : ""}`}
              >
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <ImageIcon size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {t("image")}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <UploadCloud className="text-white" size={32} />
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
                  className="absolute -right-2 -top-2 rounded-2xl bg-rose-500 p-2 text-white shadow-xl shadow-rose-500/20 transition-all hover:bg-rose-600 active:scale-90"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              )}
            </div>

            {/* Form Fields */}
            <div className="w-full flex-1 space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase leading-none tracking-widest text-gray-400">
                    {t("fullName")}
                  </Label>
                  <Input
                    {...register("fullName", { required: true })}
                    className="focus:ring-primary/10 rounded-2xl border-gray-100 bg-gray-50/50 p-6 font-bold transition-all focus:bg-white focus:ring-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase leading-none tracking-widest text-gray-400">
                    {t("email")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      {...register("email")}
                      disabled
                      className="rounded-2xl border-gray-100 bg-gray-100/50 p-6 pl-12 font-bold text-gray-400"
                    />
                  </div>
                  <p className="text-[10px] font-bold italic text-gray-400">
                    {t("emailHint")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase leading-none tracking-widest text-gray-400">
                    {t("phone")}
                  </Label>
                  <PhoneInput name="phone" required locale={locale} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase leading-none tracking-widest text-gray-400">
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
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase leading-none tracking-widest text-gray-400">
                    {t("state")}
                  </Label>
                  <Input
                    {...register("state")}
                    className="focus:ring-primary/10 rounded-2xl border-gray-100 bg-gray-50/50 p-6 font-bold transition-all focus:bg-white focus:ring-4"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase leading-none tracking-widest text-gray-400">
                    {t("city")}
                  </Label>
                  <Input
                    {...register("city")}
                    className="focus:ring-primary/10 rounded-2xl border-gray-100 bg-gray-50/50 p-6 font-bold transition-all focus:bg-white focus:ring-4"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end border-t border-gray-100 pt-8">
            <DynamicButton
              variant="primary"
              type="submit"
              disabled={isSaving}
              label={isSaving ? "Saving..." : t("save")}
              className="rounded-2xl bg-gray-900 px-10 py-4 font-black uppercase tracking-widest text-white shadow-xl shadow-black/10 transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98]"
            />
          </div>
        </section>
      </form>
    </FormProvider>
  );
};
