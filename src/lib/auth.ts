import type { Request, Response } from "express";
import { sendErrorResponse } from "./errorResponse.js";

const respondUnauthorized = (
  req: Request,
  res: Response,
  reason: string
): void => {
  sendErrorResponse({
    req,
    res,
    statusCode: 401,
    message: reason,
    responseMessage: "Unauthorized",
    scope: "Auth",
  });
};

export const resolveUserSub = (req: Request, res: Response): string | null => {
  const userSub = req.auth?.sub;
  if (!userSub) {
    respondUnauthorized(req, res, "req.auth.sub is missing");
    return null;
  }

  return userSub;
};
