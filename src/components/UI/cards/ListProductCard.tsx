import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight, Heart } from "lucide-react";
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
import { LanguageType } from "@/util/translations";

//TODO translate List ProductCard

interface ListCardProps {
  loading?: boolean;
  product: Product;
  locale?: LanguageType;
}

const Text = {
  alertMessages: {
    en: {
      addedToCart: "Added to cart",
      alreadyInCart: "Product already in cart!",
      deletedFromCart: "Deleted from cart",
    },
    ar: {
      addedToCart: "تمت الإضافة إلى السلة",
      alreadyInCart: "المنتج موجود بالفعل في السلة!",
      deletedFromCart: "تم الحذف من السلة",
    },
  },
};

const ListProductCard: React.FC<ListCardProps> = ({
  loading,
  product,
  locale = "en",
}) => {
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

  const nudgeCount = product.nudges ? product.nudges[locale].length : 0;

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
            title: product.title ?? "",
            image: product.images?.[0] ?? "/images/placeholder.jpg",
            description:
              product.description[locale] ?? "No description available",
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
        showAlert(Text.alertMessages[locale].addedToCart, "success");
      } else {
        showAlert(Text.alertMessages[locale].alreadyInCart, "info");
      }
    },
    [dispatch, isInCart, product, quantity],
  );

  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      // Ensure quantity is a non-negative integer
      const validatedQuantity = Math.max(0, Math.floor(newQuantity));

      if (validatedQuantity === 0) {
        // If quantity is zero, remove item from cart
        dispatch(removeItem(product.id));
        showAlert(Text.alertMessages[locale].deletedFromCart, "error");
        setQuantity(0);
        return;
      }

      if (validatedQuantity > quantity) {
        // Increase quantity by the difference
        const increaseAmount = validatedQuantity - quantity;
        dispatch(increaseQuantity({ id: product.id, amount: increaseAmount }));
      } else if (validatedQuantity < quantity) {
        // Decrease quantity by the difference
        const decreaseAmount = quantity - validatedQuantity;
        dispatch(decreaseQuantity({ id: product.id, amount: decreaseAmount }));
      }

      // Update local quantity state only if changed
      if (validatedQuantity !== quantity) {
        setQuantity(validatedQuantity);
      }
    },
    [dispatch, product.id, quantity],
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
            {/* Left side: Image with navigation */}
            <div className="group relative h-fit flex-shrink-0 overflow-hidden rounded-lg">
              <Link href={`/product-details/${product.id}`}>
                <div className="block bg-gray-100">
                  <Image
                    width={160}
                    height={160}
                    src={
                      product.images?.[currentImageIndex] ||
                      "/images/placeholder.jpg"
                    }
                    alt={product.title[locale] ?? "product tilte"}
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
              {/* Rating badge */}
              <div className="absolute bottom-2 left-2 rounded-md bg-white px-2">
                <div className="flex items-center">
                  <Star className="h-3 w-3 fill-green-600 text-green-600" />
                  <span className="ml-1 text-sm text-gray-600">
                    {product.rating?.toFixed(1)}
                  </span>
                </div>
              </div>
              {/* Favorite Heart */}
              <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-gray-700 transition hover:bg-light-primary hover:text-white">
                <Heart size={16} />
              </button>
            </div>

            {/* Right side: Info */}
            <div className="ml-4 flex flex-grow flex-col">
              <Link href={`/product-details/${product.id}`}>
                <div className="block">
                  <h3 className="text-sm font-semibold text-gray-800">
                    {product.title[locale]}
                  </h3>
                  {/* Nudges */}
                  <div className="relative mt-1 h-6 overflow-hidden">
                    <div
                      className="flex flex-col transition-transform duration-300 ease-in-out"
                      style={{
                        transform: `translateY(-${currentNudgeIndex * 24}px)`,
                      }}
                    >
                      {product.nudges?.[locale].map((nudge, index) => (
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
              </Link>

              {/* Price and actions */}
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
                      <span className="rounded bg-light-primary px-2 py-0.5 text-xs font-bold text-white">
                        {product.sale}
                      </span>
                    )}
                    {/* Shipping method */}
                    {product.shippingMethod && (
                      <div className="rounded bg-light-primary px-2 py-0.5 text-xs font-bold text-white">
                        {product.shippingMethod[locale]}
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
                  locale={locale}
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
