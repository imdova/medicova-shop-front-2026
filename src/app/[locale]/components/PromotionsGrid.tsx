import FallbackImage from "@/components/shared/FallbackImage";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import homeData from "@/data/home-page.json";
import type { Locale } from "@/i18n/routing";
import type { BilingualText } from "@/hooks/useAppLocale";

type MoreReason = {
  id: string;
  title: BilingualText;
  details: BilingualText;
  image: string;
  url: string;
};

type MegaDeal = {
  category: BilingualText;
  title: BilingualText;
  discountText: BilingualText;
  imageUrl: string;
  price: string | null;
  originalPrice: string | null;
  url: string;
};

type InFocusItem = {
  id: string;
  imageUrl: string;
  url: string;
};

const moreReasons = homeData.moreReasons as MoreReason[];
const megaDeals = homeData.megaDeals as MegaDeal[];
const inFocus = homeData.inFocus as InFocusItem[];

export default async function PromotionsGrid({ locale }: { locale: Locale }) {
  const t = await getTranslations("home");

  return (
    <section className="pb-12 pt-4" aria-label={t("megaDeals")}>
      <div className="container mx-auto px-4 lg:max-w-[98%]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* More Reasons */}
          <div className="flex flex-col rounded-[24px] bg-gradient-to-b from-white to-gray-50/50 p-6 shadow-sm ring-1 ring-gray-100/80">
            <h2 className="mb-5 text-xl font-bold tracking-tight text-gray-800">
              {t("moreReasons")}
            </h2>
            <div className="grid flex-1 grid-cols-2 gap-4">
              {moreReasons.map((reason) => (
                <Link
                  href={reason.url}
                  className="hover:ring-primary/20 group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md"
                  key={reason.id}
                >
                  <div className="relative h-[160px] w-full shrink-0 overflow-hidden bg-gray-50">
                    <FallbackImage
                      className="transition-transform duration-700 ease-out group-hover:scale-110"
                      src={reason.image}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 400px"
                      alt={reason.title[locale]}
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-end gap-1.5 p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-800 transition-colors duration-200 group-hover:text-primary">
                      {reason.title[locale]}
                    </h3>
                    <p className="text-[11px] font-medium text-gray-500">
                      {reason.details[locale]}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mega Deals (Premium Highlight) */}
          <div className="relative flex flex-col overflow-hidden rounded-[24px] bg-gradient-to-br from-teal-50 via-white to-emerald-50/30 p-6 shadow-sm ring-1 ring-teal-100/50">
            {/* Subtle decorative glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />

            <h2 className="relative z-10 mb-5 text-xl font-bold tracking-tight text-teal-900">
              {t("megaDeals")}
            </h2>

            <div className="relative z-10 grid flex-1 grid-cols-2 gap-4">
              {megaDeals.map((deal, index) => (
                <Link
                  href={deal.url}
                  key={index}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-900/5 hover:ring-teal-200"
                >
                  <div className="absolute right-2 top-2 z-10 rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-white shadow-sm">
                    {deal.category[locale]}
                  </div>
                  <div className="relative h-[160px] w-full shrink-0 overflow-hidden bg-white">
                    <FallbackImage
                      src={deal.imageUrl}
                      alt={deal.title[locale]}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1200px) 33vw, 400px"
                      className="transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-end gap-2 border-t border-gray-50 bg-gray-50/30 px-3 pb-3 pt-2">
                    <p className="line-clamp-2 text-xs font-semibold leading-relaxed text-gray-800 transition-colors group-hover:text-teal-700">
                      {deal.title[locale]}
                    </p>
                    <div className="mt-auto flex items-baseline gap-1.5">
                      <span className="text-sm font-bold text-gray-900">
                        {deal.price ?? deal.discountText[locale]}
                      </span>
                      {deal.originalPrice && (
                        <span className="text-[10px] font-medium text-gray-400 line-through">
                          {deal.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* In Focus */}
          <div className="flex flex-col rounded-[24px] bg-gradient-to-b from-white to-gray-50/50 p-6 shadow-sm ring-1 ring-gray-100/80">
            <h2 className="mb-5 text-xl font-bold tracking-tight text-gray-800">
              {t("inFocus")}
            </h2>
            <div className="flex h-full flex-col gap-4">
              {inFocus.map((focus) => (
                <Link
                  href={focus.url}
                  key={focus.id}
                  className="hover:ring-primary/20 group relative flex-1 overflow-hidden rounded-2xl bg-gray-100 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <FallbackImage
                    src={focus.imageUrl}
                    alt={t("inFocus")}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1200px) 33vw, 400px"
                    className="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Subtle inner dark gradient for text legibility if text is ever added */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
