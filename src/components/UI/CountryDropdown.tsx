import { Country } from "@/types";
import { LanguageType } from "@/util/translations";
import { Check, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

export const CountryDropdown: React.FC<{
  options: Country[];
  selected: string;
  onSelect: (value: string) => void;
  locale: LanguageType;
  icon?: React.ReactNode;
}> = ({ options, selected, onSelect, locale }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    return options.filter((option) =>
      option.name?.[locale]?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [options, searchTerm, locale]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.id === selected);
  console.log(selectedOption?.code.toLowerCase());
  return (
    <div ref={dropdownRef} className="relative inline-block w-full text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <Image
            width={300}
            height={300}
            src={`https://flagcdn.com/h20/${selectedOption?.code.toLowerCase()}.png`}
            alt={selectedOption?.name[locale] ?? "country image"}
            className="mr-1 h-4 w-4 rounded-full"
          />
          <span>{selectedOption?.name[locale]}</span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="border-b p-2">
            <input
              type="text"
              placeholder="Search countries..."
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <ul className="max-h-60 overflow-y-auto py-1">
            {filteredOptions.map((option) => (
              <li
                key={option.id}
                onClick={() => {
                  onSelect(option.id);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100 ${
                  option.id === selected ? "bg-green-50 font-semibold" : ""
                }`}
              >
                {option.id === selected && (
                  <Check size={16} className="text-green-600" />
                )}
                <div className="flex items-center gap-1">
                  <Image
                    width={300}
                    height={300}
                    src={`https://flagcdn.com/h20/${option.code.toLowerCase()}.png`}
                    alt={option?.name[locale] ?? "country image"}
                    className="mr-1 h-4 w-4 rounded-full"
                  />{" "}
                  <span className="flex-1">{option.name[locale]}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
