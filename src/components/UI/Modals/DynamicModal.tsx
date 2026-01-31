import { X } from "lucide-react";
import React, { ReactNode, useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  closeOnOutsideClick?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  closeOnOutsideClick = true,
  size = "md",
}) => {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-[5000] flex h-full w-full items-center justify-center overflow-y-auto">
      <div className="flex h-full w-full items-center justify-center p-4 text-center sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={closeOnOutsideClick ? onClose : undefined}
        >
          <div className="absolute inset-0 bg-black/40 opacity-75"></div>
        </div>

        {/* Modal container */}
        <div
          className={`relative w-full overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 ${sizeClasses[size]}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          {/* Modal content */}
          <div className="scroll-bar-minimal max-h-[600px] overflow-y-auto px-4 py-5 sm:p-6">
            {children}
          </div>
          <button onClick={onClose} className="absolute right-3 top-3">
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
