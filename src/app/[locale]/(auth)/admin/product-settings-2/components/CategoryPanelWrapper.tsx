"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

import CategoryTabContent from "../../categories/components/CategoryTabContent";
import SubCategoryTabContent from "../../categories/components/SubCategoryTabContent";
import SubCategoryChildTabContent from "../../categories/components/SubCategoryChildTabContent";
import BrandTabContent from "../../categories/components/BrandTabContent";
import CreateCategoryModal from "../../categories/components/CreateCategoryModal";
import CreateSubCategoryModal from "../../categories/components/CreateSubCategoryModal";
import CreateSubCategoryChildModal from "../../categories/components/CreateSubCategoryChildModal";
import CreateBrandModal from "../../categories/components/CreateBrandModal";

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
} from "../../categories/constants";

type EntityTab = "categories" | "subCategories" | "childCategory" | "brands";

interface CategoryPanelWrapperProps {
  activeTab: EntityTab;
}

export default function CategoryPanelWrapper({
  activeTab,
}: CategoryPanelWrapperProps) {
  const t = useTranslations("admin");
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subCategoryChildren, setSubCategoryChildren] = useState<
    SubCategoryChild[]
  >([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [editSubCategory, setEditSubCategory] = useState<SubCategory | null>(
    null,
  );
  const [editSubCategoryChild, setEditSubCategoryChild] =
    useState<SubCategoryChild | null>(null);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);

  const fetchData = useCallback(() => {
    Promise.all([
      fetchCategories().catch(() => [] as Category[]),
      fetchSubCategories().catch(() => [] as SubCategory[]),
      fetchSubCategoryChildren().catch(() => [] as SubCategoryChild[]),
      fetchBrands().catch(() => [] as Brand[]),
    ]).then(([cats, subs, children, brs]) => {
      setCategories(cats);
      setSubCategories(subs);
      setSubCategoryChildren(children);
      setBrands(brs);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset search when switching tabs
  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  const filter = useCallback(
    <T extends { name: { en: string; ar: string } }>(items: T[]) => {
      if (!searchQuery.trim()) return items;
      const q = searchQuery.toLowerCase();
      return items.filter(
        (i) =>
          i.name.en.toLowerCase().includes(q) ||
          i.name.ar.toLowerCase().includes(q),
      );
    },
    [searchQuery],
  );

  const handleStatusChange = useCallback(
    async (
      type: "category" | "subCategory" | "subCategoryChild" | "brand",
      itemId: string,
      newStatus: boolean,
    ) => {
      try {
        if (type === "category")
          await toggleCategoryStatus(itemId, newStatus, token);
        if (type === "subCategory")
          await toggleSubCategoryStatus(itemId, newStatus, token);
        if (type === "subCategoryChild")
          await toggleSubCategoryChildStatus(itemId, newStatus, token);
        if (type === "brand") await toggleBrandStatus(itemId, newStatus, token);
        toast.success(t("savedSuccessfully"));
        fetchData();
      } catch (err: any) {
        toast.error(err?.message || t("saveFailed"));
      }
    },
    [token, t, fetchData],
  );

  const handleDelete = useCallback(
    async (
      type: "category" | "subCategory" | "subCategoryChild" | "brand",
      id: string,
    ) => {
      try {
        if (type === "category") await deleteCategory(id, token);
        if (type === "subCategory") await deleteSubCategory(id, token);
        if (type === "subCategoryChild")
          await deleteSubCategoryChild(id, token);
        if (type === "brand") await deleteBrand(id, token);
        toast.success(t("deletedSuccessfully"));
        fetchData();
      } catch (err: any) {
        toast.error(err?.message || t("deleteFailed"));
      }
    },
    [token, t, fetchData],
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
    setEditCategory(null);
    setEditSubCategory(null);
    setEditSubCategoryChild(null);
    setEditBrand(null);
  }, []);

  return (
    <>
      {activeTab === "categories" && (
        <CategoryTabContent
          data={filter(categories)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onStatusChange={(item, status) =>
            handleStatusChange("category", item.id, status)
          }
          onEdit={(item) => {
            setEditCategory(item);
            setShowModal(true);
          }}
          onDelete={(item) => handleDelete("category", item.id)}
          onCreateClick={() => {
            setEditCategory(null);
            setShowModal(true);
          }}
        />
      )}

      {activeTab === "subCategories" && (
        <SubCategoryTabContent
          data={filter(subCategories)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onStatusChange={(item, status) =>
            handleStatusChange("subCategory", item.id, status)
          }
          onEdit={(item) => {
            setEditSubCategory(item);
            setShowModal(true);
          }}
          onDelete={(item) => handleDelete("subCategory", item.id)}
          onCreateClick={() => {
            setEditSubCategory(null);
            setShowModal(true);
          }}
        />
      )}

      {activeTab === "childCategory" && (
        <SubCategoryChildTabContent
          data={filter(subCategoryChildren)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onStatusChange={(item, status) =>
            handleStatusChange("subCategoryChild", item.id, status)
          }
          onEdit={(item) => {
            setEditSubCategoryChild(item);
            setShowModal(true);
          }}
          onDelete={(item) => handleDelete("subCategoryChild", item.id)}
          onCreateClick={() => {
            setEditSubCategoryChild(null);
            setShowModal(true);
          }}
        />
      )}

      {activeTab === "brands" && (
        <BrandTabContent
          data={filter(brands)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onStatusChange={(item, status) =>
            handleStatusChange("brand", item.id, status)
          }
          onEdit={(item) => {
            setEditBrand(item);
            setShowModal(true);
          }}
          onDelete={(item) => handleDelete("brand", item.id)}
          onCreateClick={() => {
            setEditBrand(null);
            setShowModal(true);
          }}
        />
      )}

      {/* Modals */}
      {activeTab === "categories" && (
        <CreateCategoryModal
          isOpen={showModal}
          onClose={closeModal}
          editItem={editCategory}
          onSuccess={fetchData}
        />
      )}
      {activeTab === "subCategories" && (
        <CreateSubCategoryModal
          isOpen={showModal}
          onClose={closeModal}
          categories={categories}
          editItem={editSubCategory}
          onSuccess={fetchData}
        />
      )}
      {activeTab === "childCategory" && (
        <CreateSubCategoryChildModal
          isOpen={showModal}
          onClose={closeModal}
          subCategories={subCategories}
          editItem={editSubCategoryChild}
          onSuccess={fetchData}
        />
      )}
      {activeTab === "brands" && (
        <CreateBrandModal
          isOpen={showModal}
          onClose={closeModal}
          editItem={editBrand}
          onSuccess={fetchData}
        />
      )}
    </>
  );
}
