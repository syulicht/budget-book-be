import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { createBudget, getBudgets } from "./budgetController.js";
import * as budgetService from "../services/budgetService.js";
import * as budgetValidator from "../validators/budgetValidator.js";

vi.mock("../services/budgetService.js", async () => {
  const actual = await vi.importActual<
    typeof import("../services/budgetService.js")
  >("../services/budgetService.js");
  return {
    ...actual,
    getBudgetList: vi.fn(),
    createBudget: vi.fn(),
  };
});

vi.mock("../validators/budgetValidator.js", () => ({
  validateCreateBudgetRequest: vi.fn(),
}));

describe("budgetController", () => {
  const getBudgetListMock = vi.mocked(budgetService.getBudgetList);
  const createBudgetServiceMock = vi.mocked(budgetService.createBudget);
  const validateCreateBudgetRequestMock = vi.mocked(
    budgetValidator.validateCreateBudgetRequest
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("予算一覧を200で返却する", async () => {
    const responseBody = {
      budgets: [
        {
          id: 2,
          date: new Date("2026-02-10T00:00:00.000Z"),
          category: { id: 1, name: "Food" },
          amount: 12000,
          memo: "cafe and snacks",
        },
      ],
    };
    getBudgetListMock.mockResolvedValue(responseBody);

    const statusSpy = vi.fn().mockReturnThis();
    const jsonSpy = vi.fn().mockReturnThis();
    const req = {} as Request;
    const res = { status: statusSpy, json: jsonSpy } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;

    await getBudgets(req, res, next);

    expect(getBudgetListMock).toHaveBeenCalledTimes(1);
    expect(statusSpy).toHaveBeenCalledWith(200);
    expect(jsonSpy).toHaveBeenCalledWith(responseBody);
    expect(next).not.toHaveBeenCalled();
  });

  it("サービスで例外が発生したときnextにエラーを渡す", async () => {
    const expectedError = new Error("failed to fetch budgets");
    getBudgetListMock.mockRejectedValue(expectedError);

    const statusSpy = vi.fn().mockReturnThis();
    const jsonSpy = vi.fn().mockReturnThis();
    const req = {} as Request;
    const res = { status: statusSpy, json: jsonSpy } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;

    await getBudgets(req, res, next);

    expect(next).toHaveBeenCalledWith(expectedError);
    expect(statusSpy).not.toHaveBeenCalled();
    expect(jsonSpy).not.toHaveBeenCalled();
  });

  it("登録バリデーションエラー時は400を返す", async () => {
    validateCreateBudgetRequestMock.mockReturnValue({
      ok: false,
      message: "`budget` is required",
    });

    const statusSpy = vi.fn().mockReturnThis();
    const jsonSpy = vi.fn().mockReturnThis();
    const req = { body: {} } as Request;
    const res = { status: statusSpy, json: jsonSpy } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;

    await createBudget(req, res, next);

    expect(createBudgetServiceMock).not.toHaveBeenCalled();
    expect(statusSpy).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalledWith({
      status: "error",
      message: "`budget` is required",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("登録成功時は201を返す", async () => {
    const parsedInput = {
      date: new Date("2026-02-15T00:00:00.000Z"),
      amount: 12000,
      memo: "salary",
      categoryId: 1,
    };
    validateCreateBudgetRequestMock.mockReturnValue({
      ok: true,
      value: parsedInput,
    });

    const createdBudget = {
      id: 5,
      type: "INCOME" as const,
      date: "2026-02-15T00:00:00.000Z",
      amount: 12000,
      memo: "salary",
      categoryId: 1,
      budgetBaseId: 7,
      userId: 0,
      createdAt: "2026-02-15T00:00:00.000Z",
      updatedAt: "2026-02-15T00:00:00.000Z",
    };
    createBudgetServiceMock.mockResolvedValue(createdBudget);

    const statusSpy = vi.fn().mockReturnThis();
    const jsonSpy = vi.fn().mockReturnThis();
    const req = { body: { budget: {} } } as Request;
    const res = { status: statusSpy, json: jsonSpy } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;

    await createBudget(req, res, next);

    expect(createBudgetServiceMock).toHaveBeenCalledWith(parsedInput);
    expect(statusSpy).toHaveBeenCalledWith(201);
    expect(jsonSpy).toHaveBeenCalledWith({
      status: "success",
      budget: createdBudget,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("サービスがNOT_FOUNDを返したときは404を返す", async () => {
    const parsedInput = {
      date: new Date("2026-02-15T00:00:00.000Z"),
      amount: -2000,
      memo: "lunch",
      categoryId: 999,
    };
    validateCreateBudgetRequestMock.mockReturnValue({
      ok: true,
      value: parsedInput,
    });
    createBudgetServiceMock.mockRejectedValue(
      new budgetService.DomainError("NOT_FOUND", "Category not found")
    );

    const statusSpy = vi.fn().mockReturnThis();
    const jsonSpy = vi.fn().mockReturnThis();
    const req = { body: { budget: {} } } as Request;
    const res = { status: statusSpy, json: jsonSpy } as unknown as Response;
    const next = vi.fn() as unknown as NextFunction;

    await createBudget(req, res, next);

    expect(statusSpy).toHaveBeenCalledWith(404);
    expect(jsonSpy).toHaveBeenCalledWith({
      status: "error",
      message: "Category not found",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
