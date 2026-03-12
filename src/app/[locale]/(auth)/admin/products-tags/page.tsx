"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, PencilIcon, TrashIcon, Tag as TagIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import TagsTable from "./components/TagsTable";
import { MultiCategory } from "@/types";
import { ProductTag } from "@/types/product";
import { getCategories } from "@/services/categoryService";
import { getTags, deleteTag } from "@/services/tagService";
import ConfirmDialog from "./components/ConfirmDialog";

export default function TagsListPanel() {
  const locale = useAppLocale();
  const t = useTranslations("admin.productTagsPage");
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  const router = useRouter();

  const [categories, setCategories] = useState<MultiCategory[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [deletingTag, setDeletingTag] = useState<ProductTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [cats, fetchedTags] = await Promise.all([
        getCategories(token),
        getTags(token),
      ]);
      setCategories(cats);
      setTags(fetchedTags);
    } catch (error) {
      console.error("Failed to fetch tags data:", error);
      toast.error("Failed to load tags");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCategoryName = (tag: ProductTag) => {
    const catId = (tag as any).categoryId;
    if (!catId) return "—";
    const cat = categories.find((c) => c.id === catId);
    return cat?.title[locale] ?? "—";
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: t("tagName"),
        render: (item: ProductTag) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{item.name[locale]}</span>
            <span className="text-[10px] text-gray-400">
              {locale === "en" ? item.name.ar : item.name.en}
            </span>
          </div>
        ),
      },
      {
        key: "slug",
        header: t("slug"),
        render: (item: ProductTag) => (
          <code className="rounded bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-500">
            {item.slug}
          </code>
        ),
      },
      {
        key: "category",
        header: t("category"),
        render: (item: ProductTag) => (
          <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {getCategoryName(item)}
          </span>
        ),
      },
    ],
    [t, locale],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return tags;
    const q = searchQuery.toLowerCase();
    return tags.filter(
      (tag) =>
        tag.name.en.toLowerCase().includes(q) ||
        tag.name.ar.toLowerCase().includes(q) ||
        tag.slug.toLowerCase().includes(q),
    );
  }, [tags, searchQuery]);

  const handleDelete = async () => {
    if (!deletingTag) return;
    try {
      await deleteTag(deletingTag.id, token);
      toast.success(
        locale === "ar" ? "تم الحذف بنجاح" : "Deleted successfully!",
      );
      setDeletingTag(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm">
            <TagIcon size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              {t("title")}
            </h1>
            <p className="mt-0.5 text-sm text-gray-400">{t("description")}</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/admin/products-tags/create")}
          className="shadow-primary/20 flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-black text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} />
          {t("addTag")}
        </button>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/20">
        <TagsTable
          tags={filteredData}
          categories={categories}
          onEdit={(tag) => router.push(`/admin/products-tags/edit/${tag.id}`)}
          onDelete={setDeletingTag}
        />
      </div>

      <ConfirmDialog
        open={!!deletingTag}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTag(null)}
      />
    </div>
  );
}
