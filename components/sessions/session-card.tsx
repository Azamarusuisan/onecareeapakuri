import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Video, User } from "lucide-react";
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
  const practiceType = session.practice_requests?.practice_type as PracticeType | undefined;

  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-text-primary line-clamp-1 flex-1">
            {session.practice_requests?.title ?? "練習セッション"}
          </h3>
          <Badge
            variant={session.status === "scheduled" ? "primary" : "success"}
          >
            {session.status === "scheduled" ? "予定" : "完了"}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDateTime(session.starts_at)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>相手: {partner?.display_name ?? "匿名"}</span>
          </div>

          {practiceType && (
            <Badge variant="default" className="mt-1">
              {PRACTICE_TYPE_LABELS[practiceType]}
            </Badge>
          )}
        </div>

        {session.status === "scheduled" && session.meet_url && (
          <div className="mt-3">
            <Button
              size="sm"
              className="w-full gap-1.5"
              onClick={(e) => {
                e.preventDefault();
                window.open(session.meet_url!, "_blank");
              }}
            >
              <Video className="h-3.5 w-3.5" />
              Meetに参加
            </Button>
          </div>
        )}
      </Card>
    </Link>
  );
}
