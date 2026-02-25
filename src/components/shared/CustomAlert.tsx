"use client";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  ShoppingBag,
  Heart,
} from "lucide-react";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AlertProps {
  message: string;
  type: "success" | "error" | "info" | "cart" | "wishlist";
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDuration?: number;
}

const CustomAlert: React.FC<AlertProps> = ({
  message,
  type,
  onClose,
  autoClose = true,
  autoCloseDuration = 3000,
}) => {
  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(onClose, autoCloseDuration);
      return () => clearTimeout(timer);
    }
  }, [onClose, autoClose, autoCloseDuration]);

  const alertConfig = {
    success: {
      icon: <CheckCircle2 className="h-5 w-5 text-green-700" />,
      bg: "bg-white",
      text: "text-gray-800",
      border: "border-gray-100",
      accent: "text-gray-600",
    },
    error: {
      icon: <AlertCircle className="h-5 w-5 text-red-700" />,
      bg: "bg-white",
      text: "text-gray-800",
      border: "border-gray-100",
      accent: "text-gray-600",
    },
    info: {
      icon: <Info className="h-5 w-5" />,
      bg: "bg-white",
      text: "text-gray-800",
      border: "border-gray-100",
      accent: "text-gray-600",
    },
    cart: {
      icon: <ShoppingBag className="h-5 w-5 text-green-700" />,
      bg: "bg-white",
      text: "text-gray-800",
      border: "border-gray-100",
      accent: "text-gray-600",
    },
    wishlist: {
      icon: <Heart className="h-5 w-5 text-red-600" />,
      bg: "bg-white",
      text: "text-gray-800",
      border: "border-gray-100",
      accent: "text-gray-600",
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className={`fixed bottom-5 left-5 z-[9999] flex w-full max-w-[300px] items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm ${alertConfig[type].bg} ${alertConfig[type].border}`}
      >
        <div className={`mt-0.5 ${alertConfig[type].accent}`}>
          {alertConfig[type].icon}
        </div>

        <div className="flex-1">
          <p className={`mt-1 text-sm ${alertConfig[type].text}`}>{message}</p>
        </div>

        <button
          onClick={onClose}
          className={`rounded-full p-1 transition-colors hover:bg-black/10 ${alertConfig[type].accent}`}
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomAlert;
