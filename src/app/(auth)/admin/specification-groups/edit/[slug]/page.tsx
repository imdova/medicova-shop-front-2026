"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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
import { dummySpecificationGroups } from "@/constants/specificationGroups";
import NotFound from "@/app/not-found";
import Loading from "@/app/loading";

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
export default function EditSpecificationGroupPage() {
  const { language } = useLanguage();
  const params = useParams();
  const slug = params.slug as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SpecificationGroupFormData>({
    resolver: zodResolver(specificationGroupSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      description: { en: "", ar: "" },
    },
  });

  // Fetch data based on slug
  useEffect(() => {
    const fetchSpecificationGroup = async () => {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const group = dummySpecificationGroups.find((item) => item.id === slug);

      if (group) {
        form.reset({
          name: group.name,
          description: group.description,
        });
      }

      setIsLoading(false);
    };

    if (slug) {
      fetchSpecificationGroup();
    }
  }, [slug, form]);

  const onSubmit = async (data: SpecificationGroupFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Updated Specification Group Data:", data);
      console.log("Updating group with slug:", slug);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Handle successful update
      console.log("Specification group updated successfully");
    } catch (error) {
      console.error("Update failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const t = {
    en: {
      title: "Edit Specification Group",
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
      update: "Update",
      updateExit: "Update and Exit",
      edit_specification_group: "Edit Specification Group",
      english: "English",
      arabic: "Arabic",
      name_placeholder: "Enter group name",
      display_name_placeholder: "Enter display name",
      description_placeholder: "Enter description",
      short_description_placeholder: "Enter short description",
      loading: "Loading specification group...",
      not_found: "Specification group not found",
    },
    ar: {
      title: "تعديل مجموعة المواصفات",
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
      update: "حفظ التغييرات",
      updateExit: "حفظ وخروج",
      edit_specification_group: "تعديل مجموعة المواصفات",
      english: "الإنجليزية",
      arabic: "العربية",
      name_placeholder: "أدخل اسم المجموعة",
      display_name_placeholder: "أدخل اسم العرض",
      description_placeholder: "أدخل الوصف",
      short_description_placeholder: "أدخل الوصف المختصر",
      loading: "جاري تحميل مجموعة المواصفات...",
      not_found: "مجموعة المواصفات غير موجودة",
    },
  }[language];

  if (isLoading) {
    return <Loading />;
  }

  const currentGroup = dummySpecificationGroups.find(
    (item) => item.id === slug,
  );
  if (!currentGroup) {
    return <NotFound />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.edit_specification_group}</h1>
        <p className="mt-1 text-sm text-primary">
          Editing:{" "}
          <span className="text-sm">{currentGroup.name[language]}</span>
        </p>
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
                    disabled={isSubmitting}
                  >
                    <LogOutIcon className="h-4 w-4" />
                    {t.updateExit}
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
