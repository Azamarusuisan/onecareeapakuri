"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

interface ApplicationFormProps {
  requestId: string;
  hasApplied: boolean;
}

export function ApplicationForm({ requestId, hasApplied }: ApplicationFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (hasApplied) {
    return (
      <div className="rounded-lg bg-primary-light p-4 text-center">
        <p className="text-sm font-medium text-primary">応募済みです</p>
        <p className="text-xs text-text-secondary mt-1">
          募集者の承認をお待ちください
        </p>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/practice-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          message: message || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "応募に失敗しました");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        label="一言メッセージ（任意）"
        placeholder="自己紹介や意気込みなどを書いてみましょう"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "送信中..." : "この練習に応募する"}
      </Button>
    </form>
  );
}
