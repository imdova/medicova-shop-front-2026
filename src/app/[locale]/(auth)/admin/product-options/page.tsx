"use client";
import Link from "next/link";
import { PencilIcon, Plus, TrashIcon, Box, Loader2 } from "lucide-react";
import DynamicTable from "@/components/features/tables/DTable";
import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { ProductOption } from "@/types/product";
import { useRouter } from "next/navigation";
import { Input } from "@/components/shared/input";
import { getVariants, deleteVariant } from "@/services/variantService";
import { useSession } from "next-auth/react";

export default function ProductOptionsListPanel() {
  const t = useTranslations("admin.productVariantsPage");
  const locale = useAppLocale();
  const router = useRouter();
  const { data: session } = useSession();

  const [variants, setVariants] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchVariants = async () => {
    const token = (session as any)?.accessToken;
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getVariants(token);
      setVariants(data);
    } catch (error) {
      console.error("Failed to fetch variants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = (session as any)?.accessToken;
    if (token) {
      fetchVariants();
    }
  }, [session]);

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      const token = (session as any)?.accessToken;
      await deleteVariant(id, token);
      setVariants((prev) => prev.filter((v) => v.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete variant");
    }
  };

  const columns = useMemo(
    () => [
      {
        key: "name",
        header: t("variantName"),
        sortable: true,
        render: (item: ProductOption) => (
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/5 border-primary/10 flex h-9 w-9 items-center justify-center rounded-lg border text-primary shadow-sm">
              <Box size={16} />
            </div>
            <Link
              className="text-sm font-black text-gray-900 transition-colors hover:text-primary"
              href={`/admin/product-options/edit/${item.id}`}
            >
              {item.name[locale]}
            </Link>
          </div>
        ),
      },
      {
        key: "type",
        header: t("variantType"),
        render: (item: ProductOption) => {
          const typeMap: Record<
            string,
            { label: string; color: string; bg: string }
          > = {
            dropdown: {
              label: t("dropdown"),
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            color: {
              label: t("color"),
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            options: {
              label: t("options"),
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
          };
          const type =
            typeMap[item.option_type || "dropdown"] || typeMap.dropdown;
          return (
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${type.bg} ${type.color}`}
            >
              {type.label}
            </span>
          );
        },
      },
    ],
    [t, locale],
  );

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return variants;
    const q = searchQuery.toLowerCase();
    return variants.filter(
      (opt) =>
        opt.name.en.toLowerCase().includes(q) ||
        opt.name.ar.toLowerCase().includes(q),
    );
  }, [searchQuery, variants]);

  return (
    <div className="animate-in fade-in space-y-5 duration-700">
      {/* Header Section */}
      <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black tracking-tight text-gray-900">
            {t("title")}
          </h1>
          <p className="text-xs font-medium text-gray-400">{t("subtitle")}</p>
        </div>
        <Link
          href="/admin/product-options/create"
          className="shadow-primary/20 flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-black text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={16} />
          {t("createVariant")}
        </Link>
      </div>

      {/* Content Card */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/20">
        <div className="border-b border-gray-50 p-4">
          <div className="max-w-xs">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("variantName")}
              className="h-9 rounded-lg border-gray-100 bg-gray-50/50 text-sm"
            />
          </div>
        </div>

        <div className="min-h-[400px] p-1">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="text-primary/40 h-8 w-8 animate-spin" />
            </div>
          ) : (
            <DynamicTable
              data={filteredData}
              columns={columns}
              pagination={true}
              itemsPerPage={10}
              headerClassName="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest"
              rowClassName="hover:bg-gray-50/50 transition-colors duration-200 border-b border-gray-50/30 last:border-0"
              solidActions={[
                {
                  label: t("actions"),
                  onClick: (item) =>
                    router.push(`/admin/product-options/edit/${item.id}`),
                  icon: <PencilIcon className="h-3.5 w-3.5" />,
                  color: "#2563eb",
                },
                {
                  label: "Delete",
                  onClick: (item) => handleDelete(item.id),
                  icon: <TrashIcon className="h-3.5 w-3.5" />,
                  color: "#dc2626",
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
