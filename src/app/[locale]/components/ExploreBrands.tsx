import { getTranslations } from "next-intl/server";
import SectionHeader from "@/components/features/headings/SectionHeader";
import type { Locale } from "@/i18n/routing";
import { brands } from "@/data";
import BrandSlider from "@/components/features/sliders/BrandSlider";

interface ExploreBrandsProps {
  locale: string;
}

export default async function ExploreBrands({ locale }: { locale: Locale }) {
  const t = await getTranslations("home");

  return (
    <section
      className="border-t border-gray-50 bg-white py-10"
      aria-label={t("exploreBrands")}
    >
      <div className="container mx-auto px-4 lg:max-w-[98%]">
        <SectionHeader
          blackText={t("exploreBrands")}
          greenText={t("officialBrandStores")}
        />
        <BrandSlider brands={brands} locale={locale as any} />
      </div>
    </section>
  );
}
