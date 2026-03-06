"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { PracticeFilter } from "@/components/practice/practice-filter";
import { PracticeCard } from "@/components/practice/practice-card";
import { Search } from "lucide-react";
import type { PracticeRequest } from "@/lib/types";

interface PracticeListClientProps {
  initialRequests: PracticeRequest[];
  initialType: string;
  initialSearch: string;
}

export function PracticeListClient({
  initialRequests,
  initialType,
  initialSearch,
}: PracticeListClientProps) {
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

  function handleTypeChange(value: string) {
    setType(value);
    updateFilters(value, undefined);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateFilters(undefined, search);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="企業名・キーワードで検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </form>

      <PracticeFilter current={type} onChange={handleTypeChange} />

      <div className="space-y-3">
        {initialRequests.map((request) => (
          <PracticeCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
}
