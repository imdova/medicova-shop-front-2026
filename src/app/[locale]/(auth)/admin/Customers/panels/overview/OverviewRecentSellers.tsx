import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/shared/Pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Sellers } from "@/constants/sellers";
import SellerCard from "@/components/features/cards/SellerCard";
import { LanguageType } from "@/util/translations";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

interface Props {
  locale: LanguageType;
  itemVariants: any;
}

export const OverviewRecentSellers = ({ locale, itemVariants }: Props) => {
  const t = useTranslations("admin");
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const ITEMS_PER_PAGE = 6;
  const isAr = locale === "ar";

  const paginatedSellers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return Sellers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage]);

  return (
    <div className="flex-1 space-y-6">
      <motion.div
        variants={itemVariants}
        className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
      >
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            {t("recentSellers")}
          </h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
            {Sellers.length} {t("sellers")}{" "}
            {isAr ? "مسجل حالياً" : "Currently Registered"}
          </p>
        </div>
        <Link
          className="group flex items-center gap-2 rounded-2xl bg-gray-50/50 px-5 py-2.5 text-sm font-bold text-gray-900 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-gray-200/40 hover:ring-1 hover:ring-gray-100"
          href={"#"}
        >
          <span>{t("viewAll")}</span>
          {isAr ? (
            <ChevronLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
          ) : (
            <ChevronRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
            />
          )}
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {paginatedSellers.map((seller) => (
          <motion.div variants={itemVariants} key={seller.id}>
            <SellerCard seller={seller} />
          </motion.div>
        ))}
      </div>

      <motion.div variants={itemVariants} className="flex justify-center pt-8">
        <Pagination
          totalItems={Sellers.length}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={currentPage}

        />
      </motion.div>
    </div>
  );
};
