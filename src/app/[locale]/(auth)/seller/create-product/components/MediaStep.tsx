"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, X, UploadCloud, Eye } from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";

interface MediaStepProps {
  images: File[];
  onUpload: (files: FileList | null) => void;
  onRemove: (index: number) => void;
  locale: string;
}

export const MediaStep = ({
  images,
  onUpload,
  onRemove,
  locale,
}: MediaStepProps) => {
  const t = useTranslations("create_product.media");

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onUpload(e.dataTransfer.files);
    },
    [onUpload],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{t("title")}</h2>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          className="group relative cursor-pointer"
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => onUpload(e.target.files)}
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
          />
          <div className="group-hover:bg-primary/5 group-hover:border-primary/50 flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-gray-100 bg-gray-50/50 p-12 backdrop-blur-sm transition-all duration-300">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-100 bg-white text-primary shadow-xl shadow-gray-200/50 transition-transform group-hover:rotate-6 group-hover:scale-110">
              <UploadCloud size={32} />
            </div>
            <p className="mb-2 text-lg font-black text-gray-900">
              {t("uploadText")}
            </p>
            <p className="text-sm font-bold uppercase tracking-widest text-gray-400">
              {t("uploadSubtext")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
        <AnimatePresence>
          {images.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="group relative aspect-square overflow-hidden rounded-[2rem] border-4 border-white shadow-2xl shadow-gray-200/50"
            >
              <Image
                src={URL.createObjectURL(file)}
                alt={`Product ${index}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-900 transition-transform hover:scale-110">
                  <Eye size={18} />
                </button>
                <button
                  onClick={() => onRemove(index)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500 text-white transition-transform hover:scale-110"
                >
                  <X size={18} />
                </button>
              </div>
              {index === 0 && (
                <div className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                  {t("mainImage")}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
