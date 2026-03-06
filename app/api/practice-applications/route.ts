import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPracticeApplicationSchema } from "@/lib/validations/practice";
import { isDemoMode } from "@/lib/utils/demo";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createPracticeApplicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "入力内容に問題があります" }, { status: 400 });
    }

    if (await isDemoMode()) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        request_id: parsed.data.request_id,
        applicant_id: "00000000-0000-0000-0000-000000000000",
        message: parsed.data.message ?? null,
        selected_slot_ids: parsed.data.selected_slot_ids,
        status: "pending",
        created_at: new Date().toISOString(),
      }, { status: 201 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { data: practiceRequest } = await supabase
      .from("practice_requests").select("id, user_id, status").eq("id", parsed.data.request_id).single();
    if (!practiceRequest) return NextResponse.json({ error: "募集が見つかりません" }, { status: 404 });
    if (practiceRequest.status !== "open") return NextResponse.json({ error: "この募集は受付終了しています" }, { status: 400 });
    if (practiceRequest.user_id === user.id) return NextResponse.json({ error: "自分の募集には応募できません" }, { status: 400 });

    const { data, error } = await supabase
      .from("practice_applications")
      .insert({
        request_id: parsed.data.request_id,
        applicant_id: user.id,
        message: parsed.data.message ?? null,
        selected_slot_ids: parsed.data.selected_slot_ids,
      })
      .select().single();

    if (error) {
      if (error.code === "23505") return NextResponse.json({ error: "既に応募済みです" }, { status: 400 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
