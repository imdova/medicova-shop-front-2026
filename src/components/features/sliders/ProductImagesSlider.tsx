"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { ZoomIn } from "lucide-react";
import ThumbnailsSlider from "./ThumbnailsSlider";
import WishlistButton from "@/components/shared/Buttons/WishlistButton";
import { useSession } from "next-auth/react";
import {
  addToWishlistApi,
  removeFromWishlistApi,
} from "@/store/slices/wishlistSlice";
import { Product } from "@/types/product";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CustomAlert from "@/components/shared/CustomAlert";
import { LanguageType } from "@/util/translations";
import { LocalizedTitle } from "@/types/language";

type ImagesSliderProps = {
  images?: string[];
  product: Product;
  locale?: LanguageType;
};

import { useLocale, useTranslations } from "next-intl";

const ProductImagesSlider = ({ images = [], product }: ImagesSliderProps) => {
  const t = useTranslations("product");
  const locale = useLocale() as LanguageType;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isMobile, setIsMobile] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const { products: wishlistData } = useAppSelector((state) => state.wishlist);
  const session = useSession();
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error" | "info" | "cart" | "wishlist";
  } | null>(null);
  const dispatch = useAppDispatch();
  const isInWishlist = wishlistData.some((item) => item.id === product.id);

  useEffect(() => {
    // Check if the device is touch-enabled or has a small screen (mobile)
    const checkIfMobile = () => {
      return (
        window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth < 768
      );
    };

    setIsMobile(checkIfMobile());

    const handleResize = () => {
      setIsMobile(checkIfMobile());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1,
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current || isMobile) return;

    const { left, top, width, height } =
      imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    // Constrain the position to stay within the image bounds
    const constrainedX = Math.max(0, Math.min(100, x));
    const constrainedY = Math.max(0, Math.min(100, y));

    setZoomPosition({ x: constrainedX, y: constrainedY });
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handdleAddToWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!session.data?.user) {
        showAlert(t("pleaseLoginToWishlist"), "error");
        return;
      }

      const anySession = session.data as any;
      const userId = anySession?.user?.id;
      const token = anySession?.accessToken;

      if (!userId || !token) {
        const errorMsg = !userId ? "User ID not found" : "Access token missing";
        console.warn(`Wishlist attempt aborted: ${errorMsg}`, { userId, hasToken: !!token });
        showAlert(`${t("pleaseLoginToWishlist")} (${errorMsg})`, "error");
        return;
      }

      try {
        if (!isInWishlist) {
          console.log("Dispatching addToWishlistApi for product:", product.id);
          dispatch(addToWishlistApi({ productId: product.id, product, token, userId }));
          showAlert(t("addedToWishlist"), "wishlist");
        } else {
          console.log("Dispatching removeFromWishlistApi for product:", product.id);
          dispatch(
            removeFromWishlistApi({
              id: product.id,
              token: token,
              userId: userId,
            }),
          );
          showAlert(t("removedFromWishlist"), "wishlist");
        }
      } catch (error) {
        console.error("Wishlist dispatch error:", error);
        showAlert(t("failedToUpdateWishlist"), "error");
      }
    },
    [dispatch, isInWishlist, product, session.data?.user],
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
    <div className="flex flex-row-reverse h-full ">
    
      {alert && (
        <CustomAlert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      {/* Main Image Slider */}
      <div
        {...swipeHandlers}
        className="relative h-full touch-pan-y select-none overflow-hidden rounded-lg"
        style={{ touchAction: "pan-y" }}
        ref={imageRef}
        onMouseEnter={() => !isMobile && setIsHovering(true)}
        onMouseLeave={() => !isMobile && setIsHovering(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Zoom Indicator */}
        {isHovering && !isMobile && images.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-10">
            <div
              className="absolute rounded-md border-2 border-white/80 shadow-lg"
              style={{
                width: "100px",
                height: "100px",
                left: `${zoomPosition.x}%`,
                top: `${zoomPosition.y}%`,
                transform: "translate(-50%, -50%)",
                background: "rgba(255,255,255,0.2)",
              }}
            />
          </div>
        )}

        {/* Main Image with Zoom Effect */}
        <div className="relative h-full w-full overflow-hidden">
          {images.length > 0 ? (
            <>
              {/* Original Image (always visible) */}
              <Image
                width={600}
                height={600}
                src={images[currentImageIndex] || "/images/placeholder.jpg"}
                alt={
                  product.title[locale as keyof LocalizedTitle] ||
                  "Product image"
                }
                className="h-full w-full select-none object-fill transition-opacity duration-300"
                draggable={false}
                priority={currentImageIndex === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Zoomed Image (only visible on hover) */}
              {isHovering && !isMobile && images.length > 0 && (
                <div className="absolute inset-0 overflow-hidden">
                  <motion.div
                    className="h-full w-full bg-no-repeat"
                    style={{
                      backgroundImage: `url(${images[currentImageIndex]})`,
                      backgroundSize: "200%",
                      backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              No images available
            </div>
          )}
        </div>

        {/* Zoom Hint - Only show on desktop */}
        {!isHovering && !isMobile && images.length > 0 && (
          <motion.div
            className="absolute left-2 top-2 z-20 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs shadow-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <ZoomIn className="h-3 w-3 text-gray-800" />
            <span>Hover to zoom</span>
          </motion.div>
        )}
        <div>
          <WishlistButton
            addToWishlist={handdleAddToWishlist}
            isInWishlist={isInWishlist}
            productId={product.id}
          />
        </div>
        {/* Thumbnails in mobile screen */}
        <div className="absolute bottom-1 left-1/2 block -translate-x-1/2 md:hidden">
          <div className="mt-4 flex items-center gap-2 py-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`relative h-2 w-2 rounded-full border border-gray-800 transition duration-300 ${currentImageIndex === index ? "bg-gray-800" : ""}`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* Thumbnails in large screen */}
      <ThumbnailsSlider
        images={images}
        currentImageIndex={currentImageIndex}
        goToImage={goToImage}
      />
    </div>
  );
};

export default ProductImagesSlider;
