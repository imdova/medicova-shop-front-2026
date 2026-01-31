"use client";

import {
  useForm,
  useFieldArray,
  SubmitHandler,
  FieldValues,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Languages, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/UI/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/UI/card";
import { Checkbox } from "@/components/UI/Check-Box";
import { Switch } from "@/components/UI/switch";
import { CategoriesSelector } from "@/components/page/products-attribute/CategoriesSelector";
import { ColorPicker } from "@/components/UI/ColorPicke";
import { useParams } from "next/navigation";
import { ProductAttributes } from "@/constants/productsAttributes";
import AttributeImageUpload from "@/components/page/products-attribute/AttributeImageUpload";

// ---------------- Schema & Types ----------------
const messages = {
  title_en_required: {
    en: "Title in English is required",
    ar: "العنوان بالإنجليزية مطلوب",
  },
  title_ar_required: {
    en: "Title in Arabic is required",
    ar: "العنوان بالعربية مطلوب",
  },
  attribute_required: {
    en: "At least one attribute is required",
    ar: "يجب إضافة خاصية واحدة على الأقل",
  },
};

const attributeSchema = z.object({
  title: z.object({
    en: z.string().min(1, messages.title_en_required.en),
    ar: z.string().min(1, messages.title_ar_required.ar),
  }),
  use_image_from_variation: z.boolean(),
  display_layout: z.string().min(1, "Display layout is required"),
  searchable: z.boolean(),
  comparable: z.boolean(),
  use_in_product_listing: z.boolean(),
  sort_order: z.number(),
  categories: z.array(z.string()),
  attributes: z
    .array(
      z.object({
        id: z.string(),
        title: z.object({
          en: z.string().min(1, "English title is required"),
          ar: z.string().min(1, "العنوان بالعربية مطلوب"),
        }),
        color: z.string().optional(),
        image: z.any().optional(),
        is_default: z.boolean(),
      }),
    )
    .min(1, messages.attribute_required.en),
  status: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }),
});

type AttributeFormData = z.infer<typeof attributeSchema>;

// ---------------- Component ----------------
export default function EditAttributePage() {
  const { language } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;

  const attributeToEdit = ProductAttributes.find(
    (attribute) => attribute.id === slug,
  );

  const form = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      title: attributeToEdit?.name ?? { en: "", ar: "" },
      use_image_from_variation:
        attributeToEdit?.use_image_from_variation ?? false,
      display_layout: attributeToEdit?.display_layout ?? "",
      searchable: attributeToEdit?.searchable ?? false,
      comparable: attributeToEdit?.comparable ?? false,
      use_in_product_listing: attributeToEdit?.use_in_product_listing ?? false,
      sort_order: attributeToEdit?.sortOrder ?? 0,
      categories: attributeToEdit?.categories ?? [],
      attributes:
        attributeToEdit?.attributes?.map((attr) => ({
          id: attr.id ?? "",
          title: attr.title ?? { en: "", ar: "" },
          color: attr.color ?? "",
          image: attr.image ?? null,
          is_default: attr.is_default ?? false,
        })) ?? [],
      status: attributeToEdit?.status ?? { en: "draft", ar: "مسودة" },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attributes",
  });

  const onSubmit: SubmitHandler<AttributeFormData> = async (data) => {
    try {
      console.log("Editing attribute with slug:", slug);
      console.log("Form data:", data);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Attribute updated successfully!");
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const t = {
    en: {
      title: "Title",
      use_image: "Use image from product variation (for Visual Swatch only)",
      attributes_list: "Attributes list",
      display_layout: "Display Layout",
      status: "Status",
      updateExit: "Update & Exit",
      update: "Update",
      draft: "Draft",
      add_attribute: "Add Attribute",
      default: "Default",
      color: "Color",
      image: "Image",
      remove: "Remove",
      language_version: "You are editing 'English' version",
      edit_attribute: "Edit Product Attribute",
      dropdown: "Dropdown",
      visual_swatch: "Visual Swatch",
      text_swatch: "Text Swatch",
      searchable: "Searchable",
      comparable: "Comparable",
      use_in_product_listing: "Used in product listing",
      sort_order: "Sort order",
      categories: "Categories",
      english: "English",
      arabic: "Arabic",
      editing: "Editing",
      not_found: "Attribute not found",
    },
    ar: {
      title: "العنوان",
      use_image: "استخدم الصورة من متغير المنتج (للمعاينة البصرية فقط)",
      attributes_list: "قائمة الخصائص",
      display_layout: "نمط العرض",
      status: "الحالة",
      save: "حفظ والخروج",
      published: "منشور",
      draft: "مسودة",
      add_attribute: "إضافة خاصية",
      default: "افتراضي",
      color: "اللون",
      image: "الصورة",
      remove: "إزالة",
      language_version: "أنت تقوم بتحرير النسخة 'العربية'",
      edit_attribute: "تعديل خاصية المنتج",
      dropdown: "قائمة منسدلة",
      visual_swatch: "معاينة بصرية",
      text_swatch: "معاينة نصية",
      searchable: "قابل للبحث",
      comparable: "قابل للمقارنة",
      use_in_product_listing: "مستخدم في قائمة المنتجات",
      sort_order: "ترتيب الفرز",
      categories: "الفئات",
      english: "الإنجليزية",
      arabic: "العربية",
      editing: "جاري التعديل",
      not_found: "الخاصية غير موجودة",
    },
  }[language];

  if (!attributeToEdit) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Languages className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-xl font-semibold">{t.not_found}</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Languages className="h-6 w-6" />
          {t.edit_attribute}
          <span className="text-sm font-normal text-gray-500">
            ({t.editing}: {attributeToEdit.name[language]})
          </span>
        </h1>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit as SubmitHandler<FieldValues>)}
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
            <div className="space-y-6 lg:col-span-4">
              {/* Title Section - Bilingual */}
              <Card className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    name="title.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.title} ({t.english}) *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t.title} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="title.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.title} ({t.arabic}) *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t.title} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Use Image from Variation - English only */}
                <FormField
                  name="use_image_from_variation"
                  render={({ field }) => (
                    <FormItem className="mt-4 flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        {t.use_image}
                      </FormLabel>
                    </FormItem>
                  )}
                />
              </Card>

              {/* Attributes List Section - Bilingual titles */}
              <Card className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold sm:text-lg">
                    {t.attributes_list}
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      append({
                        id: "1",
                        title: { en: "", ar: "" },
                        color: "",
                        image: "/placholder.png",
                        is_default: false,
                      });
                    }}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    {t.add_attribute}
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="space-y-3 rounded-lg border p-4"
                    >
                      {/* Attribute Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={field.is_default}
                            onCheckedChange={() => {
                              const newAttributes = fields.map((attr, i) => ({
                                ...attr,
                                is_default: i === index,
                              }));
                              form.setValue("attributes", newAttributes);
                            }}
                          />
                          <span className="text-sm font-medium">
                            {t.default}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 1}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t.remove}
                        </Button>
                      </div>

                      {/* Title Fields - Bilingual */}
                      <div className="flex flex-col gap-3 md:flex-row">
                        <div className="flex flex-col justify-between gap-2">
                          <FormLabel>
                            {t.title} ({t.english})
                          </FormLabel>
                          <Input
                            {...form.register(`attributes.${index}.title.en`)}
                            placeholder={`${t.title} (${t.english})`}
                          />
                        </div>
                        <div className="flex flex-col justify-between gap-2">
                          <FormLabel>
                            {t.title} ({t.arabic})
                          </FormLabel>
                          <Input
                            {...form.register(`attributes.${index}.title.ar`)}
                            placeholder={`${t.title} (${t.arabic})`}
                          />
                        </div>

                        {/* Color and Image - English only */}
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <FormLabel className="mb-2 block text-sm font-medium">
                              {t.color}
                            </FormLabel>
                            <FormField
                              control={form.control}
                              name={`attributes.${index}.color`}
                              render={({ field }) => (
                                <ColorPicker
                                  value={field.value || ""}
                                  onChange={(color) => field.onChange(color)}
                                />
                              )}
                            />
                          </div>
                          <div>
                            <FormLabel className="mb-3 block text-sm font-medium">
                              {t.image}
                            </FormLabel>
                            <AttributeImageUpload
                              value={field.image}
                              onChange={(file) =>
                                form.setValue(`attributes.${index}.image`, file)
                              }
                              attributeId={field.id}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-6 lg:col-span-2">
              {/* Save Buttons */}
              <Card className="p-4">
                <CardHeader className="pl-2 font-semibold">
                  {t.status}
                </CardHeader>
                <CardContent className="flex gap-2 p-0">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex flex-1 items-center gap-2"
                    onClick={() =>
                      form.setValue("status", { en: "draft", ar: "موثق" })
                    }
                  >
                    <Save className="h-4 w-4" />
                    {t.updateExit}
                  </Button>
                  <Button type="submit" className="flex-1">
                    {t.update}
                  </Button>
                </CardContent>
              </Card>

              {/* Display Layout - English only */}
              <Card className="p-4">
                <FormField
                  name="display_layout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.display_layout} *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.display_layout} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dropdown">{t.dropdown}</SelectItem>
                          <SelectItem value="visual_swatch">
                            {t.visual_swatch}
                          </SelectItem>
                          <SelectItem value="text_swatch">
                            {t.text_swatch}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Additional Options - English only */}
              <div className="space-y-4">
                <Card className="p-3">
                  <CardHeader className="pl-2 font-semibold">
                    {t.searchable}
                  </CardHeader>
                  <FormField
                    name="searchable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </Card>
                <Card className="p-3">
                  <CardHeader className="pl-2 font-semibold">
                    {t.comparable}
                  </CardHeader>
                  <FormField
                    name="comparable"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </Card>
                <Card className="p-3">
                  <CardHeader className="pl-2 font-semibold">
                    {t.use_in_product_listing}
                  </CardHeader>
                  <FormField
                    name="use_in_product_listing"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </Card>
                <Card className="p-3">
                  <CardHeader className="pl-2 font-semibold">
                    {t.sort_order}
                  </CardHeader>
                  <FormField
                    name="sort_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </Card>
              </div>

              {/* Categories - English only */}
              <Card className="p-4">
                <FormField
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.categories}</FormLabel>
                      <FormControl>
                        <CategoriesSelector
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Status - English only */}
              <Card className="p-4">
                <FormField
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.status}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value.en}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.status} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">{t.draft}</SelectItem>
                          <SelectItem value="published">
                            {t.published}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
