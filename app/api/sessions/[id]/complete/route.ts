import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/utils/demo";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (await isDemoMode()) {
      return NextResponse.json({ success: true });
    }

    const { id: sessionId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { data: session } = await supabase.from("sessions").select("*").eq("id", sessionId).single();
    if (!session) return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
    if (session.host_user_id !== user.id && session.guest_user_id !== user.id) return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    if (session.status !== "scheduled") return NextResponse.json({ error: "既に完了しています" }, { status: 400 });

    const { error } = await supabase.from("sessions").update({ status: "completed" }).eq("id", sessionId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
