// hooks/useGetProductsByCategory.ts
import { useEffect, useState } from "react";
import { Product } from "@/types/product";
import { products } from "@/constants/products";

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
    // if (!categorySlug) {
    //   setProductsData([]);
    //   setTotalProducts(0);
    //   return;
    // }

    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Uncomment and replace with your real API call
        // const response = await fetch(
        //   `/api/products/category/${categorySlug}?page=${page}&limit=${limit}`,
        // );

        // if (!response.ok) {
        //   throw new Error("Failed to fetch products");
        // }

        // const data = await response.json();

        // Mock data for example purposes — replace with actual data
        const data = {
          products: products,
          total: 0,
        };

        setProductsData(data.products);
        setTotalProducts(data.total);
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
