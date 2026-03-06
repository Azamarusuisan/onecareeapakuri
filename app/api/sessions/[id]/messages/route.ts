import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/utils/demo";
import { z } from "zod";

const messageSchema = z.object({
  content: z.string().min(1, "メッセージを入力してください").max(1000, "メッセージは1000文字以内です"),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;

    if (await isDemoMode()) {
      const { getSessionMessages } = await import("@/lib/db/queries");
      const messages = await getSessionMessages(sessionId);
      return NextResponse.json(messages);
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    // Verify participant
    const { data: session } = await supabase.from("sessions").select("host_user_id, guest_user_id").eq("id", sessionId).single();
    if (!session) return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
    if (session.host_user_id !== user.id && session.guest_user_id !== user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("session_messages")
      .select("*, profiles(*)")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "入力エラー" }, { status: 400 });
    }

    if (await isDemoMode()) {
      return NextResponse.json({
        id: crypto.randomUUID(),
        session_id: sessionId,
        sender_id: "00000000-0000-0000-0000-000000000000",
        content: parsed.data.content,
        created_at: new Date().toISOString(),
        profiles: {
          id: "00000000-0000-0000-0000-000000000000",
          display_name: "ケース特訓中",
        },
      }, { status: 201 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    // Verify participant
    const { data: session } = await supabase.from("sessions").select("host_user_id, guest_user_id").eq("id", sessionId).single();
    if (!session) return NextResponse.json({ error: "セッションが見つかりません" }, { status: 404 });
    if (session.host_user_id !== user.id && session.guest_user_id !== user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("session_messages")
      .insert({
        session_id: sessionId,
        sender_id: user.id,
        content: parsed.data.content,
      })
      .select("*, profiles(*)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
