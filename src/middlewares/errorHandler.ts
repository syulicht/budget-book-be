import { Request, Response, NextFunction } from "express";

/**
 * グローバルエラーハンドリングミドルウェア
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  res.status(500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
};
