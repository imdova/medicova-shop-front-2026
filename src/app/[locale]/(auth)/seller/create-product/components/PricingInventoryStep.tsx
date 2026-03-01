"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { DollarSign, Package, Weight, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface PricingInventoryProps {
  product: {
    price?: number;
    del_price?: number;
    saleStart?: string;
    saleEnd?: string;
    stock?: number;
    weightKg?: number;
    sizes?: string[];
    colors?: string[];
    specifications?: { key: string; value: string }[];
  };
  onChange: (updates: any) => void;
  errors: any;
}

export const PricingInventoryStep = ({
  product,
  onChange,
  errors,
}: PricingInventoryProps) => {
  const t = useTranslations("create_product.pricing");
  const [newSpec, setNewSpec] = useState({ key: "", value: "" });

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  const colorOptions = [
    "Red",
    "Blue",
    "Green",
    "Black",
    "White",
    "Yellow",
    "Purple",
    "Pink",
    "Orange",
    "Gray",
  ];

  const toggleItem = (list: string[], item: string, key: string) => {
    const newList = list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];
    onChange({ [key]: newList });
  };

  const addSpec = () => {
    if (newSpec.key && newSpec.value) {
      onChange({
        specifications: [...(product.specifications || []), newSpec],
      });
      setNewSpec({ key: "", value: "" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Pricing Section */}
        <div className="space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <DollarSign className="text-primary" /> {t("title")}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                {t("priceLabel")}
              </label>
              <input
                type="number"
                value={product.del_price || ""}
                onChange={(e) =>
                  onChange({ del_price: parseFloat(e.target.value) })
                }
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 font-black outline-none transition-all focus:border-primary focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                {t("salePrice")}
              </label>
              <input
                type="number"
                value={product.price || ""}
                onChange={(e) =>
                  onChange({ price: parseFloat(e.target.value) })
                }
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 font-black outline-none transition-all focus:border-primary focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                {t("saleStart")}
              </label>
              <input
                type="date"
                value={product.saleStart || ""}
                onChange={(e) => onChange({ saleStart: e.target.value })}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 font-bold outline-none transition-all focus:border-primary focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                {t("saleEnd")}
              </label>
              <input
                type="date"
                value={product.saleEnd || ""}
                onChange={(e) => onChange({ saleEnd: e.target.value })}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 font-bold outline-none transition-all focus:border-primary focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="space-y-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Package className="text-primary" /> {t("title")}
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                {t("stockQuantity")}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={product.stock || ""}
                  onChange={(e) =>
                    onChange({ stock: parseInt(e.target.value) })
                  }
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 font-black outline-none transition-all focus:border-primary focus:bg-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500">
                {t("weight")}
              </label>
              <div className="relative">
                <Weight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-300" />
                <input
                  type="number"
                  value={product.weightKg || ""}
                  onChange={(e) =>
                    onChange({ weightKg: parseFloat(e.target.value) })
                  }
                  className="w-full rounded-2xl border border-gray-100 bg-gray-50/50 p-4 font-black outline-none transition-all focus:border-primary focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attributes: Sizes & Colors */}
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {t("sizes")}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button
                key={size}
                onClick={() => toggleItem(product.sizes || [], size, "sizes")}
                className={`rounded-xl border px-4 py-2 text-sm font-black transition-all ${
                  product.sizes?.includes(size)
                    ? "shadow-primary/20 border-primary bg-primary text-white shadow-lg"
                    : "hover:border-primary/30 border-gray-100 bg-white text-gray-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-bold uppercase tracking-wider text-gray-700">
            {t("colors")}
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() =>
                  toggleItem(product.colors || [], color, "colors")
                }
                className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                  product.colors?.includes(color)
                    ? "bg-primary/5 border-primary text-primary"
                    : "hover:border-primary/30 border-gray-100 bg-white text-gray-600"
                }`}
              >
                <div
                  className="h-3 w-3 rounded-full border border-black/10"
                  style={{ backgroundColor: color.toLowerCase() }}
                />
                {color}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Specifications Table */}
      <div className="space-y-6">
        <label className="text-sm font-bold uppercase tracking-wider text-gray-700">
          {t("specifications")}
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            placeholder={t("specKey")}
            value={newSpec.key}
            onChange={(e) =>
              setNewSpec((prev) => ({ ...prev, key: e.target.value }))
            }
            className="focus:ring-primary/10 rounded-xl border border-gray-100 bg-white p-3 font-medium outline-none focus:ring-4"
          />
          <input
            placeholder={t("specValue")}
            value={newSpec.value}
            onChange={(e) =>
              setNewSpec((prev) => ({ ...prev, value: e.target.value }))
            }
            className="focus:ring-primary/10 rounded-xl border border-gray-100 bg-white p-3 font-medium outline-none focus:ring-4"
          />
          <button
            onClick={addSpec}
            className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 font-bold text-white transition-all hover:bg-black"
          >
            <Plus size={18} /> Add Spec
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl border border-gray-50 bg-gray-50/30">
          <table className="w-full text-left text-sm rtl:text-right">
            <tbody className="divide-y divide-gray-100">
              {product.specifications?.map((spec, i) => (
                <tr key={i} className="transition-colors hover:bg-white/50">
                  <td className="w-1/3 p-4 font-black uppercase tracking-tighter text-gray-400">
                    {spec.key}
                  </td>
                  <td className="p-4 font-bold text-gray-900">{spec.value}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() =>
                        onChange({
                          specifications: product.specifications?.filter(
                            (_, idx) => idx !== i,
                          ),
                        })
                      }
                      className="text-gray-300 transition-colors hover:text-rose-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
