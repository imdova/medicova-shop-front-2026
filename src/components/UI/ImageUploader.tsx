// ---------------- Image Uploader Component ----------------

import { RotateCw, Upload, X, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export interface UploadedImage {
  id: string;
  url: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview: string;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
  language: string;
}

export const ImageUploader = ({
  images,
  onImagesChange,
  maxFiles = 10,
  maxSize = 10,
  language,
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null,
  );
  const [rotation, setRotation] = useState(0);
  const t = {
    en: {
      images: "Images",
      add_images: "Click here to add more images",
      drag_drop: "Drag & drop images here or click to browse",
      remove: "Remove",
      view: "View",
      rotate: "Rotate",
      close: "Close",
      supported_formats: "PNG, JPG, JPEG, GIF, WEBP up to",
      mb: "MB",
      max_files: "Maximum",
      files: "files",
      image_preview: "Image Preview",
      file_too_large: "File is too large",
      too_many_files: "Too many files selected",
      invalid_file_type: "Invalid file type",
    },
    ar: {
      images: "الصور",
      add_images: "انقر هنا لإضافة المزيد من الصور",
      drag_drop: "اسحب وأفلت الصور هنا أو انقر للتصفح",
      remove: "إزالة",
      view: "عرض",
      rotate: "تدوير",
      close: "إغلاق",
      supported_formats: "PNG, JPG, JPEG, GIF, WEBP حتى",
      mb: "ميجابايت",
      max_files: "الحد الأقصى",
      files: "ملفات",
      image_preview: "معاينة الصورة",
      file_too_large: "الملف كبير جداً",
      too_many_files: "تم اختيار عدد كبير جداً من الملفات",
      invalid_file_type: "نوع ملف غير صالح",
    },
  }[language as "en" | "ar"];

  const validateFile = (file: File): string | null => {
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      return t.invalid_file_type;
    }

    if (file.size > maxSize * 1024 * 1024) {
      return t.file_too_large;
    }

    if (images.length >= maxFiles) {
      return t.too_many_files;
    }

    return null;
  };

  const handleImageUpload = (files: FileList) => {
    const newImages: UploadedImage[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }

      const imageId = Math.random().toString(36).substr(2, 9);
      const previewUrl = URL.createObjectURL(file);

      newImages.push({
        id: imageId,
        url: previewUrl,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: previewUrl,
      });
    });

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleImageUpload(files);
      event.target.value = ""; // Reset input
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const files = event.dataTransfer.files;
    if (files) {
      handleImageUpload(files);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const removeImage = (imageId: string) => {
    const imageToRemove = images.find((img) => img.id === imageId);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onImagesChange(images.filter((img) => img.id !== imageId));

    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  };

  const openImagePreview = (image: UploadedImage) => {
    setSelectedImage(image);
    setRotation(0);
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      <div className="space-y-4">
        {/* Drag & Drop Area */}
        <div
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${images.length >= maxFiles ? "cursor-not-allowed opacity-50" : ""}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() =>
            images.length < maxFiles &&
            document.getElementById("file-input")?.click()
          }
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm font-medium text-gray-900">
            {t.drag_drop}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {t.supported_formats} {maxSize} {t.mb}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            ({t.max_files} {maxFiles} {t.files})
          </p>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={images.length >= maxFiles}
          />
        </div>

        {/* Image Preview Grid */}
        {images.length > 0 && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {t.images} ({images.length}/{maxFiles})
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {images.map((image) => (
                <div key={image.id} className="group relative">
                  <div className="aspect-square overflow-hidden rounded-lg border">
                    <Image
                      width={300}
                      height={300}
                      src={image.preview}
                      alt={`Uploaded image ${image.name}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>

                  {/* Image Overlay Actions */}
                  <div className="absolute inset-0 top-0 flex items-center justify-center gap-1 bg-black bg-opacity-0 transition-all group-hover:bg-opacity-40">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openImagePreview(image);
                      }}
                      className="scale-0 rounded-full bg-white p-1.5 text-gray-700 transition-all group-hover:scale-100"
                    >
                      <ZoomIn className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
                      }}
                      className="scale-0 rounded-full bg-red-500 p-1.5 text-white transition-all group-hover:scale-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Image Info */}
                  <div className="mt-1">
                    <p
                      className="truncate text-xs text-gray-600"
                      title={image.name}
                    >
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 !mt-0 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative max-h-full max-w-full">
            {/* Image with rotation */}
            <Image
              width={300}
              height={300}
              src={selectedImage.preview}
              alt="Preview"
              className="max-h-[80vh] max-w-full object-contain"
              style={{ transform: `rotate(${rotation}deg)` }}
            />

            {/* Control Buttons */}
            <div className="absolute right-4 top-4 flex gap-2">
              <button
                type="button"
                onClick={rotateImage}
                className="rounded-full bg-white p-2 text-gray-700 hover:bg-gray-100"
                title={t.rotate}
              >
                <RotateCw className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="rounded-full bg-white p-2 text-gray-700 hover:bg-gray-100"
                title={t.close}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 rounded-lg bg-black bg-opacity-50 p-3 text-white">
              <p className="text-sm">{selectedImage.name}</p>
              <p className="text-xs opacity-75">
                {formatFileSize(selectedImage.size)} • {selectedImage.type}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
