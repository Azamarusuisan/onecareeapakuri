"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { CheckCircle, Send, Calendar } from "lucide-react";
import { formatDateTime } from "@/lib/utils/dates";
import type { PracticeRequestSlot } from "@/lib/types";

interface ApplicationFormProps {
  requestId: string;
  hasApplied: boolean;
  slots: PracticeRequestSlot[];
}

export function ApplicationForm({ requestId, hasApplied, slots }: ApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(hasApplied);

  function toggleSlot(slotId: string) {
    setSelectedSlotIds((prev) =>
      prev.includes(slotId) ? prev.filter((id) => id !== slotId) : [...prev, slotId]
    );
  }

  if (applied) {
    return (
      <div className="flex items-center gap-2.5 bg-[#ecfdf5] rounded-lg p-4 animate-pop">
        <CheckCircle className="h-5 w-5 text-[#059669] shrink-0" />
        <div>
          <p className="text-[13px] font-bold text-[#059669]">応募済みです</p>
          <p className="text-[11px] text-[#666] mt-0.5">募集者の承認をお待ちください</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedSlotIds.length === 0) {
      toast("参加可能な日時を1つ以上選択してください", "error");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/practice-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          message: message || null,
          selected_slot_ids: selectedSlotIds,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "応募に失敗しました");
      }

      setApplied(true);
      toast("応募が完了しました！");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "エラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {slots.length > 0 && (
        <div className="space-y-1.5">
          <label className="block text-[13px] font-bold text-[#1a1a1a]">
            参加可能な日時を選択
          </label>
          <p className="text-[11px] text-[#999]">いける枠をすべてチェックしてください</p>
          <div className="space-y-1.5 mt-2">
            {slots.map((slot) => {
              const isSelected = selectedSlotIds.includes(slot.id);
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => toggleSlot(slot.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                    isSelected
                      ? "border-[#059669] bg-[#ecfdf5]"
                      : "border-[#e5e5e5] bg-white active:bg-[#fafafa]"
                  }`}
                >
                  <div className={`h-4.5 w-4.5 rounded border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? "border-[#059669] bg-[#059669]" : "border-[#ccc]"
                  }`}>
                    {isSelected && (
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <Calendar className="h-3.5 w-3.5 text-[#999] shrink-0" />
                  <div className="text-[13px]">
                    <span className={isSelected ? "font-bold text-[#059669]" : "text-[#1a1a1a]"}>
                      {formatDateTime(slot.start_at)}
                    </span>
                    <span className="text-[#999]"> 〜 </span>
                    <span className={isSelected ? "font-bold text-[#059669]" : "text-[#1a1a1a]"}>
                      {formatDateTime(slot.end_at)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Textarea
        label="一言メッセージ（任意）"
        placeholder="自己紹介や意気込みを添えると承認されやすくなります"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
      />
      <Button type="submit" disabled={loading} className="w-full gap-2">
        <Send className="h-4 w-4" />
        {loading ? "送信中..." : "この練習に応募する"}
      </Button>
    </form>
  );
}
