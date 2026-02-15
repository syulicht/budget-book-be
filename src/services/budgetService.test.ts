import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createBudget,
  getBudgetList,
  toBudgetListResponse,
} from "./budgetService.js";
import * as budgetRepository from "../repositories/budgetRepository.js";
import type { BudgetRecord } from "../repositories/budgetRepository.js";

vi.mock("../repositories/budgetRepository.js", () => ({
  findBudgets: vi.fn(),
  findCategoryById: vi.fn(),
  createBudgetWithBaseInTx: vi.fn(),
}));

describe("budgetService", () => {
  const findBudgetsMock = vi.mocked(budgetRepository.findBudgets);
  const findCategoryByIdMock = vi.mocked(budgetRepository.findCategoryById);
  const createBudgetWithBaseInTxMock = vi.mocked(
    budgetRepository.createBudgetWithBaseInTx
  );

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

  it("登録成功時はINCOMEで整形して返す", async () => {
    findCategoryByIdMock.mockResolvedValue({ id: 1 });
    createBudgetWithBaseInTxMock.mockResolvedValue({
      budgetBase: {
        id: 10,
        category_id: 1,
        amount: 5000,
        memo: "salary",
      },
      budget: {
        id: 20,
        user_id: 0,
        date: new Date("2026-02-20T00:00:00.000Z"),
        created_at: new Date("2026-02-20T00:00:00.000Z"),
        updated_at: new Date("2026-02-20T00:00:00.000Z"),
      },
    });

    const response = await createBudget({
      date: new Date("2026-02-20T00:00:00.000Z"),
      amount: 5000,
      memo: "salary",
      categoryId: 1,
    });

    expect(findCategoryByIdMock).toHaveBeenCalledWith(1);
    expect(createBudgetWithBaseInTxMock).toHaveBeenCalledWith({
      categoryId: 1,
      amount: 5000,
      memo: "salary",
      date: new Date("2026-02-20T00:00:00.000Z"),
      userId: 0,
    });
    expect(response.type).toBe("INCOME");
    expect(response).toMatchObject({
      id: 20,
      amount: 5000,
      memo: "salary",
      categoryId: 1,
      budgetBaseId: 10,
      userId: 0,
    });
  });

  it("登録成功時はマイナス金額をEXPENSEとして返す", async () => {
    findCategoryByIdMock.mockResolvedValue({ id: 2 });
    createBudgetWithBaseInTxMock.mockResolvedValue({
      budgetBase: {
        id: 11,
        category_id: 2,
        amount: -3000,
        memo: "lunch",
      },
      budget: {
        id: 21,
        user_id: 0,
        date: new Date("2026-02-21T00:00:00.000Z"),
        created_at: new Date("2026-02-21T00:00:00.000Z"),
        updated_at: new Date("2026-02-21T00:00:00.000Z"),
      },
    });

    const response = await createBudget({
      date: new Date("2026-02-21T00:00:00.000Z"),
      amount: -3000,
      memo: "lunch",
      categoryId: 2,
    });

    expect(response.type).toBe("EXPENSE");
    expect(response.amount).toBe(-3000);
  });

  it("amountが0の場合はVALIDATION_ERRORを投げる", async () => {
    await expect(
      createBudget({
        date: new Date("2026-02-22T00:00:00.000Z"),
        amount: 0,
        memo: "invalid",
        categoryId: 1,
      })
    ).rejects.toEqual(
      expect.objectContaining({
        name: "DomainError",
        code: "VALIDATION_ERROR",
        message: "`budget.amount` must be a non-zero integer",
      })
    );

    expect(findCategoryByIdMock).not.toHaveBeenCalled();
    expect(createBudgetWithBaseInTxMock).not.toHaveBeenCalled();
  });

  it("categoryが存在しない場合はNOT_FOUNDを投げる", async () => {
    findCategoryByIdMock.mockResolvedValue(null);

    await expect(
      createBudget({
        date: new Date("2026-02-22T00:00:00.000Z"),
        amount: 1000,
        memo: "unknown category",
        categoryId: 999,
      })
    ).rejects.toEqual(
      expect.objectContaining({
        name: "DomainError",
        code: "NOT_FOUND",
        message: "Category not found",
      })
    );

    expect(createBudgetWithBaseInTxMock).not.toHaveBeenCalled();
  });

  it("repositoryエラーはそのまま伝播する", async () => {
    findCategoryByIdMock.mockResolvedValue({ id: 1 });
    const repositoryError = new Error("db error");
    createBudgetWithBaseInTxMock.mockRejectedValue(repositoryError);

    await expect(
      createBudget({
        date: new Date("2026-02-23T00:00:00.000Z"),
        amount: 1000,
        memo: "salary",
        categoryId: 1,
      })
    ).rejects.toBe(repositoryError);
  });
});
