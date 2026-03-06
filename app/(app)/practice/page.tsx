import Link from "next/link";
import { requireProfile } from "@/lib/utils/auth";
import { getPracticeRequests } from "@/lib/db/queries";
import { Header } from "@/components/nav/header";
import { PracticeCard } from "@/components/practice/practice-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { PracticeListClient } from "./practice-list-client";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  await requireProfile();
  const params = await searchParams;
  const requests = await getPracticeRequests({
    practice_type: params.type,
    search: params.q,
  });

  return (
    <>
      <Header title="練習募集" />
      <div className="px-4 py-4">
        <PracticeListClient
          initialRequests={requests}
          initialType={params.type ?? "all"}
          initialSearch={params.q ?? ""}
        />

        {requests.length === 0 && (
          <EmptyState
            icon={Users}
            title="該当する募集がありません"
            description="条件を変えて探すか、新しく募集を作成してみましょう"
          >
            <Link href="/practice/new">
              <Button size="sm">練習募集を作成</Button>
            </Link>
          </EmptyState>
        )}
      </div>

      <Link
        href="/practice/new"
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </>
  );
}
