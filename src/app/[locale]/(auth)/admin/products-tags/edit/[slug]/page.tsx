"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useAppLocale } from "@/hooks/useAppLocale";

import TagForm from "../../components/TagForm";
import { getTags, updateTag, TagData } from "@/services/tagService";
import { getCategories } from "@/services/categoryService";
import { MultiCategory } from "@/types";
import Loading from "@/app/[locale]/loading";

export default function EditTagPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useAppLocale();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const tagId = params.slug as string;

  const [categories, setCategories] = useState<MultiCategory[]>([]);
  const [initialData, setInitialData] = useState<Partial<TagData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedCats, tags] = await Promise.all([
          getCategories(token),
          getTags(token),
        ]);
        setCategories(fetchedCats);

        const tag = tags.find((t) => t.id === tagId);
        if (tag) {
          setInitialData({
            nameEn: tag.name.en,
            nameAr: tag.name.ar,
            slugEn: tag.slug,
            slugAr: tag.slug,
            categoryId: (tag as any).categoryId || "",
            descriptionEn: (tag as any).description?.en || "",
            descriptionAr: (tag as any).description?.ar || "",
            metaTitleEn: (tag as any).meta_title?.en || "",
            metaTitleAr: (tag as any).meta_title?.ar || "",
            metaDescriptionEn: (tag as any).meta_description?.en || "",
            metaDescriptionAr: (tag as any).meta_description?.ar || "",
            noindex: tag.noindex === "true",
          });
        } else {
          toast.error("Tag not found");
          router.push("/admin/product-settings");
        }
      } catch (error) {
        console.error("Failed to load tag:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tagId, token, router]);

  const handleSubmit = async (data: TagData) => {
    setSubmitting(true);
    try {
      await updateTag(tagId, data, token);
      toast.success(locale === "ar" ? "تم التحديث بنجاح" : "Tag updated!");
      router.push("/admin/product-settings");
    } catch (error: any) {
      toast.error(error.message || "Failed to update tag");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {initialData && (
        <TagForm
          initialData={initialData}
          categories={categories}
          onSubmit={handleSubmit}
          isSubmitting={submitting}
        />
      )}
    </div>
  );
}
