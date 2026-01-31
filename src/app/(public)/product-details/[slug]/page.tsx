"use client";
import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { products } from "@/constants/products";
import NotFound from "@/app/not-found";
import Image from "next/image";
import ProductImagesSlider from "@/components/UI/sliders/ProductImagesSlider";
import InfoCards from "@/components/UI/InfoCards";
import {
  Archive,
  Check,
  ChevronLeft,
  ChevronRight,
  Handshake,
  Landmark,
  ListRestart,
  RefreshCcw,
  ShoppingBag,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import { ProgressLine } from "@/components/UI/ProgressLine";
import { LiquidSizeType, NumericSizeType, SizeType } from "@/types";
import MobileCartNavbar from "@/components/Layout/NavbarMobile/MobileCartNavbar";
import QuantitySelector from "@/components/Forms/formFields/QuantitySelector";
import ProductReviews from "@/components/UI/ProductReviews";
import { reviews } from "@/constants/reviews";
import ProductsSlider from "@/components/UI/sliders/ProductsSlider";
import ProductCard from "@/components/UI/cards/ProductCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem, increaseQuantity, setCart } from "@/store/slices/cartSlice";
import CustomAlert from "@/components/UI/CustomAlert";
import { Drawer } from "@/components/UI/Drawer";
import LoadingAnimation from "@/components/UI/LoadingAnimation";
import { getExecuteDateFormatted } from "@/util";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "@/components/UI/Modals/DynamicModal";
import AuthLogin from "@/components/UI/Modals/loginAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const translations = {
  addToCart: {
    en: "Add to Cart",
    ar: "أضف إلى السلة",
  },
  updateCart: {
    en: "Update Cart",
    ar: "تحديث السلة",
  },
  outOfStock: {
    en: "Out of Stock",
    ar: "غير متوفر",
  },
  adding: {
    en: "Adding...",
    ar: "جارٍ الإضافة...",
  },
};

const ProductPage = ({ params }: ProductPageProps) => {
  const { slug } = React.use(params);
  const product = products.find((product) => product.id === slug);
  const session = useSession();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<
    SizeType | NumericSizeType | LiquidSizeType | undefined
  >();
  const { language } = useLanguage();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const dispatch = useAppDispatch();
  const { products: productData, totalPrice } = useAppSelector(
    (state) => state.cart,
  );
  const cartProduct = productData.find((item) => item.id === product?.id);
  // Check if product is in cart
  const isInCart = productData.some((item) => item.id === product?.id);

  const [isClient, setIsClient] = useState(false);

  const onCheckout = () => {
    if (session.data?.user) {
      router.push("/checkout");
    } else {
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    setIsClient(true);

    // Load cart from localStorage only on the client
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          // Dispatch the setCart action to update the Redux store
          dispatch(setCart(JSON.parse(savedCart)));
        }
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
  }, [dispatch]); // Add dispatch to dependency array

  useEffect(() => {
    // Set the initial size

    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }

    // Set the initial color
    if (product?.colors && product.colors["en"].length > 0) {
      setSelectedColor(product.colors?.en?.[0]);
    }
  }, [product?.sizes, product?.colors]);

  // Auto-rotate nudges every 3 seconds
  const nudgeCount = product?.nudges ? product?.nudges["en"]?.length : 0;

  useEffect(() => {
    if (nudgeCount === 0) return;

    const interval = setInterval(() => {
      setCurrentNudgeIndex((prev) => (prev === nudgeCount - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [nudgeCount]);

  useEffect(() => {
    if (cartProduct) {
      setQuantity(cartProduct.quantity);
    } else {
      setQuantity(1);
    }
  }, [cartProduct?.quantity]);

  const handleAddToCart = async () => {
    setLoading(true);

    // Simulate delay for loader effect (remove in production)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (!product?.id) {
      showAlert(
        language === "ar"
          ? "معلومات المنتج غير متوفرة"
          : "Product information is missing",
        "error",
      );
      setLoading(false);
      return;
    }

    if (!isInCart) {
      // Add new item to cart
      dispatch(
        addItem({
          id: product.id,
          title: product.title ?? "",
          image: product.images?.[0] ?? "/images/placeholder.jpg",
          description: product.description.en ?? "No description available",
          del_price: product.del_price,
          price: product.price ?? 0,
          shipping_fee: product.shipping_fee ?? 0,
          quantity: Math.min(quantity, product.stock ?? 1), // Ensure we don't exceed stock
          brand: product.brand,
          deliveryTime: product.deliveryTime,
          sellers: product.sellers,
          stock: product.stock,
          color: selectedColor,
          size: selectedSize,
          shippingMethod: product.shippingMethod,
          weightKg: product.weightKg,
        }),
      );
      showAlert(
        language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart",
        "success",
      );
    } else {
      // Product is already in cart - handle quantity increase
      const currentCartItem = productData.find(
        (item) => item.id === product.id,
      );
      const currentQuantity = currentCartItem?.quantity ?? 0;
      const availableStock = product.stock ?? 0;
      const requestedTotal = currentQuantity + quantity;

      if (requestedTotal > availableStock) {
        const canAdd = availableStock - currentQuantity;
        if (canAdd > 0) {
          dispatch(
            increaseQuantity({
              id: product.id,
              amount: canAdd,
            }),
          );
          showAlert(
            language === "ar"
              ? `متاح فقط ${canAdd} عناصر إضافية. تم إضافتها إلى الكمية الحالية.`
              : `Only ${canAdd} more available. Added to your existing quantity.`,
            "info",
          );
        } else {
          showAlert(
            language === "ar"
              ? "لا توجد عناصر إضافية متاحة في المخزون"
              : "No more items available in stock",
            "error",
          );
        }
      } else {
        dispatch(
          increaseQuantity({
            id: product.id,
            amount: quantity,
          }),
        );
        showAlert(
          language === "ar"
            ? `تمت إضافة ${quantity} عنصرًا آخر إلى سلة التسوق`
            : `Added ${quantity} more to your cart`,
          "success",
        );
      }
    }
    setIsOpen(true);
    setLoading(false);
  };

  // Show Alert Function
  const showAlert = (message: string, type: "success" | "error" | "info") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000); // Hide after 3 seconds
  };

  if (!isClient) {
    return <LoadingAnimation />;
  }

  if (!product) return <NotFound />;

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50">
      {/* Global Alert Display */}
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <Head>
        <title>
          {product.title[language]} |{" "}
          {language === "ar" ? "ميديكوفا" : "Medicova"}
        </title>
        <meta name="description" content={product.description["en"]} />
      </Head>

      {/* Navigation Breadcrumbs */}
      <nav className="bg-white px-4 py-2">
        <div className="container mx-auto">
          <div className="flex flex-wrap items-center gap-2 py-2 text-xs text-gray-600 md:flex-nowrap md:gap-y-0 md:text-sm">
            {/* Home Link */}
            <div className="flex items-center gap-2">
              <Link href="/" className="whitespace-nowrap hover:text-primary">
                {language === "ar" ? "المتجر" : "Home"}
              </Link>
              {language === "ar" ? (
                <ChevronLeft className="h-3 w-3 text-secondary" />
              ) : (
                <ChevronRight className="h-3 w-3 text-secondary" />
              )}
            </div>

            {/* Category */}
            <div className="flex items-center gap-2">
              <Link
                href={product.category?.slug ?? "#"}
                className="whitespace-nowrap hover:text-primary"
              >
                {product.category?.title[language]}
              </Link>
              {product.category?.subcategory && (
                <>
                  {language === "ar" ? (
                    <ChevronLeft className="h-3 w-3 text-secondary" />
                  ) : (
                    <ChevronRight className="h-3 w-3 text-secondary" />
                  )}
                </>
              )}
            </div>

            {/* Single SubCategory */}
            {product.category?.subcategory && (
              <div className="flex items-center gap-1">
                <Link
                  href={product.category?.subcategory?.url ?? "#"}
                  className="whitespace-nowrap hover:text-primary"
                >
                  {product.category?.subcategory?.title[language]}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <Drawer
        mobile={false}
        hiddenCloseBtn
        position="right"
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <ul className="max-h-[500px] max-w-[270px] overflow-y-auto">
          {productData.map((item) => {
            return (
              <li className="mb-2" key={item.id}>
                <Link href={`/product-details/${item.id}`}>
                  <div className="flex h-[100px] gap-2">
                    <div>
                      <Image
                        className="h-full w-[80px] object-cover"
                        src={item.image}
                        width={300}
                        height={300}
                        alt={item.title?.[language] || "Product image"}
                      />
                    </div>
                    <div className="flex-1">
                      <h2 className="mb-2 text-sm font-semibold">
                        {item.title[language]}
                      </h2>
                      <div className="flex items-center gap-1 text-xs">
                        {" "}
                        {language === "ar"
                          ? "تمت الإضافة إلى سلة التسوق"
                          : "Added to cart"}
                        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-primary text-white">
                          <Check size={10} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-3 flex justify-between gap-2 font-semibold text-gray-700">
          <span className="text-sm">
            {language === "ar" ? "إجمالي السلة" : "Cart Total"}
          </span>
          <p className="text-sm">
            {" "}
            {language === "ar" ? "جنيه" : "EGP"} {totalPrice}
          </p>
        </div>

        <div>
          <button
            onClick={onCheckout}
            className="mt-6 w-full rounded-lg bg-primary px-4 py-2 text-xs font-semibold uppercase text-white transition hover:bg-green-700"
          >
            {language === "ar" ? "الدفع" : "CHECKOUT"}
          </button>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold uppercase text-primary"
          >
            {language === "ar" ? "متابعة التسوق" : "Continue Shopping"}
          </button>
        </div>
      </Drawer>
      {/* Main Product Section */}
      <main className="container mx-auto bg-white p-3 lg:max-w-[1440px]">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-10 md:gap-6">
          <div className="col-span-1 h-full bg-white md:col-span-5 lg:col-span-3">
            <div className="my-3 block md:hidden">
              <Link
                href={product.brand?.url ?? "#"}
                className="mb-3 text-xl font-semibold text-secondary"
              >
                {product.brand?.name[language]}
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">
                {product.title[language]}
              </h1>
            </div>
            <div className="my-3 flex w-fit items-center gap-1 rounded-lg bg-gray-200 px-3 py-1 text-sm md:hidden">
              <span className="text-primary">★</span>
              {product.rating}
              <span className="text-[10px] text-gray-600">
                ({product.reviewCount?.toLocaleString()})
              </span>
            </div>
            {/* Product Images - Left Side */}
            <div className="sticky top-4 h-fit rounded-lg bg-white p-4">
              <ProductImagesSlider
                locale={language}
                product={product}
                images={product.images}
              />
              <div className="mt-4 hidden gap-2 md:flex">
                <QuantitySelector
                  productId={product?.id ?? ""}
                  initialQuantity={quantity}
                  min={1}
                  max={product?.stock || 99}
                  buttonSize="md"
                  showLabel={false}
                  className="flex-1"
                />
                <button
                  onClick={handleAddToCart}
                  disabled={loading || !product?.stock}
                  className={`ml-4 flex flex-1 items-center justify-center gap-2 rounded-sm px-4 py-3 text-xs font-medium text-white transition-colors ${
                    loading
                      ? "cursor-not-allowed bg-green-400"
                      : "bg-primary hover:bg-green-800"
                  } ${!product?.stock ? "cursor-not-allowed bg-gray-400" : ""}`}
                >
                  {loading ? (
                    translations.adding[language]
                  ) : product?.stock ? (
                    <>
                      <ShoppingCart size={15} />
                      {isInCart
                        ? translations.updateCart[language]
                        : translations.addToCart[language]}
                    </>
                  ) : (
                    translations.outOfStock[language]
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* Product Details - Right Side */}
          <div className="col-span-1 grid grid-cols-1 gap-3 md:col-span-5 lg:col-span-7 lg:grid-cols-7">
            <div className="col-span-1 lg:col-span-4">
              <div className="bg-white">
                <div className="hidden md:block">
                  <Link
                    href={product.brand?.url ?? "#"}
                    className="mb-3 text-xl font-semibold text-secondary"
                  >
                    {product.brand?.name[language]}
                  </Link>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {product.title[language]}
                  </h1>
                </div>

                {/* Rating */}
                <div className="mt-2 hidden w-full items-center justify-between md:flex">
                  <div
                    className={`flex items-center ${language === "ar" && "flex-row-reverse"}`}
                  >
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${i < Math.floor(product.rating ?? 0) ? "text-primary" : "text-gray-300"} `}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 cursor-pointer text-xs text-blue-600 hover:underline">
                      {product.rating} ★ (
                      {product.reviewCount?.toLocaleString()}{" "}
                      {language === "ar" ? "تقييم" : "Ratings"})
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 text-lg font-bold text-gray-800">
                      <p>{product.price?.toLocaleString()}</p>
                      {language === "ar" ? "جنيه" : "EGP"}{" "}
                    </div>
                    {product.del_price && (
                      <>
                        <div className="flex gap-1 text-sm text-gray-500 line-through">
                          <p>{product.del_price.toLocaleString()}</p>
                          {language === "ar" ? "جنيه" : "EGP"}{" "}
                        </div>
                      </>
                    )}
                  </div>
                  {product.del_price && (
                    <p className="flex items-center gap-2 text-xs">
                      {language === "ar" ? "خصم:" : "Saving:"}{" "}
                      <span className="text-light-primary flex items-center gap-1 text-xs font-semibold">
                        <span className="text-sm">
                          {product.del_price - product.price}
                        </span>
                        {language === "ar" ? "جنيه" : "EGP"}
                      </span>
                    </p>
                  )}
                  {product.stock && (
                    <div className="mt-2 flex items-center gap-1 text-xs">
                      <ShoppingBag size={13} className="text-light-primary" />
                      {language === "en" ? (
                        <>Only {product.stock} left in stock</>
                      ) : (
                        <>متبقي فقط {product.stock} في المخزون</>
                      )}
                    </div>
                  )}
                </div>
                {/* Nudges Slider - Fixed to match screenshot */}
                <div className="relative mt-1 h-6 overflow-hidden">
                  <div
                    className="flex flex-col transition-transform duration-300 ease-in-out"
                    style={{
                      transform: `translateY(-${currentNudgeIndex * 24}px)`,
                    }}
                  >
                    {product.nudges?.[language]?.map((nudge, index) => (
                      <div
                        key={index}
                        className="flex h-6 items-center text-xs text-gray-600"
                      >
                        {nudge}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery */}
                <div className="mt-4 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    {product.shippingMethod && (
                      <div className="flex items-center text-xs font-semibold">
                        <span className="bg-light-primary rounded px-2 py-1 text-white">
                          {product.shippingMethod[language]}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-bold text-gray-700">
                      {language === "ar" ? "احصل عليه خلال" : "Get it by"}{" "}
                      {product.deliveryTime?.[language]} (
                      {getExecuteDateFormatted(
                        product.deliveryTime?.[language] ?? "",
                        "EEE, MMM d",
                        language,
                      )}
                      )
                    </span>
                  </div>
                </div>

                {/* Installment */}
                <div className="mt-4 rounded-lg border border-gray-300 p-3">
                  {product.installmentOptions?.map((option, index) => (
                    <div
                      className="flex items-center justify-between gap-3"
                      key={index}
                    >
                      <Image
                        src={option.methodType.image}
                        className="w-16 rounded-md object-cover"
                        width={300}
                        height={300}
                        alt={option.methodType.name}
                      />

                      <div className="mt-1 text-sm text-secondary">
                        {option.months}{" "}
                        {language === "ar"
                          ? "دفعات شهرية جنيه مصري"
                          : "monthly payments of EGP"}
                        {option.amount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Skeleton */}
                <div>
                  <InfoCards locale={language} />
                </div>

                {/* Variant Selection */}
                <div id="Variant" className="mt-6 space-y-4">
                  {/* Colors */}
                  {product.colors && (
                    <div>
                      <div className="font-medium">
                        {language === "ar" ? "دليل الالوان" : "COLOR GUIDE:"}
                      </div>
                      <div className="mt-2 flex gap-2">
                        {product.colors["en"].map((color, index) => (
                          <button
                            key={index}
                            style={{ background: color }}
                            onClick={() => setSelectedColor(color)}
                            className={`h-8 w-8 rounded-full border-2 border-white outline ${selectedColor === color ? "outline-1 outline-gray-800" : "outline-1 outline-gray-200"}`}
                          ></button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Sizes */}
                  {product.sizes && (
                    <div>
                      <div className="font-medium">
                        {language === "ar" ? "دليل المقاسات" : "SIZE GUIDE:"}
                      </div>
                      <div className="mt-2 flex gap-2">
                        {product.sizes.map((size, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedSize(size)}
                            className={`rounded border px-3 py-1 ${selectedSize === size ? "border-green-500 bg-green-50 text-green-600" : "border-gray-300"}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Seller and banks information  */}
            <div className="col-span-1 lg:col-span-3">
              {/* Bank Offers */}
              <div className="my-6 rounded-lg">
                <div className="font-bold">
                  {language === "ar" ? "عروض البنوك" : "BANK OFFERS"}
                </div>
                <ul className="mt-2 space-y-1">
                  {product.bankOffers?.map((offer, index) => (
                    <li key={index}>
                      <Link
                        href={offer.url}
                        className="flex items-center justify-between rounded-md border border-gray-300 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <Landmark size={22} className="text-primary" />
                          <span className="ml-2 text-xs">
                            {offer.title[language]}
                          </span>
                        </div>
                        <ChevronRight className="text-secondary" size={15} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Seller Information */}
              <h2 className="mb-2 font-bold">
                {language === "ar" ? "البائع" : "SELLER"}{" "}
              </h2>
              <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
                <div className="flex items-start justify-between">
                  <Link
                    href={"#"}
                    className="flex w-full items-center justify-between gap-3 border-b border-gray-300 p-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-primary">
                        <Store size={25} />
                      </span>
                      <div>
                        {product.sellers && (
                          <div className="mb-1">
                            {language === "ar" ? "تباع من قبل" : "Sold by"}{" "}
                            <span className="text-xs text-primary underline">
                              {product.sellers?.name}
                            </span>
                          </div>
                        )}
                        {product.sellers && (
                          <div className="text-gray-600">
                            {product.sellers.positiveRatings}{" "}
                            {language === "ar"
                              ? "التقييمات الإيجابية"
                              : "Positive Ratings"}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="text-secondary" size={15} />
                  </Link>
                </div>
                <Link
                  href={"#"}
                  className="mt-2 grid grid-cols-2 gap-3 p-3 text-sm"
                >
                  {product.sellers && (
                    <div className="flex items-center gap-3">
                      <Archive size={16} className="text-primary" />
                      <span className="ml-1 text-sm font-semibold">
                        {language === "ar"
                          ? "البند كما هو مبين"
                          : "Item as shown"}
                        <ProgressLine
                          progress={product.sellers.itemShown ?? 0}
                          height="h-1"
                          showLabel
                        />
                      </span>
                    </div>
                  )}

                  <div className="mt-1 flex items-center">
                    {product.sellers && (
                      <div className="flex items-center gap-3 text-sm font-semibold">
                        <Handshake size={16} className="text-primary" />
                        {language === "ar"
                          ? "شريك منذ  "
                          : "Partner since"}{" "}
                        {product.sellers.partnerSince}
                      </div>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm font-semibold">
                    <ListRestart size={16} className="text-primary" />
                    {language === "ar"
                      ? "بائع ذو عائد منخفض"
                      : "Low return seller"}
                  </div>
                </Link>
              </div>
              <div className="mt-4 rounded-lg bg-white shadow-sm">
                <div className="rounded-lg border border-gray-300">
                  <div className="flex flex-col text-sm">
                    <Link
                      className="flex items-center justify-between border-b border-gray-300 p-3"
                      href={"#"}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <Truck size={16} className="text-primary" />
                        {language === "ar"
                          ? "توصيل مجاني للخزائن ونقاط الاستلام"
                          : "Free delivery on Lockers & Pickup Points"}
                      </div>
                      <ChevronRight className="text-secondary" size={15} />
                    </Link>
                    {product.sellers && (
                      <Link
                        className="flex items-center justify-between p-3"
                        href={"#"}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <RefreshCcw size={16} className="text-primary" />
                          {product.sellers.returnPolicy[language]}
                        </div>
                        <ChevronRight className="text-secondary" size={15} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-16">
          <h1 className="border-b border-gray-300 py-2 text-2xl font-bold text-gray-600">
            {language === "ar" ? "نظرة عامة على المنتج" : "Product Overview"}
          </h1>
          {/* products highlights  */}
          {product.highlights && (
            <div className="mt-4 text-gray-600">
              <h2 className="mb-2 font-bold">
                {language === "ar" ? "ابرز المميزات" : "Hightlights"}
              </h2>
              <ul className="list-disc pl-4">
                {product.highlights[language]?.map((highlight, index) => {
                  return (
                    <li className="text-sm" key={index}>
                      {highlight}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {/* products overview describtion  */}
          {product.overview_desc && (
            <div className="mt-4 text-gray-600">
              <h2 className="mb-2 font-bold">
                {language === "ar" ? "نظرة عامة" : "Overview"}
              </h2>
              <p className="text-sm">{product.overview_desc[language]}</p>
            </div>
          )}
          {/* products Specfications  */}
          {product.specifications && (
            <div className="mt-4 text-gray-600">
              <h2 className="mb-2 font-bold">
                {language === "ar" ? "المواصفات" : "Specfications"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-3">
                {product.specifications.map((spec, index) => {
                  return (
                    <div
                      className={`flex items-center p-2 text-xs md:text-sm ${
                        // On mobile
                        index % 2 === 0 ? "bg-gray-100" : ""
                      } ${
                        // On desktop
                        Math.floor(index / 2) % 2 === 0
                          ? "md:bg-gray-100"
                          : "md:bg-transparent"
                      }`}
                      key={index}
                    >
                      <div className="w-full">{spec.label[language]}</div>
                      <div className="w-full">{spec.content[language]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="py-8">
          <h1 className="border-b border-gray-300 py-2 text-2xl font-bold text-gray-600">
            {language === "ar"
              ? "تقييمات ومراجعات المنتج"
              : " Product Ratings & Reviews"}
          </h1>
          <ProductReviews locale={language} reviews={reviews} />
        </div>
        {/* Brand Products */}
        <div className="mt-6 rounded-lg bg-white shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-gray-600">
            {language === "ar" ? "المزيد من" : "More from"}{" "}
            {product.brand?.name[language]}
          </h2>
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
        {/* Products related this Product */}
        <div className="mt-6 rounded-lg bg-white shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-gray-600">
            {language === "ar"
              ? "منتجات ذات صلة بهذا"
              : "Products related to this"}
          </h2>
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
        <MobileCartNavbar
          product={product}
          quantity={quantity}
          setQuantity={setQuantity}
          handleAddToCart={handleAddToCart}
          loading={loading}
          locale={language}
        />
        <div className="relative z-[5000]">
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            size="lg"
          >
            <AuthLogin redirect="/checkout" />
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default ProductPage;
