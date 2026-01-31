import React, { useState } from "react";

interface StatusToggleProps {
  initialStatus?: boolean;
  onToggle?: (newStatus: boolean) => void;
  className?: string;
  locale?: "en" | "ar";
}

const StatusToggle: React.FC<StatusToggleProps> = ({
  initialStatus = false,
  onToggle,
  className = "",
  locale = "en",
}) => {
  const [isActive, setIsActive] = useState(initialStatus);
  const isRtl = locale === "ar";

  const handleToggle = () => {
    const newStatus = !isActive;
    setIsActive(newStatus);
    onToggle?.(newStatus);
  };

  const getTranslateClass = () => {
    if (isRtl) {
      return isActive ? "translate-x-1" : "translate-x-6";
    } else {
      return isActive ? "translate-x-6" : "translate-x-1";
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        isActive ? "bg-green-500" : "bg-gray-300"
      } ${className}`}
      aria-pressed={isActive}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${getTranslateClass()}`}
      />
    </button>
  );
};

export default StatusToggle;
