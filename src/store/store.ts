import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "@/store/slices/cartSlice";
import localStorageMiddleware from "./localStorageMiddleware"; // Import your middleware
import wishlistSlice from "./slices/wishlistSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      cart: cartSlice,
      wishlist: wishlistSlice,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(localStorageMiddleware),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
