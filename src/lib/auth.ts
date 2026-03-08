import type { Request, Response } from "express";

const respondUnauthorized = (res: Response): void => {
  res.status(401).json({
    status: "error",
    message: "Unauthorized",
  });
};

export const resolveUserSub = (req: Request, res: Response): string | null => {
  const userSub = req.auth?.sub;
  if (!userSub) {
    respondUnauthorized(res);
    return null;
  }

  return userSub;
};
