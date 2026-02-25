"use client";

import React from "react";

type ProgressLineProps = {
  progress: number; // 0–100
  height?: string; // Tailwind height class like 'h-2', 'h-4'
  color?: string; // Tailwind color class like 'bg-green-500'
  showLabel?: boolean;
  animate?: boolean;
};

export const ProgressLine: React.FC<ProgressLineProps> = ({
  progress,
  height = "h-2",
  color = "bg-green-500",
  showLabel = false,
  animate = true,
}) => {
  const baseOuter = `w-full bg-gray-200 rounded-full overflow-hidden ${height}`;
  const baseInner = `${color} rounded-full ${height} ${animate ? "transition-all duration-500" : ""}`;

  return (
    <div className="flex items-center gap-3">
      <div className={baseOuter}>
        <div className={baseInner} style={{ width: `${progress}%` }} />
      </div>
      {showLabel && (
        <div className="text-center text-xs font-medium text-gray-700">
          {progress}%
        </div>
      )}
    </div>
  );
};
