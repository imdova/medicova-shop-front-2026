import DynamicTable from "@/components/features/tables/DTable";
import Avatar from "@/components/shared/Avatar";
import Link from "next/link";
import { Star } from "lucide-react";
import { Seller } from "@/types/product";
import { Sellers } from "@/constants/sellers";
import SellerReviewCard from "@/components/features/cards/SellerReviewCard";
import { LanguageType } from "@/util/translations";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";

const SellerColumns = (t: any) => [
  {
    key: "name",
    header: t("seller"),
    render: (seller: Seller) => (
      <div className="flex items-center gap-3">
        <Avatar
          className="h-10 w-10 rounded-2xl border border-white/60 shadow-sm"
          imageUrl={seller.image}
          name={seller.name}
        />
        <div className="flex flex-col">
          <Link
            href={"#"}
            className="text-sm font-extrabold text-gray-900 transition-colors hover:text-primary"
          >
            {seller.name}
          </Link>
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
            <Star size={10} fill="currentColor" />
            <span>4.8</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "sales",
    header: t("sales"),
    render: (seller: Seller) => {
      const salesValue = typeof seller.sales === "number" ? seller.sales : 0;
      return (
        <div className="flex flex-col">
          <span className="text-xs font-extrabold text-gray-900">
            {salesValue.toLocaleString()} EGP
          </span>
          <span className="text-[10px] font-bold text-gray-400">
            Total Revenue
          </span>
        </div>
      );
    },
  },
];

interface Props {
  locale: LanguageType;
  itemVariants: any;
}

export const OverviewTopSellers = ({ locale, itemVariants }: Props) => {
  const t = useTranslations("admin");

  return (
    <div className="flex h-full flex-col space-y-10 lg:col-span-4">
      <motion.div
        variants={itemVariants}
        className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-gray-200/40 backdrop-blur-xl"
      >
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
            {t("topSeller")}
          </h2>
          <Link
            className="text-[10px] font-bold uppercase tracking-widest text-primary transition-opacity hover:opacity-70"
            href={"#"}
          >
            {t("viewAll")}
          </Link>
        </div>
        <DynamicTable
          data={Sellers}
          columns={SellerColumns(t)}
          itemsPerPage={5}
          minWidth={200}
          headerClassName="bg-transparent border-b border-gray-100/50 pb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400"
          rowClassName="border-b border-gray-50/30 transition-colors duration-300 last:border-0 hover:bg-gray-50/50"

        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex-1 rounded-[2rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-gray-200/40 backdrop-blur-xl"
      >
        <h2 className="mb-8 text-xl font-extrabold tracking-tight text-gray-900">
          {t("topSellersReviews")}
        </h2>
        <div className="no-scrollbar grid max-h-[600px] grid-cols-1 gap-6 overflow-y-auto pr-2">
          {Sellers.map((seller) => (
            <SellerReviewCard key={seller.id} seller={seller} />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
