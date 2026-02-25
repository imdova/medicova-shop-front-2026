"use client";

import { FC, useEffect, useState } from "react";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { X, Plus } from "lucide-react";
import Modal from "@/components/shared/Modals/DynamicModal";
import Image from "next/image";
import PhoneInput from "@/components/forms/Forms/formFields/PhoneInput";
import Dropdown from "@/components/shared/DropDownMenu";
import { CountryDropdown } from "@/components/features/CountryDropdown";
import { LanguageType } from "@/util/translations";
import { useTranslations } from "next-intl";
import { City, Country } from "@/types";
import { motion } from "framer-motion";

type AddSellerFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone_code: string;
  brand_name: string;
  brand_type: string;
  country: string;
  city: string;
  address: string;
  logo: FileList | null;
};

const brandOptions = [
  { id: "all", name: { en: "All Brands", ar: "كل العلامات التجارية" } },
  { id: "apple", name: { en: "Apple", ar: "آبل" } },
  { id: "samsung", name: { en: "Samsung", ar: "سامسونج" } },
  { id: "xiaomi", name: { en: "Xiaomi", ar: "شاومي" } },
  { id: "huawei", name: { en: "Huawei", ar: "هواوي" } },
  { id: "oppo", name: { en: "Oppo", ar: "أوبو" } },
  { id: "sony", name: { en: "Sony", ar: "سوني" } },
  { id: "lg", name: { en: "LG", ar: "إل جي" } },
];

const EGYPT_CITIES: City[] = [
  { id: "EG-cairo", code: "cairo", name: { en: "Cairo", ar: "القاهرة" } },
  { id: "EG-alex", code: "alex", name: { en: "Alexandria", ar: "الإسكندرية" } },
  { id: "EG-giza", code: "giza", name: { en: "Giza", ar: "الجيزة" } },
  {
    id: "EG-mansoura",
    code: "mansoura",
    name: { en: "Mansoura", ar: "المنصورة" },
  },
  { id: "EG-tanta", code: "tanta", name: { en: "Tanta", ar: "طنطا" } },
  {
    id: "EG-zagazig",
    code: "zagazig",
    name: { en: "Zagazig", ar: "الزقازيق" },
  },
  {
    id: "EG-ismailia",
    code: "ismailia",
    name: { en: "Ismailia", ar: "الإسماعيلية" },
  },
  { id: "EG-asyut", code: "asyut", name: { en: "Asyut", ar: "أسيوط" } },
  { id: "EG-sohag", code: "sohag", name: { en: "Sohag", ar: "سوهاج" } },
  { id: "EG-luxor", code: "luxor", name: { en: "Luxor", ar: "الأقصر" } },
  { id: "EG-aswan", code: "aswan", name: { en: "Aswan", ar: "أسوان" } },
  {
    id: "EG-beni_suef",
    code: "beni_suef",
    name: { en: "Beni Suef", ar: "بني سويف" },
  },
  { id: "EG-fayoum", code: "fayoum", name: { en: "Fayoum", ar: "الفيوم" } },
  {
    id: "EG-kafr_elsheikh",
    code: "kafr_elsheikh",
    name: { en: "Kafr El-Sheikh", ar: "كفر الشيخ" },
  },
  { id: "EG-minya", code: "minya", name: { en: "Minya", ar: "المنيا" } },
  {
    id: "EG-damietta",
    code: "damietta",
    name: { en: "Damietta", ar: "دمياط" },
  },
  {
    id: "EG-port_said",
    code: "port_said",
    name: { en: "Port Said", ar: "بورسعيد" },
  },
  { id: "EG-suez", code: "suez", name: { en: "Suez", ar: "السويس" } },
  {
    id: "EG-red_sea",
    code: "red_sea",
    name: { en: "Red Sea", ar: "البحر الأحمر" },
  },
];

const DEFAULT_COUNTRIES: Country[] = [
  { id: "SA", code: "sa", name: { en: "Saudi Arabia", ar: "السعودية" } },
  {
    id: "AE",
    code: "ae",
    name: { en: "United Arab Emirates", ar: "الإمارات" },
  },
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
  {
    id: "US",
    code: "us",
    name: { en: "United States", ar: "الولايات المتحدة" },
  },
  {
    id: "GB",
    code: "gb",
    name: { en: "United Kingdom", ar: "المملكة المتحدة" },
  },
  { id: "CA", code: "ca", name: { en: "Canada", ar: "كندا" } },
  { id: "AU", code: "au", name: { en: "Australia", ar: "أستراليا" } },
  { id: "IN", code: "in", name: { en: "India", ar: "الهند" } },
  { id: "JP", code: "jp", name: { en: "Japan", ar: "اليابان" } },
];

type AddSellerModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  locale: LanguageType;
};

const AddSellerModal: FC<AddSellerModalProps> = ({
  isModalOpen = false,
  setIsModalOpen,
  locale = "en",
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const t = useTranslations("admin");
  const isRTL = locale === "ar";

  const methods = useForm<AddSellerFormData>({
    defaultValues: {
      brand_type: "all",
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

  const logoFile = watch("logo");

  useEffect(() => {
    if (logoFile && logoFile.length > 0) {
      const file = logoFile[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [logoFile]);

  const onSubmit: SubmitHandler<AddSellerFormData> = (data) => {
    console.log("Brand approval submitted:", data);
    setIsModalOpen(false);
    reset();
    setPreviewImage(null);
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          reset();
          setPreviewImage(null);
        }}
        title=""
        size="lg"
      >
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              {t("brandApprovalRequest")}
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <div className="bg-primary/40 h-1.5 w-12 rounded-full"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                {t("sellerRegistration")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(false)}
            className="group absolute right-6 top-6 flex size-12 items-center justify-center rounded-2xl bg-gray-50/50 text-gray-400 backdrop-blur-sm transition-all hover:bg-white hover:text-gray-900 hover:shadow-xl hover:shadow-gray-200/50 sm:static"
          >
            <X
              size={24}
              className="transition-transform group-hover:rotate-90"
            />
          </button>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="custom-scrollbar max-h-[65vh] space-y-12 overflow-y-auto px-2 pb-4"
            dir={isRTL ? "rtl" : "ltr"}
          >
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

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                    {t("firstName")}
                  </label>
                  <input
                    {...register("first_name", {
                      required: t("requiredField"),
                    })}
                    placeholder={t("firstNamePlaceholder")}
                    className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                  />
                  {errors.first_name && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-1 text-[10px] font-bold text-rose-500"
                    >
                      {errors.first_name.message}
                    </motion.p>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                    {t("lastName")}
                  </label>
                  <input
                    {...register("last_name", {
                      required: t("requiredField"),
                    })}
                    placeholder={t("lastNamePlaceholder")}
                    className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                  />
                  {errors.last_name && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="ml-1 text-[10px] font-bold text-rose-500"
                    >
                      {errors.last_name.message}
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

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                    {t("brandName")}
                  </label>
                  <input
                    {...register("brand_name")}
                    placeholder={t("brandNamePlaceholder")}
                    className="ring-primary/10 w-full rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-sm font-bold outline-none transition-all placeholder:text-gray-300 focus:border-primary focus:bg-white focus:ring-[6px]"
                  />
                </div>
                <div className="space-y-3">
                  <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                    {t("brandType")}
                  </label>
                  <Controller
                    name="brand_type"
                    control={methods.control}
                    render={({ field }) => (
                      <Dropdown
                        options={brandOptions}
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

              <div className="space-y-4">
                <label className="ml-1 text-[11px] font-black uppercase tracking-widest text-gray-500">
                  {t("brandLogo")}
                </label>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <label className="group relative flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-[32px] border-2 border-dashed border-slate-200 bg-slate-50/50 transition-all hover:border-primary hover:bg-white sm:w-1/2">
                    <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110">
                      <Plus size={24} className="text-primary" />
                    </div>
                    <span className="text-sm font-black text-gray-900">
                      {t("addImage")}
                    </span>
                    <span className="mt-1 text-[10px] font-bold text-gray-400">
                      {t("imageRequirements")}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register("logo", {
                        required: t("requiredField"),
                        validate: {
                          fileSize: (files) =>
                            !files ||
                            files[0]?.size <= 5 * 1024 * 1024 ||
                            t("fileSizeError"),
                          fileType: (files) =>
                            !files ||
                            ["image/jpeg", "image/png"].includes(
                              files[0]?.type,
                            ) ||
                            t("fileTypeError"),
                        },
                      })}
                    />
                  </label>

                  {previewImage && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group/preview relative h-40 w-full overflow-hidden rounded-[32px] border-4 border-white shadow-2xl shadow-slate-200/50 sm:w-1/2"
                    >
                      <Image
                        fill
                        src={previewImage}
                        alt="Preview"
                        className="object-cover transition-transform duration-700 group-hover/preview:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover/preview:opacity-100"></div>
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          reset({ ...watch(), logo: null });
                        }}
                        className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-rose-500 shadow-xl backdrop-blur-sm transition-all hover:bg-rose-500 hover:text-white active:scale-95"
                      >
                        <X size={18} />
                      </button>
                    </motion.div>
                  )}
                </div>
                {errors.logo && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-1 text-[10px] font-bold text-rose-500"
                  >
                    {errors.logo.message}
                  </motion.p>
                )}
              </div>
            </section>

            {/* Actions */}
            <div className="sticky bottom-0 mt-8 flex flex-col gap-4 bg-white/80 pb-2 pt-6 backdrop-blur-md sm:flex-row">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-full rounded-2xl bg-gray-50 px-8 py-5 text-sm font-black text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 active:scale-95 sm:w-1/3"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="group relative w-full overflow-hidden rounded-2xl bg-[#31533A] px-8 py-5 text-sm font-black text-white shadow-2xl shadow-emerald-900/20 transition-all hover:brightness-110 active:scale-95 sm:w-2/3"
              >
                <span className="relative z-10">{t("create")}</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default AddSellerModal;
