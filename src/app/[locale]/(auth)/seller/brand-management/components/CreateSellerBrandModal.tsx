"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
import { uploadImage } from "@/lib/uploadService";
import ModalWrapper from "../../../admin/categories/components/ModalWrapper";
import { 
  createSellerBrand, 
  updateSellerBrand, 
  checkSellerBrandExists,
  SellerBrand
} from "@/services/sellerBrandService";
import { extractSessionToken } from "@/lib/auth/sessionToken";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editItem?: SellerBrand | null;
  onSuccess?: () => void;
}

const CreateSellerBrandModal: React.FC<Props> = ({
  isOpen,
  onClose,
  editItem,
  onSuccess,
}) => {
  const t = useTranslations("admin");
  const ts = useTranslations("seller_brand_management");
  const { data: session } = useSession();
  const token = extractSessionToken(session);
  const sellerId = (session as any)?.user?.id || (session as any)?.user?._id;

  const [brandName, setBrandName] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editItem) {
        setBrandName("");
        setWebsiteLink("");
        setLogoPreview(null);
        setLogoFile(null);
        return;
    }
    setBrandName(editItem.brandName || "");
    setWebsiteLink(editItem.brandWebsiteLink || "");
    setLogoPreview(editItem.brandLogo || null);
  }, [editItem, isOpen]);

  const resetAndClose = useCallback(() => {
    setBrandName("");
    setWebsiteLink("");
    setLogoPreview(null);
    setLogoFile(null);
    onClose();
  }, [onClose]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        toast.error(t("pleaseUploadImageFile") || "Please upload an image file");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    [t],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!brandName.trim()) return;
      
      setIsSubmitting(true);
      try {
        // Check for duplicates only on creation
        if (!editItem) {
          const exists = await checkSellerBrandExists(brandName.trim(), token);
          if (exists) {
            toast.error(ts("checker.exists", { name: brandName.trim() }));
            setIsSubmitting(false);
            return;
          }
        }

        let finalLogoUrl = logoPreview;
        if (logoFile) {
          try {
            finalLogoUrl = await uploadImage(logoFile, "brand", token);
          } catch {
            toast.error(t("uploadFailed") || "Upload failed");
            setIsSubmitting(false);
            return;
          }
        }

        const payload = {
          sellerId,
          brandName: brandName.trim(),
          brandWebsiteLink: websiteLink.trim(),
          brandLogo: finalLogoUrl || "",
        };

        if (editItem) {
          await updateSellerBrand(editItem._id, payload, token);
          toast.success(t("savedSuccessfully") || "Saved");
        } else {
          await createSellerBrand(payload, token);
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
      brandName,
      websiteLink,
      logoPreview,
      logoFile,
      editItem,
      token,
      sellerId,
      resetAndClose,
      onSuccess,
      t,
      ts
    ],
  );

  const isEditing = !!editItem;
  const inputCls =
    "focus:border-primary/30 focus:ring-primary/5 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 text-sm outline-none transition-all focus:bg-white focus:ring-4";

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={resetAndClose}
      title={isEditing ? ts("modal.title") : ts("createBrand")}
      titleId="create-seller-brand-title"
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
            form="seller-brand-form"
            disabled={isSubmitting || !brandName.trim()}
            className="flex-1 rounded-2xl bg-primary py-3 text-sm font-bold text-white shadow-lg shadow-emerald-200/50 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "lab(58.4941% -47.8529 35.5714)" }}
          >
            {isSubmitting ? t("saving") : t("save")}
          </button>
        </div>
      }
    >
      <form id="seller-brand-form" onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="brand-name"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            {ts("modal.brandName")} <span className="text-rose-500">*</span>
          </label>
          <input
            id="brand-name"
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder={ts("modal.brandNamePlaceholder")}
            required
            className={inputCls}
          />
        </div>

        <div>
           <label
            htmlFor="brand-website"
            className="mb-1.5 block text-sm font-semibold text-gray-700"
          >
            {ts("modal.website")}
          </label>
          <input
            id="brand-website"
            type="url"
            value={websiteLink}
            onChange={(e) => setWebsiteLink(e.target.value)}
            placeholder={ts("modal.websitePlaceholder")}
            className={inputCls}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-700">
            {ts("modal.logo")}
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
            {logoPreview ? (
              <div className="relative h-32 w-32 overflow-hidden rounded-2xl">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  fill
                  className="object-contain p-2"
                />
              </div>
            ) : (
              <>
                <div className="group-hover:bg-primary/10 mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 transition-colors group-hover:text-primary">
                  <Upload size={20} />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  {ts("modal.addImage")}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {ts("modal.logoNote")}
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
      </form>
    </ModalWrapper>
  );
};

export default CreateSellerBrandModal;
