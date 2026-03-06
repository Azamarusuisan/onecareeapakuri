import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <Icon className="h-8 w-8 text-[#ccc] mb-2" />
      <p className="text-[13px] font-bold text-[#1a1a1a]">{title}</p>
      {description && <p className="text-[12px] text-[#999] mt-0.5">{description}</p>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
