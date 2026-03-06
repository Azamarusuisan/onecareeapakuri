"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { CheckCircle, Send } from "lucide-react";

interface ApplicationFormProps {
  requestId: string;
  hasApplied: boolean;
}

export function ApplicationForm({ requestId, hasApplied }: ApplicationFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(hasApplied);

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
    setLoading(true);

    try {
      const res = await fetch("/api/practice-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: requestId, message: message || null }),
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
    <form onSubmit={handleSubmit} className="space-y-3">
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
