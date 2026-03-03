"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  ImageIcon,
  X,
  UploadCloud,
  Eye,
  Plus,
  Video,
  Info,
  Layers,
  Layout,
  PlayCircle,
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl space-y-16 pb-20"
    >
      {/* 1. Upload & Gallery Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner ring-1 ring-rose-100/50">
            <ImageIcon size={24} />
          </div>
          <div>
            <h2 className="mb-1 text-2xl font-black leading-none text-gray-900">
              {t("title")}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Manage your product visual identity
            </p>
          </div>
        </div>

        {/* Master Upload Zone */}
        <div className="group relative cursor-pointer overflow-hidden rounded-[3rem] border-2 border-dashed border-gray-100 bg-white/40 p-1 backdrop-blur-xl transition-all hover:border-gray-900/20 hover:bg-white/60">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleUpload(e.target.files)}
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
          />
          <div className="flex flex-col items-center justify-center rounded-[2.8rem] border-2 border-dashed border-transparent px-6 py-12 transition-all group-hover:bg-white/40">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-gray-900 text-white shadow-2xl transition-transform group-hover:rotate-6 group-hover:scale-110">
              <UploadCloud size={32} />
            </div>
            <p className="mb-2 text-xl font-black text-gray-900">
              {t("uploadText")}
            </p>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">
              {t("uploadSubtext")}
            </p>
          </div>
        </div>

        {/* Media Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layout size={14} className="text-gray-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
                {t("otherImages")}
              </span>
            </div>
            <span className="text-[10px] font-black text-gray-300">
              {images.length} / 10 Images
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:grid-cols-5">
            <AnimatePresence mode="popLayout">
              {images.map((file, index) => {
                const url =
                  typeof file === "string" ? file : URL.createObjectURL(file);
                const isMain = index === 0;

                return (
                  <motion.div
                    layout
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`group relative aspect-square overflow-hidden rounded-3xl border-4 transition-all ${
                      isMain
                        ? "z-10 border-rose-500 shadow-xl ring-4 ring-rose-500/20"
                        : "border-white bg-white shadow-sm hover:shadow-lg"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`Product ${index}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Overlay Controls */}
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-gray-900/60 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100">
                      <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-900 shadow-xl transition-transform hover:scale-110 active:scale-95">
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleRemove(index)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Labels */}
                    {isMain && (
                      <div className="absolute left-2 top-2 rounded-full bg-rose-500 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white shadow-lg">
                        {t("mainImage")}
                      </div>
                    )}

                    <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[10px] font-black text-gray-900 shadow-sm backdrop-blur-md">
                      {index + 1}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 2. Optional Video & Help */}
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner ring-1 ring-indigo-100/50">
            <Video size={24} />
          </div>
          <div>
            <h2 className="mb-1 text-xl font-black leading-none text-gray-900">
              Video Link
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              Optional Showcase
            </p>
          </div>
        </div>

        <div className="space-y-6 rounded-[2.5rem] border border-white/60 bg-indigo-50/10 p-10 shadow-sm backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.1em] text-gray-400">
                URL Reference
              </Label>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[8px] font-black uppercase tracking-tighter text-indigo-500">
                Optional
              </span>
            </div>
            <div className="group relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 transition-colors group-focus-within:text-indigo-600">
                <PlayCircle size={20} />
              </div>
              <Input
                value={product.videoUrl || ""}
                onChange={(e) => onUpdate({ videoUrl: e.target.value })}
                placeholder={t("videoPlaceholder")}
                className="h-16 rounded-2xl border-2 border-gray-100/50 bg-white/50 pl-14 pr-8 text-sm font-bold shadow-sm transition-all focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="rounded-3xl border border-indigo-100/50 bg-indigo-50/40 p-8">
            <div className="flex gap-4">
              <Info size={20} className="mt-0.5 text-indigo-400" />
              <div>
                <p className="mb-1 text-sm font-bold text-indigo-600">
                  Visual Preview Tips
                </p>
                <p className="text-xs font-medium leading-relaxed text-indigo-400">
                  Adding a high-quality video walkthrough increases conversion
                  rates by up to 30%. Paste links from YouTube, Vimeo, or a
                  direct S3 link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats/Info */}
      <div className="rounded-[3rem] border border-white/60 bg-emerald-50/10 p-10 shadow-sm backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-4">
          <Layers size={22} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
            Pro Tip
          </span>
        </div>
        <p className="mb-6 text-sm font-medium leading-relaxed text-gray-500">
          The first image in your gallery will be used as the **Primary
          Thumbnail** across search and listing pages.
        </p>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(images.length / 10) * 100}%` }}
            className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          />
        </div>
        <p className="mt-3 text-right text-[10px] font-bold uppercase tracking-widest text-gray-400">
          {images.length} / 10 Capacity used
        </p>
      </div>
    </motion.div>
  );
};
