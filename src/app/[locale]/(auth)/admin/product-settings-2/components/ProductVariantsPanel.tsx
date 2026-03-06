"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Plus, SlidersHorizontal, X, Loader2 } from "lucide-react";

import { useAppLocale } from "@/hooks/useAppLocale";
import { Input } from "@/components/shared/input";
import type { ProductOption } from "@/types/product";
import {
  createVariant,
  deleteVariant,
  getVariants,
  updateVariant,
} from "@/services/variantService";

type VariantEditorOption = {
  id: string;
  en: string;
  ar: string;
  price: number;
  stock: number;
};

type VariantEditorDraft = {
  id?: string;
  type: "dropdown" | "color" | "options";
  nameEn: string;
  nameAr: string;
  options: VariantEditorOption[];
};

function makeId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function fromVariant(v: ProductOption): VariantEditorDraft {
  return {
    id: v.id,
    type: (v.option_type as any) || "options",
    nameEn: v.name?.en || "",
    nameAr: v.name?.ar || "",
    options: (v.option_values || []).map((opt: any) => ({
      id: opt.id || makeId(),
      en: opt.label?.en || "",
      ar: opt.label?.ar || "",
      price: Number(opt.price || 0),
      stock: Number(opt.stock || 0),
    })),
  };
}

function makeEmptyDraft(): VariantEditorDraft {
  return {
    type: "options",
    nameEn: "",
    nameAr: "",
    options: [
      { id: makeId(), en: "Small", ar: "", price: 0, stock: 0 },
      { id: makeId(), en: "Medium", ar: "", price: 0, stock: 0 },
      { id: makeId(), en: "Large", ar: "", price: 0, stock: 0 },
    ],
  };
}

export default function ProductVariantsPanel() {
  const t = useTranslations("admin.productVariantsPage");
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const { data: session } = useSession();

  const token = (session as any)?.accessToken as string | undefined;

  const [variants, setVariants] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<VariantEditorDraft>(makeEmptyDraft);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await getVariants(token);
      if (!mounted) return;
      setVariants(data);
      const first = data[0];
      if (first) {
        setSelectedId(first.id);
        setDraft(fromVariant(first));
      } else {
        setSelectedId(null);
        setDraft(makeEmptyDraft());
      }
      setLoading(false);
    };
    run();
    return () => {
      mounted = false;
    };
  }, [token]);

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedId) || null,
    [variants, selectedId],
  );

  const activeCount = variants.length;

  const startCreate = () => {
    setSelectedId(null);
    setDraft(makeEmptyDraft());
  };

  const selectVariant = (v: ProductOption) => {
    setSelectedId(v.id);
    setDraft(fromVariant(v));
  };

  const removeVariant = async (id: string) => {
    if (!token) return;
    if (!confirm(isAr ? "حذف هذا المتغير؟" : "Delete this variable?")) return;
    try {
      await deleteVariant(id, token);
      setVariants((prev) => prev.filter((v) => v.id !== id));
      if (selectedId === id) {
        const next = variants.find((v) => v.id !== id) || null;
        if (next) {
          setSelectedId(next.id);
          setDraft(fromVariant(next));
        } else {
          startCreate();
        }
      }
    } catch {
      alert(isAr ? "فشل الحذف" : "Delete failed");
    }
  };

  const addOption = () => {
    setDraft((d) => ({
      ...d,
      options: [...d.options, { id: makeId(), en: "", ar: "", price: 0, stock: 0 }],
    }));
  };

  const updateOption = (id: string, next: Partial<VariantEditorOption>) => {
    setDraft((d) => ({
      ...d,
      options: d.options.map((o) => (o.id === id ? { ...o, ...next } : o)),
    }));
  };

  const removeOption = (id: string) => {
    setDraft((d) => ({ ...d, options: d.options.filter((o) => o.id !== id) }));
  };

  const handleSave = async () => {
    if (!token) return;

    const nameEn = draft.nameEn.trim();
    const nameAr = draft.nameAr.trim() || nameEn;
    const cleanOptions = draft.options
      .map((o) => ({
        ...o,
        en: o.en.trim(),
        ar: o.ar.trim(),
      }))
      .filter((o) => o.en.length > 0 || o.ar.length > 0);

    if (!nameEn) {
      alert(isAr ? "اكتب اسم المتغير" : "Please enter a variable name");
      return;
    }
    if (cleanOptions.length === 0) {
      alert(isAr ? "أضف خيارًا واحدًا على الأقل" : "Please add at least one option");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nameEn,
        nameAr,
        type: draft.type,
        createdBy: "admin" as const,
        optionsEn: cleanOptions.map((o) => ({
          optionName: o.en || o.ar,
          price: Number.isFinite(o.price) ? o.price : 0,
          stock: Number.isFinite(o.stock) ? o.stock : 0,
        })),
        optionsAr: cleanOptions.map((o) => ({
          optionName: o.ar || o.en,
          price: Number.isFinite(o.price) ? o.price : 0,
          stock: Number.isFinite(o.stock) ? o.stock : 0,
        })),
      };

      const saved = draft.id
        ? await updateVariant(draft.id, payload, token)
        : await createVariant(payload, token);

      setVariants((prev) => {
        const exists = prev.some((v) => v.id === saved.id);
        if (!exists) return [saved, ...prev];
        return prev.map((v) => (v.id === saved.id ? saved : v));
      });
      setSelectedId(saved.id);
      setDraft(fromVariant(saved));
    } catch {
      alert(isAr ? "فشل الحفظ" : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-700">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT: Variables list */}
        <div className="lg:col-span-4">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                    {isAr ? "متغيرات بنك الأسئلة" : "Question Bank Variables"}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      {isAr ? "المتغيرات" : "Variables"}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                      {activeCount} {isAr ? "نشط" : "Active"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startCreate}
                  className="inline-flex h-9 items-center gap-2 rounded-xl bg-emerald-600 px-3 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  {isAr ? "متغير جديد" : "Create New Variable"}
                </button>
              </div>
            </div>

            <div className="p-2">
              {loading ? (
                <div className="flex h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                </div>
              ) : variants.length === 0 ? (
                <div className="p-4 text-sm font-medium text-slate-500">
                  {isAr ? "لا توجد متغيرات بعد." : "No variables yet."}
                </div>
              ) : (
                <div className="space-y-1">
                  {variants.map((v) => {
                    const active = v.id === selectedId;
                    return (
                      <div
                        key={v.id}
                        className={[
                          "group flex items-center gap-2 rounded-xl px-3 py-2 transition",
                          active
                            ? "bg-emerald-50 ring-1 ring-emerald-100"
                            : "hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <button
                          type="button"
                          onClick={() => selectVariant(v)}
                          className="flex min-w-0 flex-1 items-center gap-2 text-left"
                        >
                          <span
                            className={[
                              "flex h-8 w-8 items-center justify-center rounded-lg ring-1",
                              active
                                ? "bg-white text-emerald-700 ring-emerald-100"
                                : "bg-white text-slate-500 ring-slate-100",
                            ].join(" ")}
                          >
                            <SlidersHorizontal className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-extrabold text-slate-900">
                              {v.name?.[locale] || v.name?.en || v.name?.ar || "—"}
                            </span>
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-rose-600"
                          aria-label={isAr ? "حذف" : "Delete"}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Editor */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                  {isAr ? "اسم المتغير" : "Variable Name"}
                </div>
                <div className="mt-2">
                  <Input
                    value={draft.nameEn}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, nameEn: e.target.value }))
                    }
                    placeholder={isAr ? "مثال: المقاس" : "e.g. size"}
                    className="h-11 rounded-xl border-slate-200 bg-white text-sm font-semibold"
                  />
                  {/* keep Arabic value supported, but visually minimal */}
                  <div className="mt-2">
                    <Input
                      value={draft.nameAr}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, nameAr: e.target.value }))
                      }
                      placeholder={isAr ? "مثال: المقاس" : "Arabic name (optional)"}
                      className="h-10 rounded-xl border-slate-200 bg-slate-50/60 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedVariant ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                    {t("editVariant")}
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-100">
                    {isAr ? "جديد" : "New"}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-xs font-black uppercase tracking-widest text-slate-500">
                {isAr ? "الخيارات المرتبطة" : "Related Options"}
              </div>
              <div className="mt-1 text-xs font-medium text-slate-400">
                {isAr
                  ? "أضف الخيارات التي ستظهر عند استخدام هذا المتغير."
                  : "Add the options that will be available when this variable is used (e.g. dropdown choices)."}
              </div>

              <div className="mt-3 space-y-2">
                {draft.options.map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <Input
                      value={opt.en}
                      onChange={(e) => updateOption(opt.id, { en: e.target.value })}
                      placeholder={isAr ? "الخيار (EN)" : "Option (EN)"}
                      className="h-10 rounded-xl border-slate-200 bg-white text-sm"
                    />
                    <Input
                      value={opt.ar}
                      onChange={(e) => updateOption(opt.id, { ar: e.target.value })}
                      placeholder={isAr ? "الخيار (AR)" : "Option (AR)"}
                      className="h-10 rounded-xl border-slate-200 bg-slate-50/60 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(opt.id)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                      aria-label={isAr ? "إزالة" : "Remove"}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addOption}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/40 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50"
                >
                  <Plus className="h-4 w-4" />
                  {isAr ? "إضافة خيار" : "Add option"}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading || !token}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-emerald-600 px-5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("saving")}
                  </span>
                ) : (
                  isAr ? "حفظ المتغير" : "Save Variable"
                )}
              </button>
              {!token ? (
                <p className="mt-2 text-xs font-medium text-slate-400">
                  {isAr
                    ? "سجّل الدخول كمسؤول لإدارة المتغيرات."
                    : "Sign in as admin to manage variants."}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

