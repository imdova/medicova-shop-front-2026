import { CartItem } from "@/types/cart";
import { Middleware } from "redux";

interface CartStateForMiddleware {
  products: CartItem[];
  totalPrice: number;
}

interface RootStateForMiddleware {
  cart: CartStateForMiddleware;
}

const localStorageMiddleware: Middleware<void, RootStateForMiddleware> =
  (store) => (next) => (action: unknown) => {
    const result = next(action);

    if (
      typeof window !== "undefined" &&
      typeof action === "object" && // Check if it's an object
      action !== null && // Check if it's not null
      "type" in action && // Check if it has a 'type' property
      typeof (action as { type: string }).type === "string" && // Check if 'type' is a string
      (action as { type: string }).type.startsWith("cart/") // Now it's safe to use startsWith
    ) {
      const { cart } = store.getState();
      try {
        localStorage.setItem("cart", JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to save cart to localStorage:", e);
      }
    }

    return result;
  };

export default localStorageMiddleware;
