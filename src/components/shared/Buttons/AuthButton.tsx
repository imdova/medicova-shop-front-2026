import { useSession, signOut } from "next-auth/react";
import { User2, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Modal from "../Modals/DynamicModal";
import AuthLogin from "../Modals/loginAuth";
import { userType } from "@/types/next-auth";
import { menuGroups } from "@/constants/menu";
import { useAppLocale } from "@/hooks/useAppLocale";
import { User } from "next-auth";
import Image from "next/image";

import { getMyProfile } from "@/services/userService";

const AuthButton = () => {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiUserName, setApiUserName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locale = useAppLocale();

  useEffect(() => {
    async function fetchLatestName() {
      if (token) {
        try {
          const profile = await getMyProfile(token);
          setApiUserName(`${profile.firstName} ${profile.lastName}`);
        } catch (err) {
          console.error("Failed to fetch user name:", err);
        }
      }
    }
    fetchLatestName();

    const handleProfileUpdate = () => fetchLatestName();
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [token]);

  const dummyUserData: User = {
    id: session?.user?.id ?? "0",
    name: apiUserName || session?.user?.name || "User",
    email: session?.user?.email || "",
    role: (session?.user?.role as userType) || "user",
    image: session?.user?.image || "",
  };

  const currentMenuGroups = menuGroups[dummyUserData.role];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (session?.user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="mx-2 flex items-center gap-2 border-x px-3 text-sm font-medium text-white backdrop-blur-sm transition-all"
          whileTap={{ scale: 0.95 }}
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
            <User2 size={14} />
          </div>
          <span className="hidden md:inline">
            {dummyUserData?.name?.split(" ")[0]}
          </span>
          {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white/90 p-2 shadow-lg ring-1 ring-black/5 backdrop-blur-xl focus:outline-none"
            >
              <div className="flex items-center gap-3 rounded-lg p-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {dummyUserData.name}
                  </p>
                  {dummyUserData.role !== "user" && (
                    <span className="to-light-primary mt-1 inline-block rounded-full bg-gradient-to-r from-primary px-2 py-0.5 text-[10px] font-medium text-white">
                      {dummyUserData.role.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {currentMenuGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className="my-1 border-t border-gray-100/50"></div>
                  {group.title && (
                    <div className="px-3 py-1.5 text-xs font-medium text-gray-500">
                      {group.title[locale]}
                    </div>
                  )}
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.href}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100/50"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          {Icon && (
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                              <Icon size={16} />
                            </div>
                          )}
                          <span>{item.title[locale]}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              ))}

              <div className="my-1 border-t border-gray-100/50"></div>
              <motion.button
                onClick={async () => {
                  setIsDropdownOpen(false);
                  await signOut({ redirect: false });
                  router.push("/");
                  router.refresh();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                  <LogOut size={16} />
                </div>
                <span>{locale === "ar" ? "تسجيل الخروج" : "Sign out"}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      <motion.a
        // onClick={() => setIsModalOpen(true)}
        href="/signin"
        className="mx-2 flex items-center gap-2 px-3 text-sm font-medium text-white backdrop-blur-sm transition-all"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
          <User2 size={14} />
        </div>
        <span className="hidden md:inline">
          {locale === "ar" ? "تسجيل الدخول" : "Log in"}
        </span>
      </motion.a>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <AuthLogin />
      </Modal>
    </>
  );
};

export default AuthButton;
