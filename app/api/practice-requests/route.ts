import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPracticeRequestSchema } from "@/lib/validations/practice";

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
    const parsed = createPracticeRequestSchema.safeParse(body);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]?.toString();
        if (field) fieldErrors[field] = issue.message;
      }
      return NextResponse.json({ error: "入力内容に問題があります", fieldErrors }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("practice_requests")
      .insert({
        user_id: user.id,
        title: parsed.data.title,
        target_company: parsed.data.target_company,
        target_role: parsed.data.target_role ?? null,
        interview_stage: parsed.data.interview_stage,
        practice_type: parsed.data.practice_type,
        description: parsed.data.description ?? null,
        preferred_start_at: parsed.data.preferred_start_at,
        preferred_end_at: parsed.data.preferred_end_at,
        duration_minutes: parsed.data.duration_minutes,
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
