"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TARGET_INDUSTRIES } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    display_name: "",
    graduation_year: 27,
    target_industries: [] as string[],
    target_companies: "",
    university_name: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleIndustry(industry: string) {
    setForm((prev) => ({
      ...prev,
      target_industries: prev.target_industries.includes(industry)
        ? prev.target_industries.filter((i) => i !== industry)
        : [...prev.target_industries, industry],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.display_name.trim()) {
      setError("表示名を入力してください");
      return;
    }
    if (form.target_industries.length === 0) {
      setError("志望業界を1つ以上選択してください");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("ログインが必要です");

      const username = `user_${user.id.slice(0, 8)}`;
      const companies = form.target_companies
        .split(/[,、\n]/)
        .map((c) => c.trim())
        .filter(Boolean);

      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        username,
        display_name: form.display_name.trim(),
        graduation_year: form.graduation_year,
        target_industries: form.target_industries,
        target_companies: companies,
        university_name: form.university_name.trim() || null,
        bio: form.bio.trim() || null,
      });

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("プロフィールは既に作成されています");
        }
        throw insertError;
      }

      router.push("/practice");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-primary">プロフィール設定</h1>
        <p className="mt-1 text-sm text-text-secondary">
          匿名で利用できます。実名や顔写真は不要です。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="display_name"
          label="表示名（匿名でOK）"
          placeholder="例: もちもちコンサル志望"
          value={form.display_name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, display_name: e.target.value }))
          }
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-primary">
            卒業年度
          </label>
          <div className="flex gap-2">
            {[26, 27, 28, 29].map((year) => (
              <button
                key={year}
                type="button"
                onClick={() =>
                  setForm((prev) => ({ ...prev, graduation_year: year }))
                }
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  form.graduation_year === year
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border text-text-secondary hover:bg-surface-hover"
                }`}
              >
                {year}卒
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-text-primary">
            志望業界（複数選択可）
          </label>
          <div className="flex flex-wrap gap-2">
            {TARGET_INDUSTRIES.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => toggleIndustry(industry)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  form.target_industries.includes(industry)
                    ? "bg-primary text-white"
                    : "border border-border text-text-secondary hover:bg-surface-hover"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>

        <Textarea
          id="target_companies"
          label="志望企業（任意・カンマ区切り）"
          placeholder="例: マッキンゼー, BCG, 三菱商事"
          value={form.target_companies}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, target_companies: e.target.value }))
          }
          rows={2}
        />

        <Input
          id="university_name"
          label="大学名（任意）"
          placeholder="非公開でもOK"
          value={form.university_name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, university_name: e.target.value }))
          }
        />

        <Textarea
          id="bio"
          label="自己紹介（任意）"
          placeholder="簡単な自己紹介やどんな練習をしたいかなど"
          value={form.bio}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, bio: e.target.value }))
          }
          rows={3}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? "作成中..." : "プロフィールを作成して始める"}
        </Button>
      </form>
    </div>
  );
}
