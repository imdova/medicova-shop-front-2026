"use client";

import { useState, useEffect } from "react";
import { Heart, HeartOff } from "lucide-react";

interface WishlistButtonProps {
  isInWishlist: boolean;
  productId: string;
  addToWishlist: (e: React.MouseEvent) => void;
}

const WishlistButton = ({
  isInWishlist,
  addToWishlist,
}: WishlistButtonProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <button className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-medium text-gray-700">
        <Heart size={16} />
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={addToWishlist}
        className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 ${
          isInWishlist
            ? "bg-rose-50 text-rose-600 shadow-sm ring-1 ring-rose-200"
            : "bg-white text-gray-400 shadow-sm ring-1 ring-gray-200 hover:bg-rose-50 hover:text-rose-500 hover:shadow-md hover:ring-rose-200"
        }`}
      >
        <Heart
          size={16}
          className={isInWishlist ? "fill-rose-500 text-rose-500" : ""}
        />
      </button>
    </div>
  );
};

export default WishlistButton;
