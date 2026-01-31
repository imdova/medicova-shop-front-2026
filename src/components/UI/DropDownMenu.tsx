import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { LanguageType } from "@/util/translations";
import { LocalizedTitle } from "@/types/language";

export interface DropdownOption {
  id: string;
  name: LocalizedTitle;
}
interface DropdownProps {
  label?: string;
  icon?: React.ReactNode;
  options: DropdownOption[];
  selected: string | number;
  onSelect: (value: string | number) => void;
  className?: string;
  placeholder?: string;
  locale: LanguageType;
}

export default function Dropdown({
  label,
  icon,
  options,
  selected,
  onSelect,
  className,
  placeholder,
  locale,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === selected);

  return (
    <div ref={dropdownRef} className="relative inline-block w-full text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex w-full items-center justify-between gap-1 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none ${className}`}
      >
        {icon}

        <span>
          {selectedOption
            ? selectedOption.name[locale]
            : label
              ? label
              : placeholder}
        </span>

        <ChevronDown size={16} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-[300px] min-w-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg">
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option.id}
                onClick={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                }}
                className={`flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-green-100 ${
                  option.id === selected ? "font-semibold text-green-600" : ""
                }`}
              >
                {option.id === selected && <Check size={16} />}
                {option.name[locale]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
