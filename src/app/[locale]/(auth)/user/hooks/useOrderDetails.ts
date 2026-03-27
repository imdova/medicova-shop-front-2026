"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { getOrderById, ApiOrder } from "@/services/orderService";
import { useAppLocale } from "@/hooks/useAppLocale";

import { getProductById, mapApiProductToProduct } from "@/services/productService";

export const useOrderDetails = () => {
  const params = useParams();
  const slug = params.slug as string;
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!token || !slug) {
      if (!token) setLoading(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(slug, token);
      if (data) {
        const d = data as any;
        
        // Use orderStatus as a fallback for status
        if (d.orderStatus && !d.status) {
          d.status = d.orderStatus;
        }
        
        // Helper to ensure absolute URLs
        const ensureAbsoluteUrl = (url: any) => {
          if (!url || typeof url !== "string" || url === "h") return "/images/placeholder.png";
          if (url.startsWith("http")) return url;
          const apiBaseUrl = "https://shop-api.medicova.net";
          return `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
        };

        // If items is missing or empty, use units as the source
        const sourceItems = (data.items && data.items.length > 0) ? data.items : (d.units || []);

        const itemsWithDetails = await Promise.all(sourceItems.map(async (item: any) => {
          const productId = typeof item.productId === "object" ? item.productId?._id : item.productId;
          if (productId && typeof productId === "string") {
            try {
              const fullProd = await getProductById(productId, token);
              if (fullProd) {
                const mapped = mapApiProductToProduct(fullProd);
                return {
                  ...item,
                  productBrand: mapped.brand?.name?.[locale] || "Medicova",
                  productImage: mapped.images?.[0] || item.productImage || item.image,
                  productName: mapped.title?.en || item.productName || item.nameEn || item.name,
                  productNameAr: mapped.title?.ar || item.productNameAr || item.nameAr || item.productName
                };
              }
            } catch (pErr) {
              console.warn("Failed to fetch product details for item:", productId, pErr);
            }
          }
          return { ...item, productBrand: "Medicova" };
        }));

        const transformed = {
          ...d,
          status: d.status === "delivered" ? "completed" : d.status,
          displayId: d.orderNumber || d.id || d._id,
          grandTotal: d.total || d.totalPrice || d.total_price || d.grandTotal || 0,
          shippingPrice: d.shippingCost || d.shippingFee || d.shipping_fee || 0,
          subTotal: d.subtotal || d.subTotal || d.sub_total || ((d.total || d.totalPrice || 0) - (d.shippingCost || 0)) || 0,
          paymentMethod: d.paymentMethod || "cash_on_delivery",
          createdAt: d.createdAt || d.created_at,
          userId: typeof d.customerId === "object" ? d.customerId?._id : d.customerId,
          userName: typeof d.customerId === "object" ? `${d.customerId.firstName} ${d.customerId.lastName}` : (d.userName || d.name || d.fullName || "Customer"),
          shippingAddress: (() => {
            const addr = d.address || d.shippingAddress || d.shipping_address || {};
            const isObj = addr && typeof addr === "object" && Object.keys(addr).length > 0;
            const cust = typeof d.customerId === "object" ? d.customerId : {};
            
            // Aggressive phone search
            const phoneSearch = [
              isObj && (addr.phone || addr.phoneNumber || addr.phone_number || addr.mobile),
              d.phoneNumber,
              d.phone,
              cust.phone,
              cust.phoneNumber,
              d.customerId // sometimes ID is used as fallback, but avoid if possible
            ].find(p => p && typeof p === "string" && p.length > 5);

            return {
              name: (isObj && (addr.name || addr.addressName || addr.fullName)) || (cust.firstName ? `${cust.firstName} ${cust.lastName}` : (d.userName || d.name || "Customer")),
              phone: phoneSearch || (d.phoneNumber || d.phone || cust.phone || "+2"),
              address: (isObj && (addr.addressDetails || addr.address || addr.street || addr.details)) || d.shippingAddress || d.addressDetails || (typeof addr === "string" ? addr : "N/A"),
              city: (isObj && (addr.city || addr.area || addr.governorate || addr.region)) || d.governorate || d.area || d.city || "N/A",
              country: (isObj && addr.country) || "Egypt"
            };
          })(),
          items: itemsWithDetails.map(it => {
            const item = it as any;
            const rootUnits = d.units || d.orderUnits || [];
            
            // Map of label -> value
            const variantMap = new Map<string, string>();
            
            // Check item-level fields
            const variantKeys = ["size", "color", "Color", "Size", "Tt", "Strength"];
            variantKeys.forEach(key => {
              const val = item[key];
              if (val && val !== "Default" && typeof val === "string") {
                // Determine label: use key as is if it's capitalized, otherwise use a friendly name
                let label = key;
                if (key === "variant_1") label = isAr ? "الخيار 1" : "Option 1";
                if (key === "variant_2") label = isAr ? "الخيار 2" : "Option 2";
                if (key === "size") label = isAr ? "المقاس" : "Size";
                if (key === "color") label = isAr ? "اللون" : "Color";
                
                variantMap.set(label, val);
              }
            });
            
            // Check items-level units (if any)
            if (item.units && Array.isArray(item.units)) {
               item.units.forEach((u: any) => {
                 Object.entries(u).forEach(([key, val]) => {
                   if (["productId", "quantity", "_id", "id", "__v", "variant_1", "variant_2"].includes(key)) return;
                   if (val && val !== "Default" && typeof val === "string") {
                     variantMap.set(key, val);
                   }
                 });
               });
            }

            // Check root-level units matching this productId (if they are not already this item)
            const productId = typeof item.productId === "object" ? item.productId?._id : item.productId;
            if (rootUnits.length > 0 && !rootUnits.includes(item)) {
              const matchingUnits = rootUnits.filter((u: any) => (u.productId?._id || u.productId) === productId);
              matchingUnits.forEach((u: any) => {
                Object.entries(u).forEach(([key, val]) => {
                  if (["productId", "quantity", "_id", "id", "__v", "unitPrice", "unit_price", "variant_1", "variant_2"].includes(key)) return;
                  if (val && val !== "Default" && typeof val === "string") {
                    variantMap.set(key, val);
                  }
                });
              });
            }

            const displayVariants = Array.from(variantMap.entries()).map(([label, value]) => ({ label, value }));

            return {
              ...item,
              price: item.unitPrice || item.unit_price || item.price || 0,
              displayImage: ensureAbsoluteUrl(item.productImage || item.image),
              displayName: isAr ? (item.productNameAr || item.nameAr || item.productName) : (item.productName || item.nameEn || item.name || item.displayName),
              displayBrand: item.productBrand || "Medicova",
              displayVariants: displayVariants,
            };
          })
        };
        setOrder(transformed);
      } else {
        setError(isAr ? "الطلب غير موجود" : "Order not found");
      }
    } catch (err) {
      console.error("fetchOrder error:", err);
      setError(isAr ? "فشل في تحميل تفاصيل الطلب" : "Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [slug, token, isAr, locale]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, loading, error, isAr };
};
