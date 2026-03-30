"use client";

import WishlistCard from "@/components/features/cards/WishlistCard";
import CustomAlert from "@/components/shared/CustomAlert";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useAppSelector } from "@/store/hooks";
import {
  clearWishlistApi,
  removeFromWishlistApi,
} from "@/store/slices/wishlistSlice";
import { LucideHeartOff } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

const WishlistPage: React.FC = () => {
  const { products: wishlistData } = useAppSelector((state) => state.wishlist);
  const locale = useAppLocale();
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info" | "cart" | "wishlist";
  } | null>(null);
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const handleClearWishlist = () => {
    const anySession = session as any;
    const token = anySession?.accessToken;
    if (userId && token && wishlistData.length > 0) {
      dispatch(clearWishlistApi({ token, userId }) as any);
      showAlert("Cleared wishlist!", "wishlist");
    } else if (!token || !userId) {
      const errorMsg = !userId ? "User ID not found" : "Access token missing";
      showAlert(`Cannot clear: ${errorMsg}`, "error");
    }
  };

  const handleDeleteFromWishlist = (id: string) => {
    const anySession = session as any;
    const token = anySession?.accessToken;
    if (userId && token) {
      dispatch(removeFromWishlistApi({ id, token, userId }) as any);
      showAlert("deleted Product from wishlist!", "wishlist");
    } else if (!token || !userId) {
      const errorMsg = !userId ? "User ID not found" : "Access token missing";
      showAlert(`Cannot delete: ${errorMsg}`, "error");
    }
  };

  // Show Alert Function
  const showAlert = (
    message: string,
    type: "success" | "error" | "info" | "cart" | "wishlist",
  ) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000); // Hide after 3 seconds
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto p-3 lg:max-w-[98%]">
        {/* Global Alert Display */}
        {alert && (
          <CustomAlert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert(null)}
          />
        )}
        <div className="mb-6 flex items-center justify-between gap-2">
          <h2 className="text-2xl font-bold text-gray-700">
            {locale === "ar" ? "قائمتي المفضلة" : "My Wishlist"}
          </h2>
          <button
            onClick={handleClearWishlist}
            className="shadow-xs flex items-center gap-1 rounded-md border border-gray-200 px-3 py-2 text-xs text-gray-600"
          >
            <LucideHeartOff size={15} />
            {locale === "ar" ? "مسح المفضلة" : "Clear Wishlist"}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistData.length > 0 ? (
            wishlistData.map((product) => (
              <WishlistCard
                key={product.id}
                product={product}
                locale={locale}
                handleDelete={() => handleDeleteFromWishlist(product.id)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center space-y-4 py-12 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">
                {locale === "ar"
                  ? "قائمة المفضلة فارغة"
                  : "Your wishlist is empty"}
              </h3>
              <p className="max-w-md text-gray-500">
                {locale === "ar"
                  ? "لم تقم بإضافة أي منتجات إلى قائمة المفضلة بعد. ابدأ بالتصفح وأضف ما تحبه!"
                  : "You haven't added any products to your wishlist yet. Start exploring and add items you love!"}
              </p>
              <Link
                href="/"
                className="mt-4 rounded-md bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
              >
                {locale === "ar" ? "تصفح المنتجات" : "Browse Products"}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
