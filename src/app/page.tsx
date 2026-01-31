"use client";
import LandingSlider from "@/components/UI/sliders/LandingSlider";
import CategorySlider from "@/components/UI/sliders/CategorySlider";
import Image from "next/image";
import Link from "next/link";
import SectionHeader from "@/components/UI/headings/SectionHeader";
import ProductCard from "@/components/UI/cards/ProductCard";
import { products } from "@/constants/products";
import { Banner } from "@/components/UI/Banner";
import ProductsSlider from "@/components/UI/sliders/ProductsSlider";
import BrandSlider from "@/components/UI/sliders/BrandSlider";
import DynamicButton from "@/components/UI/Buttons/DynamicButton";
import CategoryCard from "@/components/UI/cards/CategoryCard";
import {
  allCategories,
  consumableCategories,
  equipmentCategories,
  lifestyleCategories,
} from "@/constants/categouries";
import PopularSearches from "@/components/UI/PopularSearches";
import { slides } from "@/constants/sliders";
import { useLanguage } from "@/contexts/LanguageContext";

const MoreReasons = [
  {
    id: "1",
    title: {
      en: "Local finds",
      ar: "منتجات محلية",
    },
    details: {
      en: "Hand-picked brands, locally",
      ar: "علامات تجارية مختارة محليًا",
    },
    image: "/images/clothes.jpg",
    url: "#",
  },
  {
    id: "2",
    title: {
      en: "Bestsellers",
      ar: "الأكثر مبيعًا",
    },
    details: {
      en: "Fill your basket",
      ar: "املأ سلتك",
    },
    image: "/images/electronics.avif",
    url: "#",
  },
  {
    id: "3",
    title: {
      en: "Top-rated Products",
      ar: "المنتجات الأعلى تقييماً",
    },
    details: {
      en: "Stay in trend",
      ar: "ابق على الموضة",
    },
    image: "/images/watchss.jpg",
    url: "#",
  },
  {
    id: "4",
    title: {
      en: "New arrivals",
      ar: "وصل حديثًا",
    },
    details: {
      en: "Fresh takes you need",
      ar: "أحدث المنتجات التي تحتاجها",
    },
    image: "/images/medical.jpg",
    url: "#",
  },
];

const megaDeals = [
  {
    category: {
      en: "Fashion deals",
      ar: "عروض الموضة",
    },
    title: {
      en: "Summer outfits",
      ar: "ملابس صيفية",
    },
    discountText: {
      en: "Up to 70% off",
      ar: "خصم حتى 70%",
    },
    imageUrl: "/images/clothes.jpg",
    price: null,
    originalPrice: null,
    url: "#",
  },
  {
    category: {
      en: "Accessories deals",
      ar: "عروض الإكسسوارات",
    },
    title: {
      en: "Anker 5000 mAh Anker 621 Magnetic Battery (MagGo)...",
      ar: "بطارية أنكر 621 مغناطيسية 5000 مللي أمبير...",
    },
    discountText: {
      en: "899 EGP",
      ar: "٨٩٩ جنيه",
    },
    imageUrl: "/images/clothes.jpg",
    price: "899 EGP",
    originalPrice: "1799 EGP",
    url: "#",
  },
  {
    category: {
      en: "Beauty deals",
      ar: "عروض الجمال",
    },
    title: {
      en: "Trending perfumes",
      ar: "عطور رائجة",
    },
    discountText: {
      en: "Starting from 108...",
      ar: "ابتداءً من ١٠٨...",
    },
    imageUrl: "/images/clothes.jpg",
    price: "108 EGP",
    originalPrice: null,
    url: "#",
  },
  {
    category: {
      en: "Book deals",
      ar: "عروض الكتب",
    },
    title: {
      en: "Top deals",
      ar: "أفضل العروض",
    },
    discountText: {
      en: "Up to 20% off",
      ar: "خصم حتى 20%",
    },
    imageUrl: "/images/clothes.jpg",
    price: null,
    originalPrice: null,
    url: "#",
  },
];

const inFocus = [
  {
    id: "1",
    imageUrl: "/images/focus-1.avif",
    url: "#",
  },
  {
    id: "2",
    imageUrl: "/images/focus-2.avif",
    url: "#",
  },
];

export default function Home() {
  const { direction, language, isArabic } = useLanguage();

  return (
    <div className="relative">
      <section>
        {/* slider landing content  */}
        <LandingSlider dir={direction} slides={slides} />
        {/* slider Categories content  */}
        <CategorySlider
          cardSize="small"
          locale={language}
          categories={allCategories}
        />
      </section>
      <section className="hidden pb-8 xl:block">
        <div className="container mx-auto p-3 lg:max-w-[1440px]">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-3 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-gray-700">
                {isArabic ? "أشترى أكتر و بالك مرتاح" : " More reasons to shop"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {MoreReasons.map((reason) => (
                  <Link
                    href={reason.url}
                    className="overflow-hidden rounded-xl bg-gray-100"
                    key={reason.id}
                  >
                    <Image
                      className="h-[140px] w-full object-cover"
                      src={reason.image}
                      width={600}
                      height={600}
                      alt={reason.title[language]}
                    />
                    <div className="p-2">
                      <h2 className="font-semibold">
                        {reason.title[language]}
                      </h2>
                      <p className="text-xs font-medium text-secondary">
                        {reason.details[language]}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="bg-[#a8dabab1] p-4">
              <h2 className="mb-3 text-xl font-bold text-gray-700">
                {isArabic ? "عروض ميجا" : "Mega deals"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {megaDeals.map((deal, index) => (
                  <Link
                    href={deal.url}
                    key={index}
                    className="relative overflow-hidden rounded-xl bg-gray-100 shadow-sm"
                  >
                    <div className="absolute right-0 top-0 mb-2 w-fit rounded-sm bg-yellow-400 px-2 py-1 text-sm font-semibold text-black">
                      {deal.category[language]}
                    </div>
                    <Image
                      src={deal.imageUrl}
                      alt={deal.title[language]}
                      width={600}
                      height={600}
                      className="h-[140px] w-full object-cover"
                    />
                    <div className="p-2">
                      <p className="truncate text-sm text-gray-700">
                        {deal.title[language]}
                      </p>
                      <p className="text-lg font-semibold">
                        {deal.originalPrice && (
                          <span className="mr-2 text-sm text-gray-400 line-through">
                            {deal.originalPrice}
                          </span>
                        )}
                        <span className="text-sm">
                          {deal.price ?? deal.discountText[language]}
                        </span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div className="bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-gray-700">
                {isArabic ? "شوف كل الخصومات" : "In focus"}
              </h2>
              <div className="flex flex-col space-y-4">
                {inFocus.map((focus) => (
                  <Link
                    href={focus.url}
                    key={focus.id}
                    className="relative overflow-hidden rounded-xl bg-gray-100 shadow-sm"
                  >
                    <Image
                      src={focus.imageUrl}
                      alt={`${focus.id}-focus`}
                      width={600}
                      height={600}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* recommended for you section  */}
      <section className="bg-white">
        <div className="container mx-auto p-3 lg:max-w-[1440px]">
          <SectionHeader
            blackText={isArabic ? "مُقترحة" : "Recommended"}
            greenText={isArabic ? "عليك" : "for you"}
          />
          <ProductsSlider>
            {products.map((product) => (
              <div
                key={product.id}
                className="w-[200px] flex-shrink-0 md:w-[240px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </ProductsSlider>
          <div className="mt-6">
            <Banner image="/images/banner-6.jpg" url="#" />
          </div>
        </div>
      </section>
      {/* Brands section  */}
      <section className="bg-white py-6">
        <div className="container mx-auto p-3 lg:max-w-[1440px]">
          <SectionHeader
            blackText={isArabic ? "اكتشف" : "Explore"}
            greenText={
              isArabic
                ? "متاجر العلامات التجارية الرسمية"
                : "official brands stores"
            }
          />
          <BrandSlider locale={language} />
        </div>
      </section>
      {/* Consumable Category  */}
      <section className="bg-white py-6">
        <div className="container mx-auto p-3 lg:max-w-[1440px]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold sm:text-2xl">
              {isArabic ? "فئات المواد الاستهلاكية" : "Consumable"}
            </h2>
            <DynamicButton
              size="sm"
              variant="outline"
              href={"#"}
              label={isArabic ? "شوف كله" : "Shop All"}
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-6">
            {consumableCategories.slice(0, 6).map((category) => {
              return (
                <CategoryCard
                  locale={language}
                  key={category.id}
                  category={category}
                />
              );
            })}
          </div>
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold sm:text-2xl">
                {isArabic
                  ? "افضل المواد الاستهلاكية"
                  : "Consumable bestsellers"}
              </h2>
              <DynamicButton
                size="sm"
                variant="outline"
                href={"#"}
                label={isArabic ? "تسوق الان" : "Shop Now"}
              />
            </div>
            <ProductsSlider>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-[200px] flex-shrink-0 md:w-[240px]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </ProductsSlider>
          </div>
        </div>
      </section>
      {/* life style Category  */}
      <section className="bg-white py-6">
        <div className="container mx-auto p-3 lg:max-w-[1440px]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold sm:text-2xl">
              {isArabic ? " أسلوب الحياة" : "Life Style"}{" "}
            </h2>
            <DynamicButton
              size="sm"
              variant="outline"
              href={"#"}
              label={isArabic ? "شوف كله" : "Shop All"}
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-6">
            {lifestyleCategories.slice(0, 6).map((category) => {
              return (
                <CategoryCard
                  locale={language}
                  key={category.id}
                  category={category}
                />
              );
            })}
          </div>
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold sm:text-2xl">
                {isArabic
                  ? "الأكثر مبيعاً في أسلوب الحياة"
                  : "Life Style bestsellers"}
              </h2>
              <DynamicButton
                size="sm"
                variant="outline"
                href={"#"}
                label={isArabic ? "تسوق الان" : "Shop Now"}
              />
            </div>
            <ProductsSlider>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-[200px] flex-shrink-0 md:w-[240px]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </ProductsSlider>
            <div className="mt-6">
              <Banner image="/images/banner-7.avif" url="#" />
            </div>
          </div>
        </div>
      </section>
      {/* equipment Category  */}
      <section className="bg-white py-6">
        <div className="container mx-auto p-3 lg:max-w-[1440px]">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold sm:text-2xl">
              {isArabic ? "معدات" : "Equipment"}
            </h2>
            <DynamicButton
              size="sm"
              variant="outline"
              href={"#"}
              label={isArabic ? "شوف كله" : "Shop All"}
            />
          </div>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-6">
            {equipmentCategories.slice(0, 6).map((category) => {
              return (
                <CategoryCard
                  locale={language}
                  key={category.id}
                  category={category}
                />
              );
            })}
          </div>
          <div>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold sm:text-2xl">
                {isArabic ? "المعدات الأكثر مبيع" : "Equipment bestsellers"}
              </h2>
              <DynamicButton
                size="sm"
                variant="outline"
                href={"#"}
                label={isArabic ? "تسوق الان" : "Shop Now"}
              />
            </div>
            <ProductsSlider>
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-[200px] flex-shrink-0 md:w-[240px]"
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </ProductsSlider>
          </div>
        </div>
      </section>
      <section className="bg-white">
        <div className="container mx-auto p-3 lg:max-w-[1440px]">
          <PopularSearches locale={language} />
        </div>
      </section>
    </div>
  );
}
