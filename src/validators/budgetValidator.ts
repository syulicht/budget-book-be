import { z } from "zod";
import type { CreateBudgetInput } from "../services/budgetService.js";

type ValidationResult =
  | { ok: true; value: CreateBudgetInput }
  | { ok: false; message: string };

const createBudgetSchema = z.object({
  date: z
    .string({ message: "`budget.date` must be a string" })
    .refine((value) => !Number.isNaN(new Date(value).getTime()), {
      message: "`budget.date` must be a valid date string",
    })
    .transform((value) => new Date(value)),
  amount: z
    .number({ message: "`budget.amount` must be a non-zero integer" })
    .int({ message: "`budget.amount` must be a non-zero integer" })
    .refine((value) => value !== 0, {
      message: "`budget.amount` must be a non-zero integer",
    }),
  memo: z.string({ message: "`budget.memo` must be a string" }),
  categoryId: z
    .number({ message: "`budget.categoryId` must be a positive integer" })
    .int({ message: "`budget.categoryId` must be a positive integer" })
    .positive({ message: "`budget.categoryId` must be a positive integer" }),
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const validateCreateBudgetRequest = (
  body: unknown
): ValidationResult => {
  if (!isRecord(body)) {
    return { ok: false, message: "Request body must be an object" };
  }

  if (!isRecord(body.budget)) {
    return { ok: false, message: "`budget` is required" };
  }

  const parsed = createBudgetSchema.safeParse(body.budget);
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Invalid budget request",
    };
  }

  return {
    ok: true,
    value: parsed.data,
  };
};
