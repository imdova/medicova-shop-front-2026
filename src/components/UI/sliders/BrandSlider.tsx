import { brands } from "@/constants/brands";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";

const BrandSlider = ({ locale = "en" }: { locale: "en" | "ar" }) => {
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
          {brands.map((brand, index) => (
            <div
              key={index}
              className="flex h-28 w-[270px] flex-shrink-0 items-center gap-4 overflow-hidden rounded-lg border border-gray-200 transition-all hover:shadow-md"
            >
              <Image
                className="h-full w-28 object-cover"
                src={brand.image}
                width={300}
                height={300}
                alt={brand.name[locale]}
              />
              <div>
                <div className="line-clamp-2 text-sm font-semibold">
                  {brand.name[locale]}
                </div>
                {brand.hasStore && (
                  <button className="mt-1 flex items-center gap-1 text-xs font-medium text-blue-500">
                    {locale === "ar" ? "قم بزيارة المتجر" : "Visit the store"}{" "}
                    {locale === "ar" ? (
                      <ArrowLeft size={13} />
                    ) : (
                      <ArrowRight size={13} />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
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
