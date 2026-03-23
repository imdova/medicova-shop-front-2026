"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Image from "next/image";
import LogoLoader from "@/components/layouts/LogoLoader";
import { Product } from "@/types/product";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addItem,
  decreaseQuantity,
  increaseQuantity,
  removeItem,
} from "@/store/slices/cartSlice";
import CartButton from "@/components/shared/Buttons/CartButton";
import CustomAlert from "@/components/shared/CustomAlert";
import { LanguageType } from "@/util/translations";
import { LocalizedTitle } from "@/types/language";
import { useLocale, useTranslations } from "next-intl";

interface ListCardProps {
  loading?: boolean;
  product: Product;
  locale?: LanguageType;
}

const ListProductCard: React.FC<ListCardProps> = ({ loading, product }) => {
  const locale = useLocale() as LanguageType;
  const t = useTranslations("product");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state) => state.cart);
  const cartProduct = products.find((item) => item.id === product.id);

  const isInCart = products.some((item) => item.id === product.id);

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

  useEffect(() => {
    if (cartProduct) {
      setQuantity(cartProduct.quantity);
    } else {
      setQuantity(1);
    }
  }, [cartProduct?.quantity]);

  const nudgeCount = product.nudges
    ? product.nudges[locale as keyof LocalizedTitle].length
    : 0;

  useEffect(() => {
    if (nudgeCount === 0) return;

    const interval = setInterval(() => {
      setCurrentNudgeIndex((prev) => (prev === nudgeCount - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [nudgeCount]);

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
          }),
        );
        showAlert(t("addedToCart"), "success");
      } else {
        showAlert(t("alreadyInCart"), "info");
      }
    },
    [dispatch, isInCart, product, quantity, t, locale],
  );

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      const validatedQuantity = Math.max(0, Math.floor(newQuantity));

      if (validatedQuantity === 0) {
        dispatch(removeItem(product.id));
        showAlert(t("deletedFromCart"), "error");
        setQuantity(0);
        return;
      }

      if (validatedQuantity > quantity) {
        const increaseAmount = validatedQuantity - quantity;
        dispatch(increaseQuantity({ id: product.id, amount: increaseAmount }));
      } else if (validatedQuantity < quantity) {
        const decreaseAmount = quantity - validatedQuantity;
        dispatch(decreaseQuantity({ id: product.id, amount: decreaseAmount }));
      }

      if (validatedQuantity !== quantity) {
        setQuantity(validatedQuantity);
      }
    },
    [dispatch, product.id, quantity, t],
  );

  const showAlert = (message: string, type: "success" | "error" | "info") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <>
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="group relative mx-auto flex w-full cursor-pointer gap-3 overflow-hidden rounded-xl border border-gray-300 bg-white p-3 shadow-sm transition-shadow duration-200">
        {loading ? (
          <div className="flex h-40 w-full items-center justify-center">
            <LogoLoader className="w-[40px] animate-pulse text-gray-400" />
          </div>
        ) : (
          <>
            <div className="group relative h-fit flex-shrink-0 overflow-hidden rounded-lg">
              <Link href={product.category?.slug ? `/${locale}/category/${product.category.slug}/${product.slug[locale]}` : `/product-details/${product.id}`}>
                <div className="block bg-gray-100">
                  <Image
                    width={160}
                    height={160}
                    src={
                      product.images?.[currentImageIndex] ||
                      "/images/placeholder.jpg"
                    }
                    alt={
                      product.title[locale as keyof LocalizedTitle] ??
                      "product title"
                    }
                    className="h-[150px] w-36 rounded-lg object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                    priority={currentImageIndex === 0}
                  />
                </div>
              </Link>
              {(product.images?.length ?? 0) > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute -left-1 top-1/2 -translate-x-8 -translate-y-1/2 rounded-md bg-black/30 p-1.5 text-white transition duration-200 hover:bg-black/50 group-hover:-translate-x-0"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute -right-1 top-1/2 -translate-y-1/2 translate-x-8 rounded-md bg-black/30 p-1.5 text-white transition duration-200 hover:bg-black/50 group-hover:-translate-x-0"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute bottom-2 left-2 rounded-md bg-white px-2">
                <div className="flex items-center">
                  <Star className="h-3 w-3 fill-green-600 text-green-600" />
                  <span className="ml-1 text-sm text-gray-600">
                    {product.rating?.toFixed(1)}
                  </span>
                </div>
              </div>
              <button className="hover:bg-light-primary absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-700 transition hover:text-white">
                <Heart size={16} />
              </button>
            </div>

            <div className="ml-4 flex flex-grow flex-col">
              <Link href={product.category?.slug ? `/${locale}/category/${product.category.slug}/${product.slug[locale]}` : `/product-details/${product.id}`}>
                <div className="block">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {product.title[locale as keyof LocalizedTitle]}
                  </h3>
                  <div className="relative mt-1 h-6 overflow-hidden">
                    <div
                      className="flex flex-col transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateY(-${currentNudgeIndex * 24}px)`,
                      }}
                    >
                      {product.nudges?.[locale as keyof LocalizedTitle].map(
                        (nudge, index) => (
                          <div
                            key={index}
                            className="flex h-6 items-center text-xs text-gray-600"
                          >
                            {nudge}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              <div className="mt-2 flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-3 text-gray-900">
                    <span className="text-sm font-bold">
                      {locale === "ar" ? "جنيه" : "EGP"}{" "}
                      {product.price.toLocaleString()}
                    </span>
                    {product.del_price && (
                      <del className="text-xs text-gray-500">
                        {locale === "ar" ? "جنيه" : "EGP"}{" "}
                        {product.del_price.toLocaleString()}
                      </del>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {product.sale && (
                      <span className="bg-light-primary rounded px-2 py-0.5 text-xs font-bold text-white">
                        {product.sale}
                      </span>
                    )}
                    {product.shippingMethod && (
                      <div className="bg-light-primary rounded px-2 py-0.5 text-xs font-bold text-white">
                        {product.shippingMethod[locale as keyof LocalizedTitle]}
                      </div>
                    )}
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
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ListProductCard;
