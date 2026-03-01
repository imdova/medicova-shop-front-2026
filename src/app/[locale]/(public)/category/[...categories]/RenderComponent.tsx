"use client";
import { Pagination } from "@/components/shared/Pagination";
import { Banner } from "@/components/features/Banner";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/features/cards/ProductCard";
import CategorySlider from "@/components/features/sliders/CategorySlider";
import ProductsSlider from "@/components/features/sliders/ProductsSlider";
import { products } from "@/data";
import { useGetProductsByCategory } from "@/hooks/useGetProductsByCategory";
import { MultiCategory } from "@/types";
import { useSearchParams } from "next/navigation";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface RenderComponentProps {
  category: MultiCategory;
  fullPath?: string;
}

export default function RenderComponent({
  category,
  fullPath,
}: RenderComponentProps) {
  const searchParams = useSearchParams();
  const locale = useAppLocale();
  const t = useTranslations();
  const isArabic = locale === "ar";

  const categorySlugParam = searchParams.get("categorySlug");
  const slug = categorySlugParam ?? undefined;

  const pageParam = searchParams.get("page");
  const currentPage = pageParam ? Number(pageParam) : 1;
  const itemsPerPage = 12;

  const { productsData, totalProducts } = useGetProductsByCategory({
    categorySlug: slug,
    page: currentPage,
    limit: itemsPerPage,
  });

  const isSingleCategory =
    !category.subCategories || category.subCategories.length === 0;
  return (
    <>
      <div className="container mx-auto px-4 lg:max-w-[98%]">
        {category.subCategories && (
          <CategorySlider
            locale={locale}
            path={fullPath}
            cardSize="large"
            inCategory
            categories={category.subCategories}
          />
        )}

        <div className="my-4">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold sm:text-2xl">
              {t("home.shopFavorite")} {category.title[locale]}
            </h2>
            <Link
              href={`/category/${fullPath}`}
              className="bg-primary/10 hover:bg-primary/20 group flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-primary transition-colors"
            >
              <span>{t("common.shopNow")}</span>
              {isArabic ? (
                <ArrowLeft
                  size={16}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
              ) : (
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </Link>
          </div>
          <ProductsSlider>
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[200px] flex-shrink-0 px-1 py-4 md:w-[240px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </ProductsSlider>
        </div>
        <div className="my-6">
          <Banner
            image={category.banner?.image ?? "/images/placeholder.jpg"}
            url={category.banner?.url ?? "#"}
          />
        </div>

        <div>
          {category.subCategories &&
            category.subCategories.map((category) => {
              return (
                <div key={category.id} className="my-4">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-lg font-bold sm:text-2xl">
                      {category.title[locale]}
                    </h2>
                    <Link
                      href={`/category/${fullPath}/${isArabic ? category.slugAr || category.slug : category.slug}`.replace(
                        /\/+/g,
                        "/",
                      )}
                      className="bg-primary/10 hover:bg-primary/20 group flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold text-primary transition-colors"
                    >
                      <span>{t("common.shopNow")}</span>
                      {isArabic ? (
                        <ArrowLeft
                          size={16}
                          className="transition-transform duration-300 group-hover:-translate-x-1"
                        />
                      ) : (
                        <ArrowRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                      )}
                    </Link>
                  </div>
                  <ProductsSlider>
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="w-[200px] flex-shrink-0 px-1 py-4 md:w-[240px]"
                      >
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </ProductsSlider>
                </div>
              );
            })}
        </div>
        {isSingleCategory && (
          <div className="my-4">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold uppercase sm:text-2xl">
                {t("home.shopAllIn")} {category.title[locale]}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {productsData.map((product) => (
                <div key={product.id} className="w-full flex-shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {/* Add Pagination */}
            <Pagination
              totalItems={totalProducts}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
            />
          </div>
        )}
      </div>
    </>
  );
}
