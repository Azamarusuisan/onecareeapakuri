"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { formatRelative, formatDateTime } from "@/lib/utils/dates";
import { useRouter } from "next/navigation";
import type { PracticeApplication, PracticeRequestSlot } from "@/lib/types";
import { UserCheck, Calendar } from "lucide-react";

interface ApplicationListProps {
  applications: PracticeApplication[];
  requestStatus: string;
  slots: PracticeRequestSlot[];
}

export function ApplicationList({ applications, requestStatus, slots }: ApplicationListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [acceptingAppId, setAcceptingAppId] = useState<string | null>(null);

  async function handleAccept(applicationId: string) {
    if (!selectedSlotId) {
      toast("日時を選択してください", "error");
      return;
    }
    setLoadingId(applicationId);
    try {
      const res = await fetch(`/api/practice-applications/${applicationId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot_id: selectedSlotId }),
      });
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

  function getSlotById(id: string) {
    return slots.find((s) => s.id === id);
  }

  return (
    <div className="space-y-2">
      {applications.map((app) => {
        const name = app.profiles?.display_name ?? "匿名";
        const isAccepting = acceptingAppId === app.id;
        // Find mutually available slots
        const availableSlots = slots.filter((s) => app.selected_slot_ids.includes(s.id));

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
                  {availableSlots.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {availableSlots.map((slot) => (
                        <span key={slot.id} className="inline-flex items-center gap-1 text-[10px] text-[#059669] bg-[#ecfdf5] rounded px-1.5 py-[1px]">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDateTime(slot.start_at)}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-[11px] text-[#999]">{formatRelative(app.created_at)}</p>
                </div>
              </div>

              {requestStatus === "open" && app.status === "pending" && !isAccepting && (
                <Button size="sm" onClick={() => setAcceptingAppId(app.id)} className="gap-1 shrink-0">
                  <UserCheck className="h-3.5 w-3.5" />
                  承認
                </Button>
              )}
            </div>

            {/* Slot picker when accepting */}
            {isAccepting && requestStatus === "open" && app.status === "pending" && (
              <div className="mt-3 pt-3 border-t border-[#f0f0f0] animate-pop">
                <p className="text-[12px] font-bold text-[#1a1a1a] mb-2">日時を選択して承認</p>
                <div className="space-y-1.5">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-[12px] transition-colors ${
                        selectedSlotId === slot.id
                          ? "border-[#059669] bg-[#ecfdf5] font-bold text-[#059669]"
                          : "border-[#e5e5e5] text-[#1a1a1a] active:bg-[#fafafa]"
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {formatDateTime(slot.start_at)} 〜 {formatDateTime(slot.end_at)}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(app.id)}
                    disabled={!selectedSlotId || loadingId === app.id}
                    className="gap-1"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    {loadingId === app.id ? "..." : "この日時で承認"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setAcceptingAppId(null); setSelectedSlotId(null); }}>
                    キャンセル
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
