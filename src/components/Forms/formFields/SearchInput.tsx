"use client";

import { LanguageType } from "@/util/translations";
import { Search } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function SearchInputContent({ locale }: { locale: LanguageType }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) {
      params.set("search", query);
    } else {
      params.delete("search");
    }
    router.replace(`?${params.toString()}`);
  }, [query, router, searchParams]);

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="relative w-full max-w-sm"
    >
      <input
        type="text"
        value={query}
        placeholder={locale === "ar" ? "ابحث..." : "Search..."}
        onChange={(e) => setQuery(e.target.value)}
        className={`w-full rounded-lg border p-2 shadow-sm outline-none ${locale === "en" ? "pl-8" : "pr-8"}`}
      />
      <Search
        className={`absolute ${locale === "en" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-gray-600`}
        size={15}
      />
    </div>
  );
}
export default function SearchInput({ locale }: { locale: LanguageType }) {
  return (
    <Suspense>
      <SearchInputContent locale={locale} />
    </Suspense>
  );
}
