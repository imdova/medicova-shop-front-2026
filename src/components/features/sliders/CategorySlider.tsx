"use client";

import { useRef, useState, useEffect } from "react";
import FallbackImage from "@/components/shared/FallbackImage";
import { MultiCategory } from "@/types";
import { LocalizedTitle } from "@/types/language";
import { LanguageType } from "@/util/translations";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type CardSize = "small" | "medium" | "large";
type DisplayMode = "default" | "numbered";

type CategorySliderProps = {
  categories?: MultiCategory[];
  inCategory?: boolean;
  cardSize?: CardSize;
  displayMode?: DisplayMode;
  path?: string;
  locale?: string;
};

const CategorySlider: React.FC<CategorySliderProps> = ({
  categories = [],
  inCategory = false,
  cardSize = "medium",
  displayMode = "default",
  path,
  locale: propLocale,
}) => {
  const t = useTranslations("common");
  const currentLocale = useLocale() as LanguageType;
  const locale = (propLocale as LanguageType) || currentLocale;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position to show/hide arrow buttons
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

      const maxScroll = scrollWidth - clientWidth;

      if (locale === "ar") {
        setCanScrollRight(Math.abs(scrollLeft) < maxScroll - 2);
        setCanScrollLeft(Math.abs(scrollLeft) > 0);
      } else {
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < maxScroll - 2);
      }
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories, locale]);

  const scrollByAmount = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8;

      let modifier = 1;
      if (locale === "ar") {
        if (direction === "left") modifier = -1;
        else modifier = 1;
      } else {
        if (direction === "left") modifier = -1;
        else modifier = 1;
      }

      scrollContainerRef.current.scrollBy({
        left: scrollAmount * modifier,
        behavior: "smooth",
      });
    }
  };

  const getCardClasses = () => {
    switch (cardSize) {
      case "large":
        return {
          wrapper: "min-w-[120px] sm:min-w-[140px] md:min-w-[160px] w-fit",
          pill: "h-[160px] sm:h-[190px] md:h-[220px]",
          imageContainer: "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28",
          title: "text-xs sm:text-sm",
          number: "text-lg sm:text-xl",
        };
      case "small":
        return {
          wrapper: "min-w-[80px] sm:min-w-[90px] md:min-w-[100px] w-fit",
          pill: "h-[120px] sm:h-[130px] md:h-[140px]",
          imageContainer: "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16",
          title: "text-[9px] sm:text-[10px]",
          number: "text-sm sm:text-base",
        };
      case "medium":
      default:
        return {
          wrapper: "min-w-[100px] sm:min-w-[110px] md:min-w-[120px] w-fit",
          pill: "h-[140px] sm:h-[150px] md:h-[160px]",
          imageContainer: "h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20",
          title: "text-[10px] sm:text-xs",
          number: "text-base sm:text-lg",
        };
    }
  };

  const css = getCardClasses();

  if (!categories || categories.length === 0) return null;

  return (
    <div
      className="container relative mx-auto py-6 lg:max-w-[98%]"
      dir={locale === "ar" ? "rtl" : "ltr"}
      aria-roledescription="carousel"
      role="region"
      aria-label={t("storeCategories")}
    >
      {/* Navigation Arrows */}
      {((locale === "en" && canScrollLeft) ||
        (locale === "ar" && canScrollRight)) && (
        <button
          onClick={() => scrollByAmount("left")}
          className={`absolute ${locale === "ar" ? "right-2" : "left-2"} top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary md:flex`}
          aria-label={t("previousCategories")}
        >
          {locale === "ar" ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      )}

      {((locale === "en" && canScrollRight) ||
        (locale === "ar" && canScrollLeft)) && (
        <button
          onClick={() => scrollByAmount("right")}
          className={`absolute ${locale === "ar" ? "left-2" : "right-2"} top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all hover:bg-gray-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary md:flex`}
          aria-label={t("nextCategories")}
        >
          {locale === "ar" ? (
            <ChevronLeft size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>
      )}

      {/* Slider Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="no-scrollbar flex w-full snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-2 pb-6 pt-4 sm:gap-4 sm:px-4"
      >
        {categories.map((category, index) => {
          const currentCategorySlug =
            locale === "ar" ? category.slugAr || category.slug : category.slug;

          let href: string;
          if (inCategory && path) {
            href = `/category/${path}/${currentCategorySlug}`;
          } else {
            href = `/category/${currentCategorySlug}`;
          }

          // Ensure no double slashes and no trailing slash for consistency
          href = href.replace(/\/+/g, "/");

          return (
            <div
              key={`${category.id}-${index}`}
              className={`flex shrink-0 snap-center justify-center ${css.wrapper} group`}
            >
              <Link
                href={href}
                className="relative flex w-full flex-col items-center justify-start outline-none transition-transform duration-300 ease-out group-hover:-translate-y-1 group-hover:scale-105"
                prefetch={false}
              >
                <div
                  className={`relative mb-3 flex items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.06),inset_0_-8px_16px_rgba(0,0,0,0.02)] ring-1 ring-gray-100 transition-all duration-300 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.1),inset_0_-8px_16px_rgba(0,0,0,0.02)] ${css.imageContainer}`}
                >
                  <div className="pointer-events-none absolute left-[15%] top-[10%] h-[30%] w-[30%] rounded-full bg-white/60 blur-[3px]" />
                  <div className="pointer-events-none absolute bottom-0 h-[20%] w-[80%] rounded-full bg-black/[0.03] blur-[4px]" />

                  {displayMode === "numbered" ? (
                    <span
                      className={`font-bold text-gray-800 ${css.number} z-10`}
                    >
                      {index + 1}
                    </span>
                  ) : (
                    <div className="relative z-10 flex h-[80%] w-[80%] items-center justify-center">
                      <FallbackImage
                        className="rounded-full mix-blend-multiply drop-shadow-sm"
                        src={category.image}
                        fill
                        sizes="(max-width: 640px) 25vw, (max-width: 1024px) 15vw, 10vw"
                        alt={category.title[locale as keyof LocalizedTitle]}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {category.isSale && (
                    <div className="absolute -bottom-2 z-30 whitespace-nowrap rounded-full bg-red-600 px-3 py-0.5 text-[10px] font-bold tracking-widest text-white shadow-md ring-2 ring-white">
                      {t("sale")}
                    </div>
                  )}
                </div>

                <div className="flex w-full items-start justify-center px-1">
                  <h3
                    className={`text-center font-medium leading-tight tracking-wide text-gray-700 transition-colors duration-300 group-hover:text-primary ${css.title} whitespace-normal`}
                  >
                    {category.title[locale as keyof LocalizedTitle]}
                  </h3>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySlider;
