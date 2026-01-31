"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ImageIcon } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";

type AttributeImageUploadProps = {
  value: string | File | null;
  onChange: (file: File | null) => void;
  attributeId: string;
};

const AttributeImageUpload = ({
  value,
  onChange,
  attributeId,
}: AttributeImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // ✅ Track client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (typeof value === "string") {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value, mounted]);

  const handleFileChange = (file: File | null) => {
    onChange(file);
  };

  const inputId = `attribute-image-${attributeId}`;

  if (!mounted) {
    // ✅ Prevent SSR/CSR mismatch
    return <div className="h-8 w-8 rounded-md border bg-gray-100" />;
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative">
          <Image
            width={80}
            height={80}
            src={preview}
            alt="Attribute preview"
            className="h-8 w-8 rounded-md border object-cover"
            unoptimized
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-5 w-5 rounded-full"
            onClick={() => handleFileChange(null)}
          >
            <X size={12} />
          </Button>
        </div>
      ) : (
        <label htmlFor={inputId} className="cursor-pointer">
          <div className="flex w-8 flex-col items-center justify-center rounded-md transition-colors">
            <ImageIcon className="h-6 w-6 text-gray-400" />
          </div>
          <Input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              handleFileChange(file);
            }}
          />
        </label>
      )}
    </div>
  );
};

export default AttributeImageUpload;
