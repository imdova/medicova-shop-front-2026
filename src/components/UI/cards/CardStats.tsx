import { LanguageType } from "@/util/translations";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Star,
  Eye,
  Award,
  Users,
  ArrowUp,
} from "lucide-react";

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
  locale?: LanguageType;
}

const iconMap = {
  dollar: DollarSign,
  shoppingCart: ShoppingCart,
  package: Package,
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
  color = "#16a34a",
  size = "md",
  details,
  locale = "en",
}: CardStatsProps) {
  const Icon = iconMap[icon];
  const isPositive = change?.startsWith("+");
  const bgColor = hexToRgba(color, 0.1);

  // Size classes map
  const sizeMap = {
    sm: { container: "h-10 w-10", icon: "h-4 w-4", text: "text-base" },
    md: { container: "h-14 w-14", icon: "h-5 w-5", text: "text-xl" },
    lg: { container: "h-20 w-20", icon: "h-6 w-6", text: "text-2xl" },
  };

  const sizeStyles = sizeMap[size];

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <span
        style={{ backgroundColor: bgColor }}
        className={`flex items-center justify-center rounded-lg ${sizeStyles.container}`}
      >
        <Icon className={`${sizeStyles.icon}`} style={{ color }} />
      </span>
      <div className="space-y-0.5">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`font-semibold ${sizeStyles.text}`}>{value}</p>
        {details ? (
          <span className="text-xs text-gray-500">{details}</span>
        ) : (
          <p
            className={`text-xs ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {change} {locale === "ar" ? "من الشهر الماضي" : "from last month"}
          </p>
        )}
      </div>
    </div>
  );
}
