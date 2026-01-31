"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import Image from "next/image";
import { MultiCategory } from "@/types";
import { LanguageType } from "@/util/translations";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CardSize = "small" | "medium" | "large";
type DisplayMode = "default" | "numbered";

type CategorySliderProps = {
  categories?: MultiCategory[];
  inCategory?: boolean;
  cardSize?: CardSize;
  displayMode?: DisplayMode;
  path?: string;
  locale: LanguageType;
};

const CategorySlider: React.FC<CategorySliderProps> = ({
  categories = [],
  inCategory = false,
  cardSize = "medium",
  displayMode = "default",
  locale = "en",
  path,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(4);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const autoPlayTimeoutRef = useRef<number | null>(null);

  // Get card dimensions based on size prop
  const getCardDimensions = () => {
    switch (cardSize) {
      case "large":
        return {
          container: "h-16 w-16 sm:h-28 sm:w-28 md:h-32 md:w-32",
          textSize: "text-xs sm:text-sm",
          numberSize: "text-lg sm:text-xl",
        };
      case "small":
        return {
          container: "h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16",
          textSize: "text-[9px] sm:text-[10px]",
          numberSize: "text-sm sm:text-base",
        };
      case "medium":
      default:
        return {
          container: "h-14 w-14 sm:h-16 sm:w-16 md:h-20 md:w-20",
          textSize: "text-[10px] sm:text-xs",
          numberSize: "text-base sm:text-lg",
        };
    }
  };

  // Calculate visible cards based on screen size and card size
  const updateVisibleCards = useCallback(() => {
    const width = window.innerWidth;
    let cards = 4;

    if (cardSize === "large") {
      if (width < 400)
        cards = 2; // Reduced for better mobile display
      else if (width < 640) cards = 3;
      else if (width < 768) cards = 4;
      else if (width < 1024) cards = 5;
      else if (width < 1280) cards = 6;
      else cards = 8;
    } else if (cardSize === "small") {
      if (width < 400) cards = 4;
      else if (width < 640) cards = 6;
      else if (width < 768) cards = 8;
      else if (width < 1024) cards = 10;
      else if (width < 1280) cards = 12;
      else cards = 16;
    } else {
      // medium
      if (width < 400) cards = 3;
      else if (width < 640) cards = 4;
      else if (width < 768) cards = 5;
      else if (width < 1024) cards = 6;
      else if (width < 1280) cards = 8;
      else cards = 10;
    }

    setVisibleCards(cards);
  }, [cardSize]);

  useEffect(() => {
    updateVisibleCards();
    const handleResize = () => {
      updateVisibleCards();
      // Reset position on resize to prevent misalignment
      scrollToIndex(currentIndex);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (autoPlayTimeoutRef.current) {
        window.clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [updateVisibleCards, currentIndex]);

  const totalSlides = Math.ceil(categories.length / visibleCards);

  // Scroll to specific index with boundary checks
  const scrollToIndex = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(0, Math.min(index, totalSlides - 1));
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const newPosition = -clampedIndex * containerWidth;

      controls.start({
        x: newPosition,
        transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
      });

      setCurrentIndex(clampedIndex);
    },
    [controls, totalSlides],
  );

  const nextSlide = useCallback(() => {
    scrollToIndex(currentIndex + 1);
  }, [currentIndex, scrollToIndex]);

  const prevSlide = useCallback(() => {
    scrollToIndex(currentIndex - 1);
  }, [currentIndex, scrollToIndex]);

  // Handle drag events with momentum
  const handleDragStart = () => {
    setIsDragging(true);
    controls.stop();
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setIsDragging(false);

    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const dragDistance = info.offset.x;
    const dragVelocity = info.velocity.x;

    // Calculate target index based on drag momentum
    const direction = dragVelocity < 0 ? 1 : -1;
    const velocityFactor = Math.min(Math.abs(dragVelocity) / 1000, 2);
    const distanceFactor = Math.abs(dragDistance) / containerWidth;

    if (velocityFactor + distanceFactor > 0.5) {
      scrollToIndex(currentIndex + direction);
    } else {
      // Return to current slide
      controls.start({
        x: -currentIndex * containerWidth,
        transition: { duration: 0.3 },
      });
    }
  };

  // Simplified swipe handlers - direction is now consistent
  const handlers = useSwipeable({
    onSwipedLeft: () => nextSlide(),
    onSwipedRight: () => prevSlide(),
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 50,
    swipeDuration: 500,
  });

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    hover: { scale: 1.05, transition: { duration: 0.15 } },
  };

  const buttonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    hover: { scale: 1.1, backgroundColor: "rgba(255,255,255,0.9)" },
  };

  const { container, textSize, numberSize } = getCardDimensions();

  return (
    <div
      className="container relative mx-auto overflow-hidden p-3 pt-4 lg:max-w-[1440px]"
      {...handlers}
      dir="ltr"
    >
      {/* Navigation Arrows - simplified direction logic */}
      <motion.button
        onClick={prevSlide}
        className={`absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/80 shadow-sm hover:bg-white/90 md:flex`}
        aria-label={locale === "ar" ? "السابق" : "Previous categories"}
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <ChevronLeft size={16} />
      </motion.button>

      <motion.button
        onClick={nextSlide}
        className={`absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white/80 shadow-sm hover:bg-white/90 md:flex`}
        aria-label={locale === "ar" ? "التالي" : "Next categories"}
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <ChevronRight size={16} />
      </motion.button>

      {/* Slider container */}
      <div
        ref={containerRef}
        className="relative w-full py-2"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <motion.div
          ref={sliderRef}
          className="flex touch-none select-none"
          style={{
            width: `${totalSlides * 100}%`,
          }}
          drag="x"
          dragConstraints={{
            left: -(
              (totalSlides - 1) *
              (containerRef.current?.clientWidth || 0)
            ),
            right: 0,
          }}
          dragElastic={0.05}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          animate={controls}
          initial={{ x: 0 }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => (
            <div
              key={slideIndex}
              className="flex w-full px-1"
              style={{
                minWidth: `${100 / totalSlides}%`,
                flex: `0 0 ${100 / totalSlides}%`,
                direction: "ltr",
              }}
            >
              {categories
                .slice(
                  slideIndex * visibleCards,
                  (slideIndex + 1) * visibleCards,
                )
                .map((category, index) => (
                  <motion.div
                    key={category.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className="flex-shrink-0 px-1.5"
                    style={{ width: `${100 / visibleCards}%` }}
                  >
                    <Link
                      href={
                        inCategory
                          ? !category.subCategories ||
                            category.subCategories.length === 0
                            ? `/search/${category.slug}`
                            : `${path}/${category.slug}`
                          : category.slug
                      }
                      className="flex flex-col items-center transition-transform duration-300"
                      prefetch={false}
                    >
                      <div className="relative">
                        <motion.div
                          className={`mb-3 flex items-center justify-center overflow-hidden rounded-full bg-green-50 ${container}`}
                          whileHover={{ scale: 1.1 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                          }}
                        >
                          {displayMode === "numbered" ? (
                            <span
                              className={`font-bold text-gray-700 ${numberSize}`}
                            >
                              {index + 1 + slideIndex * visibleCards}
                            </span>
                          ) : (
                            <Image
                              className="h-full w-full object-cover"
                              src={category.image}
                              width={80}
                              height={80}
                              alt={category.title[locale]}
                              loading="lazy"
                            />
                          )}
                        </motion.div>
                        {category.isSale && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-3xl bg-red-600 px-4 text-xs font-bold text-white">
                            {locale === "ar" ? "عروض" : "Sale"}
                          </div>
                        )}
                      </div>

                      <motion.h3
                        className={`text-center font-medium text-gray-800 transition hover:text-primary ${textSize}`}
                      >
                        {category.title[locale]}
                      </motion.h3>
                    </Link>
                  </motion.div>
                ))}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default CategorySlider;
