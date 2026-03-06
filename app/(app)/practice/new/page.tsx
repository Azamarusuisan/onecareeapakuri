"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/nav/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  PRACTICE_TYPE_LABELS,
  INTERVIEW_STAGES,
  type PracticeType,
} from "@/lib/types";

const practiceTypeOptions = (
  Object.entries(PRACTICE_TYPE_LABELS) as [PracticeType, string][]
).map(([value, label]) => ({
  value,
  label,
}));

const durationOptions = [
  { value: "30", label: "30分" },
  { value: "45", label: "45分" },
  { value: "60", label: "60分" },
  { value: "90", label: "90分" },
  { value: "120", label: "120分" },
];

export default function NewPracticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      target_company: formData.get("target_company") as string,
      target_role: (formData.get("target_role") as string) || null,
      interview_stage: formData.get("interview_stage") as string,
      practice_type: formData.get("practice_type") as string,
      description: (formData.get("description") as string) || null,
      preferred_start_at: formData.get("preferred_start_at")
        ? new Date(formData.get("preferred_start_at") as string).toISOString()
        : "",
      preferred_end_at: formData.get("preferred_end_at")
        ? new Date(formData.get("preferred_end_at") as string).toISOString()
        : "",
      duration_minutes: parseInt(formData.get("duration_minutes") as string, 10),
    };

    setLoading(true);
    setErrors({});
    setServerError("");

    try {
      const res = await fetch("/api/practice-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        } else {
          setServerError(result.error || "作成に失敗しました");
        }
        return;
      }

      router.push("/practice");
    } catch {
      setServerError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="練習募集を作成" showBack />
      <div className="px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            name="title"
            label="タイトル"
            placeholder="例: BCGケース面接対策 一緒に練習しませんか？"
            required
            error={errors.title}
          />

          <Input
            id="target_company"
            name="target_company"
            label="対象企業"
            placeholder="例: BCG"
            required
            error={errors.target_company}
          />

          <Input
            id="target_role"
            name="target_role"
            label="対象職種（任意）"
            placeholder="例: 戦略コンサルタント"
            error={errors.target_role}
          />

          <Select
            id="interview_stage"
            name="interview_stage"
            label="面接ステージ"
            options={INTERVIEW_STAGES}
            placeholder="選択してください"
            defaultValue=""
            required
            error={errors.interview_stage}
          />

          <Select
            id="practice_type"
            name="practice_type"
            label="練習タイプ"
            options={practiceTypeOptions}
            placeholder="選択してください"
            defaultValue=""
            required
            error={errors.practice_type}
          />

          <Textarea
            id="description"
            name="description"
            label="詳細説明（任意）"
            placeholder="どんな練習をしたいか、レベル感、希望などを書いてみましょう"
            error={errors.description}
          />

          <Input
            id="preferred_start_at"
            name="preferred_start_at"
            label="希望開始日時"
            type="datetime-local"
            required
            error={errors.preferred_start_at}
          />

          <Input
            id="preferred_end_at"
            name="preferred_end_at"
            label="希望終了日時"
            type="datetime-local"
            required
            error={errors.preferred_end_at}
          />

          <Select
            id="duration_minutes"
            name="duration_minutes"
            label="所要時間"
            options={durationOptions}
            defaultValue="45"
            error={errors.duration_minutes}
          />

          {serverError && (
            <p className="text-sm text-red-600">{serverError}</p>
          )}

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? "作成中..." : "募集を作成する"}
          </Button>
        </form>
      </div>
    </>
  );
}
