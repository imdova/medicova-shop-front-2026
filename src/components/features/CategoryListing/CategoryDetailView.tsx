"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { MultiCategory } from "@/types";
import { useSearchParams } from "next/navigation";
import { useGetProductsByCategory } from "@/hooks/useGetProductsByCategory";
import { products } from "@/data";

// Redesigned Components
import CategoryHero from "./CategoryHero";
import BestsellerBanner from "./BestsellerBanner";
import SubcategoryChips from "./SubcategoryChips";
import ProductGrid from "./ProductGrid";
import FAQSection from "./FAQSection";

interface RenderComponentProps {
  category: MultiCategory;
  fullPath?: string;
}

export default function RenderComponent({
  category,
  fullPath,
}: RenderComponentProps) {
  const searchParams = useSearchParams();
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  // Pagination & Filtering Logic
  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? Number(pageParam) : 1;
  const itemsPerPage = 12;

  const categorySlugParam = searchParams.get("categorySlug");
  const subcategoryParam = searchParams.get("subcategory");
  const activeSlug = subcategoryParam ?? categorySlugParam ?? undefined;

  const { productsData, totalProducts, isLoading } = useGetProductsByCategory({
    categorySlug: activeSlug || category.id,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Dynamic Bestsellers (reverted to dummy as per user request, excluding "Man Clothes")
  const displayBestsellers = products
    .filter(p => {
      const titleEn = p.title?.en?.toLowerCase() || "";
      const catEn = p.category?.title?.en?.toLowerCase() || "";
      const titleAr = p.title?.ar || "";
      const catAr = p.category?.title?.ar || "";
      
      const isMens = 
        titleEn.includes("man") || titleEn.includes("men") || 
        catEn.includes("man") || catEn.includes("men") ||
        titleAr.includes("رجالي") || catAr.includes("رجالي");
        
      return !isMens;
    })
    .slice(0, 8);
  
  const mockFAQs = [
    {
      question: isArabic ? "ما هي سياسة الإرجاع لهذا القسم؟" : "What is the return policy for this category?",
      answer: isArabic 
        ? "يمكنك إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام بشرط أن تكون في حالتها الأصلية." 
        : "You can return products within 14 days of receipt as long as they are in their original condition."
    },
    {
      question: isArabic ? "كيف يمكنني معرفة حجم المنتج؟" : "How do I know the product size?",
      answer: isArabic 
        ? "يرجى مراجعة دليل المقاسات الموجود في صفحة كل منتج للحصول على أدق المعلومات." 
        : "Please check the size guide on each product page for the most accurate information."
    },
    {
       question: isArabic ? "هل تتوفر عروض خاصة حالياً؟" : "Are there any special offers available?",
       answer: isArabic 
         ? "نعم، يمكنك دائماً مراجعة قسم العروض والخصومات في أعلى الصفحة أو متابعة نشرتنا البريدية." 
         : "Yes, you can always check the offers and discounts section at the top of the page or follow our newsletter."
    }
  ];

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <CategoryHero 
        category={category} 
        fullPath={fullPath} 
        itemCount={totalProducts} 
      />

      <div className="container mx-auto px-4 lg:max-w-[98%]">
        {/* 2. Bestseller Section */}
        <BestsellerBanner 
          products={displayBestsellers} 
          categoryName={category.title[locale]} 
        />

        {/* 3. Subcategory Chips / Filters */}
        {category.subCategories && (
          <SubcategoryChips 
            subcategories={category.subCategories} 
            currentPath={fullPath || ""} 
            activeSlug={activeSlug}
          />
        )}

        {/* 4. Main Product Grid */}
        <ProductGrid 
          products={productsData} 
          totalProducts={totalProducts} 
          currentPage={currentPage} 
          itemsPerPage={itemsPerPage} 
        />

        {/* 5. FAQ Section */}
        <FAQSection faqs={mockFAQs} />
      </div>
    </div>
  );
}
