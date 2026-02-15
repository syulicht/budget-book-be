import { NextFunction, Request, Response } from "express";
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
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const response = await getBudgetList();

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
  try {
    const validationResult = validateCreateBudgetRequest(req.body as unknown);
    if (!validationResult.ok) {
      res.status(400).json({
        status: "error",
        message: validationResult.message,
      });
      return;
    }

    const created = await createBudgetService(validationResult.value);

    res.status(201).json({
      status: "success",
      budget: created,
    });
  } catch (error) {
    if (error instanceof DomainError) {
      const statusCode = error.code === "NOT_FOUND" ? 404 : 400;
      res.status(statusCode).json({
        status: "error",
        message: error.message,
      });
      return;
    }

    next(error);
  }
};
