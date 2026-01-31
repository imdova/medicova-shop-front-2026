// hooks.ts
import {
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
  useStore,
} from "react-redux";
import type { AppDispatch, RootState } from "./store";

// Typed versions of useDispatch, useSelector, and useStore

// Use throughout your app instead of plain `useDispatch`
export const useAppDispatch: () => AppDispatch = useDispatch;

// Typed useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Typed useStore
export const useAppStore = useStore;
