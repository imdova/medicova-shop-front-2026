"use client";

import { FC, useEffect, useState } from "react";
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { X } from "lucide-react";
import Modal from "@/components/UI/Modals/DynamicModal";
import Image from "next/image";
import PhoneInput from "@/components/Forms/formFields/PhoneInput";
import Dropdown from "@/components/UI/DropDownMenu";
import { CountryDropdown } from "@/components/UI/CountryDropdown";
import { LanguageType } from "@/util/translations";
import { City, Country } from "@/types";

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

// Translation dictionary
const translations = {
  en: {
    title: "Brand Approval Request",
    contactInfo: "Contact Info",
    firstName: "First name*",
    firstNamePlaceholder: "Your First name",
    lastName: "Last name*",
    lastNamePlaceholder: "Your last name",
    email: "Email*",
    emailPlaceholder: "example@medicova.com",
    sellerInfo: "Seller Information",
    brandName: "Brand name",
    brandNamePlaceholder: "Your brand name",
    brandType: "Brand type",
    country: "Country",
    city: "City",
    address: "Address",
    addressPlaceholder: "2118 Thornridge Cir. Syracuse, Connecticut 35624",
    brandLogo: "Brand Logo*",
    addImage: "Add Image",
    imageRequirements: "PNG, JPG up to 5MB",
    cancel: "Cancel",
    create: "Create",
    requiredField: "This field is required",
    invalidEmail: "Please enter a valid email address",
    fileSizeError: "File size should be less than 5MB",
    fileTypeError: "Only JPG and PNG files are allowed",
  },
  ar: {
    title: "طلب موافقة العلامة التجارية",
    contactInfo: "معلومات الاتصال",
    firstName: "الاسم الأول*",
    firstNamePlaceholder: "الاسم الأول الخاص بك",
    lastName: "الاسم الأخير*",
    lastNamePlaceholder: "الاسم الأخير الخاص بك",
    email: "البريد الإلكتروني*",
    emailPlaceholder: "example@medicova.com",
    sellerInfo: "معلومات البائع",
    brandName: "اسم العلامة التجارية",
    brandNamePlaceholder: "اسم العلامة التجارية الخاصة بك",
    brandType: "نوع العلامة التجارية",
    country: "البلد",
    city: "المدينة",
    address: "العنوان",
    addressPlaceholder: "2118 Thornridge Cir. Syracuse, Connecticut 35624",
    brandLogo: "شعار العلامة التجارية*",
    addImage: "إضافة صورة",
    imageRequirements: "PNG, JPG بحد أقصى 5MB",
    cancel: "إلغاء",
    create: "إنشاء",
    requiredField: "هذا الحقل مطلوب",
    invalidEmail: "الرجاء إدخال عنوان بريد إلكتروني صحيح",
    fileSizeError: "يجب أن يكون حجم الملف أقل من 5MB",
    fileTypeError: "يُسمح فقط بملفات JPG و PNG",
  },
};

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
  const t = translations[locale];
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
        title={t.title}
        size="lg"
      >
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-h-[600px] space-y-6 overflow-y-auto px-2"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className="space-y-4">
              <h2 className="mb-2 text-lg font-semibold">{t.contactInfo}</h2>
              <div className="flex gap-3">
                {/* First and Last name */}
                <div className="w-full">
                  <label
                    htmlFor="first_name"
                    className={`block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t.firstName}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="first_name"
                      {...register("first_name", {
                        required: t.requiredField,
                      })}
                      placeholder={t.firstNamePlaceholder}
                      className={`block w-full rounded-md border border-gray-200 p-2 shadow-sm outline-none sm:text-sm ${
                        errors.first_name ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="w-full">
                  <label
                    htmlFor="last_name"
                    className={`block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t.lastName}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="last_name"
                      {...register("last_name", {
                        required: t.requiredField,
                      })}
                      placeholder={t.lastNamePlaceholder}
                      className={`block w-full rounded-md border border-gray-200 p-2 shadow-sm outline-none sm:text-sm ${
                        errors.last_name ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                >
                  {t.email}
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    id="email"
                    {...register("email", {
                      required: t.requiredField,
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: t.invalidEmail,
                      },
                    })}
                    className={`block w-full rounded-md border border-gray-200 p-2 shadow-sm outline-none sm:text-sm ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder={t.emailPlaceholder}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
              <PhoneInput name="phone" required locale={locale} />
              <h2
                className={`mb-2 text-lg font-semibold ${isRTL ? "text-right" : "text-left"}`}
              >
                {t.sellerInfo}
              </h2>

              <div className="flex gap-3">
                {/* Brand name */}
                <div className="w-full">
                  <label
                    htmlFor="brand_name"
                    className={`block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t.brandName}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="brand_name"
                      {...register("brand_name")}
                      placeholder={t.brandNamePlaceholder}
                      className={`block w-full rounded-md border border-gray-200 p-2 shadow-sm outline-none sm:text-sm ${
                        errors.brand_name ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.brand_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.brand_name.message}
                      </p>
                    )}
                  </div>
                </div>
                {/* Brand type */}
                <div className="w-full">
                  <label
                    htmlFor="brand_type"
                    className={`mb-1 block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t.brandType}
                  </label>
                  <Controller
                    name="brand_type"
                    control={methods.control}
                    render={({ field }) => (
                      <Dropdown
                        options={brandOptions}
                        selected={field.value ?? ""}
                        onSelect={field.onChange}
                        locale={locale}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                {/* country */}
                <div className="w-full">
                  <label
                    htmlFor="country"
                    className={`mb-1 block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t.country}
                  </label>
                  <Controller
                    name="country"
                    control={methods.control}
                    render={({ field }) => (
                      <CountryDropdown
                        options={DEFAULT_COUNTRIES}
                        selected={field.value ?? ""}
                        onSelect={field.onChange}
                        locale={locale}
                      />
                    )}
                  />
                </div>
                {/* City */}
                <div className="w-full">
                  <label
                    htmlFor="brand_type"
                    className={`mb-1 block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t.city}
                  </label>
                  <Controller
                    name="city"
                    control={methods.control}
                    render={({ field }) => (
                      <Dropdown
                        options={EGYPT_CITIES}
                        selected={field.value ?? ""}
                        onSelect={field.onChange}
                        locale={locale}
                      />
                    )}
                  />
                </div>
              </div>
              {/* Address*/}
              <div className="w-full">
                <label
                  htmlFor="address"
                  className={`block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                >
                  {t.address}
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="address"
                    {...register("address")}
                    placeholder={t.addressPlaceholder}
                    className={`block w-full rounded-md border border-gray-200 p-2 shadow-sm outline-none sm:text-sm ${
                      errors.address ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
              {/* Brand Logo */}
              <div>
                <label
                  className={`block text-sm ${isRTL ? "text-right" : "text-left"} font-medium text-gray-700`}
                >
                  {t.brandLogo}
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <label
                    htmlFor="logo"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                  >
                    <span className="mb-2 block font-medium">{t.addImage}</span>
                    <span className="block text-xs">{t.imageRequirements}</span>
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register("logo", {
                        required: t.requiredField,
                        validate: {
                          fileSize: (files) =>
                            !files ||
                            files[0]?.size <= 5 * 1024 * 1024 ||
                            t.fileSizeError,
                          fileType: (files) =>
                            !files ||
                            ["image/jpeg", "image/png"].includes(
                              files[0]?.type,
                            ) ||
                            t.fileTypeError,
                        },
                      })}
                    />
                  </label>
                  {previewImage && (
                    <div className="relative h-24 w-24 overflow-hidden rounded-md border border-gray-200">
                      <Image
                        width={300}
                        height={300}
                        src={previewImage}
                        alt="Brand logo preview"
                        className="h-full w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewImage(null);
                          reset({ ...watch(), logo: null });
                        }}
                        className="absolute right-1 top-1 rounded-full bg-gray-800 p-0.5 text-white opacity-70 hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                {errors.logo && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.logo.message}
                  </p>
                )}
              </div>
            </div>
            <div
              className={`flex justify-end gap-3 pt-2 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  reset();
                  setPreviewImage(null);
                }}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none"
              >
                {t.create}
              </button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default AddSellerModal;
