import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { getProductById, mapApiProductToProduct } from "@/services/productService";
import { setCart } from "@/store/slices/cartSlice";

export function useSyncCart() {
  const dispatch = useAppDispatch();
  const { products: cartItems } = useAppSelector((state) => state.cart);

  const syncCart = useCallback(async (items: any[]) => {
    if (!items || items.length === 0) return;

    try {
      const updatedProducts = await Promise.all(
        items.map(async (item) => {
          try {
            const apiProduct = await getProductById(item.id);
            if (apiProduct) {
              const mapped = mapApiProductToProduct(apiProduct);
              return {
                ...item,
                price: mapped.price,
                del_price: mapped.del_price,
                shippingCostInsideCairo: mapped.shippingCostInsideCairo,
                shippingCostRegion1: mapped.shippingCostRegion1,
                shippingCostRegion2: mapped.shippingCostRegion2,
                weightKg: mapped.weightKg,
                shippingMethod: mapped.shippingMethod,
                title: mapped.title, // Keep title updated too
                image: mapped.images[0] || item.image,
              };
            }
          } catch (e) {
            console.error(`Failed to sync product ${item.id}:`, e);
          }
          return item;
        })
      );

      // Re-calculate total price for the whole cart
      const newTotalPrice = updatedProducts.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
      );

      dispatch(setCart({ products: updatedProducts, totalPrice: newTotalPrice }));
    } catch (error) {
      console.error("Failed to sync cart items:", error);
    }
  }, [dispatch]);

  return { syncCart };
}
