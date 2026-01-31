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

type AddVendorFormData = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone_code: string;
  vendor_image: FileList | null;
  store_name: string;
  store_phone: string;
  brand_type: string;
  country: string;
  city: string;
  address: string;
  state: string;
  zip_code: string;
  date_of_birth: string;
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

const US_STATES = [
  { id: "AL", name: { en: "Alabama", ar: "ألاباما" } },
  { id: "AK", name: { en: "Alaska", ar: "ألاسكا" } },
  { id: "AZ", name: { en: "Arizona", ar: "أريزونا" } },
  { id: "AR", name: { en: "Arkansas", ar: "أركنساس" } },
  { id: "CA", name: { en: "California", ar: "كاليفورنيا" } },
  { id: "CO", name: { en: "Colorado", ar: "كولورادو" } },
  { id: "CT", name: { en: "Connecticut", ar: "كونيتيكت" } },
  { id: "DE", name: { en: "Delaware", ar: "ديلاوير" } },
  { id: "FL", name: { en: "Florida", ar: "فلوريدا" } },
  { id: "GA", name: { en: "Georgia", ar: "جورجيا" } },
  { id: "HI", name: { en: "Hawaii", ar: "هاواي" } },
  { id: "ID", name: { en: "Idaho", ar: "أيداهو" } },
  { id: "IL", name: { en: "Illinois", ar: "إلينوي" } },
  { id: "IN", name: { en: "Indiana", ar: "إنديانا" } },
  { id: "IA", name: { en: "Iowa", ar: "آيوا" } },
  { id: "KS", name: { en: "Kansas", ar: "كانساس" } },
  { id: "KY", name: { en: "Kentucky", ar: "كنتاكي" } },
  { id: "LA", name: { en: "Louisiana", ar: "لويزيانا" } },
  { id: "ME", name: { en: "Maine", ar: "مين" } },
  { id: "MD", name: { en: "Maryland", ar: "ماريلاند" } },
  { id: "MA", name: { en: "Massachusetts", ar: "ماساتشوستس" } },
  { id: "MI", name: { en: "Michigan", ar: "ميشيغان" } },
  { id: "MN", name: { en: "Minnesota", ar: "مينيسوتا" } },
  { id: "MS", name: { en: "Mississippi", ar: "مسيسيبي" } },
  { id: "MO", name: { en: "Missouri", ar: "ميزوري" } },
  { id: "MT", name: { en: "Montana", ar: "مونتانا" } },
  { id: "NE", name: { en: "Nebraska", ar: "نبراسكا" } },
  { id: "NV", name: { en: "Nevada", ar: "نيفادا" } },
  { id: "NH", name: { en: "New Hampshire", ar: "نيو هامبشاير" } },
  { id: "NJ", name: { en: "New Jersey", ar: "نيو جيرسي" } },
  { id: "NM", name: { en: "New Mexico", ar: "نيو مكسيكو" } },
  { id: "NY", name: { en: "New York", ar: "نيويورك" } },
  { id: "NC", name: { en: "North Carolina", ar: "كارولاينا الشمالية" } },
  { id: "ND", name: { en: "North Dakota", ar: "داكوتا الشمالية" } },
  { id: "OH", name: { en: "Ohio", ar: "أوهايو" } },
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
    title: "Add New Vendor",
    contactInfo: "Contact Information",
    personalInfo: "Personal Information",
    firstName: "First name*",
    firstNamePlaceholder: "Your First name",
    lastName: "Last name*",
    lastNamePlaceholder: "Your last name",
    email: "Email*",
    emailPlaceholder: "example@medicova.com",
    dateOfBirth: "Date of Birth",
    vendorInfo: "Vendor Information",
    storeName: "Store Name*",
    storeNamePlaceholder: "Your store name",
    storePhone: "Store Phone*",
    storePhonePlaceholder: "Store phone number",
    brandType: "Brand Type",
    country: "Country*",
    city: "City*",
    state: "State/Province",
    statePlaceholder: "Select state",
    zipCode: "ZIP/Postal Code",
    zipCodePlaceholder: "ZIP or postal code",
    address: "Address*",
    addressPlaceholder: "2118 Thornridge Cir. Syracuse, Connecticut 35624",
    storeLogo: "Store Logo*",
    addImage: "Add Image",
    imageRequirements: "PNG, JPG up to 5MB",
    cancel: "Cancel",
    create: "Create Vendor",
    requiredField: "This field is required",
    invalidEmail: "Please enter a valid email address",
    fileSizeError: "File size should be less than 5MB",
    fileTypeError: "Only JPG and PNG files are allowed",
    phoneRequired: "Phone number is required",
  },
  ar: {
    title: "إضافة بائع جديد",
    contactInfo: "معلومات الاتصال",
    personalInfo: "المعلومات الشخصية",
    firstName: "الاسم الأول*",
    firstNamePlaceholder: "الاسم الأول الخاص بك",
    lastName: "الاسم الأخير*",
    lastNamePlaceholder: "الاسم الأخير الخاص بك",
    email: "البريد الإلكتروني*",
    emailPlaceholder: "example@medicova.com",
    dateOfBirth: "تاريخ الميلاد",
    vendorInfo: "معلومات البائع",
    storeName: "اسم المتجر*",
    storeNamePlaceholder: "اسم المتجر الخاص بك",
    storePhone: "هاتف المتجر*",
    storePhonePlaceholder: "رقم هاتف المتجر",
    brandType: "نوع العلامة التجارية",
    country: "البلد*",
    city: "المدينة*",
    state: "الولاية/المحافظة",
    statePlaceholder: "اختر الولاية",
    zipCode: "الرمز البريدي",
    zipCodePlaceholder: "الرمز البريدي",
    address: "العنوان*",
    addressPlaceholder: "2118 Thornridge Cir. Syracuse, Connecticut 35624",
    storeLogo: "شعار المتجر*",
    addImage: "إضافة صورة",
    imageRequirements: "PNG, JPG بحد أقصى 5MB",
    cancel: "إلغاء",
    create: "إنشاء البائع",
    requiredField: "هذا الحقل مطلوب",
    invalidEmail: "الرجاء إدخال عنوان بريد إلكتروني صحيح",
    fileSizeError: "يجب أن يكون حجم الملف أقل من 5MB",
    fileTypeError: "يُسمح فقط بملفات JPG و PNG",
    phoneRequired: "رقم الهاتف مطلوب",
  },
};

type AddVendorModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  locale: LanguageType;
};

const AddVendorModal: FC<AddVendorModalProps> = ({
  isModalOpen = false,
  setIsModalOpen,
  locale = "en",
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  const t = translations[locale];
  const isRTL = locale === "ar";

  const methods = useForm<AddVendorFormData>({
    defaultValues: {
      brand_type: "all",
      country: "US",
      city: "",
      state: "",
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    resetField,
    control,
  } = methods;

  const logoFile = watch("logo");
  const countryValue = watch("country");

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

  useEffect(() => {
    if (countryValue) {
      setSelectedCountry(countryValue);
      // Reset state when country changes
      setValue("state", "");
      setValue("city", "");
    }
  }, [countryValue, setValue]);

  const onSubmit: SubmitHandler<AddVendorFormData> = (data) => {
    console.log("Vendor submitted:", data);
    // Here you would typically send the data to your API
    const vendorData = {
      id: `VEN${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      avatar: previewImage,
      name: `${data.first_name} ${data.last_name}`,
      email: data.email,
      storeName: data.store_name,
      storePhone: data.store_phone,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zip_code,
      country: data.country,
      products: 0, // New vendor starts with 0 products
      totalRevenue: 0,
      balance: 0,
      totalEarnings: 0,
      totalOrders: 0,
      completedOrders: 0,
      pendingWithdrawals: 0,
      verified: false,
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      dateOfBirth: data.date_of_birth,
      vendorVerifiedAt: null,
      totalSpent: 0,
    };
    console.log("Complete vendor data:", vendorData);
    setIsModalOpen(false);
    reset();
    setPreviewImage(null);
  };

  const getCitiesForCountry = () => {
    if (selectedCountry === "EG") {
      return EGYPT_CITIES;
    }
    // Add more country-specific cities as needed
    return [];
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
        size="xl"
      >
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <div className="space-y-4">
              <h2 className="mb-2 text-lg font-semibold">{t.personalInfo}</h2>

              {/* Vendor Image */}
              <div>
                <label
                  className={`block text-sm ${isRTL ? "text-right" : "text-left"} font-medium text-gray-700`}
                >
                  {locale === "ar" ? "صورة البائع*" : "Vendor Image*"}
                </label>

                <div className="mt-2">
                  {/* Upload Button */}
                  <label
                    htmlFor="vendor_image"
                    className="mb-2 flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-6 py-8 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50"
                  >
                    <span className="mb-2 font-medium">
                      {locale === "ar" ? "إضافة صورة" : "Add Image"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {locale === "ar"
                        ? "PNG, JPG بحد أقصى 5MB"
                        : "PNG, JPG up to 5MB"}
                    </span>
                    <input
                      id="vendor_image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register("vendor_image", {
                        required:
                          locale === "ar"
                            ? "هذا الحقل مطلوب"
                            : "This field is required",
                        validate: {
                          fileSize: (files) =>
                            !files ||
                            files[0]?.size <= 5 * 1024 * 1024 ||
                            (locale === "ar"
                              ? "يجب أن يكون حجم الملف أقل من 5MB"
                              : "File size must be less than 5MB"),
                          fileType: (files) =>
                            !files ||
                            ["image/jpeg", "image/png"].includes(
                              files[0]?.type,
                            ) ||
                            (locale === "ar"
                              ? "يُسمح فقط بملفات JPG و PNG"
                              : "Only JPG and PNG files are allowed"),
                        },
                      })}
                    />
                  </label>

                  {/* Preview */}
                  {watch("vendor_image")?.length ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-md border border-gray-200">
                      <Image
                        width={300}
                        height={300}
                        src={URL.createObjectURL(watch("vendor_image")![0])}
                        alt="Vendor image preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => resetField("vendor_image")}
                        className="absolute right-1 top-1 rounded-full bg-gray-800 p-0.5 text-white opacity-70 hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : null}
                </div>

                {errors.vendor_image && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.vendor_image.message}
                  </p>
                )}
              </div>

              {/* First and Last name */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

              {/* Email and Date of Birth */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="w-full">
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
                <div className="w-full">
                  <label
                    htmlFor="date_of_birth"
                    className={`block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t.dateOfBirth}
                  </label>
                  <div className="mt-1">
                    <input
                      type="date"
                      id="date_of_birth"
                      {...register("date_of_birth")}
                      className="block w-full rounded-md border border-gray-200 p-2 shadow-sm outline-none sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <PhoneInput name="phone" required locale={locale} />

              <h2 className="mb-2 text-lg font-semibold">{t.vendorInfo}</h2>

              {/* Store Name and Store Phone */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="w-full">
                  <label
                    htmlFor="store_name"
                    className={`block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t.storeName}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="store_name"
                      {...register("store_name", {
                        required: t.requiredField,
                      })}
                      placeholder={t.storeNamePlaceholder}
                      className={`block w-full rounded-md border border-gray-200 p-2 shadow-sm outline-none sm:text-sm ${
                        errors.store_name ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.store_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.store_name.message}
                      </p>
                    )}
                  </div>
                </div>
                <PhoneInput name="store_phone" required locale={locale} />
              </div>

              {/* Brand Type */}
              <div className="w-full">
                <label
                  htmlFor="brand_type"
                  className={`mb-1 block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                >
                  {t.brandType}
                </label>
                <Controller
                  name="brand_type"
                  control={control}
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

              {/* Location Information */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Country */}
                <div>
                  <label
                    htmlFor="country"
                    className={`mb-1 block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t.country}
                  </label>
                  <Controller
                    name="country"
                    control={control}
                    rules={{ required: t.requiredField }}
                    render={({ field }) => (
                      <CountryDropdown
                        options={DEFAULT_COUNTRIES}
                        selected={field.value ?? ""}
                        onSelect={field.onChange}
                        locale={locale}
                      />
                    )}
                  />
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.country.message}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label
                    htmlFor="city"
                    className={`mb-1 block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t.city}
                  </label>
                  {getCitiesForCountry().length > 0 ? (
                    <Controller
                      name="city"
                      control={control}
                      rules={{ required: t.requiredField }}
                      render={({ field }) => (
                        <Dropdown
                          options={getCitiesForCountry()}
                          selected={field.value ?? ""}
                          onSelect={field.onChange}
                          locale={locale}
                        />
                      )}
                    />
                  ) : (
                    <input
                      type="text"
                      id="city"
                      {...register("city", { required: t.requiredField })}
                      className={`block w-full rounded-md border border-gray-200 p-2 shadow-sm outline-none sm:text-sm ${
                        errors.city ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                  )}
                  {errors.city && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              {/* State and ZIP Code */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {selectedCountry === "US" && (
                  <div>
                    <label
                      htmlFor="state"
                      className={`mb-1 block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t.state}
                    </label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Dropdown
                          options={US_STATES}
                          selected={field.value ?? ""}
                          onSelect={field.onChange}
                          locale={locale}
                        />
                      )}
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="zip_code"
                    className={`block text-sm font-medium text-gray-700 ${isRTL ? "text-right" : "text-left"}`}
                  >
                    {t.zipCode}
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="zip_code"
                      {...register("zip_code")}
                      placeholder={t.zipCodePlaceholder}
                      className="block w-full rounded-md border border-gray-200 p-2 shadow-sm outline-none sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Address */}
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
                    {...register("address", { required: t.requiredField })}
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

              {/* Store Logo */}
              <div>
                <label
                  className={`block text-sm ${isRTL ? "text-right" : "text-left"} font-medium text-gray-700`}
                >
                  {t.storeLogo}
                </label>
                <div className="mt-1 flex items-center gap-4">
                  <label
                    htmlFor="logo"
                    className="flex w-full cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50"
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
                        alt="Store logo preview"
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

export default AddVendorModal;
