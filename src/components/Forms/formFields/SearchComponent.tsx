import { Search, X, Clock, ArrowUpLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SearchResult } from "@/types";
import { dummyKeywords } from "@/constants/keywords";

const translations = {
  en: {
    placeholder: "What are you looking for?",
    recent: "Recent Searches",
    clear: "Clear all",
    suggestions: "Suggestions",
    noResults: "No suggestions found for",
    searchFor: "Search for",
  },
  ar: {
    placeholder: "عن ماذا تبحث؟",
    recent: "عمليات البحث الأخيرة",
    clear: "مسح الكل",
    suggestions: "اقتراحات",
    noResults: "لم يتم العثور على اقتراحات لـ",
    searchFor: "البحث عن",
  },
};

interface SearchComponentProps {
  locale?: "en" | "ar";
  inputClassName?: string;
  iconClassName?: string;
}

const SearchComponent = ({
  locale = "en",
  inputClassName,
  iconClassName,
}: SearchComponentProps) => {
  const t = translations[locale];
  const isRtl = locale === "ar";

  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const matchedKeywords = dummyKeywords
        .filter((keyword) =>
          keyword.toLowerCase().includes(query.toLowerCase()),
        )
        .map((keyword, index) => ({
          id: `keyword-${index}`,
          title: keyword,
          type: "recent" as const,
        }));

      const matchedRecentSearches = recentSearches
        .filter((item) =>
          item.title.toLowerCase().includes(query.toLowerCase()),
        )
        .map((item) => ({
          ...item,
          type: "recent" as const,
        }));

      const results = [...matchedKeywords, ...matchedRecentSearches];
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }

    setSelectedResultIndex(-1);
  };

  const saveToRecentSearches = (title: string) => {
    if (
      !recentSearches.some(
        (item) => item.title.toLowerCase() === title.toLowerCase(),
      )
    ) {
      setRecentSearches((prev) => [
        { id: `recent-${Date.now()}`, title, type: "recent" },
        ...prev.slice(0, 4),
      ]);
    }
  };

  const performSearch = (query: string) => {
    if (query.trim()) {
      saveToRecentSearches(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
    setIsFocused(false);
    setSearchResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedResultIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedResultIndex >= 0 && searchResults.length > 0) {
        const selectedResult = searchResults[selectedResultIndex];
        setSearchQuery(selectedResult.title);
        performSearch(selectedResult.title);
      } else if (searchQuery.trim()) {
        performSearch(searchQuery);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  return (
    <div className="w-full md:relative" ref={searchRef}>
      <motion.div
        className="relative"
        transition={{ type: "spring", stiffness: 400 }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={t.placeholder}
          className={`w-full rounded-lg ${inputClassName} bg-white/10 py-2 backdrop-blur-sm transition-all duration-300 focus:bg-white/20 focus:ring-2 focus:ring-white/30 md:py-3 ${
            isRtl ? "pl-10 pr-12" : "pl-12 pr-10"
          } outline-none`}
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? "right-4" : "left-4"}`}
        >
          <Search className={iconClassName} size={15} />
        </div>

        {searchQuery && (
          <motion.button
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
              inputRef.current?.focus();
            }}
            className={`absolute top-1/2 -translate-y-1/2 text-white/60 hover:text-white ${
              isRtl ? "left-4" : "right-4"
            }`}
            whileHover={{ scale: 1.1 }}
          >
            <X size={20} />
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 z-50 mt-2 w-full md:top-full"
          >
            {!searchQuery && recentSearches.length > 0 && (
              <motion.div
                className="bg-white/90 p-4 shadow-xl backdrop-blur-xl md:rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center text-sm font-medium text-gray-600">
                    <Clock className={`${isRtl ? "ml-2" : "mr-2"} h-4 w-4`} />
                    {t.recent}
                  </div>
                  <button
                    onClick={clearRecentSearches}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    {t.clear}
                  </button>
                </div>
                <div className="space-y-2">
                  {recentSearches.map((result) => (
                    <motion.div
                      key={`recent-${result.id}`}
                      whileHover={{ x: isRtl ? -5 : 5 }}
                      className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-gray-100"
                      onClick={() => {
                        setSearchQuery(result.title);
                        performSearch(result.title);
                      }}
                    >
                      <div className="flex items-center">
                        <span className="text-gray-800">{result.title}</span>
                      </div>
                      <ArrowUpLeft className="text-gray-400" size={16} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {searchQuery && (
              <motion.div
                className="bg-white/90 p-4 shadow-xl backdrop-blur-xl md:rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {searchResults.length > 0 ? (
                  <>
                    <div className="mb-3 px-2 text-sm font-medium text-gray-600">
                      {t.suggestions}
                    </div>
                    <div className="space-y-1">
                      {searchResults.map((result, index) => (
                        <motion.div
                          key={`result-${result.id}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`cursor-pointer rounded-lg px-3 py-2 ${
                            selectedResultIndex === index
                              ? "bg-gray-100"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => {
                            setSearchQuery(result.title);
                            performSearch(result.title);
                          }}
                        >
                          <div className="text-gray-800">{result.title}</div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="p-3 text-center text-sm text-gray-500">
                    {t.noResults}{" "}
                    <span className="font-medium">{searchQuery}</span>
                  </div>
                )}

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="mt-3 cursor-pointer rounded-lg bg-gray-100 px-4 py-3 text-center font-medium text-gray-800 hover:bg-gray-200"
                  onClick={() => performSearch(searchQuery)}
                >
                  {t.searchFor}{" "}
                  <span className="font-semibold">{searchQuery}</span>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchComponent;
