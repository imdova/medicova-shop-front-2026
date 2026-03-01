"use client";

import React, { useState, useCallback, useEffect } from "react";
import { ChevronDown, Upload, Plus, Trash2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  SubCategory,
  SubCategoryChild,
  createSubCategoryChild,
  updateSubCategoryChild,
  fetchSubCategoryChildById,
} from "../constants";
import { uploadImage } from "@/lib/uploadService";
import ModalWrapper from "./ModalWrapper";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  subCategories: SubCategory[];
  editItem?: SubCategoryChild | null;
  onSuccess?: () => void;
}

const CreateSubCategoryChildModal: React.FC<Props> = ({
  isOpen,
  onClose,
  subCategories,
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
  const [parentSubCategoryId, setParentSubCategoryId] = useState("");
  const [description, setDescription] = useState("");

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editItem) {
      resetForms();
      return;
    }

    setNameEn(editItem.name?.en || "");
    setNameAr(editItem.name?.ar || "");
    setSlugEn(editItem.slug || "");
    setSlugAr(editItem.slugAr || "");
    setParentSubCategoryId(editItem.parentSubCategoryId || "");
    setDescription(editItem.description || "");
    setImagePreview(editItem.image || editItem.icon || null);

    const itemId = editItem.id;
    fetchSubCategoryChildById(itemId, token)
      .then((data: any) => {
        if (!data) return;
        const item = data.subCategoryChild || data.data || data;
        setNameEn(item.name || "");
        setNameAr(item.nameAr || "");
        setSlugEn(item.slug || "");
        setSlugAr(item.slugAr || "");
        setDescription(item.description || "");
        setImagePreview(item.image || item.icon || null);
        const parentId = item.parentSubCategory?._id || item.parentSubCategory;
        if (parentId) setParentSubCategoryId(parentId);
      })
      .catch(() => {});
  }, [editItem, token]);

  const resetForms = () => {
    setNameEn("");
    setNameAr("");
    setSlugEn("");
    setSlugAr("");
    setParentSubCategoryId("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
  };

  const resetAndClose = useCallback(() => {
    resetForms();
    onClose();
  }, [onClose]);

  const handleFileChange = useCallback(
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
      if (!nameEn.trim() || !nameAr.trim() || !parentSubCategoryId) return;
      setIsSubmitting(true);
      try {
        let imageUrl = imagePreview;

        if (imageFile) {
          imageUrl = await uploadImage(imageFile, "subcategory-child", token);
        }

        const body: Record<string, unknown> = {
          name: nameEn.trim(),
          nameAr: nameAr.trim(),
          slug: slugEn.trim() || undefined,
          slugAr: slugAr.trim() || undefined,
          parentSubCategory: parentSubCategoryId,
          description: description.trim(),
          active: true,
          image: imageUrl || undefined,
          icon: imageUrl || undefined,
        };

        if (editItem) {
          await updateSubCategoryChild(editItem.id, body, token);
          toast.success(t("savedSuccessfully") || "Saved");
        } else {
          await createSubCategoryChild(body, token);
          toast.success(t("createdSuccessfully") || "Created");
        }
        resetAndClose();
        onSuccess?.();
      } catch (err: any) {
        toast.error(err?.message || "Save failed");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      nameEn,
      nameAr,
      slugEn,
      slugAr,
      parentSubCategoryId,
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

  const inputCls =
    "focus:border-primary/30 focus:ring-primary/5 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 text-sm outline-none transition-all focus:bg-white focus:ring-4";

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={resetAndClose}
      titleId="subcategory-child-modal-title"
      title={
        editItem
          ? `${t("edit")} ${t("subCategoryChildName")}`
          : t("createSubCategoryChild")
      }
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
            form="subcat-child-form"
            disabled={isSubmitting}
            className="shadow-primary/20 flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting ? t("saving") : t("save")}
          </button>
        </div>
      }
    >
      <form
        id="subcat-child-form"
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase text-gray-500">
              {t("categoryImage")}
            </span>
            <div
              className="hover:ring-primary/20 relative h-32 w-48 cursor-pointer overflow-hidden rounded-2xl bg-gray-50 ring-4 ring-gray-100 transition-all"
              onClick={() => imageInputRef.current?.click()}
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt="Image"
                  fill
                  className="object-cover"
                />
              ) : (
                <Upload
                  size={24}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-300"
                />
              )}
            </div>
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleFileChange}
              accept="image/webp"
              className="hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              {t("subCategory")} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={parentSubCategoryId}
                onChange={(e) => setParentSubCategoryId(e.target.value)}
                required
                className={`${inputCls} appearance-none`}
              >
                <option value="">{t("subCategory")}</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name[locale]}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              {t("nameEn")} *
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              {t("nameAr")} *
            </label>
            <input
              type="text"
              value={nameAr}
              dir="rtl"
              onChange={(e) => setNameAr(e.target.value)}
              required
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              {t("slugEn")}
            </label>
            <input
              type="text"
              value={slugEn}
              onChange={(e) => setSlugEn(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              {t("slugAr")}
            </label>
            <input
              type="text"
              value={slugAr}
              dir="rtl"
              onChange={(e) => setSlugAr(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            {t("description")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={`${inputCls} h-auto py-3`}
          />
        </div>
      </form>
    </ModalWrapper>
  );
};

export default CreateSubCategoryChildModal;
