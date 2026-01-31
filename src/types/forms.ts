// Tags Products
export interface Tag {
  id: string;
  name: {
    en: string;
    ar: string;
  };
  slug: string;
  description?: {
    en?: string;
    ar?: string;
  };
  meta_title?: {
    en?: string;
    ar?: string;
  };
  meta_description?: {
    en?: string;
    ar?: string;
  };
  status: "published" | "draft";
  created_at: string;
  updated_at: string;
}

export interface TagFormData {
  name_en: string;
  name_ar: string;
  slug: string;
  description_en?: string;
  description_ar?: string;
  meta_title_en?: string;
  meta_title_ar?: string;
  meta_description_en?: string;
  meta_description_ar?: string;
  status: "published" | "draft";
}
