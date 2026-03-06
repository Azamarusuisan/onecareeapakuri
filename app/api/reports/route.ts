import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createReportSchema } from "@/lib/validations/review";

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
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "入力内容に問題があります" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("reports")
      .insert({
        reporter_id: user.id,
        target_type: parsed.data.target_type,
        target_id: parsed.data.target_id,
        reason: parsed.data.reason,
      })
      .select()
      .single();

    if (error) {
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
