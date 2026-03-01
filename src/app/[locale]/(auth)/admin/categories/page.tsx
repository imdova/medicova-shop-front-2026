"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { LayoutGrid, Layers, Award, TrendingUp } from "lucide-react";

import CategoryTabContent from "./components/CategoryTabContent";
import SubCategoryTabContent from "./components/SubCategoryTabContent";
import BrandTabContent from "./components/BrandTabContent";
import CreateCategoryModal from "./components/CreateCategoryModal";
import CreateSubCategoryModal from "./components/CreateSubCategoryModal";
import CreateBrandModal from "./components/CreateBrandModal";
import SubCategoryChildTabContent from "./components/SubCategoryChildTabContent";
import CreateSubCategoryChildModal from "./components/CreateSubCategoryChildModal";

import {
  Category,
  SubCategory,
  Brand,
  SubCategoryChild,
  fetchCategories,
  fetchSubCategories,
  fetchBrands,
  fetchSubCategoryChildren,
  deleteCategory,
  deleteSubCategory,
  deleteBrand,
  deleteSubCategoryChild,
  toggleCategoryStatus,
  toggleSubCategoryStatus,
  toggleBrandStatus,
  toggleSubCategoryChildStatus,
} from "./constants";

type TabId = "categories" | "subCategories" | "subCategoryChildren" | "brands";

/* ─── Stat Card ─── */
const StatCard = ({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  accent: string;
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-5 shadow-lg shadow-gray-200/30 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl">
    <div
      className={`absolute -end-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-2xl ${accent}`}
    />
    <div className="flex items-center gap-4">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent} bg-opacity-10 shadow-inner`}
      >
        <Icon size={22} className="text-current" />
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value}</p>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {label}
        </p>
      </div>
    </div>
  </div>
);

export default function CategoriesPage() {
  const t = useTranslations("admin");
  const locale = useLocale() as "en" | "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [activeTab, setActiveTab] = useState<TabId>("categories");
  const [searchQuery, setSearchQuery] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subCategoryChildren, setSubCategoryChildren] = useState<
    SubCategoryChild[]
  >([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    Promise.all([
      fetchCategories().catch(() => [] as Category[]),
      fetchSubCategories().catch(() => [] as SubCategory[]),
      fetchSubCategoryChildren().catch(() => [] as SubCategoryChild[]),
      fetchBrands().catch(() => [] as Brand[]),
    ])
      .then(([cats, subs, subChildren, brs]) => {
        setCategories(cats);
        setSubCategories(subs);
        setSubCategoryChildren(subChildren);
        setBrands(brs);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* Modal State */
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [showSubCategoryChildModal, setShowSubCategoryChildModal] =
    useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editSubCategory, setEditSubCategory] = useState<SubCategory | null>(
    null,
  );
  const [editSubCategoryChild, setEditSubCategoryChild] =
    useState<SubCategoryChild | null>(null);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);

  const tabs = useMemo(
    () =>
      [
        {
          id: "categories" as TabId,
          label: t("categoriesLabel"),
          icon: LayoutGrid,
          count: categories.length,
        },
        {
          id: "subCategories" as TabId,
          label: t("subCategories"),
          icon: Layers,
          count: subCategories.length,
        },
        {
          id: "subCategoryChildren" as TabId,
          label: t("subCategoryChildren"),
          icon: Layers,
          count: subCategoryChildren.length,
        },
        {
          id: "brands" as TabId,
          label: t("brands"),
          icon: Award,
          count: brands.length,
        },
      ] as const,
    [
      t,
      categories.length,
      subCategories.length,
      subCategoryChildren.length,
      brands.length,
    ],
  );

  /* Stats */
  const totalActive = useMemo(
    () =>
      categories.filter((c) => c.isActive).length +
      subCategories.filter((s) => s.isActive).length +
      subCategoryChildren.filter((sc) => sc.isActive).length +
      brands.filter((b) => b.isActive).length,
    [categories, subCategories, subCategoryChildren, brands],
  );

  const totalItems =
    categories.length +
    subCategories.length +
    subCategoryChildren.length +
    brands.length;

  /* Filtering */
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.en.toLowerCase().includes(query) ||
        c.name.ar.toLowerCase().includes(query),
    );
  }, [categories, searchQuery]);

  const filteredSubCategories = useMemo(() => {
    if (!searchQuery.trim()) return subCategories;
    const query = searchQuery.toLowerCase();
    return subCategories.filter(
      (s) =>
        s.name.en.toLowerCase().includes(query) ||
        s.name.ar.toLowerCase().includes(query),
    );
  }, [subCategories, searchQuery]);

  const filteredSubCategoryChildren = useMemo(() => {
    if (!searchQuery.trim()) return subCategoryChildren;
    const query = searchQuery.toLowerCase();
    return subCategoryChildren.filter((sc) => {
      const enName = sc.name?.en || "";
      const arName = sc.name?.ar || "";
      return (
        enName.toLowerCase().includes(query) ||
        arName.toLowerCase().includes(query)
      );
    });
  }, [subCategoryChildren, searchQuery]);

  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands;
    const query = searchQuery.toLowerCase();
    return brands.filter(
      (b) =>
        b.name.en.toLowerCase().includes(query) ||
        b.name.ar.toLowerCase().includes(query),
    );
  }, [brands, searchQuery]);

  const handleStatusChange = useCallback(
    async (
      type: "category" | "subCategory" | "subCategoryChild" | "brand",
      item: Category | SubCategory | SubCategoryChild | Brand,
      newStatus: boolean,
    ) => {
      const itemId = (item as any)._id || item.id;

      try {
        if (type === "category")
          await toggleCategoryStatus(itemId, newStatus, token);
        if (type === "subCategory")
          await toggleSubCategoryStatus(itemId, newStatus, token);
        if (type === "subCategoryChild")
          await toggleSubCategoryChildStatus(itemId, newStatus, token);
        if (type === "brand") await toggleBrandStatus(itemId, newStatus, token);

        toast.success(t("savedSuccessfully"));

        const updateState = <
          T extends {
            id: string;
            _id?: string;
            isActive: boolean;
            status: string;
          },
        >(
          prev: T[],
        ): T[] =>
          prev.map((i) =>
            (i._id || i.id) === itemId
              ? {
                  ...i,
                  isActive: newStatus,
                  status: newStatus ? "active" : "inactive",
                }
              : i,
          );

        if (type === "category") setCategories(updateState);
        if (type === "subCategory") setSubCategories(updateState);
        if (type === "subCategoryChild") setSubCategoryChildren(updateState);
        if (type === "brand") setBrands(updateState);
      } catch (err: any) {
        toast.error(err?.message || t("saveFailed"));
      }
    },
    [token, t],
  );

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F8FAFC] p-4 duration-700 md:p-8">
      <div className="mx-auto max-w-[1440px]">
        {/* ─── Page Header ─── */}
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            {t("categorySetup")}
          </h1>
          <p className="font-medium text-gray-400">
            {t("categoriesDescription")}
          </p>
        </div>

        {/* ─── Stats Row ─── */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={LayoutGrid}
            label={t("categoriesLabel")}
            value={categories.length}
            accent="bg-emerald-500 text-emerald-600"
          />
          <StatCard
            icon={Layers}
            label={t("subCategories")}
            value={subCategories.length}
            accent="bg-blue-500 text-blue-600"
          />
          <StatCard
            icon={Award}
            label={t("brands")}
            value={brands.length}
            accent="bg-violet-500 text-violet-600"
          />
          <StatCard
            icon={Layers}
            label={t("subCategoryChildren")}
            value={subCategoryChildren.length}
            accent="bg-cyan-500 text-cyan-600"
          />
          <StatCard
            icon={TrendingUp}
            label={t("totalActive")}
            value={totalActive}
            accent="bg-amber-500 text-amber-600"
          />
        </div>

        {/* ─── Tab Navigation ─── */}
        <div
          className="mb-8 flex w-full items-center gap-2 overflow-x-auto rounded-2xl bg-gray-100/40 p-1.5 backdrop-blur-sm sm:w-fit"
          role="tablist"
          aria-label={t("categorySetup")}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-white text-gray-900 shadow-lg shadow-gray-200/50"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div
                  className={`flex size-5 items-center justify-center rounded-md ${
                    isActive ? "bg-[#EDF3F0] text-[#7BA68E]" : "bg-gray-100/50"
                  }`}
                >
                  <tab.icon size={14} />
                </div>
                <span>{tab.label}</span>
                <span
                  className={`ms-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ─── Tab Content ─── */}
        <div
          className="transition-all duration-500"
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={activeTab}
        >
          {activeTab === "categories" && (
            <CategoryTabContent
              data={filteredCategories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onStatusChange={(item, status) =>
                handleStatusChange("category", item, status)
              }
              onEdit={(item) => {
                setEditCategory(item);
                setShowCategoryModal(true);
              }}
              onDelete={async (item) => {
                const itemId = item.id;
                try {
                  await deleteCategory(itemId, token);
                  setCategories((prev) => prev.filter((c) => c.id !== itemId));
                  toast.success(t("deletedSuccessfully"));
                } catch (e: any) {
                  toast.error(e?.message || t("deleteFailed"));
                }
              }}
              onCreateClick={() => {
                setEditCategory(null);
                setShowCategoryModal(true);
              }}
            />
          )}
          {activeTab === "subCategories" && (
            <SubCategoryTabContent
              data={filteredSubCategories}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onStatusChange={(item, status) =>
                handleStatusChange("subCategory", item, status)
              }
              onEdit={(item) => {
                setEditSubCategory(item);
                setShowSubCategoryModal(true);
              }}
              onDelete={async (item) => {
                const itemId = item.id;
                try {
                  await deleteSubCategory(itemId, token);
                  setSubCategories((prev) =>
                    prev.filter((s) => s.id !== itemId),
                  );
                  toast.success(t("deletedSuccessfully"));
                } catch (e: any) {
                  toast.error(e?.message || t("deleteFailed"));
                }
              }}
              onCreateClick={() => {
                setEditSubCategory(null);
                setShowSubCategoryModal(true);
              }}
            />
          )}
          {activeTab === "subCategoryChildren" && (
            <SubCategoryChildTabContent
              data={filteredSubCategoryChildren}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onStatusChange={(item, status) =>
                handleStatusChange("subCategoryChild", item, status)
              }
              onEdit={(item) => {
                setEditSubCategoryChild(item);
                setShowSubCategoryChildModal(true);
              }}
              onDelete={async (item) => {
                const itemId = item.id;
                try {
                  await deleteSubCategoryChild(itemId, token);
                  setSubCategoryChildren((prev) =>
                    prev.filter((sc) => sc.id !== itemId),
                  );
                  toast.success(t("deletedSuccessfully"));
                } catch (e: any) {
                  toast.error(e?.message || t("deleteFailed"));
                }
              }}
              onCreateClick={() => {
                setEditSubCategoryChild(null);
                setShowSubCategoryChildModal(true);
              }}
            />
          )}
          {activeTab === "brands" && (
            <BrandTabContent
              data={filteredBrands}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onStatusChange={(item, status) =>
                handleStatusChange("brand", item, status)
              }
              onEdit={(item) => {
                setEditBrand(item);
                setShowBrandModal(true);
              }}
              onDelete={async (item) => {
                const itemId = item.id;
                try {
                  await deleteBrand(itemId, token);
                  setBrands((prev) => prev.filter((b) => b.id !== itemId));
                  toast.success(t("deletedSuccessfully"));
                } catch (e: any) {
                  toast.error(e?.message || t("deleteFailed"));
                }
              }}
              onCreateClick={() => {
                setEditBrand(null);
                setShowBrandModal(true);
              }}
            />
          )}
        </div>
      </div>
      {/* ─── Modals ─── */}
      <CreateCategoryModal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setEditCategory(null);
        }}
        editItem={editCategory}
        onSuccess={fetchData}
      />
      <CreateSubCategoryModal
        isOpen={showSubCategoryModal}
        onClose={() => {
          setShowSubCategoryModal(false);
          setEditSubCategory(null);
        }}
        categories={categories}
        editItem={editSubCategory}
        onSuccess={fetchData}
      />
      <CreateSubCategoryChildModal
        isOpen={showSubCategoryChildModal}
        onClose={() => {
          setShowSubCategoryChildModal(false);
          setEditSubCategoryChild(null);
        }}
        subCategories={subCategories}
        editItem={editSubCategoryChild}
        onSuccess={fetchData}
      />
      <CreateBrandModal
        isOpen={showBrandModal}
        onClose={() => {
          setShowBrandModal(false);
          setEditBrand(null);
        }}
        editItem={editBrand}
        onSuccess={fetchData}
      />
      <div className="mb-20" /> {/* Extra spacing for tab content */}
    </div>
  );
}
