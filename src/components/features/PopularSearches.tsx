"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import LogoLoader from "@/components/layouts/LogoLoader";

interface PopularSearch {
  id: string;
  term: string;
  category: string;
  popularity: number;
}

interface PopularSearchesProps {
  locale: "en" | "ar";
  initialData: PopularSearch[];
}

const PopularSearches = ({ locale, initialData }: PopularSearchesProps) => {
  const [searches] = useState<PopularSearch[]>(initialData || []);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort by popularity (descending)
  const sortedSearches = [...searches].sort(
    (a, b) => b.popularity - a.popularity,
  );

  // Get top searches (when not expanded)
  const topSearches = sortedSearches.slice(0, 18);
  const displayedSearches = isExpanded ? sortedSearches : topSearches;

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <section className="bg-white px-2 py-8">
      <div>
        <h2 className="mb-6 text-lg font-bold text-gray-900 md:text-3xl">
          {locale === "ar" ? "عمليات البحث الرائجة" : "Popular Searches"}
        </h2>

        {/* Searches Grid */}
        <div className="flex flex-wrap gap-3 gap-y-5">
          {displayedSearches.map((search, index) => (
            <motion.div
              key={search.id}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href={`/search?q=${encodeURIComponent(search.term)}`}
                className="rounded-lg bg-gray-100 px-2 py-1 text-center transition-colors hover:bg-green-50"
              >
                <span className="text-xs font-medium text-gray-700">
                  {search.term}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View More/Less Toggle */}
        {sortedSearches.length > 18 && (
          <div className="mt-6 text-sm font-bold text-primary">
            <button onClick={() => setIsExpanded(!isExpanded)} className="">
              {isExpanded ? (
                <>{locale === "ar" ? "عرض أقل" : "View Less"}</>
              ) : (
                <> {locale === "ar" ? "عرض المزيد" : "View More"} </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularSearches;
