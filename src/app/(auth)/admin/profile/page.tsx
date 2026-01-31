"use client";

import { useSession } from "next-auth/react";
import React from "react";
import { useForm } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
}

const translations = {
  title: { en: "Profile Information", ar: "معلومات الملف الشخصي" },
  firstName: { en: "First Name", ar: "الاسم الأول" },
  lastName: { en: "Last Name", ar: "اسم العائلة" },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  save: { en: "Save Changes", ar: "حفظ التغييرات" },
  required: { en: "is required", ar: "مطلوب" },
  minLength: { en: "Minimum 2 characters", ar: "الحد الأدنى حرفان" },
};

const ProfilePage: React.FC = () => {
  const { language: locale } = useLanguage();
  const { data: session } = useSession();

  const safeUser = {
    id: session?.user?.id || "",
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
    role: session?.user?.role,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: safeUser.name,
      lastName: safeUser.name,
      email: safeUser.email,
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Form Data:", data);
    alert(
      locale === "ar"
        ? "تم تحديث الملف الشخصي بنجاح!"
        : "Profile updated successfully!",
    );
  };

  return (
    <div
      className={`rounded-lg border border-gray-300 bg-white p-4 shadow-sm ${
        locale === "ar" ? "text-right" : ""
      }`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <h2 className="mb-6 text-2xl font-bold text-gray-700">
        {translations.title[locale]}
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {translations.firstName[locale]}
            </label>
            <input
              type="text"
              className={`w-full rounded-md border px-3 py-2 focus:outline-none ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
              {...register("firstName", {
                required: `${translations.firstName[locale]} ${translations.required[locale]}`,
                minLength: {
                  value: 2,
                  message: translations.minLength[locale],
                },
              })}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {translations.lastName[locale]}
            </label>
            <input
              type="text"
              className={`w-full rounded-md border px-3 py-2 focus:outline-none ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
              {...register("lastName", {
                required: `${translations.lastName[locale]} ${translations.required[locale]}`,
                minLength: {
                  value: 2,
                  message: translations.minLength[locale],
                },
              })}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {translations.email[locale]}
          </label>
          <input
            type="email"
            className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-100 px-3 py-2"
            {...register("email")}
            disabled
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none"
          >
            {translations.save[locale]}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
