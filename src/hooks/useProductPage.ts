"use client";
import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem, increaseQuantity, setCart } from "@/store/slices/cartSlice";
import { getEncrypted } from "@/util/encryptedCookieStorage";
import { Product, ProductTag } from "@/types/product";
import { SizeType, NumericSizeType, LiquidSizeType } from "@/types";
import { useTranslations } from "next-intl";
import { getSellerSelectedOptions } from "@/services/sellerSelectedOptionService";
import { getVariantById } from "@/services/variantService";
import { getAllReviews } from "@/services/reviewService";
import { format } from "date-fns";
import { ProductTags } from "@/constants/productTags";

interface UseProductPageProps {
  product: Product | undefined;
}

export const useProductPage = ({ product }: UseProductPageProps) => {
  const t = useTranslations("product");
  const session = useSession();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { products: cartProducts, totalPrice } = useAppSelector((state) => state.cart);

  const [selectedSize, setSelectedSize] = useState<SizeType | NumericSizeType | LiquidSizeType | undefined>();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ label: { en: string; ar: string }; values: string[] }[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  const cartProduct = cartProducts.find((item) => item.id === product?.id);
  const isInCart = !!cartProduct;

  const productTags = ProductTags.filter((tag) =>
    product?.tags?.includes(tag.id),
  );

  // Fetch selected options
  useEffect(() => {
    if (product?.id) {
      const fetchOptions = async () => {
        try {
          const res = await getSellerSelectedOptions(product.id);
          const data = (res as any)?.data || res;
          
          if (data && data.options && Array.isArray(data.options)) {
            const optionsWithLabels = await Promise.all(
              data.options.map(async (opt: any) => {
                try {
                  const variant = await getVariantById(opt.variantId);
                  return {
                    label: variant?.name || { en: "Option", ar: "خيار" },
                    values: opt.values || [],
                  };
                } catch (e) {
                  return {
                    label: { en: "Option", ar: "خيار" },
                    values: opt.values || [],
                  };
                }
              })
            );
            setSelectedOptions(optionsWithLabels);
          }
        } catch (err) {
          console.error("Failed to fetch seller selected options", err);
        }
      };
      fetchOptions();
    }
  }, [product?.id]);

  // Fetch reviews
  useEffect(() => {
    if (product?.id) {
      const fetchReviews = async () => {
        try {
          const accessToken = (session.data as any)?.accessToken || "";
          const apiReviews = await getAllReviews(accessToken, product.id);
          
          // Map to format expected by ProductReviews component
          const mappedReviews = apiReviews.map((r: any) => ({
            id: r.id,
            rating: r.rating,
            content: r.comment,
            author: {
              id: r.user.id,
              name: `${r.user.firstName} ${r.user.lastName}`.trim() || "Customer",
              imgUrl: r.user.avatar || "",
            },
            date: r.createdAt ? format(new Date(r.createdAt), "dd MMM yyyy") : "",
          }));
          
          setReviews(mappedReviews);
        } catch (err) {
          console.error("Failed to fetch reviews", err);
        }
      };
      fetchReviews();
    }
  }, [product?.id, session.data]);

  // Hydrate cart from cookies
  useEffect(() => {
    const loadCart = async () => {
      setIsClient(true);
      try {
        const savedCart = await getEncrypted<{ products: typeof cartProducts; totalPrice: number }>("cart");
        if (savedCart) {
          dispatch(setCart(savedCart));
        }
      } catch (e) {
        console.error("Failed to load cart from cookies", e);
      }
    };
    loadCart();
  }, [dispatch]);

  // Set initial selections
  useEffect(() => {
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[0]);
    }
    if (product?.colors?.en?.length) {
      setSelectedColor(product.colors.en[0]);
    }
  }, [product?.sizes, product?.colors]);

  // Nudge auto-rotation
  useEffect(() => {
    const nudgeCount = product?.nudges?.en?.length || 0;
    if (nudgeCount === 0) return;

    const interval = setInterval(() => {
      setCurrentNudgeIndex((prev) => (prev === nudgeCount - 1 ? 0 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [product?.nudges]);

  // Sync quantity with cart if product is already there
  useEffect(() => {
    if (cartProduct) {
      setQuantity(cartProduct.quantity);
    } else {
      setQuantity(1);
    }
  }, [cartProduct?.quantity]);

  const showAlert = useCallback((message: string, type: "success" | "error" | "info") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }, []);

  const handleAddToCart = async () => {
    if (!product?.id) {
      showAlert(t("error"), "error");
      return;
    }

    setLoading(true);
    // Simulate slight delay for feedback
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (!isInCart) {
      dispatch(
        addItem({
          id: product.id,
          title: product.title,
          slug: product.slug,
          image: product.images?.[0] ?? "/images/placeholder.jpg",
          description: product.description.en,
          del_price: product.del_price,
          price: product.price ?? 0,
          shipping_fee: product.shipping_fee ?? 0,
          quantity: Math.min(quantity, product.stock ?? 1),
          brand: product.brand,
          deliveryTime: product.deliveryTime,
          sellers: product.sellers,
          stock: product.stock,
          color: selectedColor,
          size: selectedSize,
          shippingMethod: product.shippingMethod,
          weightKg: product.weightKg,
          totalPrice: (product.price ?? 0) * Math.min(quantity, product.stock ?? 1),
        })
      );
      showAlert(t("addedToCart"), "success");
    } else {
      const availableStock = product.stock ?? 0;
      const currentQuantity = cartProduct?.quantity ?? 0;
      const requestedTotal = currentQuantity + quantity;

      if (requestedTotal > availableStock) {
        const canAdd = Math.max(0, availableStock - currentQuantity);
        if (canAdd > 0) {
          dispatch(increaseQuantity({ id: product.id, amount: canAdd }));
          showAlert(t("outOfStock"), "info"); // Simplified alert for logic
        } else {
          showAlert(t("outOfStock"), "error");
        }
      } else {
        dispatch(increaseQuantity({ id: product.id, amount: quantity }));
        showAlert(t("addedToCart"), "success");
      }
    }

    setIsDrawerOpen(true);
    setLoading(false);
  };

  const handleCheckout = () => {
    if (session.data?.user) {
      router.push("/checkout");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return {
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
    selectedOptions,
    setSelectedSize,
    setSelectedColor,
    setQuantity,
    setIsDrawerOpen,
    setIsAuthModalOpen,
    setAlert,
    handleAddToCart,
    handleCheckout,
    reviews,
    productTags,
  } as {
    isClient: boolean;
    loading: boolean;
    selectedSize: SizeType | NumericSizeType | LiquidSizeType | undefined;
    selectedColor: string | undefined;
    quantity: number;
    currentNudgeIndex: number;
    isDrawerOpen: boolean;
    isAuthModalOpen: boolean;
    alert: { message: string; type: "success" | "error" | "info" } | null;
    cartProducts: any[];
    totalPrice: number;
    isInCart: boolean;
    selectedOptions: { label: { en: string; ar: string }; values: string[] }[];
    setSelectedSize: (size: SizeType | NumericSizeType | LiquidSizeType | undefined) => void;
    setSelectedColor: (color: string | undefined) => void;
    setQuantity: (quantity: number) => void;
    setIsDrawerOpen: (isOpen: boolean) => void;
    setIsAuthModalOpen: (isOpen: boolean) => void;
    setAlert: (alert: { message: string; type: "success" | "error" | "info" } | null) => void;
    handleAddToCart: () => Promise<void>;
    handleCheckout: () => void;
    reviews: any[];
    productTags: ProductTag[];
  };
};
