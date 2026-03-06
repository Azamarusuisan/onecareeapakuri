import { z } from "zod";

export const practiceTypeSchema = z.enum([
  "general",
  "case",
  "motivation",
  "behavioral",
  "final_round",
]);

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
  preferred_start_at: z.string().min(1, "希望開始日時を入力してください"),
  preferred_end_at: z.string().min(1, "希望終了日時を入力してください"),
  duration_minutes: z
    .number()
    .int()
    .min(15, "所要時間は15分以上にしてください")
    .max(180, "所要時間は180分以内にしてください"),
});

export const createPracticeApplicationSchema = z.object({
  request_id: z.string().uuid("不正なリクエストIDです"),
  message: z
    .string()
    .max(500, "メッセージは500文字以内で入力してください")
    .nullable()
    .optional(),
});

export const acceptPracticeApplicationSchema = z.object({
  application_id: z.string().uuid("不正な応募IDです"),
});

export type CreatePracticeRequestInput = z.infer<typeof createPracticeRequestSchema>;
export type CreatePracticeApplicationInput = z.infer<typeof createPracticeApplicationSchema>;
