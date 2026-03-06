export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireProfile } from "@/lib/utils/auth";
import { getPracticeRequests } from "@/lib/db/queries";
import { Header } from "@/components/nav/header";
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
      <Header title="練習相手を見つける" />
      <div className="px-4 py-3">
        <PracticeListClient
          initialRequests={requests}
          initialType={params.type ?? "all"}
          initialSearch={params.q ?? ""}
        />
        {requests.length === 0 && (
          <div className="mt-4">
            <EmptyState icon={Users} title="該当する募集がまだありません" description="条件を変えるか、あなたが最初の募集を作成しましょう">
              <Link href="/practice/new"><Button size="sm">練習募集を作成する</Button></Link>
            </EmptyState>
          </div>
        )}
      </div>
      <Link
        href="/practice/new"
        className="fixed bottom-[68px] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#059669] text-white shadow-lg active:opacity-80 transition-opacity"
      >
        <Plus className="h-5 w-5" />
      </Link>
    </>
  );
}
