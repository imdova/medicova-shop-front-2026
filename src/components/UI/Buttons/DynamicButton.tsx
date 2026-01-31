import React from "react";
import Link from "next/link";

interface DynamicButtonProps {
  href?: string;
  label: string;
  className?: string;
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "white"
    | "danger"
    | "success"
    | "outlineSussces";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  disabled?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: string;
}

const DynamicButton: React.FC<DynamicButtonProps> = ({
  href,
  label,
  variant = "primary",
  size = "md",
  className = "",
  icon,
  iconPosition = "left",
  disabled = false,
  fullWidth = false,
  onClick,
}) => {
  // Base styles
  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none";

  // Variant styles
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 rounded-lg",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 rounded-lg",
    outline:
      "border border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white ",
    outlineSussces:
      "border border-green-700 text-green-700 hover:bg-green-700 hover:text-white rounded-lg",
    white:
      "bg-white text-gray-700 shadow-md hover:bg-gray-100 focus:ring-gray-300 rounded-lg",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 rounded-lg",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 rounded-lg",
  };

  // Size styles
  const sizes = {
    xs: "px-2.5 py-1.5 text-xs",
    sm: "px-3 py-2 text-sm min-w-[100px]",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  // Icon spacing
  const iconSpacing = {
    xs: "gap-1",
    sm: "gap-1.5",
    md: "gap-2",
    lg: "gap-2.5",
    xl: "gap-3",
  };

  // Disabled state
  const disabledStyles = "opacity-50 cursor-not-allowed";

  // Full width
  const fullWidthStyles = "w-full";

  // Combine all classes
  const combinedClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${iconSpacing[size]}
    ${disabled ? disabledStyles : ""}
    ${fullWidth ? fullWidthStyles : ""}
    ${className}
  `;

  // Button content with optional icon
  const buttonContent = (
    <>
      {icon && iconPosition === "left" && (
        <span className="inline-flex">{icon}</span>
      )}
      {label}
      {icon && iconPosition === "right" && (
        <span className="inline-flex">{icon}</span>
      )}
    </>
  );

  return (
    <Link
      href={href ?? ""}
      className={combinedClasses.trim()}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
        } else if (onClick) {
          onClick();
        }
      }}
      aria-disabled={disabled}
    >
      {buttonContent}
    </Link>
  );
};

export default DynamicButton;
