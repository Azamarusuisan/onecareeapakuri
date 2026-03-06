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

    if (await isDemoMode()) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        request_id: "demo",
        host_user_id: "00000000-0000-0000-0000-000000000000",
        guest_user_id: "00000000-0000-0000-0000-000000000001",
        starts_at: new Date().toISOString(),
        ends_at: addMinutes(new Date(), 60).toISOString(),
        status: "scheduled",
        calendar_event_id: null,
        meet_url: "https://meet.google.com/demo-link",
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

    const serviceClient = await createServiceClient();
    const startAt = practiceRequest.preferred_start_at;
    const endAt = addMinutes(new Date(startAt), practiceRequest.duration_minutes).toISOString();

    let meetResult = { eventId: "", meetUrl: null as string | null };
    try {
      meetResult = await createMeetSession({
        summary: `面接練習: ${practiceRequest.title}`,
        description: `対象企業: ${practiceRequest.target_company}`,
        start: startAt, end: endAt,
      });
    } catch (err) { console.error("Google Calendar API error:", err); }

    const { data: session, error: sessionError } = await serviceClient
      .from("sessions")
      .insert({ request_id: practiceRequest.id, host_user_id: practiceRequest.user_id, guest_user_id: application.applicant_id, starts_at: startAt, ends_at: endAt, calendar_event_id: meetResult.eventId || null, meet_url: meetResult.meetUrl || null })
      .select().single();
    if (sessionError) return NextResponse.json({ error: sessionError.message }, { status: 500 });

    await serviceClient.from("practice_requests").update({ status: "matched" }).eq("id", practiceRequest.id);
    await serviceClient.from("practice_applications").update({ status: "accepted" }).eq("id", applicationId);
    await serviceClient.from("practice_applications").update({ status: "rejected" }).eq("request_id", practiceRequest.id).eq("status", "pending").neq("id", applicationId);

    return NextResponse.json(session, { status: 200 });
  } catch (err) {
    console.error("Accept error:", err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
