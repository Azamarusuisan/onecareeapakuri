import { cn } from "@/lib/utils/cn";

const COLORS = [
  { bg: "bg-[#ecfdf5]", text: "text-[#059669]" },
  { bg: "bg-[#eff6ff]", text: "text-[#2563eb]" },
  { bg: "bg-[#fef3c7]", text: "text-[#d97706]" },
  { bg: "bg-[#fce7f3]", text: "text-[#db2777]" },
  { bg: "bg-[#ede9fe]", text: "text-[#7c3aed]" },
  { bg: "bg-[#e0f2fe]", text: "text-[#0284c7]" },
  { bg: "bg-[#fee2e2]", text: "text-[#dc2626]" },
  { bg: "bg-[#f0fdf4]", text: "text-[#16a34a]" },
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  const color = getColor(name);
  const initial = name[0] ?? "?";

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold shrink-0",
        color.bg,
        color.text,
        {
          "h-5 w-5 text-[10px]": size === "sm",
          "h-8 w-8 text-[13px]": size === "md",
          "h-12 w-12 text-[18px]": size === "lg",
        },
        className
      )}
    >
      {initial}
    </div>
  );
}
