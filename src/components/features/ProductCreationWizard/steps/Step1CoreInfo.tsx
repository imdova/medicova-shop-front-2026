"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronDown,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  ListRestart,
  Calendar,
  Users,
  X,
  Info,
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
import { MultiCategory, Brand } from "@/types";
import { apiClient } from "@/lib/apiClient";

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

  useEffect(() => {
    const init = async () => {
      const [cats, brs] = await Promise.all([
        getCategories(token),
        getBrands(token),
      ]);
      setCategories(cats);
      setBrands(brs);

      if (userRole === "admin") {
        const fetchedSellers = await getSellers(token);
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

  const addSpecification = () => {
    onUpdate({
      specifications: [
        ...product.specifications,
        { keyEn: "", keyAr: "", valueEn: "", valueAr: "" },
      ],
    });
  };

  const updateSpecField = (index: number, field: string, value: string) => {
    const next = [...product.specifications];
    if (next[index]) {
      next[index] = { ...next[index], [field]: value };
      onUpdate({ specifications: next });
    }
  };

  const removeSpecification = (index: number) => {
    onUpdate({
      specifications: product.specifications.filter((_, i) => i !== index),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-1 py-1"
    >
      {/* Admin Seller Selection Overlay */}
      {userRole === "admin" && (
        <div className="mb-4 rounded-xl border border-teal-100 bg-teal-50/10 p-4 transition-all hover:bg-teal-50/20">
          <SearchableSelect
            label="Assign to Seller"
            options={sellers}
            value={product.store || ""}
            onChange={(id) => onUpdate({ store: id })}
            placeholder="Search by store name or email..."
            locale={locale}
            icon={Users}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ──────────── LEFT: Main Form ──────────── */}
        <div className="space-y-6 lg:col-span-2">
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

          {/* Section 2: Identity & SKU */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                <RefreshCw size={15} />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                {locale === "ar" ? "الهوية والتسعير" : "Identity & Pricing"}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {/* SKU */}
              <div className="space-y-1.5">
                <Label
                  className={`${COLORS.label} ${errors["identity.sku"] ? "text-red-500" : ""}`}
                >
                  SKU <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="e.g. PX-12345"
                    value={product.identity.sku || ""}
                    onChange={(e) =>
                      onUpdate({
                        identity: {
                          ...product.identity,
                          sku: e.target.value,
                        },
                      })
                    }
                    className={`h-10 rounded-lg px-3 pr-8 ${errors["identity.sku"] ? "border-red-300" : "border-gray-200"} ${COLORS.focus} text-sm placeholder:text-gray-300`}
                  />
                  <button
                    onClick={generateSku}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-300 transition-colors hover:text-gray-600"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                {errors["identity.sku"] && (
                  <p className="text-[10px] font-medium text-red-500">
                    {errors["identity.sku"]}
                  </p>
                )}
              </div>

              {/* Stock */}
              <div className="space-y-1.5">
                <Label
                  className={`${COLORS.label} ${errors["inventory.stockQuantity"] ? "text-red-500" : ""}`}
                >
                  {locale === "ar" ? "المخزون" : "Stock"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={product.inventory.stockQuantity || 0}
                  onChange={(e) =>
                    onUpdate({
                      inventory: {
                        ...product.inventory,
                        stockQuantity: parseInt(e.target.value),
                      },
                    })
                  }
                  className={`h-10 rounded-lg px-3 ${errors["inventory.stockQuantity"] ? "border-red-300" : "border-gray-200"} ${COLORS.focus} text-sm placeholder:text-gray-300`}
                />
              </div>

              {/* Price */}
              <div className="space-y-1.5">
                <Label
                  className={`${COLORS.label} ${errors["pricing.originalPrice"] ? "text-red-500" : ""}`}
                >
                  {locale === "ar" ? "السعر" : "Price"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={product.pricing.originalPrice || 0}
                  onChange={(e) =>
                    onUpdate({
                      pricing: {
                        ...product.pricing,
                        originalPrice: parseFloat(e.target.value),
                      },
                    })
                  }
                  className={`h-10 rounded-lg px-3 ${errors["pricing.originalPrice"] ? "border-red-300" : "border-gray-200"} ${COLORS.focus} text-sm placeholder:text-gray-300`}
                />
                {errors["pricing.originalPrice"] && (
                  <p className="text-[10px] font-medium text-red-500">
                    {errors["pricing.originalPrice"]}
                  </p>
                )}
              </div>
            </div>

            {/* Sale & Dates Row */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className={`${COLORS.label} text-teal-600`}>
                  {locale === "ar" ? "سعر الخصم" : "Sale Price"}
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={product.pricing.salePrice || 0}
                  onChange={(e) =>
                    onUpdate({
                      pricing: {
                        ...product.pricing,
                        salePrice: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="h-10 rounded-lg border-teal-200 bg-teal-50/10 px-3 text-sm font-semibold text-teal-600 focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="space-y-1.5">
                <Label className={COLORS.label}>
                  {locale === "ar" ? "تاريخ البداية" : "Start Date"}
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={
                      product.pricing.startDate
                        ? product.pricing.startDate.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      onUpdate({
                        pricing: {
                          ...product.pricing,
                          startDate: e.target.value
                            ? `${e.target.value}T00:00:00Z`
                            : null,
                        },
                      })
                    }
                    className={`h-10 rounded-lg border-gray-200 px-3 pl-8 ${COLORS.focus} text-sm placeholder:text-gray-300`}
                  />
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className={COLORS.label}>
                  {locale === "ar" ? "تاريخ النهاية" : "End Date"}
                </Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={
                      product.pricing.endDate
                        ? product.pricing.endDate.split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      onUpdate({
                        pricing: {
                          ...product.pricing,
                          endDate: e.target.value
                            ? `${e.target.value}T23:59:59Z`
                            : null,
                        },
                      })
                    }
                    className={`h-10 rounded-lg border-gray-200 px-3 pl-8 ${COLORS.focus} text-sm placeholder:text-gray-300`}
                  />
                  <Calendar
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Product Title & Description */}
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

          {/* Section 4: Highlights & Specs */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Highlights */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
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

            {/* Technical Specs */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">
                  {locale === "ar" ? "المواصفات التقنية" : "Technical Specs"}
                </h3>
                <button
                  onClick={addSpecification}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-colors hover:bg-emerald-50"
                >
                  <Plus size={14} />
                  {locale === "ar" ? "إضافة" : "Add"}
                </button>
              </div>
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {product.specifications.map((s, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative rounded-xl border border-gray-100 bg-gray-50/30 p-3"
                    >
                      <div className="grid grid-cols-1 gap-2">
                        {/* EN Row */}
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Key (EN)"
                            value={s.keyEn}
                            onChange={(e) =>
                              updateSpecField(idx, "keyEn", e.target.value)
                            }
                            className="h-9 rounded-lg border-gray-200 bg-white px-3 text-sm font-semibold"
                          />
                          <Input
                            placeholder="Value (EN)"
                            value={s.valueEn}
                            onChange={(e) =>
                              updateSpecField(idx, "valueEn", e.target.value)
                            }
                            className="h-9 rounded-lg border-gray-200 bg-white px-3 text-sm"
                          />
                        </div>
                        {/* AR Row */}
                        <div className="grid grid-cols-2 gap-2" dir="rtl">
                          <Input
                            placeholder="الخاصية (AR)"
                            value={s.keyAr}
                            onChange={(e) =>
                              updateSpecField(idx, "keyAr", e.target.value)
                            }
                            className="h-9 rounded-lg border-gray-200 bg-white px-3 text-right text-sm font-semibold"
                          />
                          <Input
                            placeholder="القيمة (AR)"
                            value={s.valueAr}
                            onChange={(e) =>
                              updateSpecField(idx, "valueAr", e.target.value)
                            }
                            className="h-9 rounded-lg border-gray-200 bg-white px-3 text-right text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => removeSpecification(idx)}
                        className="absolute -right-2 -top-2 rounded-full bg-white p-0.5 text-gray-300 shadow-sm hover:text-red-500"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {product.specifications.length === 0 && (
                  <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-100 py-8 text-sm text-gray-300">
                    {locale === "ar" ? "لا توجد مواصفات بعد" : "No specs yet"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ──────────── RIGHT: Sidebar ──────────── */}
        <div className="space-y-6 lg:col-span-1">
          {/* Live Preview Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-gray-900">
              {locale === "ar" ? "معاينة مباشرة" : "Live Preview"}
            </h3>
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/50">
              {/* Product image placeholder */}
              <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                {product.pricing.salePrice > 0 && (
                  <span className="absolute right-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    SALE
                  </span>
                )}
                <div className="text-gray-200">
                  <svg
                    width="48"
                    height="48"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="space-y-2 p-3">
                <div
                  className={`h-3 rounded ${product.title?.en ? "bg-gray-900" : "bg-gray-200"}`}
                  style={{ width: product.title?.en ? "auto" : "80%" }}
                >
                  {product.title?.en && (
                    <p className="truncate px-1 text-xs font-bold text-white">
                      {product.title.en}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {product.pricing.originalPrice > 0 ? (
                    <>
                      <span className="text-sm font-bold text-gray-900">
                        ${product.pricing.originalPrice}
                      </span>
                      {product.pricing.salePrice > 0 && (
                        <span className="text-sm font-semibold text-red-500 line-through">
                          ${product.pricing.salePrice}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-12 rounded bg-gray-200" />
                      <div className="h-3 w-8 rounded bg-gray-100" />
                    </>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-gray-400">
              {locale === "ar"
                ? "هذا هو شكل بطاقة المنتج في المتجر"
                : "This is how your product card will appear in the marketplace."}
            </p>
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
        </div>
      </div>
    </motion.div>
  );
};
