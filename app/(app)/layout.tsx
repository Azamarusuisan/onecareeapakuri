import { BottomNav } from "@/components/nav/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-lg bg-white">
      <main className="pb-16">{children}</main>
      <BottomNav />
    </div>
  );
}
