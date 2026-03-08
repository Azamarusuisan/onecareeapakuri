import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createMeetSession } from "@/lib/google/calendar";
import { addMinutes } from "date-fns";
import { isDemoMode } from "@/lib/utils/demo";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const body = await request.json().catch(() => ({}));
    const slotId = body.slot_id as string | undefined;

    if (await isDemoMode()) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        request_id: "demo",
        host_user_id: "00000000-0000-0000-0000-000000000000",
        guest_user_id: "00000000-0000-0000-0000-000000000001",
        chosen_slot_id: slotId ?? null,
        starts_at: new Date().toISOString(),
        duration_minutes: 60,
        status: "scheduled",
        meeting_status: "ready",
        meeting_provider: "google_meet",
        calendar_event_id: null,
        meet_url: "https://meet.google.com/demo-link",
        completed_by: null,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { status: 200 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { data: application } = await supabase
      .from("practice_applications").select("*, practice_requests(*)").eq("id", applicationId).single();
    if (!application) return NextResponse.json({ error: "応募が見つかりません" }, { status: 404 });

    const practiceRequest = application.practice_requests;
    if (practiceRequest.user_id !== user.id) return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    if (practiceRequest.status !== "open") return NextResponse.json({ error: "この募集は受付終了しています" }, { status: 400 });
    if (application.status !== "pending") return NextResponse.json({ error: "この応募は処理済みです" }, { status: 400 });

    if (!slotId) return NextResponse.json({ error: "日時を選択してください" }, { status: 400 });

    const serviceClient = await createServiceClient();

    // Verify slot exists and belongs to this request
    const { data: slot } = await serviceClient
      .from("practice_request_slots").select("*").eq("id", slotId).eq("request_id", practiceRequest.id).single();
    if (!slot) return NextResponse.json({ error: "無効な日時です" }, { status: 400 });

    // Check no session already exists (unique on request_id)
    const { data: existingSession } = await serviceClient
      .from("sessions").select("id").eq("request_id", practiceRequest.id).maybeSingle();
    if (existingSession) return NextResponse.json({ error: "この募集は既にマッチ済みです" }, { status: 400 });

    const startAt = slot.start_at;
    const endAt = addMinutes(new Date(startAt), practiceRequest.duration_minutes).toISOString();

    // Step 1: Create session with meeting_status = pending
    const { data: session, error: sessionError } = await serviceClient
      .from("sessions")
      .insert({
        request_id: practiceRequest.id,
        host_user_id: practiceRequest.user_id,
        guest_user_id: application.applicant_id,
        chosen_slot_id: slotId,
        starts_at: startAt,
        duration_minutes: practiceRequest.duration_minutes,
        meeting_status: "pending",
        meeting_provider: "google_meet",
      })
      .select().single();

    if (sessionError) {
      if (sessionError.code === "23505") {
        return NextResponse.json({ error: "この募集は既にマッチ済みです" }, { status: 400 });
      }
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    // Step 2: Try to create Google Meet using the host's OAuth token
    let meetUrl: string | null = null;
    let calendarEventId: string | null = null;
    let meetingStatus: "ready" | "failed" = "failed";

    try {
      const meetInput = {
        summary: `面接練習: ${practiceRequest.title}`,
        description: `対象企業: ${practiceRequest.target_company}`,
        start: startAt,
        end: endAt,
      };

      // Prefer the host's own Google OAuth token (requires calendar scope at login)
      const { data: { session: hostSession } } = await supabase.auth.getSession();
      const providerToken = hostSession?.provider_token;

      if (providerToken) {
        const { createMeetSessionWithToken } = await import("@/lib/google/calendar");
        const meetResult = await createMeetSessionWithToken(providerToken, meetInput);
        meetUrl = meetResult.meetUrl;
        calendarEventId = meetResult.eventId || null;
        meetingStatus = "ready";
      } else {
        // Fallback: service account
        const meetResult = await createMeetSession(meetInput);
        meetUrl = meetResult.meetUrl;
        calendarEventId = meetResult.eventId || null;
        meetingStatus = "ready";
      }
    } catch (err) {
      console.error("Google Calendar API error:", err);
    }

    // Step 3: Update session with meet info
    await serviceClient
      .from("sessions")
      .update({
        meet_url: meetUrl,
        calendar_event_id: calendarEventId,
        meeting_status: meetingStatus,
      })
      .eq("id", session.id);

    // Step 4: Update statuses
    await serviceClient.from("practice_requests").update({ status: "matched" }).eq("id", practiceRequest.id);
    await serviceClient.from("practice_applications").update({ status: "accepted" }).eq("id", applicationId);
    await serviceClient.from("practice_applications").update({ status: "rejected" }).eq("request_id", practiceRequest.id).eq("status", "pending").neq("id", applicationId);

    return NextResponse.json({ ...session, meet_url: meetUrl, meeting_status: meetingStatus }, { status: 200 });
  } catch (err) {
    console.error("Accept error:", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
