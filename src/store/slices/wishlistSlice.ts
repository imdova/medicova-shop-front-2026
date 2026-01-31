import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

interface WishlistItem extends Product {
  addedBy: string; // Required field
}

interface WishlistState {
  products: WishlistItem[];
}

const initialState: WishlistState = {
  products: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: {
      reducer(state, action: PayloadAction<WishlistItem>) {
        if (!action.payload.addedBy) return;
        const existingIndex = state.products.findIndex(
          (item) =>
            item.id === action.payload.id &&
            item.addedBy === action.payload.addedBy,
        );
        if (existingIndex === -1) {
          state.products.push(action.payload);
        }
      },
      prepare(product: Product, userId: string) {
        return {
          payload: {
            ...product,
            addedBy: userId,
          },
        };
      },
    },
    removeFromWishlist: (
      state,
      action: PayloadAction<{ id: string; userId: string }>,
    ) => {
      state.products = state.products.filter(
        (item) =>
          !(
            item.id === action.payload.id &&
            item.addedBy === action.payload.userId
          ),
      );
    },
    clearWishlist: (state, action: PayloadAction<{ userId: string }>) => {
      state.products = state.products.filter(
        (item) => item.addedBy !== action.payload.userId,
      );
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
