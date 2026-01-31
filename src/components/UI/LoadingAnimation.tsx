"use client";

import { motion } from "framer-motion";

export default function LoadingAnimation() {
  return (
    <div className="fixed inset-0 z-[1000] flex w-full items-center justify-center bg-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 0.6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        <svg
          width="85"
          height="88"
          viewBox="50% 50% 85 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible text-primary"
        >
          <motion.path
            d="M30.8364 23.0021C37.1914 23.0021 42.3431 17.8529 42.3431 11.501C42.3431 5.14919 37.1914 0 30.8364 0C24.4813 0 19.3296 5.14919 19.3296 11.501C19.3296 17.8529 24.4813 23.0021 30.8364 23.0021Z"
            fill="currentColor"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M55.2626 19.3702C55.2626 19.3702 43.2511 20.5808 31.6434 29.8119H31.3406C31.3406 29.8119 23.7704 21.8419 7.7215 19.0675V27.4411C7.7215 27.4411 22.5592 30.5685 31.0378 38.3872C31.0378 38.3872 31.6434 38.7908 32.0472 38.3872C32.4509 37.9837 40.0212 30.8208 55.2626 27.4411V19.3702Z"
            fill="currentColor"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M62.8834 28.349C62.8834 28.349 62.9843 77.3797 62.8834 77.3797C62.7825 77.3797 49.9635 82.3736 49.9635 82.3736V46.6598L31.694 58.4131L13.475 46.7607V69.561L31.694 76.7239L46.1784 70.1159V83.1807L31.2903 90.848L0 77.985L0.353284 28.4499C0.353284 28.4499 19.6826 31.8296 31.694 42.9271C31.694 42.9271 39.5166 33.696 62.8329 28.4499L62.8834 28.349Z"
            fill="currentColor"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
