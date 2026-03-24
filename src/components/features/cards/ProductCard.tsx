"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import FallbackImage from "@/components/shared/FallbackImage";
import LogoLoader from "../../layouts/LogoLoader";
import { Product } from "@/types/product";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addItem,
  decreaseQuantity,
  increaseQuantity,
  removeItem,
} from "@/store/slices/cartSlice";
import CartButton from "../../shared/Buttons/CartButton";
import CustomAlert from "../../shared/CustomAlert";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/slices/wishlistSlice";
import WishlistButton from "../../shared/Buttons/WishlistButton";
import { useSession } from "next-auth/react";
import { LanguageType } from "@/util/translations";
import { LocalizedTitle } from "@/types/language";
import { useLocale, useTranslations } from "next-intl";

interface ProductCardProps {
  loading?: boolean;
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ loading, product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const session = useSession();
  const [quantity, setQuantity] = useState(1);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info" | "cart" | "wishlist";
  } | null>(null);
  const locale = useLocale() as LanguageType;
  const t = useTranslations("product");
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.cart);
  const { products: wishlistData } = useAppSelector((state) => state.wishlist);
  const cartProduct = products.find((item) => item.id === product.id);
  // Check if product is in cart
  const isInCart = products.some((item) => item.id === product.id);
  const isInWishlist = wishlistData.some((item) => item.id === product.id);

  // Image navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === (product.images?.length ?? 1) - 1 ? 0 : prev + 1,
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? (product.images?.length ?? 1) - 1 : prev - 1,
    );
  };

  const selectImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Fixed useEffect hooks
  useEffect(() => {
    if (cartProduct) {
      setQuantity(cartProduct.quantity);
    } else {
      setQuantity(1);
    }
  }, [cartProduct?.quantity]);
  // Auto-rotate nudges every 3 seconds
  const nudgeCount = product.nudges
    ? product.nudges[locale as keyof LocalizedTitle].length
    : 0;

  useEffect(() => {
    if (nudgeCount === 0) return;

    // Use Intersection Observer to only run animation when visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    const element = document.getElementById(`product-card-${product.id}`);
    if (element) observer.observe(element);

    let interval: NodeJS.Timeout;
    if (isVisible) {
      interval = setInterval(() => {
        setCurrentNudgeIndex((prev) =>
          prev === nudgeCount - 1 ? 0 : prev + 1,
        );
      }, 3000);
    }

    return () => {
      if (element) observer.unobserve(element);
      if (interval) clearInterval(interval);
    };
  }, [nudgeCount, isVisible, product.id]);

  // Add useCallback to memoize functions
  const addToCart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isInCart) {
        dispatch(
          addItem({
            id: product.id,
            title: product.title,
            slug: product.slug,
            categorySlug: product.category?.slug,
            image: product.images?.[0] ?? "/images/placeholder.jpg",
            description:
              product.description[locale as keyof LocalizedTitle] ??
              "No description available",
            del_price: product.del_price,
            price: product.price ?? 0,
            shipping_fee: product.shipping_fee ?? 0,
            quantity: Math.min(quantity, product.stock ?? 1),
            brand: product.brand,
            deliveryTime: product.deliveryTime,
            sellers: product.sellers,
            stock: product.stock,
            shippingMethod: product.shippingMethod,
            weightKg: product.weightKg,
            totalPrice: (product.price ?? 0) * Math.min(quantity, product.stock ?? 1),
          }),
        );
        showAlert(t("addedToCart"), "success");
      } else {
        showAlert(t("alreadyInCart"), "cart");
      }
    },
    [dispatch, isInCart, product, quantity],
  );
  const handdleAddToWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!session.data?.user) {
        showAlert(t("pleaseLoginToWishlist"), "error");
        return;
      }

      const userId = session.data.user.id;

      try {
        if (!isInWishlist) {
          dispatch(addToWishlist(product, userId));
          showAlert(t("addedToWishlist"), "wishlist");
        } else {
          dispatch(
            removeFromWishlist({
              id: product.id,
              userId: userId,
            }),
          );
          showAlert(t("removedFromWishlist"), "wishlist");
        }
      } catch (error) {
        console.error("Wishlist operation failed:", error);
        showAlert(t("failedToUpdateWishlist"), "error");
      }
    },
    [dispatch, isInWishlist, product, quantity, session.data?.user],
  );

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      const validatedQuantity = Math.max(0, Math.floor(newQuantity));

      if (validatedQuantity === 0) {
        dispatch(removeItem(product.id));
        showAlert(t("deletedFromCart"), "error");
      } else if (validatedQuantity > quantity) {
        const increaseAmount = validatedQuantity - quantity;
        dispatch(increaseQuantity({ id: product.id, amount: increaseAmount }));
      } else {
        const decreaseAmount = quantity - validatedQuantity;
        dispatch(decreaseQuantity({ id: product.id, amount: decreaseAmount }));
      }

      if (validatedQuantity !== quantity) {
        setQuantity(validatedQuantity);
      }
    },
    [dispatch, product.id, quantity],
  );

  // Show Alert Function
  const showAlert = (
    message: string,
    type: "success" | "error" | "info" | "cart" | "wishlist",
  ) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000); // Hide after 3 seconds
  };

  return (
    <>
      {/* Global Alert Display */}
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      <div
        id={`product-card-${product.id}`}
        className="hover:ring-primary/20 group relative mx-auto h-full min-h-[300px] w-full cursor-pointer overflow-hidden rounded-[20px] bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50"
      >
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <LogoLoader className="w-[40px] animate-pulse text-gray-400" />
          </div>
        ) : (
          <div className="flex h-full flex-col">
            {product.isBestSaller && (
              <span className="absolute left-3 top-3 z-[2] rounded-full bg-gradient-to-r from-gray-800 to-gray-600 px-3 py-1 text-[10px] font-bold tracking-wider text-white shadow-sm ring-1 ring-white/50">
                {t("bestSeller")}
              </span>
            )}
            {/* Product Slider */}
            <div className="relative">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-[16px] bg-gray-50 transition-colors group-hover:bg-gray-100/50">
                <Link
                  href={product.category?.slug ? `/${locale}/category/${product.category.slug}/${product.slug[locale]}` : `/product-details/${product.id}`}
                  className="relative block h-48 w-full sm:h-64"
                >
                  <FallbackImage
                    fill
                    src={
                      product.images?.[currentImageIndex] ||
                      "/images/placeholder.jpg"
                    }
                    alt={product.title[locale as keyof LocalizedTitle]}
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 240px"
                  />
                </Link>

                {/* Image Navigation Arrows */}
                {(product.images?.length ?? 0) > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute -left-1 top-1/2 -translate-x-8 -translate-y-1/2 rounded-md bg-black/30 p-1.5 text-white transition duration-200 hover:bg-black/50 group-hover:-translate-x-0"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute -right-1 top-1/2 -translate-y-1/2 translate-x-8 rounded-md bg-black/30 p-1.5 text-white transition duration-200 hover:bg-black/50 group-hover:-translate-x-0"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnail Navigation */}
              {(product.images?.length ?? 0) > 1 && (
                <div className="invisible absolute bottom-2 left-0 right-0 mx-auto flex w-fit justify-center gap-1 rounded-full bg-gray-100 px-2 py-1 opacity-0 transition duration-300 group-hover:visible group-hover:opacity-100">
                  {product.images?.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        selectImage(index);
                      }}
                      className={`h-1 rounded-full transition duration-200 ${currentImageIndex === index ? "w-4 bg-gray-700" : "w-1 bg-gray-400"}`}
                      aria-label={`Go to product ${index + 1}`}
                    />
                  ))}
                </div>
              )}
              <div className="absolute bottom-2 left-2 rounded-md bg-white px-2">
                <div className="flex items-center gap-1">
                  <Star className="fill-light-primary text-light-primary h-3 w-3" />
                  <span className="text-sm text-gray-500">
                    {product.rating?.toFixed(1)}
                  </span>
                </div>
              </div>
              <CartButton
                isInCart={isInCart}
                quantity={quantity}
                addToCart={addToCart}
                handleQuantityChange={handleQuantityChange}
                maxStock={product.stock}
                productId={product.id}
              />

              <WishlistButton
                addToWishlist={handdleAddToWishlist}
                isInWishlist={isInWishlist}
                productId={product.id}
              />
            </div>

            <Link
              href={product.category?.slug ? `/${locale}/category/${product.category.slug}/${product.slug[locale]}` : `/product-details/${product.id}`}
              className="flex h-full flex-1 flex-col justify-between"
            >
              {/* Product Info */}
              <div className="flex h-full flex-col gap-2 px-1 pb-1 pt-3">
                <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-gray-800">
                  {product.title[locale as keyof LocalizedTitle]}
                </h3>

                <div className="flex flex-wrap items-baseline gap-2">
                  <p
                    className={`flex items-baseline gap-1 ${locale === "ar" ? "flex-row-reverse" : ""}`}
                  >
                    <span className="text-lg font-bold text-gray-900">
                      {product.price.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      {locale === "ar" ? "جنيه" : "EGP"}
                    </span>
                  </p>
                  {product.del_price && (
                    <del className="text-xs font-medium text-gray-400">
                      {product.del_price.toLocaleString()}{" "}
                      {locale === "ar" ? "جنيه" : "EGP"}
                    </del>
                  )}
                </div>

                {/* Nudges Slider */}
                {(product.nudges?.[locale as keyof LocalizedTitle]?.length ??
                  0) > 0 && (
                  <div className="relative h-5 overflow-hidden">
                    <div
                      className="flex flex-col transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateY(-${currentNudgeIndex * 20}px)`,
                      }}
                    >
                      {product.nudges?.[locale as keyof LocalizedTitle]?.map(
                        (nudge, index) => (
                          <div
                            key={index}
                            className="flex h-5 items-center text-[11px] font-medium text-amber-600"
                          >
                            {nudge}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductCard;
