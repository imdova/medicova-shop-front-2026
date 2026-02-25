"use client";
import { Pagination } from "@/components/shared/Pagination";
import { Banner } from "@/components/features/Banner";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";
import { ArrowLeft, ArrowRight } from "lucide-react";
import ProductCard from "@/components/features/cards/ProductCard";
import DynamicOffers from "@/components/features/DynamicOffers";
import CategorySlider from "@/components/features/sliders/CategorySlider";
import ProductsSlider from "@/components/features/sliders/ProductsSlider";
import { products } from "@/data";
import { useGetProductsByCategory } from "@/hooks/useGetProductsByCategory";
import { MultiCategory, Offer } from "@/types";
import FallbackImage from "@/components/shared/FallbackImage";
import { useSearchParams } from "next/navigation";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface RenderComponentProps {
  category: MultiCategory;
}

const offers: Offer[] = [
  {
    id: "1",
    imgUrl:
      "https://f.nooncdn.com/mpcms/EN0003/assets/2619cd3c-53f7-4dc4-b673-c625a66635da.png",
    url: "#",
    title: { en: "Lighting & Tables", ar: "الإضاءة والطاولات" },
  },
  {
    id: "2",
    imgUrl:
      "https://f.nooncdn.com/mpcms/EN0003/assets/6eb26ed8-d890-482f-87d2-747192a54bde.png",
    url: "#",
    title: { en: "Vases & Dried Grass", ar: "المزهريات والعشب المجفف" },
  },
  {
    id: "3",
    imgUrl:
      "https://f.nooncdn.com/mpcms/EN0003/assets/e1669466-2228-4ad0-b74c-4c6e910bd6fe.png",
    url: "#",
    title: { en: "Plants & Area Rugs", ar: "النباتات والسجاد" },
  },
  {
    id: "4",
    imgUrl:
      "https://f.nooncdn.com/mpcms/EN0003/assets/e74aaced-bcab-43b9-a46c-e58fbe6c45af.png",
    url: "#",
    title: { en: "Relaxscent Candles", ar: "شموع الاسترخاء" },
  },
  {
    id: "5",
    imgUrl:
      "https://f.nooncdn.com/mpcms/EN0003/assets/06631ad1-b2eb-4581-ad81-79e5d44431d1.png",
    url: "#",
    title: { en: "Kitchen Storage & Mugs", ar: "تخزين المطبخ والأكواب" },
  },
  {
    id: "6",
    imgUrl:
      "https://f.nooncdn.com/mpcms/EN0003/assets/81cdb1bb-34da-44a5-bdfb-d6af516baaf2.png",
    url: "#",
    title: { en: "Home Essentials", ar: "أساسيات المنزل" },
  },
];

export default function RenderComponent({ category }: RenderComponentProps) {
  const searchParams = useSearchParams();
  const locale = useAppLocale();
  const t = useTranslations();
  const isArabic = locale === "ar";

  const categorySlugParam = searchParams.get("categorySlug");
  const slug = categorySlugParam ?? undefined; // Ensure it’s string | undefined

  // Get current page from URL or default to 1
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
      <div className="relative mb-8 h-[160px] w-full sm:h-[220px] md:h-[535px]">
        {/* Full-width premium Cover Category  */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-gray-900/10" />
        <FallbackImage
          src={category.cover ?? "/images/placeholder.jpg"}
          fill
          priority
          sizes="100vw"
          alt={`${category.title} Cover`}
        />
      </div>
      <div className="container mx-auto px-4 lg:max-w-[98%]">
        {category.subCategories && (
          <CategorySlider
            locale={locale}
            path={`${category.slug}`}
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
              href="#"
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
        {offers && (
          <DynamicOffers locale={locale} offers={offers} category={category} />
        )}
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
                      href="#"
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
