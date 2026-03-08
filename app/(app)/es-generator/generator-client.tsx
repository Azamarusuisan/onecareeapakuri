"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { UserExperience } from "@/lib/types";
import { EXPERIENCE_CATEGORY_LABELS } from "@/lib/types";
import {
  Sparkles,
  Copy,
  CheckCircle2,
  Star,
  ChevronRight,
  BookOpen,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface GeneratorClientProps {
  experiences: UserExperience[];
}

const CHAR_LIMITS = [200, 300, 400, 500, 600, 800];

export function GeneratorClient({ experiences }: GeneratorClientProps) {
  const [companyName, setCompanyName] = useState("");
  const [question, setQuestion] = useState("");
  const [charLimit, setCharLimit] = useState(400);
  const [customCharLimit, setCustomCharLimit] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(
    experiences.filter((e) => e.is_default).map((e) => e.id)
  );
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const effectiveCharLimit = customCharLimit ? parseInt(customCharLimit, 10) : charLimit;
  const charCount = result.length;

  function toggleExp(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function generate() {
    if (!question.trim()) {
      setError("設問を入力してください");
      return;
    }
    if (selectedIds.length === 0) {
      setError("使用する経験談を1つ以上選択してください");
      return;
    }
    setError("");
    setResult("");
    setLoading(true);

    const selectedExperiences = experiences.filter((e) => selectedIds.includes(e.id));

    try {
      const res = await fetch("/api/generate-es", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim() || "志望企業",
          question: question.trim(),
          charLimit: effectiveCharLimit,
          experiences: selectedExperiences.map((e) => ({
            title: e.title,
            category: EXPERIENCE_CATEGORY_LABELS[e.category],
            description: e.description,
            skills: e.skills,
          })),
        }),
      });

      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "生成に失敗しました");
        return;
      }

      // Stream the response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setResult(full);
      }
    } catch {
      setError("ネットワークエラーが発生しました。再度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="px-4 py-4 space-y-5">
      {/* Step 1: Experiences */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[13px] font-bold text-[#1a1a1a]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#059669] text-white text-[10px] font-black mr-1.5">1</span>
            使用する経験談を選ぶ
          </h2>
          <Link href="/profile/experiences" className="flex items-center text-[12px] text-[#059669] font-bold">
            経験を管理<ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {experiences.length === 0 ? (
          <div className="py-6 flex flex-col items-center text-center bg-[#fafafa] rounded-2xl border border-dashed border-[#e5e5e5]">
            <BookOpen className="h-6 w-6 text-[#ccc] mb-2" />
            <p className="text-[13px] font-bold text-[#1a1a1a] mb-1">経験談が登録されていません</p>
            <p className="text-[12px] text-[#999] mb-3">
              ガクチカや自己PRのネタを登録してください
            </p>
            <Link href="/profile/experiences">
              <Button size="sm" variant="outline" className="gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                経験を追加する
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {experiences.map((exp) => {
              const selected = selectedIds.includes(exp.id);
              return (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => toggleExp(exp.id)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-2xl border-2 transition-all",
                    selected
                      ? "border-[#059669] bg-[#ecfdf5]"
                      : "border-[#e5e5e5] bg-white hover:border-[#d1d5db]"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      selected ? "border-[#059669] bg-[#059669]" : "border-[#d1d5db]"
                    )}>
                      {selected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                          selected ? "text-[#059669] bg-white" : "text-[#666] bg-[#f5f5f7]"
                        )}>
                          {EXPERIENCE_CATEGORY_LABELS[exp.category]}
                        </span>
                        {exp.is_default && <Star className="h-3 w-3 text-[#f59e0b]" />}
                      </div>
                      <p className={cn(
                        "text-[13px] font-bold leading-snug line-clamp-1",
                        selected ? "text-[#059669]" : "text-[#1a1a1a]"
                      )}>
                        {exp.title}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Step 2: Question */}
      <section className="space-y-3">
        <h2 className="text-[13px] font-bold text-[#1a1a1a]">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#059669] text-white text-[10px] font-black mr-1.5">2</span>
          設問を入力
        </h2>
        <Input
          id="companyName"
          name="companyName"
          label="志望企業名（任意）"
          placeholder="例: BCG, デロイト"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <Textarea
          id="question"
          name="question"
          label="設問文"
          placeholder="例: 学生時代に最も力を入れたことを教えてください。"
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="h-20"
        />
      </section>

      {/* Step 3: Char limit */}
      <section className="space-y-2.5">
        <h2 className="text-[13px] font-bold text-[#1a1a1a]">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#059669] text-white text-[10px] font-black mr-1.5">3</span>
          文字数制限
        </h2>
        <div className="flex flex-wrap gap-2">
          {CHAR_LIMITS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => { setCharLimit(n); setCustomCharLimit(""); }}
              className={cn(
                "px-3 py-2 rounded-xl text-[13px] font-bold border-2 transition-all",
                charLimit === n && !customCharLimit
                  ? "border-[#059669] bg-[#ecfdf5] text-[#059669]"
                  : "border-[#e5e5e5] text-[#666] hover:border-[#d1d5db]"
              )}
            >
              {n}文字
            </button>
          ))}
          <input
            type="number"
            placeholder="自由入力"
            value={customCharLimit}
            onChange={(e) => setCustomCharLimit(e.target.value)}
            className={cn(
              "w-24 px-3 py-2 rounded-xl text-[13px] font-bold border-2 transition-all outline-none",
              customCharLimit
                ? "border-[#059669] bg-[#ecfdf5] text-[#059669]"
                : "border-[#e5e5e5] text-[#666]"
            )}
          />
        </div>
        <p className="text-[11px] text-[#999]">
          設定中: <strong className="text-[#1a1a1a]">{effectiveCharLimit}文字</strong>
        </p>
      </section>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 py-3 px-4 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Generate Button */}
      <Button
        type="button"
        onClick={generate}
        loading={loading}
        size="lg"
        className="w-full gap-2 text-[15px]"
      >
        <Sparkles className="h-5 w-5" />
        {loading ? "AIが生成中..." : "ESを生成する"}
      </Button>

      {/* Result */}
      {result && (
        <section className="space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-bold text-[#1a1a1a]">生成結果</h2>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[12px] font-bold",
                charCount > effectiveCharLimit ? "text-[#ff3b30]" : "text-[#059669]"
              )}>
                {charCount} / {effectiveCharLimit}字
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg border border-[#e5e5e5] hover:bg-[#f5f5f7] transition-colors"
              >
                {copied ? (
                  <><CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" /><span className="text-[#059669]">コピー完了</span></>
                ) : (
                  <><Copy className="h-3.5 w-3.5" />コピー</>
                )}
              </button>
              <button
                onClick={generate}
                disabled={loading}
                className="flex items-center gap-1 text-[12px] font-bold px-3 py-1.5 rounded-lg border border-[#e5e5e5] hover:bg-[#f5f5f7] transition-colors disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                再生成
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="w-full min-h-[200px] border border-[#e5e5e5] rounded-2xl bg-[#fafafa] p-4 text-[14px] leading-relaxed text-[#1a1a1a] focus:bg-white focus:border-[#059669] focus:outline-none transition-colors resize-none"
            />
            {loading && (
              <div className="absolute bottom-4 right-4">
                <div className="h-2 w-2 rounded-full bg-[#059669] animate-ping" />
              </div>
            )}
          </div>

          {charCount > effectiveCharLimit && (
            <p className="text-[12px] text-[#ff3b30] flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              文字数制限を{charCount - effectiveCharLimit}字オーバーしています。再生成または手動で調整してください。
            </p>
          )}
        </section>
      )}
    </div>
  );
}
