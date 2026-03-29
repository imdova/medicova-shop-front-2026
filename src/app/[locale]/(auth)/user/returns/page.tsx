"use client";

import React, { useEffect, useState } from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { ReturnOrder } from "../types/account";
import { useUserReturns } from "../hooks/useUserReturns";
import { ReturnHeader } from "../component/ReturnHeader";
import { ReturnFilters } from "../component/ReturnFilters";
import { ReturnList } from "../component/ReturnList";
import { getCustomerReturns } from "@/services/orderService";
import { getProductById } from "@/services/productService";
import { useSession } from "next-auth/react";

const ReturnsPage = () => {
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [apiReturns, setApiReturns] = useState<ReturnOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReturns() {
      if (!token) return;
      try {
        setLoading(true);
        const rows = await getCustomerReturns(token);

        const transformed: ReturnOrder[] = await Promise.all(
          rows.map(async (row: any) => {
            // Fetch product image if not present
            let image = "/images/placeholder.jpg";
            if (row.productId) {
              const p = await getProductById(row.productId, token);
              if (p) {
                image =
                  p.media?.featuredImages ||
                  (p.media?.galleryImages && p.media.galleryImages[0]) ||
                  "/images/placeholder.jpg";
                
                if (image && !image.startsWith("http") && image !== "/images/placeholder.jpg") {
                  image = `https://shop-api.medicova.net${image.startsWith("/") ? "" : "/"}${image}`;
                }
              }
            }

            const statusMapping: Record<string, { en: string; ar: string }> = {
              requested: { en: "Requested", ar: "تم الطلب" },
              approved: { en: "Approved", ar: "تمت الموافقة" },
              rejected: { en: "Rejected", ar: "مرفوض" },
              in_transit: { en: "In Transit", ar: "قيد التوصيل" },
              delivered: { en: "Delivered", ar: "تم التوصيل" },
            };

            const statusKey = (row.returnStatus || row.status || "requested").toLowerCase();
            const status = statusMapping[statusKey] || {
              en: row.returnStatus || "Requested",
              ar: row.returnStatus || "تم الطلب",
            };

            return {
              id: row._id || row.id,
              orderId: row.orderId,
              date: row.createdAt
                ? new Date(row.createdAt).toLocaleDateString()
                : new Date().toLocaleDateString(),
              status: status as any,
              totalRefund: row.amount || 0,
              items: [
                {
                  id: row._id || row.id,
                  name: {
                    en: row.productName || "Product",
                    ar: row.productNameAr || row.productName || "منتج",
                  },
                  image: image,
                  price: row.amount || 0,
                  quantity: 1, // Usually 1 per row in this flat structure
                  reason: {
                    en: row.description || "No reason provided",
                    ar: row.description || "لم يتم توفير سبب",
                  },
                  returnOption: {
                    en: "Original Payment",
                    ar: "وسيلة الدفع الأصلية",
                  },
                  status: status as any,
                },
              ],
            };
          }),
        );

        setApiReturns(transformed);
      } catch (err) {
        console.error("Failed to fetch returns:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReturns();
  }, [token]);

  const { activeTab, setActiveTab, filteredReturns, counts } =
    useUserReturns(apiReturns);

  return (
    <div className="mx-auto max-w-6xl pb-20">
      <ReturnHeader />

      <ReturnFilters
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        counts={counts}
        locale={locale}
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-600 border-t-transparent"></div>
        </div>
      ) : (
        <ReturnList returns={filteredReturns} locale={locale} />
      )}
    </div>
  );
};

export default ReturnsPage;
