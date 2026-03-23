"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Tag as TagIcon, X, Loader2, PencilIcon, TrashIcon, SlidersHorizontal, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import { getCategories } from "@/services/categoryService";
import { getTags, createTag, updateTag, deleteTag, TagData } from "@/services/tagService";
import { MultiCategory } from "@/types";
import { ProductTag } from "@/types/product";
import { Input } from "@/components/shared/input";
import { Button } from "@/components/shared/button";
import Modal from "@/components/shared/Modals/DynamicModal";

// Helper to generate a slug from text
function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\u0621-\u064A\s-]/g, "") // Keep alphanumeric, Arabic, spaces, hyphens
    .replace(/\s+/g, "-") // Spaces to hyphens
    .replace(/-+/g, "-") // Multiple hyphens to single
    .trim();
}

type TagEditorDraft = {
  id?: string;
  nameEn: string;
  nameAr: string;
  slugEn: string;
  slugAr: string;
  categoryId: string;
};

const makeEmptyDraft = (categoryId: string): TagEditorDraft => ({
  nameEn: "",
  nameAr: "",
  slugEn: "",
  slugAr: "",
  categoryId,
});

const fromTag = (tag: ProductTag): TagEditorDraft => ({
  id: tag.id,
  nameEn: tag.name.en,
  nameAr: tag.name.ar,
  slugEn: tag.slug,
  slugAr: tag.slugAr || "",
  categoryId: tag.categoryId || "",
});

export default function TagsListPanel() {
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const t = useTranslations("admin.productTagsPage");
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  // -- State --
  const [categories, setCategories] = useState<MultiCategory[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TagEditorDraft | null>(null);

  const [idToDelete, setIdToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  // -- Fetch Data --
  const fetchData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [cats, allTags] = await Promise.all([
        getCategories(token),
        getTags(token),
      ]);
      setCategories(cats);
      setTags(allTags);
      
      // Default to the first category if none selected
      if (cats.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(cats[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch tags data:", error);
      toast.error(isAr ? "فشل تحميل البيانات" : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [token, isAr, selectedCategoryId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // -- Derived --
  const filteredCategories = useMemo(() => {
    const q = catSearch.toLowerCase();
    return categories.filter(c => 
      c.title.en.toLowerCase().includes(q) || 
      c.title.ar.toLowerCase().includes(q)
    );
  }, [categories, catSearch]);

  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tags.forEach(tag => {
      if (tag.categoryId) {
        counts[tag.categoryId] = (counts[tag.categoryId] || 0) + 1;
      }
    });
    return counts;
  }, [tags]);

  const currentCategoryTags = useMemo(() => {
    if (!selectedCategoryId) return [];
    return tags.filter(tag => tag.categoryId === selectedCategoryId);
  }, [tags, selectedCategoryId]);

  const activeCategory = useMemo(() => 
    categories.find(c => c.id === selectedCategoryId) || null,
  [categories, selectedCategoryId]);

  // -- Handlers --
  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(id);
    setEditingTagId(null);
    setDraft(null); // Clear editor when switching category
  };

  const startCreate = () => {
    if (!selectedCategoryId) return;
    setEditingTagId("new");
    setDraft(makeEmptyDraft(selectedCategoryId));
  };

  const startEdit = (tag: ProductTag) => {
    setEditingTagId(tag.id);
    setDraft(fromTag(tag));
  };

  const cancelEdit = () => {
    setEditingTagId(null);
    setDraft(null);
  };

  const handleDelete = (id: string) => {
    setIdToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!token || !idToDelete) return;
    try {
      await deleteTag(idToDelete, token);
      setTags(prev => prev.filter(t => t.id !== idToDelete));
      toast.success(isAr ? "تم الحذف بنجاح" : "Deleted successfully");
    } catch {
      toast.error(isAr ? "فشل الحذف" : "Delete failed");
    } finally {
      setShowDeleteConfirm(false);
      setIdToDelete(null);
    }
  };

  const handleSave = async () => {
    if (!token || !draft || !selectedCategoryId) return;

    if (!draft.nameEn.trim() || !draft.nameAr.trim()) {
      toast.error(isAr ? "الاسم مطلوب باللغتين" : "Name is required in both languages");
      return;
    }

    setSaving(true);
    try {
      const payload: TagData = {
        nameEn: draft.nameEn.trim(),
        nameAr: draft.nameAr.trim(),
        slugEn: draft.slugEn.trim() || slugify(draft.nameEn),
        slugAr: draft.slugAr.trim() || slugify(draft.nameAr),
        categoryId: selectedCategoryId,
      };

      const saved = editingTagId === "new" 
        ? await createTag(payload, token)
        : await updateTag(editingTagId!, payload, token);

      setTags(prev => {
        const exists = prev.some(t => t.id === saved.id);
        if (!exists) return [...prev, saved];
        return prev.map(t => t.id === saved.id ? saved : t);
      });

      setEditingTagId(null);
      setDraft(null);
      toast.success(isAr ? "تم الحفظ بنجاح" : "Saved successfully");
    } catch (error: any) {
      toast.error(error.message || (isAr ? "فشل الحفظ" : "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  // -- Auto Slug Logic --
  const handleNameChange = (lang: "en" | "ar", val: string) => {
    if (!draft) return;
    const next = { ...draft };
    if (lang === "en") {
      next.nameEn = val;
      if (!editingTagId || editingTagId === "new") next.slugEn = slugify(val);
    } else {
      next.nameAr = val;
      if (!editingTagId || editingTagId === "new") next.slugAr = slugify(val);
    }
    setDraft(next);
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-700">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: Categories Sidebar */}
        <div className="lg:col-span-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {isAr ? "تصنيفات التاجز" : "Tag Classifications"}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      {isAr ? "الأقسام" : "Categories"}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                      {categories.length}
                    </span>
                  </div>
                </div>
                <TagIcon className="h-5 w-5 text-emerald-600/50" />
              </div>

              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={catSearch}
                  onChange={(e) => setCatSearch(e.target.value)}
                  placeholder={isAr ? "بحث عن قسم..." : "Search categories..."}
                  className="h-9 w-full rounded-xl border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium placeholder:text-slate-400 focus:border-emerald-500 focus:ring-0"
                />
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto p-2">
              <div className="space-y-1">
                {filteredCategories.map((cat) => {
                  const active = cat.id === selectedCategoryId;
                  const count = tagCounts[cat.id] || 0;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategory(cat.id)}
                      className={[
                        "group flex w-full items-center justify-between rounded-xl px-3 py-2.5 transition",
                        active
                          ? "bg-emerald-50 ring-1 ring-emerald-100"
                          : "hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={[
                            "flex h-8 w-8 items-center justify-center rounded-lg ring-1 transition",
                            active
                              ? "bg-white text-emerald-700 shadow-sm ring-emerald-100"
                              : "bg-slate-50 text-slate-400 ring-slate-100 group-hover:bg-white group-hover:text-emerald-600",
                          ].join(" ")}
                        >
                          <TagIcon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 text-left rtl:text-right">
                          <span className={[
                            "block truncate text-sm font-extrabold transition",
                            active ? "text-emerald-900" : "text-slate-600"
                          ].join(" ")}>
                            {cat.title[locale]}
                          </span>
                        </span>
                      </div>
                      <span className={[
                        "rounded-lg px-2 py-0.5 text-[10px] font-black transition",
                        active 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-700"
                      ].join(" ")}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Tags Content */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all">
            {/* Header Area */}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {isAr ? "الوسوم المتاحة" : "Available Tags"}
                </div>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {activeCategory ? activeCategory.title[locale] : (isAr ? "اختر قسماً" : "Select Category")}
                </h2>
              </div>
              
              <button
                type="button"
                onClick={startCreate}
                disabled={!selectedCategoryId}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-black text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {isAr ? "إضافة تاج جديد" : "Add New Tag"}
              </button>
            </div>

            {/* Editor Area (Conditional) */}
            {draft && (
              <div className="mb-8 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
                    {editingTagId === "new" ? (isAr ? "إنشاء تاج جديد" : "Create New Tag") : (isAr ? "تعديل التاج" : "Edit Tag")}
                  </span>
                  <button onClick={cancelEdit} className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 px-1">{isAr ? "الاسم (EN)" : "Name (EN)"}</label>
                    <Input 
                      value={draft.nameEn} 
                      onChange={(e) => handleNameChange("en", e.target.value)}
                      placeholder="e.g. Best Sellers"
                      className="h-10 rounded-xl border-slate-200 bg-white shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 px-1">{isAr ? "الاسم (AR)" : "Name (AR)"}</label>
                    <Input 
                      value={draft.nameAr} 
                      onChange={(e) => handleNameChange("ar", e.target.value)}
                      placeholder="مثال: الأكثر مبيعاً"
                      dir="rtl"
                      className="h-10 rounded-xl border-slate-200 bg-white shadow-sm text-right"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 px-1">{isAr ? "الرابط (EN)" : "Slug (EN)"}</label>
                    <Input 
                      value={draft.slugEn} 
                      onChange={(e) => setDraft(d => d ? ({ ...d, slugEn: slugify(e.target.value) }) : null)}
                      className="h-10 rounded-xl border-slate-200 bg-slate-50/50 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-slate-500 px-1">{isAr ? "الرابط (AR)" : "Slug (AR)"}</label>
                    <Input 
                      value={draft.slugAr} 
                      onChange={(e) => setDraft(d => d ? ({ ...d, slugAr: slugify(e.target.value) }) : null)}
                      dir="rtl"
                      className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-right font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button variant="ghost" onClick={cancelEdit} className="h-9 rounded-xl text-xs font-bold text-slate-500">
                    {isAr ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="h-9 rounded-xl bg-emerald-600 px-6 text-xs font-black shadow-emerald-200 shadow-md hover:bg-emerald-700"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : (isAr ? "حفظ" : "Save")}
                  </Button>
                </div>
              </div>
            )}

            {/* List Table Area */}
            <div className="overflow-hidden">
              {currentCategoryTags.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <TagIcon className="h-12 w-12 opacity-10" />
                  <p className="mt-2 text-sm font-medium">
                    {isAr ? "لا توجد تاجز لهذا القسم بعد." : "No tags for this category yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentCategoryTags.map((tag) => (
                    <div 
                      key={tag.id}
                      className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/30 p-3 transition hover:border-emerald-100 hover:bg-emerald-50/20"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 group-hover:ring-emerald-100 transition">
                          <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-slate-900">
                            {tag.name[locale]}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium text-slate-400 font-mono bg-slate-100 px-1.5 rounded">
                              {tag.slug}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => startEdit(tag)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100 transition hover:text-emerald-600 hover:ring-emerald-200"
                          title={isAr ? "تعديل" : "Edit"}
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-100 transition hover:text-rose-600 hover:ring-rose-200"
                          title={isAr ? "حذف" : "Delete"}
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} size="sm">
        <div className="p-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <X size={24} strokeWidth={2.5} />
          </div>
          <div className="mt-4 text-left rtl:text-right">
            <h3 className="text-lg font-black text-gray-900">
              {isAr ? "حذف التاج؟" : "Delete Tag?"}
            </h3>
            <p className="mt-2 text-sm font-medium text-gray-500">
              {isAr
                ? "هل أنت متأكد من حذف هذا التاج؟ لا يمكن التراجع عن هذا الإجراء."
                : "Are you sure you want to delete this tag? This action cannot be undone."}
            </p>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="h-10 rounded-xl border-gray-100 text-xs font-black">
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={confirmDelete} className="h-10 rounded-xl bg-rose-600 text-xs font-black text-white hover:bg-rose-700 shadow-lg shadow-rose-200">
              {isAr ? "تأكيد الحذف" : "Confirm Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
