import { requireProfile } from "@/lib/utils/auth";
import { getUserSessions } from "@/lib/db/queries";
import { Header } from "@/components/nav/header";
import { SessionCard } from "@/components/sessions/session-card";
import { EmptyState } from "@/components/ui/empty-state";
import { CalendarDays } from "lucide-react";
import { isUpcoming } from "@/lib/utils/dates";

export default async function SessionsPage() {
  const profile = await requireProfile();
  const sessions = await getUserSessions(profile.id);

  const upcoming = sessions.filter(
    (s) => s.status === "scheduled" && isUpcoming(s.starts_at)
  );
  const past = sessions.filter(
    (s) => s.status === "completed" || !isUpcoming(s.starts_at)
  );

  return (
    <>
      <Header title="セッション" />
      <div className="px-4 py-4 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            今後の予定
          </h2>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  currentUserId={profile.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="予定されているセッションはありません"
              description="練習募集に応募してマッチングしましょう"
            />
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            過去のセッション
          </h2>
          {past.length > 0 ? (
            <div className="space-y-3">
              {past.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  currentUserId={profile.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="まだセッション履歴がありません"
            />
          )}
        </section>
      </div>
    </>
  );
}
