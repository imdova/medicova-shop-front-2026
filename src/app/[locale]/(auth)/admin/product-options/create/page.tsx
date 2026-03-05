"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Save, X, Box, Loader2 } from "lucide-react";
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
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  VariantTypeSelector,
  VariantValues,
} from "../components/VariantFormElements";
import { createVariant, VariantData } from "@/services/variantService";
import { useSession } from "next-auth/react";
import { useState } from "react";

const variantSchema = z
  .object({
    type: z.enum(["dropdown", "color", "options"]).optional(),
    name: z.object({
      en: z.string().min(1, "English name is required"),
      ar: z.string().min(1, "Arabic name is required"),
    }),
    values: z
      .array(
        z.object({
          label: z.object({
            en: z.string().optional(),
            ar: z.string().optional(),
          }),
          color: z.string().optional(),
          price: z.string().optional(),
          stock: z.string().optional(),
        }),
      )
      .min(1, "At least one option is required"),
  })
  .refine((data) => !!data.type, {
    message: "Variant type is required",
    path: ["type"],
  })
  .refine(
    (data) => {
      if (data.type !== "color") {
        return data.values.every((v) => !!v.label?.en && !!v.label?.ar);
      }
      return true;
    },
    {
      message: "Labels are required for this type",
      path: ["values"],
    },
  );

type VariantFormData = z.infer<typeof variantSchema>;

export default function CreateVariantPage() {
  const t = useTranslations("admin.productVariantsPage");
  const locale = useAppLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      type: undefined,
      name: { en: "", ar: "" },
      values: [
        { label: { en: "", ar: "" }, color: "#000000", price: "", stock: "0" },
      ],
    },
  });

  const { watch, setValue, handleSubmit, control } = methods;
  const currentType = watch("type");

  const onSubmit = async (data: VariantFormData) => {
    setIsSubmitting(true);
    try {
      const apiData: VariantData = {
        nameEn: data.name.en,
        nameAr: data.name.ar,
        type: data.type as string,
        createdBy: "admin",
        optionsEn: data.values.map((v) => ({
          optionName: v.label?.en || "",
          price: parseFloat(v.price || "0"),
          stock: parseInt(v.stock || "0"),
          ...(data.type === "color" ? { color: v.color } : {}),
        })),
        optionsAr: data.values.map((v) => ({
          optionName: v.label?.ar || "",
          price: parseFloat(v.price || "0"),
          stock: parseInt(v.stock || "0"),
          ...(data.type === "color" ? { color: v.color } : {}),
        })),
      };

      const token = (session as any)?.accessToken;
      await createVariant(apiData, token);
      router.push("/admin/product-settings");
    } catch (error) {
      console.error("Submission failed", error);
      alert("Failed to create variant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-xl shadow-gray-200/50">
            <Box className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">
              {t("createVariant")}
            </h1>
            <p className="text-xs font-medium text-gray-400">{t("subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="h-9 rounded-lg border-gray-100 px-4 text-xs font-black hover:bg-gray-50"
          >
            <X size={14} className="mr-1.5" /> {t("cancel")}
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit(onSubmit)}
            disabled={!currentType || isSubmitting}
            className="shadow-primary/20 h-9 rounded-lg bg-primary px-6 text-xs font-black shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:grayscale"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="mr-1.5 animate-spin" />
            ) : (
              <Save size={14} className="mr-1.5" />
            )}
            {t("save")}
          </Button>
        </div>
      </div>

      <FormProvider {...methods}>
        <Form {...methods}>
          <form className="space-y-6">
            {/* Step 1: Type Selection */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-primary">
                  1
                </span>
                <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                  {t("variantType")}
                </h2>
              </div>
              <VariantTypeSelector
                value={currentType}
                onChange={(v) => setValue("type", v as any)}
              />
            </div>

            {currentType && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-500">
                {/* Step 2: Basic Info (Bilingual) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-primary">
                      2
                    </span>
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                      {t("variantName")}
                    </h2>
                  </div>
                  <Card className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
                    <FormField
                      control={control}
                      name="name.en"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                            {t("nameEn")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Size / Color / Material"
                              className="h-9 rounded-lg text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={control}
                      name="name.ar"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[9px] font-black uppercase tracking-wider text-gray-400">
                            {t("nameAr")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="المقاس / اللون / الخامة"
                              className="h-9 rounded-lg text-right text-sm"
                              dir="rtl"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </Card>
                </div>

                {/* Step 3: Values */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-black text-primary">
                      3
                    </span>
                    <h2 className="text-[11px] font-black uppercase tracking-widest text-gray-400">
                      {t("options")}
                    </h2>
                  </div>
                  <VariantValues
                    type={currentType as "dropdown" | "color" | "options"}
                  />
                </div>
              </div>
            )}
          </form>
        </Form>
      </FormProvider>
    </div>
  );
}
