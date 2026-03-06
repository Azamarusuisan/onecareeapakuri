import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Profile } from "@/lib/types";

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  username: "demo_user",
  display_name: "ケース特訓中",
  graduation_year: 27,
  target_industries: ["戦略コンサル", "Big4"],
  target_companies: ["マッキンゼー", "BCG", "デロイト"],
  university_name: null,
  bio: "MBBとBig4を併願中。ケース面接の練習相手を探しています。",
  is_verified_student: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("demo_user")?.value === "true";
}

export async function requireAuth(): Promise<{ userId: string; email: string }> {
  if (await isDemoMode()) {
    return { userId: DEMO_USER_ID, email: "demo@example.com" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { userId: user.id, email: user.email ?? "" };
}

export async function requireProfile(): Promise<Profile> {
  if (await isDemoMode()) {
    return DEMO_PROFILE;
  }

  const { userId } = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  return profile as Profile;
}

export async function getOptionalProfile(): Promise<Profile | null> {
  if (await isDemoMode()) {
    return DEMO_PROFILE;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (profile as Profile) ?? null;
}
