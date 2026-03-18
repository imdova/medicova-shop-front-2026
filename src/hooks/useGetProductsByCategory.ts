// hooks/useGetProductsByCategory.ts
import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { getProducts, mapApiProductToProduct } from "@/services/productService";

interface UseGetProductsByCategoryProps {
  categorySlug?: string;
  page?: number;
  limit?: number;
}

interface UseGetProductsByCategoryResult {
  productsData: Product[];
  totalProducts: number;
  isLoading: boolean;
  error: Error | null;
}

export function useGetProductsByCategory({
  categorySlug,
  page = 1,
  limit = 12,
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

        if (categorySlug) {
          // Attempt to filter by category slug, ID, or subcategory slug
          filtered = filtered.filter((p: any) => 
            p.category?.id === categorySlug || 
            p.category?.slug === categorySlug ||
            p.subcategory?.slug === categorySlug ||
            p.category?.title?.en?.toLowerCase() === categorySlug.toLowerCase() ||
            p.subcategory?.title?.en?.toLowerCase() === categorySlug.toLowerCase()
          );
        }

        const count = filtered.length;
        
        // Handle pagination locally for now as getProducts returns all (limit=1000)
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
  }, [categorySlug, page, limit]);

  return { productsData, totalProducts, isLoading, error };
}
