"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "../UI/button";
import { ImageIcon, Upload, X } from "lucide-react";
import { Input } from "../UI/input";

// ---------------- Image Upload Component ----------------
export default function ImageUpload({
  value,
  onChange,
  language,
  type = "featured",
}: {
  value: string;
  onChange: (url: string) => void;
  language: "en" | "ar";
  type?: "featured" | "seo" | "breadcrumb";
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const t = {
    en: {
      choose_image: "Choose Image",
      upload_image: "Upload Image",
      add_from_url: "Add from URL",
      image_url: "Image URL",
      add_url: "Add URL",
      drag_drop: "Drag & drop image here or click to browse",
      browse: "Browse",
      remove_image: "Remove image",
      uploading: "Uploading...",
      featured_image: "Featured Image",
      meta_image: "Meta Image",
      breadcrumb_background: "Breadcrumb Background",
    },
    ar: {
      choose_image: "اختر صورة",
      upload_image: "رفع صورة",
      add_from_url: "إضافة من رابط",
      image_url: "رابط الصورة",
      add_url: "إضافة الرابط",
      drag_drop: "اسحب وأفلت الصورة هنا أو انقر للتصفح",
      browse: "تصفح",
      remove_image: "إزالة الصورة",
      uploading: "جاري الرفع...",
      featured_image: "الصورة الرئيسية",
      meta_image: "الصورة التعريفية",
      breadcrumb_background: "خلفية مسار التنقل",
    },
  }[language];

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert(
        language === "en"
          ? "Please select an image file"
          : "يرجى اختيار ملف صورة",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        language === "en"
          ? "Image size should be less than 5MB"
          : "يجب أن يكون حجم الصورة أقل من 5 ميجابايت",
      );
      return;
    }

    setIsUploading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const objectUrl = URL.createObjectURL(file);
      onChange(objectUrl);
    } catch (error) {
      console.error("Upload failed:", error);
      alert(language === "en" ? "Upload failed" : "فشل الرفع");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = (url: string) => {
    if (url) {
      onChange(url);
    }
  };

  const removeImage = () => {
    onChange("");
  };

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative">
          <Image
            src={value}
            alt={
              type === "featured"
                ? t.featured_image
                : type === "seo"
                  ? t.meta_image
                  : t.breadcrumb_background
            }
            width={200}
            height={200}
            className="max-h-64 w-full rounded-lg border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute right-2 top-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">{t.drag_drop}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            disabled={isUploading}
          >
            {isUploading ? t.uploading : t.browse}
          </Button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="space-y-2">
        <Input
          placeholder={t.image_url}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleUrlSubmit((e.target as HTMLInputElement).value);
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            const input =
              fileInputRef.current?.previousElementSibling?.querySelector(
                "input",
              ) as HTMLInputElement;
            if (input?.value) {
              handleUrlSubmit(input.value);
            }
          }}
        >
          <Upload className="mr-2 h-4 w-4" />
          {t.add_url}
        </Button>
      </div>
    </div>
  );
}
