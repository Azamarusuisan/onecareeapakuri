"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Video, ChevronRight } from "lucide-react";
import { formatDateTime } from "@/lib/utils/dates";
import { PRACTICE_TYPE_LABELS } from "@/lib/types";
import type { Session, PracticeType } from "@/lib/types";

interface SessionCardProps {
  session: Session;
  currentUserId: string;
}

export function SessionCard({ session, currentUserId }: SessionCardProps) {
  const isHost = session.host_user_id === currentUserId;
  const partner = isHost ? session.guest_profile : session.host_profile;
  const partnerName = partner?.display_name ?? "匿名";
  const practiceType = session.practice_requests?.practice_type as PracticeType | undefined;

  return (
    <Link href={`/sessions/${session.id}`} className="block">
      <div className="bg-white border border-[#e5e5e5] rounded-lg px-4 py-3.5 active:scale-[0.99] active:bg-[#fafafa] transition-all duration-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Badge variant={session.status === "scheduled" ? "success" : "default"}>
              {session.status === "scheduled" ? "予定" : "完了"}
            </Badge>
            {practiceType && (
              <Badge variant="primary">{PRACTICE_TYPE_LABELS[practiceType]}</Badge>
            )}
          </div>
          <ChevronRight className="h-4 w-4 text-[#ccc]" />
        </div>

        <h3 className="text-[14px] font-bold text-[#1a1a1a] leading-snug line-clamp-1">
          {session.practice_requests?.title ?? "練習セッション"}
        </h3>

        <div className="mt-2 text-[12px] text-[#999]">
          {formatDateTime(session.starts_at)}
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-[#f0f0f0] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar name={partnerName} size="sm" />
            <span className="text-[12px] text-[#666]">
              練習相手: {partnerName}
            </span>
          </div>

          {session.status === "scheduled" && session.meet_url && (
            <Button
              size="sm"
              className="h-7 px-2.5 text-[11px] gap-1"
              onClick={(e) => {
                e.preventDefault();
                window.open(session.meet_url!, "_blank");
              }}
            >
              <Video className="h-3 w-3" />
              参加
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}
