import { Request, Response, NextFunction } from "express";
import { sendErrorResponse } from "../lib/errorResponse.js";

/**
 * グローバルエラーハンドリングミドルウェア
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  sendErrorResponse({
    req,
    res,
    statusCode: 500,
    message: err.message || "Internal Server Error",
    scope: "ErrorHandler",
    cause: err,
  });
};
