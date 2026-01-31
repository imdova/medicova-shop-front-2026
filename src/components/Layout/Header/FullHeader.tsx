"use client";
import { commonLinks } from "@/constants/header";
import Link from "next/link";
import {
  ChevronDown,
  CirclePercent,
  Heart,
  MapPin,
  Menu,
  RotateCcw,
  ShoppingCart,
} from "lucide-react";
import LogoIcon from "@/assets/icons/logo";
import SearchComponent from "@/components/Forms/formFields/SearchComponent";
import SwipeableNav from "./SwipeableNav";
import { useAppSelector } from "@/store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import DeliverToModal from "@/components/UI/Modals/DeliverToModal";
import AuthButton from "@/components/UI/Buttons/AuthButton";
import { Drawer } from "@/components/UI/Drawer";
import Collapse from "@/components/UI/Collapse";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "@/components/UI/Modals/DynamicModal";
import AuthLogin from "@/components/UI/Modals/loginAuth";
import { AccountPageProps } from "@/app/(auth)/user/types/account";
import LanguageSwitcher from "@/components/UI/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

type Address = {
  id: string;
  type: "home" | "work" | "other";
  name: string;
  details: string;
  area: string;
  city: string;
  isDefault: boolean;
  location: {
    lat: number;
    lng: number;
  };
};

const labels = {
  en: {
    returns: "Free & Easy Returns",
    deals: "Best Deals",
    delivery: "Delivery to",
  },
  ar: {
    returns: "إرجاع مجاني وسهل",
    deals: "أفضل العروض",
    delivery: "التوصيل إلى",
  },
};

const FullHeader: React.FC<AccountPageProps> = () => {
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
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const { products } = useAppSelector((state) => state.cart);
  const { products: wishlistData } = useAppSelector((state) => state.wishlist);
  const session = useSession();
  const router = useRouter();
  const handdleLogin = () => {
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
      <header className="relative z-40">
        <div className="min-h-[70px] w-full bg-white transition-all duration-700 md:bg-primary">
          <div className="relative">
            <div className="container mx-auto p-3 lg:max-w-[1440px]">
              <div className="mb-4 hidden flex-col items-center justify-between gap-6 sm:flex-row md:flex lg:hidden">
                <div className="flex w-full items-center justify-between gap-3 sm:w-fit">
                  <h3 className="flex items-center gap-1 text-xs font-semibold text-white">
                    <RotateCcw size={18} className="shrink-0" />
                    {labels[language].returns}
                  </h3>

                  <h3 className="flex items-center gap-1 text-xs font-semibold text-white">
                    <CirclePercent size={18} className="shrink-0" />
                    {labels[language].deals}
                  </h3>

                  <span
                    className="flex cursor-pointer flex-wrap items-center gap-1 text-xs text-white"
                    onClick={() => setIsModalOpen(true)}
                  >
                    {labels[language].delivery}{" "}
                    <span className="flex items-center gap-1 font-semibold">
                      {selectedAddress?.city} <ChevronDown size={12} />
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => setIsOpen(true)}>
                    <Menu size={18} className="text-gray-600 md:hidden" />
                  </button>
                  {/* Logo */}
                  <div className="flex items-center">
                    <Link
                      href="/"
                      className="flex items-end gap-1 text-xl font-bold text-gray-800"
                    >
                      <LogoIcon className="h-10 w-20 text-primary md:w-28 md:text-white" />
                    </Link>
                  </div>
                  <span
                    className="hidden max-w-20 cursor-pointer text-xs text-white lg:block"
                    onClick={() => setIsModalOpen(true)}
                  >
                    {language === "ar" ? "التسليم إلى" : "Delivery to"}
                    <span className="flex items-center gap-1 font-semibold">
                      {selectedAddress?.city} <ChevronDown size={12} />
                    </span>
                  </span>
                </div>
                {/* search component  */}
                <div className="hidden w-full md:block md:max-w-2xl">
                  <Suspense>
                    <SearchComponent
                      inputClassName="md:border-0 md:text-white border border-gray-200  text-gray-800 md:placeholder:text-white placeholder:text-gray-800"
                      iconClassName="text-gray-800 md:text-white"
                      locale={language}
                    />
                  </Suspense>
                </div>

                {/* Right-side Icons */}
                <div className="flex">
                  <div>
                    <LanguageSwitcher className="text-gray-700 md:text-white" />
                  </div>
                  <div className="hidden md:block">
                    <AuthButton />
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Wishlist Button */}
                    <motion.button
                      onClick={handdleLogin}
                      className="hover:text-primary/80 group relative flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors md:text-white md:hover:text-white/90"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          transition: { duration: 0.5 },
                        }}
                        className="relative p-1"
                      >
                        <Heart
                          size={22}
                          className={`fill-transparent ${
                            productsCountWishlist > 0
                              ? "md:group-hover:fill-primary/20 group-hover:fill-white/20"
                              : ""
                          } transition-colors duration-300`}
                        />

                        <AnimatePresence>
                          {productsCountWishlist > 0 && (
                            <motion.span
                              key="wishlist-badge"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{
                                scale: 1,
                                opacity: 1,
                                rotate: [0, 15, -15, 0],
                              }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 15,
                                rotate: { duration: 0.6 },
                              }}
                              className="ring-primary/20 absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-sm ring-2 md:bg-white md:text-primary md:ring-white/20"
                            >
                              {productsCountWishlist > 9
                                ? "9+"
                                : productsCountWishlist}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </motion.button>

                    {/* Cart Button */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="relative"
                    >
                      <Link
                        href="/cart"
                        className="hover:text-primary/80 group relative flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors md:text-white md:hover:text-white/90"
                      >
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            transition: { duration: 0.5 },
                          }}
                          className="relative p-1"
                        >
                          <ShoppingCart
                            size={22}
                            className="text-primary transition-colors md:text-white"
                          />

                          <AnimatePresence>
                            {productsCount > 0 && (
                              <motion.span
                                key="cart-badge"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                  scale: 1,
                                  opacity: 1,
                                  rotate: [0, 15, -15, 0],
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 15,
                                  rotate: { duration: 0.6 },
                                }}
                                className="ring-primary/20 absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-sm ring-2 md:bg-white md:text-primary md:ring-white/20"
                              >
                                {productsCount > 9 ? "9+" : productsCount}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Underline animation */}
                        <motion.div
                          className="absolute bottom-0 left-0 h-0.5 bg-white"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
              <div className="mt-1 flex flex-col-reverse gap-2">
                <span
                  className="mt-2 flex cursor-pointer items-center gap-1 text-xs text-primary md:hidden md:text-white"
                  onClick={() => setIsModalOpen(true)}
                >
                  <span>
                    <MapPin size={14} />
                  </span>
                  {language === "ar" ? "التسليم إلى" : "Delivery to"}
                  <span className="flex items-center gap-1 font-semibold">
                    {selectedAddress?.city} <ChevronDown size={12} />
                  </span>
                </span>
                {/* search component  */}
                <div className="block w-full flex-1 md:hidden">
                  <Suspense>
                    <SearchComponent
                      inputClassName="md:border-0 md:text-white border border-gray-200  text-gray-800 md:placeholder:text-white placeholder:text-gray-800"
                      iconClassName="text-gray-800 md:text-white"
                      locale={language}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Categories Navigation  */}
        <div className="hidden flex-1 md:block">
          <SwipeableNav locale={language} links={commonLinks} />
        </div>
      </header>
      <div className="relative">
        <DeliverToModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentAddress={selectedAddress}
          onAddressSelect={(address) => {
            setSelectedAddress(address);
            localStorage.setItem("userAddress", JSON.stringify(address));
          }}
          locale={language}
        />
      </div>
      {/* Mobile Navigation */}
      <Drawer
        logo={
          <Link className="block w-fit p-3" href={"/"}>
            <LogoIcon className="h-14 w-28 text-primary md:text-white" />
          </Link>
        }
        position="left"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        locale={language}
      >
        <nav>
          <div className="flex flex-col p-2">
            {commonLinks.map((link, index) => (
              <div
                className="border-b border-gray-100 last-of-type:border-none"
                key={index}
              >
                {/* sublinks links */}
                {link.subLinks && link.subLinks.length > 0 && (
                  <Collapse
                    url={link.url}
                    key={link.title[language]}
                    title={link.title[language]}
                  >
                    <ul>
                      {link.subLinks.map((subLink, subIndex) => (
                        <li
                          className="text-gray-600 transition hover:text-primary"
                          key={subIndex}
                        >
                          <Link
                            className="block p-1 text-xs"
                            href={subLink.url}
                          >
                            {subLink.title[language]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Collapse>
                )}
                {/* grid list links */}
                {link.gridLinks && link.gridLinks.length > 0 && (
                  <Collapse
                    url={link.url}
                    key={link.title[language]}
                    title={link.title[language]}
                  >
                    <div>
                      <ul className="text-xs">
                        {link.gridLinks.map((gridLink, gridIndex) => (
                          <Collapse
                            url={link.url}
                            title={gridLink.heading[language]}
                            key={gridIndex}
                            size="sm"
                            fontSize="sm"
                          >
                            <li>
                              <ul>
                                {gridLink.subLinks.map((link, index) => {
                                  return (
                                    <li key={index}>
                                      <Link
                                        className="block p-2 text-xs text-gray-600 transition hover:text-primary"
                                        href={link.url}
                                      >
                                        {link.title[language]}
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </li>
                          </Collapse>
                        ))}
                      </ul>
                    </div>
                  </Collapse>
                )}
                {/* Normal links */}
                {!link.gridLinks && !link.subLinks && (
                  <ul>
                    <li className="text-gray-600 transition hover:text-main">
                      <Link
                        className="block p-2 text-xs font-semibold text-gray-800"
                        href={link.url}
                      >
                        {link.title[language]}
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            ))}
          </div>
        </nav>
      </Drawer>
      <Modal
        isOpen={isModalLogOpen}
        onClose={() => setIsModalLogOpen(false)}
        size="lg"
      >
        <AuthLogin locale={language} redirect="/account/wishlist" />
      </Modal>
    </>
  );
};

export default FullHeader;
