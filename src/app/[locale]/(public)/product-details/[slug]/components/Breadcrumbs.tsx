"use client";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import { useTranslations } from "next-intl";

interface BreadcrumbsProps {
  product: Product;
  locale: "en" | "ar";
}

import { LocalizedTitle } from "@/types/language";

import { useLocale } from "next-intl";

const Breadcrumbs = ({ product, locale }: BreadcrumbsProps) => {
  const t = useTranslations("common");
  const Chevron =
    locale === "ar" ? (
      <ChevronLeft className="h-3 w-3 text-secondary" />
    ) : (
      <ChevronRight className="h-3 w-3 text-secondary" />
    );

  return (
    <nav aria-label="Breadcrumb" className="bg-white px-4 py-2">
      <div className="container mx-auto">
        <ol className="flex flex-wrap items-center gap-2 py-2 text-xs text-gray-600 md:flex-nowrap md:gap-y-0 md:text-sm">
          <li className="flex items-center gap-2">
            <Link href="/" className="whitespace-nowrap hover:text-primary">
              {t("home")}
            </Link>
            {Chevron}
          </li>

          <li className="flex items-center gap-2">
            <Link
              href={product.category?.slug ?? "#"}
              className="whitespace-nowrap hover:text-primary"
            >
              {product.category?.title[locale as keyof LocalizedTitle]}
            </Link>
            {product.category?.subcategory && Chevron}
          </li>

          {product.category?.subcategory && (
            <li className="flex items-center gap-1">
              <Link
                href={product.category.subcategory.url ?? "#"}
                className="whitespace-nowrap font-medium text-gray-900"
                aria-current="page"
              >
                {
                  product.category.subcategory.title[
                    locale as keyof LocalizedTitle
                  ]
                }
              </Link>
            </li>
          )}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
