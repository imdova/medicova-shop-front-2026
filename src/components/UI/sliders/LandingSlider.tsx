"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Slide } from "@/types";

type SliderLandingProps = {
  slides: Slide[];
  showNavigation?: boolean;
  autoPlay?: boolean;
  slideDuration?: number;
  showProgressBar?: boolean;
  bannerHeight?: string;
  dir?: "ltr" | "rtl";
};

const LandingSlider = ({
  slides,
  showNavigation = true,
  autoPlay = true,
  slideDuration = 5000,
  showProgressBar,
  bannerHeight = "h-[150px]",
  dir = "ltr",
}: SliderLandingProps) => {
  // Filter slides into banners and sliders
  const sliderSlides = slides.filter((slide) => slide.type === "slider");
  const bannerSlides = slides.filter((slide) => slide.type === "banner");

  // Only use slider slides for the slider functionality
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const [pageLoading, setPageLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  const isRTL = dir === "rtl";

  // Show loader only on page reload
  useEffect(() => {
    const timer = setTimeout(() => setPageLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Auto-slide with progress indicator
  useEffect(() => {
    if (!isAutoPlaying || sliderSlides.length <= 1) {
      setProgress(0);
      return;
    }

    let startTime: number | undefined;
    let animationFrameId: number;
    let timeoutId: NodeJS.Timeout;

    const animateProgress = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const newProgress = (elapsed / slideDuration) * 100;
      setProgress(Math.min(newProgress, 100));

      if (elapsed < slideDuration) {
        animationFrameId = requestAnimationFrame(animateProgress);
      }
    };

    const startAnimation = () => {
      setProgress(0);
      startTime = undefined;
      animationFrameId = requestAnimationFrame(animateProgress);
      timeoutId = setTimeout(() => {
        nextSlide();
      }, slideDuration);
    };

    startAnimation();

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentIndex, isAutoPlaying, slideDuration, sliderSlides.length]);

  const nextSlide = useCallback(() => {
    setCurrentIndex([(currentIndex + 1) % sliderSlides.length, isRTL ? -1 : 1]);
  }, [currentIndex, sliderSlides.length, isRTL]);

  const prevSlide = useCallback(() => {
    setCurrentIndex([
      (currentIndex - 1 + sliderSlides.length) % sliderSlides.length,
      isRTL ? 1 : -1,
    ]);
  }, [currentIndex, sliderSlides.length, isRTL]);

  const goToSlide = (index: number) => {
    const direction = index > currentIndex ? (isRTL ? -1 : 1) : isRTL ? 1 : -1;
    setCurrentIndex([index, direction]);
  };

  // Swipe handlers for mobile
  const handlers = useSwipeable({
    onSwipedLeft: () => (isRTL ? prevSlide() : nextSlide()),
    onSwipedRight: () => (isRTL ? nextSlide() : prevSlide()),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (isRTL) {
          prevSlide();
        } else {
          nextSlide();
        }
      }
      if (e.key === "ArrowLeft") {
        if (isRTL) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRTL, nextSlide, prevSlide]);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? (isRTL ? "-100%" : "100%") : isRTL ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? (isRTL ? "100%" : "-100%") : isRTL ? "-100%" : "100%",
      opacity: 0,
      transition: { duration: 0.5, ease: "easeInOut" },
    }),
  };

  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, delay: 0.3, ease: "easeOut" },
    },
  };

  return (
    <div dir={dir} className="">
      <div className="sm:container sm:mx-auto sm:px-6 lg:max-w-[1440px]">
        {/* Banner Section */}
        {bannerSlides.length > 0 && (
          <div
            className={`grid grid-cols-1 gap-4 md:grid-cols-${bannerSlides.length}`}
          >
            {bannerSlides.map((banner, index) => (
              <div
                key={index}
                className={`relative ${bannerHeight} mb-3 h-[30px] w-full overflow-hidden sm:mb-0 sm:h-[30px] md:h-[50px] lg:h-[70px]`}
              >
                {banner.url ? (
                  <Link href={banner.url} className="block h-full w-full">
                    <Image
                      src={
                        typeof banner.image === "string"
                          ? banner.image
                          : banner.image.src
                      }
                      alt={`Banner ${index + 1}`}
                      fill
                      className="h-full w-full object-cover"
                    />
                  </Link>
                ) : (
                  <Image
                    src={
                      typeof banner.image === "string"
                        ? banner.image
                        : banner.image.src
                    }
                    alt={`Banner ${index + 1}`}
                    fill
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto px-6 lg:max-w-[1440px]">
        {/* Slider Section */}
        {sliderSlides.length > 0 && (
          <section className="relative" {...handlers}>
            <div
              className={`relative h-[100px] w-full overflow-hidden rounded-lg sm:h-[150px] sm:rounded-none md:h-[300px] ${
                pageLoading ? "opacity-0" : "opacity-100"
              }`}
            >
              <AnimatePresence custom={direction} initial={false}>
                <motion.div
                  key={currentIndex}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="absolute inset-0 h-full w-full"
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(autoPlay)}
                >
                  {/* Background Image with overlay */}
                  <Link
                    href={sliderSlides[currentIndex].url || ""}
                    className="absolute inset-0 z-10 h-full w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${
                        typeof sliderSlides[currentIndex].image === "string"
                          ? sliderSlides[currentIndex].image
                          : sliderSlides[currentIndex].image?.src
                      })`,
                    }}
                  ></Link>

                  {/* Text Content */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={textVariants}
                    className="relative flex h-full w-full items-center justify-center text-white"
                  >
                    <div className="container mx-auto px-4"></div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows - only show if more than one slide */}
              {showNavigation && sliderSlides.length > 1 && (
                <>
                  {/* Prev Button */}
                  <button
                    onClick={isRTL ? nextSlide : prevSlide}
                    className={`group absolute top-0 z-20 hidden h-full items-center md:flex ${
                      isRTL ? "-right-11" : "-left-1"
                    }`}
                  >
                    {!isRTL ? (
                      <>
                        <svg
                          width="44"
                          height="502"
                          viewBox="0 0 44 502"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="duration-400 inline-block h-full w-auto origin-left scale-x-0 transition-transform group-hover:scale-x-[2]"
                        >
                          <path
                            className="fill-white/10 transition duration-200 group-hover:fill-white"
                            d="M0.999973 501C32.9999 301.5 42.9999 308 42.9999 252.5C42.9999 197 29.4999 189 1.00002 0.999996L0.999973 501Z"
                          />
                        </svg>
                        <div className="flex h-10 w-10 translate-x-7 items-center justify-center rounded-full bg-white/25 text-white transition duration-200 group-hover:-translate-x-7 group-hover:bg-transparent group-hover:text-gray-600">
                          <ChevronsLeft size={25} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="z-10 flex h-10 w-10 -translate-x-20 items-center justify-center rounded-full bg-white/25 text-white transition duration-200 group-hover:-translate-x-12 group-hover:bg-transparent group-hover:text-gray-600">
                          <ChevronsRight size={25} />
                        </div>
                        <svg
                          width="44"
                          height="501"
                          viewBox="0 0 44 501"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="duration-400 inline-block h-full w-auto origin-right scale-x-0 transition-transform group-hover:scale-x-[2]"
                        >
                          <path
                            className="fill-white/10 transition duration-200 group-hover:fill-white"
                            d="M42.9999 0.5C11 200 1 193.5 1 249C1 304.5 14.5 312.5 42.9999 500.5V0.5Z"
                          />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={isRTL ? prevSlide : nextSlide}
                    className={`group absolute top-0 z-20 hidden h-full items-center md:flex ${
                      isRTL ? "-left-11" : "-right-1"
                    }`}
                  >
                    {!isRTL ? (
                      <>
                        <div className="z-10 flex h-10 w-10 -translate-x-7 items-center justify-center rounded-full bg-white/25 text-white transition duration-200 group-hover:translate-x-7 group-hover:bg-transparent group-hover:text-gray-600">
                          <ChevronsRight size={25} />
                        </div>
                        <svg
                          width="44"
                          height="501"
                          viewBox="0 0 44 501"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="duration-400 inline-block h-full w-auto origin-right scale-x-0 transition-transform group-hover:scale-x-[2]"
                        >
                          <path
                            className="fill-white/10 transition duration-200 group-hover:fill-white"
                            d="M42.9999 0.5C11 200 1 193.5 1 249C1 304.5 14.5 312.5 42.9999 500.5V0.5Z"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        <svg
                          width="44"
                          height="502"
                          viewBox="0 0 44 502"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="duration-400 inline-block h-full w-auto origin-left scale-x-0 transition-transform group-hover:scale-x-[2]"
                        >
                          <path
                            className="fill-white/10 transition duration-200 group-hover:fill-white"
                            d="M0.999973 501C32.9999 301.5 42.9999 308 42.9999 252.5C42.9999 197 29.4999 189 1.00002 0.999996L0.999973 501Z"
                          />
                        </svg>
                        <div className="flex h-10 w-10 translate-x-20 items-center justify-center rounded-full bg-white/25 text-white transition duration-200 group-hover:translate-x-12 group-hover:bg-transparent group-hover:text-gray-600">
                          <ChevronsLeft size={25} />
                        </div>
                      </>
                    )}
                  </button>
                </>
              )}

              {/* Progress Bar */}
              {showProgressBar && isAutoPlaying && sliderSlides.length > 1 && (
                <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-white/20">
                  <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}

              {/* Dots Navigation - only show if more than one slide */}
              {showNavigation && sliderSlides.length > 1 && (
                <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-3 md:gap-4">
                  {sliderSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className="group relative cursor-pointer rounded-full p-2"
                      aria-label={`Go to slide ${index + 1}`}
                    >
                      <div
                        className={`absolute inset-0 left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all ${
                          currentIndex === index
                            ? "bg-primary"
                            : "bg-white/50 group-hover:bg-white/70"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default LandingSlider;
