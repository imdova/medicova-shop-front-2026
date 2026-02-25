import Image from "next/image";
import React from "react";

type AvatarProps = {
  name: string;
  imageUrl?: string;
  className?: string;
  RandomColor?: boolean;
};

const Avatar: React.FC<AvatarProps> = ({
  name,
  imageUrl,
  RandomColor,
  className = "",
}) => {
  const getInitial = () => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const getRandomColor = () => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
    ];
    const hash = name
      ? name.split("").reduce((acc, char) => char.charCodeAt(0) + acc, 0)
      : 0;
    return colors[hash % colors.length];
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white ${imageUrl ? "" : RandomColor ? getRandomColor() : "bg-gray-400"} ${className}`}
    >
      {imageUrl ? (
        <Image
          width={300}
          height={300}
          src={imageUrl}
          alt={name}
          className="h-full w-full rounded-full object-cover"
          onError={(e) => {
            // Fallback to initial if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = "";
            target.alt = name;
            target.className = `flex items-center justify-center rounded-full ${RandomColor ? getRandomColor() : "bg-gray-400"} ${className}`;
            target.textContent = getInitial();
          }}
        />
      ) : (
        <span>{getInitial()}</span>
      )}
    </div>
  );
};

export default Avatar;
