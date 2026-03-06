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
import { Plus, X, Calendar } from "lucide-react";

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

interface TimeSlot {
  start_at: string;
  end_at: string;
}

export default function NewPracticePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([{ start_at: "", end_at: "" }]);

  function addSlot() {
    if (slots.length >= 5) return;
    setSlots([...slots, { start_at: "", end_at: "" }]);
  }

  function removeSlot(index: number) {
    if (slots.length <= 1) return;
    setSlots(slots.filter((_, i) => i !== index));
  }

  function updateSlot(index: number, field: "start_at" | "end_at", value: string) {
    setSlots(slots.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const formattedSlots = slots.map((s) => ({
      start_at: s.start_at ? new Date(s.start_at).toISOString() : "",
      end_at: s.end_at ? new Date(s.end_at).toISOString() : "",
    }));

    const data = {
      title: formData.get("title") as string,
      target_company: formData.get("target_company") as string,
      target_role: (formData.get("target_role") as string) || null,
      interview_stage: formData.get("interview_stage") as string,
      practice_type: formData.get("practice_type") as string,
      description: (formData.get("description") as string) || null,
      duration_minutes: parseInt(formData.get("duration_minutes") as string, 10),
      slots: formattedSlots,
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
        <p className="text-[12px] text-[#666] mb-4">
          練習相手を募集しましょう。候補日時を複数出すと、マッチングしやすくなります。
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="title"
            name="title"
            label="タイトル"
            placeholder="例: BCGケース面接 本選考前の壁打ち"
            required
            error={errors.title}
          />

          <Input
            id="target_company"
            name="target_company"
            label="対象企業"
            placeholder="例: BCG, デロイト, マッキンゼー"
            required
            error={errors.target_company}
          />

          <Input
            id="target_role"
            name="target_role"
            label="対象職種（任意）"
            placeholder="例: 戦略コンサルタント, ビジネスアナリスト"
            error={errors.target_role}
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
            id="duration_minutes"
            name="duration_minutes"
            label="所要時間"
            options={durationOptions}
            defaultValue="45"
            error={errors.duration_minutes}
          />

          <Textarea
            id="description"
            name="description"
            label="詳細説明（任意）"
            placeholder="どんな練習をしたいか、レベル感、フィードバックの希望など"
            error={errors.description}
          />

          {/* Time Slots */}
          <div className="space-y-2">
            <label className="block text-[13px] font-bold text-[#1a1a1a]">
              候補日時（この辺ならいけます）
            </label>
            <p className="text-[11px] text-[#999]">
              練習可能な時間帯を1〜5つ設定できます。レンジで指定してください。
            </p>

            {slots.map((slot, i) => (
              <div key={i} className="border border-[#e5e5e5] rounded-lg p-3 space-y-2 animate-pop">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#059669]" />
                    <span className="text-[12px] font-bold text-[#1a1a1a]">候補 {i + 1}</span>
                  </div>
                  {slots.length > 1 && (
                    <button type="button" onClick={() => removeSlot(i)} className="p-1 text-[#999] active:text-[#ff3b30]">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#999] mb-0.5">開始</label>
                    <input
                      type="datetime-local"
                      value={slot.start_at}
                      onChange={(e) => updateSlot(i, "start_at", e.target.value)}
                      required
                      className="w-full border border-[#e5e5e5] rounded-lg bg-white px-2.5 py-2 text-[13px] text-[#1a1a1a] focus:border-[#059669] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#999] mb-0.5">終了</label>
                    <input
                      type="datetime-local"
                      value={slot.end_at}
                      onChange={(e) => updateSlot(i, "end_at", e.target.value)}
                      required
                      className="w-full border border-[#e5e5e5] rounded-lg bg-white px-2.5 py-2 text-[13px] text-[#1a1a1a] focus:border-[#059669] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            {slots.length < 5 && (
              <button
                type="button"
                onClick={addSlot}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[#ccc] rounded-lg text-[12px] font-bold text-[#666] active:bg-[#fafafa] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                候補日時を追加
              </button>
            )}

            {errors.slots && <p className="text-[12px] text-[#ff3b30]">{errors.slots}</p>}
          </div>

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
