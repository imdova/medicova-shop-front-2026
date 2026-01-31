"use client";

import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import Modal from "@/components/UI/Modals/DynamicModal";
import Image from "next/image";
import { LanguageType } from "@/util/translations";

type BrandApprovalFormData = {
  name: string;
  websiteLink: string;
  logo: FileList | null;
};

type BrandApprovalModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  locale?: LanguageType;
};

const translations = {
  title: {
    en: "Brand Approval Request",
    ar: "طلب الموافقة على العلامة التجارية",
  },
  brandName: {
    en: "Brand name*",
    ar: "اسم العلامة التجارية*",
  },
  namePlaceholder: {
    en: "example",
    ar: "مثال",
  },
  nameRequired: {
    en: "Brand name is required",
    ar: "اسم العلامة التجارية مطلوب",
  },
  websiteLabel: {
    en: "Brand official website link*",
    ar: "الرابط الرسمي لموقع العلامة التجارية*",
  },
  websitePlaceholder: {
    en: "https://example.com",
    ar: "https://example.com",
  },
  websiteRequired: {
    en: "Website link is required",
    ar: "رابط الموقع مطلوب",
  },
  websiteInvalid: {
    en: "Please enter a valid URL",
    ar: "يرجى إدخال رابط صحيح",
  },
  logoLabel: {
    en: "Brand Logo*",
    ar: "شعار العلامة التجارية*",
  },
  addImage: {
    en: "Add Image",
    ar: "إضافة صورة",
  },
  imageNote: {
    en: "PNG, JPG up to 5MB",
    ar: "PNG، JPG حتى 5 ميجابايت",
  },
  logoRequired: {
    en: "Brand logo is required",
    ar: "شعار العلامة التجارية مطلوب",
  },
  logoSizeError: {
    en: "File size should be less than 5MB",
    ar: "يجب أن يكون حجم الملف أقل من 5 ميجابايت",
  },
  logoTypeError: {
    en: "Only JPG and PNG files are allowed",
    ar: "يُسمح فقط بملفات JPG و PNG",
  },
  note: {
    en: "Note that, approvals team will go over your request and get back to you within a few days.",
    ar: "يرجى ملاحظة أن فريق الموافقات سيراجع طلبك ويرد عليك خلال بضعة أيام.",
  },
  cancel: {
    en: "Cancel",
    ar: "إلغاء",
  },
  create: {
    en: "Create",
    ar: "إنشاء",
  },
};

const BrandApprovalModal: FC<BrandApprovalModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  locale = "en",
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BrandApprovalFormData>();

  const logoFile = watch("logo");

  // Handle image preview
  if (logoFile && logoFile.length > 0 && !previewImage) {
    const file = logoFile[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  const onSubmit = (data: BrandApprovalFormData) => {
    console.log("Brand approval submitted:", data);
    setIsModalOpen(false);
    reset();
    setPreviewImage(null);
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        reset();
        setPreviewImage(null);
      }}
      title={translations.title[locale]}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Brand Name */}
          <div>
            <label
              className={`block text-sm ${locale === "ar" && "text-right"} mb-1 font-medium text-gray-700`}
            >
              {translations.brandName[locale]}
            </label>
            <input
              type="text"
              {...register("name", {
                required: translations.nameRequired[locale],
              })}
              placeholder={translations.namePlaceholder[locale]}
              className={`block w-full rounded-md border p-2 shadow-sm outline-none sm:text-sm ${
                errors.name ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p
                className={`mt-1 text-sm text-red-600 ${locale === "ar" && "text-right"}`}
              >
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Website Link */}
          <div>
            <label
              className={`block text-sm ${locale === "ar" && "text-right"} mb-1 font-medium text-gray-700`}
            >
              {translations.websiteLabel[locale]}
            </label>
            <input
              type="url"
              {...register("websiteLink", {
                required: translations.websiteRequired[locale],
                pattern: {
                  value:
                    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                  message: translations.websiteInvalid[locale],
                },
              })}
              placeholder={translations.websitePlaceholder[locale]}
              className={`block w-full rounded-md border p-2 shadow-sm outline-none sm:text-sm ${
                errors.websiteLink ? "border-red-300" : "border-gray-300"
              }`}
            />
            {errors.websiteLink && (
              <p
                className={`mt-1 text-sm text-red-600 ${locale === "ar" && "text-right"}`}
              >
                {errors.websiteLink.message}
              </p>
            )}
          </div>

          {/* Logo Upload */}
          <div>
            <label
              className={`block text-sm ${locale === "ar" && "text-right"} mb-1 font-medium text-gray-700`}
            >
              {translations.logoLabel[locale]}
            </label>
            <div className="mt-1 flex items-center gap-4">
              <label
                htmlFor="logo"
                className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50"
              >
                <span className="mb-2 block font-medium">
                  {translations.addImage[locale]}
                </span>
                <span className="block text-xs">
                  {translations.imageNote[locale]}
                </span>
                <input
                  id="logo"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("logo", {
                    required: translations.logoRequired[locale],
                    validate: {
                      fileSize: (files) =>
                        !files ||
                        files[0]?.size <= 5 * 1024 * 1024 ||
                        translations.logoSizeError[locale],
                      fileType: (files) =>
                        !files ||
                        ["image/jpeg", "image/png"].includes(files[0]?.type) ||
                        translations.logoTypeError[locale],
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
                    alt="Preview"
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
              <p
                className={`mt-1 text-sm text-red-600 ${locale === "ar" && "text-right"}`}
              >
                {errors.logo.message}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-500">
          {translations.note[locale]}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setIsModalOpen(false);
              reset();
              setPreviewImage(null);
            }}
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            {translations.cancel[locale]}
          </button>
          <button
            type="submit"
            className="inline-flex justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700"
          >
            {translations.create[locale]}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default BrandApprovalModal;
