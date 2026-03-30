"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useAppDispatch } from "@/store/hooks";
import { fetchWishlist } from "@/store/slices/wishlistSlice";

export default function WishlistSync() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const anySession = session as any;
    if (status === "authenticated" && anySession?.accessToken) {
      dispatch(fetchWishlist(anySession.accessToken as string));
    }
  }, [status, session, dispatch]);

  return null; // This component doesn't render anything UI-wise
}
