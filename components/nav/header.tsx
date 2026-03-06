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
    <header className="sticky top-0 z-40 bg-white border-b border-[#e5e5e5]">
      <div className="mx-auto flex h-11 max-w-lg items-center px-4">
        {showBack && (
          <button
            onClick={() => router.back()}
            className="mr-2 -ml-1 p-1"
          >
            <ArrowLeft className="h-5 w-5 text-[#1a1a1a]" />
          </button>
        )}
        <h1 className="text-[15px] font-bold text-[#1a1a1a]">
          {title}
        </h1>
      </div>
    </header>
  );
}
