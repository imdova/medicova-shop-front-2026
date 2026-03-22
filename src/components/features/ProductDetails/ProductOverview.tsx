"use client";
import { Archive, ListRestart } from "lucide-react";
import { Product } from "@/types/product";
import { useTranslations } from "next-intl";

interface ProductOverviewProps {
  product: Product;
  locale: "en" | "ar";
}

const ProductOverview = ({ product, locale }: ProductOverviewProps) => {
  const t = useTranslations("product");
  return (
    <div className="space-y-10 py-12">
      {/* Product Overview Header */}
      <section
        aria-label={t("overview")}
        className="animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-xl text-primary">
            <Archive size={20} />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            {t("productOverview")}
          </h2>
        </div>

        <div className="mt-8 flex flex-wrap items-stretch gap-8">
          {/* Highlights */}
          {product.highlights && (
            <div className="flex min-w-[320px] flex-1 flex-col rounded-2xl border border-white/40 bg-white/40 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {t("highlights")}
              </h3>
              <ul className="flex-1 space-y-3">
                {product.highlights[locale]?.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span className="text-sm font-medium leading-relaxed text-gray-600">
                      {highlight}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Overview Description */}
          {product.overview_desc && (
            <div className="flex min-w-[320px] flex-1 flex-col rounded-2xl border border-white/40 bg-white/40 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                {t("description")}
              </h3>
              <p className="flex-1 text-sm font-medium leading-loose text-gray-600">
                {product.overview_desc[locale]}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Specifications */}
      {product.specifications && product.specifications.length > 0 && (
        <section
          aria-label={t("specifications")}
          className="animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700"
        >
          <div className="flex items-center gap-4 border-b border-gray-100 pb-5">
            <div className="bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-xl text-secondary">
              <ListRestart size={20} />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
              {t("specifications")}
            </h2>
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/40 bg-white/20 shadow-sm backdrop-blur-md">
            <div className="flex flex-wrap">
              {product.specifications.map((spec, index) => (
                <div
                  key={index}
                  className={`flex min-w-[280px] flex-1 flex-col gap-1 border-b border-gray-100/50 p-5 transition-colors hover:bg-white/40 ${
                    index % 2 === 0 ? "md:border-r" : ""
                  }`}
                >
                  <span className="text-primary/70 text-[10px] font-bold uppercase tracking-widest">
                    {spec.label[locale]}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">
                    {spec.content[locale]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductOverview;
