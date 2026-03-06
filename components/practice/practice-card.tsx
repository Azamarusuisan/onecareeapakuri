import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Building2, User } from "lucide-react";
import { formatDateTime } from "@/lib/utils/dates";
import { PRACTICE_TYPE_LABELS } from "@/lib/types";
import type { PracticeRequest, PracticeType } from "@/lib/types";

interface PracticeCardProps {
  request: PracticeRequest;
}

export function PracticeCard({ request }: PracticeCardProps) {
  return (
    <Link href={`/practice/${request.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-text-primary line-clamp-2 flex-1">
            {request.title}
          </h3>
          <Badge variant="primary">
            {PRACTICE_TYPE_LABELS[request.practice_type as PracticeType]}
          </Badge>
        </div>

        <div className="space-y-1.5 text-xs text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{request.target_company}</span>
            {request.target_role && (
              <span className="text-text-muted">/ {request.target_role}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{formatDateTime(request.preferred_start_at)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{request.duration_minutes}分</span>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 shrink-0" />
            <span>{request.profiles?.display_name ?? "匿名"}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
