import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { createMeetSession } from "@/lib/google/calendar";
import { addMinutes } from "date-fns";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // Get the application
    const { data: application } = await supabase
      .from("practice_applications")
      .select("*, practice_requests(*)")
      .eq("id", applicationId)
      .single();

    if (!application) {
      return NextResponse.json({ error: "応募が見つかりません" }, { status: 404 });
    }

    const practiceRequest = application.practice_requests;

    // Verify the current user is the request owner
    if (practiceRequest.user_id !== user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    if (practiceRequest.status !== "open") {
      return NextResponse.json({ error: "この募集は受付終了しています" }, { status: 400 });
    }

    if (application.status !== "pending") {
      return NextResponse.json({ error: "この応募は処理済みです" }, { status: 400 });
    }

    // Use service client for operations that need to bypass RLS
    const serviceClient = await createServiceClient();

    const startAt = practiceRequest.preferred_start_at;
    const endAt = addMinutes(
      new Date(startAt),
      practiceRequest.duration_minutes
    ).toISOString();

    // Create Google Meet session
    let meetResult = { eventId: "", meetUrl: null as string | null };
    try {
      meetResult = await createMeetSession({
        summary: `面接練習: ${practiceRequest.title}`,
        description: `対象企業: ${practiceRequest.target_company}\n練習タイプ: ${practiceRequest.practice_type}`,
        start: startAt,
        end: endAt,
      });
    } catch (err) {
      console.error("Google Calendar API error:", err);
      // Continue without Meet - users can arrange their own
    }

    // Create session
    const { data: session, error: sessionError } = await serviceClient
      .from("sessions")
      .insert({
        request_id: practiceRequest.id,
        host_user_id: practiceRequest.user_id,
        guest_user_id: application.applicant_id,
        starts_at: startAt,
        ends_at: endAt,
        calendar_event_id: meetResult.eventId || null,
        meet_url: meetResult.meetUrl || null,
      })
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    // Update practice request status
    await serviceClient
      .from("practice_requests")
      .update({ status: "matched" })
      .eq("id", practiceRequest.id);

    // Accept this application
    await serviceClient
      .from("practice_applications")
      .update({ status: "accepted" })
      .eq("id", applicationId);

    // Reject other pending applications
    await serviceClient
      .from("practice_applications")
      .update({ status: "rejected" })
      .eq("request_id", practiceRequest.id)
      .eq("status", "pending")
      .neq("id", applicationId);

    return NextResponse.json(session, { status: 200 });
  } catch (err) {
    console.error("Accept application error:", err);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
