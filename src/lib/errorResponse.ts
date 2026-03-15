import type { Request, Response } from "express";

type SendErrorResponseParams = {
  req: Request;
  res: Response;
  statusCode: number;
  message: string;
  responseMessage?: string;
  scope: string;
  cause?: unknown;
};

export const sendErrorResponse = ({
  req,
  res,
  statusCode,
  message,
  responseMessage,
  scope,
  cause,
}: SendErrorResponseParams): void => {
  const logPayload: Record<string, unknown> = {
    method: req.method ?? "UNKNOWN",
    path: req.originalUrl ?? req.url ?? "UNKNOWN",
    message,
  };

  if (cause) {
    logPayload.cause = cause;
  }

  console.error(`[${scope}] ${statusCode} Error`, logPayload);

  res.status(statusCode).json({
    status: "error",
    message: responseMessage ?? message,
  });
};
