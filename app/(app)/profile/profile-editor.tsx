"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TARGET_INDUSTRIES } from "@/lib/types";
import type { Profile } from "@/lib/types";
import { LogOut } from "lucide-react";

interface ProfileEditorProps {
  profile: Profile;
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    display_name: profile.display_name,
    graduation_year: profile.graduation_year,
    target_industries: profile.target_industries,
    target_companies: profile.target_companies.join(", "),
    university_name: profile.university_name ?? "",
    bio: profile.bio ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function toggleIndustry(industry: string) {
    setForm((prev) => ({
      ...prev,
      target_industries: prev.target_industries.includes(industry)
        ? prev.target_industries.filter((i) => i !== industry)
        : [...prev.target_industries, industry],
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const companies = form.target_companies
      .split(/[,、\n]/)
      .map((c) => c.trim())
      .filter(Boolean);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: form.display_name.trim(),
        graduation_year: form.graduation_year,
        target_industries: form.target_industries,
        target_companies: companies,
        university_name: form.university_name.trim() || null,
        bio: form.bio.trim() || null,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary text-xl font-bold">
          {profile.display_name[0]}
        </div>
        <div>
          <p className="text-base font-bold text-text-primary">
            {profile.display_name}
          </p>
          <p className="text-xs text-text-secondary">
            {profile.graduation_year}卒
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <Input
          id="display_name"
          label="表示名"
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
            志望業界
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
          label="志望企業（カンマ区切り）"
          value={form.target_companies}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, target_companies: e.target.value }))
          }
          rows={2}
        />

        <Input
          id="university_name"
          label="大学名（任意）"
          value={form.university_name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, university_name: e.target.value }))
          }
        />

        <Textarea
          id="bio"
          label="自己紹介（任意）"
          value={form.bio}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, bio: e.target.value }))
          }
          rows={3}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && (
          <p className="text-sm text-emerald-600">保存しました</p>
        )}

        <Button type="submit" disabled={loading} size="lg" className="w-full">
          {loading ? "保存中..." : "プロフィールを保存"}
        </Button>
      </form>

      <div className="border-t border-border pt-4">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full gap-2 text-text-secondary"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </Button>
      </div>
    </div>
  );
}
