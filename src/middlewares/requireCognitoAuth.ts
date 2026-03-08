import { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { sendErrorResponse } from "../lib/errorResponse.js";

type CognitoAuthConfig = {
  issuer: string;
  appClientId: string;
};

type CognitoAccessTokenPayload = JWTPayload & {
  token_use?: string;
  client_id?: string;
};

const resolveCognitoAuthConfig = (): CognitoAuthConfig | null => {
  const region = process.env.COGNITO_REGION;
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const appClientId = process.env.COGNITO_APP_CLIENT_ID;

  if (!region || !userPoolId || !appClientId) {
    return null;
  }

  return {
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
    appClientId,
  };
};

const extractBearerToken = (authorization?: string): string | null => {
  if (!authorization) {
    return null;
  }

  const matched = authorization.match(/^Bearer\s+(.+)$/i);
  if (!matched) {
    return null;
  }

  return matched[1].trim();
};

const unauthorized = (
  req: Request,
  res: Response,
  message: string,
  cause?: unknown
): void => {
  sendErrorResponse({
    req,
    res,
    statusCode: 401,
    message,
    scope: "Auth",
    cause,
  });
};

export const requireCognitoAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const config = resolveCognitoAuthConfig();
  if (!config) {
    sendErrorResponse({
      req,
      res,
      statusCode: 500,
      message: "Cognito auth configuration is missing",
      scope: "Auth",
    });
    return;
  }

  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    unauthorized(req, res, "Authorization header is missing or invalid");
    return;
  }

  try {
    const jwks = createRemoteJWKSet(
      new URL(`${config.issuer}/.well-known/jwks.json`)
    );
    const { payload } = await jwtVerify(token, jwks, {
      issuer: config.issuer,
    });

    const cognitoPayload = payload as CognitoAccessTokenPayload;
    if (cognitoPayload.token_use !== "access") {
      unauthorized(req, res, "token_use must be access");
      return;
    }

    if (cognitoPayload.client_id !== config.appClientId) {
      unauthorized(req, res, "client_id does not match");
      return;
    }

    if (
      typeof cognitoPayload.sub !== "string" ||
      cognitoPayload.sub.length === 0
    ) {
      unauthorized(req, res, "sub claim is missing");
      return;
    }

    req.auth = { sub: cognitoPayload.sub };
    next();
  } catch (error) {
    unauthorized(req, res, "Invalid or expired access token", error);
  }
};
