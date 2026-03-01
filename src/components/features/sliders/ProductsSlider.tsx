"use client";
import { useRef, useState, useEffect, ReactNode } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { useAppLocale } from "@/hooks/useAppLocale";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductsSliderProps = {
  children: ReactNode;
};

const ProductsSlider: React.FC<ProductsSliderProps> = ({ children }) => {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const locale = useAppLocale();
  const isRTL = locale === "ar";

  // Handle scroll to update arrow visibility
  const updateArrows = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;

      // Safety threshold
      const threshold = 10;

      if (isRTL) {
        // RTL scroll behavior varies by browser, but usually 0 is far right.
        // We use Math.abs to handle negative scrollLeft (Chrome/Safari/Firefox standard)
        const absScroll = Math.abs(scrollLeft);
        const isAtStart = absScroll <= threshold;
        const isAtEnd = absScroll >= scrollWidth - clientWidth - threshold;

        // In RTL:
        // Right arrow (go back right) is visible if we are NOT at start
        // Left arrow (go further left) is visible if we are NOT at end
        setShowRightArrow(!isAtStart);
        setShowLeftArrow(!isAtEnd);
      } else {
        setShowLeftArrow(scrollLeft > threshold);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - threshold);
      }
    }
  };

  // Handle navigation
  const handleScrollBy = (direction: "next" | "prev") => {
    if (sliderRef.current) {
      const clientWidth = sliderRef.current.clientWidth;
      const scrollAmount = clientWidth * 0.75; // Scroll 75% of visible area

      let moveAmount = direction === "next" ? scrollAmount : -scrollAmount;

      // Adjust for RTL: "next" (further left) is negative moveAmount
      if (isRTL) {
        moveAmount = direction === "next" ? -scrollAmount : scrollAmount;
      }

      sliderRef.current.scrollBy({
        left: moveAmount,
        behavior: "smooth",
      });
    }
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleScrollBy(isRTL ? "prev" : "next"),
    onSwipedRight: () => handleScrollBy(isRTL ? "next" : "prev"),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  // Effect to sync arrows
  useEffect(() => {
    updateArrows();
    const currentRef = sliderRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", updateArrows);
      window.addEventListener("resize", updateArrows);
    }

    // Delayed check for dynamic content
    const timer = setTimeout(updateArrows, 600);

    return () => {
      currentRef?.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
      clearTimeout(timer);
    };
  }, [children]);

  return (
    <div
      className="group relative w-full px-4 md:px-12"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Slider container */}
      <div {...swipeHandlers} className="relative w-full overflow-hidden">
        <div
          ref={sliderRef}
          className="hide-scrollbar flex w-full gap-6 overflow-x-auto scroll-smooth py-6 transition-all"
        >
          {children}
        </div>
      </div>

      {/* Navigation arrows */}
      <AnimatePresence>
        {showLeftArrow && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => handleScrollBy(isRTL ? "next" : "prev")}
            className="absolute left-2 top-1/2 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-gray-900 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-primary md:-left-6"
            aria-label="Previous"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRightArrow && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => handleScrollBy(isRTL ? "prev" : "next")}
            className="absolute right-2 top-1/2 z-30 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/90 text-gray-900 shadow-2xl backdrop-blur-xl transition-all hover:bg-white hover:text-primary md:-right-6"
            aria-label="Next"
          >
            <ChevronRight size={28} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ProductsSlider;
