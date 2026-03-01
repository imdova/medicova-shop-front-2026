"use client";

import { FC, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { X, Upload, Globe, Shield, Loader2, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import Modal from "@/components/shared/Modals/DynamicModal";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";
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

const BrandApprovalModal: FC<BrandApprovalModalProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const t = useTranslations("seller_brand_management.modal");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BrandApprovalFormData>();

  const logoFile = watch("logo");

  // Handle image preview
  const handleLogoChange = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  }, []);

  const onSubmit = async (data: BrandApprovalFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    console.log("Brand approval submitted:", data);
    setIsSubmitting(false);
    setIsModalOpen(false);
    reset();
    setPreviewImage(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
    setPreviewImage(null);
  };

  return (
    <Modal isOpen={isModalOpen} onClose={closeModal} size="lg">
      <div className="relative overflow-hidden rounded bg-white/80 p-8 pt-10 backdrop-blur-3xl">
        <button
          onClick={closeModal}
          className="absolute right-6 top-6 rounded-2xl bg-gray-50 p-3 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        <div className="mb-8 space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-xl shadow-black/10">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900">
            {t("title")}
          </h2>
          <p className="text-sm font-medium text-gray-500">{t("note")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Brand Name */}
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-400">
                {t("brandName")}
              </label>
              <div className="group relative">
                <input
                  type="text"
                  {...register("name", { required: t("brandNameRequired") })}
                  placeholder={t("brandNamePlaceholder")}
                  className={`w-full rounded-2xl bg-gray-50/50 p-4 font-bold outline-none transition-all focus:bg-white focus:ring-4 ${
                    errors.name
                      ? "border border-rose-100 ring-rose-100"
                      : "border border-gray-100 ring-gray-100/50"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-bold text-rose-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Website Link */}
            <div className="space-y-2">
              <label className="text-sm font-black uppercase tracking-widest text-gray-400">
                {t("website")}
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  {...register("websiteLink", {
                    required: t("websiteRequired"),
                    pattern: {
                      value:
                        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                      message: t("websiteInvalid"),
                    },
                  })}
                  placeholder={t("websitePlaceholder")}
                  className={`w-full rounded-2xl bg-gray-50/50 p-4 pl-12 font-bold outline-none transition-all focus:bg-white focus:ring-4 ${
                    errors.websiteLink
                      ? "border border-rose-100 ring-rose-100"
                      : "border border-gray-100 ring-gray-100"
                  }`}
                />
              </div>
              {errors.websiteLink && (
                <p className="text-xs font-bold text-rose-500">
                  {errors.websiteLink.message}
                </p>
              )}
            </div>
          </div>

          {/* Logo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-black uppercase tracking-widest text-gray-400">
              {t("logo")}
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <label className="group relative flex flex-1 cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-[2rem] border-2 border-dashed border-gray-200 bg-gray-50/30 p-8 transition-all hover:border-gray-900 hover:bg-white">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 rounded-2xl bg-white p-4 shadow-sm transition-all group-hover:bg-gray-900 group-hover:text-white">
                    <Upload size={24} />
                  </div>
                  <span className="font-black text-gray-900">
                    {t("addImage")}
                  </span>
                  <span className="text-xs font-medium text-gray-400">
                    {t("logoNote")}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  {...register("logo", {
                    required: t("logoRequired"),
                    onChange: (e) => handleLogoChange(e.target.files),
                    validate: {
                      fileSize: (files) =>
                        !files ||
                        files[0]?.size <= 5 * 1024 * 1024 ||
                        t("logoSizeError"),
                      fileType: (files) =>
                        !files ||
                        ["image/jpeg", "image/png", "image/webp"].includes(
                          files[0]?.type,
                        ) ||
                        t("logoTypeError"),
                    },
                  })}
                />
              </label>

              <AnimatePresence>
                {previewImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative h-40 w-40 overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-4 shadow-2xl shadow-gray-200/50"
                  >
                    <Image
                      width={200}
                      height={200}
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
                      className="absolute right-2 top-2 rounded-full bg-rose-500 p-1.5 text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.logo && (
              <p className="text-xs font-bold text-rose-500">
                {errors.logo.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <DynamicButton
              variant="outline"
              label={t("cancel")}
              onClick={closeModal}
              className="rounded-2xl border-gray-100 px-8 py-4 font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50"
            />
            <DynamicButton
              variant="primary"
              label={isSubmitting ? "" : t("submit")}
              icon={
                isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : null
              }
              disabled={isSubmitting}
              className="rounded-2xl bg-gray-900 px-10 py-4 font-black uppercase tracking-widest text-white shadow-xl shadow-black/10 transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98]"
            />
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BrandApprovalModal;
