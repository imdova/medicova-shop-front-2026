"use client";
import Link from "next/link";
import { Menu, ShoppingCart } from "lucide-react";
import LogoIcon from "@/assets/icons/logo";
import SearchComponent from "@/components/Forms/formFields/SearchComponent";
import { useAppSelector } from "@/store/hooks";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useEffect, useState } from "react";
import { Drawer } from "@/components/UI/Drawer";
import Sidebar from "@/components/Layout/sidebar/Sidebar";
import { AccountPageProps } from "@/app/(auth)/user/types/account";
import LanguageSwitcher from "@/components/UI/LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

const MinimalHeader: React.FC<AccountPageProps> = ({ user, activeSection }) => {
  const [productsCount, setProductsCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  const { products } = useAppSelector((state) => state.cart);

  useEffect(() => {
    setProductsCount(products.length);
  }, [products]);

  return (
    <>
      <header className="relative z-40">
        <div className="min-h-[70px] w-full bg-primary transition-all duration-700">
          <div className="relative">
            <div className="container mx-auto p-3 lg:max-w-[1440px]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsOpen(true)}>
                    <Menu size={18} className="text-white lg:hidden" />
                  </button>
                  {/* Logo */}
                  <div className="flex items-center">
                    <Link
                      href="/"
                      className="flex items-end gap-1 text-xl font-bold text-gray-800"
                    >
                      <LogoIcon className="h-10 w-20 text-white md:w-28" />
                    </Link>
                  </div>
                </div>
                {/* search component  */}
                <div className="hidden w-full md:block md:max-w-5xl">
                  <Suspense>
                    <SearchComponent
                      inputClassName="border-0 text-white placeholder:text-white"
                      iconClassName="text-white"
                      locale={language}
                    />
                  </Suspense>
                </div>

                {/* Right-side Icons */}
                <div className="flex items-center">
                  <div className="flex items-center gap-4 px-4">
                    <LanguageSwitcher className="!px-0 text-white" />
                    <Link
                      href={"/"}
                      className="flex items-center gap-2 text-sm font-semibold text-white hover:text-gray-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.8}
                        stroke="currentColor"
                        className="h-5 w-5 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 9.75L12 3l9 6.75M4.5 10.5V20a.75.75 0 00.75.75H9a.75.75 0 00.75-.75v-4.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V20a.75.75 0 00.75.75h3.75a.75.75 0 00.75-.75v-9.5"
                        />
                      </svg>
                    </Link>
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
                          <ShoppingCart size={20} className="text-white" />

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
                                className="ring-primary/20 absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs font-bold text-primary shadow-sm ring-2"
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
              {/* search component  */}
              <div className="block w-full md:hidden">
                <Suspense>
                  <SearchComponent
                    inputClassName="border-0 text-white placeholder:text-white"
                    iconClassName="text-white"
                    locale={language}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </header>
      <Drawer position="left" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Sidebar user={user} activeSection={activeSection} />
      </Drawer>
    </>
  );
};

export default MinimalHeader;
