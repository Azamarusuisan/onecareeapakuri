import Link from "next/link";
import { requireProfile } from "@/lib/utils/auth";
import { getRecentPracticeRequests, getUpcomingSessions } from "@/lib/db/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PracticeCard } from "@/components/practice/practice-card";
import { SessionCard } from "@/components/sessions/session-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarDays, Users, ChevronRight, ArrowRight } from "lucide-react";

export default async function HomePage() {
  const profile = await requireProfile();
  const [recentRequests, upcomingSessions] = await Promise.all([
    getRecentPracticeRequests(5),
    getUpcomingSessions(profile.id, 5),
  ]);

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-[#e5e5e5] px-4 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#999] font-medium">おかえりなさい</p>
            <p className="text-[17px] font-bold text-[#1a1a1a]">{profile.display_name}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#059669] bg-[#ecfdf5] rounded px-2 py-1">{profile.graduation_year}卒</span>
          </div>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="px-4 pt-3">
        <Link href="/practice/new" className="block">
          <div className="border border-[#059669] bg-[#ecfdf5] rounded-lg px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-bold text-[#059669]">練習募集を作成する</p>
              <p className="text-[11px] text-[#666] mt-0.5">面接の練習相手をマッチング</p>
            </div>
            <ArrowRight className="h-4 w-4 text-[#059669]" />
          </div>
        </Link>
      </div>

      <div className="px-4 pt-4 pb-4 space-y-5">
        {/* Upcoming */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[13px] font-bold text-[#1a1a1a]">予定の練習セッション</h2>
            <Link href="/sessions" className="flex items-center text-[12px] text-[#059669] font-bold">
              一覧<ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-2">
              {upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} currentUserId={profile.id} />
              ))}
            </div>
          ) : (
            <div className="border border-[#e5e5e5] rounded-lg py-8">
              <EmptyState icon={CalendarDays} title="予定はまだありません" description="募集に応募してマッチングしましょう" />
            </div>
          )}
        </section>

        {/* Recent */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[13px] font-bold text-[#1a1a1a]">新着の練習募集</h2>
            <Link href="/practice" className="flex items-center text-[12px] text-[#059669] font-bold">
              一覧<ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentRequests.length > 0 ? (
            <div className="space-y-2">
              {recentRequests.map((request) => (
                <PracticeCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="border border-[#e5e5e5] rounded-lg py-8">
              <EmptyState icon={Users} title="募集はまだありません" description="最初の募集を作成してみましょう">
                <Link href="/practice/new"><Button size="sm">募集を作成</Button></Link>
              </EmptyState>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
