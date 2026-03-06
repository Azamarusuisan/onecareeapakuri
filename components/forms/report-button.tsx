"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

interface ReportButtonProps {
  targetType: "user" | "practice_request" | "review";
  targetId: string;
}

export function ReportButton({ targetType, targetId }: ReportButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) { toast("通報理由を入力してください", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_type: targetType, target_id: targetId, reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "通報に失敗しました");
      }
      setDone(true);
      toast("通報を受け付けました");
    } catch (err) {
      toast(err instanceof Error ? err.message : "エラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  }

  if (done) return <p className="text-[11px] text-[#999] py-2">通報を受け付けました。ご協力ありがとうございます。</p>;

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 text-[11px] text-[#999] active:text-[#ff3b30] transition-colors">
        <Flag className="h-3 w-3" />
        通報する
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#e5e5e5] rounded-lg p-3 space-y-2 animate-pop">
      <Textarea label="通報理由" placeholder="問題の内容を具体的に記載してください" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="danger" disabled={loading}>
          {loading ? "送信中..." : "通報"}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          キャンセル
        </Button>
      </div>
    </form>
  );
}
