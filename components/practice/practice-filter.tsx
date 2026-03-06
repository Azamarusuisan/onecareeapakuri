"use client";

import { cn } from "@/lib/utils/cn";

const filters = [
  { value: "all", label: "すべて" },
  { value: "general", label: "一般面接" },
  { value: "case", label: "ケース" },
  { value: "motivation", label: "志望動機" },
  { value: "behavioral", label: "行動面接" },
  { value: "final_round", label: "最終面接" },
];

interface PracticeFilterProps {
  current: string;
  onChange: (value: string) => void;
}

export function PracticeFilter({ current, onChange }: PracticeFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            "shrink-0 px-3 py-1.5 text-[12px] font-bold rounded-full border transition-colors",
            current === filter.value
              ? "bg-[#059669] text-white border-[#059669]"
              : "bg-white text-[#666] border-[#e5e5e5] active:bg-[#f5f5f7]"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
