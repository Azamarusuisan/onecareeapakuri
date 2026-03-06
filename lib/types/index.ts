export type PracticeType =
  | "case"
  | "motivation"
  | "behavioral"
  | "final_round";

export type PracticeRequestStatus = "open" | "matched" | "cancelled" | "expired";

export type PracticeApplicationStatus = "pending" | "accepted" | "rejected" | "withdrawn";

export type SessionStatus = "scheduled" | "completed" | "cancelled";

export type MeetingStatus = "pending" | "ready" | "failed";

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

export interface PracticeRequestSlot {
  id: string;
  request_id: string;
  start_at: string;
  end_at: string;
  sort_order: number;
  created_at: string;
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
  duration_minutes: number;
  status: PracticeRequestStatus;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  practice_request_slots?: PracticeRequestSlot[];
}

export interface PracticeApplication {
  id: string;
  request_id: string;
  applicant_id: string;
  message: string | null;
  selected_slot_ids: string[];
  status: PracticeApplicationStatus;
  created_at: string;
  profiles?: Profile;
}

export interface Session {
  id: string;
  request_id: string;
  host_user_id: string;
  guest_user_id: string;
  chosen_slot_id: string | null;
  starts_at: string;
  duration_minutes: number;
  status: SessionStatus;
  meeting_status: MeetingStatus;
  meeting_provider: string;
  calendar_event_id: string | null;
  meet_url: string | null;
  completed_by: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  practice_requests?: PracticeRequest;
  host_profile?: Profile;
  guest_profile?: Profile;
}

export interface SessionMessage {
  id: string;
  session_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  profiles?: Profile;
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
  case: "ケース面接",
  motivation: "志望動機深掘り",
  behavioral: "ガクチカ・BQ",
  final_round: "最終面接",
};

export const INTERVIEW_STAGES = [
  { value: "first", label: "一次面接" },
  { value: "second", label: "二次面接" },
  { value: "third", label: "三次面接" },
  { value: "final", label: "最終面接" },
  { value: "case", label: "ケース面接" },
  { value: "job_talk", label: "ジョブ選考" },
  { value: "other", label: "その他" },
];

export const TARGET_INDUSTRIES = [
  "戦略コンサル",
  "総合コンサル",
  "Big4",
  "外資コンサル",
  "日系コンサル",
  "外資金融",
  "総合商社",
  "デベロッパー",
  "メガベンチャー",
  "IT・通信",
  "メーカー",
  "金融・保険",
  "その他",
];

export const TARGET_COMPANIES_SUGGESTIONS = [
  "マッキンゼー",
  "BCG",
  "ベイン",
  "A.T.カーニー",
  "ローランド・ベルガー",
  "Strategy&",
  "デロイト",
  "PwC",
  "EY",
  "KPMG",
  "アクセンチュア",
  "アビームコンサルティング",
  "野村総合研究所",
  "ドリームインキュベータ",
  "経営共創基盤",
  "ゴールドマン・サックス",
  "モルガン・スタンレー",
  "J.P.モルガン",
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
  "Google",
  "Amazon",
  "Microsoft",
];
