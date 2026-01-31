"use client";

import { CardStats } from "@/components/UI/cards/CardStats";
import GenericChart from "@/components/UI/charts/GenericChart";
import { dummyCards, dummyChartData } from "@/constants/sellerDashboardMock";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Pagination } from "@/components/UI/Pagination";
import DynamicTable from "@/components/UI/tables/DTable";
import Avatar from "@/components/UI/Avatar";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Seller } from "@/types/product";
import { Sellers } from "@/constants/sellers";
import SellerCard from "@/components/UI/cards/SellerCard";
import SellerReviewCard from "@/components/UI/cards/SellerReviewCard";
import { LanguageType } from "@/util/translations";

const SellerColumns = (locale: LanguageType) => [
  {
    key: "name",
    header: locale === "ar" ? "البائع" : "Seller",
    render: (seller: Seller) => (
      <div className="flex items-center gap-2">
        <Avatar
          className="h-7 w-7"
          imageUrl={seller.image}
          name={seller.name}
        />
        <Link href={"#"} className="text-xs hover:underline">
          {seller.name}
        </Link>
      </div>
    ),
  },
  {
    key: "products",
    header: locale === "ar" ? "المنتجات" : "Products",
    render: (seller: Seller) => seller.products,
  },
  {
    key: "customers",
    header: locale === "ar" ? "العملاء" : "Customers",
    render: (seller: Seller) => seller.customers,
  },
  {
    key: "sales",
    header: locale === "ar" ? "المبيعات" : "Sales",
    render: (seller: Seller) => seller.sales,
  },
];

export default function OverviewPanel({ locale }: { locale: LanguageType }) {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;
  const ITEMS_PER_PAGE = 6;

  const paginatedSellers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return Sellers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage]);

  const isAr = locale === "ar";

  return (
    <div className="space-y-4">
      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CardStats
            title={isAr ? "إجمالي البائعين" : "Total Sellers"}
            value="1,245"
            change="+12.5%"
            icon="users"
            color="#429fe6"
            size="md"
            locale={locale}
          />
          <CardStats
            title={isAr ? "إجمالي المنتجات" : "Total Products"}
            value="1,245"
            change="+8.2%"
            icon="package"
            color="#429fe6"
            size="md"
            locale={locale}
          />
          <CardStats
            title={isAr ? "إجمالي المبيعات" : "Total Sales"}
            value={`12,450 ${locale === "ar" ? "جنيه" : "EGP"}`}
            change="+8%"
            icon="shoppingCart"
            color="#625df5"
            size="md"
            locale={locale}
          />
          <CardStats
            title={isAr ? "إجمالي العمولة" : "Total Commission"}
            value={`5,000 ${locale === "ar" ? "جنيه" : "EGP"}`}
            change="+15%"
            icon="dollar"
            size="md"
            locale={locale}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-10">
        <div className="col-span-1 lg:col-span-6">
          <div className="mb-4 h-fit overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <GenericChart
              chartTitle={isAr ? "إحصائيات البائعين" : "Sellers Stats"}
              data={dummyChartData}
              showCards={true}
              cards={dummyCards}
              locale={locale}
            />
          </div>

          <div>
            <div className="mb-3 flex justify-between gap-2">
              <h2 className="font-semibold">
                {isAr ? "أحدث البائعين" : "Recent Sellers"}
              </h2>
              <Link
                className="flex items-center gap-1 text-sm text-green-600 transition hover:text-green-700"
                href={"#"}
              >
                {isAr ? "عرض الكل" : "View All"}{" "}
                {isAr ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {paginatedSellers.map((seller) => (
                <SellerCard key={seller.id} seller={seller} locale={locale} />
              ))}
            </div>
            <Pagination
              totalItems={Sellers.length}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              locale={locale}
            />
          </div>
        </div>

        <div className="col-span-1 lg:col-span-4">
          <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex justify-between gap-2">
              <h2 className="font-semibold">
                {isAr ? "أفضل البائعين" : "Top Seller"}
              </h2>
              <Link
                className="flex items-center gap-1 text-sm text-green-600 transition hover:text-green-700"
                href={"#"}
              >
                {isAr ? "عرض الكل" : "View All"}{" "}
                {isAr ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
              </Link>
            </div>
            <DynamicTable
              data={Sellers}
              columns={SellerColumns(locale)}
              itemsPerPage={5}
              minWidth={250}
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-bold">
              {isAr ? "مراجعات أفضل البائعين" : "Top Sellers"}
            </h2>
            <div className="grid max-h-[700px] grid-cols-1 gap-2 space-y-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {Sellers.map((seller) => (
                <SellerReviewCard
                  key={seller.id}
                  seller={seller}
                  locale={locale}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
