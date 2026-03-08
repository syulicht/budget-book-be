import { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

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

const unauthorized = (res: Response, message: string): void => {
  res.status(401).json({
    status: "error",
    message,
  });
};

export const requireCognitoAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const config = resolveCognitoAuthConfig();
  if (!config) {
    res.status(500).json({
      status: "error",
      message: "Cognito auth configuration is missing",
    });
    return;
  }

  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    unauthorized(res, "Authorization header is missing or invalid");
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
      unauthorized(res, "token_use must be access");
      return;
    }

    if (cognitoPayload.client_id !== config.appClientId) {
      unauthorized(res, "client_id does not match");
      return;
    }

    if (
      typeof cognitoPayload.sub !== "string" ||
      cognitoPayload.sub.length === 0
    ) {
      unauthorized(res, "sub claim is missing");
      return;
    }

    req.auth = { sub: cognitoPayload.sub };
    next();
  } catch (error) {
    console.error("Failed to verify Cognito token", error);
    unauthorized(res, "Invalid or expired access token");
  }
};
