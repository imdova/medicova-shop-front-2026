import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSwipeable } from "react-swipeable";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { linksHeader } from "@/types";

interface SwipeableNavProps {
  links: linksHeader[];
  locale: "ar" | "en";
}

const SwipeableNav = ({ links, locale }: SwipeableNavProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (navRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollNav = (direction: "left" | "right") => {
    if (navRef.current) {
      const scrollAmount = 200;
      navRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (navRef.current) {
        navRef.current.scrollLeft = 0;
        setTimeout(handleScroll, 100);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    handleScroll();
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => scrollNav("right"),
    onSwipedRight: () => scrollNav("left"),
    trackMouse: true,
  });

  return (
    <div className="relative bg-white shadow-sm" ref={containerRef}>
      {showLeftArrow && (
        <button
          onClick={() => scrollNav("left")}
          className="absolute left-0 top-1/2 z-10 flex h-8 w-14 -translate-y-1/2 items-center justify-center bg-gradient-to-r from-white via-white to-white/25"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-full w-5 text-gray-700" />
        </button>
      )}

      <div>
        <div
          {...handlers}
          ref={navRef}
          onScroll={handleScroll}
          className="no-scrollbar flex overflow-x-auto scroll-smooth py-2"
        >
          <nav className="flex items-center justify-start space-x-6 px-4">
            {links.map((link, index) => (
              <div className="group shrink-0" key={index}>
                <Link
                  href={link.url}
                  className="block whitespace-nowrap px-4 py-2 text-sm font-semibold capitalize text-gray-700 hover:text-primary"
                >
                  {link.title[locale]}
                </Link>
                {link.gridLinks && link.gridLinks.length > 0 && (
                  <div className="elementskit-dropdown -left-0 grid w-full grid-cols-1 justify-between !rounded-b-none sm:grid-cols-8 sm:flex-row">
                    <ul className="col-span-1 grid w-full grid-cols-2 gap-3 sm:col-span-5 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7">
                      {link.gridLinks.map((gridLink, gridIndex) => (
                        <li className="p-3" key={gridIndex}>
                          <h2 className="mb-2 text-sm font-bold">
                            {gridLink.heading[locale]}
                          </h2>
                          <ul>
                            {gridLink.subLinks.map((link, index) => (
                              <li key={index}>
                                <Link
                                  className="block p-2 text-xs font-semibold text-gray-600 transition hover:text-primary hover:underline"
                                  href={link.url}
                                >
                                  {link.title[locale]}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                    {link.banner && (
                      <div className="relative col-span-1 mt-4 flex h-[320px] w-full flex-col items-center overflow-hidden rounded-xl sm:col-span-3">
                        <Image
                          className="absolute left-0 top-0 h-full w-full object-cover brightness-75"
                          src={link.banner.image ?? "/fallback-image.jpg"}
                          alt="banner image"
                          width={600}
                          height={300}
                        />
                        <div className="relative flex h-full w-full flex-col justify-center p-8">
                          <h1 className="mb-2 max-w-[250px] text-4xl font-bold text-white">
                            {link.banner.title[locale]}
                          </h1>
                          <p className="mb-2 text-white">
                            {link.banner.details[locale]}
                          </p>
                          <button className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100">
                            {locale === "ar" ? "تسوق الآن" : "Shop Now"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {showRightArrow && (
        <button
          onClick={() => scrollNav("right")}
          className="absolute right-0 top-1/2 z-10 flex h-8 w-14 -translate-y-1/2 items-center justify-center bg-gradient-to-l from-white via-white to-white/25"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default SwipeableNav;
