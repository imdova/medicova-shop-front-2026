import z from "zod";

// ---------------- Bilingual Text Schema ----------------
export const bilingualTextSchema = z.object({
  en: z.string().optional(),
  ar: z.string().optional(),
});

// ---------------- FAQ Schema ----------------
export const faqSchema = z.object({
  question: bilingualTextSchema.refine(
    (data) => data.en || data.ar,
    "At least one language version is required for question",
  ),
  answer: bilingualTextSchema.refine(
    (data) => data.en || data.ar,
    "At least one language version is required for answer",
  ),
});

// ---------------- SEO Schema ----------------
export const seoSchema = z.object({
  meta_title: bilingualTextSchema.optional(),
  meta_description: bilingualTextSchema.optional(),
  meta_image: z.string().optional(),
});

// ---------------- Main Schema & Types ----------------

/* 🔹 Main Page schema definition */
export const pageSchema = z.object({
  id: z.string().optional(), // Optional unique page ID
  name: bilingualTextSchema.refine(
    (data) => data.en || data.ar,
    "At least one language version is required for the page name",
  ),
  description: bilingualTextSchema.optional(), // Optional bilingual description
  content: bilingualTextSchema.refine(
    (data) => data.en || data.ar,
    "At least one language version is required for the content",
  ),
  template: z.enum([
    "home",
    "about",
    "contact",
    "services",
    "blog",
    "custom",
    "without-layout",
  ]), // Page layout template type
  breadcrumb_style: z.enum(["start", "center", "end"]), // Breadcrumb alignment
  breadcrumb_background: z.string().optional(), // Optional background image/color
  status: z.enum(["draft", "published", "archived"]), // Page publication status
  featured_image: z.string().optional(), // Optional featured image path
  faqs: z.array(faqSchema), // List of FAQs (no default)
  seo: seoSchema.optional(), // SEO metadata
  languages: z.array(z.string()), // Supported language codes
  availableLanguages: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
    }),
  ), // List of available languages for selection
  createdAt: z.string().optional(), // Creation timestamp (ISO string)
  lastModified: z.string().optional(), // Last modified timestamp (ISO string)
  author: z.string().optional(), // Author or editor name
  page_type: z.enum(["static", "custom", "system"]).optional(), // Page classification
});
