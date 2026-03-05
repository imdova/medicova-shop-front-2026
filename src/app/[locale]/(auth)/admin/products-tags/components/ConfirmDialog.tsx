"use client";

import { AlertTriangle, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useTranslations("admin.productTagsPage");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div
        className="animate-in zoom-in-95 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <h3 id="confirm-title" className="text-sm font-bold text-gray-900">
              {t("deleteConfirmTitle")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Message */}
        <p className="mb-6 text-sm leading-relaxed text-gray-500">
          {t("deleteConfirmMessage")}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100"
          >
            {t("cancelForm")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-600 hover:shadow-md"
          >
            {t("deleteConfirmTitle")}
          </button>
        </div>
      </div>
    </div>
  );
}
