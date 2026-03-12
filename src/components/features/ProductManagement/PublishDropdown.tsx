"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shared/dropdown-menu";

interface PublishDropdownProps {
  value: "Published" | "Draft";
  onChange: (value: "Published" | "Draft") => void;
  align?: "start" | "center" | "end";
}

export function PublishDropdown({
  value,
  onChange,
  align = "start",
}: PublishDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          {value}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className="w-36 rounded-xl border-slate-200/80 shadow-lg"
      >
        <DropdownMenuItem className="rounded-lg" onClick={() => onChange("Published")}>
          Published
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-lg" onClick={() => onChange("Draft")}>
          Draft
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
