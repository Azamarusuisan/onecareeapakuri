import { z } from "zod";

export const createSessionReviewSchema = z.object({
  session_id: z.string().uuid("不正なセッションIDです"),
  reviewee_id: z.string().uuid("不正なユーザーIDです"),
  rating: z
    .number()
    .int()
    .min(1, "評価は1以上にしてください")
    .max(5, "評価は5以下にしてください"),
  comment: z
    .string()
    .max(1000, "コメントは1000文字以内で入力してください")
    .nullable()
    .optional(),
});

export const createReportSchema = z.object({
  target_type: z.enum(["user", "practice_request", "review"], {
    error: "通報対象の種類を選択してください",
  }),
  target_id: z.string().uuid("不正な対象IDです"),
  reason: z
    .string()
    .min(1, "通報理由を入力してください")
    .max(1000, "通報理由は1000文字以内で入力してください"),
});

export type CreateSessionReviewInput = z.infer<typeof createSessionReviewSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
