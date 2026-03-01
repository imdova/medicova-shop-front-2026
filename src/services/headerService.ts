import { getCategories, getSubCategories, getAllSubCategoryChildren } from "@/services/categoryService";
import { linksHeader, gridLink, MultiCategory } from "@/types";

export async function getDynamicHeaderLinks(): Promise<linksHeader[]> {
  try {
    const [categories, subCategories, subCategoryChildren] = await Promise.all([
      getCategories(),
      getSubCategories(),
      getAllSubCategoryChildren(),
    ]);

    // Transform categories into header links
    const headerLinks: linksHeader[] = categories.map((category) => {
      const catSlug = category.slug; // Already has fallback logic from mapCategory
      
      // Find subcategories belonging to this category
      // Note: MultiCategory uses 'id' which is mapped from '_id'
      const relatedSubCategories = subCategories.filter(
        (sub) => {
          // In some cases sub.categoryId might be an object or just ID
          const subCatId = (sub as any).categoryId || (sub as any).parentCategory || "";
          const targetId = typeof subCatId === 'object' ? subCatId._id : subCatId;
          return targetId === category.id;
        }
      );

      // Create gridLinks: Each subcategory becomes its own group heading
      const gridLinks: gridLink[] = relatedSubCategories.map((sub) => {
        const subSlug = sub.slug;
        
        // Find children belonging to this subcategory
        const relatedChildren = subCategoryChildren.filter(
          (child) => {
            const parentSubId = (child as any).parentSubCategoryId || (child as any).parentSubCategory || (child as any).subCategory || "";
            const targetId = typeof parentSubId === 'object' ? parentSubId._id : parentSubId;
            return targetId === sub.id;
          }
        );

        return {
          heading: sub.title,
          url: `/category/${catSlug}/${subSlug}`,
          subLinks: [
            ...relatedChildren.map((child) => {
              const childSlug = child.slug;
              return {
                title: child.title,
                url: `/category/${catSlug}/${subSlug}/${childSlug}`,
              };
            }),
          ],
        };
      });

      return {
        id: category.id,
        title: category.title,
        url: `/category/${catSlug}`,
        gridLinks: gridLinks.length > 0 ? gridLinks : undefined,
        banner: {
          active: true,
          title: category.title,
          details: {
            en: (category as any).description || "",
            ar: (category as any).description || "",
          },
          image: category.image,
        },
      };
    });

    return headerLinks;
  } catch (error) {
    console.error("Error fetching dynamic header links:", error);
    // Return empty array or fallback to static data handled in layout
    return [];
  }
}
