import { cn } from "@/lib/utils/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-bold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]",
          {
            "bg-[#059669] text-white rounded-xl shadow-sm hover:bg-[#047857] hover:shadow-md": variant === "primary",
            "bg-[#f5f5f7] text-[#1a1a1a] rounded-xl hover:bg-[#e5e5e5]": variant === "secondary",
            "border-2 border-[#e5e5e5] bg-white text-[#1a1a1a] rounded-xl hover:border-[#ccc] hover:bg-[#fafafa]": variant === "outline",
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
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && children}
      </button>
    );
  }
);
Button.displayName = "Button";
