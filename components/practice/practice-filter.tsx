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
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
            current === filter.value
              ? "bg-primary text-white"
              : "bg-white border border-border text-text-secondary hover:bg-surface-hover"
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
