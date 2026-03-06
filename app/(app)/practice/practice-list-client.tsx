"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PracticeFilter } from "@/components/practice/practice-filter";
import { PracticeCard } from "@/components/practice/practice-card";
import { Search } from "lucide-react";
import type { PracticeRequest } from "@/lib/types";

interface PracticeListClientProps {
  initialRequests: PracticeRequest[];
  initialType: string;
  initialSearch: string;
}

export function PracticeListClient({ initialRequests, initialType, initialSearch }: PracticeListClientProps) {
  const router = useRouter();
  const [type, setType] = useState(initialType);
  const [search, setSearch] = useState(initialSearch);

  function updateFilters(newType?: string, newSearch?: string) {
    const t = newType ?? type;
    const q = newSearch ?? search;
    const params = new URLSearchParams();
    if (t && t !== "all") params.set("type", t);
    if (q) params.set("q", q);
    router.push(`/practice?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      <form onSubmit={(e) => { e.preventDefault(); updateFilters(undefined, search); }} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
        <input
          type="text"
          placeholder="企業名・キーワードで検索（BCG, デロイト…）"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-[#e5e5e5] rounded-lg bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-[#999] focus:border-[#059669] focus:outline-none"
        />
      </form>

      <PracticeFilter current={type} onChange={(v) => { setType(v); updateFilters(v, undefined); }} />

      <div className="space-y-2">
        {initialRequests.map((request) => (
          <PracticeCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}
