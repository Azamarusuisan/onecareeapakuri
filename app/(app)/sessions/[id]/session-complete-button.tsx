"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CheckCircle } from "lucide-react";

interface SessionCompleteButtonProps {
  sessionId: string;
}

export function SessionCompleteButton({ sessionId }: SessionCompleteButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    if (!confirm("このセッションを完了しますか？")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/complete`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "完了処理に失敗しました");
      }
      toast("セッションを完了しました！");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "エラーが発生しました", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleComplete} disabled={loading} variant="secondary" size="lg" className="w-full gap-2">
      <CheckCircle className="h-5 w-5" />
      {loading ? "処理中..." : "セッションを完了する"}
    </Button>
  );
}
