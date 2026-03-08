"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Shield, Target, Briefcase } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState<"google" | "demo" | null>(null);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleOAuth() {
    setLoading("google");
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        scopes: "openid email profile https://www.googleapis.com/auth/calendar.events",
        queryParams: { prompt: "select_account", access_type: "offline" },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(null);
    }
  }

  async function handleDemoLogin() {
    setLoading("demo");
    setError("");
    await fetch("/api/auth/demo", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Header */}
      <div className="h-11 flex items-center px-4 border-b border-[#e5e5e5]">
        <span className="text-[15px] font-bold text-[#1a1a1a] tracking-tight">ShuPra</span>
        <span className="ml-2 text-[10px] text-[#999] border border-[#e5e5e5] rounded px-1.5 py-[1px]">Beta</span>
      </div>

      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full">
        {/* Hero */}
        <div className="px-5 pt-10 pb-6">
          <p className="text-[11px] font-bold text-[#059669] tracking-wider uppercase mb-2">
            難関企業志望者のための実戦練習
          </p>
          <h1 className="text-[26px] font-bold text-[#1a1a1a] leading-[1.3]">
            匿名で、本気の<br />面接練習を。
          </h1>
          <p className="text-[13px] text-[#666] mt-3 leading-relaxed">
            コンサル・Big4・戦略ファーム志望者に特化。<br />
            ケース面接・志望動機深掘り・最終面接を<br />
            本番前に徹底練習。
          </p>
        </div>

        {/* Feature Pills */}
        <div className="px-5 pb-8">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#f7f7f8] rounded-xl py-3 px-2 text-center">
              <Target className="h-5 w-5 text-[#059669] mx-auto mb-1" />
              <p className="text-[11px] font-bold text-[#1a1a1a]">ケース対策</p>
              <p className="text-[10px] text-[#999] mt-0.5">構造化/打ち手</p>
            </div>
            <div className="bg-[#f7f7f8] rounded-xl py-3 px-2 text-center">
              <Briefcase className="h-5 w-5 text-[#059669] mx-auto mb-1" />
              <p className="text-[11px] font-bold text-[#1a1a1a]">志望動機</p>
              <p className="text-[10px] text-[#999] mt-0.5">深掘り対策</p>
            </div>
            <div className="bg-[#f7f7f8] rounded-xl py-3 px-2 text-center">
              <Shield className="h-5 w-5 text-[#059669] mx-auto mb-1" />
              <p className="text-[11px] font-bold text-[#1a1a1a]">完全匿名</p>
              <p className="text-[10px] text-[#999] mt-0.5">実名不要</p>
            </div>
          </div>
        </div>

        {/* Auth Buttons */}
        <div className="px-5 space-y-3">
          {/* Google */}
          <button
            id="google-login"
            onClick={() => handleOAuth()}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl border-2 border-[#e5e5e5] bg-white text-[14px] font-bold text-[#1a1a1a] hover:bg-[#f7f7f8] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading === "google" ? (
              <div className="h-5 w-5 rounded-full border-2 border-[#4285F4] border-t-transparent animate-spin" />
            ) : (
              <svg className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Googleでログイン
          </button>

          {/* Demo */}
          <button
            id="demo-login"
            onClick={handleDemoLogin}
            disabled={loading !== null}
            className="w-full flex items-center justify-center h-11 rounded-xl border border-[#e5e5e5] text-[13px] font-medium text-[#666] hover:bg-[#f7f7f8] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading === "demo" ? (
              <div className="h-4 w-4 rounded-full border-2 border-[#666] border-t-transparent animate-spin" />
            ) : (
              "まずはデモで体験する"
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-center text-[12px] text-[#ff3b30] px-5">{error}</p>
        )}

        {/* Footer */}
        <div className="mt-auto px-5 py-6">
          <p className="text-center text-[10px] text-[#bbb] leading-relaxed">
            本サービスは就職斡旋・職業紹介を行いません。<br />
            ログインすることで<span className="underline">利用規約</span>・<span className="underline">プライバシーポリシー</span>に同意したものとみなします。
          </p>
        </div>
      </div>
    </div>
  );
}
