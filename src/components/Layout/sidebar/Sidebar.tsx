"use client";
import React, { useState } from "react";
import Link from "next/link";
import { sidebarGroups } from "@/constants/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Power, ChevronDown, ChevronUp } from "lucide-react"; // Import ChevronDown and ChevronUp for collapse icons
import { signOut } from "next-auth/react";
import { isCurrentPage } from "@/util";
import { AccountPageProps } from "@/app/(auth)/user/types/account";
import ProfileCompletion from "@/app/(auth)/user/component/ProfileCompletion";
import { useLanguage } from "@/contexts/LanguageContext";

const Sidebar: React.FC<AccountPageProps> = ({ user }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const { isArabic } = useLanguage();

  const groups = sidebarGroups[user.role] || [];

  // Function to toggle the collapse state of an item
  const toggleItem = (itemHref: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [itemHref]: !prev[itemHref],
    }));
  };

  return (
    <aside className="sticky top-6 w-72">
      <div className="rounded-xl border-gray-300 bg-white p-2 lg:border lg:shadow-sm">
        <div className="mb-4">
          <h1 className="text-lg font-bold text-gray-800">
            {user.name || "Hala!"}
          </h1>
          <p className="text-xs text-gray-600">{user.email}</p>
        </div>
        <ProfileCompletion isArabic={isArabic} percentage={40} />
      </div>

      <nav className="mt-4">
        {groups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            {group.title && (
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {isArabic ? group.title.ar : group.title.en}
              </h3>
            )}
            <div className="rounded-xl border-gray-300 bg-white p-2 lg:border lg:shadow-sm">
              {group.description && (
                <p className="mb-3 px-2 text-xs text-gray-500">
                  {group.description}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  // Check if the item has sub-items
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  // Determine if any of its sub-items are currently the active page
                  const isAnySubItemCurrentPage =
                    hasSubItems &&
                    item.subItems?.some((subItem) =>
                      isCurrentPage(pathname, subItem.href),
                    );
                  // Determine if the item should be open (either explicitly opened, or if a sub-item is active)
                  const isOpen =
                    openItems[item.href] || isAnySubItemCurrentPage;
                  // This item is only a direct link if it DOES NOT have sub-items.
                  const isDirectLink = !hasSubItems;

                  return (
                    <li key={item.href}>
                      {/*
                        Conditional rendering:
                        If it has sub-items, it's a button to toggle collapse.
                        Otherwise (if no sub-items), it's a direct link.
                      */}
                      {!isDirectLink ? (
                        <button
                          onClick={() => toggleItem(item.href)}
                          className={`flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm ${
                            isOpen
                              ? "bg-green-50 font-medium text-green-600"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            {isArabic ? item.title.ar : item.title.en}
                          </div>
                          {/* Display appropriate chevron icon based on collapse state */}
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      ) : (
                        // Render a regular Link if it's a direct link (i.e., no sub-items)
                        <Link
                          href={item.href}
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                            isCurrentPage(pathname, item.href)
                              ? "bg-green-50 font-medium text-green-600"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {Icon && <Icon className="h-4 w-4" />}
                          {isArabic ? item.title.ar : item.title.en}
                        </Link>
                      )}

                      {/* Render sub-items only if they exist and the parent item is open */}
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

        <div className="rounded-xl border-gray-300 bg-white p-2 lg:border lg:shadow-sm">
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              router.push("/");
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-red-50"
          >
            <Power className="h-4 w-4" />
            {isArabic ? "تسجيل الخروج" : " Sign out"}
          </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
