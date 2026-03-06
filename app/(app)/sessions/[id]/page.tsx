import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/utils/auth";
import { getSessionById, getSessionReviews, getSessionMessages } from "@/lib/db/queries";
import { Header } from "@/components/nav/header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { ReviewForm } from "@/components/sessions/review-form";
import { SessionChat } from "@/components/sessions/session-chat";
import { ReportButton } from "@/components/forms/report-button";
import { SessionCompleteButton } from "./session-complete-button";
import { formatDateTime } from "@/lib/utils/dates";
import {
  PRACTICE_TYPE_LABELS,
  type PracticeType,
} from "@/lib/types";
import { Video, Calendar, Building2, User, Clock, AlertTriangle, MessageCircle } from "lucide-react";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();

  let session;
  try {
    session = await getSessionById(id);
  } catch {
    notFound();
  }

  if (
    session.host_user_id !== profile.id &&
    session.guest_user_id !== profile.id
  ) {
    notFound();
  }

  const [reviews, messages] = await Promise.all([
    getSessionReviews(id),
    getSessionMessages(id),
  ]);

  const isHost = session.host_user_id === profile.id;
  const partner = isHost ? session.guest_profile : session.host_profile;
  const partnerId = isHost ? session.guest_user_id : session.host_user_id;
  const hasReviewed = reviews.some((r) => r.reviewer_id === profile.id);
  const practiceType = session.practice_requests?.practice_type as PracticeType | undefined;

  return (
    <>
      <Header title="セッション詳細" showBack />
      <div className="px-4 py-4 space-y-4">
        <Card>
          <div className="flex items-start justify-between gap-2 mb-3">
            <h2 className="text-base font-bold text-text-primary">
              {session.practice_requests?.title ?? "練習セッション"}
            </h2>
            <Badge
              variant={session.status === "scheduled" ? "primary" : "success"}
            >
              {session.status === "scheduled" ? "予定" : "完了"}
            </Badge>
          </div>

          <div className="space-y-2 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-text-muted" />
              <span>{formatDateTime(session.starts_at)} ・ {session.duration_minutes}分</span>
            </div>

            {session.practice_requests?.target_company && (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0 text-text-muted" />
                <span>{session.practice_requests.target_company}</span>
              </div>
            )}

            {practiceType && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-text-muted" />
                <span>{PRACTICE_TYPE_LABELS[practiceType]}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Meet link - ready */}
        {session.status === "scheduled" && session.meeting_status === "ready" && session.meet_url && (
          <a href={session.meet_url} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="w-full gap-2">
              <Video className="h-5 w-5" />
              Google Meetに参加する
            </Button>
          </a>
        )}

        {/* Meet link - failed */}
        {session.status === "scheduled" && session.meeting_status === "failed" && (
          <Card className="bg-[#fff8e6] border-[#f5d580]">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-[#b25e00] mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] font-bold text-[#b25e00]">Meetリンクの生成に失敗しました</p>
                <p className="text-[12px] text-[#666] mt-0.5">チャットで練習相手と通話方法を相談してください。</p>
              </div>
            </div>
          </Card>
        )}

        {/* Meet link - pending */}
        {session.status === "scheduled" && session.meeting_status === "pending" && (
          <Card className="bg-[#f5f5f7]">
            <p className="text-[13px] text-[#666] text-center">Meetリンクを準備中です...</p>
          </Card>
        )}

        {/* Partner info */}
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            練習相手
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-primary font-bold text-sm">
              {(partner?.display_name ?? "匿")[0]}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {partner?.display_name ?? "匿名"}
              </p>
              {partner?.graduation_year && (
                <p className="text-xs text-text-secondary">
                  {partner.graduation_year}卒
                </p>
              )}
            </div>
          </div>
          {partner?.bio && (
            <p className="mt-2 text-xs text-text-secondary">{partner.bio}</p>
          )}
          <div className="mt-2">
            <ReportButton targetType="user" targetId={partnerId} />
          </div>
        </Card>

        {/* Chat */}
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-4 w-4 text-[#059669]" />
            <h3 className="text-sm font-semibold text-text-primary">チャット</h3>
          </div>
          <SessionChat
            sessionId={id}
            currentUserId={profile.id}
            initialMessages={messages}
          />
        </Card>

        {session.status === "scheduled" && (
          <SessionCompleteButton sessionId={id} />
        )}

        {session.status === "completed" && (
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              レビュー
            </h3>

            {session.completed_at && (
              <p className="text-[11px] text-[#999] mb-3">
                {formatDateTime(session.completed_at)} に完了
              </p>
            )}

            {reviews.length > 0 && (
              <div className="space-y-3 mb-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-lg bg-surface p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating value={review.rating} readonly size="sm" />
                      <span className="text-xs text-text-muted">
                        {review.profiles?.display_name ?? "匿名"}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-xs text-text-secondary">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {!hasReviewed && (
              <ReviewForm sessionId={id} revieweeId={partnerId} />
            )}
            {hasReviewed && (
              <p className="text-sm text-text-secondary text-center">
                レビュー済みです
              </p>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
