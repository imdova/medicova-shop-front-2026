"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LanguageType } from "@/util/translations";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import {
  getProducts,
  deleteProduct,
  approveProduct,
  ApiProduct,
} from "@/services/productService";

import ProductTableContainer from "../components/ProductTableContainer";

export default function ProductListPanel({
  locale = "en",
}: {
  locale: LanguageType;
}) {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const isAr = locale === "ar";

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getProducts(token);
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (product: ApiProduct) => {
    const name = product.nameEn || product.nameAr || product._id;
    const confirmMsg = isAr
      ? `هل أنت متأكد من حذف "${name}"؟`
      : `Are you sure you want to delete "${name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      console.log("DEBUG: Deleting product", product._id);
      await deleteProduct(product._id, token);
      console.log("DEBUG: Delete successful for", product._id);
      setProducts((prev) => prev.filter((p) => p._id !== product._id));
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(
        isAr
          ? `فشل الحذف: ${err?.message || ""}`
          : `Delete failed: ${err?.message || ""}`,
      );
    }
  };

  const handleToggleApprove = async (product: ApiProduct) => {
    setApprovingId(product._id);
    try {
      await approveProduct(product._id, !product.approved, token);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, approved: !p.approved } : p,
        ),
      );
    } catch (err) {
      console.error("Approve toggle failed:", err);
      alert(isAr ? "فشل تغيير الحالة" : "Status update failed");
    } finally {
      setApprovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white py-20">
        <p className="text-lg font-bold text-gray-400">
          {isAr ? "لا يوجد منتجات" : "No products found"}
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-1000">
      <ProductTableContainer
        locale={locale}
        data={products}
        onDelete={handleDelete}
        onToggleApprove={handleToggleApprove}
        approvingId={approvingId}
      />
    </div>
  );
}
