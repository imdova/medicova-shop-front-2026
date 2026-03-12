"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Image from "next/image";
import { motion } from "framer-motion";

import DynamicTable from "@/components/features/tables/DTable";
import { useAppLocale } from "@/hooks/useAppLocale";
import { BrandHeader } from "./components/BrandHeader";
import { BrandFilters } from "./components/BrandFilters";
import CreateSellerBrandModal from "./components/CreateSellerBrandModal";
import { 
  getSellerBrandsMe, 
  deleteSellerBrand, 
  SellerBrand 
} from "@/services/sellerBrandService";
import { extractSessionToken } from "@/lib/auth/sessionToken";

const BrandsPage = () => {
  const t = useTranslations("admin");
  const ts = useTranslations("seller_brand_management");
  const locale = useAppLocale() as "en" | "ar";
  const { data: session } = useSession();
  const token = extractSessionToken(session);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SellerBrand | null>(null);
  const [brands, setBrands] = useState<SellerBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getSellerBrandsMe(token);
      setBrands(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredBrands = useMemo(() => {
    const list = Array.isArray(brands) ? brands : [];
    return list.filter((brand) => {
      return (brand.brandName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  }, [brands, searchTerm]);

  const handleDelete = useCallback(async (id: string) => {
    if (!token) return;
    try {
      await deleteSellerBrand(id, token);
      toast.success(t("deletedSuccessfully"));
      fetchData();
    } catch (err: any) {
      toast.error(err?.message || t("deleteFailed"));
    }
  }, [token, t, fetchData]);

  const columns = useMemo(
    () => [
      {
        key: "logo",
        header: t("brandImage"),
        render: (item: SellerBrand) => (
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-white bg-gray-50 shadow-sm ring-1 ring-gray-100">
            <Image
              fill
              src={item.brandLogo || "/images/placeholder.jpg"}
              alt={item.brandName}
              className="object-contain p-1 transition-transform duration-300 hover:scale-110"
            />
          </div>
        ),
      },
      {
        key: "name",
        header: t("brandName"),
        render: (item: SellerBrand) => (
          <span className="font-bold text-gray-900">{item.brandName}</span>
        ),
      },
      {
        key: "createdAt",
        header: t("date"),
        render: (item: SellerBrand) => (
          <span className="text-sm font-medium text-gray-500">
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}
          </span>
        ),
      },
    ],
    [t],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-20"
    >
      <BrandHeader onCreateClick={() => {
        setEditItem(null);
        setIsModalOpen(true);
      }} />

      <div className="space-y-6">
        <BrandFilters
          search={searchTerm}
          onSearchChange={setSearchTerm}
          locale={locale}
        />

        <div className="overflow-hidden rounded-xl border border-white/60 bg-white/70 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
          <DynamicTable
            data={filteredBrands}
            columns={columns}
            pagination
            itemsPerPage={10}
            locale={locale}
            emptyMessage={{
              en: isLoading ? ts("table.loading") : ts("table.noResults"),
              ar: isLoading ? ts("table.loading") : ts("table.noResults"),
            }}
            solidActions={[
              {
                label: locale === "ar" ? "تعديل" : "Edit",
                onClick: (item) => {
                    setEditItem(item as SellerBrand);
                    setIsModalOpen(true);
                },
                className: "bg-white/50 text-gray-700 hover:text-black hover:bg-white shadow-sm",
                icon: <PencilIcon className="h-4 w-4" />,
                color: "black",
              },
              {
                label: locale === "ar" ? "حذف" : "Delete",
                onClick: (item) => handleDelete((item as SellerBrand)._id),
                className: "bg-rose-50/50 text-rose-600 hover:bg-rose-100 shadow-sm",
                icon: <TrashIcon className="h-4 w-4" />,
                color: "#dc2626",
              },
            ]}
          />
        </div>
      </div>

      <CreateSellerBrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editItem={editItem}
        onSuccess={fetchData}
      />
    </motion.div>
  );
};

export default BrandsPage;
