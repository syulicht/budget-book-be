import { Request, Response } from "express";

/**
 * ヘルスチェックエンドポイント
 * サーバーの稼働状況を確認するためのシンプルなエンドポイント
 */
export const healthCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: "ok",
    message: "Server is running!!!!",
    timestamp: new Date().toISOString(),
  });
};
