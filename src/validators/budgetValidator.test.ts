import { describe, expect, it } from "vitest";
import { validateCreateBudgetRequest } from "./budgetValidator.js";

describe("budgetValidator", () => {
  it("正常な登録リクエストをパースする", () => {
    const result = validateCreateBudgetRequest({
      budget: {
        date: "2026-02-24T00:00:00.000Z",
        amount: 12000,
        memo: "salary",
        categoryId: 1,
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        date: new Date("2026-02-24T00:00:00.000Z"),
        amount: 12000,
        memo: "salary",
        categoryId: 1,
      });
    }
  });

  it("bodyがオブジェクトでない場合はエラーを返す", () => {
    const result = validateCreateBudgetRequest(null);

    expect(result).toEqual({
      ok: false,
      message: "Request body must be an object",
    });
  });

  it("budgetキーがない場合はエラーを返す", () => {
    const result = validateCreateBudgetRequest({});

    expect(result).toEqual({
      ok: false,
      message: "`budget` is required",
    });
  });

  it("amountが0の場合はエラーを返す", () => {
    const result = validateCreateBudgetRequest({
      budget: {
        date: "2026-02-24T00:00:00.000Z",
        amount: 0,
        memo: "invalid",
        categoryId: 1,
      },
    });

    expect(result).toEqual({
      ok: false,
      message: "`budget.amount` must be a non-zero integer",
    });
  });
});
