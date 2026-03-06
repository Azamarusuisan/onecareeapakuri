"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isDemoModeClient } from "@/lib/utils/demo-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";
import { TARGET_INDUSTRIES, TARGET_COMPANIES_SUGGESTIONS } from "@/lib/types";
import type { Profile } from "@/lib/types";
import { LogOut, ChevronRight, Briefcase, GraduationCap, Building2, User, FileText, Settings, Shield } from "lucide-react";

interface ProfileEditorProps {
  profile: Profile;
}

export function ProfileEditor({ profile }: ProfileEditorProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({
    display_name: profile.display_name,
    graduation_year: profile.graduation_year,
    target_industries: profile.target_industries,
    target_companies: profile.target_companies,
    university_name: profile.university_name ?? "",
    bio: profile.bio ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [companyInput, setCompanyInput] = useState("");

  function toggleIndustry(industry: string) {
    setForm((prev) => ({
      ...prev,
      target_industries: prev.target_industries.includes(industry)
        ? prev.target_industries.filter((i) => i !== industry)
        : [...prev.target_industries, industry],
    }));
  }

  function addCompany(company: string) {
    const trimmed = company.trim();
    if (trimmed && !form.target_companies.includes(trimmed)) {
      setForm((prev) => ({ ...prev, target_companies: [...prev.target_companies, trimmed] }));
    }
    setCompanyInput("");
  }

  function removeCompany(company: string) {
    setForm((prev) => ({ ...prev, target_companies: prev.target_companies.filter((c) => c !== company) }));
  }

  async function handleSave() {
    setLoading(true);

    if (isDemoModeClient()) {
      toast("プロフィールを保存しました");
      setLoading(false);
      setEditing(null);
      return;
    }

    const { error } = await supabase.from("profiles").update({
      display_name: form.display_name.trim(),
      graduation_year: form.graduation_year,
      target_industries: form.target_industries,
      target_companies: form.target_companies,
      university_name: form.university_name.trim() || null,
      bio: form.bio.trim() || null,
    }).eq("id", profile.id);

    if (error) {
      toast(error.message, "error");
    } else {
      toast("プロフィールを保存しました");
      router.refresh();
    }
    setLoading(false);
    setEditing(null);
  }

  async function handleLogout() {
    if (isDemoModeClient()) {
      document.cookie = "demo_user=; path=/; max-age=0";
      router.push("/login");
      return;
    }
    await supabase.auth.signOut();
    router.push("/login");
  }

  const filteredSuggestions = TARGET_COMPANIES_SUGGESTIONS.filter(
    (c) => !form.target_companies.includes(c) && c.toLowerCase().includes(companyInput.toLowerCase())
  ).slice(0, 5);

  return (
    <div>
      {/* Profile header */}
      <div className="bg-white px-4 pt-5 pb-4 border-b border-[#e5e5e5]">
        <div className="flex items-center gap-3.5">
          <Avatar name={form.display_name} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-[17px] font-bold text-[#1a1a1a] truncate">{form.display_name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[12px] font-bold text-[#059669] bg-[#ecfdf5] rounded px-1.5 py-[1px]">{form.graduation_year}卒</span>
              {form.university_name && (
                <span className="text-[12px] text-[#999]">{form.university_name}</span>
              )}
            </div>
          </div>
        </div>
        {form.bio && (
          <p className="text-[13px] text-[#666] mt-3 leading-relaxed">{form.bio}</p>
        )}
      </div>

      {/* Sections */}
      <div className="bg-[#f5f5f7]">

        {/* 基本情報 */}
        <div className="mt-2 bg-white">
          <div className="px-4 py-2.5 border-b border-[#f0f0f0]">
            <p className="text-[11px] font-bold text-[#999] tracking-wider">基本情報</p>
          </div>

          <button onClick={() => setEditing(editing === "name" ? null : "name")}
            className="w-full px-4 py-3 flex items-center justify-between border-b border-[#f0f0f0] active:bg-[#fafafa]">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-[#999]" />
              <div className="text-left">
                <p className="text-[12px] text-[#999]">表示名</p>
                <p className="text-[14px] font-bold text-[#1a1a1a]">{form.display_name}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#ccc]" />
          </button>
          {editing === "name" && (
            <div className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0] animate-pop">
              <Input value={form.display_name} onChange={(e) => setForm((p) => ({ ...p, display_name: e.target.value }))}
                placeholder="匿名の表示名" />
              <Button size="sm" onClick={handleSave} disabled={loading} className="mt-2">保存</Button>
            </div>
          )}

          <button onClick={() => setEditing(editing === "grad" ? null : "grad")}
            className="w-full px-4 py-3 flex items-center justify-between border-b border-[#f0f0f0] active:bg-[#fafafa]">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-[#999]" />
              <div className="text-left">
                <p className="text-[12px] text-[#999]">卒業年度</p>
                <p className="text-[14px] font-bold text-[#1a1a1a]">{form.graduation_year}卒</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#ccc]" />
          </button>
          {editing === "grad" && (
            <div className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0] animate-pop">
              <div className="flex gap-2">
                {[27, 28, 29, 30].map((y) => (
                  <button key={y} onClick={() => { setForm((p) => ({ ...p, graduation_year: y })); }}
                    className={`flex-1 rounded-lg border py-2 text-[13px] font-bold ${form.graduation_year === y ? "border-[#059669] bg-[#ecfdf5] text-[#059669]" : "border-[#e5e5e5] text-[#666]"}`}>
                    {y}卒
                  </button>
                ))}
              </div>
              <Button size="sm" onClick={handleSave} disabled={loading} className="mt-2">保存</Button>
            </div>
          )}

          <button onClick={() => setEditing(editing === "univ" ? null : "univ")}
            className="w-full px-4 py-3 flex items-center justify-between border-b border-[#f0f0f0] active:bg-[#fafafa]">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-[#999]" />
              <div className="text-left">
                <p className="text-[12px] text-[#999]">大学名（任意）</p>
                <p className="text-[14px] font-bold text-[#1a1a1a]">{form.university_name || "未設定"}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#ccc]" />
          </button>
          {editing === "univ" && (
            <div className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0] animate-pop">
              <Input value={form.university_name} onChange={(e) => setForm((p) => ({ ...p, university_name: e.target.value }))}
                placeholder="大学名（非公開可）" />
              <Button size="sm" onClick={handleSave} disabled={loading} className="mt-2">保存</Button>
            </div>
          )}

          <button onClick={() => setEditing(editing === "bio" ? null : "bio")}
            className="w-full px-4 py-3 flex items-center justify-between active:bg-[#fafafa]">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-[#999]" />
              <div className="text-left">
                <p className="text-[12px] text-[#999]">自己紹介（任意）</p>
                <p className="text-[14px] text-[#1a1a1a] line-clamp-1">{form.bio || "未設定"}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#ccc]" />
          </button>
          {editing === "bio" && (
            <div className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0] animate-pop">
              <Textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="志望ファーム、練習で求めていること、ケース経験本数など" rows={4} />
              <Button size="sm" onClick={handleSave} disabled={loading} className="mt-2">保存</Button>
            </div>
          )}
        </div>

        {/* 志望情報 */}
        <div className="mt-2 bg-white">
          <div className="px-4 py-2.5 border-b border-[#f0f0f0]">
            <p className="text-[11px] font-bold text-[#999] tracking-wider">志望情報</p>
          </div>

          <button onClick={() => setEditing(editing === "industries" ? null : "industries")}
            className="w-full px-4 py-3 flex items-start justify-between border-b border-[#f0f0f0] active:bg-[#fafafa]">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Briefcase className="h-4 w-4 text-[#999] mt-0.5" />
              <div className="text-left flex-1 min-w-0">
                <p className="text-[12px] text-[#999]">志望業界</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {form.target_industries.length > 0 ? form.target_industries.map((ind) => (
                    <span key={ind} className="text-[12px] font-bold text-[#059669] bg-[#ecfdf5] rounded px-1.5 py-[1px]">{ind}</span>
                  )) : (
                    <span className="text-[13px] text-[#999]">未設定</span>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#ccc] mt-0.5" />
          </button>
          {editing === "industries" && (
            <div className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0] animate-pop">
              <div className="flex flex-wrap gap-2">
                {TARGET_INDUSTRIES.map((ind) => (
                  <button key={ind} onClick={() => toggleIndustry(ind)}
                    className={`rounded-full px-3 py-1.5 text-[12px] font-bold border transition-colors ${
                      form.target_industries.includes(ind) ? "bg-[#059669] text-white border-[#059669]" : "bg-white border-[#e5e5e5] text-[#666]"
                    }`}>
                    {ind}
                  </button>
                ))}
              </div>
              <Button size="sm" onClick={handleSave} disabled={loading} className="mt-3">保存</Button>
            </div>
          )}

          <button onClick={() => setEditing(editing === "companies" ? null : "companies")}
            className="w-full px-4 py-3 flex items-start justify-between active:bg-[#fafafa]">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Building2 className="h-4 w-4 text-[#999] mt-0.5" />
              <div className="text-left flex-1 min-w-0">
                <p className="text-[12px] text-[#999]">志望企業</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {form.target_companies.length > 0 ? form.target_companies.map((c) => (
                    <span key={c} className="text-[12px] font-bold text-[#1a1a1a] bg-[#f5f5f7] rounded px-1.5 py-[1px]">{c}</span>
                  )) : (
                    <span className="text-[13px] text-[#999]">未設定</span>
                  )}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[#ccc] mt-0.5" />
          </button>
          {editing === "companies" && (
            <div className="px-4 py-3 bg-[#fafafa] border-b border-[#f0f0f0] animate-pop">
              {/* Selected */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {form.target_companies.map((c) => (
                  <button key={c} onClick={() => removeCompany(c)}
                    className="flex items-center gap-1 bg-[#1a1a1a] text-white rounded-full px-2.5 py-1 text-[12px] font-bold active:opacity-70">
                    {c}
                    <span className="text-white/60 text-[10px]">✕</span>
                  </button>
                ))}
              </div>
              {/* Input */}
              <div className="relative">
                <input
                  type="text"
                  value={companyInput}
                  onChange={(e) => setCompanyInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCompany(companyInput); } }}
                  placeholder="企業名を入力（Enterで追加）"
                  className="w-full border border-[#e5e5e5] rounded-lg bg-white px-3 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#999] focus:border-[#059669] focus:outline-none"
                />
              </div>
              {/* Suggestions */}
              {companyInput && filteredSuggestions.length > 0 && (
                <div className="mt-1.5 border border-[#e5e5e5] rounded-lg bg-white overflow-hidden">
                  {filteredSuggestions.map((c) => (
                    <button key={c} onClick={() => addCompany(c)}
                      className="w-full text-left px-3 py-2 text-[13px] text-[#1a1a1a] border-b border-[#f0f0f0] last:border-b-0 active:bg-[#f5f5f7]">
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <Button size="sm" onClick={handleSave} disabled={loading} className="mt-3">保存</Button>
            </div>
          )}
        </div>

        {/* アカウント */}
        <div className="mt-2 bg-white">
          <div className="px-4 py-2.5 border-b border-[#f0f0f0]">
            <p className="text-[11px] font-bold text-[#999] tracking-wider">アカウント</p>
          </div>

          <div className="px-4 py-3 flex items-center gap-3 border-b border-[#f0f0f0]">
            <Shield className="h-4 w-4 text-[#999]" />
            <div>
              <p className="text-[12px] text-[#999]">プライバシー</p>
              <p className="text-[13px] text-[#1a1a1a]">匿名モード（実名は表示されません）</p>
            </div>
          </div>

          <div className="px-4 py-3 flex items-center gap-3 border-b border-[#f0f0f0]">
            <Settings className="h-4 w-4 text-[#999]" />
            <div>
              <p className="text-[12px] text-[#999]">アカウントID</p>
              <p className="text-[13px] text-[#999] font-mono">{profile.username}</p>
            </div>
          </div>

          <button onClick={handleLogout}
            className="w-full px-4 py-3 flex items-center gap-3 active:bg-[#fafafa]">
            <LogOut className="h-4 w-4 text-[#ff3b30]" />
            <p className="text-[14px] text-[#ff3b30]">ログアウト</p>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-6 text-center">
          <p className="text-[11px] text-[#ccc]">ShuPra v0.2.0 Beta</p>
          <p className="text-[10px] text-[#ccc] mt-0.5">難関企業志望者のための匿名面接練習アプリ</p>
        </div>
      </div>
    </div>
  );
}
