import { z } from "zod";

// Localized text schema
export const localizedTextSchema = z.object({
  en: z.string().min(1, "English text is required"),
  ar: z.string().min(1, "Arabic text is required"),
});

// Bilingual specification schema
export const bilingualSpecificationSchema = z.object({
  key: z.object({
    en: z.string().min(1, "English key is required"),
    ar: z.string().min(1, "Arabic key is required"),
  }),
  value: z.object({
    en: z.string().min(1, "English value is required"),
    ar: z.string().min(1, "Arabic value is required"),
  }),
});

// Base product schema with all optional fields for form state
export const productSchema = z.object({
  // Category & Brand
  category: z
    .object({
      id: z.string(),
      title: localizedTextSchema,
      slug: z.string().optional(),
    })
    .optional(),

  brand: z
    .object({
      id: z.string(),
      name: localizedTextSchema,
    })
    .optional(),

  // Identity
  sku: z.string().optional(),
  slug: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),
  productType: z.enum(["physical", "digital"]).default("physical"),

  // Pricing
  pricingMethod: z.enum(["manual", "auto"]).default("manual"),
  del_price: z.number().min(0, "Price must be positive").optional(),
  price: z.number().min(0, "Sale price must be positive").optional(),
  saleStart: z.string().optional(),
  saleEnd: z.string().optional(),

  // Bilingual content
  title: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),

  description: z
    .object({
      en: z.string().optional(),
      ar: z.string().optional(),
    })
    .optional(),

  deliveryTime: z.string().optional(),

  // Bilingual arrays
  features: z
    .object({
      en: z.array(z.string()).default([]),
      ar: z.array(z.string()).default([]),
    })
    .default({ en: [], ar: [] }),

  highlights: z
    .object({
      en: z.array(z.string()).default([]),
      ar: z.array(z.string()).default([]),
    })
    .default({ en: [], ar: [] }),

  // Inventory
  stock: z.number().min(0, "Stock must be positive").optional(),

  // Variants
  sizes: z.array(z.string()).default([]),
  colors: z.array(z.string()).default([]),

  // Bilingual specifications
  specifications: z.array(bilingualSpecificationSchema).default([]),

  //  Media
  images: z
    .array(z.union([z.string(), z.instanceof(File)]))
    .max(10, "Maximum 10 images allowed")
    .default([]),
  videoUrl: z.string().optional(),
});

// Step-specific validation schemas with proper required fields
export const categoryStepSchema = z.object({
  category: z
    .object({
      id: z.string(),
      title: localizedTextSchema,
      slug: z.string().optional(),
    })
    .refine((val) => val !== undefined && val.id !== undefined, {
      message: "Category is required",
    }),
});

export const brandStepSchema = z.object({
  brand: z
    .object({
      id: z.string(),
      name: localizedTextSchema,
    })
    .refine((val) => val !== undefined && val.id !== undefined, {
      message: "Brand is required",
    }),
});

export const identityStepSchema = z.object({
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .refine((val) => val !== undefined && val.length >= 3, {
      message: "SKU is required and must be at least 3 characters",
    }),
  slug: z.object({
    en: z.string().min(3, "English slug must be at least 3 characters"),
    ar: z.string().min(3, "Arabic slug must be at least 3 characters"),
  }),
});

// Relaxed details step schema for testing
export const detailsStepSchema = z.object({
  title: z.object({
    en: z.string().min(3, "English title must be at least 3 characters"),
    ar: z.string().min(3, "Arabic title must be at least 3 characters"),
  }),
  description: z.object({
    en: z.string().min(10, "English description must be at least 10 characters"),
    ar: z.string().min(10, "Arabic description must be at least 10 characters"),
  }),
  highlights: z.object({
    en: z.array(z.string()).min(1, "At least one English highlight is required"),
    ar: z.array(z.string()).min(1, "At least one Arabic highlight is required"),
  }),
  deliveryTime: z.string().min(1, "Delivery time is required"),
});

// Full schema for draft/final submission (relaxed)
export const fullProductSchema = z
  .object({

    // Only require price for now
    del_price: z
      .number()
      .min(0, "Price must be a positive number")
      .refine((val) => val !== undefined && val >= 0, {
        message: "Price is required",
      }),
    images: z
      .array(z.union([z.string(), z.instanceof(File)]))
      .min(1, "At least one product image is required")
      .max(10, "Maximum 10 images allowed"),

    price: z.number().min(0, "Sale price must be positive").optional(),

    saleStart: z.string().optional(),
    saleEnd: z.string().optional(),

    stock: z.number().min(0, "Stock must be positive").optional(),
  })
  .refine(
    (data) => {
      // Only validate sale dates if they are provided
      if (data.saleStart || data.saleEnd) {
        if (data.saleStart && !data.saleEnd) {
          return false;
        }
        if (data.saleEnd && !data.saleStart) {
          return false;
        }
        if (data.saleStart && data.saleEnd && data.saleStart > data.saleEnd) {
          return false;
        }
        if (data.price && data.price >= (data.del_price || 0)) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "Sale end date must be after start date and sale price must be less than regular price",
      path: ["saleEnd"],
    },
  );

export type ProductFormData = z.infer<typeof productSchema>;
export type Specification = z.infer<typeof bilingualSpecificationSchema>;
export type LocalizedText = z.infer<typeof localizedTextSchema>;
