"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ShieldCheck, User as UserIcon } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const t = useTranslations("seller_profile");

  return (
    <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative h-24 w-24 flex-shrink-0"
      >
        <div className="h-full w-full overflow-hidden rounded-[2rem] border-4 border-white bg-gray-100 shadow-2xl shadow-gray-200/50">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-900 text-white">
              <UserIcon size={32} />
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-1.5 text-white shadow-lg ring-4 ring-white">
          <ShieldCheck size={14} strokeWidth={3} />
        </div>
      </motion.div>

      <div className="flex-1 space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-gray-900">
          {t("title")}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-gray-500">
          <span className="font-bold text-gray-900">{user.name}</span>
          <span className="h-1 w-1 rounded-full bg-gray-300" />
          <span>{user.email}</span>
        </div>
      </div>
    </header>
  );
};
