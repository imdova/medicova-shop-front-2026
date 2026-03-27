import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Order } from "@/app/[locale]/(auth)/user/types/account";
import { getCustomerOrders } from "@/services/orderService";
import { useSession } from "next-auth/react";
import { getProductById, mapApiProductToProduct } from "@/services/productService";
import { useAppLocale } from "@/hooks/useAppLocale";

export const useUserOrders = (mockOrders: Order[], pageSize: number = 8) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useAppLocale();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      setLoading(true);
      return;
    }

    try {
      const apiOrdersRaw = await getCustomerOrders(token);
      
      const ensureAbsoluteUrl = (url: any) => {
        if (!url || typeof url !== "string") return "/images/placeholder.png";
        if (url.startsWith("http")) return url;
        const apiBaseUrl = "https://shop-api.medicova.net";
        return `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
      };

      // Filter orders: Only show COD or Paid orders
      const apiOrders = apiOrdersRaw.filter((o: any) => 
        o.paymentMethod === "cash_on_delivery" || o.paymentStatus === "paid"
      );
      
      // Transform ApiOrder to UI Order type with full product details for the first item
      const transformed: Order[] = await Promise.all(apiOrders.map(async (o: any, idx) => {
        // Handle both 'units' (from new schema) and 'items' (from old/alternate schema)
        const units = o.units || o.items || [];
        const firstItem = units[0] as any;
        
        // Extract productId: could be o.productId[0] or firstItem.productId
        const productId = firstItem?.productId || (Array.isArray(o.productId) ? o.productId[0] : o.productId);
        const actualProductId = typeof productId === "object" ? productId?._id : productId;
        
        let productBrand = "Medicova";
        let productName = firstItem?.productName || o.name || "Order";
        let productImage = ensureAbsoluteUrl(firstItem?.productImage || firstItem?.image);

        if (actualProductId && typeof actualProductId === "string") {
          try {
            const fullProd = await getProductById(actualProductId, token);
            if (fullProd) {
              const mapped = mapApiProductToProduct(fullProd);
              productBrand = mapped.brand?.name?.[locale] || productBrand;
              productName = mapped.title?.[locale] || productName;
              productImage = mapped.images?.[0] || productImage;
            }
          } catch (e) {
            console.warn("Failed to fetch product details for first item:", actualProductId);
          }
        }

        return {
          id: o._id || o.id,
          orderId: o.orderId || o.orderNumber || (o._id ? `ORD-${o._id.substring(0, 8).toUpperCase()}` : (o.id ? `ORD-${o.id.substring(0, 8).toUpperCase()}` : `ORD-UNKN-${idx}`)),
          status: o.status === "delivered" ? "completed" : (o.status as any),
          paymentMethod: o.paymentMethod || "unknown",
          paymentStatus: o.paymentStatus || "pending",
          productImage,
          productName,
          productBrand,
          productDescription: units.length > 1 ? `+ ${units.length - 1} more items` : "",
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          createdAt: o.createdAt ? new Date(o.createdAt).getTime() : Date.now(),
        };
      }));



      setOrders(transformed);
    } catch (err) {
      console.error("Failed to fetch user orders:", err);
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [token, locale]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const searchTerm = searchParams.get("search") || "";
  const timeFilter = (searchParams.get("timeFilter") as "all" | "last3months") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const updateSearchParam = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set(param, value);
    } else {
      params.delete(param);
    }

    if (["search", "timeFilter"].includes(param)) {
      params.set("page", "1");
    }

    router.push(`/user/orders?${params.toString()}`);
  };

  const filteredOrders = useMemo(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    return orders.filter((order) => {
      const matchesSearch =
        order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.productBrand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesTimePeriod =
        timeFilter === "all" || order.createdAt >= threeMonthsAgo.getTime();

      return matchesSearch && matchesTimePeriod;
    });
  }, [searchTerm, timeFilter, orders]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const currentPage = Math.min(Math.max(page, 1), totalPages || 1);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return {
    searchTerm,
    timeFilter,
    currentPage,
    totalPages,
    paginatedOrders,
    filteredCount: filteredOrders.length,
    updateSearchParam,
    loading,
    error
  };
};
