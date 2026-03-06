import Link from "next/link";
import { requireProfile } from "@/lib/utils/auth";
import { getRecentPracticeRequests, getUpcomingSessions } from "@/lib/db/queries";
import { Header } from "@/components/nav/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PracticeCard } from "@/components/practice/practice-card";
import { SessionCard } from "@/components/sessions/session-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Plus, CalendarDays, Users } from "lucide-react";

export default async function HomePage() {
  const profile = await requireProfile();
  const [recentRequests, upcomingSessions] = await Promise.all([
    getRecentPracticeRequests(3),
    getUpcomingSessions(profile.id, 3),
  ]);

  return (
    <>
      <Header title="ShuPra" />
      <div className="px-4 py-4 space-y-6">
        <div className="rounded-xl bg-gradient-to-r from-blue-50 to-sky-50 p-4">
          <p className="text-sm text-text-secondary">おかえりなさい</p>
          <p className="text-lg font-bold text-text-primary">
            {profile.display_name}
          </p>
          <Link href="/practice/new">
            <Button size="md" className="mt-3 gap-1.5">
              <Plus className="h-4 w-4" />
              練習募集を作成
            </Button>
          </Link>
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              近日の練習予定
            </h2>
            <Link
              href="/sessions"
              className="text-xs text-primary hover:underline"
            >
              すべて見る
            </Link>
          </div>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  currentUserId={profile.id}
                />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={CalendarDays}
                title="予定されている練習はありません"
                description="練習募集に応募して練習相手を見つけましょう"
              />
            </Card>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              新着の練習募集
            </h2>
            <Link
              href="/practice"
              className="text-xs text-primary hover:underline"
            >
              すべて見る
            </Link>
          </div>
          {recentRequests.length > 0 ? (
            <div className="space-y-3">
              {recentRequests.map((request) => (
                <PracticeCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={Users}
                title="まだ練習募集がありません"
                description="最初の練習募集を作成してみませんか？"
              >
                <Link href="/practice/new">
                  <Button size="sm">練習募集を作成</Button>
                </Link>
              </EmptyState>
            </Card>
          )}
        </section>
      </div>
    </>
  );
}
