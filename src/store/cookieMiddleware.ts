import { CartItem } from "@/types/cart";
import { Middleware } from "redux";
import { setEncrypted } from "@/util/encryptedCookieStorage";

interface CartStateForMiddleware {
  products: CartItem[];
  totalPrice: number;
}

interface RootStateForMiddleware {
  cart: CartStateForMiddleware;
}

const cookieMiddleware: Middleware<void, RootStateForMiddleware> =
  (store) => (next) => (action: unknown) => {
    const result = next(action);

    if (
      typeof window !== "undefined" &&
      typeof action === "object" &&
      action !== null &&
      "type" in action &&
      typeof (action as { type: string }).type === "string" &&
      (action as { type: string }).type.startsWith("cart/")
    ) {
      const { cart } = store.getState();
   
      setEncrypted("cart", cart).catch((e) =>
        console.error("Failed to persist cart to cookie:", e),
      );
    }

    return result;
  };

export default cookieMiddleware;
