"use client";

import { X } from "lucide-react";
import IconButton from "./Buttons/IconButton";
import { LanguageType } from "@/util/translations";

interface DrawerProps {
  isOpen: boolean;
  hiddenCloseBtn?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  logo?: React.ReactNode;
  width?: string;
  hasOverlay?: boolean;
  position?: "left" | "right";
  mobile?: boolean;
  locale?: LanguageType;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  logo,
  hiddenCloseBtn = false,
  width = "w-70",
  hasOverlay = true,
  position = "left",
  mobile = true,
  locale = "en",
}) => {
  return (
    <div className={`relative z-[2000] ${mobile ? "lg:hidden" : ""} `}>
      {hasOverlay && (
        <div
          className={`fixed inset-0 bg-[#00000060] bg-opacity-50 transition-opacity ${
            isOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
          onClick={onClose}
        ></div>
      )}
      <div
        className={`no-scrollbar fixed top-0 overflow-y-auto ${
          position === "right" ? "right-0" : "left-0"
        } h-full bg-white shadow-lg transition-transform ${
          isOpen
            ? "translate-x-0"
            : position === "right"
              ? "translate-x-full"
              : "-translate-x-full"
        } ${width}`}
      >
        <div>
          {!hiddenCloseBtn && (
            <IconButton
              className={`!absolute top-2 p-2 ${
                position === "right" ? "left-2" : "right-2"
              }`}
              onClick={onClose}
              Icon={X}
            />
          )}
          <div
            className={`flex w-full ${locale === "ar" ? "justify-end" : "justify-start"} p-2`}
          >
            {logo}
          </div>
        </div>

        <div className="p-2">{children}</div>
      </div>
    </div>
  );
};
