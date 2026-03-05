"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  X,
  UploadCloud,
  Eye,
  Video,
  Info,
  Layers,
  Layout,
  PlayCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { useCallback } from "react";
import { ProductFormData } from "@/lib/validations/product-schema";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";

interface MediaStepProps {
  product: ProductFormData;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  errors: Record<string, string>;
  locale: string;
}

export const MediaStep = ({
  product,
  onUpdate,
  errors,
  locale,
}: MediaStepProps) => {
  const t = useTranslations("create_product.media");
  const images = product.images || [];

  const handleUpload = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const newImages = Array.from(files);
      onUpdate({ images: [...images, ...newImages] });
    },
    [images, onUpdate],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onUpdate({ images: images.filter((_, i) => i !== index) });
    },
    [images, onUpdate],
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mx-auto max-w-4xl space-y-8 px-1 py-1"
    >
      {errors.images && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/50 p-3 text-red-600">
          <AlertCircle size={16} />
          <p className="text-xs font-bold">{errors.images}</p>
        </div>
      )}
      {/* 1. Upload & Gallery Section */}
      <div className="space-y-4">
        {/* Compact Upload Zone */}
        <div className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/30 p-1 transition-all hover:border-teal-500/30 hover:bg-teal-50/5">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files)}
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
          />
          <div className="flex flex-col items-center justify-center py-6 transition-all">
            <div
              style={{ backgroundColor: "lab(58.4941% -47.8529 35.5714)" }}
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-transform group-hover:scale-110"
            >
              <UploadCloud size={20} />
            </div>
            <p className="mb-1 text-sm font-bold text-gray-900">
              Click or drag images here
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              PNG, JPG, WEBP (Max 10 images)
            </p>
          </div>
        </div>

        {/* Media Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-50 pb-2">
            <div className="flex items-center gap-2">
              <Layout size={14} className="text-gray-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Gallery Overview
              </span>
            </div>
            <span className="text-[10px] font-bold text-gray-300">
              {images.length} / 10
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            <AnimatePresence mode="popLayout">
              {images.map((file, index) => {
                const url =
                  typeof file === "string" ? file : URL.createObjectURL(file);
                const isMain = index === 0;

                return (
                  <motion.div
                    layout
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`group relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                      isMain
                        ? "border-teal-500 shadow-md ring-2 ring-teal-500/10"
                        : "border-white bg-white shadow-sm"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`Product ${index}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlay Controls */}
                    <div className="absolute inset-0 flex items-center justify-center gap-1 bg-gray-900/40 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => handleRemove(index)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    {isMain && (
                      <div className="absolute left-1 top-1 rounded-md bg-teal-500 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-widest text-white shadow-sm">
                        Primary
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. Optional Video Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <Video size={16} className="text-gray-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">
              Video Showcase
            </span>
          </div>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">
              <PlayCircle size={16} />
            </div>
            <Input
              value={product.media?.productVideo?.vedioUrl || ""}
              onChange={(e) =>
                onUpdate({
                  media: {
                    ...product.media,
                    productVideo: {
                      ...product.media?.productVideo,
                      vedioUrl: e.target.value,
                    },
                  },
                })
              }
              placeholder="YouTube or Vimeo URL..."
              className="h-9 rounded-lg border-gray-200 pl-10 text-xs font-semibold focus:border-teal-500"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-teal-50 bg-teal-50/20 p-4">
          <div className="flex gap-3">
            <Info size={16} className="shrink-0 text-teal-500" />
            <p className="text-[11px] font-medium leading-relaxed text-teal-700/70">
              Videos increase conversion rates by 30%. Paste links from YouTube,
              Vimeo, or a direct S3 link.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
