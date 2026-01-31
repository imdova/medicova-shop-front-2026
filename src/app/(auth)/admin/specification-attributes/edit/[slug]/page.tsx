"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogOutIcon } from "lucide-react";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/UI/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/UI/select";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { dummySpecificationAttributes } from "@/constants/specificationAttributes";
import { SpecificationAttribute } from "@/types/product";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";

// ---------------- Schema & Types ----------------
const messages = {
  name_en_required: {
    en: "Name in English is required",
    ar: "الاسم بالإنجليزية مطلوب",
  },
  name_ar_required: {
    en: "Name in Arabic is required",
    ar: "الاسم بالعربية مطلوب",
  },
  group_required: {
    en: "Associated Group is required",
    ar: "المجموعة المرتبطة مطلوبة",
  },
  field_type_required: {
    en: "Field Type is required",
    ar: "نوع الحقل مطلوب",
  },
};

// Assuming you already have enums/unions:
const fieldTypeEnum = z.enum([
  "text",
  "number",
  "boolean",
  "select",
  "textarea",
]);
const statusEnum = z.enum(["published", "draft"]); // adjust if needed
const specificationAttributeSchema = z.object({
  name: z.object({
    en: z.string().min(1, messages.name_en_required.en),
    ar: z.string().min(1, messages.name_ar_required.ar),
  }),
  associatedGroup: z.object({
    id: z.string().min(1, messages.group_required.en),
    name: z.object({
      en: z.string(),
      ar: z.string(),
    }),
  }),
  fieldType: fieldTypeEnum, // ✅ stricter than string
  defaultValue: z.string().optional(),
  status: z.object({
    en: statusEnum,
    ar: z.string(),
  }),
  createdAt: z.string().optional(), // if generated on backend
});

type SpecificationAttributeFormData = z.infer<
  typeof specificationAttributeSchema
>;

// Dummy data for associated groups
const dummySpecificationGroups = [
  { id: "1", name: { en: "Battery", ar: "البطارية" } },
  { id: "2", name: { en: "Display", ar: "الشاشة" } },
  { id: "3", name: { en: "Performance", ar: "الأداء" } },
  { id: "4", name: { en: "Camera", ar: "الكاميرا" } },
  { id: "5", name: { en: "Storage", ar: "التخزين" } },
  { id: "6", name: { en: "Connectivity", ar: "الاتصال" } },
];

const fieldTypes = [
  { id: "text", name: { en: "Text", ar: "نص" } },
  { id: "number", name: { en: "Number", ar: "رقم" } },
  { id: "boolean", name: { en: "Boolean", ar: "منطقي" } },
  { id: "select", name: { en: "Select", ar: "قائمة" } },
  { id: "textarea", name: { en: "Text Area", ar: "منطقة نص" } },
];

// ---------------- Component ----------------
export default function EditSpecificationAttributePage() {
  const { language } = useLanguage();
  const params = useParams();
  const attributeId = params.slug as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentAttribute, setCurrentAttribute] =
    useState<SpecificationAttribute>();

  // Find the attribute by ID
  useEffect(() => {
    const fetchAttribute = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const attribute = dummySpecificationAttributes.find(
          (attr) => attr.id === attributeId,
        );

        if (attribute) {
          setCurrentAttribute(attribute);
          form.reset({
            name: attribute.name,
            associatedGroup: attribute.associatedGroup,
            fieldType: attribute.fieldType,
            defaultValue: attribute.defaultValue || "",
          });
        }
      } catch (error) {
        console.error("Error fetching attribute:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (attributeId) {
      fetchAttribute();
    }
  }, [attributeId]);

  const form = useForm<SpecificationAttributeFormData>({
    resolver: zodResolver(specificationAttributeSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      associatedGroup: {
        id: "",
        name: { en: "", ar: "" },
      },
      fieldType: "text",
      defaultValue: "",
      status: { en: "draft", ar: "مسودة" },
    },
  });

  const onSubmit = async (data: SpecificationAttributeFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Updating Specification Attribute:", data);
      console.log("Attribute ID:", attributeId);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Handle successful update
      console.log("Attribute updated successfully");
      setIsSubmitting(false);
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const t = {
    en: {
      title: "Edit Specification Attribute",
      language_version: "You are editing 'English' version",
      associated_group: "Associated Group",
      name: "Name",
      field_type: "Field Type",
      default_value: "Default Value",
      default_value_placeholder: "Enter default value (optional)",
      publisher: "Publisher",
      published: "published",
      save_exit: "Save & Exit",
      required_field: "Required field",
      english: "English",
      arabic: "Arabic",
      name_placeholder: "Enter attribute name",
      select_group: "Select group",
      select_field_type: "Select field type",
      languages: "Languages",
      loading: "Loading...",
      not_found: "Attribute not found",
      update: "Update",
    },
    ar: {
      title: "تحرير سمة المواصفات",
      language_version: "أنت تقوم بتحرير النسخة 'الإنجليزية'",
      associated_group: "المجموعة المرتبطة",
      name: "الاسم",
      field_type: "نوع الحقل",
      default_value: "القيمة الافتراضية",
      default_value_placeholder: "أدخل القيمة الافتراضية (اختياري)",
      publisher: "الناشر",
      published: "نشر",
      save_exit: "حفظ وخروج",
      required_field: "حقل مطلوب",
      english: "الإنجليزية",
      arabic: "العربية",
      name_placeholder: "أدخل اسم السمة",
      select_group: "اختر مجموعة",
      select_field_type: "اختر نوع الحقل",
      languages: "اللغات",
      loading: "جاري التحميل...",
      not_found: "السمة غير موجودة",
      update: "تحديث",
    },
  }[language];

  if (isLoading) {
    return <Loading />;
  }

  if (!currentAttribute) {
    return <NotFound />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.title}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
            {/* Left Column - Main Content */}
            <div className="space-y-6 lg:col-span-4">
              {/* Associated Group Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">
                    {t.associated_group} *
                  </h3>
                </div>
                <FormField
                  control={form.control}
                  name="associatedGroup"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">
                        {t.associated_group}
                      </FormLabel>
                      <Select
                        onValueChange={(id) => {
                          const group = dummySpecificationGroups.find(
                            (g) => g.id === id,
                          );
                          if (group) field.onChange(group);
                        }}
                        value={field.value?.id || ""}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.select_group} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dummySpecificationGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name[language]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Name Section - Bilingual */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.name} *</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.name} ({t.english}) *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t.name_placeholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="name.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.name} ({t.arabic}) *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder={t.name_placeholder} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Field Type Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.field_type} *</h3>
                </div>
                <FormField
                  control={form.control}
                  name="fieldType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">{t.field_type}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.select_field_type} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fieldTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name[language]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Default Value Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.default_value}</h3>
                </div>
                <FormField
                  control={form.control}
                  name="defaultValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">
                        {t.default_value}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t.default_value_placeholder}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              {/* Save Buttons */}
              <Card className="p-4">
                <CardHeader className="text-xl font-semibold">
                  {t.published}
                </CardHeader>
                <CardContent className="flex flex-col gap-2 p-0 md:flex-row">
                  <Button
                    type="submit"
                    variant="outline"
                    className="flex flex-1 items-center gap-2 truncate"
                    disabled={isSubmitting}
                  >
                    <LogOutIcon className="h-4 w-4" />
                    {t.save_exit}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 truncate"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? `${t.update}...` : t.update}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
