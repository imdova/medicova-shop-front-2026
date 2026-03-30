import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Product } from "@/types/product";
import * as wishlistService from "@/services/wishlistService";

interface WishlistItem extends Product {
  addedBy: string; // Keep for backward compatibility / local tracking if needed
}

interface WishlistState {
  products: WishlistItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  products: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (token: string, { rejectWithValue }) => {
    try {
      const products = await wishlistService.getWishlist(token);
      return products;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch wishlist");
    }
  },
);

export const addToWishlistApi = createAsyncThunk(
  "wishlist/add",
  async (
    { productId, token, userId, product }: { productId: string; token: string; userId: string; product?: Product },
    { rejectWithValue },
  ) => {
    try {
      await wishlistService.addToWishlist(productId, token);
      return { productId, userId, product };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add to wishlist");
    }
  },
);

export const removeFromWishlistApi = createAsyncThunk(
  "wishlist/remove",
  async (
    { id, token, userId }: { id: string; token: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      await wishlistService.removeFromWishlist(id, token);
      return { id, userId };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to remove from wishlist");
    }
  },
);

export const clearWishlistApi = createAsyncThunk(
  "wishlist/clear",
  async (
    { token, userId }: { token: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      await wishlistService.clearWishlist(token);
      return { userId };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to clear wishlist");
    }
  },
);

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Keep sync actions for optimistic updates or local state if needed
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
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
  extraReducers: (builder) => {
    builder
      // Fetch Wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.products = (action.payload as any[]).map((p) => ({
          ...p,
          addedBy: "database", 
        }));
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add to Wishlist - Optimistic
      .addCase(addToWishlistApi.pending, (state, action) => {
        const { productId, userId, product } = action.meta.arg;
        const exists = state.products.some((item) => item.id === productId);
        if (!exists && product) {
          state.products.push({ ...product, id: productId, addedBy: userId });
        }
      })
      .addCase(addToWishlistApi.rejected, (state, action) => {
        const { productId } = action.meta.arg;
        state.products = state.products.filter((item) => item.id !== productId);
        state.error = action.payload as string;
      })
      // Remove from Wishlist - Optimistic
      .addCase(removeFromWishlistApi.pending, (state, action) => {
        const { id } = action.meta.arg;
        state.products = state.products.filter((item) => item.id !== id);
      })
      // Rollback for removal is harder without storing the old item, 
      // but we can at least log the error.
      .addCase(removeFromWishlistApi.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Clear Wishlist - Optimistic
      .addCase(clearWishlistApi.pending, (state) => {
        state.products = [];
      })
      .addCase(clearWishlistApi.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } =
  wishlistSlice.actions;
export default wishlistSlice.reducer;
