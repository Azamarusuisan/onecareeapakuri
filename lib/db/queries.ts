import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { addDays, addHours } from "date-fns";
import type {
  PracticeRequest,
  PracticeApplication,
  Session,
  SessionReview,
  Profile,
} from "@/lib/types";

async function isDemoMode(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get("demo_user")?.value === "true";
}

const DEMO_PROFILE: Profile = {
  id: "00000000-0000-0000-0000-000000000000",
  username: "demo_user",
  display_name: "デモユーザー",
  graduation_year: 27,
  target_industries: ["外資コンサル", "総合商社"],
  target_companies: ["マッキンゼー", "BCG"],
  university_name: null,
  bio: null,
  is_verified_student: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEMO_PROFILES: Profile[] = [
  DEMO_PROFILE,
  {
    id: "00000000-0000-0000-0000-000000000001",
    username: "tanaka_27",
    display_name: "コンサル志望のたなか",
    graduation_year: 27,
    target_industries: ["外資コンサル"],
    target_companies: ["マッキンゼー", "BCG", "ベイン"],
    university_name: null,
    bio: "ケース面接の練習相手を探しています",
    is_verified_student: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    username: "shosha_love",
    display_name: "商社第一志望まる",
    graduation_year: 27,
    target_industries: ["総合商社"],
    target_companies: ["三菱商事", "三井物産", "伊藤忠商事"],
    university_name: null,
    bio: "商社の最終面接対策をしたいです！",
    is_verified_student: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    username: "mega_dev",
    display_name: "メガベン志望のけん",
    graduation_year: 28,
    target_industries: ["メガベンチャー", "IT・通信"],
    target_companies: ["リクルート", "サイバーエージェント", "メルカリ"],
    university_name: null,
    bio: "行動面接が苦手なので一緒に練習したい",
    is_verified_student: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function createDemoRequests(): PracticeRequest[] {
  const now = new Date();
  return [
    {
      id: "10000000-0000-0000-0000-000000000001",
      user_id: DEMO_PROFILES[1].id,
      title: "BCGケース面接対策 一緒に練習しませんか？",
      target_company: "BCG",
      target_role: "戦略コンサルタント",
      interview_stage: "case",
      practice_type: "case",
      description: "BCGの本選考に向けてケース面接の練習をしたいです。お互いにフィードバックし合いましょう！レベル感は問いません。",
      preferred_start_at: addDays(now, 2).toISOString(),
      preferred_end_at: addDays(now, 2).toISOString(),
      duration_minutes: 60,
      status: "open",
      created_at: addHours(now, -3).toISOString(),
      updated_at: addHours(now, -3).toISOString(),
      profiles: DEMO_PROFILES[1],
    },
    {
      id: "10000000-0000-0000-0000-000000000002",
      user_id: DEMO_PROFILES[2].id,
      title: "三菱商事 最終面接の志望動機壁打ち",
      target_company: "三菱商事",
      target_role: null,
      interview_stage: "final",
      practice_type: "motivation",
      description: "最終面接が来週です。志望動機のブラッシュアップを手伝ってくれる方を探しています。",
      preferred_start_at: addDays(now, 1).toISOString(),
      preferred_end_at: addDays(now, 1).toISOString(),
      duration_minutes: 45,
      status: "open",
      created_at: addHours(now, -5).toISOString(),
      updated_at: addHours(now, -5).toISOString(),
      profiles: DEMO_PROFILES[2],
    },
    {
      id: "10000000-0000-0000-0000-000000000003",
      user_id: DEMO_PROFILES[3].id,
      title: "メルカリ 行動面接（BQ）練習",
      target_company: "メルカリ",
      target_role: "ソフトウェアエンジニア",
      interview_stage: "second",
      practice_type: "behavioral",
      description: "STARメソッドで回答する練習をしたいです。エンジニア以外の方も大歓迎です！",
      preferred_start_at: addDays(now, 3).toISOString(),
      preferred_end_at: addDays(now, 3).toISOString(),
      duration_minutes: 45,
      status: "open",
      created_at: addHours(now, -8).toISOString(),
      updated_at: addHours(now, -8).toISOString(),
      profiles: DEMO_PROFILES[3],
    },
    {
      id: "10000000-0000-0000-0000-000000000004",
      user_id: DEMO_PROFILES[1].id,
      title: "マッキンゼー 一次面接対策（ケース+フィット）",
      target_company: "マッキンゼー",
      target_role: "ビジネスアナリスト",
      interview_stage: "first",
      practice_type: "general",
      description: "ケースとフィットの両方を練習したいです。30分ずつ交代で面接官役をやりましょう。",
      preferred_start_at: addDays(now, 4).toISOString(),
      preferred_end_at: addDays(now, 4).toISOString(),
      duration_minutes: 60,
      status: "open",
      created_at: addHours(now, -12).toISOString(),
      updated_at: addHours(now, -12).toISOString(),
      profiles: DEMO_PROFILES[1],
    },
    {
      id: "10000000-0000-0000-0000-000000000005",
      user_id: DEMO_PROFILES[2].id,
      title: "伊藤忠商事 最終面接練習",
      target_company: "伊藤忠商事",
      target_role: null,
      interview_stage: "final",
      practice_type: "final_round",
      description: "最終面接対策です。志望動機・ガクチカ・逆質問まで通しで練習したい方を募集します。",
      preferred_start_at: addDays(now, 5).toISOString(),
      preferred_end_at: addDays(now, 5).toISOString(),
      duration_minutes: 90,
      status: "open",
      created_at: addHours(now, -24).toISOString(),
      updated_at: addHours(now, -24).toISOString(),
      profiles: DEMO_PROFILES[2],
    },
  ];
}

function createDemoSessions(): Session[] {
  const now = new Date();
  return [
    {
      id: "20000000-0000-0000-0000-000000000001",
      request_id: "10000000-0000-0000-0000-000000000099",
      host_user_id: DEMO_PROFILE.id,
      guest_user_id: DEMO_PROFILES[1].id,
      starts_at: addDays(now, 1).toISOString(),
      ends_at: addHours(addDays(now, 1), 1).toISOString(),
      status: "scheduled",
      calendar_event_id: null,
      meet_url: "https://meet.google.com/demo-link",
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      practice_requests: {
        id: "10000000-0000-0000-0000-000000000099",
        user_id: DEMO_PROFILE.id,
        title: "デロイト ケース面接練習",
        target_company: "デロイト",
        target_role: "コンサルタント",
        interview_stage: "case",
        practice_type: "case",
        description: null,
        preferred_start_at: addDays(now, 1).toISOString(),
        preferred_end_at: addDays(now, 1).toISOString(),
        duration_minutes: 60,
        status: "matched",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      },
      host_profile: DEMO_PROFILE,
      guest_profile: DEMO_PROFILES[1],
    },
  ];
}

// ============================================================
// Public query functions
// ============================================================

export async function getPracticeRequests(filters?: {
  practice_type?: string;
  search?: string;
}) {
  if (await isDemoMode()) {
    let requests = createDemoRequests();
    if (filters?.practice_type && filters.practice_type !== "all") {
      requests = requests.filter((r) => r.practice_type === filters.practice_type);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      requests = requests.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.target_company.toLowerCase().includes(q)
      );
    }
    return requests;
  }

  const supabase = await createClient();
  let query = supabase
    .from("practice_requests")
    .select("*, profiles(*)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (filters?.practice_type && filters.practice_type !== "all") {
    query = query.eq("practice_type", filters.practice_type);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,target_company.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as PracticeRequest[];
}

export async function getPracticeRequestById(id: string) {
  if (await isDemoMode()) {
    const req = createDemoRequests().find((r) => r.id === id);
    if (!req) throw new Error("Not found");
    return req;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("practice_requests")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as PracticeRequest;
}

export async function getApplicationsForRequest(requestId: string) {
  if (await isDemoMode()) {
    return [] as PracticeApplication[];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("practice_applications")
    .select("*, profiles(*)")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PracticeApplication[];
}

export async function getUserSessions(userId: string) {
  if (await isDemoMode()) {
    return createDemoSessions();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "*, practice_requests(*), host_profile:profiles!sessions_host_user_id_fkey(*), guest_profile:profiles!sessions_guest_user_id_fkey(*)"
    )
    .or(`host_user_id.eq.${userId},guest_user_id.eq.${userId}`)
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Session[];
}

export async function getSessionById(id: string) {
  if (await isDemoMode()) {
    const session = createDemoSessions().find((s) => s.id === id);
    if (!session) throw new Error("Not found");
    return session;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "*, practice_requests(*), host_profile:profiles!sessions_host_user_id_fkey(*), guest_profile:profiles!sessions_guest_user_id_fkey(*)"
    )
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Session;
}

export async function getSessionReviews(sessionId: string) {
  if (await isDemoMode()) {
    return [] as SessionReview[];
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_reviews")
    .select("*, profiles(*)")
    .eq("session_id", sessionId);

  if (error) throw error;
  return (data ?? []) as SessionReview[];
}

export async function getUserProfile(userId: string) {
  if (await isDemoMode()) {
    return DEMO_PROFILE;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data as Profile | null;
}

export async function getRecentPracticeRequests(limit: number = 5) {
  if (await isDemoMode()) {
    return createDemoRequests().slice(0, limit);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("practice_requests")
    .select("*, profiles(*)")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as PracticeRequest[];
}

export async function getUpcomingSessions(userId: string, limit: number = 5) {
  if (await isDemoMode()) {
    return createDemoSessions().slice(0, limit);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "*, practice_requests(*), host_profile:profiles!sessions_host_user_id_fkey(*), guest_profile:profiles!sessions_guest_user_id_fkey(*)"
    )
    .or(`host_user_id.eq.${userId},guest_user_id.eq.${userId}`)
    .eq("status", "scheduled")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as Session[];
}
