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
import { Textarea } from "@/components/UI/textarea";

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
  display_name_en_required: {
    en: "Display name in English is required",
    ar: "اسم العرض بالإنجليزية مطلوب",
  },
  display_name_ar_required: {
    en: "Display name in Arabic is required",
    ar: "اسم العرض بالعربية مطلوب",
  },
};

const specificationGroupSchema = z.object({
  name: z.object({
    en: z.string().min(1, messages.name_en_required.en),
    ar: z.string().min(1, messages.name_ar_required.ar),
  }),
  description: z.object({
    en: z.string().optional(),
    ar: z.string().optional(),
  }),
});

type SpecificationGroupFormData = z.infer<typeof specificationGroupSchema>;

// ---------------- Component ----------------
export default function CreateSpecificationGroupPage() {
  const { language } = useLanguage();

  const form = useForm<SpecificationGroupFormData>({
    resolver: zodResolver(specificationGroupSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      description: { en: "", ar: "" },
    },
  });

  const onSubmit = async (data: SpecificationGroupFormData) => {
    try {
      console.log("Specification Group Data:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Handle successful submission
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  const t = {
    en: {
      title: "New Specification Group",
      language_version: "You are editing 'English' version",
      name: "Name",
      display_name: "Display Name",
      description: "Description",
      short_description: "Short Description",
      status: "Status",
      published: "Published",
      draft: "Draft",
      is_featured: "Featured",
      order: "Order",
      required: "Required",
      save: "Save",
      saveExit: "Save and Exit",
      new_specification_group: "New Specification Group",
      english: "English",
      arabic: "Arabic",
      name_placeholder: "Enter group name",
      display_name_placeholder: "Enter display name",
      description_placeholder: "Enter description",
      short_description_placeholder: "Enter short description",
    },
    ar: {
      title: "مجموعة مواصفات جديدة",
      language_version: "أنت تقوم بتحرير النسخة 'العربية'",
      name: "الاسم",
      display_name: "اسم العرض",
      description: "الوصف",
      short_description: "وصف مختصر",
      status: "الحالة",
      published: "منشور",
      draft: "مسودة",
      is_featured: "مميز",
      order: "الترتيب",
      required: "مطلوب",
      save: "حفظ",
      saveExit: "حفظ وخروج",
      new_specification_group: "مجموعة مواصفات جديدة",
      english: "الإنجليزية",
      arabic: "العربية",
      name_placeholder: "أدخل اسم المجموعة",
      display_name_placeholder: "أدخل اسم العرض",
      description_placeholder: "أدخل الوصف",
      short_description_placeholder: "أدخل الوصف المختصر",
    },
  }[language];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.new_specification_group}</h1>
        <p className="text-sm text-gray-600">{t.language_version}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
            {/* Left Column - Main Content */}
            <div className="space-y-6 lg:col-span-4">
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

              {/* Description Section - Bilingual */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.description}</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    name="description.en"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.description} ({t.english})
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.description_placeholder}
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="description.ar"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t.description} ({t.arabic})
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t.description_placeholder}
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                    {t.saveExit}
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
