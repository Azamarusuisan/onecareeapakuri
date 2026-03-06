export type PracticeType =
  | "general"
  | "case"
  | "motivation"
  | "behavioral"
  | "final_round";

export type PracticeRequestStatus = "open" | "matched" | "cancelled" | "expired";

export type PracticeApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type SessionStatus = "scheduled" | "completed" | "cancelled";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  graduation_year: number;
  target_industries: string[];
  target_companies: string[];
  university_name: string | null;
  bio: string | null;
  is_verified_student: boolean;
  created_at: string;
  updated_at: string;
}

export interface PracticeRequest {
  id: string;
  user_id: string;
  title: string;
  target_company: string;
  target_role: string | null;
  interview_stage: string;
  practice_type: PracticeType;
  description: string | null;
  preferred_start_at: string;
  preferred_end_at: string;
  duration_minutes: number;
  status: PracticeRequestStatus;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface PracticeApplication {
  id: string;
  request_id: string;
  applicant_id: string;
  message: string | null;
  status: PracticeApplicationStatus;
  created_at: string;
  profiles?: Profile;
}

export interface Session {
  id: string;
  request_id: string;
  host_user_id: string;
  guest_user_id: string;
  starts_at: string;
  ends_at: string;
  status: SessionStatus;
  calendar_event_id: string | null;
  meet_url: string | null;
  created_at: string;
  updated_at: string;
  practice_requests?: PracticeRequest;
  host_profile?: Profile;
  guest_profile?: Profile;
}

export interface SessionReview {
  id: string;
  session_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: Profile;
}

export const PRACTICE_TYPE_LABELS: Record<PracticeType, string> = {
  general: "一般面接",
  case: "ケース面接",
  motivation: "志望動機",
  behavioral: "行動面接",
  final_round: "最終面接",
};

export const INTERVIEW_STAGES = [
  { value: "es", label: "ES・書類" },
  { value: "first", label: "一次面接" },
  { value: "second", label: "二次面接" },
  { value: "third", label: "三次面接" },
  { value: "final", label: "最終面接" },
  { value: "case", label: "ケース面接" },
  { value: "gd", label: "GD" },
  { value: "other", label: "その他" },
];

export const TARGET_INDUSTRIES = [
  "外資コンサル",
  "日系コンサル",
  "外資金融",
  "総合商社",
  "デベロッパー",
  "メガベンチャー",
  "IT・通信",
  "広告・メディア",
  "メーカー",
  "インフラ",
  "金融・保険",
  "官公庁・公務員",
  "その他",
];

export const TARGET_COMPANIES_SUGGESTIONS = [
  "マッキンゼー",
  "BCG",
  "ベイン",
  "デロイト",
  "PwC",
  "EY",
  "KPMG",
  "アクセンチュア",
  "ゴールドマン・サックス",
  "モルガン・スタンレー",
  "三菱商事",
  "三井物産",
  "伊藤忠商事",
  "住友商事",
  "丸紅",
  "三菱地所",
  "三井不動産",
  "リクルート",
  "サイバーエージェント",
  "メルカリ",
  "LINE",
  "楽天",
  "ソニー",
  "トヨタ",
  "Google",
  "Amazon",
  "Microsoft",
  "Apple",
];
