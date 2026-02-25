"use client";

import React, { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface DynamicCheckboxProps {
  label?: string;
  checked: boolean;
  onChange: () => void;
  id?: string;
  disabled?: boolean;
}

const DynamicCheckbox: React.FC<DynamicCheckboxProps> = ({
  label,
  checked,
  onChange,
  id,
  disabled = false,
}) => {
  const [checkboxId, setCheckboxId] = useState(id || "");

  useEffect(() => {
    if (!id) {
      setCheckboxId(`checkbox-${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [id]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-5 w-5">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`peer h-full w-full appearance-none rounded border-2 border-gray-300 bg-white transition-all duration-200 checked:border-green-600 checked:bg-green-600 focus:outline-none ${
            disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
          }`}
        />
        {/** Checkmark Icon */}
        <div
          className={`pointer-events-none absolute inset-0 left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-white transition-opacity duration-200 ${
            checked ? "opacity-100" : "opacity-0"
          }`}
        >
          <Check size={14} strokeWidth={3} />
        </div>
      </div>
      {label && (
        <label
          htmlFor={checkboxId}
          className={`text-sm ${
            disabled ? "text-gray-400" : "text-gray-700"
          } peer-checked:font-medium peer-checked:text-blue-600 ${
            disabled ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default DynamicCheckbox;
