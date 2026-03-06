import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createPracticeRequestSchema } from "@/lib/validations/practice";
import { isDemoMode } from "@/lib/utils/demo";

export async function POST(request: Request) {
  try {
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

    if (await isDemoMode()) {
      const slots = parsed.data.slots.map((s, i) => ({
        id: crypto.randomUUID(),
        request_id: "demo",
        start_at: s.start_at,
        end_at: s.end_at,
        sort_order: i,
        created_at: new Date().toISOString(),
      }));
      return NextResponse.json({
        id: crypto.randomUUID(),
        ...parsed.data,
        user_id: "00000000-0000-0000-0000-000000000000",
        status: "open",
        practice_request_slots: slots,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { status: 201 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "認証が必要です" }, { status: 401 });

    const { slots, ...requestData } = parsed.data;

    const { data, error } = await supabase
      .from("practice_requests")
      .insert({
        user_id: user.id,
        ...requestData,
        target_role: requestData.target_role ?? null,
        description: requestData.description ?? null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Insert slots
    const slotRows = slots.map((s, i) => ({
      request_id: data.id,
      start_at: s.start_at,
      end_at: s.end_at,
      sort_order: i,
    }));

    const { error: slotError } = await supabase
      .from("practice_request_slots")
      .insert(slotRows);

    if (slotError) {
      console.error("Slot insert error:", slotError);
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
