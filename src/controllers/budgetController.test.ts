import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { getBudgets } from "./budgetController.js";
import * as budgetService from "../services/budgetService.js";

vi.mock("../services/budgetService.js", () => ({
  getBudgetList: vi.fn(),
}));

describe("budgetController", () => {
  const getBudgetListMock = vi.mocked(budgetService.getBudgetList);

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
});
