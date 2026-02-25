"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import LanguageSwitcher from "@/components/layouts/LanguageSwitcher";
import AuthButton from "@/components/shared/Buttons/AuthButton";
import { useTranslations } from "next-intl";

interface HeaderActionsProps {
  productsCount: number;
  productsCountWishlist: number;
  handleLogin: () => void;
}

const HeaderActions = ({
  productsCount,
  productsCountWishlist,
  handleLogin,
}: HeaderActionsProps) => {
  const t = useTranslations("header");

  return (
    <div className="flex shrink-0 items-center justify-end">
      <div className="hidden items-center md:flex">
        <LanguageSwitcher className="text-gray-700 md:text-white" />
      </div>
      <div className="mx-2 hidden h-5 w-px bg-white/30 md:block"></div>
      <div className="hidden md:block">
        <AuthButton />
      </div>
      <div className="mx-1 hidden h-5 w-px bg-white/30 md:block"></div>
      <div className="ml-2 flex items-center gap-4">
        {/* Wishlist Button */}
        <button
          onClick={handleLogin}
          className="hover:text-primary/80 group relative flex items-center p-1 text-primary transition-colors md:text-white md:hover:text-white/90"
          aria-label={`${t("wishlist")} (${productsCountWishlist} ${t("items")})`}
        >
          <Heart size={24} aria-hidden="true" />
          {productsCountWishlist > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white md:bg-white md:text-primary md:ring-white/20">
              {productsCountWishlist > 9 ? "9+" : productsCountWishlist}
            </span>
          )}
        </button>

        {/* Cart Button */}
        <Link
          href="/cart"
          className="hover:text-primary/80 group relative flex items-center p-1 text-primary transition-colors md:text-white md:hover:text-white/90"
          aria-label={`${t("cart")} (${productsCount} ${t("items")})`}
        >
          <ShoppingCart size={24} aria-hidden="true" />
          {productsCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-2 ring-white md:bg-white md:text-primary md:ring-white/20">
              {productsCount > 9 ? "9+" : productsCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default HeaderActions;
