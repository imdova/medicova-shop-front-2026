"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Plus, Trash2, LogOutIcon } from "lucide-react";
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
import { Switch } from "@/components/UI/switch";

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
  option_value_required: {
    en: "At least one option value is required",
    ar: "يجب إضافة قيمة خيار واحدة على الأقل",
  },
};

const optionSchema = z.object({
  name: z.object({
    en: z.string().min(1, messages.name_en_required.en),
    ar: z.string().min(1, messages.name_ar_required.ar),
  }),
  option_type: z.enum(["dropdown", "checkbox", "radio"]),
  option_values: z
    .array(
      z.object({
        id: z.string(),
        label: z.object({
          en: z.string().min(1, "English label is required"),
          ar: z.string().min(1, "التسمية بالعربية مطلوبة"),
        }),
        price: z.string().optional(),
        price_type: z.enum(["fixed", "percent"]),
      }),
    )
    .min(1, messages.option_value_required.en),
  required: z.boolean(),
});

type OptionFormData = z.infer<typeof optionSchema>;
type OptionValue = OptionFormData["option_values"][number];

// ---------------- Component ----------------
export default function CreateOptionPage() {
  const { language } = useLanguage();
  const [optionValues, setOptionValues] = useState<OptionValue[]>([
    {
      id: "1",
      label: { en: "", ar: "" },
      price: "",
      price_type: "fixed",
    },
  ]);

  const form = useForm<OptionFormData>({
    resolver: zodResolver(optionSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      option_type: "dropdown",
      option_values: [
        {
          id: "1",
          label: { en: "", ar: "" },
          price: "",
          price_type: "fixed",
        },
      ],
      required: false,
    },
  });

  const addOptionValue = () => {
    const newId = (optionValues.length + 1).toString();
    const newOptionValue: OptionValue = {
      id: newId,
      label: { en: "", ar: "" },
      price: "",
      price_type: "fixed",
    };
    setOptionValues([...optionValues, newOptionValue]);
  };

  const removeOptionValue = (id: string) => {
    if (optionValues.length > 1) {
      setOptionValues(optionValues.filter((value) => value.id !== id));
    }
  };

  const updateOptionValue = <K extends keyof OptionValue>(
    id: string,
    field: K,
    value: OptionValue[K],
  ) => {
    setOptionValues(
      optionValues.map((val) =>
        val.id === id ? { ...val, [field]: value } : val,
      ),
    );
  };

  const updateOptionValueLabel = (
    id: string,
    lang: "en" | "ar",
    value: string,
  ) => {
    setOptionValues(
      optionValues.map((val) =>
        val.id === id
          ? {
              ...val,
              label: { ...val.label, [lang]: value },
            }
          : val,
      ),
    );
  };

  const onSubmit = async (data: OptionFormData) => {
    try {
      console.log({ ...data, option_values: optionValues });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  const t = {
    en: {
      title: "Edit Option",
      language_version: "You are editing 'English' version",
      name: "Name",
      option_value: "Option value",
      label: "Label",
      price: "Price",
      price_type: "Price Type",
      option_type: "Option Type",
      dropdown: "Dropdown",
      checkbox: "Checkbox",
      radio: "Radio Button",
      fixed: "Fixed",
      percent: "Percent",
      required: "Required",
      save: "Save",
      saveExit: "Save and Exit",
      published: "Published",
      add_option_value: "Add Option Value",
      remove: "Remove",
      new_option: "New Product Option",
      english: "English",
      arabic: "Arabic",
    },
    ar: {
      title: "تحرير الخيار",
      language_version: "أنت تقوم بتحرير النسخة 'العربية'",
      name: "الاسم",
      option_value: "قيمة الخيار",
      label: "التسمية",
      price: "السعر",
      price_type: "نوع السعر",
      option_type: "نوع الخيار",
      dropdown: "قائمة منسدلة",
      checkbox: "مربع اختيار",
      radio: "زر اختيار",
      fixed: "ثابت",
      percent: "نسبة مئوية",
      required: "مطلوب",
      save: "حفظ",
      saveExit: "حفظ وخروج",
      published: "منشور",
      add_option_value: "إضافة قيمة خيار",
      remove: "إزالة",
      new_option: "خيار منتج جديد",
      english: "الإنجليزية",
      arabic: "العربية",
    },
  }[language];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.new_option}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
            {/* Left Column - Main Content */}
            <div className="space-y-6 lg:col-span-4">
              {/* Name Section - Bilingual */}
              <Card className="p-4">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
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
                          <Input
                            placeholder={`${t.name} (${t.english})`}
                            {...field}
                          />
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
                          <Input
                            placeholder={`${t.name} (${t.arabic})`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Option Values Section - Bilingual */}
              <Card className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{t.option_value}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOptionValue}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {t.add_option_value}
                  </Button>
                </div>

                <div className="space-y-4">
                  {optionValues.map((optionValue) => (
                    <div key={optionValue.id} className="rounded-lg border p-4">
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                        {/* Label - Bilingual */}
                        <div className="md:col-span-2">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                              <label className="mb-2 block text-sm font-medium">
                                {t.label} ({t.english})
                              </label>
                              <Input
                                value={optionValue.label.en}
                                onChange={(e) =>
                                  updateOptionValueLabel(
                                    optionValue.id,
                                    "en",
                                    e.target.value,
                                  )
                                }
                                placeholder={`${t.label} (${t.english})`}
                              />
                            </div>
                            <div>
                              <label className="mb-2 block text-sm font-medium">
                                {t.label} ({t.arabic})
                              </label>
                              <Input
                                value={optionValue.label.ar}
                                onChange={(e) =>
                                  updateOptionValueLabel(
                                    optionValue.id,
                                    "ar",
                                    e.target.value,
                                  )
                                }
                                placeholder={`${t.label} (${t.arabic})`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Price and Price Type */}
                        <div className="flex gap-2 md:col-span-2">
                          <div className="flex-1">
                            <label className="mb-2 block text-sm font-medium">
                              {t.price}
                            </label>
                            <Input
                              type="number"
                              value={optionValue.price}
                              onChange={(e) =>
                                updateOptionValue(
                                  optionValue.id,
                                  "price",
                                  e.target.value,
                                )
                              }
                              placeholder="0.00"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="mb-2 block text-sm font-medium">
                              {t.price_type}
                            </label>
                            <Select
                              value={optionValue.price_type}
                              onValueChange={(value: "fixed" | "percent") =>
                                updateOptionValue(
                                  optionValue.id,
                                  "price_type",
                                  value,
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="fixed">{t.fixed}</SelectItem>
                                <SelectItem value="percent">
                                  {t.percent}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOptionValue(optionValue.id)}
                              disabled={optionValues.length <= 1}
                              className="flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              {t.remove}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6 lg:col-span-2">
              {/* Save Buttons */}
              <Card className="p-4">
                <CardContent className="flex gap-2 p-0">
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

              {/* Required Switch */}
              <Card className="p-4">
                <CardHeader className="pl-2 font-semibold">
                  {t.required}
                </CardHeader>
                <div className="flex items-center justify-between">
                  <FormField
                    name="required"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </Card>

              {/* Option Type */}
              <Card className="p-4">
                <FormField
                  name="option_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">
                        {t.option_type}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t.option_type} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dropdown">{t.dropdown}</SelectItem>
                          <SelectItem value="checkbox">{t.checkbox}</SelectItem>
                          <SelectItem value="radio">{t.radio}</SelectItem>
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
