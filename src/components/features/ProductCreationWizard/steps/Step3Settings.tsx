"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag,
  Layers,
  Plus,
  X,
  Settings2,
  Check,
  Box,
  Sparkles,
  Trash2,
  ChevronDown,
  Type,
  Palette,
  List,
  AlertCircle,
  Save,
  ArrowRight,
  ArrowLeft,
  LayoutGrid,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ProductFormData } from "@/lib/validations/product-schema";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import { getTags, createTag } from "@/services/tagService";
import { getVariants, createVariant } from "@/services/variantService";
import { ProductTag, ProductOption } from "@/types/product";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";

interface Step3SettingsProps {
  product: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
  locale: string;
}

const COLORS = {
  brand: "lab(58.4941% -47.8529 35.5714)",
  border: "border-gray-200",
  focus: "focus:border-gray-400 focus:ring-1 focus:ring-gray-400/10",
  label: "text-[10px] font-bold text-gray-500 uppercase tracking-tight",
  inputBg: "bg-white hover:bg-gray-50/50",
  text: "text-xs font-semibold text-gray-900 placeholder:font-normal placeholder:text-gray-300",
};

const VARIANT_TYPES = [
  { id: "dropdown", label: "Dropdown", icon: List },
  { id: "color", label: "Color Swatch", icon: Palette },
  { id: "options", label: "Text Swatch", icon: Type },
];

export const Step3Settings = ({
  product,
  onUpdate,
  errors,
  locale,
}: Step3SettingsProps) => {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const userRole = (session as any)?.user?.role;
  const userStoreId = (session as any)?.user?.storeId; // Assuming storeId is in session for sellers

  const [availableTags, setAvailableTags] = useState<ProductTag[]>([]);
  const [adminVariants, setAdminVariants] = useState<ProductOption[]>([]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [showCreateVariant, setShowCreateVariant] = useState(false);
  const [creationStep, setCreationStep] = useState(1);
  const [newTagName, setNewTagName] = useState({ en: "", ar: "" });

  const [editingVariantIdx, setEditingVariantIdx] = useState<number | null>(
    null,
  );

  const [creatingVariant, setCreatingVariant] = useState({
    nameEn: "",
    nameAr: "",
    type: "dropdown",
    options: [{ en: "", ar: "", price: "0", stock: "100", color: "#000000" }],
  });

  useEffect(() => {
    const fetch = async () => {
      const [tags, variants] = await Promise.all([
        getTags(token),
        getVariants(token),
      ]);
      setAvailableTags(tags);
      setAdminVariants(variants);
    };
    if (token) fetch();
  }, [token]);

  const toggleTag = (tagId: string) => {
    const current = product.tags || [];
    if (current.includes(tagId)) {
      onUpdate({ tags: current.filter((id) => id !== tagId) });
    } else {
      onUpdate({ tags: [...current, tagId] });
    }
  };

  const handleAddNewTag = async () => {
    if (!newTagName.en || !newTagName.ar) return;
    try {
      const created = await createTag(
        {
          nameEn: newTagName.en,
          nameAr: newTagName.ar,
          slugEn: newTagName.en.toLowerCase().replace(/ /g, "-"),
          slugAr: newTagName.ar.replace(/ /g, "-"),
          categoryId: product.classification.category || "",
        },
        token,
      );

      if (created) {
        setAvailableTags([...availableTags, created]);
        toggleTag(created.id);
        setNewTagName({ en: "", ar: "" });
        setShowAddTag(false);
      }
    } catch (e) {
      console.error("Failed to create tag", e);
    }
  };

  const handleCreateVariant = async () => {
    if (!creatingVariant.nameEn || !creatingVariant.nameAr) return;
    try {
      const payload = {
        nameEn: creatingVariant.nameEn,
        nameAr: creatingVariant.nameAr,
        type: creatingVariant.type,
        createdBy: "seller" as const,
        storeId: product.store || userStoreId,
        optionsEn: creatingVariant.options.map((o) => ({
          optionName: o.en || o.color || "Untitled",
          price: parseFloat(o.price) || 0,
          stock: parseInt(o.stock) || 0,
          // color: creatingVariant.type === "color" ? o.color : undefined,
        })),
        optionsAr: creatingVariant.options.map((o) => ({
          optionName: o.ar || o.en || o.color || "بدون عنوان",
          price: parseFloat(o.price) || 0,
          stock: parseInt(o.stock) || 0,
          // color: creatingVariant.type === "color" ? o.color : undefined,
        })),
      };

      const created = await createVariant(payload, token);
      if (created) {
        setAdminVariants([...adminVariants, created]);
        toggleVariant(created);
        setShowCreateVariant(false);
        setCreationStep(1);
        setCreatingVariant({
          nameEn: "",
          nameAr: "",
          type: "dropdown",
          options: [
            { en: "", ar: "", price: "0", stock: "100", color: "#000000" },
          ],
        });
      }
    } catch (e) {
      console.error("Failed to create variant", e);
    }
  };

  const toggleVariant = (v: ProductOption) => {
    const current = product.productVariants || [];
    const existsIdx = current.findIndex(
      (cv) => cv.nameEn === v.name.en || cv.nameAr === v.name.ar,
    );
    if (existsIdx !== -1) {
      onUpdate({ productVariants: current.filter((_, i) => i !== existsIdx) });
    } else {
      const newV = {
        id: v.id,
        nameEn: v.name.en,
        nameAr: v.name.ar,
        type: v.option_type,
        optionsEn: v.option_values.map((ov) => ({
          optionName: ov.label.en || (ov as any).color || "",
          price: parseFloat(ov.price),
          stock: (ov as any).stock || 0,
          color: (ov as any).color,
        })),
        optionsAr: v.option_values.map((ov) => ({
          optionName: ov.label.ar || (ov as any).color || "",
          price: parseFloat(ov.price),
          stock: (ov as any).stock || 0,
          color: (ov as any).color,
        })),
        createdBy: "admin" as const, // Initially admin if selected from library
      };
      onUpdate({ productVariants: [...current, newV as any] });
    }
  };

  const handleFullVariantUpdate = async (vIdx: number) => {
    const v = product.productVariants?.[vIdx];
    if (!v) return;

    try {
      const payload = {
        nameEn: v.nameEn,
        nameAr: v.nameAr,
        type: v.type,
        createdBy: "seller" as const,
        storeId: product.store || userStoreId,
        optionsEn: v.optionsEn.map((o) => ({
          optionName: o.optionName || (o as any).color || "Untitled",
          price: o.price,
          stock: o.stock,
          // color: v.type === "color" ? o.color : undefined,
        })),
        optionsAr: v.optionsAr.map((o) => ({
          optionName: o.optionName || (o as any).color || "بدون عنوان",
          price: o.price,
          stock: o.stock,
          // color: v.type === "color" ? o.color : undefined,
        })),
      };

      const created = await createVariant(payload, token);
      if (created) {
        const updated = [...(product.productVariants || [])];
        updated[vIdx] = {
          id: created.id,
          nameEn: created.name.en,
          nameAr: created.name.ar,
          type: created.option_type,
          optionsEn: created.option_values.map((ov) => ({
            optionName: ov.label.en,
            price: parseFloat(ov.price),
            stock: (ov as any).stock || 0,
            color: (ov as any).color,
          })),
          optionsAr: created.option_values.map((ov) => ({
            optionName: ov.label.ar,
            price: parseFloat(ov.price),
            stock: (ov as any).stock || 0,
            color: (ov as any).color,
          })),
          createdBy: "seller",
          storeId: product.store || userStoreId,
        } as any;
        onUpdate({ productVariants: updated });
        setEditingVariantIdx(null);
      }
    } catch (e) {
      console.error("Failed to specialize variant", e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 px-1 py-1"
    >
      {/* 1. Global Tags */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-gray-400" />
            <span className={COLORS.label}>Global Tags</span>
          </div>
          <button
            onClick={() => setShowAddTag(!showAddTag)}
            style={{ color: COLORS.brand }}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight transition-transform active:scale-95"
          >
            {showAddTag ? <X size={12} /> : <Plus size={12} />}{" "}
            {showAddTag ? "Close" : "New Tag"}
          </button>
        </div>
        <AnimatePresence>
          {showAddTag && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-gray-50/30 p-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className={COLORS.label}>
                    English Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={newTagName.en}
                    onChange={(e) =>
                      setNewTagName({ ...newTagName, en: e.target.value })
                    }
                    className="h-9 bg-white"
                    placeholder="e.g. Trendy Collections"
                  />
                </div>
                <div className="space-y-1.5" dir="rtl">
                  <Label className={COLORS.label}>
                    الاسم بالعربية <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={newTagName.ar}
                    onChange={(e) =>
                      setNewTagName({ ...newTagName, ar: e.target.value })
                    }
                    className="h-9 bg-white text-right"
                    placeholder="مثال: مجموعات رائجة"
                  />
                </div>
                <div className="md:col-span-2">
                  <DynamicButton
                    label="Register Tag"
                    onClick={handleAddNewTag}
                    style={{ backgroundColor: COLORS.brand }}
                    className="h-10 w-full rounded-xl text-xs font-black uppercase text-white shadow-xl shadow-teal-500/10"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-wrap gap-2">
          {availableTags.map((tag) => {
            const isSelected = product.tags?.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-tight transition-all ${isSelected ? "border-gray-900 bg-gray-900 text-white shadow-lg" : "border-gray-100 bg-white text-gray-400 hover:border-gray-300"}`}
              >
                {tag.name?.[locale as "en" | "ar"] || "Untitled"}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Variation Management */}
      <section className="space-y-8">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-gray-400" />
            <span className={COLORS.label}>Variation Library</span>
          </div>
          <button
            onClick={() => setShowCreateVariant(!showCreateVariant)}
            style={{ color: COLORS.brand }}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight transition-transform active:scale-95"
          >
            {showCreateVariant ? <X size={12} /> : <Sparkles size={12} />}{" "}
            {showCreateVariant ? "Discard" : "Create Custom"}
          </button>
        </div>

        {/* Library Grid */}
        {!showCreateVariant && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {adminVariants.map((v) => {
              const isSelected = product.productVariants?.some(
                (cv) =>
                  cv.nameEn === (v.name?.en || "") ||
                  cv.nameAr === (v.name?.ar || ""),
              );
              return (
                <motion.div
                  key={v.id}
                  onClick={() => toggleVariant(v)}
                  whileHover={{ y: -2 }}
                  className={`group flex cursor-pointer flex-col rounded-2xl border p-4 transition-all ${isSelected ? "border-gray-900 bg-gray-900 text-white shadow-2xl" : "border-gray-100 bg-white shadow-sm hover:border-gray-300"}`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className="max-w-[80%] truncate text-[10px] font-black uppercase leading-none tracking-widest">
                      {v.name?.[locale as "en" | "ar"] || "Untitled"}
                    </span>
                    {isSelected && <Check size={12} />}
                  </div>
                  <div className="mt-auto flex flex-wrap gap-1">
                    {v.option_values.slice(0, 2).map((ov, i) => (
                      <span
                        key={i}
                        className={`rounded border px-1.5 py-0.5 text-[8px] ${isSelected ? "border-white/20 text-white/70" : "border-gray-50 text-gray-400"}`}
                      >
                        {ov.label?.[locale as "en" | "ar"] || "Unknown"}
                      </span>
                    ))}
                    {v.option_values.length > 2 && (
                      <span className="self-center text-[8px] opacity-40">
                        +{v.option_values.length - 2}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Creation Box */}
        <AnimatePresence>
          {showCreateVariant && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl"
            >
              <div className="mb-8 flex items-center gap-6 border-b border-gray-50 pb-6">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`flex items-center gap-2 ${creationStep === step ? "text-gray-900" : "text-gray-300"}`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${creationStep === step ? "bg-gray-900 text-white" : "bg-gray-100"}`}
                    >
                      {step}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {step === 1 ? "Type" : step === 2 ? "Identity" : "Values"}
                    </span>
                    {step < 3 && (
                      <ChevronDown
                        size={14}
                        className="-rotate-90 text-gray-100"
                      />
                    )}
                  </div>
                ))}
              </div>

              {creationStep === 1 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {VARIANT_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setCreatingVariant({
                          ...creatingVariant,
                          type: type.id,
                        });
                        setCreationStep(2);
                      }}
                      className={`flex flex-col items-center gap-4 rounded-2xl border p-6 transition-all ${creatingVariant.type === type.id ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900" : "border-gray-100 hover:border-gray-300"}`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${creatingVariant.type === type.id ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-400"}`}
                      >
                        <type.icon size={20} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {creationStep === 2 && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className={COLORS.label}>
                      Public Name (EN) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      autoFocus
                      placeholder="e.g. Material or Size"
                      value={creatingVariant.nameEn}
                      onChange={(e) =>
                        setCreatingVariant({
                          ...creatingVariant,
                          nameEn: e.target.value,
                        })
                      }
                      className="h-10 text-sm font-bold"
                    />
                  </div>
                  <div className="space-y-1.5" dir="rtl">
                    <Label className={COLORS.label}>
                      الاسم للمشتري (AR) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="مثال: الخامة أو المقاس"
                      value={creatingVariant.nameAr}
                      onChange={(e) =>
                        setCreatingVariant({
                          ...creatingVariant,
                          nameAr: e.target.value,
                        })
                      }
                      className="h-10 text-right text-sm font-bold"
                    />
                  </div>
                  <div className="flex justify-between pt-6 md:col-span-2">
                    <button
                      onClick={() => setCreationStep(1)}
                      className="flex items-center gap-2 text-[10px] font-black text-gray-400"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      onClick={() => setCreationStep(3)}
                      disabled={
                        !creatingVariant.nameEn || !creatingVariant.nameAr
                      }
                      className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2 text-[10px] font-black text-white disabled:opacity-30"
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {creationStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <span className={COLORS.label}>Options & Stock</span>
                    <button
                      onClick={() =>
                        setCreatingVariant({
                          ...creatingVariant,
                          options: [
                            ...creatingVariant.options,
                            {
                              en: "",
                              ar: "",
                              price: "0",
                              stock: "100",
                              color: "#000000",
                            },
                          ],
                        })
                      }
                      className="text-[10px] font-black uppercase text-teal-600"
                    >
                      + Add Option
                    </button>
                  </div>
                  <div className="custom-scrollbar max-h-[300px] space-y-3 overflow-y-auto pr-2">
                    {creatingVariant.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className="group relative grid grid-cols-1 items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 shadow-sm md:grid-cols-12"
                      >
                        {creatingVariant.type === "color" && (
                          <div className="relative h-9 w-9 md:col-span-1">
                            <input
                              type="color"
                              value={opt.color}
                              onChange={(e) => {
                                const n = [...creatingVariant.options];
                                n[idx].color = e.target.value;
                                setCreatingVariant({
                                  ...creatingVariant,
                                  options: n,
                                });
                              }}
                              className="absolute inset-0 h-full w-full cursor-pointer overflow-hidden rounded-lg border-2 border-white shadow-sm"
                            />
                          </div>
                        )}
                        <div
                          className={`${creatingVariant.type === "color" ? "md:col-span-3" : "md:col-span-4"}`}
                        >
                          <Input
                            placeholder="Label (EN)"
                            value={opt.en}
                            onChange={(e) => {
                              const n = [...creatingVariant.options];
                              n[idx].en = e.target.value;
                              setCreatingVariant({
                                ...creatingVariant,
                                options: n,
                              });
                            }}
                            className="h-8 border-none bg-white text-xs font-bold"
                          />
                        </div>
                        <div className="md:col-span-4">
                          <Input
                            placeholder="Label (AR)"
                            value={opt.ar}
                            dir="rtl"
                            onChange={(e) => {
                              const n = [...creatingVariant.options];
                              n[idx].ar = e.target.value;
                              setCreatingVariant({
                                ...creatingVariant,
                                options: n,
                              });
                            }}
                            className="h-8 border-none bg-white text-right text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <div className="flex items-center gap-1 rounded border border-gray-100 bg-white px-2">
                            <span className="text-[8px] font-black text-teal-500">
                              $
                            </span>
                            <Input
                              type="number"
                              value={opt.price}
                              onChange={(e) => {
                                const n = [...creatingVariant.options];
                                n[idx].price = e.target.value;
                                setCreatingVariant({
                                  ...creatingVariant,
                                  options: n,
                                });
                              }}
                              className="h-7 border-none p-0 text-right font-mono text-xs font-black"
                            />
                          </div>
                        </div>
                        <div className="space-y-1 md:col-span-1">
                          <div className="flex items-center gap-1 rounded border border-gray-100 bg-white px-2">
                            <span className="text-[8px] font-black text-gray-400">
                              #
                            </span>
                            <Input
                              type="number"
                              value={opt.stock}
                              onChange={(e) => {
                                const n = [...creatingVariant.options];
                                n[idx].stock = e.target.value;
                                setCreatingVariant({
                                  ...creatingVariant,
                                  options: n,
                                });
                              }}
                              className="h-7 border-none p-0 text-right font-mono text-xs font-black"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setCreatingVariant({
                              ...creatingVariant,
                              options: creatingVariant.options.filter(
                                (_, i) => i !== idx,
                              ),
                            })
                          }
                          className="absolute -right-2 top-1/2 -translate-y-1/2 text-gray-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between border-t border-gray-50 pt-8">
                    <button
                      onClick={() => setCreationStep(2)}
                      className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <DynamicButton
                      label="Finish Variation"
                      onClick={handleCreateVariant}
                      style={{ backgroundColor: COLORS.brand }}
                      className="h-10 rounded-xl px-12 text-xs font-black uppercase text-white shadow-2xl shadow-teal-500/20"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assigned Configurations */}
        {product.productVariants && product.productVariants.length > 0 && (
          <div className="grid grid-cols-1 gap-6 pt-4">
            <div className="flex items-center gap-3 border-b border-gray-50 pb-3">
              <LayoutGrid size={16} className="text-gray-900" />
              <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-900">
                Active Configurations
              </h4>
            </div>
            {product.productVariants.map((v, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/40 px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 shadow-sm">
                      <Settings2 size={18} />
                    </div>
                    <div>
                      {editingVariantIdx === idx ? (
                        <div className="flex gap-2">
                          <Input
                            value={v.nameEn}
                            onChange={(e) => {
                              const n = [...product.productVariants];
                              n[idx].nameEn = e.target.value;
                              onUpdate({ productVariants: n });
                            }}
                            className="h-7 w-32 text-[10px] font-black"
                          />
                          <Input
                            dir="rtl"
                            value={v.nameAr}
                            onChange={(e) => {
                              const n = [...product.productVariants];
                              n[idx].nameAr = e.target.value;
                              onUpdate({ productVariants: n });
                            }}
                            className="h-7 w-32 text-right text-[10px] font-black"
                          />
                        </div>
                      ) : (
                        <>
                          <h5 className="text-xs font-black uppercase text-gray-900">
                            {v.nameEn} / {v.nameAr}
                          </h5>
                          <span className="text-[8px] font-black uppercase tracking-tighter text-gray-400">
                            {v.type} • {v.optionsEn.length} Choices
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setEditingVariantIdx(
                          editingVariantIdx === idx ? null : idx,
                        )
                      }
                      className={`rounded-full px-4 py-1.5 text-[9px] font-black uppercase transition-all ${editingVariantIdx === idx ? "bg-orange-500 text-white" : "border border-gray-100 bg-white text-gray-500 hover:border-gray-900"}`}
                    >
                      {editingVariantIdx === idx ? "Editing..." : "Full Edit"}
                    </button>
                    <button
                      onClick={() =>
                        onUpdate({
                          productVariants: product.productVariants.filter(
                            (_, i) => i !== idx,
                          ),
                        })
                      }
                      className="text-gray-300 transition-colors hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {(editingVariantIdx === idx
                      ? v.optionsEn
                      : v.optionsEn
                    ).map((o, oIdx) => (
                      <div
                        key={oIdx}
                        className={`rounded-2xl border p-4 transition-all ${editingVariantIdx === idx ? "border-orange-200 bg-orange-50/10" : "border-gray-50 bg-gray-50/20"}`}
                      >
                        <div className="mb-3 flex items-center justify-between border-b border-gray-50 pb-2">
                          <div className="flex items-center gap-2 truncate">
                            {v.type === "color" && (
                              <div
                                className="h-3 w-3 shrink-0 rounded-full border border-white"
                                style={{ backgroundColor: o.color }}
                              />
                            )}
                            <span className="max-w-[80px] truncate text-[10px] font-black uppercase">
                              {o.optionName}
                            </span>
                          </div>
                          <span className="font-mono text-[9px] font-black tracking-tighter text-teal-600 transition-all group-hover:scale-110">
                            ${o.price}
                          </span>
                        </div>

                        {editingVariantIdx === idx ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[7px] font-black uppercase text-gray-400">
                                  Label EN
                                </label>
                                <Input
                                  value={o.optionName}
                                  onChange={(e) => {
                                    const n = [...product.productVariants];
                                    n[idx].optionsEn[oIdx].optionName =
                                      e.target.value;
                                    onUpdate({ productVariants: n });
                                  }}
                                  className="h-7 bg-white text-[9px]"
                                />
                              </div>
                              <div className="space-y-1" dir="rtl">
                                <label className="text-[7px] font-black uppercase text-gray-400">
                                  الاسم AR
                                </label>
                                <Input
                                  value={v.optionsAr[oIdx].optionName}
                                  onChange={(e) => {
                                    const n = [...product.productVariants];
                                    n[idx].optionsAr[oIdx].optionName =
                                      e.target.value;
                                    onUpdate({ productVariants: n });
                                  }}
                                  className="h-7 bg-white text-right text-[9px]"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[7px] font-black uppercase text-gray-400">
                                  Price (+)
                                </label>
                                <Input
                                  type="number"
                                  value={o.price}
                                  onChange={(e) => {
                                    const n = [...product.productVariants];
                                    n[idx].optionsEn[oIdx].price = n[
                                      idx
                                    ].optionsAr[oIdx].price = parseFloat(
                                      e.target.value,
                                    );
                                    onUpdate({ productVariants: n });
                                  }}
                                  className="h-7 bg-white font-mono text-[9px] text-teal-600"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[7px] font-black uppercase text-gray-400">
                                  Stock
                                </label>
                                <Input
                                  type="number"
                                  value={o.stock}
                                  onChange={(e) => {
                                    const n = [...product.productVariants];
                                    n[idx].optionsEn[oIdx].stock = n[
                                      idx
                                    ].optionsAr[oIdx].stock = parseInt(
                                      e.target.value,
                                    );
                                    onUpdate({ productVariants: n });
                                  }}
                                  className="h-7 bg-white font-mono text-[9px]"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-gray-400">
                              Inventory:{" "}
                              <span className="text-gray-900">{o.stock}</span>
                            </span>
                            <span className="max-w-[60px] truncate text-[8px] font-black uppercase text-gray-300">
                              {v.optionsAr[oIdx].optionName}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {editingVariantIdx === idx && (
                      <button
                        onClick={() => {
                          const n = [...product.productVariants];
                          n[idx].optionsEn.push({
                            optionName: "",
                            price: 0,
                            stock: 100,
                          });
                          n[idx].optionsAr.push({
                            optionName: "",
                            price: 0,
                            stock: 100,
                          });
                          onUpdate({ productVariants: n });
                        }}
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-100 p-4 text-center text-orange-400 transition-all hover:bg-orange-50"
                      >
                        <Plus size={14} />{" "}
                        <span className="text-[9px] font-black uppercase">
                          Add Option
                        </span>
                      </button>
                    )}
                  </div>

                  {editingVariantIdx === idx && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 flex items-center justify-between rounded-3xl border border-orange-100 bg-orange-50/20 p-6"
                    >
                      <div className="flex items-center gap-4 text-orange-600">
                        <AlertCircle size={20} className="shrink-0" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-tight">
                            Sync & Specialize
                          </p>
                          <p className="text-[9px] font-medium opacity-80">
                            Saving will create a new variant type specific to
                            your catalog, preserving existing global options.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleFullVariantUpdate(idx)}
                        className="flex items-center gap-2 rounded-2xl bg-orange-500 px-8 py-3 text-[10px] font-black uppercase text-white shadow-xl shadow-orange-500/20 transition-all hover:scale-[1.02] active:scale-95"
                      >
                        <Save size={16} /> Save Changes
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {(!product.productVariants || product.productVariants.length === 0) &&
          !showCreateVariant && (
            <div className="flex flex-col items-center justify-center rounded-[40px] border-2 border-dashed border-gray-100 bg-gray-50/20 py-24 text-gray-200">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[32px] border border-gray-50 bg-white shadow-sm">
                <Box size={32} className="opacity-10" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                Modular Library Empty
              </p>
            </div>
          )}
      </section>
    </motion.div>
  );
};
