import PopularSearches from "@/components/features/PopularSearches";
import type { Locale } from "@/i18n/routing";
import popularSearchesData from "@/data/popular-searches.json";

interface HomePopularSearchesProps {
  locale: string;
}

export default function HomePopularSearches({ locale }: { locale: Locale }) {
  return (
    <section className="border-t border-gray-100 bg-white">
      <div className="container mx-auto py-8 lg:max-w-[98%]">
        <PopularSearches
          locale={locale as any}
          initialData={popularSearchesData}
        />
      </div>
    </section>
  );
}
