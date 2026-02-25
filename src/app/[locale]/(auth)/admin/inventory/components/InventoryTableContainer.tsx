"use client";

import React, { useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CornerDownRight,
  Package,
  Database,
  PencilIcon,
  TrashIcon,
  Save,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import DynamicTable from "@/components/features/tables/DTable";
import { ProductInventory, ProductVariant } from "@/types/product";
import { LanguageType } from "@/util/translations";
import Image from "next/image";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/select";
import { Input } from "@/components/shared/input";
import { Button } from "@/components/shared/button";

interface InventoryTableContainerProps {
  data: ProductInventory[];
  locale: LanguageType;
  expandedItems: Set<number>;
  toggleExpand: (id: number) => void;
  onSave: (
    id: number,
    data: { storefrontManagement: string; quantity: number },
  ) => void;
}

const InventoryTableContainer: React.FC<InventoryTableContainerProps> = ({
  data,
  locale,
  expandedItems,
  toggleExpand,
  onSave,
}) => {
  const t = useTranslations("admin");
  const [editStates, setEditStates] = useState<
    Record<number, { storefrontManagement: string; quantity: number }>
  >({});

  const flattenData = useMemo(() => {
    const flattened: (
      | ProductInventory
      | (ProductVariant & { isVariant: boolean; parentId: number })
    )[] = [];
    data.forEach((item) => {
      flattened.push(item);
      if (item.hasVariants && expandedItems.has(item.id)) {
        item.variants?.forEach((variant) => {
          flattened.push({
            ...variant,
            isVariant: true,
            parentId: item.id,
          } as any);
        });
      }
    });
    return flattened;
  }, [data, expandedItems]);

  const columns = useMemo(
    () => [
      {
        key: "Products",
        header: t("products"),
        render: (item: any) => (
          <div className="flex items-center gap-3">
            {item.hasVariants && (
              <button
                onClick={() => toggleExpand(item.id)}
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-50 text-gray-400 transition-colors hover:bg-gray-100"
              >
                {expandedItems.has(item.id) ? (
                  <ChevronDownIcon size={14} />
                ) : (
                  <ChevronRightIcon size={14} />
                )}
              </button>
            )}
            {item.isVariant && (
              <div
                className={`${locale === "ar" ? "mr-6" : "ml-6"} text-gray-300`}
              >
                <CornerDownRight size={14} />
              </div>
            )}
            <div className="relative h-10 w-10 flex-shrink-0">
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-gray-50">
                {item.image ? (
                  <Image
                    width={40}
                    height={40}
                    src={item.image}
                    alt={item.name}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <Package size={18} className="text-gray-300" />
                )}
              </div>
            </div>
            <div className="min-w-0">
              <Link
                href={`/${locale}/admin/products/edit/${item.isVariant ? item.parentId : item.id}`}
                className="line-clamp-1 text-xs font-bold text-gray-900 transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                  SKU: {item.sku}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "storefrontManagement",
        header: t("storefrontManagement"),
        render: (item: any) => {
          const currentState = editStates[item.id] || {
            storefrontManagement: item.storefrontManagement,
            quantity: item.quantity,
          };

          return (
            <Select
              onValueChange={(value) =>
                setEditStates((prev) => ({
                  ...prev,
                  [item.id]: { ...currentState, storefrontManagement: value },
                }))
              }
              value={currentState.storefrontManagement}
            >
              <SelectTrigger className="focus:ring-primary/5 h-9 w-32 rounded-xl border-gray-100 bg-gray-50/50 text-[11px] font-bold outline-none focus:ring-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                <SelectItem value="in_stock" className="text-xs font-bold">
                  {t("inStock")}
                </SelectItem>
                <SelectItem value="out_stock" className="text-xs font-bold">
                  {t("outOfStock")}
                </SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
      {
        key: "quantity",
        header: t("quantity"),
        render: (item: any) => {
          const currentState = editStates[item.id] || {
            storefrontManagement: item.storefrontManagement,
            quantity: item.quantity,
          };
          const isOutStock = currentState.storefrontManagement === "out_stock";

          return (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={currentState.quantity}
                disabled={isOutStock}
                onChange={(e) =>
                  setEditStates((prev) => ({
                    ...prev,
                    [item.id]: {
                      ...currentState,
                      quantity: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                className="focus:ring-primary/5 h-9 w-20 rounded-xl border-gray-100 bg-gray-50/50 text-center text-[11px] font-bold outline-none focus:ring-4"
              />
              {editStates[item.id] && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSave(item.id, editStates[item.id])}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shadow-sm transition-all hover:bg-emerald-600 hover:text-white"
                  >
                    <Save size={14} />
                  </button>
                  <button
                    onClick={() => {
                      const newStates = { ...editStates };
                      delete newStates[item.id];
                      setEditStates(newStates);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 shadow-sm transition-all hover:bg-rose-500 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [t, expandedItems, toggleExpand, locale, editStates, onSave],
  );

  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-xl shadow-gray-200/40 backdrop-blur-xl transition-all duration-500">
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
          <Database size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-wider text-gray-900">
            {t("manageInventory")}
          </h4>
          <p className="mt-0.5 text-[10px] font-bold text-gray-400">
            Real-time Stock Synchronization
          </p>
        </div>
      </div>

      <DynamicTable
        data={flattenData}
        columns={columns}
        minWidth={1000}
        pagination={true}
        itemsPerPage={10}

        headerClassName="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-wider"
        rowClassName="hover:bg-gray-50/80 transition-colors duration-300 border-b border-gray-50/50"
      />
    </div>
  );
};

export default InventoryTableContainer;
