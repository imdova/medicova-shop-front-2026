import { LanguageType } from "@/util/translations";
import { useLocale, useTranslations } from "next-intl";
import {
  DollarSign,
  ShoppingBag,
  Box,
  Star,
  Eye,
  Award,
  Users,
  ArrowUp,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { motion } from "framer-motion";

export type IconType =
  | "dollar"
  | "shoppingCart"
  | "package"
  | "star"
  | "eye"
  | "award"
  | "users"
  | "ArrowUp";

interface CardStatsProps {
  title: string;
  value: string;
  change?: string;
  details?: string;
  icon: IconType;
  color?: string; // expected format: hex or rgb
  size?: "sm" | "md" | "lg";
}

const iconMap = {
  dollar: DollarSign,
  shoppingCart: ShoppingBag,
  package: Box,
  star: Star,
  eye: Eye,
  award: Award,
  users: Users,
  ArrowUp: ArrowUp,
};

function hexToRgba(hex: string, opacity: number): string {
  let r = 0,
    g = 0,
    b = 0;

  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function CardStats({
  title,
  value,
  change,
  icon,
  color, // No longer defaulting here, will use primary if not set
  size = "md",
  details,
}: CardStatsProps) {
  const locale = useLocale() as LanguageType;
  const t = useTranslations("admin");
  const Icon = iconMap[icon];
  const isPositive = change?.startsWith("+");
  const isAr = locale === "ar";

  // Use primary color token if specific color isn't provided
  const accentColor = color || "var(--primary)";

  const sizeMap = {
    sm: { container: "p-2", icon: "h-4 w-4", text: "text-base" },
    md: { container: "p-2", icon: "h-4 w-4", text: "text-base" },
    lg: { container: "p-2", icon: "h-4 w-4", text: "text-base" },
  };

  const sizeStyles = sizeMap[size];

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 p-7 shadow-2xl shadow-gray-200/50 backdrop-blur-2xl"
    >
      {/* Premium Mesh Background Effect */}
      <div className="absolute inset-0 z-0 opacity-0 transition-opacity duration-700 group-hover:opacity-10">
        <div
          className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full blur-[100px]"
          style={{ backgroundColor: accentColor }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full blur-[100px]"
          style={{ backgroundColor: accentColor }}
        />
      </div>

      {/* Decorative Branding Glow */}
      <div
        className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-[80px] transition-all duration-700 group-hover:opacity-30"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative z-10 flex items-start justify-between">
        <div className="space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400/80">
            {title}
          </p>
          <div className="flex items-baseline gap-3">
            <h3
              className={`font-black tracking-tighter text-gray-900 ${sizeStyles.text}`}
            >
              {value}
            </h3>
            {change && (
              <div
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-all duration-300 ${
                  isPositive
                    ? "bg-emerald-50/50 text-emerald-600 ring-1 ring-emerald-500/20"
                    : "bg-rose-50/50 text-rose-600 ring-1 ring-rose-500/20"
                } group-hover:scale-110`}
              >
                {isPositive ? (
                  <TrendingUp size={12} className="stroke-[3]" />
                ) : (
                  <TrendingDown size={12} className="stroke-[3]" />
                )}
                <span>{change}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {details ? (
              <p className="text-[11px] font-medium text-gray-400">{details}</p>
            ) : (
              change && (
                <p className="text-[11px] font-semibold text-gray-500/60">
                  {t("vsLastMonth")}
                </p>
              )
            )}
          </div>
        </div>

        <div
          className={`relative flex items-center justify-center rounded-[1.75rem] bg-white shadow-2xl shadow-gray-200/60 ring-1 ring-gray-100/50 transition-all duration-700 group-hover:rotate-6 group-hover:scale-110 ${sizeStyles.container}`}
        >
          <Icon
            className={`${sizeStyles.icon}`}
            style={{ color: accentColor }}
            strokeWidth={2.2}
          />
          <div
            className="absolute inset-0 rounded-[1.75rem] opacity-0 transition-opacity duration-700 group-hover:opacity-10"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>

      {/* Elegant bottom accent */}
      <div
        className="absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 transition-transform duration-700 ease-in-out group-hover:scale-x-100"
        style={{ backgroundColor: accentColor }}
      />
    </motion.div>
  );
}
