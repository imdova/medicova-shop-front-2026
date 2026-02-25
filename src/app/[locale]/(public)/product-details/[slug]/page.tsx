"use client";
import { use } from "react";
import Link from "next/link";
import Head from "next/head";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

// Components
import Breadcrumbs from "./components/Breadcrumbs";
import PriceSection from "./components/PriceSection";
import VariantSelector from "./components/VariantSelector";
import SellerCard from "./components/SellerCard";
import ProductOverview from "./components/ProductOverview";
import CartDrawer from "./components/CartDrawer";
import ProductGallery from "./components/ProductGallery";
import BankOffers from "./components/BankOffers";
import SectionHeader from "@/components/features/headings/SectionHeader";
import MobileCartNavbar from "@/components/layouts/Layout/NavbarMobile/MobileCartNavbar";
const ProductReviews = dynamic(
  () => import("@/components/features/ProductReviews"),
  {
    loading: () => (
      <div className="h-40 animate-pulse rounded-xl bg-gray-100" />
    ),
    ssr: false,
  },
);

const ProductsSlider = dynamic(
  () => import("@/components/features/sliders/ProductsSlider"),
  {
    loading: () => (
      <div className="h-60 animate-pulse rounded-xl bg-gray-100" />
    ),
    ssr: false,
  },
);
import ProductCard from "@/components/features/cards/ProductCard";
import LoadingAnimation from "@/components/layouts/LoadingAnimation";
import CustomAlert from "@/components/shared/CustomAlert";
import Modal from "@/components/shared/Modals/DynamicModal";
import AuthLogin from "@/components/shared/Modals/loginAuth";
import NotFound from "@/app/[locale]/not-found";

// Hooks
import { useProductPage } from "./hooks/useProductPage";

// Data
import { products as allProducts } from "@/data";
import { reviews as allReviews } from "@/constants/reviews";

// Types
import { Product, ReviewType } from "@/types/product";

interface ProductPageProps {
  params: Promise<{ slug: string; locale: "en" | "ar" }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Product Details Page
 * Refactored for performance, accessibility, and clean code.
 */
export default function ProductPage({ params }: ProductPageProps) {
  const { slug, locale } = use(params);
  const t = useTranslations("product");
  const common = useTranslations("common");

  // Lookup product by slug
  const product = allProducts.find((p) => p.id === slug || p.sku === slug);
  const reviews = allReviews; // Simplified for dummy data
  const recommendedProducts = allProducts
    .filter(
      (p) => p.category?.id === product?.category?.id && p.id !== product?.id,
    )
    .slice(0, 10);
  const brandProducts = allProducts
    .filter((p) => p.brand?.id === product?.brand?.id && p.id !== product?.id)
    .slice(0, 10);

  const {
    isClient,
    loading,
    selectedSize,
    selectedColor,
    quantity,
    currentNudgeIndex,
    isDrawerOpen,
    isAuthModalOpen,
    alert,
    cartProducts,
    totalPrice,
    isInCart,
    setSelectedSize,
    setSelectedColor,
    setQuantity,
    setIsDrawerOpen,
    setIsAuthModalOpen,
    setAlert,
    handleAddToCart,
    handleCheckout,
  } = useProductPage({ product });

  if (!isClient) return <LoadingAnimation />;
  if (!product) return <NotFound />;

  return (
    <div className="selection:bg-primary/10 min-h-screen bg-gray-50 text-gray-900">
      <Head>
        <title>{`${product.title[locale]} | ${common("copyright").split(".")[0]}`}</title>
        <meta name="description" content={product.description[locale]} />
      </Head>

      {/* Persistence/State UI */}
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <CartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        cartItems={cartProducts}
        totalPrice={totalPrice}
        onCheckout={handleCheckout}
        locale={locale}
      />

      {/* Breadcrumbs */}
      <Breadcrumbs product={product} locale={locale} />

      {/* Main Content */}
      <main className="container mx-auto py-8 lg:max-w-[98%]">
        <div className="flex flex-wrap items-stretch gap-4">
          {/* Left Column: Images & Primary Action */}
          <div className="w-full md:w-[45%]">
            <ProductGallery
              product={product}
              locale={locale}
              quantity={quantity}
              loading={loading}
              isInCart={isInCart}
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Right Column: Details */}
          <div className="animate-in fade-in slide-in-from-right-4 flex w-full flex-1 flex-col rounded-3xl border border-white/40 bg-white/40 p-6 shadow-xl backdrop-blur-xl duration-1000 max-md:w-[45%]">
            {/* Core Info */}
            <div className="w-full">
              <header className="hidden md:block">
                <Link
                  href={product.brand?.url ?? "#"}
                  className="mb-1 text-lg font-semibold text-secondary transition-colors hover:text-primary"
                >
                  {product.brand?.name[locale]}
                </Link>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900">
                  {product.title[locale]}
                </h1>
              </header>

              <PriceSection
                product={product}
                locale={locale}
                currentNudgeIndex={currentNudgeIndex}
              />

              <VariantSelector
                colors={product.colors}
                sizes={product.sizes}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onColorSelect={setSelectedColor}
                onSizeSelect={setSelectedSize}
                locale={locale}
              />
            </div>
          </div>
        </div>
        <BankOffers product={product} locale={locale} />

        {/* Seller Section */}
        <SellerCard product={product} locale={locale} />
        {/* Extended Details */}
        <ProductOverview product={product} locale={locale} />

        {/* Bank Offers Section */}

        {/* Reviews */}
        <section className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="mb-6 text-2xl font-bold text-gray-800">
            {t("reviews")}
          </h2>
          <ProductReviews locale={locale} reviews={reviews} />
        </section>

        {/* Recommendations */}
        <section className="mt-16 space-y-16 pb-20 md:pb-12">
          <div className="animate-in fade-in slide-in-from-bottom-4 delay-300 duration-1000">
            <SectionHeader
              blackText={locale === "ar" ? "منتجات" : "Recommended"}
              greenText={locale === "ar" ? "قد تعجبك" : "for you"}
            />
            <ProductsSlider>
              {recommendedProducts.map((p) => (
                <div
                  key={p.id}
                  className="w-[200px] flex-shrink-0 px-1 py-4 md:w-[240px]"
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </ProductsSlider>
          </div>
        </section>

        {/* Mobile Sticky CTA */}
        <MobileCartNavbar
          product={product}
          quantity={quantity}
          setQuantity={setQuantity}
          handleAddToCart={handleAddToCart}
          loading={loading}
          locale={locale}
        />

        {/* Auth Modal */}
        <Modal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          size="lg"
        >
          <AuthLogin redirect="/checkout" />
        </Modal>
      </main>
    </div>
  );
}
