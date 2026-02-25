"use client";

import React, { useMemo, useState, useCallback } from "react";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  Download,
  RotateCcw,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Filters } from "@/components/features/filter/FilterDrawer";
import { LanguageType } from "@/util/translations";

// Reuse existing components if possible or create similar ones
import OrderStats from "../components/OrderStats";
import { Order, Product } from "../constants";

export default function RefundRequestsListPanel({
  locale = "en",
}: {
  locale: LanguageType;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations("admin");
  const isRTL = locale === "ar";

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // Dummy data (usually this would come from an API)
  const refunds: Order[] = useMemo(
    () => [
      // ... same data structure as Order for now since it was similar in original
    ],
    [],
  );

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: refunds.length,
      pending: 0,
      processed: 0,
    };
    // ... count logic
    return counts;
  }, [refunds]);

  const orderColumns = useMemo(
    () => [
      { key: "id", header: t("orderId"), sortable: true },
      {
        key: "customer",
        header: t("customer"),
        render: (item: Order) => (
          <div
            className={`text-sm leading-tight ${isRTL ? "text-right" : "text-left"}`}
          >
            <div className="font-bold text-gray-900">{item.customer.name}</div>
            <div className="mt-0.5 text-[11px] font-medium text-gray-400">
              {item.customer.phone}
            </div>
          </div>
        ),
      },
      {
        key: "total",
        header: t("totalSales"),
        render: (item: Order) => (
          <span className="font-bold text-gray-900">{item.total}</span>
        ),
      },
      {
        key: "status",
        header: t("status"),
        render: (item: Order) => {
          // Styled status
          return (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-600">
              {t("statusOptions.pending")}
            </span>
          );
        },
      },
    ],
    [t, isRTL],
  );

  return (
    <div className="animate-in fade-in fill-mode-forwards space-y-6 duration-500">
      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="focus:border-primary/30 focus:ring-primary/5 h-12 w-full rounded-2xl border border-gray-100 bg-gray-50/50 pl-11 pr-4 text-sm outline-none transition-all duration-300 focus:bg-white focus:ring-4"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(true)}
              className="flex h-12 items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50/30 px-4 text-sm font-semibold text-gray-600 transition-all duration-300 hover:bg-white hover:text-primary hover:shadow-md"
            >
              <SlidersHorizontal size={18} />
            </button>
            <button className="shadow-primary/20 flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:brightness-110 active:scale-95">
              {t("showData")}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl">
        <DynamicTable
          data={refunds}
          columns={orderColumns}
          minWidth={800}
          pagination={true}
          itemsPerPage={5}

          headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-wider"
          actions={[
            {
              label: t("edit"),
              onClick: () => console.log("edit"),
              icon: <PencilIcon className="h-4 w-4" />,
            },
          ]}
        />
      </div>

      <Filters
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filtersData={[]}

      />
    </div>
  );
}
