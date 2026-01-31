"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/UI/input";
import { useLanguage } from "@/contexts/LanguageContext";

const COLOR_PRESETS = [
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFA500",
  "#800080",
  "#008080",
  "#FFC0CB",
  "#808080",
];

export const ColorPicker = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const { language } = useLanguage();
  const pickerRef = useRef<HTMLDivElement>(null);

  const t = {
    en: {
      presets: "Color Presets",
      custom: "Custom Color",
      recent: "Recent Colors",
    },
    ar: {
      presets: "الألوان المحددة",
      custom: "لون مخصص",
      recent: "الألوان الحديثة",
    },
  }[language];

  // Load recent colors from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("recentColors");
    if (stored) {
      setRecentColors(JSON.parse(stored));
    }
  }, []);

  // Save recent colors when value changes
  useEffect(() => {
    if (value && /^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      setRecentColors((prev) => {
        const updated = [value, ...prev.filter((c) => c !== value)].slice(
          0,
          10,
        );
        localStorage.setItem("recentColors", JSON.stringify(updated));
        return updated;
      });
    }
  }, [value]);

  // Close picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={pickerRef}>
      {/* Swatch + Hex Input */}
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 cursor-pointer rounded-md border-2 border-gray-300 shadow-sm transition-shadow hover:shadow-md"
          style={{ backgroundColor: value }}
          onClick={() => setShowPicker((prev) => !prev)}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full font-mono text-sm"
          placeholder="#000000"
        />
      </div>

      {/* Picker Popover */}
      {showPicker && (
        <div className="absolute left-0 top-full z-10 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
          {/* Presets */}
          <div className="mb-3">
            <label className="mb-2 block text-sm font-medium">
              {t.presets}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="h-8 w-8 rounded-md border-2 border-gray-200 transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setShowPicker(false);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Custom Color Input */}
          <div>
            <label className="mb-2 block text-sm font-medium">{t.custom}</label>
            <Input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="h-10 w-full cursor-pointer p-1"
            />
          </div>

          {/* Recent Colors */}
          {recentColors.length > 0 && (
            <div className="mt-3 border-t pt-3">
              <label className="mb-2 block text-sm font-medium">
                {t.recent}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {recentColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="h-8 w-8 rounded-md border-2 border-gray-200 transition-transform hover:scale-110"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      onChange(color);
                      setShowPicker(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
