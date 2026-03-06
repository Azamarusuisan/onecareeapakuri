"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils/dates";
import { useRouter } from "next/navigation";
import type { PracticeApplication } from "@/lib/types";

interface ApplicationListProps {
  applications: PracticeApplication[];
  requestStatus: string;
}

export function ApplicationList({
  applications,
  requestStatus,
}: ApplicationListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAccept(applicationId: string) {
    setLoadingId(applicationId);
    setError("");

    try {
      const res = await fetch(
        `/api/practice-applications/${applicationId}/accept`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "承認に失敗しました");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoadingId(null);
    }
  }

  if (applications.length === 0) {
    return (
      <p className="text-sm text-text-secondary text-center py-4">
        まだ応募がありません
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-red-600">{error}</p>}
      {applications.map((app) => (
        <Card key={app.id} className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-text-primary truncate">
                  {app.profiles?.display_name ?? "匿名"}
                </p>
                <Badge
                  variant={
                    app.status === "accepted"
                      ? "success"
                      : app.status === "rejected"
                        ? "danger"
                        : "default"
                  }
                >
                  {app.status === "pending"
                    ? "審査中"
                    : app.status === "accepted"
                      ? "承認済"
                      : "不採用"}
                </Badge>
              </div>
              {app.message && (
                <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                  {app.message}
                </p>
              )}
              <p className="mt-1 text-xs text-text-muted">
                {formatRelative(app.created_at)}
              </p>
            </div>

            {requestStatus === "open" && app.status === "pending" && (
              <Button
                size="sm"
                onClick={() => handleAccept(app.id)}
                disabled={loadingId === app.id}
              >
                {loadingId === app.id ? "処理中..." : "承認"}
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
