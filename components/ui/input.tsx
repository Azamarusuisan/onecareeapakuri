import { cn } from "@/lib/utils/cn";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-[13px] font-bold text-[#1a1a1a]">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "block w-full border border-[#e5e5e5] rounded-lg bg-white px-3 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#999] focus:border-[#059669] focus:outline-none",
            error && "border-[#ff3b30]",
            className
          )}
          {...props}
        />
        {error && <p className="text-[12px] text-[#ff3b30]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
