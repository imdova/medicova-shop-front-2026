"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useAppLocale } from "@/hooks/useAppLocale";

import TagForm from "../components/TagForm";
import { createTag, TagData } from "@/services/tagService";
import { getCategories } from "@/services/categoryService";
import { MultiCategory } from "@/types";

export default function CreateTagPage() {
  const router = useRouter();
  const locale = useAppLocale();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [categories, setCategories] = useState<MultiCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories(token).then(setCategories).catch(console.error);
  }, [token]);

  const handleSubmit = async (data: TagData) => {
    setSubmitting(true);
    try {
      await createTag(data, token);
      toast.success(locale === "ar" ? "تمت الإضافة بنجاح" : "Tag created!");
      router.push("/admin/product-settings");
    } catch (error: any) {
      toast.error(error.message || "Failed to create tag");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <TagForm
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={submitting}
      />
    </div>
  );
}
