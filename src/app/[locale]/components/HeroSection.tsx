import { getTranslations } from "next-intl/server";
import { CategoryType, Slide } from "@/types";

import LandingSlider from "@/components/features/sliders/LandingSlider";
import CategorySlider from "@/components/features/sliders/CategorySlider";

interface HeroSectionProps {
  locale: string;
  direction: "rtl" | "ltr";
  slides: Slide[];
  categories: CategoryType[];
}

export default async function HeroSection({
  locale,
  direction,
  slides,
  categories,
}: HeroSectionProps) {
  const t = await getTranslations("home");

  return (
    <section
      aria-label={t("heroSlider")}
      className="min-h-[250px] sm:min-h-[300px] md:min-h-[500px]"
    >
      <LandingSlider dir={direction} slides={slides} />
      <CategorySlider cardSize="small" categories={categories} />
    </section>
  );
}
