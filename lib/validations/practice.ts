import { z } from "zod";

export const practiceTypeSchema = z.enum([
  "case",
  "motivation",
  "behavioral",
  "final_round",
]);

const slotSchema = z.object({
  start_at: z.string().min(1, "開始日時を入力してください"),
  end_at: z.string().min(1, "終了日時を入力してください"),
});

export const createPracticeRequestSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルを入力してください")
    .max(100, "タイトルは100文字以内で入力してください"),
  target_company: z
    .string()
    .min(1, "対象企業を入力してください")
    .max(50, "企業名は50文字以内で入力してください"),
  target_role: z
    .string()
    .max(50, "職種は50文字以内で入力してください")
    .nullable()
    .optional(),
  interview_stage: z.string().min(1, "面接ステージを選択してください"),
  practice_type: practiceTypeSchema,
  description: z
    .string()
    .max(1000, "詳細説明は1000文字以内で入力してください")
    .nullable()
    .optional(),
  duration_minutes: z
    .number()
    .int()
    .min(15, "所要時間は15分以上にしてください")
    .max(180, "所要時間は180分以内にしてください"),
  slots: z
    .array(slotSchema)
    .min(1, "候補日時を1つ以上追加してください")
    .max(5, "候補日時は5つまでです"),
});

export const createPracticeApplicationSchema = z.object({
  request_id: z.string().uuid("不正なリクエストIDです"),
  message: z
    .string()
    .max(500, "メッセージは500文字以内で入力してください")
    .nullable()
    .optional(),
  selected_slot_ids: z
    .array(z.string().uuid())
    .min(1, "参加可能な日時を1つ以上選択してください"),
});

export const acceptPracticeApplicationSchema = z.object({
  application_id: z.string().uuid("不正な応募IDです"),
  slot_id: z.string().uuid("日時を選択してください"),
});

export type CreatePracticeRequestInput = z.infer<typeof createPracticeRequestSchema>;
export type CreatePracticeApplicationInput = z.infer<typeof createPracticeApplicationSchema>;
