"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { formatRelative } from "@/lib/utils/dates";
import { useRouter } from "next/navigation";
import type { PracticeApplication } from "@/lib/types";
import { UserCheck } from "lucide-react";

interface ApplicationListProps {
  applications: PracticeApplication[];
  requestStatus: string;
}

export function ApplicationList({ applications, requestStatus }: ApplicationListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleAccept(applicationId: string) {
    setLoadingId(applicationId);
    try {
      const res = await fetch(`/api/practice-applications/${applicationId}/accept`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "承認に失敗しました");
      }
      toast("承認しました！セッションが作成されました");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "エラーが発生しました", "error");
    } finally {
      setLoadingId(null);
    }
  }

  if (applications.length === 0) {
    return (
      <p className="text-[13px] text-[#999] text-center py-6">まだ応募がありません</p>
    );
  }

  return (
    <div className="space-y-2">
      {applications.map((app) => {
        const name = app.profiles?.display_name ?? "匿名";
        return (
          <div key={app.id} className="border border-[#e5e5e5] rounded-lg p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <Avatar name={name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-[#1a1a1a] truncate">{name}</p>
                    <Badge
                      variant={app.status === "accepted" ? "success" : app.status === "rejected" ? "danger" : "default"}
                    >
                      {app.status === "pending" ? "審査中" : app.status === "accepted" ? "承認済" : "不採用"}
                    </Badge>
                  </div>
                  {app.message && (
                    <p className="mt-1 text-[12px] text-[#666] line-clamp-2">{app.message}</p>
                  )}
                  <p className="mt-1 text-[11px] text-[#999]">{formatRelative(app.created_at)}</p>
                </div>
              </div>

              {requestStatus === "open" && app.status === "pending" && (
                <Button size="sm" onClick={() => handleAccept(app.id)} disabled={loadingId === app.id} className="gap-1 shrink-0">
                  <UserCheck className="h-3.5 w-3.5" />
                  {loadingId === app.id ? "..." : "承認"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
