// components/ActionDropdownMenu.tsx
import { useState, useRef, useEffect } from "react";
import { Ellipsis } from "lucide-react";

export interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  action?: () => void; // Specific action for this item
}

interface DropdownMenuProps {
  items: DropdownItem[];
  selectedId?: string;
  onSelect?: (id: string) => void; // Optional general selection handler
  className?: string;
  align?: "left" | "right"; // Added alignment option
}

const ActionDropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  selectedId,
  onSelect,
  className = "",
  align = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, items.length - 1));
          break;
        case "ArrowUp":
          event.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            event.preventDefault();
            handleItemAction(items[focusedIndex]);
            setIsOpen(false);
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, focusedIndex, items]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setFocusedIndex(items.findIndex((item) => item.id === selectedId));
  };

  const handleItemAction = (item: DropdownItem) => {
    if (item.disabled) return;

    // Execute item-specific action if exists
    if (item.action) {
      item.action();
    }

    // Execute general onSelect if exists
    if (onSelect) {
      onSelect(item.id);
    }
  };

  return (
    <div ref={dropdownRef} className={` ${className}`}>
      <button
        type="button"
        className="flex h-full w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-left shadow-sm transition-colors duration-200 hover:bg-gray-50"
        onClick={toggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>
          <Ellipsis size={17} />
        </span>
      </button>

      {isOpen && (
        <ul
          className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-base shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none ${align === "right" ? "right-0" : "left-0"}`}
          role="listbox"
          tabIndex={-1}
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              className={`flex cursor-pointer select-none items-center gap-1 px-4 py-2 text-gray-700 ${item.id === selectedId ? "bg-indigo-100 text-indigo-900" : "hover:bg-gray-100"} ${item.disabled ? "cursor-not-allowed opacity-50" : ""} ${index === focusedIndex ? "bg-gray-100" : ""}`}
              onClick={() => handleItemAction(item)}
              role="option"
              aria-selected={item.id === selectedId}
              aria-disabled={item.disabled}
            >
              {item.icon && <span>{item.icon}</span>}
              <span className="flex-1 text-sm">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActionDropdownMenu;
