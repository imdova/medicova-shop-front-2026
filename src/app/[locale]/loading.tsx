import React from "react";

export default function Loading() {
  return (
    <div className="container mx-auto animate-pulse py-8 lg:max-w-[98%]">
      {/* Hero Section Skeleton */}
      <div className="mb-8 overflow-hidden rounded-xl">
        <div className="h-[150px] w-full bg-gray-200 sm:h-[200px] md:h-[400px]" />
      </div>

      {/* Category Slider Skeleton */}
      <div className="mb-12">
        <div className="flex justify-between gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="h-16 w-16 rounded-full bg-gray-200" />
              <div className="h-3 w-12 bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Promotions Grid Skeleton */}
      <div className="mb-12 hidden grid-cols-3 gap-6 xl:grid">
        <div className="h-[300px] rounded-xl bg-gray-200" />
        <div className="h-[300px] rounded-xl bg-gray-200" />
        <div className="h-[300px] rounded-xl bg-gray-200" />
      </div>

      {/* Recommended Products Skeleton */}
      <div className="mb-12">
        <div className="mb-6 h-8 w-48 bg-gray-200" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[200px] flex-shrink-0 md:w-[240px]">
              <div className="aspect-[4/5] w-full rounded-xl bg-gray-200" />
              <div className="mt-4 h-4 w-3/4 bg-gray-200" />
              <div className="mt-2 h-4 w-1/2 bg-gray-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Explore Brands Skeleton */}
      <div className="mb-12">
        <div className="mb-6 h-8 w-48 bg-gray-200" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 w-[270px] flex-shrink-0 rounded-xl bg-gray-200"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
