"use client";

import { useState } from "react";
import { Search, Folder, FolderOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { megaMenuCategories } from "@/constants/categouries";
import { Checkbox } from "@/components/UI/Check-Box";

type Category = {
  id: string;
  slug: string;
  title: Record<string, string>;
  subCategories?: Category[];
};

export const CategoriesSelector = ({
  value,
  onChange,
}: {
  value: string[];
  onChange: (categories: string[]) => void;
}) => {
  const { language } = useLanguage();
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    if (value.includes(categoryId)) {
      onChange(value.filter((id) => id !== categoryId));
    } else {
      onChange([...value, categoryId]);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const t = {
    en: {
      search: "Search categories...",
      select_all: "Select All",
      deselect_all: "Deselect All",
    },
    ar: {
      search: "بحث في الفئات...",
      select_all: "تحديد الكل",
      deselect_all: "إلغاء الكل",
    },
  }[language];

  const filterCategories = (categories: Category[]): Category[] => {
    return categories
      .map((cat) => {
        const matches = cat.title[language]
          .toLowerCase()
          .includes(search.toLowerCase());
        const sub = cat.subCategories
          ? filterCategories(cat.subCategories)
          : [];

        if (matches || sub.length > 0) {
          return { ...cat, subCategories: sub };
        }
        return null;
      })
      .filter(Boolean) as Category[];
  };

  const filtered = filterCategories(megaMenuCategories);

  const renderCategories = (categories: Category[], level = 0) => (
    <div className="space-y-1">
      {categories.map((cat) => {
        const hasChildren = cat.subCategories && cat.subCategories.length > 0;
        const isOpen = expanded[cat.id] || false;

        return (
          <div key={cat.id}>
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${level * 16}px` }}
            >
              {hasChildren && (
                <button
                  type="button"
                  onClick={() => toggleExpand(cat.id)}
                  className="p-1"
                >
                  {isOpen ? (
                    <FolderOpen className="h-4 w-4 text-yellow-600" />
                  ) : (
                    <Folder className="h-4 w-4 text-yellow-600" />
                  )}
                </button>
              )}

              <Checkbox
                checked={value.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
              <span>{cat.title[language]}</span>
            </div>

            {hasChildren && isOpen && (
              <div className="mt-1">
                {renderCategories(cat.subCategories!, level + 1)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Search + Select All */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500" />
          <Input
            placeholder={t.search}
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange(
              filtered.flatMap(function getIds(c): string[] {
                return [
                  c.id,
                  ...(c.subCategories ? c.subCategories.flatMap(getIds) : []),
                ];
              }),
            )
          }
        >
          {t.select_all}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([])}
        >
          {t.deselect_all}
        </Button>
      </div>

      {/* Categories Tree */}
      <div className="max-h-60 overflow-y-auto rounded-md border p-2">
        {renderCategories(filtered)}
      </div>
    </div>
  );
};
