"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  sessionId: string;
  revieweeId: string;
}

export function ReviewForm({ sessionId, revieweeId }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("評価を選択してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/session-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          reviewee_id: revieweeId,
          rating,
          comment: comment || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "レビュー送信に失敗しました");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-text-primary">
          評価
        </label>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <Textarea
        label="コメント（任意）"
        placeholder="練習相手へのフィードバックを書いてみましょう"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "送信中..." : "レビューを投稿"}
      </Button>
    </form>
  );
}
