"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { Trash2, LogOutIcon, Search } from "lucide-react";
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
import { Card, CardContent } from "@/components/UI/card";
import { Badge } from "@/components/Badge";
import { products } from "@/constants/products";
import Image from "next/image";

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
  products_required: {
    en: "At least one product is required",
    ar: "يجب إضافة منتج واحد على الأقل",
  },
};

export interface FlashSaleProduct {
  id: string;
  name: string; // simplified, instead of LocalizedTitle
  price: number; // original price
  discount_price?: number; // discounted price
  quantity: number; // how many available in flash sale
}

const flashSaleSchema = z.object({
  name: z.object({
    en: z.string().min(1, messages.name_en_required.en),
    ar: z.string().min(1, messages.name_ar_required.ar),
  }),
  status: z.enum(["published", "draft"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  products: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        discount_price: z.number().optional(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
      }),
    )
    .min(1, messages.products_required.en),
});

type FlashSaleFormData = z.infer<typeof flashSaleSchema>;

// ---------------- Component ----------------
export default function CreateFlashSalePage() {
  const { language } = useLanguage();
  const [selectedProducts, setSelectedProducts] = useState<FlashSaleProduct[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const form = useForm<FlashSaleFormData>({
    resolver: zodResolver(flashSaleSchema),
    defaultValues: {
      name: { en: "", ar: "" },
      status: "published",
      start_date: "",
      end_date: "",
      products: [],
    },
  });

  const filteredProducts = products.filter((product) =>
    product.title[language].toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addProduct = (product: (typeof products)[0]) => {
    if (!selectedProducts.find((p) => p.id === product.id)) {
      const newProduct: FlashSaleProduct = {
        id: product.id,
        name: product.title[language], // simplified name in current lang
        price: product.price,
        discount_price: product.price * 0.9, // default 10% discount
        quantity: 1,
      };
      setSelectedProducts([...selectedProducts, newProduct]);
    }
    setSearchTerm("");
    setIsSearchOpen(false);
  };

  const removeProduct = (id: string) => {
    setSelectedProducts(
      selectedProducts.filter((product) => product.id !== id),
    );
  };

  const updateProduct = <K extends keyof FlashSaleProduct>(
    id: string,
    field: K,
    value: FlashSaleProduct[K],
  ) => {
    setSelectedProducts(
      selectedProducts.map((product) =>
        product.id === id ? { ...product, [field]: value } : product,
      ),
    );
  };

  const onSubmit = async (data: FlashSaleFormData) => {
    try {
      const formData = { ...data, products: selectedProducts };
      console.log("Flash Sale Data:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Handle successful submission
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  const t = {
    en: {
      title: "New Flash Sale",
      language_version: "You are editing 'English' version",
      name: "Name",
      products: "Products",
      search_products: "Search products",
      start_date: "Start Date",
      end_date: "End Date",
      status: "Status",
      published: "Published",
      draft: "Draft",
      price: "Price",
      discount_price: "Discount Price",
      quantity: "Quantity",
      required: "Required",
      save: "Save",
      saveExit: "Save and Exit",
      add_product: "Add Product",
      remove: "Remove",
      new_flash_sale: "New Flash Sale",
      english: "English",
      arabic: "Arabic",
      no_products_found: "No products found",
      select_products: "Select products to add to flash sale",
    },
    ar: {
      title: "عرض ترويجي جديد",
      language_version: "أنت تقوم بتحرير النسخة 'العربية'",
      name: "الاسم",
      products: "المنتجات",
      search_products: "بحث في المنتجات",
      start_date: "تاريخ البدء",
      end_date: "تاريخ الانتهاء",
      status: "الحالة",
      published: "منشور",
      draft: "مسودة",
      price: "السعر",
      discount_price: "سعر الخصم",
      quantity: "الكمية",
      required: "مطلوب",
      save: "حفظ",
      saveExit: "حفظ وخروج",
      add_product: "إضافة منتج",
      remove: "إزالة",
      new_flash_sale: "عرض ترويجي جديد",
      english: "الإنجليزية",
      arabic: "العربية",
      no_products_found: "لم يتم العثور على منتجات",
      select_products: "اختر المنتجات لإضافتها للعرض الترويجي",
    },
  }[language];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t.new_flash_sale}</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-6">
            {/* Left Column - Main Content */}
            <div className="space-y-6 lg:col-span-4">
              {/* Name Section - Bilingual */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
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
                    control={form.control}
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

              {/* Products Section */}
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{t.products}</h3>
                </div>

                {/* Search Products */}
                <div className="relative mb-4" ref={wrapperRef}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      type="text"
                      placeholder={t.search_products}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onFocus={() => setIsSearchOpen(true)}
                      className="pl-10"
                    />
                  </div>

                  {isSearchOpen && (
                    <div className="scroll-bar-minimal absolute z-10 mt-1 max-h-[400px] w-full overflow-y-auto rounded-md border bg-white shadow-lg">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100"
                            onClick={() => addProduct(product)}
                          >
                            <Image
                              src={
                                product.images[0] ?? "/images/placholder.png"
                              }
                              width={100}
                              height={100}
                              alt={product.title[language] ?? "Product Desc"}
                              className="h-8 w-8 rounded-md object-cover"
                            />
                            <div>
                              <div className="font-medium">
                                {product.title[language]}
                              </div>
                              <div className="text-sm text-gray-600">
                                ${product.price}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">
                          {t.no_products_found}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Products */}
                <div className="space-y-4">
                  {selectedProducts.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      {t.select_products}
                    </div>
                  ) : (
                    selectedProducts.map((product) => (
                      <div key={product.id} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{product.name}</h4>
                            <div className="text-sm text-gray-600">
                              Original: ${product.price}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeProduct(product.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-col gap-4 sm:flex-row">
                          {/* Discount Price */}
                          <div className="flex-1">
                            <label className="mb-2 block text-sm font-medium">
                              {t.discount_price}
                            </label>
                            <Input
                              type="number"
                              value={product.discount_price || ""}
                              onChange={(e) =>
                                updateProduct(
                                  product.id,
                                  "price",
                                  parseFloat(e.target.value),
                                )
                              }
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                            />
                          </div>

                          {/* Quantity */}
                          <div className="flex-1">
                            <label className="mb-2 block text-sm font-medium">
                              {t.quantity}
                            </label>
                            <Input
                              type="number"
                              value={product.quantity}
                              onChange={(e) =>
                                updateProduct(
                                  product.id,
                                  "quantity",
                                  parseInt(e.target.value),
                                )
                              }
                              min="1"
                            />
                          </div>

                          {/* Discount Badge */}
                          <div className="flex items-end pb-2">
                            <Badge variant="error">
                              {product.discount_price && product.price > 0
                                ? `${Math.round((1 - product.discount_price / product.price) * 100)}% OFF`
                                : "0% OFF"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
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
                    {t.save}
                  </Button>
                </CardContent>
              </Card>

              {/* Status */}
              <Card className="p-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">{t.status}</FormLabel>
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
                          <SelectItem value="published">
                            {t.published}
                          </SelectItem>
                          <SelectItem value="draft">{t.draft}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>

              {/* Dates */}
              <Card className="p-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {t.start_date} *
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">
                          {t.end_date} *
                        </FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
