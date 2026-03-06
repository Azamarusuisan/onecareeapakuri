import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { addDays, addHours } from "date-fns";
import type {
  PracticeRequest,
  PracticeRequestSlot,
  PracticeApplication,
  Session,
  SessionMessage,
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

const DEMO_PROFILES: Profile[] = [
  DEMO_PROFILE,
  {
    id: "00000000-0000-0000-0000-000000000001",
    username: "strat_27",
    display_name: "戦コン全通したい",
    graduation_year: 27,
    target_industries: ["戦略コンサル"],
    target_companies: ["マッキンゼー", "BCG", "ベイン"],
    university_name: null,
    bio: "ケース面接50本ノックを目標に練習中。フィードバックし合える仲間を探しています。",
    is_verified_student: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    username: "big4_28",
    display_name: "Big4志望のひかる",
    graduation_year: 28,
    target_industries: ["Big4", "総合コンサル"],
    target_companies: ["デロイト", "PwC", "EY", "KPMG"],
    university_name: null,
    bio: "Big4のケース＋志望動機を固めたい。本選考前に壁打ちしましょう。",
    is_verified_student: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    username: "accenture_27",
    display_name: "アクセンチュア内定狙い",
    graduation_year: 27,
    target_industries: ["総合コンサル", "外資コンサル"],
    target_companies: ["アクセンチュア", "デロイト", "アビームコンサルティング"],
    university_name: null,
    bio: "BQ面接が苦手。STARメソッドを一緒に磨きたい。",
    is_verified_student: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function createDemoSlots(requestId: string, baseDays: number[]): PracticeRequestSlot[] {
  const now = new Date();
  return baseDays.map((d, i) => {
    const day = addDays(now, d);
    const start = new Date(day);
    start.setHours(14 + i, 0, 0, 0);
    const end = new Date(day);
    end.setHours(18, 0, 0, 0);
    return {
      id: `slot-${requestId}-${i}`,
      request_id: requestId,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      sort_order: i,
      created_at: now.toISOString(),
    };
  });
}

function createDemoRequests(): PracticeRequest[] {
  const now = new Date();
  const requests: PracticeRequest[] = [
    {
      id: "10000000-0000-0000-0000-000000000001",
      user_id: DEMO_PROFILES[1].id,
      title: "BCGケース面接 本選考前の壁打ち",
      target_company: "BCG",
      target_role: "アソシエイト",
      interview_stage: "case",
      practice_type: "case",
      description: "BCG本選考が2週間後です。ケースの構造化→打ち手の練習を重点的にやりたい。レベル感は問いません、お互い成長しましょう。",
      duration_minutes: 60,
      status: "open",
      created_at: addHours(now, -2).toISOString(),
      updated_at: addHours(now, -2).toISOString(),
      profiles: DEMO_PROFILES[1],
      practice_request_slots: createDemoSlots("10000000-0000-0000-0000-000000000001", [2, 3]),
    },
    {
      id: "10000000-0000-0000-0000-000000000002",
      user_id: DEMO_PROFILES[2].id,
      title: "デロイト 最終面接 志望動機の深掘り対策",
      target_company: "デロイト",
      target_role: "コンサルタント",
      interview_stage: "final",
      practice_type: "motivation",
      description: "最終面接が来週です。「なぜデロイトか」を深掘りされても詰まらないように練習したい。壁打ち相手を募集します。",
      duration_minutes: 45,
      status: "open",
      created_at: addHours(now, -5).toISOString(),
      updated_at: addHours(now, -5).toISOString(),
      profiles: DEMO_PROFILES[2],
      practice_request_slots: createDemoSlots("10000000-0000-0000-0000-000000000002", [1, 2, 4]),
    },
    {
      id: "10000000-0000-0000-0000-000000000003",
      user_id: DEMO_PROFILES[3].id,
      title: "アクセンチュア BQ面接対策（ガクチカ深掘り）",
      target_company: "アクセンチュア",
      target_role: "ビジネスコンサルタント",
      interview_stage: "second",
      practice_type: "behavioral",
      description: "STARメソッドで回答する練習をしたいです。面接官役と候補者役を交代でやりましょう。",
      duration_minutes: 45,
      status: "open",
      created_at: addHours(now, -8).toISOString(),
      updated_at: addHours(now, -8).toISOString(),
      profiles: DEMO_PROFILES[3],
      practice_request_slots: createDemoSlots("10000000-0000-0000-0000-000000000003", [3, 5]),
    },
    {
      id: "10000000-0000-0000-0000-000000000004",
      user_id: DEMO_PROFILES[1].id,
      title: "マッキンゼー PST＋ケース 本番形式で練習",
      target_company: "マッキンゼー",
      target_role: "ビジネスアナリスト",
      interview_stage: "first",
      practice_type: "case",
      description: "本番と同じ時間配分でケースを回したい。30分ケース→10分FBを交代で。",
      duration_minutes: 90,
      status: "open",
      created_at: addHours(now, -12).toISOString(),
      updated_at: addHours(now, -12).toISOString(),
      profiles: DEMO_PROFILES[1],
      practice_request_slots: createDemoSlots("10000000-0000-0000-0000-000000000004", [4, 6, 7]),
    },
    {
      id: "10000000-0000-0000-0000-000000000005",
      user_id: DEMO_PROFILES[2].id,
      title: "PwC 最終面接の通し練習",
      target_company: "PwC",
      target_role: null,
      interview_stage: "final",
      practice_type: "final_round",
      description: "志望動機・ガクチカ・逆質問まで通しで練習したい方を募集。Big4志望の方歓迎。",
      duration_minutes: 60,
      status: "open",
      created_at: addHours(now, -24).toISOString(),
      updated_at: addHours(now, -24).toISOString(),
      profiles: DEMO_PROFILES[2],
      practice_request_slots: createDemoSlots("10000000-0000-0000-0000-000000000005", [5, 6]),
    },
  ];
  return requests;
}

function createDemoSessions(): Session[] {
  const now = new Date();
  const startTime = addDays(now, 1);
  startTime.setHours(15, 0, 0, 0);
  return [
    {
      id: "20000000-0000-0000-0000-000000000001",
      request_id: "10000000-0000-0000-0000-000000000099",
      host_user_id: DEMO_PROFILE.id,
      guest_user_id: DEMO_PROFILES[1].id,
      chosen_slot_id: null,
      starts_at: startTime.toISOString(),
      duration_minutes: 60,
      status: "scheduled",
      meeting_status: "ready",
      meeting_provider: "google_meet",
      calendar_event_id: null,
      meet_url: "https://meet.google.com/demo-link",
      completed_by: null,
      completed_at: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      practice_requests: {
        id: "10000000-0000-0000-0000-000000000099",
        user_id: DEMO_PROFILE.id,
        title: "EY ケース面接練習",
        target_company: "EY",
        target_role: "コンサルタント",
        interview_stage: "case",
        practice_type: "case",
        description: null,
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

function createDemoMessages(): SessionMessage[] {
  const now = new Date();
  return [
    {
      id: "msg-001",
      session_id: "20000000-0000-0000-0000-000000000001",
      sender_id: DEMO_PROFILES[1].id,
      content: "マッチングありがとうございます！明日の15時でお願いします。ケースのお題は当日出し合いましょう。",
      created_at: addHours(now, -3).toISOString(),
      profiles: DEMO_PROFILES[1],
    },
    {
      id: "msg-002",
      session_id: "20000000-0000-0000-0000-000000000001",
      sender_id: DEMO_PROFILE.id,
      content: "こちらこそよろしくお願いします！了解です。30分ずつ交代で面接官役やりましょう。",
      created_at: addHours(now, -2).toISOString(),
      profiles: DEMO_PROFILE,
    },
    {
      id: "msg-003",
      session_id: "20000000-0000-0000-0000-000000000001",
      sender_id: DEMO_PROFILES[1].id,
      content: "いいですね！Meetのリンクから入ればOKですか？",
      created_at: addHours(now, -1).toISOString(),
      profiles: DEMO_PROFILES[1],
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
    .select("*, profiles(*), practice_request_slots(*)")
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
    .select("*, profiles(*), practice_request_slots(*)")
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

export async function getSessionMessages(sessionId: string) {
  if (await isDemoMode()) {
    return createDemoMessages().filter((m) => m.session_id === sessionId);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_messages")
    .select("*, profiles(*)")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as SessionMessage[];
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
    .select("*, profiles(*), practice_request_slots(*)")
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
