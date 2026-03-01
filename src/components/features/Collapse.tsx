"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

interface CollapseProps {
  title: string;
  url: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  fontSize?: "sm" | "md" | "lg" | "xl";
}

const Collapse: React.FC<CollapseProps> = ({
  title,
  children,
  url,
  size = "md",
  fontSize = "md",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "p-1";
      case "md":
        return "p-2";
      case "lg":
        return "p-3";
      default:
        return "p-2";
    }
  };

  const getFontSizeClasses = () => {
    switch (fontSize) {
      case "sm":
        return "text-xs";
      case "md":
        return "text-sm";
      case "lg":
        return "text-base";
      case "xl":
        return "text-lg";
      default:
        return "text-sm";
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return "h-6 w-6";
      case "md":
        return "h-7 w-7";
      case "lg":
        return "h-8 w-8";
      default:
        return "h-7 w-7";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 12;
      case "md":
        return 15;
      case "lg":
        return 18;
      default:
        return 15;
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div
        className={`flex w-full cursor-pointer items-center justify-between ${getSizeClasses()}`}
      >
        <Link
          className={`font-semibold text-gray-800 ${getFontSizeClasses()}`}
          href={url ?? "gg"}
        >
          {title}
        </Link>
        <button
          className={`flex cursor-pointer items-center justify-center rounded-full transition focus:bg-gray-50 ${getButtonSize()}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown
            size={getIconSize()}
            className={`text-gray-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      <div
        className={`transition-all duration-500 ease-in-out ${isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className={`pl-3 text-gray-700 ${getFontSizeClasses()}`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Collapse;
