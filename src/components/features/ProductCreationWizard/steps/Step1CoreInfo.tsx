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
  border: "border-gray-100",
  focus: "focus:border-black/20 focus:ring-1 focus:ring-black/5",
  label: "text-[9px] font-black text-gray-400 uppercase tracking-tighter",
  inputBg: "bg-white hover:bg-gray-50/30",
  text: "text-[11px] font-bold text-gray-900 placeholder:font-normal placeholder:text-xs placeholder:text-gray-300",
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
    <div className="relative space-y-1" ref={containerRef}>
      <Label className={COLORS.label}>{label}</Label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-8 cursor-pointer items-center justify-between rounded-md border bg-white px-2.5 transition-all ${isOpen ? `border-gray-900 ring-1 ring-gray-900` : `${COLORS.border} ${COLORS.inputBg}`}`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {Icon && <Icon size={11} className="text-gray-400" />}
          <span
            className={`${COLORS.text} ${selectedOpt ? "" : "text-gray-300"} truncate`}
          >
            {selectedOpt
              ? selectedOpt.title?.[locale] ||
                selectedOpt.name?.[locale] ||
                selectedOpt.displayName
              : placeholder}
          </span>
        </div>
        <ChevronDown
          size={12}
          className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-1 shadow-xl"
          >
            <div className="relative mb-1">
              <Search
                className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                size={10}
              />
              <input
                autoFocus
                className="h-7 w-full rounded-md border border-transparent bg-gray-50 pl-7 pr-2 text-[10px] font-medium outline-none focus:border-gray-100"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="custom-scrollbar max-h-[140px] overflow-y-auto">
              {filtered.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1 text-[10px] font-medium hover:bg-gray-50"
                >
                  <span className="truncate">
                    {opt.title?.[locale] ||
                      opt.name?.[locale] ||
                      opt.displayName}
                  </span>
                  {value === opt.id && (
                    <Check size={10} className="shrink-0 text-gray-900" />
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="p-2 text-center text-[9px] font-medium text-gray-400">
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
      className="space-y-4 px-1 py-1"
    >
      {/* Admin Seller Selection Overlay */}
      {userRole === "admin" && (
        <div className="rounded-xl border border-teal-100 bg-teal-50/10 p-2.5 transition-all hover:bg-teal-50/20">
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

      {/* Row 1: Classification */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-100/60 bg-gray-50/20 p-3 shadow-sm md:grid-cols-5">
        <div className="space-y-1">
          <Label className={COLORS.label}>Type</Label>
          <div className="grid grid-cols-2 gap-1 rounded-md border border-gray-100 bg-white p-0.5">
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
                className={`rounded py-1 text-[9px] font-black uppercase tracking-tighter transition-all ${product.classification.productType === t ? "bg-gray-900 text-white" : "text-gray-300 hover:text-gray-500"}`}
              >
                {t.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Label
            className={`${COLORS.label} ${errors["classification.category"] ? "text-red-500" : ""}`}
          >
            Category <span className="text-red-500">*</span>
          </Label>
          <SearchableSelect
            label=""
            options={categories}
            value={product.classification.category || ""}
            onChange={handleCategoryChange}
            placeholder="Select..."
            locale={locale}
          />
          {errors["classification.category"] && (
            <p className="font-regular text-[10px] text-red-500">
              {errors["classification.category"]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label
            className={`${COLORS.label} ${errors["classification.subcategory"] ? "text-red-500" : ""}`}
          >
            Subcategory <span className="text-red-500">*</span>
          </Label>
          <SearchableSelect
            label=""
            options={subCategories}
            value={product.classification.subcategory || ""}
            onChange={handleSubCategoryChange}
            placeholder="Select..."
            locale={locale}
          />
          {errors["classification.subcategory"] && (
            <p className="text-[10px] font-bold text-red-500">
              {errors["classification.subcategory"]}
            </p>
          )}
        </div>
        <SearchableSelect
          label="Child Sub"
          options={subCategoryChildren}
          value={product.classification.childCategory || ""}
          onChange={(id) =>
            onUpdate({
              classification: { ...product.classification, childCategory: id },
            })
          }
          placeholder="Select..."
          locale={locale}
        />
        <div className="space-y-1">
          <Label
            className={`${COLORS.label} ${errors["classification.brand"] ? "text-red-500" : ""}`}
          >
            Brand <span className="text-red-500">*</span>
          </Label>
          <SearchableSelect
            label=""
            options={brands}
            value={product.classification.brand || ""}
            onChange={(id) =>
              onUpdate({
                classification: { ...product.classification, brand: id },
              })
            }
            placeholder="Select..."
            locale={locale}
          />
          {errors["classification.brand"] && (
            <p className="text-[10px] font-bold text-red-500">
              {errors["classification.brand"]}
            </p>
          )}
        </div>
      </div>

      {/* Row 2: Identity & Pricing */}
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:grid-cols-6">
        <div className="space-y-1">
          <Label
            className={`${COLORS.label} ${errors["identity.sku"] ? "text-red-500" : ""}`}
          >
            Sku <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              placeholder="e.g. PX-12345"
              value={product.identity.sku || ""}
              onChange={(e) =>
                onUpdate({
                  identity: { ...product.identity, sku: e.target.value },
                })
              }
              className={`h-8 px-2.5 ${errors["identity.sku"] ? "border-red-500" : COLORS.border} ${COLORS.focus} ${COLORS.text} ${COLORS.inputBg} rounded-md`}
            />
            <button
              onClick={generateSku}
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-300 transition-colors hover:text-gray-900"
            >
              <RefreshCw size={11} />
            </button>
          </div>
          {errors["identity.sku"] && (
            <p className="text-[9px] font-bold text-red-500">
              {errors["identity.sku"]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label
            className={`${COLORS.label} ${errors["inventory.stockQuantity"] ? "text-red-500" : ""}`}
          >
            Stock <span className="text-red-500">*</span>
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
            className={`h-8 px-2.5 ${errors["inventory.stockQuantity"] ? "border-red-500" : COLORS.border} ${COLORS.focus} ${COLORS.text} ${COLORS.inputBg} rounded-md`}
          />
        </div>
        <div className="space-y-1">
          <Label
            className={`${COLORS.label} ${errors["pricing.originalPrice"] ? "text-red-500" : ""}`}
          >
            Price <span className="text-red-500">*</span>
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
            className={`h-8 px-2.5 ${errors["pricing.originalPrice"] ? "border-red-500" : COLORS.border} ${COLORS.focus} ${COLORS.text} ${COLORS.inputBg} rounded-md`}
          />
          {errors["pricing.originalPrice"] && (
            <p className="text-[9px] font-bold text-red-500">
              {errors["pricing.originalPrice"]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label className={`${COLORS.label} text-teal-600`}>Sale</Label>
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
            className="h-8 rounded-md border-teal-100 bg-teal-50/5 px-2.5 text-[11px] font-black text-teal-600 focus:ring-1 focus:ring-teal-500"
          />
        </div>
        <div className="space-y-1">
          <Label className={COLORS.label}>Starts</Label>
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
              className={`h-8 px-2.5 ${COLORS.border} ${COLORS.focus} ${COLORS.text} ${COLORS.inputBg} rounded-md pl-6`}
            />
            <Calendar
              size={10}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className={COLORS.label}>Ends</Label>
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
              className={`h-8 px-2.5 ${COLORS.border} ${COLORS.focus} ${COLORS.text} ${COLORS.inputBg} rounded-md pl-6`}
            />
            <Calendar
              size={10}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Row 3: Bilingual Identity & Slugs */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-100 bg-white p-3 shadow-sm md:grid-cols-2">
        {/* English Column */}
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-3 space-y-1">
              <Label
                className={`${COLORS.label} ${errors["title.en"] ? "text-red-500" : ""}`}
              >
                Title (EN) <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Wireless Noise-Cancelling Headphones"
                value={product.title?.en || ""}
                onChange={(e) =>
                  onUpdate({
                    title: { ...product.title, en: e.target.value },
                    slugEn: e.target.value.toLowerCase().replace(/ /g, "-"),
                  })
                }
                className={`h-8 ${errors["title.en"] ? "border-red-500" : COLORS.border} ${COLORS.focus} ${COLORS.text} ${COLORS.inputBg} rounded-md`}
              />
              {errors["title.en"] && (
                <p className="text-[9px] font-bold text-red-500">
                  {errors["title.en"]}
                </p>
              )}
            </div>
            <div className="col-span-1 space-y-1">
              <Label
                className={`${COLORS.label} ${errors.slugEn ? "text-red-500" : ""}`}
              >
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="headphones"
                value={product.slugEn || ""}
                onChange={(e) => onUpdate({ slugEn: e.target.value })}
                className={`h-8 font-mono text-[9px] ${errors.slugEn ? "border-red-500" : COLORS.border} ${COLORS.focus} ${COLORS.text} rounded-md bg-gray-50/20`}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label
              className={`${COLORS.label} ${errors["descriptions.descriptionEn"] ? "text-red-500" : ""}`}
            >
              Description (EN) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="Provide a detailed description of the product features..."
              value={product.descriptions.descriptionEn || ""}
              onChange={(e) =>
                onUpdate({
                  descriptions: {
                    ...product.descriptions,
                    descriptionEn: e.target.value,
                  },
                })
              }
              className={`min-h-[60px] py-2 ${errors["descriptions.descriptionEn"] ? "border-red-500" : COLORS.border} ${COLORS.focus} ${COLORS.text} ${COLORS.inputBg} resize-none rounded-md`}
            />
            {errors["descriptions.descriptionEn"] && (
              <p className="text-[9px] font-bold text-red-500">
                {errors["descriptions.descriptionEn"]}
              </p>
            )}
          </div>
        </div>

        {/* Arabic Column */}
        <div className="space-y-3" dir="rtl">
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-3 space-y-1">
              <Label
                className={`${COLORS.label} ${errors["title.ar"] ? "text-red-500" : ""}`}
              >
                العنوان (AR) <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="مثال: سماعات لاسلكية عازلة للضوضاء"
                value={product.title?.ar || ""}
                onChange={(e) =>
                  onUpdate({
                    title: { ...product.title, ar: e.target.value },
                    slugAr: e.target.value.replace(/ /g, "-"),
                  })
                }
                className={`h-8 ${errors["title.ar"] ? "border-red-500" : COLORS.border} ${COLORS.focus} ${COLORS.text} ${COLORS.inputBg} rounded-md text-right`}
              />
              {errors["title.ar"] && (
                <p className="text-[9px] font-bold text-red-500">
                  {errors["title.ar"]}
                </p>
              )}
            </div>
            <div className="col-span-1 space-y-1">
              <Label
                className={`${COLORS.label} ${errors.slugAr ? "text-red-500" : ""}`}
              >
                الرابط <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="سماعات"
                value={product.slugAr || ""}
                onChange={(e) => onUpdate({ slugAr: e.target.value })}
                className={`h-8 font-mono text-[9px] ${errors.slugAr ? "border-red-500" : COLORS.border} ${COLORS.focus} ${COLORS.text} rounded-md bg-gray-50/20 text-right`}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label
              className={`${COLORS.label} ${errors["descriptions.descriptionAr"] ? "text-red-500" : ""}`}
            >
              الوصف (AR) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              placeholder="اكتب وصفاً تفصيلياً لمميزات المنتج..."
              value={product.descriptions.descriptionAr || ""}
              onChange={(e) =>
                onUpdate({
                  descriptions: {
                    ...product.descriptions,
                    descriptionAr: e.target.value,
                  },
                })
              }
              className={`min-h-[60px] py-2 ${errors["descriptions.descriptionAr"] ? "border-red-500" : COLORS.border} ${COLORS.focus} ${COLORS.text} ${COLORS.inputBg} resize-none rounded-md text-right`}
            />
            {errors["descriptions.descriptionAr"] && (
              <p className="text-[9px] font-bold text-red-500">
                {errors["descriptions.descriptionAr"]}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Highlights & Specs in a grid to save vertical space */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Highlights */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className={COLORS.label}>Highlights</span>
            <button
              onClick={addHighlight}
              className="px-2 py-0.5 text-[9px] font-black uppercase text-teal-600 hover:bg-teal-50"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {product.highlightsEn.map((hEn, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group flex gap-2 rounded-lg border border-gray-50 bg-white p-2 shadow-sm"
                >
                  <div className="grid flex-1 grid-cols-1 gap-1">
                    <Input
                      placeholder="EN..."
                      value={hEn}
                      onChange={(e) =>
                        updateHighlight(idx, "en", e.target.value)
                      }
                      className="h-7 border-none bg-gray-50/30 p-1 text-[10px] font-bold"
                    />
                    <Input
                      placeholder="AR..."
                      value={product.highlightsAr[idx] || ""}
                      onChange={(e) =>
                        updateHighlight(idx, "ar", e.target.value)
                      }
                      className="h-7 border-none bg-gray-50/30 p-1 text-right text-[10px] font-bold"
                      dir="rtl"
                    />
                  </div>
                  <button
                    onClick={() => removeHighlight(idx)}
                    className="text-gray-200 transition-colors hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {product.highlightsEn.length === 0 && (
              <div className="py-4 text-center text-[9px] font-black uppercase text-gray-300">
                Empty
              </div>
            )}
          </div>
        </div>

        {/* Specs */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/10 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className={COLORS.label}>Technical Specs</span>
            <button
              onClick={addSpecification}
              className="px-2 py-0.5 text-[9px] font-black uppercase text-teal-600 hover:bg-teal-50"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {product.specifications.map((s, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group relative rounded-lg border border-gray-50 bg-white p-2 shadow-sm"
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
                        className="h-7 border-none bg-gray-50/30 p-1.5 text-[10px] font-black"
                      />
                      <Input
                        placeholder="Value (EN)"
                        value={s.valueEn}
                        onChange={(e) =>
                          updateSpecField(idx, "valueEn", e.target.value)
                        }
                        className="h-7 border-none bg-gray-50/30 p-1.5 text-[10px] font-bold"
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
                        className="h-7 border-none bg-gray-50/30 p-1.5 text-right text-[10px] font-black"
                      />
                      <Input
                        placeholder="القيمة (AR)"
                        value={s.valueAr}
                        onChange={(e) =>
                          updateSpecField(idx, "valueAr", e.target.value)
                        }
                        className="h-7 border-none bg-gray-50/30 p-1.5 text-right text-[10px] font-bold"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeSpecification(idx)}
                    className="absolute -right-1 -top-1 rounded-full bg-white text-gray-200 shadow-sm hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
            {product.specifications.length === 0 && (
              <div className="py-4 text-center text-[9px] font-black uppercase text-gray-300">
                Empty
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
