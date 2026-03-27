import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CheckoutState {
  phoneNumber: string;
  isNewUser: boolean;
  step: number; // 1: Phone, 2: Password (if exists), 3: Details (Governorate/Address)
}

const initialState: CheckoutState = {
  phoneNumber: "",
  isNewUser: false,
  step: 1,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setCheckoutPhone: (state, action: PayloadAction<{ phoneNumber: string; isNewUser: boolean }>) => {
      state.phoneNumber = action.payload.phoneNumber;
      state.isNewUser = action.payload.isNewUser;
      state.step = action.payload.isNewUser ? 3 : 2;
    },
    setCheckoutStep: (state, action: PayloadAction<number>) => {
      state.step = action.payload;
    },
    resetCheckout: (state) => {
      state.phoneNumber = "";
      state.isNewUser = false;
      state.step = 1;
    },
  },
});

export const { setCheckoutPhone, setCheckoutStep, resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
