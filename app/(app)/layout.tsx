export const dynamic = "force-dynamic";

import { BottomNav } from "@/components/nav/bottom-nav";
import { ToastProvider } from "@/components/ui/toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="mx-auto max-w-lg min-h-dvh flex flex-col bg-white">
        <main className="flex-1 pb-[calc(52px+env(safe-area-inset-bottom)+16px)]">
          {children}
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
