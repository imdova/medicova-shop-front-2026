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
        className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg transition duration-150 ${
          isInWishlist
            ? "bg-red-500 text-white"
            : "bg-white text-gray-700 hover:bg-red-500 hover:text-white"
        }`}
      >
        {isInWishlist ? <HeartOff size={16} /> : <Heart size={16} />}
      </button>
    </div>
  );
};

export default WishlistButton;
