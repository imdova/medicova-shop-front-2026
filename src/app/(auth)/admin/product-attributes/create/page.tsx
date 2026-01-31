"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Save, Languages, Plus, Trash2, X, ImageIcon } from "lucide-react";
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
import Image from "next/image";
import { Checkbox } from "@/components/UI/Check-Box";
import { Switch } from "@/components/UI/switch";
import { CategoriesSelector } from "@/components/page/products-attribute/CategoriesSelector";
import { ColorPicker } from "@/components/UI/ColorPicke";

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
  display_layout: z.string().min(1, "Display layout is required"), // English only
  searchable: z.boolean(),
  comparable: z.boolean(),
  use_in_product_listing: z.boolean(),
  sort_order: z.number().min(0), // English only
  categories: z.array(z.string()), // English only
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
  status: z.enum(["published", "draft"]), // English only
});

type AttributeFormData = z.infer<typeof attributeSchema>;
type Attribute = AttributeFormData["attributes"][number];

// Image Upload Component for Attributes
const AttributeImageUpload = ({
  onChange,
  attributeId,
}: {
  value: File | null;
  onChange: (file: File | null) => void;
  attributeId: string;
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const handleFileChange = (file: File | null) => {
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onChange(file);
    } else {
      setPreview(null);
      onChange(null);
    }
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          <Image
            width={80}
            height={80}
            src={preview}
            alt="Attribute preview"
            className="h-8 w-8 rounded-md border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-2 w-2 rounded-full p-2"
            onClick={() => handleFileChange(null)}
          >
            <X size={12} />
          </Button>
        </div>
      ) : (
        <label
          htmlFor={`attribute-image-${attributeId}`}
          className="cursor-pointer"
        >
          <div className="flex w-8 flex-col items-center justify-center rounded-md transition-colors">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
          <Input
            id={`attribute-image-${attributeId}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              handleFileChange(file);
            }}
          />
        </label>
      )}
    </div>
  );
};

// ---------------- Component ----------------
export default function CreateAttributePage() {
  const { language } = useLanguage();
  const [attributes, setAttributes] = useState([
    {
      id: "1",
      title: { en: "box-1", ar: "صندوق-1" },
      color: "#000000",
      image: null,
      is_default: true,
    },
    {
      id: "2",
      title: { en: "box-2", ar: "صندوق-2" },
      color: "#ffffff",
      image: null,
      is_default: false,
    },
  ]);

  const form = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      title: { en: "", ar: "" },
      use_image_from_variation: false,
      display_layout: "dropdown",
      searchable: false,
      comparable: false,
      use_in_product_listing: false,
      sort_order: 0,
      categories: [],
      attributes: [
        {
          id: "1",
          title: { en: "box-1", ar: "صندوق-1" },
          color: "#000000",
          image: null,
          is_default: true,
        },
        {
          id: "2",
          title: { en: "box-2", ar: "صندوق-2" },
          color: "#ffffff",
          image: null,
          is_default: false,
        },
      ],
      status: "draft",
    },
  });

  const addAttribute = () => {
    const newId = (attributes.length + 1).toString();
    const newAttribute = {
      id: newId,
      title: { en: `box-${newId}`, ar: `صندوق-${newId}` },
      color: "#cccccc",
      image: null,
      is_default: false,
    };
    setAttributes([...attributes, newAttribute]);
  };

  const removeAttribute = (id: string) => {
    if (attributes.length > 1) {
      setAttributes(attributes.filter((attr) => attr.id !== id));
    }
  };

  const updateAttribute = <K extends keyof Attribute>(
    id: string,
    field: K,
    value: Attribute[K],
  ) => {
    setAttributes(
      attributes.map((attr) =>
        attr.id === id ? { ...attr, [field]: value } : attr,
      ),
    );
  };

  const updateAttributeTitle = (
    id: string,
    lang: "en" | "ar",
    value: string,
  ) => {
    setAttributes(
      attributes.map((attr) =>
        attr.id === id
          ? {
              ...attr,
              title: { ...attr.title, [lang]: value },
            }
          : attr,
      ),
    );
  };

  const setDefaultAttribute = (id: string) => {
    setAttributes(
      attributes.map((attr) => ({
        ...attr,
        is_default: attr.id === id,
      })),
    );
  };

  const onSubmit = async (data: AttributeFormData) => {
    try {
      console.log({ ...data, attributes });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  const t = {
    en: {
      title: "Title",
      use_image: "Use image from product variation (for Visual Swatch only)",
      attributes_list: "Attributes list",
      display_layout: "Display Layout",
      status: "Status",
      save: "Save & Exit",
      published: "Published",
      draft: "Draft",
      add_attribute: "Add Attribute",
      default: "Default",
      color: "Color",
      image: "Image",
      remove: "Remove",
      language_version: "You are editing 'English' version",
      new_attribute: "New Product Attribute",
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
      new_attribute: "خاصية منتج جديدة",
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
    },
  }[language];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Languages className="h-6 w-6" />
          {t.new_attribute}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    onClick={addAttribute}
                    className="flex items-center gap-2 text-xs sm:text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    {t.add_attribute}
                  </Button>
                </div>

                <div className="space-y-4">
                  {attributes.map((attribute) => (
                    <div
                      key={attribute.id}
                      className="space-y-3 rounded-lg border p-4"
                    >
                      {/* Attribute Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={attribute.is_default}
                            onCheckedChange={() =>
                              setDefaultAttribute(attribute.id)
                            }
                          />
                          <span className="text-sm font-medium">
                            {t.default}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAttribute(attribute.id)}
                          disabled={attributes.length <= 1}
                          className="flex items-center gap-2 text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t.remove}
                        </Button>
                      </div>

                      {/* Title Fields - Bilingual */}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            {t.title} ({t.english})
                          </label>
                          <Input
                            value={attribute.title.en}
                            onChange={(e) =>
                              updateAttributeTitle(
                                attribute.id,
                                "en",
                                e.target.value,
                              )
                            }
                            placeholder={`${t.title} (${t.english})`}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            {t.title} ({t.arabic})
                          </label>
                          <Input
                            value={attribute.title.ar}
                            onChange={(e) =>
                              updateAttributeTitle(
                                attribute.id,
                                "ar",
                                e.target.value,
                              )
                            }
                            placeholder={`${t.title} (${t.arabic})`}
                          />
                        </div>
                        {/* Color and Image - English only */}
                        <div className="flex gap-3 sm:col-span-2">
                          <div className="flex-1">
                            <label className="mb-2 block text-sm font-medium">
                              {t.color}
                            </label>
                            <ColorPicker
                              value={attribute.color || "#000000"}
                              onChange={(color) =>
                                updateAttribute(attribute.id, "color", color)
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-3 block text-sm font-medium">
                              {t.image}
                            </label>
                            <AttributeImageUpload
                              value={attribute.image}
                              onChange={(file) =>
                                updateAttribute(attribute.id, "image", file)
                              }
                              attributeId={attribute.id}
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
                  {t.published}
                </CardHeader>
                <CardContent className="flex gap-2 p-0">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex flex-1 items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {t.save}
                  </Button>
                  <Button type="submit" className="flex-1">
                    {t.published}
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
                  {/* Searchable */}
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
                  {/* Comparable */}
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
                  {/* Used in product listing */}
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
                  {/* Used in product listing */}
                  <FormField
                    name="sort_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            value={field.value ?? ""} // 👈 ensures no NaN
                            onChange={(e) => {
                              const val = e.target.value;
                              field.onChange(
                                val === "" ? undefined : parseInt(val, 10),
                              );
                            }}
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
                        defaultValue={field.value}
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
