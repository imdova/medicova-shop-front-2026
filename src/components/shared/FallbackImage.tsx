"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import LogoIcon from "@/assets/icons/logo";

interface FallbackImageProps extends ImageProps {
  fallbackClassName?: string;
  iconClassName?: string;
}

export default function FallbackImage({
  fallbackClassName,
  iconClassName,
  ...props
}: FallbackImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !props.src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-gray-50/50 ${fallbackClassName || props.className || ""}`}
      >
        <LogoIcon
          className={`text-gray-300 ${iconClassName || "h-1/2 w-1/2"}`}
          aria-hidden="true"
        />
      </div>
    );
  }

  return <Image {...props} onError={() => setHasError(true)} />;
}
