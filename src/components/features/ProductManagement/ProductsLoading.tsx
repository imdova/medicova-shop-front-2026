"use client";

export function ProductsLoading() {
  return (
    <div className="flex flex-col gap-0">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
        <div
          key={index}
          className="flex items-center gap-4 border-b border-slate-100 px-4 py-4 last:border-0"
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-200/60" />
            <div className="space-y-2">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200/60" />
              <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="h-4 w-24 animate-pulse rounded bg-slate-200/60" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
          <div className="h-4 w-14 animate-pulse rounded bg-slate-200/60" />
        </div>
      ))}
    </div>
  );
}
