import { getTranslations } from "next-intl/server";
import SectionHeader from "@/components/features/headings/SectionHeader";
import ProductsSlider from "@/components/features/sliders/ProductsSlider";
import ProductCard from "@/components/features/cards/ProductCard";
import { Banner } from "@/components/features/Banner";
import { Product } from "@/types/product";
import type { Locale } from "@/i18n/routing";

interface RecommendedProductsProps {
  products: Product[];
}

export default async function RecommendedProducts({
  products,
  locale,
}: {
  products: Product[];
  locale: Locale;
}) {
  const t = await getTranslations("home");

  return (
    <section
      className="bg-gradient-to-b from-gray-50/50 to-white py-10"
      aria-label={`${t("recommended")} ${t("forYou")}`}
    >
      <div className="container mx-auto  ">
        <SectionHeader blackText={t("recommended")} greenText={t("forYou")} />
        <ProductsSlider>
          {products.slice(0, 10).map((product) => (
            <div
              key={product.id}
              className="w-[200px] flex-shrink-0 px-1 py-4 md:w-[240px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </ProductsSlider>
        <div className="mt-8 overflow-hidden rounded-2xl shadow-sm ring-1 ring-gray-100">
          <Banner image="/images/banner-6.jpg" url="#" />
        </div>
      </div>
    </section>
  );
}
