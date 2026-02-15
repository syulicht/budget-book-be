import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBudgetList, toBudgetListResponse } from "./budgetService.js";
import * as budgetRepository from "../repositories/budgetRepository.js";
import type { BudgetRecord } from "../repositories/budgetRepository.js";

vi.mock("../repositories/budgetRepository.js", () => ({
  findBudgets: vi.fn(),
}));

describe("budgetService", () => {
  const findBudgetsMock = vi.mocked(budgetRepository.findBudgets);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("レコードをAPIレスポンス形式に変換する", () => {
    const records: BudgetRecord[] = [
      {
        id: 2,
        date: new Date("2026-02-10T00:00:00.000Z"),
        budget: {
          amount: 12000,
          memo: "cafe and snacks",
          category: {
            id: 1,
            name: "Food",
          },
        },
      },
    ];

    const response = toBudgetListResponse(records);

    expect(response).toEqual({
      budgets: [
        {
          id: 2,
          date: new Date("2026-02-10T00:00:00.000Z"),
          category: {
            id: 1,
            name: "Food",
          },
          amount: 12000,
          memo: "cafe and snacks",
        },
      ],
    });
  });

  it("レコードが空配列の場合はbudgetsも空配列で返す", () => {
    expect(toBudgetListResponse([])).toEqual({ budgets: [] });
  });

  it("repositoryの取得結果を変換して返す", async () => {
    findBudgetsMock.mockResolvedValue([
      {
        id: 1,
        date: new Date("2026-02-01T00:00:00.000Z"),
        budget: {
          amount: 30000,
          memo: "monthly food budget",
          category: {
            id: 10,
            name: "Food",
          },
        },
      },
    ]);

    const response = await getBudgetList();

    expect(findBudgetsMock).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
      budgets: [
        {
          id: 1,
          date: new Date("2026-02-01T00:00:00.000Z"),
          category: {
            id: 10,
            name: "Food",
          },
          amount: 30000,
          memo: "monthly food budget",
        },
      ],
    });
  });
});
