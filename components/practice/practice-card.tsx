"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDateTime } from "@/lib/utils/dates";
import { PRACTICE_TYPE_LABELS, INTERVIEW_STAGES } from "@/lib/types";
import type { PracticeRequest, PracticeType } from "@/lib/types";
import { ChevronRight } from "lucide-react";

interface PracticeCardProps {
  request: PracticeRequest;
}

export function PracticeCard({ request }: PracticeCardProps) {
  const stageLabel = INTERVIEW_STAGES.find((s) => s.value === request.interview_stage)?.label ?? request.interview_stage;
  const displayName = request.profiles?.display_name ?? "匿名";

  return (
    <Link href={`/practice/${request.id}`} className="block">
      <div className="bg-white border border-[#e5e5e5] rounded-lg px-4 py-3.5 active:scale-[0.99] active:bg-[#fafafa] transition-all duration-100">
        <div className="flex items-center gap-1.5 mb-2">
          <Badge variant="primary">
            {PRACTICE_TYPE_LABELS[request.practice_type as PracticeType]}
          </Badge>
          <Badge variant="default">{stageLabel}</Badge>
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-bold text-[#1a1a1a] leading-snug line-clamp-2 flex-1">
            {request.title}
          </h3>
          <ChevronRight className="h-4 w-4 text-[#ccc] mt-0.5 shrink-0" />
        </div>

        <div className="mt-2 flex items-center gap-1 text-[12px] text-[#999]">
          <span className="font-medium text-[#1a1a1a]">{request.target_company}</span>
          {request.target_role && (
            <>
              <span className="text-[#ddd]">|</span>
              <span>{request.target_role}</span>
            </>
          )}
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-[#f0f0f0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar name={displayName} size="sm" />
            <span className="text-[12px] text-[#666]">{displayName}</span>
          </div>
          <div className="text-[11px] text-[#999]">
            {formatDateTime(request.preferred_start_at)} ・ {request.duration_minutes}分
          </div>
        </div>
      </div>
    </Link>
  );
}
