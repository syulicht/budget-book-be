import { NextFunction, Request, Response } from "express";
import { resolveUserSub } from "../lib/auth.js";
import { sendErrorResponse } from "../lib/errorResponse.js";
import {
  createBudget as createBudgetService,
  DomainError,
  getBudgetList,
} from "../services/budgetService.js";
import { validateCreateBudgetRequest } from "../validators/budgetValidator.js";

/**
 * 予算一覧取得エンドポイント
 */
export const getBudgets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userSub = resolveUserSub(req, res);
  if (!userSub) {
    return;
  }

  try {
    const response = await getBudgetList(userSub);

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createBudget = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userSub = resolveUserSub(req, res);
  if (!userSub) {
    return;
  }

  try {
    const validationResult = validateCreateBudgetRequest(req.body as unknown);
    if (!validationResult.ok) {
      sendErrorResponse({
        req,
        res,
        statusCode: 400,
        message: validationResult.message,
        scope: "BudgetController",
      });
      return;
    }

    const created = await createBudgetService(validationResult.value, userSub);

    res.status(201).json({
      status: "success",
      budget: created,
    });
  } catch (error) {
    if (error instanceof DomainError) {
      const statusCode = error.code === "NOT_FOUND" ? 404 : 400;
      sendErrorResponse({
        req,
        res,
        statusCode,
        message: error.message,
        scope: "BudgetController",
        cause: error,
      });
      return;
    }

    next(error);
  }
};
