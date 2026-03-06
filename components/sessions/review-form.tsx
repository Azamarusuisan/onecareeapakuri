"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Send } from "lucide-react";

interface ReviewFormProps {
  sessionId: string;
  revieweeId: string;
}

export function ReviewForm({ sessionId, revieweeId }: ReviewFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="bg-[#ecfdf5] rounded-lg p-4 text-center animate-pop">
        <p className="text-[13px] font-bold text-[#059669]">レビューを送信しました</p>
        <p className="text-[11px] text-[#666] mt-0.5">ご協力ありがとうございます</p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast("評価を選択してください", "error"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/session-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, reviewee_id: revieweeId, rating, comment: comment || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "送信に失敗しました");
      }
      setDone(true);
      toast("レビューを送信しました！");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "エラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-[13px] font-bold text-[#1a1a1a]">評価</label>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <Textarea label="コメント（任意）" placeholder="練習相手へのフィードバックを書いてみましょう"
        value={comment} onChange={(e) => setComment(e.target.value)} rows={3} />
      <Button type="submit" disabled={loading} className="w-full gap-2">
        <Send className="h-4 w-4" />
        {loading ? "送信中..." : "レビューを投稿"}
      </Button>
    </form>
  );
}
