"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

import { products } from "@/data";
import { filtersData } from "@/constants/drawerFilter";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Filters } from "@/components/features/filter/FilterDrawer";

import { ProductStats } from "./components/ProductStats";
import { ProductFilters } from "./components/ProductFilters";
import { ProductTable } from "./components/ProductTable";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const locale = useAppLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("seller_products");

  const [filtersOpen, setFiltersOpen] = useState(false);

  const statusFilter = searchParams.get("status") || "all";
  const stockFilter = searchParams.get("stock") || "all";
  const offerFilter = searchParams.get("offer") || "all";
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (statusFilter !== "all" && product.status?.en !== statusFilter)
        return false;
      if (stockFilter === "in_stock" && (product.stock ?? 0) <= 0) return false;
      if (stockFilter === "out_of_stock" && (product.stock ?? 0) > 0)
        return false;
      if (offerFilter === "yes" && !product.sale) return false;
      if (offerFilter === "no" && product.sale) return false;
      if (
        searchQuery &&
        !product.title[locale].toLowerCase().includes(searchQuery)
      )
        return false;
      return true;
    });
  }, [statusFilter, stockFilter, offerFilter, searchQuery, locale]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter((p) => p.status?.en === "Active").length,
      outOfStock: products.filter((p) => (p.stock ?? 0) === 0).length,
      onOffer: products.filter((p) => p.sale).length,
    };
  }, []);

  const handleFilterChange = (filterType: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(filterType, value);
    } else {
      params.delete(filterType);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleEditProduct = (id: string) => {
    router.push(`/seller/products/edit-product/${id}`);
  };

  const handleDeleteProduct = (id: string) => {
    console.log("Delete product", id);
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
            {t("title")}
          </h1>
          <p className="font-medium text-gray-500">{t("subtitle")}</p>
        </div>

        <Link
          href="/seller/create-product"
          className="shadow-primary/20 flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" strokeWidth={3} />
          {t("addProduct")}
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <ProductStats stats={stats} locale={locale} />

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={(val) => handleFilterChange("search", val)}
          statusFilter={statusFilter}
          onStatusChange={(val) => handleFilterChange("status", val)}
          stockFilter={stockFilter}
          onStockChange={(val) => handleFilterChange("stock", val)}
          offerFilter={offerFilter}
          onOfferChange={(val) => handleFilterChange("offer", val)}
          onOpenAdvancedFilters={() => setFiltersOpen(true)}
          locale={locale}
        />
      </motion.div>

      {/* Products Table Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <ProductTable
          products={filteredProducts}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
          locale={locale}
        />
      </motion.div>

      {/* Advanced Filters Drawer */}
      <Filters
        filtersData={filtersData}
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        locale={locale as any}
      />
    </div>
  );
}
