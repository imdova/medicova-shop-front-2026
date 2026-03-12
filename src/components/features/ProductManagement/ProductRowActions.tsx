"use client";

import Link from "next/link";
import { Copy, Pencil, Trash2 } from "lucide-react";

interface ProductRowActionsProps {
  isAr: boolean;
  editPath: string;
  onDelete: () => void;
}

export function ProductRowActions({
  isAr,
  editPath,
  onDelete,
}: ProductRowActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={editPath}
        className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
        aria-label={isAr ? "تعديل" : "Edit"}
      >
        <Pencil className="h-4 w-4" />
      </Link>

      <button
        type="button"
        onClick={() => {}}
        className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
        aria-label={isAr ? "نسخ" : "Copy"}
      >
        <Copy className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
        aria-label={isAr ? "حذف" : "Delete"}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
