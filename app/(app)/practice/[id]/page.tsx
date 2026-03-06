import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/utils/auth";
import {
  getPracticeRequestById,
  getApplicationsForRequest,
} from "@/lib/db/queries";
import { Header } from "@/components/nav/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplicationForm } from "@/components/practice/application-form";
import { ApplicationList } from "@/components/practice/application-list";
import { ReportButton } from "@/components/forms/report-button";
import { formatDateTime } from "@/lib/utils/dates";
import {
  PRACTICE_TYPE_LABELS,
  INTERVIEW_STAGES,
  type PracticeType,
} from "@/lib/types";
import {
  Building2,
  Calendar,
  Clock,
  User,
  Briefcase,
  FileText,
} from "lucide-react";

export default async function PracticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();

  let request;
  try {
    request = await getPracticeRequestById(id);
  } catch {
    notFound();
  }

  const isOwner = request.user_id === profile.id;
  let applications: Awaited<ReturnType<typeof getApplicationsForRequest>> = [];
  let hasApplied = false;

  if (isOwner) {
    applications = await getApplicationsForRequest(id);
  } else {
    try {
      const allApps = await getApplicationsForRequest(id);
      hasApplied = allApps.some((app) => app.applicant_id === profile.id);
    } catch {
      hasApplied = false;
    }
  }

  const stageLabel =
    INTERVIEW_STAGES.find((s) => s.value === request.interview_stage)?.label ??
    request.interview_stage;

  const slots = request.practice_request_slots ?? [];

  return (
    <>
      <Header title="募集詳細" showBack />
      <div className="px-4 py-4 space-y-4">
        <Card>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 className="text-base font-bold text-text-primary">
              {request.title}
            </h2>
            <Badge variant="primary">
              {PRACTICE_TYPE_LABELS[request.practice_type as PracticeType]}
            </Badge>
          </div>

          <div className="space-y-2 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-text-muted" />
              <span>{request.target_company}</span>
            </div>

            {request.target_role && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 shrink-0 text-text-muted" />
                <span>{request.target_role}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 shrink-0 text-text-muted" />
              <span>{stageLabel}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-text-muted" />
              <span>{request.duration_minutes}分</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 shrink-0 text-text-muted" />
              <span>{request.profiles?.display_name ?? "匿名"}</span>
            </div>
          </div>

          {request.description && (
            <div className="mt-4 rounded-lg bg-surface p-3">
              <p className="text-sm text-text-secondary whitespace-pre-wrap">
                {request.description}
              </p>
            </div>
          )}
        </Card>

        {/* Available slots */}
        {slots.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-2">
              候補日時
            </h3>
            <p className="text-[11px] text-[#999] mb-3">この時間帯で練習可能です</p>
            <div className="space-y-1.5">
              {slots.map((slot, i) => (
                <div key={slot.id} className="flex items-center gap-2 text-[13px] text-[#1a1a1a] bg-[#f7f7f8] rounded-lg px-3 py-2">
                  <Calendar className="h-3.5 w-3.5 text-[#059669] shrink-0" />
                  <span className="font-medium">{formatDateTime(slot.start_at)}</span>
                  <span className="text-[#999]">〜</span>
                  <span className="font-medium">{formatDateTime(slot.end_at)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {request.status === "matched" && (
          <Card className="bg-emerald-50 border-emerald-200">
            <p className="text-sm font-medium text-emerald-700 text-center">
              マッチング済み
            </p>
          </Card>
        )}

        {isOwner && request.status === "open" && (
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              応募者一覧
            </h3>
            <ApplicationList
              applications={applications}
              requestStatus={request.status}
              slots={slots}
            />
          </Card>
        )}

        {!isOwner && request.status === "open" && (
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              この練習に応募する
            </h3>
            <ApplicationForm requestId={id} hasApplied={hasApplied} slots={slots} />
          </Card>
        )}

        <div className="pt-2">
          <ReportButton targetType="practice_request" targetId={id} />
        </div>
      </div>
    </>
  );
}
