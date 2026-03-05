"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { slugify } from "@/services/categoryService";

export interface TagFormData {
  titleEn: string;
  titleAr: string;
  slugEn: string;
  slugAr: string;
}

interface TagFormProps {
  initialData?: TagFormData;
  isEditing: boolean;
  onSubmit: (data: TagFormData) => void;
  onCancel: () => void;
}

export default function TagForm({
  initialData,
  isEditing,
  onSubmit,
  onCancel,
}: TagFormProps) {
  const t = useTranslations("admin.productTagsPage");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<TagFormData>({
    titleEn: initialData?.titleEn ?? "",
    titleAr: initialData?.titleAr ?? "",
    slugEn: initialData?.slugEn ?? "",
    slugAr: initialData?.slugAr ?? "",
  });

  // Reset form when initialData changes (switching to edit mode)
  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ titleEn: "", titleAr: "", slugEn: "", slugAr: "" });
    }
  }, [initialData]);

  // Auto-generate slugs from titles
  const handleTitleChange = useCallback(
    (field: "titleEn" | "titleAr", value: string) => {
      const slugField = field === "titleEn" ? "slugEn" : "slugAr";
      setForm((prev) => ({
        ...prev,
        [field]: value,
        [slugField]: slugify(value),
      }));
    },
    [],
  );

  const handleFieldChange = useCallback(
    (field: keyof TagFormData, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titleEn.trim() || !form.titleAr.trim()) return;
    setSaving(true);
    try {
      onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-primary/20 from-primary/[0.03] rounded-2xl border bg-gradient-to-br to-transparent p-5"
      aria-label={isEditing ? t("editTag") : t("addTag")}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">
          {isEditing ? t("editTag") : t("addTag")}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          aria-label={t("cancelForm")}
        >
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Title EN */}
        <InputField
          id="tag-title-en"
          label={t("titleEn")}
          value={form.titleEn}
          placeholder={t("titleEnPlaceholder")}
          onChange={(v) => handleTitleChange("titleEn", v)}
          required
        />
        {/* Title AR */}
        <InputField
          id="tag-title-ar"
          label={t("titleAr")}
          value={form.titleAr}
          placeholder={t("titleArPlaceholder")}
          onChange={(v) => handleTitleChange("titleAr", v)}
          dir="rtl"
          required
        />
        {/* Slug EN */}
        <InputField
          id="tag-slug-en"
          label={t("slugEn")}
          value={form.slugEn}
          placeholder={t("slugEnPlaceholder")}
          onChange={(v) => handleFieldChange("slugEn", v)}
          mono
        />
        {/* Slug AR */}
        <InputField
          id="tag-slug-ar"
          label={t("slugAr")}
          value={form.slugAr}
          placeholder={t("slugArPlaceholder")}
          onChange={(v) => handleFieldChange("slugAr", v)}
          dir="rtl"
          mono
        />
      </div>

      {/* Actions */}
      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100"
        >
          {t("cancelForm")}
        </button>
        <button
          type="submit"
          disabled={saving || !form.titleEn.trim() || !form.titleAr.trim()}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {isEditing ? t("updateTag") : t("saveTag")}
        </button>
      </div>
    </form>
  );
}

/* ── Reusable Input ─────────────────────────────────────────── */
function InputField({
  id,
  label,
  value,
  placeholder,
  onChange,
  dir,
  mono,
  required,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  dir?: "rtl" | "ltr";
  mono?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold text-gray-600"
      >
        {label}
        {required && <span className="ms-0.5 text-red-500">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        required={required}
        className={`focus:ring-primary/20 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 ${
          mono ? "font-mono text-xs text-gray-500" : ""
        }`}
      />
    </div>
  );
}
