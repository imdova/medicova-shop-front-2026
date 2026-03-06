"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Check,
  RefreshCw,
  Plus,
  Tag,
  Trash2,
  ListRestart,
  Calendar,
  Users,
  X,
  Info,
  ImageIcon,
  UploadCloud,
  Video,
  PlayCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ProductFormData } from "@/lib/validations/product-schema";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import { Textarea } from "@/components/shared/textarea";
import {
  getCategories,
  getSubCategories,
  getSubCategoryChildren,
} from "@/services/categoryService";
import { getBrands } from "@/services/brandService";
import { getSellers } from "@/services/sellerService";
import { getTags } from "@/services/tagService";
import { MultiCategory, Brand } from "@/types";
import { apiClient } from "@/lib/apiClient";
import Image from "next/image";
import { ProductTag } from "@/types/product";

interface Step1CoreInfoProps {
  product: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
  locale: string;
}

// Standardized Design Tokens
const COLORS = {
  brand: "lab(58.4941% -47.8529 35.5714)",
  border: "border-gray-200",
  focus: "focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
  label: "text-sm font-semibold text-gray-800",
  inputBg: "bg-white",
  text: "text-sm text-gray-900 placeholder:font-normal placeholder:text-sm placeholder:text-gray-400",
};

const SearchableSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  locale,
  icon: Icon,
}: {
  label: string;
  options: any[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  locale: string;
  icon?: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = options.filter((opt) => {
    const text = (
      opt.title?.[locale] ||
      opt.name?.[locale] ||
      opt.displayName ||
      ""
    ).toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const selectedOpt = options.find((opt) => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      <Label className={COLORS.label}>{label}</Label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 cursor-pointer items-center justify-between rounded-lg border bg-white px-3 transition-all ${isOpen ? `ring-primary/10 border-primary ring-2` : `border-gray-200 hover:border-gray-300`}`}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={16} className="text-gray-400" />}
          <span
            className={`${selectedOpt ? "text-sm text-gray-900" : "text-sm text-gray-400"} truncate`}
          >
            {selectedOpt
              ? selectedOpt.title?.[locale] ||
                selectedOpt.name?.[locale] ||
                selectedOpt.displayName
              : placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
          >
            <div className="relative mb-1.5">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                autoFocus
                className="h-9 w-full rounded-lg border border-gray-100 bg-gray-50 pl-9 pr-3 text-sm outline-none focus:border-gray-200"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="custom-scrollbar max-h-[180px] overflow-y-auto">
              {filtered.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <span className="truncate">
                    {opt.title?.[locale] ||
                      opt.name?.[locale] ||
                      opt.displayName}
                  </span>
                  {value === opt.id && (
                    <Check size={14} className="shrink-0 text-primary" />
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-3 text-center text-sm text-gray-400">
                  No results
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RESERVED_SPEC_KEYS = new Set(
  [
    "sizes",
    "colors",
    "variant stock",
    "color images",
    "shipping required",
    "shipping fees",
    "shipping packages",
  ].map((s) => s.toLowerCase()),
);

export const Step1CoreInfo = ({
  product,
  onUpdate,
  errors,
  locale,
}: Step1CoreInfoProps) => {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const userRole = (session as any)?.user?.role;
  const [categories, setCategories] = useState<MultiCategory[]>([]);
  const [subCategories, setSubCategories] = useState<MultiCategory[]>([]);
  const [subCategoryChildren, setSubCategoryChildren] = useState<
    MultiCategory[]
  >([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<ProductTag[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [tagOpen, setTagOpen] = useState(false);
  const tagBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const imgs = (product.images || []) as any[];
    const created: string[] = [];
    const urls = imgs.map((img) => {
      if (typeof img === "string") return img;
      const u = URL.createObjectURL(img as File);
      created.push(u);
      return u;
    });
    setImageUrls(urls);
    return () => {
      created.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [product.images]);

  const primaryImageUrl = imageUrls[0] ?? null;

  const handleUploadPrimaryImage = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const picked = Array.from(files);
      const current = product.images || [];
      onUpdate({ images: [...picked, ...current] });
    },
    [onUpdate, product.images],
  );

  const handleRemovePrimaryImage = useCallback(() => {
    const current = product.images || [];
    if (current.length === 0) return;
    onUpdate({ images: current.slice(1) });
  }, [onUpdate, product.images]);

  const handleUploadGalleryImages = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const picked = Array.from(files);
      const current = product.images || [];
      onUpdate({ images: [...current, ...picked] });
    },
    [onUpdate, product.images],
  );

  const handleRemoveImageAt = useCallback(
    (idx: number) => {
      const current = product.images || [];
      if (!current[idx]) return;
      onUpdate({ images: current.filter((_, i) => i !== idx) });
    },
    [onUpdate, product.images],
  );

  const selectedTagIds = product.tags || [];
  const toggleTag = useCallback(
    (tagId: string) => {
      const current = product.tags || [];
      if (current.includes(tagId)) {
        onUpdate({ tags: current.filter((id) => id !== tagId) });
      } else {
        onUpdate({ tags: [...current, tagId] });
      }
    },
    [onUpdate, product.tags],
  );

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (tagBoxRef.current && !tagBoxRef.current.contains(e.target as Node)) {
        setTagOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (!token) return;
    getTags(token).then(setAvailableTags);
  }, [token]);

  useEffect(() => {
    const init = async () => {
      const [cats, brs] = await Promise.all([
        getCategories(token).catch(() => []),
        getBrands(token).catch(() => []),
      ]);
      setCategories(cats);
      setBrands(brs);

      if (userRole === "admin") {
        const fetchedSellers = await getSellers(token).catch(() => []);
        setSellers(
          fetchedSellers.map((s) => ({
            id: s.id,
            displayName: s.store_name || s.name || s.email,
          })),
        );
      }
    };
    init();
  }, [token, userRole]);

  // Hydrate subcategories and children when edit mode pre-fills classification IDs
  useEffect(() => {
    const hydrate = async () => {
      if (product.classification.category && categories.length > 0) {
        const subs = await getSubCategories(
          product.classification.category,
          token,
        );
        setSubCategories(subs);
        if (product.classification.subcategory) {
          const children = await getSubCategoryChildren(
            product.classification.subcategory,
            token,
          );
          setSubCategoryChildren(children);
        }
      }
    };
    hydrate();
  }, [
    categories.length,
    product.classification.category,
    product.classification.subcategory,
    token,
  ]);

  const handleCategoryChange = async (catId: string) => {
    onUpdate({
      classification: {
        ...product.classification,
        category: catId,
        subcategory: "",
        childCategory: "",
      },
    });
    const subs = await getSubCategories(catId, token);
    setSubCategories(subs);
    setSubCategoryChildren([]);
  };

  const handleSubCategoryChange = async (subId: string) => {
    onUpdate({
      classification: {
        ...product.classification,
        subcategory: subId,
        childCategory: "",
      },
    });
    const children = await getSubCategoryChildren(subId, token);
    setSubCategoryChildren(children);
  };

  const generateSku = useCallback(() => {
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    onUpdate({ identity: { ...product.identity, sku: `PX-${randomPart}` } });
  }, [onUpdate, product.identity]);

  const addHighlight = () => {
    onUpdate({
      highlightsEn: [...product.highlightsEn, ""],
      highlightsAr: [...product.highlightsAr, ""],
    });
  };

  const updateHighlight = (index: number, lang: "en" | "ar", value: string) => {
    if (lang === "en") {
      const next = [...product.highlightsEn];
      next[index] = value;
      onUpdate({ highlightsEn: next });
    } else {
      const next = [...product.highlightsAr];
      next[index] = value;
      onUpdate({ highlightsAr: next });
    }
  };

  const removeHighlight = (index: number) => {
    onUpdate({
      highlightsEn: product.highlightsEn.filter((_, i) => i !== index),
      highlightsAr: product.highlightsAr.filter((_, i) => i !== index),
    });
  };

  const userSpecifications = useMemo(() => {
    const specs = (product.specifications || []) as any[];
    return specs.filter((s) => {
      const key = String(s?.keyEn || "").trim().toLowerCase();
      if (!key) return false;
      return !RESERVED_SPEC_KEYS.has(key);
    });
  }, [product.specifications]);

  const upsertSpecification = useCallback(
    (spec: { keyEn: string; keyAr: string; valueEn: string; valueAr: string }) => {
      const key = spec.keyEn.trim().toLowerCase();
      const current = (product.specifications || []) as any[];
      const next = current.filter((s) => String(s?.keyEn || "").trim().toLowerCase() !== key);
      next.push(spec as any);
      onUpdate({ specifications: next as any });
    },
    [onUpdate, product.specifications],
  );

  const removeSpecificationByKey = useCallback(
    (keyEn: string) => {
      const key = keyEn.trim().toLowerCase();
      const current = (product.specifications || []) as any[];
      onUpdate({
        specifications: current.filter((s) => String(s?.keyEn || "").trim().toLowerCase() !== key) as any,
      });
    },
    [onUpdate, product.specifications],
  );

  const [draftSpec, setDraftSpec] = useState({
    keyEn: "",
    valueEn: "",
    keyAr: "",
    valueAr: "",
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-1 py-1"
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ──────────── LEFT: Main Form ──────────── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section 1: Product Title & Description */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                <Info size={15} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                {locale === "ar"
                  ? "معلومات المنتج الأساسية"
                  : "Basic Product Information"}
              </h3>
            </div>

            {userRole === "admin" && (
              <div className="mb-6">
                <SearchableSelect
                  label={locale === "ar" ? "تعيين للبائع" : "Assign to Seller"}
                  options={sellers}
                  value={product.store || ""}
                  onChange={(id) => onUpdate({ store: id })}
                  placeholder={
                    locale === "ar"
                      ? "ابحث باسم المتجر أو البريد الإلكتروني..."
                      : "Search by store name or email..."
                  }
                  locale={locale}
                  icon={Users}
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* English Column */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    className={`${COLORS.label} ${errors["title.en"] ? "text-red-500" : ""}`}
                  >
                    {locale === "ar" ? "اسم المنتج (EN)" : "Product Name (EN)"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="e.g. Premium Antimicrobial Scrub Top"
                    value={product.title?.en || ""}
                    onChange={(e) =>
                      onUpdate({
                        title: { ...product.title, en: e.target.value },
                        slugEn: e.target.value.toLowerCase().replace(/ /g, "-"),
                      })
                    }
                    className={`h-10 rounded-lg px-3 ${errors["title.en"] ? "border-red-300" : "border-gray-200"} ${COLORS.focus} text-sm placeholder:text-gray-300`}
                  />
                  {errors["title.en"] && (
                    <p className="text-[10px] font-medium text-red-500">
                      {errors["title.en"]}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    className={`${COLORS.label} ${errors.slugEn ? "text-red-500" : ""}`}
                  >
                    Slug (EN) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="premium-antimicrobial-scrub-top"
                    value={product.slugEn || ""}
                    onChange={(e) => onUpdate({ slugEn: e.target.value })}
                    className={`h-10 rounded-lg px-3 font-mono text-xs ${errors.slugEn ? "border-red-300" : "border-gray-200"} ${COLORS.focus} bg-gray-50/30`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    className={`${COLORS.label} ${errors["descriptions.descriptionEn"] ? "text-red-500" : ""}`}
                  >
                    {locale === "ar"
                      ? "وصف المنتج (EN)"
                      : "Product Description (EN)"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Describe the product features, materials, and medical certifications..."
                    value={product.descriptions.descriptionEn || ""}
                    onChange={(e) =>
                      onUpdate({
                        descriptions: {
                          ...product.descriptions,
                          descriptionEn: e.target.value,
                        },
                      })
                    }
                    className={`min-h-[120px] resize-none rounded-lg border px-3 py-2.5 ${errors["descriptions.descriptionEn"] ? "border-red-300" : "border-gray-200"} ${COLORS.focus} text-sm placeholder:text-gray-300`}
                  />
                  {errors["descriptions.descriptionEn"] && (
                    <p className="text-[10px] font-medium text-red-500">
                      {errors["descriptions.descriptionEn"]}
                    </p>
                  )}
                </div>
              </div>

              {/* Arabic Column */}
              <div className="space-y-4" dir="rtl">
                <div className="space-y-1.5">
                  <Label
                    className={`${COLORS.label} ${errors["title.ar"] ? "text-red-500" : ""}`}
                  >
                    اسم المنتج (AR) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="مثال: سكراب طبي ممتاز مضاد للميكروبات"
                    value={product.title?.ar || ""}
                    onChange={(e) =>
                      onUpdate({
                        title: { ...product.title, ar: e.target.value },
                        slugAr: e.target.value.replace(/ /g, "-"),
                      })
                    }
                    className={`h-10 rounded-lg px-3 text-right ${errors["title.ar"] ? "border-red-300" : "border-gray-200"} ${COLORS.focus} text-sm placeholder:text-gray-300`}
                  />
                  {errors["title.ar"] && (
                    <p className="text-[10px] font-medium text-red-500">
                      {errors["title.ar"]}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    className={`${COLORS.label} ${errors.slugAr ? "text-red-500" : ""}`}
                  >
                    الرابط (AR) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="سكراب-طبي-ممتاز"
                    value={product.slugAr || ""}
                    onChange={(e) => onUpdate({ slugAr: e.target.value })}
                    className={`h-10 rounded-lg px-3 text-right font-mono text-xs ${errors.slugAr ? "border-red-300" : "border-gray-200"} ${COLORS.focus} bg-gray-50/30`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    className={`${COLORS.label} ${errors["descriptions.descriptionAr"] ? "text-red-500" : ""}`}
                  >
                    وصف المنتج (AR) <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="اكتب وصفاً تفصيلياً لمميزات المنتج والمواد المستخدمة والشهادات الطبية..."
                    value={product.descriptions.descriptionAr || ""}
                    onChange={(e) =>
                      onUpdate({
                        descriptions: {
                          ...product.descriptions,
                          descriptionAr: e.target.value,
                        },
                      })
                    }
                    className={`min-h-[120px] resize-none rounded-lg border px-3 py-2.5 text-right ${errors["descriptions.descriptionAr"] ? "border-red-300" : "border-gray-200"} ${COLORS.focus} text-sm placeholder:text-gray-300`}
                  />
                  {errors["descriptions.descriptionAr"] && (
                    <p className="text-[10px] font-medium text-red-500">
                      {errors["descriptions.descriptionAr"]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Classification */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                <ListRestart size={15} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                {locale === "ar" ? "التصنيف والنوع" : "Classification & Type"}
              </h3>
            </div>

            {/* Product Type */}
            <div className="mb-4 space-y-1.5">
              <Label className={COLORS.label}>
                {locale === "ar" ? "نوع المنتج" : "Product Type"}
              </Label>
              <div className="inline-flex gap-1 rounded-lg border border-gray-100 bg-gray-50/50 p-1">
                {["Physical Product", "Digital Product"].map((t) => (
                  <button
                    key={t}
                    onClick={() =>
                      onUpdate({
                        classification: {
                          ...product.classification,
                          productType: t as any,
                        },
                      })
                    }
                    className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
                      product.classification.productType === t
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Category & Subcategory Row */}
            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label
                  className={`${COLORS.label} ${errors["classification.category"] ? "text-red-500" : ""}`}
                >
                  {locale === "ar" ? "القسم" : "Category"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  label=""
                  options={categories}
                  value={product.classification.category || ""}
                  onChange={handleCategoryChange}
                  placeholder={
                    locale === "ar" ? "اختر القسم..." : "Select category..."
                  }
                  locale={locale}
                />
                {errors["classification.category"] && (
                  <p className="text-[10px] font-medium text-red-500">
                    {errors["classification.category"]}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label
                  className={`${COLORS.label} ${errors["classification.subcategory"] ? "text-red-500" : ""}`}
                >
                  {locale === "ar" ? "القسم الفرعي" : "Subcategory"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <SearchableSelect
                  label=""
                  options={subCategories}
                  value={product.classification.subcategory || ""}
                  onChange={handleSubCategoryChange}
                  placeholder={
                    locale === "ar"
                      ? "اختر القسم الفرعي..."
                      : "Select subcategory..."
                  }
                  locale={locale}
                />
                {errors["classification.subcategory"] && (
                  <p className="text-[10px] font-medium text-red-500">
                    {errors["classification.subcategory"]}
                  </p>
                )}
              </div>
              <SearchableSelect
                label={locale === "ar" ? "تصنيف فرعي" : "Child Sub"}
                options={subCategoryChildren}
                value={product.classification.childCategory || ""}
                onChange={(id) =>
                  onUpdate({
                    classification: {
                      ...product.classification,
                      childCategory: id,
                    },
                  })
                }
                placeholder={locale === "ar" ? "اختر..." : "Select..."}
                locale={locale}
              />
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <Label
                className={`${COLORS.label} ${errors["classification.brand"] ? "text-red-500" : ""}`}
              >
                {locale === "ar" ? "العلامة التجارية" : "Brand"}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <div className="max-w-xs">
                <SearchableSelect
                  label=""
                  options={brands}
                  value={product.classification.brand || ""}
                  onChange={(id) =>
                    onUpdate({
                      classification: {
                        ...product.classification,
                        brand: id,
                      },
                    })
                  }
                  placeholder={
                    locale === "ar" ? "اختر العلامة..." : "Select brand..."
                  }
                  locale={locale}
                />
              </div>
              {errors["classification.brand"] && (
                <p className="text-[10px] font-medium text-red-500">
                  {errors["classification.brand"]}
                </p>
              )}
            </div>
          </div>

          {/* Section 4: Highlights & Specs */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Highlights */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  {locale === "ar" ? "المميزات" : "Highlights"}
                </h3>
                <button
                  onClick={addHighlight}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                >
                  <Plus size={14} />
                  {locale === "ar" ? "إضافة" : "Add"}
                </button>
              </div>
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {product.highlightsEn.map((hEn, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex gap-3 rounded-xl border border-gray-100 bg-gray-50/30 p-3"
                    >
                      <div className="grid flex-1 grid-cols-1 gap-2">
                        <Input
                          placeholder="Highlight (EN)..."
                          value={hEn}
                          onChange={(e) =>
                            updateHighlight(idx, "en", e.target.value)
                          }
                          className="h-9 rounded-lg border-gray-200 bg-white px-3 text-sm"
                        />
                        <Input
                          placeholder="الميزة (AR)..."
                          value={product.highlightsAr[idx] || ""}
                          onChange={(e) =>
                            updateHighlight(idx, "ar", e.target.value)
                          }
                          className="h-9 rounded-lg border-gray-200 bg-white px-3 text-right text-sm"
                          dir="rtl"
                        />
                      </div>
                      <button
                        onClick={() => removeHighlight(idx)}
                        className="self-center text-gray-300 transition-colors hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {product.highlightsEn.length === 0 && (
                  <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-100 py-8 text-sm text-gray-300">
                    {locale === "ar"
                      ? "لا توجد مميزات بعد"
                      : "No highlights yet"}
                  </div>
                )}
              </div>
            </div>

            {/* Product Specifications */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900">
                  {locale === "ar" ? "مواصفات المنتج" : "Product Specifications"}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {locale === "ar"
                    ? "أضف مواصفات مفصلة للمنتج"
                    : "Add detailed product specifications"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className={COLORS.label}>
                    {locale === "ar" ? "المفتاح (EN)" : "Key (e.g. Material)"}
                  </Label>
                  <Input
                    value={draftSpec.keyEn}
                    onChange={(e) => setDraftSpec((p) => ({ ...p, keyEn: e.target.value }))}
                    className={`h-10 rounded-xl border-gray-200 px-3 text-sm ${COLORS.focus}`}
                    placeholder={locale === "ar" ? "Material" : "Material"}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={COLORS.label}>
                    {locale === "ar" ? "القيمة (EN)" : "Value (e.g. Cotton)"}
                  </Label>
                  <Input
                    value={draftSpec.valueEn}
                    onChange={(e) => setDraftSpec((p) => ({ ...p, valueEn: e.target.value }))}
                    className={`h-10 rounded-xl border-gray-200 px-3 text-sm ${COLORS.focus}`}
                    placeholder={locale === "ar" ? "Cotton" : "Cotton"}
                  />
                </div>
                <div className="space-y-2" dir="rtl">
                  <Label className={COLORS.label}>{locale === "ar" ? "المفتاح (AR)" : "Key (AR)"}</Label>
                  <Input
                    value={draftSpec.keyAr}
                    onChange={(e) => setDraftSpec((p) => ({ ...p, keyAr: e.target.value }))}
                    className={`h-10 rounded-xl border-gray-200 px-3 text-sm text-right ${COLORS.focus}`}
                    placeholder={locale === "ar" ? "مثال: الخامة" : "مثال: الخامة"}
                  />
                </div>
                <div className="space-y-2" dir="rtl">
                  <Label className={COLORS.label}>{locale === "ar" ? "القيمة (AR)" : "Value (AR)"}</Label>
                  <Input
                    value={draftSpec.valueAr}
                    onChange={(e) => setDraftSpec((p) => ({ ...p, valueAr: e.target.value }))}
                    className={`h-10 rounded-xl border-gray-200 px-3 text-sm text-right ${COLORS.focus}`}
                    placeholder={locale === "ar" ? "مثال: قطن" : "مثال: قطن"}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const keyEn = draftSpec.keyEn.trim();
                  const valueEn = draftSpec.valueEn.trim();
                  if (!keyEn || !valueEn) return;
                  upsertSpecification({
                    keyEn,
                    keyAr: draftSpec.keyAr.trim() || keyEn,
                    valueEn,
                    valueAr: draftSpec.valueAr.trim() || valueEn,
                  });
                  setDraftSpec({ keyEn: "", valueEn: "", keyAr: "", valueAr: "" });
                }}
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-emerald-600 text-sm font-bold text-white hover:bg-emerald-700"
              >
                {locale === "ar" ? "إضافة مواصفة" : "Add Specification"}
              </button>

              {userSpecifications.length ? (
                <div className="mt-4 space-y-2">
                  {userSpecifications.map((s: any, idx: number) => (
                    <div
                      key={`${s.keyEn || "spec"}-${idx}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">{s.keyEn}</p>
                        <p className="truncate text-xs text-gray-500">{s.valueEn}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecificationByKey(String(s.keyEn || ""))}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        aria-label={locale === "ar" ? "حذف" : "Delete"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs text-gray-400">
                  {locale === "ar" ? "لا توجد مواصفات بعد." : "No specifications yet."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ──────────── RIGHT: Sidebar ──────────── */}
        <aside className="space-y-6 lg:col-span-1">
          {/* Upload product image (replaces Live Preview) */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-gray-900">
                {locale === "ar" ? "صورة المنتج" : "Product Image"}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {locale === "ar" ? "اختياري" : "Optional"}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="relative flex h-56 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                {primaryImageUrl ? (
                  <Image
                    src={primaryImageUrl}
                    alt={product.title?.en || "Product"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 420px"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                      <ImageIcon size={20} />
                    </div>
                    <p className="text-xs font-semibold">
                      {locale === "ar"
                        ? "ارفع صورة المنتج"
                        : "Upload a product image"}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {locale === "ar"
                        ? "يفضل 1200×900"
                        : "Recommended 1200×900"}
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadPrimaryImage(e.target.files)}
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label={locale === "ar" ? "رفع صورة" : "Upload image"}
                />

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">
                    <UploadCloud size={14} className="text-gray-500" />
                    {primaryImageUrl
                      ? locale === "ar"
                        ? "تغيير الصورة"
                        : "Change image"
                      : locale === "ar"
                        ? "رفع صورة"
                        : "Upload image"}
                  </div>

                  {primaryImageUrl ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemovePrimaryImage();
                      }}
                      className="rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold text-rose-600 shadow-sm backdrop-blur transition-colors hover:bg-rose-50"
                    >
                      {locale === "ar" ? "إزالة" : "Remove"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-gray-400">
              {locale === "ar"
                ? "ستظهر هذه الصورة كصورة رئيسية في المتجر."
                : "This image will be used as the primary image in the store."}
            </p>

            {/* Small gallery thumbnails */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {locale === "ar" ? "معرض الصور" : "Gallery"}
                </p>
                <span className="text-[11px] font-semibold text-gray-400">
                  {(imageUrls.length > 0 ? imageUrls.length - 1 : 0)}/9
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {imageUrls.slice(1, 6).map((url, i) => {
                  const idx = i + 1;
                  return (
                    <div
                      key={url + String(idx)}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm"
                    >
                      <Image
                        src={url}
                        alt="Gallery"
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveImageAt(idx);
                        }}
                        className="absolute right-1 top-1 rounded-md bg-white/90 p-1 text-gray-400 opacity-0 shadow-sm transition-opacity hover:text-rose-600 group-hover:opacity-100"
                        aria-label={locale === "ar" ? "إزالة" : "Remove"}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}

                <div className="relative flex aspect-square items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white text-gray-400 hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleUploadGalleryImages(e.target.files)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label={locale === "ar" ? "رفع صور" : "Upload images"}
                  />
                  <Plus size={16} />
                </div>
              </div>
            </div>

            {/* Product video URL */}
            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2">
                <Video size={16} className="text-gray-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {locale === "ar" ? "رابط فيديو المنتج" : "Product Video URL"}
                </p>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
                  <PlayCircle size={16} />
                </div>
                <Input
                  value={product.media?.productVideo?.vedioUrl || ""}
                  onChange={(e) =>
                    onUpdate({
                      media: {
                        ...product.media,
                        productVideo: {
                          ...product.media?.productVideo,
                          vedioUrl: e.target.value,
                        },
                      },
                    })
                  }
                  placeholder={
                    locale === "ar"
                      ? "رابط YouTube أو Vimeo..."
                      : "YouTube or Vimeo URL..."
                  }
                  className="h-9 rounded-lg border-gray-200 pl-10 text-xs font-semibold focus:border-teal-500"
                />
              </div>
            </div>

            {/* Product tags */}
            <div className="mt-5" ref={tagBoxRef}>
              <div className="mb-2 flex items-center gap-2">
                <Tag size={16} className="text-gray-400" />
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  {locale === "ar" ? "وسوم المنتج" : "Product Tags"}
                </p>
              </div>

              {selectedTagIds.length > 0 ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedTagIds.map((id) => {
                    const tag = availableTags.find((t) => t.id === id);
                    const label =
                      tag?.name?.[locale as "en" | "ar"] ||
                      tag?.name?.en ||
                      id;
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-2 rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-gray-200"
                      >
                        <span className="max-w-[180px] truncate">{label}</span>
                        <button
                          type="button"
                          onClick={() => toggleTag(id)}
                          className="rounded-full p-0.5 text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-700"
                          aria-label={locale === "ar" ? "إزالة" : "Remove"}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="mb-3 text-xs text-gray-400">
                  {locale === "ar"
                    ? "لا توجد وسوم محددة بعد."
                    : "No tags selected yet."}
                </p>
              )}

              <div className="relative">
                <input
                  value={tagQuery}
                  onChange={(e) => {
                    setTagQuery(e.target.value);
                    setTagOpen(true);
                  }}
                  onFocus={() => setTagOpen(true)}
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 outline-none focus:border-teal-500"
                  placeholder={
                    locale === "ar"
                      ? "ابحث عن وسم لإضافته..."
                      : "Search tags to add..."
                  }
                />

                {tagOpen ? (
                  <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="max-h-48 overflow-y-auto p-1.5">
                      {availableTags
                        .filter((t) => {
                          const label =
                            t.name?.[locale as "en" | "ar"] || t.name?.en || "";
                          const q = tagQuery.trim().toLowerCase();
                          if (!q) return !selectedTagIds.includes(t.id);
                          return (
                            !selectedTagIds.includes(t.id) &&
                            label.toLowerCase().includes(q)
                          );
                        })
                        .slice(0, 30)
                        .map((t) => {
                          const label =
                            t.name?.[locale as "en" | "ar"] || t.name?.en || "";
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                toggleTag(t.id);
                                setTagQuery("");
                                setTagOpen(false);
                              }}
                              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                              <span className="truncate">{label}</span>
                              <Plus size={14} className="text-gray-300" />
                            </button>
                          );
                        })}

                      {availableTags
                        .filter((t) => !selectedTagIds.includes(t.id))
                        .filter((t) => {
                          const label =
                            t.name?.[locale as "en" | "ar"] || t.name?.en || "";
                          const q = tagQuery.trim().toLowerCase();
                          return q ? label.toLowerCase().includes(q) : true;
                        }).length === 0 ? (
                        <div className="px-3 py-3 text-center text-xs text-gray-400">
                          {locale === "ar" ? "لا توجد نتائج" : "No results"}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Tips for Success */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <h3 className="text-sm font-bold text-emerald-800">
                {locale === "ar" ? "نصائح للنجاح" : "Tips for Success"}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {[
                locale === "ar"
                  ? "استخدم عناوين وصفية تتضمن العلامة التجارية والمادة واللون."
                  : "Use descriptive titles that include brand, material, and color.",
                locale === "ar"
                  ? "اذكر المعايير الطبية المحددة أو الشهادات (مثل ISO، FDA)."
                  : "Mention specific medical standards or certifications (e.g., ISO, FDA).",
                locale === "ar"
                  ? "رموز SKU الدقيقة تساعدك في إدارة المخزون عبر مستودعات متعددة."
                  : "Accurate SKUs help you manage inventory across multiple warehouses.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check
                    size={14}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />
                  <span className="text-xs leading-relaxed text-emerald-700">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </motion.div>
  );
};
