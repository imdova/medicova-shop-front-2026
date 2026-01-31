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
import { dummySpecificationGroups } from "@/constants/specificationGroups";

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

const specificationAttributeSchema = z.object({
  name: z.object({
    en: z.string().min(1, messages.name_en_required.en),
    ar: z.string().min(1, messages.name_ar_required.ar),
  }),
  associatedGroup: z.string().min(1, messages.group_required.en),
  fieldType: z.string().min(1, messages.field_type_required.en),
  defaultValue: z.string().optional(),
});

type SpecificationAttributeFormData = z.infer<
  typeof specificationAttributeSchema
>;

const fieldTypes = [
  { id: "text", name: { en: "Text", ar: "نص" } },
  { id: "number", name: { en: "Number", ar: "رقم" } },
  { id: "boolean", name: { en: "Boolean", ar: "منطقي" } },
  { id: "select", name: { en: "Select", ar: "قائمة" } },
  { id: "textarea", name: { en: "Text Area", ar: "منطقة نص" } },
];

// ---------------- Component ----------------
export default function CreateSpecificationAttributePage() {
  const { language } = useLanguage();

  const form = useForm<SpecificationAttributeFormData>({
    resolver: zodResolver(specificationAttributeSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      associatedGroup: "",
      fieldType: "",
      defaultValue: "",
    },
  });

  const onSubmit = async (data: SpecificationAttributeFormData) => {
    try {
      console.log("Specification Attribute Data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Handle successful submission
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  const t = {
    en: {
      title: "Create Specification Attribute",
      subtitle: "Battery Life",
      language_version: "You are editing 'English' version",
      associated_group: "Associated Group",
      name: "Name",
      field_type: "Field Type",
      default_value: "Default Value",
      default_value_placeholder: "Enter default value (optional)",
      published: "published",
      save: "Save",
      save_exit: "Save & Exit",
      required_field: "Required field",
      english: "English",
      arabic: "Arabic",
      name_placeholder: "Enter attribute name",
      select_group: "Select group",
      select_field_type: "Select field type",
      languages: "Languages",
    },
    ar: {
      title: "سمة المواصفات جديد",
      subtitle: "مدة البطارية",
      language_version: "أنت تقوم بتحرير النسخة 'الإنجليزية'",
      associated_group: "المجموعة المرتبطة",
      name: "الاسم",
      field_type: "نوع الحقل",
      default_value: "القيمة الافتراضية",
      default_value_placeholder: "أدخل القيمة الافتراضية (اختياري)",
      published: "نشر",
      save: "حفظ",
      save_exit: "حفظ وخروج",
      required_field: "حقل مطلوب",
      english: "الإنجليزية",
      arabic: "العربية",
      name_placeholder: "أدخل اسم السمة",
      select_group: "اختر مجموعة",
      select_field_type: "اختر نوع الحقل",
      languages: "اللغات",
    },
  }[language];

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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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
                        defaultValue={field.value}
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
                  >
                    <LogOutIcon className="h-4 w-4" />
                    {t.save_exit}
                  </Button>
                  <Button type="submit" className="flex-1 truncate">
                    {t.published}
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
