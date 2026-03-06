"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

interface SessionCompleteButtonProps {
  sessionId: string;
}

export function SessionCompleteButton({ sessionId }: SessionCompleteButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete() {
    if (!confirm("このセッションを完了しますか？")) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/sessions/${sessionId}/complete`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "完了処理に失敗しました");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        onClick={handleComplete}
        disabled={loading}
        variant="secondary"
        size="lg"
        className="w-full gap-2"
      >
        <CheckCircle className="h-5 w-5" />
        {loading ? "処理中..." : "セッションを完了する"}
      </Button>
      {error && <p className="mt-2 text-xs text-red-600 text-center">{error}</p>}
    </div>
  );
}
