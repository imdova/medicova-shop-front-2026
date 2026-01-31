import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

type LanguageSwitcherProps = {
  className?: string;
  variant?: "minimal" | "full" | "icon";
};

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  variant = "full",
}) => {
  const { language, setLanguage, isArabic } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage = language === "en" ? "ar" : "en";
    setLanguage(newLanguage);
  };

  // Animation variants
  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`group relative flex items-center justify-center overflow-hidden rounded-full px-2 text-sm font-medium backdrop-blur-sm transition-all duration-300 ${variant === "minimal" ? "h-10 w-10 p-0" : ""} ${className} `}
      aria-label={isArabic ? "Switch to English" : "التغيير إلى العربية"}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-20"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.2 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content with animations */}
      <div className="relative flex items-center gap-2 text-xs">
        {variant !== "icon" && (
          <AnimatePresence mode="wait">
            <motion.span
              key={language}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={textVariants}
              transition={{ duration: 0.2 }}
              className="hidden md:block"
            >
              {isArabic ? "English" : "العربية"}
            </motion.span>
          </AnimatePresence>
        )}

        <motion.div
          className={`flex h-6 w-6 items-center justify-center rounded-full bg-white/20 font-bold ${variant === "minimal" ? "h-5 w-5 text-xs" : ""} `}
          whileHover={{ scale: 1.1 }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={`mobile-${language}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={textVariants}
              transition={{ duration: 0.2 }}
            >
              {isArabic ? "EN" : "AR"}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0 shadow-lg shadow-blue-400/20 group-hover:opacity-100"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

export default LanguageSwitcher;
