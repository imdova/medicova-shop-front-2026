"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Category,
  createCategory,
  updateCategory,
  fetchCategoryById,
} from "../constants";
import { uploadImage } from "@/lib/uploadService";
import ModalWrapper from "./ModalWrapper";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editItem?: Category | null;
  onSuccess?: () => void;
}

const CreateCategoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editItem,
  onSuccess,
}) => {
  const t = useTranslations("admin");
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slugEn, setSlugEn] = useState("");
  const [slugAr, setSlugAr] = useState("");
  const [headlineEn, setHeadlineEn] = useState("");
  const [headlineAr, setHeadlineAr] = useState("");
  const [description, setDescription] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editItem) return;
    setNameEn(editItem.name?.en || "");
    setNameAr(editItem.name?.ar || "");
    setImagePreview(editItem.image || null);
    setSlugEn(editItem.slug || "");
    setSlugAr(editItem.slugAr || "");
    setHeadlineEn(editItem.headline?.en || "");
    setHeadlineAr(editItem.headline?.ar || "");
    setDescription(editItem.description || "");

    const itemId = (editItem as any)._id || editItem.id;
    fetchCategoryById(itemId, token)
      .then((data: any) => {
        if (!data) return;
        if (data.name) setNameEn(data.name);
        if (data.nameAr) setNameAr(data.nameAr);
        if (data.slug) setSlugEn(data.slug);
        if (data.slugAr) setSlugAr(data.slugAr);
        if (data.headlineEn) setHeadlineEn(data.headlineEn);
        if (data.headlineAr) setHeadlineAr(data.headlineAr);
        if (data.description) setDescription(data.description);
        if (data.image) setImagePreview(data.image);
      })
      .catch(() => {});
  }, [editItem, token]);

  const resetAndClose = useCallback(() => {
    setNameEn("");
    setNameAr("");
    setSlugEn("");
    setSlugAr("");
    setHeadlineEn("");
    setHeadlineAr("");
    setDescription("");
    setImagePreview(null);
    setImageFile(null);
    onClose();
  }, [onClose]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.type !== "image/webp") {
        toast.error(t("onlyWebpAllowed") || "Only WEBP allowed");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    [t],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!nameEn.trim() || !nameAr.trim()) return;
      setIsSubmitting(true);
      try {
        let imageUrl = imagePreview;
        if (imageFile) {
          try {
            imageUrl = await uploadImage(imageFile, "category", token);
          } catch {
            toast.error(t("uploadFailed") || "Upload failed");
            setIsSubmitting(false);
            return;
          }
        }

        const body: Record<string, unknown> = {
          name: nameEn.trim(),
          nameAr: nameAr.trim(),
          headlineEn: headlineEn.trim(),
          headlineAr: headlineAr.trim(),
          description: description.trim(),
        };
        if (imageUrl) body.image = imageUrl;
        if (slugEn.trim()) body.slug = slugEn.trim();
        if (slugAr.trim()) body.slugAr = slugAr.trim();

        if (editItem) {
          await updateCategory(
            (editItem as any)._id || editItem.id,
            body,
            token,
          );
          toast.success(t("savedSuccessfully") || "Saved");
        } else {
          await createCategory(body, token);
          toast.success(t("createdSuccessfully") || "Created");
        }
        resetAndClose();
        onSuccess?.();
      } catch (err: any) {
        toast.error(err?.message || t("saveFailed") || "Save failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      nameEn,
      nameAr,
      slugEn,
      slugAr,
      headlineEn,
      headlineAr,
      description,
      imageFile,
      imagePreview,
      editItem,
      token,
      resetAndClose,
      onSuccess,
      t,
    ],
  );

  const isEditing = !!editItem;
  const inputCls =
    "focus:border-primary/30 focus:ring-primary/5 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 text-sm outline-none transition-all focus:bg-white focus:ring-4";

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={resetAndClose}
      title={
        isEditing ? `${t("edit")} ${t("categoriesLabel")}` : t("createCategory")
      }
      titleId="create-category-title"
      footer={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetAndClose}
            className="flex-1 rounded-2xl border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600 transition-all hover:bg-gray-50"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            form="category-form"
            disabled={isSubmitting || !nameEn.trim() || !nameAr.trim()}
            className="shadow-primary/20 flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t("saving") : t("save")}
          </button>
        </div>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="cat-name-en"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            {t("categoryNameEn")} <span className="text-rose-500">*</span>
          </label>
          <input
            id="cat-name-en"
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="e.g. Electronics"
            required
            className={inputCls}
          />
        </div>
        <div>
          <label
            htmlFor="cat-name-ar"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            {t("categoryNameAr")} <span className="text-rose-500">*</span>
          </label>
          <input
            id="cat-name-ar"
            type="text"
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: إلكترونيات"
            required
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="cat-slug-en"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("slugEn")}
            </label>
            <input
              id="cat-slug-en"
              type="text"
              value={slugEn}
              onChange={(e) => setSlugEn(e.target.value)}
              placeholder={t("slugPlaceholder")}
              className={inputCls}
            />
          </div>
          <div>
            <label
              htmlFor="cat-slug-ar"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("slugAr")}
            </label>
            <input
              id="cat-slug-ar"
              type="text"
              dir="rtl"
              value={slugAr}
              onChange={(e) => setSlugAr(e.target.value)}
              placeholder={t("slugPlaceholder")}
              className={inputCls}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="cat-headline-en"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("headlineEn") || "Headline (EN)"}
            </label>
            <input
              id="cat-headline-en"
              type="text"
              value={headlineEn}
              onChange={(e) => setHeadlineEn(e.target.value)}
              placeholder="e.g. Best deals"
              className={inputCls}
            />
          </div>
          <div>
            <label
              htmlFor="cat-headline-ar"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("headlineAr") || "Headline (AR)"}
            </label>
            <input
              id="cat-headline-ar"
              type="text"
              dir="rtl"
              value={headlineAr}
              onChange={(e) => setHeadlineAr(e.target.value)}
              placeholder="مثال: أفضل العروض"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="cat-description"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            {t("description")} <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="cat-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder") || "Enter description"}
            required
            rows={3}
            className="focus:border-primary/30 focus:ring-primary/5 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:bg-white focus:ring-4"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            {t("uploadImage")}
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="hover:border-primary/30 hover:bg-primary/5 group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-6 transition-all"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                fileInputRef.current?.click();
            }}
          >
            {imagePreview ? (
              <div className="relative h-24 w-24 overflow-hidden rounded-2xl">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <>
                <div className="group-hover:bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 transition-colors group-hover:text-primary">
                  <Upload size={20} />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  {t("dragDropImage")}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {t("imageRequirementsNote")}
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/webp"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default CreateCategoryModal;
