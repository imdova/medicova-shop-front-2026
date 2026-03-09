"use client";
import { Brand } from "@/types/index";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FallbackImage from "@/components/shared/FallbackImage";
import { useRef, useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import Link from "next/link";

interface BrandSliderProps {
  brands: Brand[];
  locale?: "en" | "ar";
}

const BrandSlider = ({ brands, locale = "en" }: BrandSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Determine if the layout is RTL based on the locale
  const isRTL = locale === "ar";

  const handleScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;

      if (isRTL) {
        const atStart = Math.abs(scrollLeft) === 0 || scrollLeft === 0; // At the very right end (start of content)
        const atEnd = Math.abs(scrollLeft) >= scrollWidth - clientWidth; // At the very left end (end of content)

        setShowLeftArrow(!atStart); // Show left arrow if not at the beginning (right end of scroll area)
        setShowRightArrow(!atEnd); // Show right arrow if not at the end (left end of scroll area)
      } else {
        // LTR logic remains the same
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
      }
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      // In LTR, "next" means scrolling right (positive scrollLeft).
      // In RTL, "next" (moving to the next item visually) means scrolling left (negative scrollLeft).
      sliderRef.current.scrollBy({
        left: isRTL ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  const handlePrev = () => {
    if (sliderRef.current) {
      // In LTR, "prev" means scrolling left (negative scrollLeft).
      // In RTL, "prev" (moving to the previous item visually) means scrolling right (positive scrollLeft).
      sliderRef.current.scrollBy({
        left: isRTL ? 200 : -200,
        behavior: "smooth",
      });
    }
  };

  const swipeHandlers = useSwipeable({
    // In RTL, swiping left should act like "previous" (show earlier content)
    // and swiping right should act like "next" (show later content)
    onSwipedLeft: () => (isRTL ? handlePrev() : handleNext()),
    onSwipedRight: () => (isRTL ? handleNext() : handlePrev()),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  useEffect(() => {
    const currentRef = sliderRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
      // Initialize arrow visibility on mount
      handleScroll();
    }
    return () => currentRef?.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="rounded-lg bg-white py-6">
      <div className="relative">
        <div
          {...swipeHandlers}
          ref={sliderRef}
          className={`hide-scrollbar flex gap-4 overflow-x-auto scroll-smooth py-2 ${
            isRTL ? "flex-row-reverse" : "" // Ensure content flows from right to left
          }`}
          style={{ scrollbarWidth: "none", direction: isRTL ? "rtl" : "ltr" }} // Set direction for proper scroll behavior
        >
          {brands.map((brand, index) => {
            const localizedSlug =
              (isRTL && brand.slugAr ? brand.slugAr : brand.slug) || brand.id;
            return (
              <Link
                key={index}
                href={`/products?brand=${localizedSlug}`}
                className="hover:ring-primary/20 group flex h-[100px] w-[260px] flex-shrink-0 cursor-pointer items-center gap-3 overflow-hidden rounded-[20px] bg-white p-2 shadow-sm ring-1 ring-gray-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative h-full w-[80px] shrink-0 overflow-hidden rounded-2xl bg-gray-50/50 p-2 ring-1 ring-inset ring-gray-100/50">
                  <FallbackImage
                    className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110 group-hover:drop-shadow-sm"
                    src={brand.image}
                    fill
                    alt={brand.name[locale]}
                    sizes="80px"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center px-1">
                  <div className="line-clamp-2 text-sm font-bold leading-tight text-gray-800 transition-colors duration-200 group-hover:text-primary">
                    {brand.name[locale]}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Arrow buttons need to be positioned correctly based on LTR/RTL */}
        {showLeftArrow && (
          <button
            onClick={isRTL ? handleNext : handlePrev} // In RTL, "left" button triggers "next" scroll
            className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/80 shadow-sm hover:bg-white/90 md:flex ${
              isRTL ? "right-2" : "left-2" // Position for RTL or LTR
            }`}
            aria-label={isRTL ? "Next categories" : "Previous categories"} // Adjust aria-label
            style={{ backdropFilter: "blur(4px)" }}
          >
            {isRTL ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        )}

        {showRightArrow && (
          <button
            onClick={isRTL ? handlePrev : handleNext} // In RTL, "right" button triggers "prev" scroll
            className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/80 shadow-sm hover:bg-white/90 md:flex ${
              isRTL ? "left-2" : "right-2" // Position for RTL or LTR
            }`}
            aria-label={isRTL ? "Previous categories" : "Next categories"} // Adjust aria-label
            style={{ backdropFilter: "blur(4px)" }}
          >
            {isRTL ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
          </button>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default BrandSlider;
