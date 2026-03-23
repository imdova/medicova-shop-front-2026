// hooks/useGetProductsByCategory.ts
import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getProducts, mapApiProductToProduct } from "@/services/productService";
import { getTags } from "@/services/tagService";

interface UseGetProductsByCategoryProps {
  categorySlug?: string;
  subcategorySlug?: string;
  searchQuery?: string;
  brands?: string[];
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  availability?: string[];
  sort?: string;
  page?: number;
  limit?: number;
  tag?: string;
}

interface UseGetProductsByCategoryResult {
  productsData: Product[];
  totalProducts: number;
  isLoading: boolean;
  error: Error | null;
}

export function useGetProductsByCategory({
  categorySlug,
  subcategorySlug,
  searchQuery,
  brands,
  categories,
  minPrice,
  maxPrice,
  rating,
  availability,
  sort,
  page = 1,
  limit = 12,
  tag,
}: UseGetProductsByCategoryProps): UseGetProductsByCategoryResult {
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch products from API
        const allApiProducts = await getProducts();
        
        // Map and filter products
        let filtered = allApiProducts.map(mapApiProductToProduct);

        // Filter by category (from URL param)
        if (categorySlug) {
          filtered = filtered.filter((p: Product) => 
            p.category?.id === categorySlug || 
            p.category?.slug === categorySlug ||
            p.category?.subcategory?.url?.includes(categorySlug) ||
            p.category?.title?.en?.toLowerCase() === categorySlug.toLowerCase() ||
            p.category?.subcategory?.title?.en?.toLowerCase() === categorySlug.toLowerCase()
          );
        }

        // Filter by subcategory (from query param)
        if (subcategorySlug) {
          const lowerSub = subcategorySlug.toLowerCase();
          const safeToLower = (val: any) => (typeof val === "string" ? val.toLowerCase() : "");

          filtered = filtered.filter((p: any) => {
            // Check root-level subcategory (from mapApiProductToProduct)
            const subSlug = safeToLower(p.subcategory?.slug);
            const subTitleEn = safeToLower(p.subcategory?.title?.en)?.replace(/\s+/g, '-');
            const subTitleAr = safeToLower(p.subcategory?.title?.ar);
            
            // Check nested category.subcategory
            const catSubUrl = safeToLower(p.category?.subcategory?.url);
            const catSubTitleEn = safeToLower(p.category?.subcategory?.title?.en)?.replace(/\s+/g, '-');
            
            return (
              subSlug === lowerSub ||
              subTitleEn === lowerSub ||
              subTitleAr === lowerSub ||
              catSubUrl?.includes(lowerSub) ||
              catSubTitleEn === lowerSub
            );
          });
        }

        // Filter by Search Query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter((p: Product) => 
            p.title.en.toLowerCase().includes(query) || 
            p.title.ar.toLowerCase().includes(query)
          );
        }

        // Filter by multiple Brands
        if (brands && brands.length > 0) {
          filtered = filtered.filter((p: Product) => 
            brands.includes(p.brand?.id || "") || 
            brands.includes(p.brand?.name?.en?.toLowerCase() || "")
          );
        }

        // Filter by multiple Categories (from filter sidebar)
        if (categories && categories.length > 0) {
          filtered = filtered.filter((p: Product) => 
            categories.includes(p.category?.id || "") || 
            categories.includes(p.category?.slug || "")
          );
        }

        // Filter by Price Range
        if (minPrice !== undefined) {
          filtered = filtered.filter((p: Product) => p.price >= minPrice);
        }
        if (maxPrice !== undefined) {
          filtered = filtered.filter((p: Product) => p.price <= maxPrice);
        }

        // Filter by Rating
        if (rating !== undefined) {
          filtered = filtered.filter((p: Product) => (p.rating || 0) >= rating);
        }

        // Filter by Availability
        if (availability && availability.length > 0) {
          filtered = filtered.filter((p: Product) => {
            const stock = p.stock || 0;
            if (availability.includes("in-stock") && stock > 0) return true;
            if (availability.includes("out-of-stock") && stock === 0) return true;
            return false;
          });
        }

        // Filter by Tag (Slug)
        if (tag) {
          try {
            const allTags = await getTags();
            const targetTag = allTags.find(
              (t) =>
                t.slug?.toLowerCase() === tag.toLowerCase() ||
                t.slugAr?.toLowerCase() === tag.toLowerCase() ||
                t.id === tag,
            );
            if (targetTag) {
              filtered = filtered.filter((p: Product) =>
                p.tags?.includes(targetTag.id),
              );
            } else {
              // If tag not found, return empty list for this tag search
              filtered = [];
            }
          } catch (tagErr) {
            console.error("Error resolving tag for search:", tagErr);
          }
        }

        // Apply Sorting
        if (sort) {
          switch (sort) {
            case "price-asc":
              filtered.sort((a, b) => a.price - b.price);
              break;
            case "price-desc":
              filtered.sort((a, b) => b.price - a.price);
              break;
            case "rating":
              filtered.sort((a, b) => b.rating - a.rating);
              break;
            case "newest":
              // Assuming ID or something represents age if date is missing
              filtered.sort((a, b) => b.id.localeCompare(a.id));
              break;
            default:
              break;
          }
        }

        const count = filtered.length;
        
        // Handle pagination locally
        const startIndex = (page - 1) * limit;
        const paginated = filtered.slice(startIndex, startIndex + limit);

        setProductsData(paginated);
        setTotalProducts(count);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An error occurred"));
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug, subcategorySlug, searchQuery, brands, categories, minPrice, maxPrice, rating, availability, sort, page, limit, tag]);

  return { productsData, totalProducts, isLoading, error };
}
