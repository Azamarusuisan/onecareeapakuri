"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDateTime } from "@/lib/utils/dates";
import { PRACTICE_TYPE_LABELS, INTERVIEW_STAGES } from "@/lib/types";
import type { PracticeRequest, PracticeType } from "@/lib/types";
import { ChevronRight, Clock, Calendar } from "lucide-react";

interface PracticeCardProps {
  request: PracticeRequest;
}

export function PracticeCard({ request }: PracticeCardProps) {
  const stageLabel = INTERVIEW_STAGES.find((s) => s.value === request.interview_stage)?.label ?? request.interview_stage;
  const displayName = request.profiles?.display_name ?? "匿名";
  const slots = request.practice_request_slots ?? [];
  const firstSlot = slots[0];

  return (
    <Link href={`/practice/${request.id}`} className="block group">
      <div className="bg-white border border-[#e5e5e5] rounded-2xl px-4 py-3.5 transition-all duration-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-[#d1d5db] active:scale-[0.98]">
        <div className="flex items-center gap-1.5 mb-2">
          <Badge variant="primary">
            {PRACTICE_TYPE_LABELS[request.practice_type as PracticeType]}
          </Badge>
          <Badge variant="default">{stageLabel}</Badge>
          {slots.length > 1 && (
            <Badge variant="warning">{slots.length}枠</Badge>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] font-bold text-[#1a1a1a] leading-snug line-clamp-2 flex-1 group-hover:text-[#059669] transition-colors">
            {request.title}
          </h3>
          <ChevronRight className="h-4 w-4 text-[#ccc] mt-0.5 shrink-0 group-hover:text-[#059669] group-hover:translate-x-1 transition-all" />
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

        {firstSlot && (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#999]">
            <Calendar className="h-3 w-3" />
            <span>{formatDateTime(firstSlot.start_at)}</span>
            {slots.length > 1 && <span className="text-[#059669] font-bold">ほか{slots.length - 1}枠</span>}
            <span className="text-[#ddd]">|</span>
            <Clock className="h-3 w-3" />
            <span>{request.duration_minutes}分</span>
          </div>
        )}

        <div className="mt-2.5 pt-2.5 border-t border-[#f0f0f0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar name={displayName} size="sm" />
            <span className="text-[12px] text-[#666]">{displayName}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
