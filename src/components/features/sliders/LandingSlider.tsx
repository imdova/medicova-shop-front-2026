"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import Link from "next/link";
import Image from "next/image";
import { Slide } from "@/types";
import LandingBanners from "./LandingBanners";
import LandingArrows from "./LandingArrows";

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
  const [progress, setProgress] = useState(0);

  const isRTL = dir === "rtl";

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
      <div className="sm:container sm:mx-auto lg:max-w-[100%]">
        <LandingBanners
          bannerSlides={bannerSlides}
          bannerHeight={bannerHeight}
        />
      </div>

      <div className="container mx-auto lg:max-w-[100%]">
        {sliderSlides.length > 0 && (
          <section className="relative" {...handlers}>
            <div className="relative h-[100px] w-full overflow-hidden rounded-lg sm:h-[150px] sm:rounded-none md:h-[475px]">
              {!isMounted ? (
                <div className="absolute inset-0 h-full w-full">
                  <Link
                    href={sliderSlides[0].url || ""}
                    className="absolute inset-0 z-10 h-full w-full"
                  >
                    <Image
                      src={
                        typeof sliderSlides[0].image === "string"
                          ? sliderSlides[0].image
                          : (sliderSlides[0].image as any)?.src
                      }
                      alt={sliderSlides[0].url || "Hero slide"}
                      fill
                      sizes="(max-width: 1440px) 100vw, 1440px"
                      priority
                      className=""
                      loading="eager"
                      {...({ fetchPriority: "high" } as any)}
                    />
                  </Link>
                </div>
              ) : (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial={false}
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 h-full w-full"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(autoPlay)}
                  >
                    {/* Background Image with overlay */}
                    <Link
                      href={sliderSlides[currentIndex].url || ""}
                      className="absolute inset-0 z-10 h-full w-full"
                    >
                      <Image
                        src={
                          typeof sliderSlides[currentIndex].image === "string"
                            ? sliderSlides[currentIndex].image
                            : (sliderSlides[currentIndex].image as any)?.src
                        }
                        alt={sliderSlides[currentIndex].url || "Hero slide"}
                        fill
                        sizes="(max-width: 1440px) 100vw, 1440px"
                        priority={currentIndex === 0}
                        className=""
                        loading={currentIndex === 0 ? "eager" : "lazy"}
                        {...(currentIndex === 0 ? { fetchPriority: "high" } : {})}
                      />
                    </Link>

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
              )}

              {/* Navigation Arrows - only show if more than one slide */}
              {showNavigation && sliderSlides.length > 1 && (
                <LandingArrows
                  isRTL={isRTL}
                  nextSlide={nextSlide}
                  prevSlide={prevSlide}
                />
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
