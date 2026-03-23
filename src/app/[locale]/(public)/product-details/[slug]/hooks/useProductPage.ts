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
  setIsVariantModalOpen: (isOpen: boolean) => void;
  setAlert: (alert: { message: string; type: "success" | "error" | "info" } | null) => void;
  onUnitSelectionChange: (index: number, selection: UnitSelection) => void;
  handleAddToCart: () => Promise<void>;
  confirmVariantSelection: () => void;
  handleCheckout: () => void;
  productTags: ProductTag[];
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
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isClient, setIsClient] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ label: { en: string; ar: string }; values: { name: string; color: string }[] }[]>([]);
  
  const [unitSelections, setUnitSelections] = useState<UnitSelection[]>([
    { size: undefined, color: undefined }
  ]);
  const [productTags, setProductTags] = useState<ProductTag[]>([]);

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
          
          if (data && data.options && Array.isArray(data.options)) {
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

  // Set initial selections
  useEffect(() => {
    const defaultSize = product?.sizes?.[0];
    const defaultColor = product?.colors?.en?.[0];

    if (defaultSize) setSelectedSize(defaultSize);
    if (defaultColor) setSelectedColor(defaultColor);

    setUnitSelections([
      { size: defaultSize, color: defaultColor }
    ]);
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
        setSelectedSize(selection.size);
        setSelectedColor(selection.color);
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

    unitSelections.forEach((selection: any) => {
      // Find color and size regardless of exact key casing/label (common variants)
      const color = selection.color || selection.Color || selection.COLOR;
      const size = selection.size || selection.Size || selection.SIZE;

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
          quantity: 1,
          brand: product.brand,
          deliveryTime: product.deliveryTime,
          sellers: product.sellers,
          stock: product.stock,
          color: color,
          size: size,
          shippingMethod: product.shippingMethod,
          weightKg: product.weightKg,
        })
      );
    });

    setIsVariantModalOpen(false);
    setIsDrawerOpen(true);
    showAlert(t("addedToCart"), "success");
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
    productTags,
  };
};
