import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import LogoLoader from "./LogoLoader";

interface PopularSearch {
  id: string;
  term: string;
  category: string;
  popularity: number;
}

const PopularSearches = ({ locale }: { locale: "en" | "ar" }) => {
  const [searches, setSearches] = useState<PopularSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch popular searches (mock data)
  useEffect(() => {
    const fetchPopularSearches = async () => {
      try {
        setIsLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock data - replace with actual API call
        const mockData: PopularSearch[] = [
          {
            id: "1",
            term: "iPhone 16",
            category: "Smartphones",
            popularity: 95,
          },
          {
            id: "2",
            term: "iPhone 16 Pro Max",
            category: "Smartphones",
            popularity: 90,
          },
          {
            id: "3",
            term: "Samsung S24 Ultra",
            category: "Smartphones",
            popularity: 88,
          },
          { id: "4", term: "MacBook Air", category: "Laptops", popularity: 85 },
          { id: "5", term: "MacBook Pro", category: "Laptops", popularity: 82 },
          { id: "6", term: "HP Laptops", category: "Laptops", popularity: 78 },
          {
            id: "7",
            term: "Lenovo Laptops",
            category: "Laptops",
            popularity: 75,
          },
          {
            id: "8",
            term: "Dell Laptops",
            category: "Laptops",
            popularity: 72,
          },
          {
            id: "9",
            term: "ASUS Laptops",
            category: "Laptops",
            popularity: 70,
          },
          {
            id: "10",
            term: "Gaming Laptop",
            category: "Laptops",
            popularity: 68,
          },
          {
            id: "11",
            term: "Apple Watch",
            category: "Wearables",
            popularity: 65,
          },
          {
            id: "12",
            term: "Samsung Smartwatch",
            category: "Wearables",
            popularity: 62,
          },
          {
            id: "13",
            term: "Fitbit Smartwatch",
            category: "Wearables",
            popularity: 60,
          },
          {
            id: "14",
            term: "Nutricook Air Fryer",
            category: "Home Appliances",
            popularity: 58,
          },
          {
            id: "15",
            term: "Samsung Fridge",
            category: "Home Appliances",
            popularity: 55,
          },
          {
            id: "16",
            term: "LG Fridge",
            category: "Home Appliances",
            popularity: 52,
          },
          { id: "17", term: "JBL Speakers", category: "Audio", popularity: 50 },
          {
            id: "18",
            term: "Bose Speakers",
            category: "Audio",
            popularity: 48,
          },
          { id: "19", term: "Playstation", category: "Gaming", popularity: 45 },
          {
            id: "20",
            term: "Nintendo Switch",
            category: "Gaming",
            popularity: 42,
          },
          {
            id: "21",
            term: "Dior Perfume",
            category: "Fragrances",
            popularity: 40,
          },
          {
            id: "22",
            term: "Chanel Perfume",
            category: "Fragrances",
            popularity: 38,
          },
          {
            id: "23",
            term: "Versace Perfume",
            category: "Fragrances",
            popularity: 35,
          },
          {
            id: "24",
            term: "Huawei Phone",
            category: "Smartphones",
            popularity: 32,
          },
          {
            id: "25",
            term: "Nothing Phone",
            category: "Smartphones",
            popularity: 30,
          },
        ];

        setSearches(mockData);
      } catch (error) {
        console.error("Error fetching popular searches:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularSearches();
  }, []);

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LogoLoader className="w-[40px] animate-pulse text-gray-400" />
      </div>
    );
  }

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
