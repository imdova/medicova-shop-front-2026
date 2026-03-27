"use client";
import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addItem, increaseQuantity, setCart } from "@/store/slices/cartSlice";
import { getEncrypted } from "@/util/encryptedCookieStorage";
import { Product } from "@/types/product";
import { SizeType, NumericSizeType, LiquidSizeType } from "@/types";
import { useTranslations } from "next-intl";
import { getTags } from "@/services/tagService";
import { ProductTag } from "@/types/product";

import { getSellerSelectedOptions } from "@/services/sellerSelectedOptionService";
import { getVariantById } from "@/services/variantService";
import { getAllReviews } from "@/services/reviewService";
import { format } from "date-fns";

interface UnitSelection {
  size?: SizeType | NumericSizeType | LiquidSizeType;
  color?: string;
}

interface UseProductPageProps {
  product: Product | undefined;
}

export const useProductPage = ({ product }: UseProductPageProps): {
  isClient: boolean;
  loading: boolean;
  selectedSize: SizeType | NumericSizeType | LiquidSizeType | undefined;
  selectedColor: string | undefined;
  quantity: number;
  currentNudgeIndex: number;
  isDrawerOpen: boolean;
  isAuthModalOpen: boolean;
  isQuickAuthModalOpen: boolean;
  isVariantModalOpen: boolean;
  alert: { message: string; type: "success" | "error" | "info" } | null;
  cartProducts: any[];
  totalPrice: number;
  isInCart: boolean;
  selectedOptions: { label: { en: string; ar: string }; values: { name: string; color: string }[] }[];
  unitSelections: UnitSelection[];
  setSelectedSize: (size: SizeType | NumericSizeType | LiquidSizeType | undefined) => void;
  setSelectedColor: (color: string | undefined) => void;
  setQuantity: (quantity: number) => void;
  setIsDrawerOpen: (isOpen: boolean) => void;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  setIsQuickAuthModalOpen: (isOpen: boolean) => void;
  setIsVariantModalOpen: (isOpen: boolean) => void;
  setAlert: (alert: { message: string; type: "success" | "error" | "info" } | null) => void;
  onUnitSelectionChange: (index: number, selection: UnitSelection) => void;
  handleAddToCart: () => Promise<void>;
  confirmVariantSelection: () => void;
  handleCheckout: () => void;
  reviews: any[];
  averageRating: number;
  reviewCount: number;
  productTags: ProductTag[];
  currentStock: number;
} => {
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
  const [isQuickAuthModalOpen, setIsQuickAuthModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ label: { en: string; ar: string }; values: { name: string; color: string }[] }[]>([]);
  
  const [unitSelections, setUnitSelections] = useState<UnitSelection[]>([
    { size: undefined, color: undefined }
  ]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [productTags, setProductTags] = useState<ProductTag[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);

  const cartProduct = cartProducts.find((item) => item.id === product?.id);
  const isInCart = !!cartProduct;

  // Fetch selected options
  useEffect(() => {
    if (product?.id) {
      const fetchOptions = async () => {
        try {
          const token = (session?.data as any)?.accessToken;
          const res = await getSellerSelectedOptions(product.id, token, true);
          const data = (res as any)?.data || res;
          
          if (data && data.distribution && Array.isArray(data.distribution) && data.distribution.length > 0) {
            setDistribution(data.distribution);
            
            // Auto-detect attributes from distribution keys
            const keys = Object.keys(data.distribution[0]).filter(
              k => !["stock", "key", "_id", "id", "__v"].includes(k)
            );

            const detectedOptions = keys.map(key => {
              const uniqueValues = Array.from(new Set(data.distribution.map((d: any) => d[key]))).filter(Boolean);
              return {
                label: { 
                  en: key.charAt(0).toUpperCase() + key.slice(1), 
                  ar: key === "color" ? "اللون" : key === "size" ? "المقاس" : key 
                },
                values: uniqueValues.map(v => ({ name: String(v), color: String(v) }))
              };
            });

            setSelectedOptions(detectedOptions);
          } else if (data && data.options && Array.isArray(data.options)) {
            const optionsWithLabels = await Promise.all(
              data.options.map(async (opt: any) => {
                try {
                  const variant = await getVariantById(opt.variantId);
                  
                  // Match values with variant option labels to get hex/color
                  const enrichedValues = (opt.values || []).map((val: string) => {
                    const match = variant?.option_values?.find(
                      (vOpt: any) => 
                        vOpt.label.en.toLowerCase() === val.toLowerCase() || 
                        vOpt.label.ar === val
                    );
                    return {
                      name: val,
                      color: match?.color || val, // Fallback to name if no hex found
                    };
                  });

                  return {
                    label: variant?.name || { en: "Option", ar: "خيار" },
                    values: enrichedValues,
                  };
                } catch (e) {
                  return {
                    label: { en: "Option", ar: "خيار" },
                    values: (opt.values || []).map((v: string) => ({ name: v, color: v })),
                  };
                }
              })
            );
            setSelectedOptions(optionsWithLabels);
          }
        } catch (err) {
          // Silent catch for options fetch, as it might be unauthorized for guests
          console.warn("Seller selected options fetch failed (likely unauthorized)", err);
        }
      };
      fetchOptions();
    }
  }, [product?.id, session?.data]);

  // Fetch reviews
  useEffect(() => {
    if (product?.id) {
      const fetchReviews = async () => {
        try {
          const accessToken = (session.data as any)?.accessToken || "";
          const { reviews: apiReviews, totalRate: apiTotalRate } =
            await getAllReviews(accessToken, product.id);

          // Map to format expected by ProductReviews component
          const mappedReviews = apiReviews
            .filter((r: any) => r.approved === true)
            .map((r: any) => ({
              id: r.id,
              rating: r.rating,
              content: r.comment,
              author: {
                id: r.user.id,
                name:
                  `${r.user.firstName} ${r.user.lastName}`.trim() || "Customer",
                imgUrl: r.user.avatar || "",
              },
              date: r.createdAt
                ? format(new Date(r.createdAt), "dd MMM yyyy")
                : "",
            }));

          const avg = apiReviews.length > 0 
            ? apiReviews.reduce((sum: number, r: any) => sum + (r.rate || r.rating || 0), 0) / apiReviews.length 
            : 0;

          setReviews(mappedReviews);
          setAverageRating(avg);
          setReviewCount(apiReviews.length);
        } catch (err) {
          console.error("Failed to fetch reviews", err);
        }
      };
      fetchReviews();
    }
  }, [product?.id, session.data]);

  // Fetch product tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const allTags = await getTags();
        if (product?.tags && product.tags.length > 0) {
          // Robust mapping in case tags are strings or objects
          const tagIds = product.tags.map((t: any) =>
            typeof t === "string" ? t : (t._id || t.id)
          );
          const resolved = allTags.filter((t) => tagIds.includes(t.id));
          setProductTags(resolved);
        } else {
          setProductTags([]);
        }
      } catch (err) {
        console.error("Failed to fetch tags for product", err);
      }
    };
    fetchTags();
  }, [product?.tags]);

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

  // Set initial selections and handle distribution default
  useEffect(() => {
    if (distribution.length > 0) {
      const firstEntry = distribution[0];
      const initialSelection: any = {};
      
      selectedOptions.forEach(opt => {
        const key = opt.label.en;
        const value = firstEntry[key.toLowerCase()] || firstEntry[key];
        if (value) {
          initialSelection[key] = value;
          if (key.toLowerCase() === "size") setSelectedSize(value);
          if (key.toLowerCase() === "color") setSelectedColor(value);
        }
      });
      
      setUnitSelections([initialSelection]);
      return;
    }

    const defaultSize = product?.sizes?.[0];
    const defaultColor = product?.colors?.en?.[0];

    if (defaultSize) setSelectedSize(defaultSize);
    if (defaultColor) setSelectedColor(defaultColor);

    const initialSelection: any = {};
    
    // Also try to match with any dynamic labels from selectedOptions if they are fetched
    selectedOptions.forEach(opt => {
      const key = opt.label.en;
      if (key.toLowerCase() === "size") initialSelection[key] = defaultSize;
      if (key.toLowerCase() === "color") initialSelection[key] = defaultColor;
      
      // If we have a default value in opt.values, we could use it here
      if (!initialSelection[key] && opt.values.length > 0) {
        initialSelection[key] = opt.values[0].name;
      }
    });

    setUnitSelections([initialSelection]);
  }, [product?.sizes, product?.colors, selectedOptions, setSelectedSize, setSelectedColor, distribution]);

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
    if (cartProduct && cartProduct.quantity !== quantity) {
      setQuantity(cartProduct.quantity);
    }
  }, [cartProduct?.quantity]);

  // Sync unitSelections with quantity
  useEffect(() => {
    setUnitSelections(prev => {
      if (quantity === prev.length) return prev;
      const next = [...prev];
      if (quantity > next.length) {
        for (let i = next.length; i < quantity; i++) {
          next.push({ size: next[0]?.size, color: next[0]?.color });
        }
      } else {
        return next.slice(0, quantity);
      }
      return next;
    });
  }, [quantity]);

  // Calculate current stock from distribution
  const currentStock: number = (() => {
    if (distribution.length > 0) {
      const currentSelection = unitSelections[0];
      const match = distribution.find(d => 
        Object.keys(currentSelection).every(key => 
          String(d[key]).toLowerCase() === String((currentSelection as any)[key]).toLowerCase()
        )
      );
      return match ? (match.stock as number) : 0;
    }
    return (product?.stock as number) || 0;
  })();

  const showAlert = useCallback((message: string, type: "success" | "error" | "info") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  }, []);

  const onUnitSelectionChange = (index: number, selection: UnitSelection) => {
    setUnitSelections(prev => {
      const next = [...prev];
      next[index] = selection;
      // Sync first unit with top-level selection for legacy compatibility
      if (index === 0) {
        // Try all casing variants for syncing
        const sizeVal = selection.size || (selection as any).Size || (selection as any).SIZE;
        const colorVal = selection.color || (selection as any).Color || (selection as any).COLOR;
        setSelectedSize(sizeVal);
        setSelectedColor(colorVal);
      }
      return next;
    });
  };

  const handleAddToCart = async () => {
    if (!product?.id) {
      showAlert(t("error"), "error");
      return;
    }
    setIsVariantModalOpen(true);
  };

  const confirmVariantSelection = () => {
    if (!product?.id) return;

    let effectiveStock = product.stock;
    if (distribution.length > 0) {
      const currentSelection = unitSelections[0];
      const match = distribution.find(d => 
        Object.keys(currentSelection).every(key => 
          String(d[key]).toLowerCase() === String((currentSelection as any)[key]).toLowerCase()
        )
      );
      if (match) effectiveStock = match.stock;
    }

    dispatch(
      addItem({
        id: product.id,
        title: product.title,
        slug: product.slug,
        categorySlug: product.category?.slug,
        image: product.images?.[0] ?? "/images/placeholder.jpg",
        description: product.description.en,
        del_price: product.del_price,
        price: product.price ?? 0,
        shipping_fee: product.shipping_fee ?? 0,
        quantity: unitSelections.length,
        brand: product.brand,
        deliveryTime: product.deliveryTime,
        sellers: product.sellers,
        stock: effectiveStock,
        color: unitSelections[0]?.color,
        size: unitSelections[0]?.size,
        shippingMethod: product.shippingMethod,
        weightKg: product.weightKg,
        unitSelections: unitSelections,
        totalPrice: (product.price ?? 0) * unitSelections.length,
        extraData: unitSelections[0], // Pass the whole selection object
        shippingCostInsideCairo: product.shippingCostInsideCairo,
        shippingCostRegion1: product.shippingCostRegion1,
        shippingCostRegion2: product.shippingCostRegion2,
      } as any)
    );

    setIsVariantModalOpen(false);
    setIsDrawerOpen(true);
    showAlert(t("addedToCart"), "success");
  };

  const handleCheckout = () => {
    if (session.data?.user) {
      router.push("/checkout");
    } else {
      setIsQuickAuthModalOpen(true);
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
    isQuickAuthModalOpen,
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
    setIsQuickAuthModalOpen,
    setIsVariantModalOpen,
    setAlert,
    onUnitSelectionChange,
    handleAddToCart,
    confirmVariantSelection,
    handleCheckout,
    reviews,
    averageRating,
    reviewCount,
    productTags,
    currentStock,
  };
};
