import { getTranslations } from "next-intl/server";
import CategoryCard from "@/components/features/cards/CategoryCard";
import ProductCard from "@/components/features/cards/ProductCard";
import ProductsSlider from "@/components/features/sliders/ProductsSlider";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";
import { Banner } from "@/components/features/Banner";
import type { Locale } from "@/i18n/routing";
import { CategoryType } from "@/types";
import { Product } from "@/types/product";

type CategoryShowcaseProps = {
  locale: Locale;
  titleKey: string;
  bestsellersKey: string;
  categories: CategoryType[];
  products: Product[];
  bannerImage?: string;
};

export default async function CategoryShowcase({
  locale,
  titleKey,
  bestsellersKey,
  categories,
  products,
  bannerImage,
}: CategoryShowcaseProps) {
  const t = await getTranslations("home");
  const commonT = await getTranslations("common");

  return (
    <section className="bg-gradient-to-b from-gray-50/50 to-white py-12">
      <div className="container mx-auto px-4 lg:max-w-[98%]">
        {/* Category Header */}
        <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
            {t(titleKey)}
          </h2>
          <DynamicButton
            size="sm"
            variant="outline"
            href={`/search/${titleKey}`}
            label={commonT("shopAll")}
            className="rounded-full px-6 font-medium text-gray-700 hover:bg-primary hover:text-white"
          />
        </div>

        {/* Category Grid */}
        <div className="mb-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.slice(0, 6).map((category) => (
            <CategoryCard
              locale={locale}
              key={category.id}
              category={category}
            />
          ))}
        </div>

        {/* Bestsellers Header */}
        <div>
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl lg:text-3xl">
              {t(bestsellersKey)}
            </h2>
            <DynamicButton
              size="sm"
              variant="outline"
              href={`/search/${bestsellersKey}`}
              label={commonT("shopNow")}
              className="rounded-full px-6 font-medium text-gray-700 hover:bg-primary hover:text-white"
            />
          </div>

          <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-100/50">
            <ProductsSlider>
              {products.slice(0, 10).map((product) => (
                <div
                  key={product.id}
                  className="w-[180px] flex-shrink-0 md:w-[240px]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </ProductsSlider>
          </div>

          {bannerImage && (
            <div className="mt-8 overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-lg">
              <Banner image={bannerImage} url="#" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
