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
import { Plus, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DateTimeSlotPicker } from "@/components/ui/date-time-picker-slots";

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

export function PracticeWizardClient() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    target_company: "",
    target_role: "",
    interview_stage: "",
    practice_type: "",
    duration_minutes: "45",
    description: "",
  });
  const [slots, setSlots] = useState<TimeSlot[]>([{ start_at: "", end_at: "" }]);

  const updateForm = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // clear error
    if (errors[e.target.name]) {
      const newErrors = { ...errors };
      delete newErrors[e.target.name];
      setErrors(newErrors);
    }
  };

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

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) errs.title = "タイトルは必須です";
    if (!formData.target_company.trim()) errs.target_company = "対象企業は必須です";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.practice_type) errs.practice_type = "練習タイプは必須です";
    if (!formData.interview_stage) errs.interview_stage = "面接ステージは必須です";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => Math.max(1, s - 1));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep1() || !validateStep2()) {
      setServerError("未入力の必須項目があります");
      return;
    }

    const formattedSlots = slots.map((s) => ({
      start_at: s.start_at ? new Date(s.start_at).toISOString() : "",
      end_at: s.end_at ? new Date(s.end_at).toISOString() : "",
    }));

    const isValidSlots = formattedSlots.every(s => s.start_at && s.end_at);
    if (!isValidSlots) {
      setErrors({ slots: "日時を正しく入力してください" });
      return;
    }

    const data = {
      ...formData,
      duration_minutes: parseInt(formData.duration_minutes, 10),
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
        if (result.fieldErrors) setErrors(result.fieldErrors);
        else setServerError(result.error || "作成に失敗しました");
        return;
      }

      router.push("/practice");
    } catch {
      setServerError("エラーが発生しました。時間を置いて再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header title="練習募集を作成" showBack />
      
      {/* Progress Bar */}
      <div className="bg-white border-b border-[#e5e5e5] px-4 py-3 sticky top-[48px] z-10">
        <div className="flex justify-between items-center mb-1.5 px-1">
          <span className={cn("text-[10px] font-bold", step >= 1 ? "text-[#059669]" : "text-[#ccc]")}>基本情報</span>
          <span className={cn("text-[10px] font-bold", step >= 2 ? "text-[#059669]" : "text-[#ccc]")}>詳細条件</span>
          <span className={cn("text-[10px] font-bold", step >= 3 ? "text-[#059669]" : "text-[#ccc]")}>日時指定</span>
        </div>
        <div className="h-1.5 w-full bg-[#f0f0f0] rounded-full overflow-hidden flex">
          <div className={cn("h-full bg-[#059669] transition-all duration-300", 
            step === 1 ? "w-1/3" : step === 2 ? "w-2/3" : "w-full"
          )} />
        </div>
      </div>

      <div className="px-4 py-5 min-h-[calc(100vh-140px)] flex flex-col">
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {serverError}
          </div>
        )}

        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-2 fade-in duration-300">
              <div className="space-y-1 mb-6">
                <h2 className="text-[17px] font-bold text-[#1a1a1a]">基本情報を入力</h2>
                <p className="text-[12px] text-[#666]">どんな練習をしたいか、分かりやすいタイトルをつけましょう。</p>
              </div>

              <Input
                id="title"
                name="title"
                label="タイトル"
                placeholder="例: BCGケース面接 本選考前の壁打ち"
                required
                error={errors.title}
                value={formData.title}
                onChange={updateForm}
              />

              <Input
                id="target_company"
                name="target_company"
                label="対象企業"
                placeholder="例: BCG, デロイト, マッキンゼー"
                required
                error={errors.target_company}
                value={formData.target_company}
                onChange={updateForm}
              />

              <Input
                id="target_role"
                name="target_role"
                label="対象職種（任意）"
                placeholder="例: 戦略コンサルタント, ビジネスアナリスト"
                error={errors.target_role}
                value={formData.target_role}
                onChange={updateForm}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-2 fade-in duration-300">
              <div className="space-y-1 mb-6">
                <h2 className="text-[17px] font-bold text-[#1a1a1a]">詳細条件を設定</h2>
                <p className="text-[12px] text-[#666]">練習の種類や内容について詳しく教えてください。</p>
              </div>

              <Select
                id="practice_type"
                name="practice_type"
                label="練習タイプ"
                options={practiceTypeOptions}
                placeholder="選択してください"
                required
                error={errors.practice_type}
                value={formData.practice_type}
                onChange={updateForm}
              />

              <Select
                id="interview_stage"
                name="interview_stage"
                label="面接ステージ"
                options={INTERVIEW_STAGES}
                placeholder="選択してください"
                required
                error={errors.interview_stage}
                value={formData.interview_stage}
                onChange={updateForm}
              />

              <Select
                id="duration_minutes"
                name="duration_minutes"
                label="所要時間"
                options={durationOptions}
                error={errors.duration_minutes}
                value={formData.duration_minutes}
                onChange={updateForm}
              />

              <Textarea
                id="description"
                name="description"
                label="詳細説明（任意）"
                placeholder="どんな練習をしたいか、レベル感、フィードバックの希望など"
                error={errors.description}
                value={formData.description}
                onChange={updateForm}
                className="h-24"
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right-2 fade-in duration-300">
               <div className="space-y-1 mb-6">
                <h2 className="text-[17px] font-bold text-[#1a1a1a]">候補日時を指定</h2>
                <p className="text-[12px] text-[#666]">候補日時を複数出すと、マッチング率が大幅に上がります。（最大5つ）</p>
              </div>

              <div className="space-y-3">
                <DateTimeSlotPicker slots={slots} onChange={setSlots} maxSlots={5} />
                {errors.slots && <p className="text-[12px] text-[#ff3b30] mt-1">{errors.slots}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-[#e5e5e5] flex gap-3">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={prevStep} className="flex-1 flex gap-1 group">
              <ChevronLeft className="h-4 w-4 text-[#666] group-hover:text-[#1a1a1a] transition-colors" />
              戻る
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" onClick={nextStep} className="flex-[2] flex gap-1 group">
              次へ
              <ChevronRight className="h-4 w-4 text-white/80 group-hover:text-white transition-colors" />
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit} disabled={loading} className="flex-[2]">
              {loading ? "作成中..." : "募集を作成する"}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
