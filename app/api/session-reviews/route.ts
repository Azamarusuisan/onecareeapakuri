import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSessionReviewSchema } from "@/lib/validations/review";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createSessionReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容に問題があります" },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const { data: session } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", parsed.data.session_id)
      .single();

    if (!session) {
      return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
    }

    if (session.host_user_id !== user.id && session.guest_user_id !== user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    if (session.status !== "completed") {
      return NextResponse.json(
        { error: "完了したセッションのみレビューできます" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("session_reviews")
      .insert({
        session_id: parsed.data.session_id,
        reviewer_id: user.id,
        reviewee_id: parsed.data.reviewee_id,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "既にレビュー済みです" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
