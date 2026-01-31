import z from "zod";
import { BilingualInput } from "./BilingualInput";
import ImageUpload from "./ImageUpload";
import { seoSchema } from "@/constants/schemas/BuildPage";

type SEOData = z.infer<typeof seoSchema>;

// ---------------- SEO Manager Component ----------------
export default function SEOManager({
  seoData,
  onSeoChange,
  language,
}: {
  seoData: SEOData;
  onSeoChange: (seo: SEOData) => void;
  language: "en" | "ar";
}) {
  const t = {
    en: {
      meta_title: "Meta Title",
      meta_description: "Meta Description",
      meta_image: "Meta Image",
      choose_image: "Choose Image",
      preview: "Preview",
      image_url: "Image URL",
    },
    ar: {
      meta_title: "العنوان التعريفي",
      meta_description: "الوصف التعريفي",
      meta_image: "الصورة التعريفية",
      choose_image: "اختر صورة",
      preview: "معاينة",
      image_url: "رابط الصورة",
    },
  }[language];

  const handleImageSelect = (url: string) => {
    onSeoChange({ ...seoData, meta_image: url });
  };

  return (
    <div className="space-y-4">
      <BilingualInput
        value={{
          en: seoData?.meta_title?.en ?? "",
          ar: seoData?.meta_title?.ar ?? "",
        }}
        onChange={(value) => onSeoChange({ ...seoData, meta_title: value })}
        label={t.meta_title}
        placeholder={{
          en: "Enter meta title in English",
          ar: "أدخل العنوان التعريفي بالعربية",
        }}
        language={language}
      />

      <BilingualInput
        value={{
          en: seoData?.meta_description?.en ?? "",
          ar: seoData?.meta_description?.ar ?? "",
        }}
        onChange={(value) =>
          onSeoChange({ ...seoData, meta_description: value })
        }
        label={t.meta_description}
        placeholder={{
          en: "Enter meta description in English",
          ar: "أدخل الوصف التعريفي بالعربية",
        }}
        language={language}
        type="textarea"
      />

      <div>
        <label className="text-sm font-medium">{t.meta_image}</label>
        <ImageUpload
          value={seoData.meta_image || ""}
          onChange={handleImageSelect}
          language={language}
          type="seo"
        />
      </div>
    </div>
  );
}
