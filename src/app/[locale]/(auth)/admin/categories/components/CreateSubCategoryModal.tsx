"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ChevronDown, Upload } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Category,
  SubCategory,
  createSubCategory,
  updateSubCategory,
  fetchSubCategoryById,
} from "../constants";
import { uploadImage } from "@/lib/uploadService";
import ModalWrapper from "./ModalWrapper";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  editItem?: SubCategory | null;
  onSuccess?: () => void;
}

const CreateSubCategoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  categories,
  editItem,
  onSuccess,
}) => {
  const t = useTranslations("admin");
  const locale = useLocale() as "en" | "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [slugEn, setSlugEn] = useState("");
  const [slugAr, setSlugAr] = useState("");
  const [headlineEn, setHeadlineEn] = useState("");
  const [headlineAr, setHeadlineAr] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editItem) return;
    setNameEn(editItem.name?.en || "");
    setNameAr(editItem.name?.ar || "");
    setSlugEn(editItem.slug || "");
    setSlugAr(editItem.slugAr || "");
    setHeadlineEn(editItem.headline?.en || "");
    setHeadlineAr(editItem.headline?.ar || "");
    const parent = categories.find(
      (c) => ((c as any)._id || c.id) === (editItem.categoryId || ""),
    );
    setParentCategoryId(
      (parent as any)?._id || parent?.id || editItem.categoryId || "",
    );
    setImagePreview(editItem.image || null);

    const itemId = (editItem as any)._id || editItem.id;
    fetchSubCategoryById(itemId, token)
      .then((data: any) => {
        if (!data) return;
        if (data.name) setNameEn(data.name);
        if (data.nameAr) setNameAr(data.nameAr);
        if (data.slug) setSlugEn(data.slug);
        if (data.slugAr) setSlugAr(data.slugAr);
        if (data.headlineEn) setHeadlineEn(data.headlineEn);
        if (data.headlineAr) setHeadlineAr(data.headlineAr);
        if (data.image) setImagePreview(data.image);
        const parentId =
          data.parentCategory?._id || data.parentCategory || data.category?._id;
        if (parentId) setParentCategoryId(parentId);
      })
      .catch(() => {});
  }, [editItem, categories, token]);

  const resetAndClose = useCallback(() => {
    setNameEn("");
    setNameAr("");
    setSlugEn("");
    setSlugAr("");
    setHeadlineEn("");
    setHeadlineAr("");
    setParentCategoryId("");
    setImageFile(null);
    setImagePreview(null);
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
      if (!nameEn.trim() || !nameAr.trim() || !parentCategoryId) return;
      setIsSubmitting(true);
      try {
        let imageUrl = imagePreview;
        if (imageFile) {
          try {
            imageUrl = await uploadImage(imageFile, "subcategory", token);
          } catch {
            toast.error(t("uploadFailed") || "Upload failed");
            setIsSubmitting(false);
            return;
          }
        }

        const body: Record<string, unknown> = {
          name: nameEn.trim(),
          nameAr: nameAr.trim(),
          description: nameEn.trim(),
          active: true,
          parentCategory: parentCategoryId,
          headlineEn: headlineEn.trim(),
          headlineAr: headlineAr.trim(),
        };
        if (imageUrl) body.image = imageUrl;
        if (slugEn.trim()) body.slug = slugEn.trim();
        if (slugAr.trim()) body.slugAr = slugAr.trim();

        if (editItem) {
          await updateSubCategory(
            (editItem as any)._id || editItem.id,
            body,
            token,
          );
          toast.success(t("savedSuccessfully") || "Saved");
        } else {
          await createSubCategory(body, token);
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
      parentCategoryId,
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
        isEditing
          ? `${t("edit")} ${t("subCategories")}`
          : t("createSubCategory")
      }
      titleId="create-subcategory-title"
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
            form="subcategory-form"
            disabled={
              isSubmitting ||
              !nameEn.trim() ||
              !nameAr.trim() ||
              !parentCategoryId
            }
            className="shadow-primary/20 flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t("saving") : t("save")}
          </button>
        </div>
      }
    >
      <form id="subcategory-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col items-center gap-4">
          <div
            className="hover:ring-primary/20 group relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-[2.5rem] bg-gray-50 ring-4 ring-gray-100 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="SubCategory"
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Upload className="text-white" size={24} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110">
                  <Upload size={20} className="text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {t("uploadImage")}
                </span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/webp"
            className="hidden"
          />
        </div>

        <div>
          <label
            htmlFor="parent-category"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            {t("parentCategory")} <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select
              id="parent-category"
              value={parentCategoryId}
              onChange={(e) => setParentCategoryId(e.target.value)}
              required
              className={`${inputCls} appearance-none`}
            >
              <option value="">{t("selectParentCategory")}</option>
              {categories.map((cat) => (
                <option
                  key={(cat as any)._id || cat.id}
                  value={(cat as any)._id || cat.id}
                >
                  {(cat.name as any)?.[locale] || ""}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="subcat-name-en"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            {t("subCategoryNameEn")} <span className="text-rose-500">*</span>
          </label>
          <input
            id="subcat-name-en"
            type="text"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="e.g. Smartphones"
            required
            className={inputCls}
          />
        </div>
        <div>
          <label
            htmlFor="subcat-name-ar"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            {t("subCategoryNameAr")} <span className="text-rose-500">*</span>
          </label>
          <input
            id="subcat-name-ar"
            type="text"
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: هواتف ذكية"
            required
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="subcat-slug-en"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("slugEn")}
            </label>
            <input
              id="subcat-slug-en"
              type="text"
              value={slugEn}
              onChange={(e) => setSlugEn(e.target.value)}
              placeholder={t("slugPlaceholder")}
              className={inputCls}
            />
          </div>
          <div>
            <label
              htmlFor="subcat-slug-ar"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("slugAr")}
            </label>
            <input
              id="subcat-slug-ar"
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
              htmlFor="subcat-headline-en"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("headlineEn") || "Headline (EN)"}
            </label>
            <input
              id="subcat-headline-en"
              type="text"
              value={headlineEn}
              onChange={(e) => setHeadlineEn(e.target.value)}
              placeholder="e.g. Best deals"
              className={inputCls}
            />
          </div>
          <div>
            <label
              htmlFor="subcat-headline-ar"
              className="mb-1.5 block text-sm font-semibold text-gray-700"
            >
              {t("headlineAr") || "Headline (AR)"}
            </label>
            <input
              id="subcat-headline-ar"
              type="text"
              dir="rtl"
              value={headlineAr}
              onChange={(e) => setHeadlineAr(e.target.value)}
              placeholder="مثال: أفضل العروض"
              className={inputCls}
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default CreateSubCategoryModal;
