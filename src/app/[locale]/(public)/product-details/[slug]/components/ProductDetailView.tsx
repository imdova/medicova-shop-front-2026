"use client";
import { Link } from "@/i18n/navigation";
import Head from "next/head";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";

// Components
import Breadcrumbs from "./Breadcrumbs";
import PriceSection from "./PriceSection";
import VariantSelector from "./VariantSelector";
import SellerCard from "./SellerCard";
import ProductOverview from "./ProductOverview";
import CartDrawer from "./CartDrawer";
import ProductGallery from "./ProductGallery";
import VariantSelectionModal from "./VariantSelectionModal";

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
import { useProductPage } from "../hooks/useProductPage";

// Data
import { products as allProducts } from "@/data";
import { reviews as allReviews } from "@/constants/reviews";

// Types
import { Product } from "@/types/product";

interface ProductDetailViewProps {
  product: Product | undefined;
  locale: "en" | "ar";
}

export default function ProductDetailView({ product, locale }: ProductDetailViewProps) {
  const t = useTranslations("product");
  const common = useTranslations("common");

  const reviews = allReviews; // Simplified for dummy data
  const recommendedProducts = allProducts
    .filter(
      (p) => p.category?.id === product?.category?.id && p.id !== product?.id,
    )
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
    isVariantModalOpen,
    alert,
    cartProducts,
    totalPrice,
    isInCart,
    selectedOptions,
    unitSelections,
    setSelectedSize,
    setSelectedColor,
    setQuantity,
    setIsDrawerOpen,
    setIsAuthModalOpen,
    setIsVariantModalOpen,
    setAlert,
    onUnitSelectionChange,
    handleAddToCart,
    confirmVariantSelection,
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
              setQuantity={setQuantity}
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
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { en: "Best Seller", ar: "الأكثر مبيعاً", color: "bg-orange-50 text-orange-700 border-orange-200" },
                    { en: "Free Shipping", ar: "شحن مجاني", color: "bg-blue-50 text-blue-700 border-blue-200" },
                    { en: "Original", ar: "أصلي", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                  ].map((tag, i) => (
                    <Link
                      key={i}
                      href={`/search?q=${tag.en.toLowerCase().replace(/\s+/g, "-")}`}
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-sm backdrop-blur-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 ${tag.color}`}
                    >
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current opacity-40" />
                      {locale === "ar" ? tag.ar : tag.en}
                    </Link>
                  ))}
                </div>
              </header>

              <PriceSection
                product={product}
                locale={locale}
                currentNudgeIndex={currentNudgeIndex}
                selectedOptions={selectedOptions}
              />

            </div>
          </div>
        </div>

        <VariantSelectionModal
          isOpen={isVariantModalOpen}
          onClose={() => setIsVariantModalOpen(false)}
          product={product!}
          quantity={quantity}
          selectedOptions={selectedOptions}
          unitSelections={unitSelections}
          onUnitSelectionChange={onUnitSelectionChange}
          onConfirm={confirmVariantSelection}
          locale={locale}
        />
   

        {/* Seller Section */}
        <SellerCard product={product} locale={locale} />
        {/* Extended Details */}
        <ProductOverview product={product} locale={locale} />

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
