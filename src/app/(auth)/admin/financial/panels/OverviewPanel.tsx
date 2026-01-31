import { CardStats } from "@/components/UI/cards/CardStats";
import GenericChart from "@/components/UI/charts/GenericChart";
import { dummyChartSingleData } from "@/constants/sellerDashboardMock";
import { useState } from "react";
import DynamicTable from "@/components/UI/tables/DTable";
import Avatar from "@/components/UI/Avatar";
import Link from "next/link";
import { Seller } from "@/types/product";
import { Sellers } from "@/constants/sellers";
import TransactionsTabs from "../../components/TransactionsTabs";
import { LanguageType } from "@/util/translations";
import { LocalizedTitle } from "@/types/language";

type Category = {
  id: string;
  name: LocalizedTitle;
  image: string;
  products: number;
};

type Brand = {
  id: string;
  name: LocalizedTitle;
  image: string;
  products: number;
};
const translations = {
  overview: {
    totalSales: { en: "Total Sales", ar: "إجمالي المبيعات" },
    totalTaxes: { en: "Total Taxes", ar: "إجمالي الضرائب" },
    netSales: { en: "Net Sales", ar: "صافي المبيعات" },
    commission: { en: "Commission", ar: "العمولة" },
    lifetimeEarnings: { en: "Lifetime earnings", ar: "الأرباح الكلية" },
    salesStatistic: { en: "Sales Statistic", ar: "إحصائيات المبيعات" },
    topSeller: { en: "Top Seller", ar: "أفضل بائع" },
    topCategory: { en: "Top Category", ar: "أفضل فئة" },
    topBrands: { en: "Top Brands", ar: "أفضل ماركات" },
    seller: { en: "Seller", ar: "بائع" },
    category: { en: "Category", ar: "فئة" },
    brand: { en: "Brand", ar: "ماركة" },
    products: { en: "Products", ar: "منتجات" },
    sales: { en: "Sales", ar: "مبيعات" },
  },
};
const Categories: Category[] = [
  {
    id: "1",
    name: {
      en: "Electronics",
      ar: "إلكترونيات",
    },
    image: "/images/categories/electronics.png",
    products: 1200,
  },
  {
    id: "2",
    name: {
      en: "Fashion",
      ar: "أزياء",
    },
    image: "/images/categories/fashion.png",
    products: 950,
  },
  {
    id: "3",
    name: {
      en: "Home Appliances",
      ar: "أجهزة منزلية",
    },
    image: "/images/categories/home.png",
    products: 700,
  },
  {
    id: "4",
    name: {
      en: "Books",
      ar: "كتب",
    },
    image: "/images/categories/books.png",
    products: 430,
  },
  {
    id: "5",
    name: {
      en: "Toys",
      ar: "ألعاب",
    },
    image: "/images/categories/toys.png",
    products: 380,
  },
];

const Brands: Brand[] = [
  {
    id: "1",
    name: {
      en: "Apple",
      ar: "آبل",
    },
    image: "/images/brands/apple.png",
    products: 340,
  },
  {
    id: "2",
    name: {
      en: "Samsung",
      ar: "سامسونج",
    },
    image: "/images/brands/samsung.png",
    products: 310,
  },
  {
    id: "3",
    name: {
      en: "Nike",
      ar: "نايك",
    },
    image: "/images/brands/nike.png",
    products: 260,
  },
  {
    id: "4",
    name: {
      en: "Sony",
      ar: "سوني",
    },
    image: "/images/brands/sony.png",
    products: 180,
  },
  {
    id: "5",
    name: {
      en: "Adidas",
      ar: "أديداس",
    },
    image: "/images/brands/adidas.png",
    products: 150,
  },
];

const getSellerColumns = (locale: LanguageType) => [
  {
    key: "name",
    header: translations.overview.seller[locale],
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
    key: "sales",
    header: translations.overview.sales[locale],
    render: (seller: Seller) => seller.products,
  },
];

const getCategoryColumns = (locale: LanguageType) => [
  {
    key: "name",
    header: translations.overview.category[locale],
    render: (category: Category) => (
      <div className="flex items-center gap-2">
        <Avatar
          className="h-7 w-7"
          imageUrl={category.image}
          name={locale === "ar" ? category.name.ar : category.name.en}
        />
        <Link href={"#"} className="text-xs hover:underline">
          {locale === "ar" ? category.name.ar : category.name.en}
        </Link>
      </div>
    ),
  },
  {
    key: "products",
    header: translations.overview.products[locale],
    render: (category: Category) => category.products,
  },
];

const getBrandColumns = (locale: LanguageType) => [
  {
    key: "name",
    header: translations.overview.brand[locale],
    render: (brand: Brand) => (
      <div className="flex items-center gap-2">
        <Avatar
          className="h-7 w-7"
          imageUrl={brand.image}
          name={locale === "ar" ? brand.name.ar : brand.name.en}
        />
        <Link href={"#"} className="text-xs hover:underline">
          {locale === "ar" ? brand.name.ar : brand.name.en}
        </Link>
      </div>
    ),
  },
  {
    key: "products",
    header: translations.overview.products[locale],
    render: (brand: Brand) => brand.products,
  },
];

const TopTabs = ({ locale }: { locale: LanguageType }) => {
  const [activeTab, setActiveTab] = useState<
    "sellers" | "categories" | "brands"
  >("sellers");

  const tabs = [
    {
      key: "sellers",
      label: {
        en: "Top Seller",
        ar: "أفضل بائع",
      },
    },
    {
      key: "categories",
      label: {
        en: "Top Category",
        ar: "أفضل فئة",
      },
    },
    {
      key: "brands",
      label: {
        en: "Top Brands",
        ar: "أفضل ماركات",
      },
    },
  ];

  const renderTable = () => {
    switch (activeTab) {
      case "sellers":
        return (
          <DynamicTable
            data={Sellers}
            columns={getSellerColumns(locale)}
            itemsPerPage={5}
            minWidth={250}
            locale={locale}
          />
        );
      case "categories":
        return (
          <DynamicTable
            data={Categories}
            columns={getCategoryColumns(locale)}
            itemsPerPage={5}
            minWidth={250}
            locale={locale}
          />
        );
      case "brands":
        return (
          <DynamicTable
            data={Brands}
            columns={getBrandColumns(locale)}
            itemsPerPage={5}
            minWidth={250}
            locale={locale}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* Tabs Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium transition ${
                activeTab === tab.key
                  ? "border-green-300 bg-green-50 text-green-600"
                  : "border-transparent text-gray-500 hover:text-green-600"
              }`}
            >
              {tab.label[locale]}
            </button>
          ))}
        </div>
      </div>
      <div className="scroll-bar-minimal max-h-[320px] overflow-y-auto">
        {/* Table Content */}
        {renderTable()}
      </div>
    </div>
  );
};

export default function OverviewPanel({
  locale = "en",
}: {
  locale: LanguageType;
}) {
  return (
    <div className="space-y-4">
      <section>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <CardStats
            title={locale === "ar" ? "إجمالي المبيعات" : "Total Sales"}
            value="24,563.00 EGP"
            details={locale === "ar" ? "الأرباح الكلية" : "Lifetime earnings"}
            icon="dollar"
            size="md"
            locale={locale}
          />
          <CardStats
            title={locale === "ar" ? "إجمالي الضرائب" : "Total Taxes"}
            value="24,563.00 EGP"
            details={locale === "ar" ? "الأرباح الكلية" : "Lifetime earnings"}
            icon="dollar"
            size="md"
            locale={locale}
          />
          <CardStats
            title={locale === "ar" ? "صافي المبيعات" : "Net Sales"}
            value="24,563.00 EGP"
            details={locale === "ar" ? "الأرباح الكلية" : "Lifetime earnings"}
            icon="dollar"
            size="md"
            locale={locale}
          />
          <CardStats
            title={locale === "ar" ? "العمولة" : "Commission"}
            value="5000 EGP"
            change="+15%"
            icon="ArrowUp"
            size="md"
            locale={locale}
          />
        </div>
      </section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-10">
        <div className="col-span-1 lg:col-span-6">
          <div className="mb-4 h-fit overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <GenericChart
              locale={locale}
              chartTitle={
                locale === "ar" ? "إحصائيات المبيعات" : "Sales Statistic"
              }
              data={dummyChartSingleData}
            />
          </div>
        </div>
        <div className="col-span-1 lg:col-span-4">
          <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <TopTabs locale={locale} />
          </div>
        </div>
      </section>
      <section>
        <TransactionsTabs locale={locale} />
      </section>
    </div>
  );
}
