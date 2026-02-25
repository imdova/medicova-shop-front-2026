import { getCategoriesData, getProductsData, getSlidersData } from "@/data";
import PromotionsGrid from "./components/PromotionsGrid";
import CategoryShowcase from "./components/CategoryShowcase";
import HeroSection from "./components/HeroSection";
import RecommendedProducts from "./components/RecommendedProducts";
import ExploreBrands from "./components/ExploreBrands";
import HomePopularSearches from "./components/HomePopularSearches";
import { Locale } from "@/i18n/routing";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const direction = locale === "ar" ? "rtl" : "ltr";

  const {
    allCategories,
    consumableCategories,
    lifestyleCategories,
    equipmentCategories,
  } = getCategoriesData();
  const products = getProductsData();
  const slides = getSlidersData();

  return (
    <div className="relative">
      <HeroSection
        locale={locale}
        direction={direction}
        slides={slides}
        categories={allCategories}
      />

      <PromotionsGrid locale={locale} />

      <RecommendedProducts products={products} locale={locale} />

      <ExploreBrands locale={locale} />

      <CategoryShowcase
        locale={locale}
        titleKey="consumable"
        bestsellersKey="consumableBestsellers"
        categories={consumableCategories}
        products={products}
      />

      <CategoryShowcase
        locale={locale}
        titleKey="lifeStyle"
        bestsellersKey="lifeStyleBestsellers"
        categories={lifestyleCategories}
        products={products}
        bannerImage="/images/banner-7.avif"
      />

      <CategoryShowcase
        locale={locale}
        titleKey="equipment"
        bestsellersKey="equipmentBestsellers"
        categories={equipmentCategories}
        products={products}
      />

      <HomePopularSearches locale={locale} />
    </div>
  );
}
