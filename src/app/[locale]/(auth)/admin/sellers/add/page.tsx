"use client";

import { useEffect, useState } from "react";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { X, Plus, Store, ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import PhoneInput from "@/components/forms/Forms/formFields/PhoneInput";
import Dropdown from "@/components/shared/DropDownMenu";
import { CountryDropdown } from "@/components/features/CountryDropdown";
import { useTranslations } from "next-intl";
import { City, Country } from "@/types";
import { motion } from "framer-motion";
import { createSellerByAdmin } from "@/services/sellerService";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { uploadImage } from "@/lib/uploadService";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Link } from "@/i18n/navigation";

// Types
type AddSellerFormData = {
  profileImage: FileList | null;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  storeName: string;
  storePhone: string;
  country: string;
  city: string;
  state: string;
  zipCode: string;
  address: string;
  storeLogo: FileList | null;
  password: string;
};

// Constants
const EGYPT_CITIES: City[] = [
  { id: "EG-cairo", code: "cairo", name: { en: "Cairo", ar: "القاهرة" } },
  { id: "EG-alex", code: "alex", name: { en: "Alexandria", ar: "الإسكندرية" } },
  { id: "EG-giza", code: "giza", name: { en: "Giza", ar: "الجيزة" } },
  { id: "EG-mansoura", code: "mansoura", name: { en: "Mansoura", ar: "المنصورة" } },
  { id: "EG-tanta", code: "tanta", name: { en: "Tanta", ar: "طنطا" } },
  { id: "EG-zagazig", code: "zagazig", name: { en: "Zagazig", ar: "الزقازيق" } },
  { id: "EG-ismailia", code: "ismailia", name: { en: "Ismailia", ar: "الإسماعيلية" } },
  { id: "EG-asyut", code: "asyut", name: { en: "Asyut", ar: "أسيوط" } },
  { id: "EG-sohag", code: "sohag", name: { en: "Sohag", ar: "سوهاج" } },
  { id: "EG-luxor", code: "luxor", name: { en: "Luxor", ar: "الأقصر" } },
  { id: "EG-aswan", code: "aswan", name: { en: "Aswan", ar: "أسوان" } },
  { id: "EG-beni_suef", code: "beni_suef", name: { en: "Beni Suef", ar: "بني سويف" } },
  { id: "EG-fayoum", code: "fayoum", name: { en: "Fayoum", ar: "الفيوم" } },
  { id: "EG-kafr_elsheikh", code: "kafr_elsheikh", name: { en: "Kafr El-Sheikh", ar: "كفر الشيخ" } },
  { id: "EG-minya", code: "minya", name: { en: "Minya", ar: "المنيا" } },
  { id: "EG-damietta", code: "damietta", name: { en: "Damietta", ar: "دمياط" } },
  { id: "EG-port_said", code: "port_said", name: { en: "Port Said", ar: "بورسعيد" } },
  { id: "EG-suez", code: "suez", name: { en: "Suez", ar: "السويس" } },
  { id: "EG-red_sea", code: "red_sea", name: { en: "Red Sea", ar: "البحر الأحمر" } },
];

const DEFAULT_COUNTRIES: Country[] = [
  { id: "SA", code: "sa", name: { en: "Saudi Arabia", ar: "السعودية" } },
  { id: "AE", code: "ae", name: { en: "United Arab Emirates", ar: "الإمارات" } },
  { id: "EG", code: "eg", name: { en: "Egypt", ar: "مصر" } },
  { id: "JO", code: "jo", name: { en: "Jordan", ar: "الأردن" } },
  { id: "KW", code: "kw", name: { en: "Kuwait", ar: "الكويت" } },
  { id: "QA", code: "qa", name: { en: "Qatar", ar: "قطر" } },
  { id: "BH", code: "bh", name: { en: "Bahrain", ar: "البحرين" } },
  { id: "OM", code: "om", name: { en: "Oman", ar: "عُمان" } },
  { id: "DZ", code: "dz", name: { en: "Algeria", ar: "الجزائر" } },
  { id: "MA", code: "ma", name: { en: "Morocco", ar: "المغرب" } },
  { id: "TN", code: "tn", name: { en: "Tunisia", ar: "تونس" } },
  { id: "LB", code: "lb", name: { en: "Lebanon", ar: "لبنان" } },
  { id: "IQ", code: "iq", name: { en: "Iraq", ar: "العراق" } },
  { id: "SY", code: "sy", name: { en: "Syria", ar: "سوريا" } },
  { id: "YE", code: "ye", name: { en: "Yemen", ar: "اليمن" } },
  { id: "SD", code: "sd", name: { en: "Sudan", ar: "السودان" } },
  { id: "PS", code: "ps", name: { en: "Palestine", ar: "فلسطين" } },
  { id: "US", code: "us", name: { en: "United States", ar: "الولايات المتحدة" } },
  { id: "GB", code: "gb", name: { en: "United Kingdom", ar: "المملكة المتحدة" } },
  { id: "CA", code: "ca", name: { en: "Canada", ar: "كندا" } },
  { id: "AU", code: "au", name: { en: "Australia", ar: "أستراليا" } },
  { id: "IN", code: "in", name: { en: "India", ar: "الهند" } },
  { id: "JP", code: "jp", name: { en: "Japan", ar: "اليابان" } },
];

export default function AddSellerPage() {
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const isRTL = isArabic;
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const methods = useForm<AddSellerFormData>({
    defaultValues: {
      country: "EG",
      city: "EG-cairo",
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = methods;

  const profileFile = watch("profileImage");
  const logoFile = watch("storeLogo");

  useEffect(() => {
    if (profileFile && profileFile.length > 0) {
      const file = profileFile[0];
      const reader = new FileReader();
      reader.onload = (e) => setProfilePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [profileFile]);

  useEffect(() => {
    if (logoFile && logoFile.length > 0) {
      const file = logoFile[0];
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }, [logoFile]);

  const onSubmit: SubmitHandler<AddSellerFormData> = async (data) => {
    if (!token) {
      toast.error(isArabic ? "يجب تسجيل الدخول أولاً" : "Must be logged in");
      return;
    }
    setIsSubmitting(true);
    try {
      let profileImageUrl = "";
      let storeLogoUrl = "";

      if (data.profileImage && data.profileImage.length > 0) {
        profileImageUrl = await uploadImage(data.profileImage[0], "profile", token);
      }

      if (data.storeLogo && data.storeLogo.length > 0) {
        storeLogoUrl = await uploadImage(data.storeLogo[0], "brand", token);
      }

      const payload = {
        profileImage: profileImageUrl,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        phone: data.phone,
        storeName: data.storeName,
        storePhone: data.storePhone,
        country: data.country,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        address: data.address,
        storeLogo: storeLogoUrl,
        password: data.password,
      };

      await createSellerByAdmin(payload, token);
      toast.success(isArabic ? "تم إضافة البائع بنجاح" : "Seller created successfully");
      router.push("/admin/sellers");
      router.refresh();
    } catch (error: any) {
      console.error("Failed to create seller:", error);
      toast.error(
        error.message || (isArabic ? "فشل في إضافة البائع" : "Failed to create seller")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F8FAFC] p-4 duration-700 md:p-8">
      <div className="mx-auto max-w-[1000px]">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/sellers"
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all hover:bg-slate-50 active:scale-95"
              >
                <ArrowLeft className={`h-5 w-5 text-slate-500 ${isArabic ? "rotate-180" : ""}`} />
              </Link>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">
                  {isArabic ? "إضافة بائع جديد" : "Onboard New Seller"}
                </h1>
                <p className="mt-0.5 text-sm font-medium text-gray-400">
                  {isArabic
                    ? "أدخل بيانات البائع الجديد والمتجر الخاص به."
                    : "Fill in the details for the new seller and their store."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-xl shadow-slate-200/20 md:p-10">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12" dir={isRTL ? "rtl" : "ltr"}>
              {/* Contact Info Section */}
              <section className="relative space-y-8">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-indigo-50 text-xs font-black text-indigo-600 ring-4 ring-indigo-50/50">
                    01
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
                      {t("contactInfo")}
                    </h3>
                    <div className="mt-1 h-0.5 w-8 rounded-full bg-indigo-100"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                    {t("profileImage")}
                  </label>
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <label className="group relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-primary hover:bg-white sm:w-1/2">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                        <Plus size={24} className="text-primary" />
                      </div>
                      <span className="text-sm font-black text-gray-900">{t("addImage")}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        {...register("profileImage")}
                      />
                    </label>

                    {profilePreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group/preview relative h-40 w-full overflow-hidden rounded-[32px] border-4 border-white shadow-2xl shadow-slate-200/50 sm:w-1/2"
                      >
                        <Image
                          fill
                          src={profilePreview}
                          alt="Profile Preview"
                          className="object-cover transition-transform duration-700 group-hover/preview:scale-110"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePreview(null);
                            methods.setValue("profileImage", null);
                          }}
                          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-xl backdrop-blur-sm transition-all hover:bg-rose-500 hover:text-white"
                        >
                          <X size={18} />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("firstName")}
                    </label>
                    <input
                      {...register("firstName", { required: t("requiredField") })}
                      placeholder={t("firstNamePlaceholder")}
                      className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                    />
                    {errors.firstName && (
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-1 text-[10px] font-bold text-rose-500"
                      >
                        {errors.firstName.message}
                      </motion.p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("lastName")}
                    </label>
                    <input
                      {...register("lastName", { required: t("requiredField") })}
                      placeholder={t("lastNamePlaceholder")}
                      className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                    />
                    {errors.lastName && (
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-1 text-[10px] font-bold text-rose-500"
                      >
                        {errors.lastName.message}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("email")}
                    </label>
                    <input
                      type="email"
                      {...register("email", {
                        required: t("requiredField"),
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: t("invalidEmail"),
                        },
                      })}
                      placeholder={t("emailPlaceholder")}
                      className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-1 text-[10px] font-bold text-rose-500"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("password")}
                    </label>
                    <input
                      type="password"
                      {...register("password", { required: t("requiredField") })}
                      placeholder={t("passwordPlaceholder")}
                      className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("dateOfBirth")}
                    </label>
                    <input
                      type="date"
                      {...register("dateOfBirth", { required: t("requiredField") })}
                      className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("phone")}
                    </label>
                    <PhoneInput name="phone" required />
                  </div>
                </div>
              </section>

              {/* Seller Info Section */}
              <section className="relative space-y-8">
                <div className="flex items-center gap-4">
                  <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-50 text-xs font-black text-emerald-600 ring-4 ring-emerald-50/50">
                    02
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-400">
                      {t("sellerInfo")}
                    </h3>
                    <div className="mt-1 h-0.5 w-8 rounded-full bg-emerald-100"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                    {t("storeLogo")}
                  </label>
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                    <label className="group relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-primary hover:bg-white sm:w-1/2">
                      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                        <Plus size={24} className="text-primary" />
                      </div>
                      <span className="text-sm font-black text-gray-900">{t("addImage")}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        {...register("storeLogo", { required: t("requiredField") })}
                      />
                    </label>

                    {logoPreview && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="group/preview relative h-40 w-full overflow-hidden rounded-[32px] border-4 border-white shadow-2xl shadow-slate-200/50 sm:w-1/2"
                      >
                        <Image
                          fill
                          src={logoPreview}
                          alt="Store Logo Preview"
                          className="object-cover transition-transform duration-700 group-hover/preview:scale-110"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            methods.setValue("storeLogo", null);
                          }}
                          className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-xl backdrop-blur-sm transition-all hover:bg-rose-500 hover:text-white"
                        >
                          <X size={18} />
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("storeName")}
                    </label>
                    <input
                      {...register("storeName", { required: t("requiredField") })}
                      placeholder={t("storeNamePlaceholder")}
                      className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("storePhone")}
                    </label>
                    <PhoneInput name="storePhone" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("country")}
                    </label>
                    <Controller
                      name="country"
                      control={methods.control}
                      render={({ field }) => (
                        <CountryDropdown
                          options={DEFAULT_COUNTRIES}
                          selected={field.value ?? ""}
                          onSelect={field.onChange}
                          className="ring-primary/10 rounded-2xl border-slate-100 bg-slate-50/50 p-5 focus-within:border-primary focus-within:bg-white focus-within:ring-[6px]"
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("city")}
                    </label>
                    <Controller
                      name="city"
                      control={methods.control}
                      render={({ field }) => (
                        <Dropdown
                          options={EGYPT_CITIES}
                          selected={field.value ?? ""}
                          onSelect={field.onChange}
                          className="ring-primary/10 rounded-2xl border-slate-100 bg-slate-50/50 p-5 focus-within:border-primary focus-within:bg-white focus-within:ring-[6px]"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("state")}
                    </label>
                    <input
                      {...register("state", { required: t("requiredField") })}
                      placeholder={t("statePlaceholder")}
                      className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                      {t("zipCode")}
                    </label>
                    <input
                      {...register("zipCode", { required: t("requiredField") })}
                      placeholder={t("zipCodePlaceholder")}
                      className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                    {t("address")}
                  </label>
                  <input
                    {...register("address")}
                    placeholder={t("addressPlaceholder")}
                    className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                  />
                </div>
              </section>

              {/* Actions */}
              <div className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-end">
                <Link
                  href="/admin/sellers"
                  className="inline-flex items-center justify-center rounded-2xl bg-gray-50 px-8 py-5 text-sm font-black text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 active:scale-95 sm:w-1/4"
                >
                  {t("cancel")}
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-[#31533A] px-8 py-5 text-sm font-black text-white shadow-2xl shadow-emerald-900/20 transition-all hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-70 sm:w-1/2"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t("create")}
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
