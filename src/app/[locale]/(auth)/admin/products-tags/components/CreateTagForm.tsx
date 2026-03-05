"use client";

import { useState, useCallback } from "react";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { slugify } from "@/services/categoryService";
import toast from "react-hot-toast";

interface CreateTagFormProps {
  categoryName: string;
  categoryId: string;
}

export default function CreateTagForm({
  categoryName,
  categoryId,
}: CreateTagFormProps) {
  const t = useTranslations("admin.productTagsPage");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    slugEn: "",
    slugAr: "",
  });

  const handleNameChange = useCallback(
    (field: "nameEn" | "nameAr", value: string) => {
      const slugField = field === "nameEn" ? "slugEn" : "slugAr";
      setForm((prev) => ({
        ...prev,
        [field]: value,
        [slugField]: slugify(value),
      }));
    },
    [],
  );

  const handleSlugChange = useCallback(
    (field: "slugEn" | "slugAr", value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameEn.trim() || !form.nameAr.trim()) return;

    setSaving(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((r) => setTimeout(r, 600));
      console.log("Creating tag:", { ...form, categoryId });
      toast.success("Tag created successfully!");
      setForm({ nameEn: "", nameAr: "", slugEn: "", slugAr: "" });
    } catch {
      toast.error("Failed to create tag");
    } finally {
      setSaving(false);
    }
  };

  const isValid = form.nameEn.trim() && form.nameAr.trim();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Category badge */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-6 py-4">
        <CheckCircle size={16} className="text-primary" />
        <span className="text-xs font-bold text-gray-500">
          {t("category")}:
        </span>
        <span className="bg-primary/10 rounded-lg px-3 py-1 text-xs font-bold text-primary">
          {categoryName}
        </span>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormInput
            id="name-en"
            label={t("titleEn")}
            value={form.nameEn}
            placeholder={t("titleEnPlaceholder")}
            onChange={(v) => handleNameChange("nameEn", v)}
            required
          />
          <FormInput
            id="name-ar"
            label={t("titleAr")}
            value={form.nameAr}
            placeholder={t("titleArPlaceholder")}
            onChange={(v) => handleNameChange("nameAr", v)}
            dir="rtl"
            required
          />
          <FormInput
            id="slug-en"
            label={t("slugEn")}
            value={form.slugEn}
            placeholder={t("slugEnPlaceholder")}
            onChange={(v) => handleSlugChange("slugEn", v)}
            mono
          />
          <FormInput
            id="slug-ar"
            label={t("slugAr")}
            value={form.slugAr}
            placeholder={t("slugArPlaceholder")}
            onChange={(v) => handleSlugChange("slugAr", v)}
            dir="rtl"
            mono
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || !isValid}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {t("saveTag")}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ── Reusable Form Input ────────────────────────────────── */
function FormInput({
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
        className={`focus:ring-primary/20 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm transition-all focus:border-primary focus:bg-white focus:outline-none focus:ring-2 ${
          mono ? "font-mono text-xs text-gray-500" : ""
        }`}
      />
    </div>
  );
}
