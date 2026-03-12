"use client";

import { Loader2, Trash2 } from "lucide-react";
import Modal from "@/components/shared/Modals/DynamicModal";
import { Button } from "@/components/shared/button";
import { ApiProduct } from "@/services/productService";

interface DeleteProductModalProps {
  isAr: boolean;
  isOpen: boolean;
  isDeleting: boolean;
  product: ApiProduct | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteProductModal({
  isAr,
  isOpen,
  isDeleting,
  product,
  onClose,
  onConfirm,
}: DeleteProductModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={() => !isDeleting && onClose()} size="sm">
      <div className="p-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <Trash2 size={24} strokeWidth={2.5} />
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-black text-gray-900">
            {isAr ? "حذف المنتج؟" : "Delete Product?"}
          </h3>
          <p className="mt-2 text-sm font-medium text-gray-500">
            {isAr
              ? `هل أنت متأكد من حذف "${product?.nameAr || product?.nameEn}"؟ لا يمكن التراجع عن هذا الإجراء.`
              : `Are you sure you want to delete "${product?.nameEn || product?.nameAr}"? This action cannot be undone.`}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="h-10 rounded-xl border-gray-100 text-xs font-black"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isDeleting}
            className="h-10 rounded-xl bg-rose-600 text-xs font-black text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-700 hover:shadow-rose-300 active:scale-[0.98] disabled:opacity-50"
          >
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isAr ? "تأكيد الحذف" : "Confirm Delete"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
