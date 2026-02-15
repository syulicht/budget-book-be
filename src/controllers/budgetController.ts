import { NextFunction, Request, Response } from "express";
import { getBudgetList } from "../services/budgetService.js";

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
