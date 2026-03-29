"use client";
import React, { useState } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { sidebarGroups } from "@/constants/sidebar";
import { Power, ChevronDown, ChevronUp } from "lucide-react";
import { signOut } from "next-auth/react";
import { isCurrentPage } from "@/util";
import { AccountPageProps } from "@/app/[locale]/(auth)/user/types/account";
import { useAppLocale } from "@/hooks/useAppLocale";

const Sidebar: React.FC<AccountPageProps> = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  const groups = sidebarGroups[user.role] || [];

  // Function to toggle the collapse state of an item
  const toggleItem = (itemHref: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [itemHref]: !prev[itemHref],
    }));
  };

  return (
    <aside className="sticky top-8 w-60">
      <nav>
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            {group.title && (
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {isArabic ? group.title.ar : group.title.en}
              </h3>
            )}
            <div className="rounded-[1.5rem] border border-white/60 bg-white/60 p-2 shadow-lg shadow-gray-100/50 backdrop-blur-md">
              {group.description && (
                <p className="mb-3 px-3 text-xs font-medium uppercase leading-relaxed tracking-widest text-gray-400">
                  {group.description}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const hasSubItems = item.subItems && item.subItems.length > 0;
             
                  const isAnySubItemCurrentPage =
                    hasSubItems &&
                    item.subItems?.some((subItem) =>
                      isCurrentPage(pathname, subItem.href),
                    );
  
                  const isOpen =
                    openItems[item.href] || isAnySubItemCurrentPage;
   
                  const isDirectLink = !hasSubItems;

                  return (
                    <li key={item.href}>
  
                      {!isDirectLink ? (
                        <button
                          onClick={() => toggleItem(item.href)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                            isOpen
                              ? "shadow-primary/20 bg-primary font-bold text-white shadow-lg"
                              : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {Icon && (
                              <Icon
                                className={`h-[18px] w-[18px] ${isOpen ? "text-white" : "text-gray-400"}`}
                              />
                            )}
                            {isArabic ? item.title.ar : item.title.en}
                          </div>
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                            isCurrentPage(pathname, item.href)
                              ? "shadow-primary/20 bg-primary font-bold text-white shadow-lg"
                              : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-md"
                          }`}
                        >
                          {Icon && (
                            <Icon
                              className={`h-[18px] w-[18px] ${isCurrentPage(pathname, item.href) ? "text-white" : "text-gray-400"}`}
                            />
                          )}
                          {isArabic ? item.title.ar : item.title.en}
                        </Link>
                      )}

                
                      {hasSubItems && isOpen && (
                        <ul className="ml-4 mt-1 space-y-1 border-l border-gray-100 pl-3">
                          {item.subItems?.map((subItem, subIndex) => {
                            const Icon = subItem.icon;
                            const isCurrentSubPage = isCurrentPage(
                              pathname,
                              subItem.href,
                            );
                            return (
                              <li key={subIndex}>
                                <Link
                                  href={subItem.href}
                                  className={`flex items-center gap-2 rounded px-3 py-1.5 text-sm ${
                                    isCurrentSubPage
                                      ? "font-medium text-green-600"
                                      : "text-gray-600 hover:text-gray-800"
                                  }`}
                                >
                                  {Icon && <Icon className="h-3.5 w-3.5" />}
                                  {isArabic
                                    ? subItem.title.ar
                                    : subItem.title.en}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-white/60 bg-white/40 p-2 shadow-lg shadow-gray-100/50 backdrop-blur-md">
          <button
            onClick={async () => {
              await signOut({ callbackUrl: `/${locale}/signin` });
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 transition-all duration-300 hover:bg-rose-50 hover:text-rose-600 hover:shadow-inner"
          >
            <Power className="h-[18px] w-[18px]" />
            {isArabic ? "تسجيل الخروج" : " Sign out"}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
