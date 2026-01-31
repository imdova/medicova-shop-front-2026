import { useEffect, useRef, ReactNode } from "react";
import { Check, X } from "lucide-react";
import { LocalizedTitle } from "@/types/language";
import { LanguageType } from "@/util/translations";

interface DropdownOption {
  id: string | number;
  name: LocalizedTitle;
}

interface MobileDropdownProps {
  label?: string;
  options?: DropdownOption[]; // Make optional
  selected?: string | number;
  onSelect?: (value: string | number) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children?: ReactNode; // Allow any custom content
  locale: LanguageType;
}

export default function MobileDropdown({
  label = "Select",
  options,
  selected,
  onSelect,
  setIsOpen,
  isOpen,
  children,
  locale,
}: MobileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[2000] max-h-[70vh] w-full rounded-t-lg bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ touchAction: "none" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Custom Content or Default Options */}
        {children ? (
          <div className="max-h-[60vh] overflow-auto p-4">{children}</div>
        ) : (
          <ul className="max-h-[60vh] divide-y divide-gray-200 overflow-auto">
            {options?.map((option) => (
              <li
                key={option.id}
                onClick={() => {
                  onSelect?.(option.id);
                  setIsOpen(false);
                }}
                className={`flex cursor-pointer items-center justify-between px-4 py-3 text-sm hover:bg-green-100 ${
                  option.id === selected ? "font-semibold text-green-600" : ""
                }`}
              >
                {option.name[locale]}
                {option.id === selected && <Check size={16} />}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-40 bg-black bg-opacity-30"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
