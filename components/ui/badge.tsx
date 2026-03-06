import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-[2px] text-[11px] font-bold rounded",
        {
          "bg-[#f5f5f7] text-[#666]": variant === "default",
          "bg-[#ecfdf5] text-[#059669]": variant === "primary",
          "bg-[#e8f8ef] text-[#00875a]": variant === "success",
          "bg-[#fff8e6] text-[#b25e00]": variant === "warning",
          "bg-[#fff0f0] text-[#d32f2f]": variant === "danger",
        },
        className
      )}
      {...props}
    />
  );
}
