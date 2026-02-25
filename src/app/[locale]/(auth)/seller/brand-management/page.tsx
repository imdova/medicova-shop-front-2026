"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  PencilIcon,
  TrashIcon,
  Search,
  Plus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";

import DynamicTable from "@/components/features/tables/DTable";
import BrandApprovalModal from "../components/BrandApprovalModal";
import { useAppLocale } from "@/hooks/useAppLocale";

// Modular Components
import { BrandHeader } from "./components/BrandHeader";
import { BrandChecker } from "./components/BrandChecker";
import { BrandFilters } from "./components/BrandFilters";

type Brand = {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const BrandsPage = () => {
  const t = useTranslations("seller_brand_management");
  const locale = useAppLocale();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch initial data
  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((r) => setTimeout(r, 800));
      const mockBrands: Brand[] = [
        { id: "1", name: "Nike", status: "approved", createdAt: "2023-01-15" },
        {
          id: "2",
          name: "Adidas",
          status: "approved",
          createdAt: "2023-02-20",
        },
        { id: "3", name: "Puma", status: "pending", createdAt: "2023-03-10" },
        {
          id: "4",
          name: "Reebok",
          status: "rejected",
          createdAt: "2023-04-05",
        },
        {
          id: "5",
          name: "Under Armour",
          status: "pending",
          createdAt: "2023-05-12",
        },
      ];
      setBrands(mockBrands);
      setIsLoading(false);
    };
    fetchBrands();
  }, []);

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchesSearch = brand.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || brand.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [brands, searchTerm, statusFilter]);

  const handleBrandCheck = useCallback(
    async (name: string) => {
      // Simulate lookup in Noon's master brands list
      await new Promise((r) => setTimeout(r, 500));
      const exists = brands.some(
        (b) => b.name.toLowerCase() === name.trim().toLowerCase(),
      );
      return exists ? "exists" : "not-exists";
    },
    [brands],
  );

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: t("table.name"),
        sortable: true,
        render: (item: Brand) => (
          <span className="font-black text-gray-900">{item.name}</span>
        ),
      },
      {
        key: "status",
        header: t("table.status"),
        render: (item: Brand) => (
          <span
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
              item.status === "approved"
                ? "bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100"
                : item.status === "pending"
                  ? "bg-amber-50 text-amber-600 shadow-sm shadow-amber-100"
                  : "bg-rose-50 text-rose-600 shadow-sm shadow-rose-100"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                item.status === "approved"
                  ? "bg-emerald-500"
                  : item.status === "pending"
                    ? "bg-amber-500"
                    : "bg-rose-500"
              }`}
            />
            {t(`filters.status.${item.status}`)}
          </span>
        ),
      },
      {
        key: "createdAt",
        header: t("table.createdAt"),
        sortable: true,
        render: (item: Brand) => (
          <span className="text-sm font-medium text-gray-500">
            {item.createdAt}
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
      <BrandHeader onCreateClick={() => setIsModalOpen(true)} />

      <BrandChecker onCheck={handleBrandCheck} />

      <div className="space-y-6">
        <BrandFilters
          search={searchTerm}
          status={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          locale={locale}
        />

        <div className="overflow-hidden rounded-xl border border-white/60 bg-white/70 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
          <DynamicTable
            data={filteredBrands}
            columns={columns}
            pagination
            itemsPerPage={10}
            selectable
            locale={locale}
            emptyMessage={{
              en: isLoading ? t("table.loading") : t("table.noResults"),
              ar: isLoading ? t("table.loading") : t("table.noResults"),
            }}
            actions={[
              {
                label: { en: "Edit", ar: "تعديل" },
                onClick: (item) => console.log("Edit", item),
                className:
                  "bg-white/50 text-gray-700 hover:text-black hover:bg-white shadow-sm",
                icon: <PencilIcon className="h-4 w-4" />,
              },
              {
                label: { en: "Delete", ar: "حذف" },
                onClick: (item) => console.log("Delete", item),
                className:
                  "bg-rose-50/50 text-rose-600 hover:bg-rose-100 shadow-sm",
                icon: <TrashIcon className="h-4 w-4" />,
              },
            ]}
          />
        </div>
      </div>

      <BrandApprovalModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        locale={locale as any}
      />
    </motion.div>
  );
};

export default BrandsPage;
