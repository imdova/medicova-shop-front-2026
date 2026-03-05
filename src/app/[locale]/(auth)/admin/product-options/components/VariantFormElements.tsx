"use client";

import React from "react";
import { Plus, Trash2, Palette, List, Type } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Card } from "@/components/shared/card";
import { useFormContext, useFieldArray } from "react-hook-form";

export function VariantValues({
  type,
}: {
  type: "dropdown" | "color" | "options";
}) {
  const t = useTranslations("admin.productVariantsPage");
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "values",
  });

  const isColor = type === "color";

  return (
    <Card className="p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-black text-gray-900">
          {isColor ? t("color") : t("options")}
        </h3>
        <Button
          type="button"
          onClick={() =>
            append({ label: { en: "", ar: "" }, color: "#000000", price: "" })
          }
          className="flex h-9 items-center gap-2 rounded-xl bg-primary px-3 py-1.5 text-[11px] font-black text-white"
        >
          <Plus size={14} />
          {t("addOption")}
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="hover:border-primary/20 group relative flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-all hover:bg-white lg:flex-row lg:items-end lg:gap-4"
          >
            {isColor && (
              <div className="flex-none">
                <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-gray-400">
                  {t("selectColor")}
                </label>
                <div className="relative h-9 w-16 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                  <input
                    type="color"
                    {...register(`values.${index}.color`)}
                    className="absolute inset-0 h-full w-full cursor-pointer border-none p-0"
                  />
                </div>
              </div>
            )}

            <div
              className={`grid flex-1 gap-3 ${isColor ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
            >
              {!isColor && (
                <>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      {t("optionEn")}
                    </label>
                    <Input
                      {...register(`values.${index}.label.en`)}
                      placeholder="e.g. Small"
                      className="h-9 rounded-lg px-3 py-1 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400">
                      {t("optionAr")}
                    </label>
                    <Input
                      {...register(`values.${index}.label.ar`)}
                      placeholder="مثال: صغير"
                      className="h-9 rounded-lg px-3 py-1 text-right text-sm"
                      dir="rtl"
                    />
                  </div>
                </>
              )}
              <div className="space-y-1">
                <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400">
                  {t("price")}
                </label>
                <Input
                  type="number"
                  {...register(`values.${index}.price`)}
                  placeholder="0.00"
                  className="h-9 rounded-lg px-3 py-1 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400">
                  Stock
                </label>
                <Input
                  type="number"
                  {...register(`values.${index}.stock`)}
                  placeholder="0"
                  className="h-9 rounded-lg px-3 py-1 font-mono text-sm"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={fields.length === 1}
              onClick={() => remove(index)}
              className="h-9 w-9 text-rose-500 hover:bg-rose-50 hover:text-rose-600 lg:mb-0"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function VariantTypeSelector({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  const t = useTranslations("admin.productVariantsPage");
  const types = [
    { id: "dropdown", label: t("dropdown"), icon: <List size={18} /> },
    { id: "color", label: t("color"), icon: <Palette size={18} /> },
    { id: "options", label: t("options"), icon: <Type size={18} /> },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {types.map((type) => (
        <button
          key={type.id}
          type="button"
          onClick={() => onChange(type.id)}
          className={`group flex items-center gap-3 rounded-xl border p-3.5 transition-all duration-300 ${
            value === type.id
              ? "bg-primary/5 shadow-primary/10 border-primary shadow-md ring-1 ring-primary"
              : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm"
          }`}
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              value === type.id
                ? "bg-primary text-white"
                : "bg-gray-50 text-gray-400 group-hover:bg-gray-100"
            }`}
          >
            {type.icon}
          </div>
          <div className="text-left">
            <span
              className={`block text-sm font-black ${value === type.id ? "text-primary" : "text-gray-900"}`}
            >
              {type.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
