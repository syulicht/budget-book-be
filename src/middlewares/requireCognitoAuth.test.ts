import type { NextFunction, Request, Response } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { requireCognitoAuth } from "./requireCognitoAuth.js";

vi.mock("jose", () => ({
  createRemoteJWKSet: vi.fn(),
  jwtVerify: vi.fn(),
}));

type ResponseSpies = {
  res: Response;
  statusSpy: ReturnType<typeof vi.fn>;
  jsonSpy: ReturnType<typeof vi.fn>;
};

const createMockResponse = (): ResponseSpies => {
  const statusSpy = vi.fn().mockReturnThis();
  const jsonSpy = vi.fn().mockReturnThis();

  return {
    res: { status: statusSpy, json: jsonSpy } as unknown as Response,
    statusSpy,
    jsonSpy,
  };
};

const originalEnv = { ...process.env };

describe("requireCognitoAuth", () => {
  const createRemoteJWKSetMock = vi.mocked(createRemoteJWKSet);
  const jwtVerifyMock = vi.mocked(jwtVerify);

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.COGNITO_REGION = "ap-northeast-1";
    process.env.COGNITO_USER_POOL_ID = "ap-northeast-1_test-pool";
    process.env.COGNITO_APP_CLIENT_ID = "test-client-id";

    createRemoteJWKSetMock.mockReturnValue(
      vi.fn() as unknown as ReturnType<typeof createRemoteJWKSet>
    );
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("設定不足の場合は500を返す", async () => {
    delete process.env.COGNITO_REGION;

    const req = { headers: {} } as Request;
    const { res, statusSpy, jsonSpy } = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await requireCognitoAuth(req, res, next);

    expect(statusSpy).toHaveBeenCalledWith(500);
    expect(jsonSpy).toHaveBeenCalledWith({
      status: "error",
      message: "Cognito auth configuration is missing",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("Authorizationヘッダーがない場合は401を返す", async () => {
    const req = { headers: {} } as Request;
    const { res, statusSpy, jsonSpy } = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await requireCognitoAuth(req, res, next);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({
      status: "error",
      message: "Authorization header is missing or invalid",
    });
    expect(jwtVerifyMock).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("token_useがaccessでない場合は401を返す", async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: {
        sub: "sub-001",
        token_use: "id",
        client_id: "test-client-id",
      },
    } as unknown as Awaited<ReturnType<typeof jwtVerify>>);

    const req = {
      headers: { authorization: "Bearer test-token" },
    } as Request;
    const { res, statusSpy, jsonSpy } = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await requireCognitoAuth(req, res, next);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({
      status: "error",
      message: "token_use must be access",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("client_idが一致しない場合は401を返す", async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: {
        sub: "sub-001",
        token_use: "access",
        client_id: "different-client-id",
      },
    } as unknown as Awaited<ReturnType<typeof jwtVerify>>);

    const req = {
      headers: { authorization: "Bearer test-token" },
    } as Request;
    const { res, statusSpy, jsonSpy } = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await requireCognitoAuth(req, res, next);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({
      status: "error",
      message: "client_id does not match",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("subがない場合は401を返す", async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: {
        token_use: "access",
        client_id: "test-client-id",
      },
    } as unknown as Awaited<ReturnType<typeof jwtVerify>>);

    const req = {
      headers: { authorization: "Bearer test-token" },
    } as Request;
    const { res, statusSpy, jsonSpy } = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await requireCognitoAuth(req, res, next);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({
      status: "error",
      message: "sub claim is missing",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("検証エラー時は401を返す", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    jwtVerifyMock.mockRejectedValue(new Error("invalid token"));

    const req = {
      headers: { authorization: "Bearer invalid-token" },
    } as Request;
    const { res, statusSpy, jsonSpy } = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await requireCognitoAuth(req, res, next);

    expect(statusSpy).toHaveBeenCalledWith(401);
    expect(jsonSpy).toHaveBeenCalledWith({
      status: "error",
      message: "Invalid or expired access token",
    });
    expect(next).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it("有効なトークンの場合はreq.auth.subを設定してnextを呼ぶ", async () => {
    jwtVerifyMock.mockResolvedValue({
      payload: {
        sub: "sub-001",
        token_use: "access",
        client_id: "test-client-id",
      },
    } as unknown as Awaited<ReturnType<typeof jwtVerify>>);

    const req = {
      headers: { authorization: "Bearer valid-token" },
    } as Request;
    const { res, statusSpy, jsonSpy } = createMockResponse();
    const next = vi.fn() as unknown as NextFunction;

    await requireCognitoAuth(req, res, next);

    expect(createRemoteJWKSetMock).toHaveBeenCalledTimes(1);
    expect(createRemoteJWKSetMock).toHaveBeenCalledWith(expect.any(URL));

    const calledUrl = createRemoteJWKSetMock.mock.calls[0]?.[0];
    expect(calledUrl?.toString()).toBe(
      "https://cognito-idp.ap-northeast-1.amazonaws.com/ap-northeast-1_test-pool/.well-known/jwks.json"
    );

    expect(statusSpy).not.toHaveBeenCalled();
    expect(jsonSpy).not.toHaveBeenCalled();
    expect(req.auth).toEqual({ sub: "sub-001" });
    expect(next).toHaveBeenCalledTimes(1);
  });
});
