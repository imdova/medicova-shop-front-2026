"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isCurrentPage } from "@/util";
import { NavbarLinks } from "@/constants/navbar";
import { useAppSelector } from "@/store/hooks";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "@/components/UI/Modals/DynamicModal";
import AuthLogin from "@/components/UI/Modals/loginAuth";
import { NavLink } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const session = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { products } = useAppSelector((state) => state.cart);
  const [productsCount, setProductsCount] = useState(0);
  const { language } = useLanguage();

  useEffect(() => {
    setProductsCount(products.length);
  }, [products]);

  // Get the appropriate links based on user role
  const getNavLinks = () => {
    if (!session.data?.user) return NavbarLinks.user; // Default for non-logged in users

    switch (session.data.user.role) {
      case "seller":
        return NavbarLinks.seller;
      case "admin":
        return NavbarLinks.admin;
      default:
        return NavbarLinks.user;
    }
  };

  const currentLinks = getNavLinks();

  const handleClick = (link: NavLink) => {
    if (link.name["en"] === "Account") {
      if (session.data?.user) {
        router.push(link.path);
      } else {
        setIsModalOpen(true);
      }
    } else {
      router.push(link.path);
    }
  };

  return (
    <nav
      style={{ boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }}
      className="fixed bottom-0 z-50 w-full bg-white md:hidden"
    >
      <div className="flex h-16 items-center justify-around">
        {currentLinks.map((link) => {
          const CurrentPage = isCurrentPage(pathname, link.path);
          const IconComponent = link.icon;

          if (link.name["en"] === "Account") {
            return (
              <button
                key={link.name[language]}
                onClick={() => handleClick(link)}
                className={`flex h-full w-full flex-col items-center justify-center ${
                  CurrentPage ? "text-primary" : "text-gray-600"
                }`}
              >
                <div
                  className={`relative rounded-full p-2 ${
                    CurrentPage ? "bg-green-50" : ""
                  }`}
                >
                  {IconComponent && <IconComponent size={18} />}
                </div>
                <span className="text-xs font-semibold">
                  {link.name[language]}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={link.name[language]}
              href={link.path}
              className={`flex h-full w-full flex-col items-center justify-center ${
                CurrentPage ? "text-primary" : "text-gray-600"
              }`}
            >
              <div
                className={`relative rounded-full p-2 ${
                  CurrentPage ? "bg-green-50" : ""
                }`}
              >
                {IconComponent && <IconComponent size={18} />}
                {link.name["en"] === "Cart" && (
                  <AnimatePresence>
                    {productsCount > 0 && (
                      <motion.span
                        key="cart-badge"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white"
                      >
                        {productsCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                )}
              </div>
              <span className="text-xs font-semibold">
                {link.name[language]}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Modal for login */}
      <div className="relative z-[1000]">
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <AuthLogin locale={language} redirect={"/account"} />
        </Modal>
      </div>
    </nav>
  );
};

export default Navbar;
