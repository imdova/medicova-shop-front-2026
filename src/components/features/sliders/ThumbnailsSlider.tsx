"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ThumbnailsSliderProps = {
  images: string[];
  currentImageIndex: number;
  goToImage: (index: number) => void;
};

const ThumbnailsSlider = ({
  images,
  currentImageIndex,
  goToImage,
}: ThumbnailsSliderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollArrows, setShowScrollArrows] = useState({
    left: false,
    right: false,
  });

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (!containerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    setShowScrollArrows({
      left: scrollLeft > 0,
      right: scrollLeft < scrollWidth - clientWidth - 1,
    });
  };

  // Scroll thumbnails left/right
  const scrollThumbnails = (direction: "left" | "right") => {
    if (!containerRef.current) return;

    const scrollAmount = 200;
    containerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Check if content overflows and set initial arrow visibility
  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current) {
        const { scrollWidth, clientWidth } = containerRef.current;
        setShowScrollArrows({
          left: false,
          right: scrollWidth > clientWidth,
        });
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [images]);

  // Center the active thumbnail
  useEffect(() => {
    if (containerRef.current) {
      const thumbnail = containerRef.current.children[
        currentImageIndex
      ] as HTMLElement;
      if (thumbnail) {
        containerRef.current.scrollTo({
          left:
            thumbnail.offsetLeft -
            containerRef.current.offsetWidth / 2 +
            thumbnail.offsetWidth / 2,
          behavior: "smooth",
        });
      }
    }
  }, [currentImageIndex]);

  return (
    <div className="relative mt-4 hidden md:block">
      {/* Horizontal Slider */}
      <div className="relative">
        {/* Left Scroll Button */}
        {showScrollArrows.left && (
          <button
            onClick={() => scrollThumbnails("left")}
            className="absolute left-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* Thumbnails Container */}
        <div
          ref={containerRef}
          onScroll={checkScrollPosition}
          className="no-scrollbar flex gap-3 overflow-x-auto py-2"
        >
          {images.map((img, index) => (
            <motion.button
              key={index}
              onClick={() => goToImage(index)}
              whileTap={{ scale: 0.95 }}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded border-2 ${
                currentImageIndex === index
                  ? "border-primary"
                  : "border-gray-200"
              }`}
            >
              <Image
                width={80}
                height={80}
                src={img || "/placeholder.jpg"}
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
                priority={index < 3} // Prioritize loading first few images
              />
              {currentImageIndex === index && (
                <motion.div
                  className="absolute inset-0 bg-black/20"
                  layoutId="thumbIndicator"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Right Scroll Button */}
        {showScrollArrows.right && (
          <button
            onClick={() => scrollThumbnails("right")}
            className="absolute right-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ThumbnailsSlider;
