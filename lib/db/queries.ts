import { createClient } from "@/lib/supabase/server";
import type {
  PracticeRequest,
  PracticeApplication,
  Session,
  SessionReview,
  Profile,
} from "@/lib/types";

export async function getPracticeRequests(filters?: {
  practice_type?: string;
  search?: string;
}) {
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_reviews")
    .select("*, profiles(*)")
    .eq("session_id", sessionId);

  if (error) throw error;
  return (data ?? []) as SessionReview[];
}

export async function getUserProfile(userId: string) {
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
