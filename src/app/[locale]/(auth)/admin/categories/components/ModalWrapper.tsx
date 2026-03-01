"use client";

import React from "react";
import { X } from "lucide-react";

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  titleId,
  children,
  footer,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[5000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="animate-in fade-in zoom-in-95 relative flex w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl duration-200"
        style={{ maxHeight: "85vh" }}
      >
        {/* Header — fixed */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-5 sm:px-8">
          <h2 id={titleId} className="text-xl font-black text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 sm:px-8">
          {children}
        </div>

        {/* Footer — fixed */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-4 sm:px-8">
          {footer}
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;
