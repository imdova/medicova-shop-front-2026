import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "@/types/cart";
import { Seller, shippingMethod } from "@/types/product";
import { Brand, LiquidSizeType, NumericSizeType, SizeType } from "@/types";
import { LocalizedTitle } from "@/types/language";

interface CartState {
  products: CartItem[];
  totalPrice: number;
}


const initialState: CartState = { products: [], totalPrice: 0 };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (
      state,
      action: PayloadAction<CartItem>,
    ) => {
      const { id, price, quantity = 1, unitSelections = [] } = action.payload;
      const existingItem = state.products.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
        if (unitSelections.length > 0) {
          if (!existingItem.unitSelections) existingItem.unitSelections = [];
          existingItem.unitSelections.push(...unitSelections);
        }
        existingItem.totalPrice = existingItem.quantity * existingItem.price;
      } else {
        state.products.push({
          ...action.payload,
          totalPrice: price * quantity,
        });
      }

      state.totalPrice = state.products.reduce(
        (sum, item) => sum + item.totalPrice,
        0,
      );
    },

    increaseQuantity: (
      state,
      action: PayloadAction<{ id: string; amount?: number }>,
    ) => {
      const { id, amount = 1 } = action.payload;
      const existingItem = state.products.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += amount;
        
        // If we have unit selections, we should probably duplicate the last one
        // or just keep it as is if we don't know what to add. 
        // For simplicity, if unitSelections exists, we'll repeat the first selection for the new units.
        if (existingItem.unitSelections && existingItem.unitSelections.length > 0) {
          const firstSelection = existingItem.unitSelections[0];
          for (let i = 0; i < amount; i++) {
            existingItem.unitSelections.push({ ...firstSelection });
          }
        }

        existingItem.totalPrice = existingItem.quantity * existingItem.price;
        state.totalPrice += existingItem.price * amount;
      }
    },

    decreaseQuantity: (
      state,
      action: PayloadAction<{ id: string; amount?: number }>,
    ) => {
      const { id, amount = 1 } = action.payload;
      const existingItem = state.products.find((item) => item.id === id);

      if (existingItem) {
        if (existingItem.quantity > amount) {
          existingItem.quantity -= amount;
          
          // Remove from unit selections if they exist
          if (existingItem.unitSelections) {
            existingItem.unitSelections = existingItem.unitSelections.slice(0, existingItem.quantity);
          }

          existingItem.totalPrice = existingItem.quantity * existingItem.price;
          state.totalPrice -= existingItem.price * amount;
        } else {
          state.totalPrice -= existingItem.totalPrice;
          state.products = state.products.filter((item) => item.id !== id);
        }
      }
    },

    removeItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const existingItem = state.products.find((item) => item.id === id);

      if (existingItem) {
        state.totalPrice -= existingItem.totalPrice;
        state.products = state.products.filter((item) => item.id !== id);
      }
    },

    clearCart: (state) => {
      state.products = [];
      state.totalPrice = 0;
    },

  
    setCart: (state, action: PayloadAction<CartState>) => {
      state.products = action.payload.products;
      state.totalPrice = action.payload.totalPrice;
    },
  },
});

export const {
  addItem,
  removeItem,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  setCart,
} = cartSlice.actions;
export default cartSlice.reducer;
