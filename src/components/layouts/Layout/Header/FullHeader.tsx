"use client";

import Link from "next/link";
import {
  ChevronDown,
  CirclePercent,
  MapPin,
  Menu,
  RotateCcw,
} from "lucide-react";
import LogoIcon from "@/assets/icons/logo";
import SearchComponent from "@/components/forms/Forms/formFields/SearchComponent";
import SwipeableNav from "./SwipeableNav";
import { useAppSelector } from "@/store/hooks";
import { Suspense, useEffect, useState } from "react";
import DeliverToModal from "@/components/shared/Modals/DeliverToModal";
import MobileNavDrawer from "./MobileNavDrawer";
import HeaderActions from "./HeaderActions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "@/components/shared/Modals/DynamicModal";
import AuthLogin from "@/components/shared/Modals/loginAuth";
import { AccountPageProps } from "@/app/[locale]/(auth)/user/types/account";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { linksHeader, link as linksSubHeader, Address } from "@/types";
import { setEncrypted } from "@/util/encryptedCookieStorage";

const FullHeader: React.FC<AccountPageProps & { links: any }> = ({
  links: commonLinks,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLogOpen, setIsModalLogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<
    Address | null | undefined
  >({
    id: "1",
    type: "home",
    name: "",
    details: "",
    area: "",
    city: "Cairo",
    isDefault: false,
    location: { lat: 30.0444, lng: 31.2357 },
  });
  const [productsCount, setProductsCount] = useState(0);
  const [productsCountWishlist, setProductsCountWishlist] = useState(0);
  const t = useTranslations("header");
  const locale = useAppLocale();
  const [isOpen, setIsOpen] = useState(false);
  const { products } = useAppSelector((state) => state.cart);
  const { products: wishlistData } = useAppSelector((state) => state.wishlist);
  const session = useSession();
  const router = useRouter();

  const handleLogin = () => {
    if (session.data?.user) {
      router.push("/wishlist");
    } else {
      setIsModalLogOpen(true);
    }
  };

  useEffect(() => {
    setProductsCount(products.length);
    setProductsCountWishlist(wishlistData.length);
  }, [products, wishlistData]);

  return (
    <>
      <header className="relative z-40" role="banner">
        <div className="min-h-[70px] w-full bg-white transition-all duration-700 md:bg-primary">
          <div className="relative">
            <div className="container mx-auto p-3 lg:max-w-[98%]">
              {/* Top Promo Bar Removed for Desktop as per mock */}

              <div className="flex items-center justify-between gap-4 py-2">
                {/* Mobile Menu & Logo */}
                <div className="flex w-fit shrink-0 items-center gap-3">
                  <button
                    onClick={() => setIsOpen(true)}
                    aria-label={t("openMenu")}
                  >
                    <Menu
                      size={24}
                      className="text-gray-600 md:hidden"
                      aria-hidden="true"
                    />
                  </button>
                  <Link
                    href="/"
                    className="flex items-center gap-1 xl:mr-10"
                    aria-label="Medicova home"
                  >
                    <LogoIcon
                      className="h-10 w-28 text-primary md:text-white"
                      aria-hidden="true"
                    />
                  </Link>
                </div>

                {/* Desktop Search */}
                <div className="hidden w-full flex-1 px-4 md:block md:max-w-3xl">
                  <Suspense
                    fallback={
                      <div className="h-12 w-full animate-pulse rounded-lg bg-white/10" />
                    }
                  >
                    <SearchComponent
                      variant="header"
                      locale={locale}
                      aria-label={t("searchPlaceholder")}
                    />
                  </Suspense>
                </div>

                {/* Right Actions */}
                <HeaderActions
                  productsCount={productsCount}
                  productsCountWishlist={productsCountWishlist}
                  handleLogin={handleLogin}
                />
              </div>
              <div className="mt-1 flex flex-col-reverse gap-2">
                <span
                  className="mt-2 flex cursor-pointer items-center gap-1 text-xs text-primary md:hidden md:text-white"
                  onClick={() => setIsModalOpen(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setIsModalOpen(true)}
                >
                  <span>
                    <MapPin size={14} aria-hidden="true" />
                  </span>
                  {t("deliveryTo")}
                  <span className="flex items-center gap-1 font-semibold">
                    {selectedAddress?.city}{" "}
                    <ChevronDown size={12} aria-hidden="true" />
                  </span>
                </span>
                <div className="block w-full flex-1 md:hidden">
                  <Suspense>
                    <SearchComponent
                      inputClassName="md:border-0 md:text-white border border-gray-200 text-gray-800 md:placeholder:text-white placeholder:text-gray-800"
                      iconClassName="text-gray-800 md:text-white"
                      locale={locale}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Categories Navigation */}
        <nav className="hidden flex-1 md:block" aria-label="Main categories">
          <SwipeableNav locale={locale} links={commonLinks} />
        </nav>
      </header>
      <div className="relative">
        <DeliverToModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentAddress={selectedAddress}
          onAddressSelect={(address) => {
            setSelectedAddress(address);
            setEncrypted("userAddress", address);
          }}
          locale={locale}
        />
      </div>
      <MobileNavDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        locale={locale as "en" | "ar"}
        commonLinks={commonLinks}
      />
      <Modal
        isOpen={isModalLogOpen}
        onClose={() => setIsModalLogOpen(false)}
        size="lg"
      >
        <AuthLogin redirect="/account/wishlist" />
      </Modal>
    </>
  );
};

export default FullHeader;
