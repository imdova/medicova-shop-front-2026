"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Save, X, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import { Card } from "@/components/shared/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/shared/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shared/select";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useRouter } from "next/navigation";
import { TagData } from "@/services/tagService";
import { MultiCategory } from "@/types";

const tagSchema = z.object({
  nameEn: z.string().min(1, "English name is required"),
  nameAr: z.string().min(1, "Arabic name is required"),
  slugEn: z.string().min(1, "English slug is required"),
  slugAr: z.string().min(1, "Arabic slug is required"),
  categoryId: z.string().min(1, "Category is required"),
});

interface TagFormProps {
  initialData?: Partial<TagData>;
  categories: MultiCategory[];
  onSubmit: (data: TagData) => Promise<void>;
  isSubmitting?: boolean;
}

export default function TagForm({
  initialData,
  categories,
  onSubmit,
  isSubmitting,
}: TagFormProps) {
  const t = useTranslations("admin.productTagsPage");
  const locale = useAppLocale();
  const router = useRouter();

  const form = useForm<TagData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      nameEn: initialData?.nameEn || "",
      nameAr: initialData?.nameAr || "",
      slugEn: initialData?.slugEn || "",
      slugAr: initialData?.slugAr || "",
      categoryId: initialData?.categoryId || "",
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-2xl">
            <Tag size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              {initialData?.nameEn ? t("editTag") : t("addTag")}
            </h1>
            <p className="mt-0.5 text-sm text-gray-400">{t("description")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-10 rounded-xl"
          >
            <X size={16} className="mr-2" />
            {t("cancelForm")}
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="shadow-primary/20 h-10 rounded-xl bg-primary px-6 shadow-lg"
          >
            <Save size={16} className="mr-2" />
            {initialData?.nameEn ? t("updateTag") : t("saveTag")}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <Card className="grid grid-cols-1 gap-6 p-6">
            {/* Category Selection */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    {t("category")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder={t("selectCategory")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.title[locale]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {t("titleEn")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Electronics"
                        {...field}
                        className="h-11 rounded-xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {t("titleAr")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="إلكترونيات"
                        dir="rtl"
                        {...field}
                        className="h-11 rounded-xl text-right"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slugEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {t("slugEn")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="electronics"
                        {...field}
                        className="h-11 rounded-xl font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slugAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      {t("slugAr")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="إلكترونيات"
                        dir="rtl"
                        {...field}
                        className="h-11 rounded-xl text-right font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
