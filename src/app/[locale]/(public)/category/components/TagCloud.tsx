"use client";

import { useAppLocale } from "@/hooks/useAppLocale";
import { Link } from "@/i18n/navigation";

interface TagCloudProps {
  tags: string[];
}

export default function TagCloud({ tags }: TagCloudProps) {
  const locale = useAppLocale();
  const isArabic = locale === "ar";

  if (!tags || tags.length === 0) return null;

  return (
    <section className="my-12">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">
          {isArabic ? "العلامات والإشارات" : "Tags & Skill signals"}
        </h3>
        <span className="text-sm font-semibold text-primary">
          {tags.length} {isArabic ? "علامة" : "Tags"}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Link
            key={index}
            href={`/search?q=${tag}`}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
          >
            {tag}
          </Link>
        ))}
      </div>
    </section>
  );
}
