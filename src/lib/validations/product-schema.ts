import { z } from "zod";

// Localized text schema
export const localizedTextSchema = z.object({
  en: z.string().min(1, "English text is required"),
  ar: z.string().min(1, "Arabic text is required"),
});

// Bilingual specification schema
export const bilingualSpecificationSchema = z.object({
  keyEn: z.string().optional(),
  keyAr: z.string().optional(),
  valueEn: z.string().optional(),
  valueAr: z.string().optional(),
});

// Base product schema with all optional fields for form state
export const productSchema = z.object({
  // Highlights (Array of strings now)
  highlightsEn: z.array(z.string()).default([]),
  highlightsAr: z.array(z.string()).default([]),

  // Titles & Slugs
  title: localizedTextSchema,
  slugEn: z.string().optional(),
  slugAr: z.string().optional(),

  // Identity
  identity: z
    .object({
      sku: z.string().optional(),
      skuMode: z.enum(["manual", "auto"]).default("manual"),
    })
    .default({ sku: "", skuMode: "manual" }),

  // Classification
  classification: z
    .object({
      category: z.string().optional(),
      subcategory: z.string().optional(),
      childCategory: z.string().optional(),
      brand: z.string().optional(),
      productType: z
        .enum(["Physical Product", "Digital Product"])
        .default("Physical Product"),
    })
    .default({ productType: "Physical Product" }),

  // Descriptions
  descriptions: z
    .object({
      descriptionEn: z.string().min(1, "Description is required"),
      descriptionAr: z.string().min(1, "الوصف مطلوب"),
    })
    .default({ descriptionEn: "", descriptionAr: "" }),

  // Pricing
  pricing: z
    .object({
      originalPrice: z.number().min(0).default(0),
      salePrice: z.number().min(0).default(0),
      startDate: z.string().optional().nullable(),
      endDate: z.string().optional().nullable(),
    })
    .default({ originalPrice: 0, salePrice: 0 }),

  // Inventory
  inventory: z
    .object({
      trackStock: z.boolean().default(true),
      stockQuantity: z.number().min(0).default(0),
      stockStatus: z
        .enum(["in_stock", "out_of_stock", "on_backorder"])
        .default("in_stock"),
    })
    .default({ trackStock: true, stockQuantity: 0, stockStatus: "in_stock" }),

  // Meta info
  createdBy: z.enum(["admin", "seller"]).default("seller"),
  store: z.string().optional(),
  approved: z.boolean().default(true),
  rate: z.number().min(0).max(5).default(0),

  // Media
  media: z
    .object({
      featuredImages: z.string().optional(), // Main image URL
      galleryImages: z.array(z.string()).default([]),
      productVideo: z
        .object({
          vedioUrl: z.string().optional(),
          imageUrl: z.string().optional(),
        })
        .optional(),
    })
    .default({ galleryImages: [] }),

  // Tags
  tags: z.array(z.string()).default([]),

  // Variants (Complex)
  productVariants: z
    .array(
      z.object({
        id: z.string().optional(),
        nameEn: z.string(),
        nameAr: z.string(),
        type: z.string(),
        optionsEn: z.array(
          z.object({
            optionName: z.string(),
            price: z.number(),
            stock: z.number(),
            color: z.string().optional(),
          }),
        ),
        optionsAr: z.array(
          z.object({
            optionName: z.string(),
            price: z.number(),
            stock: z.number(),
            color: z.string().optional(),
          }),
        ),
        createdBy: z.enum(["admin", "seller"]).optional(),
        storeId: z.string().optional(),
      }),
    )
    .default([]),

  // Bilingual specifications
  specifications: z.array(bilingualSpecificationSchema).default([]),

  // Actual Files for upload (Step 2)
  images: z
    .array(z.union([z.string(), z.instanceof(File)]))
    .max(10, "Maximum 10 images allowed")
    .default([]),
});

// Step-specific validation schemas
export const step1CoreSchema = z.object({
  classification: z.object({
    category: z.string().min(1, "Category is required"),
    subcategory: z.string().min(1, "Subcategory is required"),
    brand: z.string().min(1, "Brand is required"),
  }),
  title: localizedTextSchema,
  slugEn: z.string().min(1, "English slug is required"),
  slugAr: z.string().min(1, "Arabic slug is required"),
  descriptions: z.object({
    descriptionEn: z.string().min(1, "Description (EN) is required"),
    descriptionAr: z.string().min(1, "الوصف مطلوب"),
  }),
});

export const step2MediaSchema = z.object({
  identity: z.object({
    sku: z.string().min(3, "SKU must be at least 3 characters"),
  }),
  inventory: z.object({
    stockQuantity: z.number().min(0, "Stock cannot be negative"),
  }),
});

export const step3MediaSchema = z.object({
  images: z.array(z.any()).min(1, "At least one image is required"),
  pricing: z.object({
    originalPrice: z.number().min(1, "Original price must be greater than 0"),
  }),
});

export const step4SettingsSchema = z.object({
  // Optional step: variants/tags
  productVariants: z.array(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

// Back-compat alias (existing imports)
export const step3SettingsSchema = step3MediaSchema;

export type ProductFormData = z.infer<typeof productSchema>;
export type Specification = z.infer<typeof bilingualSpecificationSchema>;
export type LocalizedText = z.infer<typeof localizedTextSchema>;
