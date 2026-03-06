"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export function Header({ title, showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white">
      <div className="mx-auto flex h-12 max-w-lg items-center px-4">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="mr-2 -ml-1 rounded-full p-1 text-text-secondary hover:bg-surface-hover"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-base font-semibold text-text-primary truncate">
          {title}
        </h1>
      </div>
    </header>
  );
}
