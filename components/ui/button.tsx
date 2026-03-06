import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center font-bold transition-opacity disabled:opacity-40 disabled:pointer-events-none active:opacity-80",
          {
            "bg-[#059669] text-white rounded-lg": variant === "primary",
            "bg-[#f5f5f7] text-[#1a1a1a] rounded-lg": variant === "secondary",
            "border border-[#e5e5e5] bg-white text-[#1a1a1a] rounded-lg": variant === "outline",
            "text-[#666] bg-transparent": variant === "ghost",
            "bg-[#ff3b30] text-white rounded-lg": variant === "danger",
          },
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-5 text-[15px]": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
