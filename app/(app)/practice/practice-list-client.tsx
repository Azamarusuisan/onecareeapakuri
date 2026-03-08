"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PracticeFilter } from "@/components/practice/practice-filter";
import { PracticeFilterDrawer } from "@/components/practice/practice-filter-drawer";
import { PracticeCard } from "@/components/practice/practice-card";
import { Search, SlidersHorizontal } from "lucide-react";
import type { PracticeRequest } from "@/lib/types";

interface PracticeListClientProps {
  initialRequests: PracticeRequest[];
  initialType: string;
  initialStage: string;
  initialSearch: string;
}

export function PracticeListClient({ 
  initialRequests, 
  initialType, 
  initialStage,
  initialSearch 
}: PracticeListClientProps) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [type, setType] = useState(initialType);
  const [stage, setStage] = useState(initialStage);
  const [search, setSearch] = useState(initialSearch);

  function updateFilters(newType?: string, newStage?: string, newSearch?: string) {
    const t = newType ?? type;
    const s = newStage ?? stage;
    const q = newSearch ?? search;
    
    const params = new URLSearchParams();
    if (t && t !== "all") params.set("type", t);
    if (s && s !== "all") params.set("stage", s);
    if (q) params.set("q", q);
    
    router.push(`/practice?${params.toString()}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <form onSubmit={(e) => { e.preventDefault(); updateFilters(undefined, undefined, search); }} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999]" />
          <input
            type="text"
            placeholder="企業名・キーワード（BCG, デロイト…）"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-[#e5e5e5] rounded-lg bg-white py-2.5 pl-9 pr-3 text-sm placeholder:text-[#999] focus:border-[#059669] focus:outline-none"
          />
        </form>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="shrink-0 flex items-center justify-center w-[44px] rounded-lg border border-[#e5e5e5] bg-white text-[#1a1a1a] active:bg-[#f5f5f7] transition-colors relative"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {(type !== "all" || stage !== "all") && (
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#ff3b30]" />
          )}
        </button>
      </div>

      <PracticeFilter current={type} onChange={(v) => { setType(v); updateFilters(v, stage, search); }} />

      <div className="space-y-2">
        {initialRequests.map((request) => (
          <PracticeCard key={request.id} request={request} />
        ))}
      </div>

      <PracticeFilterDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        currentType={type}
        currentStage={stage}
        onApply={(newType, newStage) => {
          setType(newType);
          setStage(newStage);
          updateFilters(newType, newStage, search);
        }}
      />
    </div>
  );
}
