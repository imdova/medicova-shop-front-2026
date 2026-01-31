"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import LogoLoader from "../LogoLoader";
import { Product } from "@/types/product";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addItem,
  decreaseQuantity,
  increaseQuantity,
  removeItem,
} from "@/store/slices/cartSlice";
import CartButton from "../Buttons/CartButton";
import CustomAlert from "../CustomAlert";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/store/slices/wishlistSlice";
import WishlistButton from "../Buttons/WishlistButton";
import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductCardProps {
  loading?: boolean;
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ loading, product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0);
  const session = useSession();
  const [quantity, setQuantity] = useState(1);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info" | "cart" | "wishlist";
  } | null>(null);
  const { language } = useLanguage();
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
  const nudgeCount = product.nudges ? product.nudges[language].length : 0;

  useEffect(() => {
    if (nudgeCount === 0) return;

    const interval = setInterval(() => {
      setCurrentNudgeIndex((prev) => (prev === nudgeCount - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [nudgeCount]);

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
            image: product.images?.[0] ?? "/images/placeholder.jpg",
            description: product.description.en ?? "No description available",
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
          }),
        );
        showAlert(
          language === "ar" ? "تمت الإضافة إلى السلة" : "Added to cart",
          "success",
        );
      } else {
        showAlert(
          language === "ar"
            ? "المنتج موجود بالفعل في السلة!"
            : "Product already in cart!",
          "cart",
        );
      }
    },
    [dispatch, isInCart, product, quantity],
  );
  const handdleAddToWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!session.data?.user) {
        showAlert(
          language === "ar"
            ? "يرجى تسجيل الدخول لإضافة العناصر إلى قائمة الرغبات"
            : "Please login to add items to your wishlist",
          "error",
        );
        return;
      }

      const userId = session.data.user.id;

      try {
        if (!isInWishlist) {
          dispatch(addToWishlist(product, userId));
          showAlert(
            language === "ar"
              ? "تمت الإضافة إلى قائمة الرغبات"
              : "Added to wishlist",
            "wishlist",
          );
        } else {
          dispatch(
            removeFromWishlist({
              id: product.id,
              userId: userId,
            }),
          );
          showAlert(
            language === "ar"
              ? "تمت الازالة من قائمة الرغبات"
              : "Remove From wishlist",
            "wishlist",
          );
        }
      } catch (error) {
        console.error("Wishlist operation failed:", error);
        showAlert(
          language === "ar"
            ? "فشل في تحديث قائمة الرغبات"
            : "Failed to update wishlist",
          "error",
        );
      }
    },
    [dispatch, isInWishlist, product, quantity, session.data?.user],
  );

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      const validatedQuantity = Math.max(0, Math.floor(newQuantity));

      if (validatedQuantity === 0) {
        dispatch(removeItem(product.id));
        showAlert(
          language === "ar" ? "تم الحذف من السلة" : "Deleted from cart",
          "error",
        );
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
      <div className="group relative mx-auto h-full min-h-[300px] w-full cursor-pointer overflow-hidden rounded-xl border border-gray-300 bg-white p-2 shadow-sm">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <LogoLoader className="w-[40px] animate-pulse text-gray-400" />
          </div>
        ) : (
          <div className="flex h-full flex-col">
            {product.isBestSaller && (
              <span className="absolute left-3 top-3 z-[2] rounded-full bg-gray-800 px-3 py-1 text-[10px] font-semibold text-white">
                {language === "ar" ? "أفضل المنتجات" : "Best Saller"}
              </span>
            )}
            {/* Product Slider */}
            <div className="relative">
              {/* Main Image */}
              <div className="relative overflow-hidden rounded-lg bg-gray-100">
                <Link href={`/product-details/${product.id}`}>
                  <Image
                    width={200}
                    height={200}
                    src={
                      product.images?.[currentImageIndex] ||
                      "/images/placeholder.jpg"
                    }
                    alt={product.title[language]}
                    className="h-48 w-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 sm:h-64"
                    priority={currentImageIndex === 0} // Only prioritize first image
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
                  <Star className="h-3 w-3 fill-light-primary text-light-primary" />
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
              href={`/product-details/${product.id}`}
              className="flex h-full flex-1 flex-col justify-between"
            >
              {/* Product Info */}
              <div className="p-1">
                <h3 className="mt-2 text-sm font-semibold text-gray-700">
                  {product.title[language]}
                </h3>

                <div className="m-2 flex flex-wrap items-center gap-1 text-sm sm:gap-3">
                  <p
                    className={`flex items-center gap-1 ${language === "ar" ? "flex-row-reverse" : ""}`}
                  >
                    {language === "ar" ? "جنيه" : "EGP"}{" "}
                    <span className="text-lg font-bold">
                      {product.price.toLocaleString()}
                    </span>
                  </p>
                  {product.del_price && (
                    <del className="text-sm text-gray-600">
                      {product.del_price.toLocaleString()}{" "}
                      {language === "ar" ? "جنيه" : "EGP"}
                    </del>
                  )}
                  {product.sale && (
                    <span className="text-xs font-bold text-light-primary">
                      {product.sale}
                    </span>
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
              </div>
              {product.shippingMethod?.[language] === "express" && (
                <div className="mt-2 flex items-center text-xs font-semibold">
                  <span className="rounded bg-light-primary px-2 py-1 text-white">
                    Express
                  </span>
                </div>
              )}
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductCard;
