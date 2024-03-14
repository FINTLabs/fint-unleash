import { Express } from "express";
import passport from "passport";
import { IUnleashServices } from "unleash-server";

import createAzureAuthHandler from "./azure-auth-handler";

jest.mock("openid-client", () => ({
  Strategy: jest.fn(),
  Issuer: {
    discover: jest.fn().mockResolvedValue({
      Client: jest.fn(),
    }),
  },
}));

jest.mock("passport", () => ({
  use: jest.fn(),
  initialize: jest.fn(),
  session: jest.fn(),
  authenticate: jest.fn(),
  serializeUser: jest.fn(),
  deserializeUser: jest.fn(),
}));

describe("Azure Auth Handler", () => {
  let app: Express;
  let services: IUnleashServices;

  beforeEach(() => {
    app = {} as Express;
    services = {
      userService: {
        loginUserSSO: jest.fn(),
      } as any,
    } as any;

    app.get = jest.fn();
    app.use = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if AUTH_HOST environment variable is missing", async () => {
    await expect(createAzureAuthHandler()).rejects.toThrow(
      "Missing required environment variable: AUTH_HOST",
    );
  });

  it("should throw an error if AUTH_CLIENT_ID environment variable is missing", async () => {
    process.env.AUTH_HOST = "example.com";

    await expect(createAzureAuthHandler()).rejects.toThrow(
      "Missing required environment variable: AUTH_CLIENT_ID",
    );
  });

  it("should throw an error if AUTH_CLIENT_SECRET environment variable is missing", async () => {
    process.env.AUTH_HOST = "example.com";
    process.env.AUTH_CLIENT_ID = "client_id";

    await expect(createAzureAuthHandler()).rejects.toThrow(
      "Missing required environment variable: AUTH_CLIENT_SECRET",
    );
  });

  it("should throw an error if AUTH_TENANT_ID environment variable is missing", async () => {
    process.env.AUTH_HOST = "example.com";
    process.env.AUTH_CLIENT_ID = "client_id";
    process.env.AUTH_CLIENT_SECRET = "client_secret";

    await expect(createAzureAuthHandler()).rejects.toThrow(
      "Missing required environment variable: AUTH_TENANT_ID",
    );
  });

  it("should initialize passport and configure Azure authentication", async () => {
    process.env.AUTH_HOST = "example.com";
    process.env.AUTH_CLIENT_ID = "client_id";
    process.env.AUTH_CLIENT_SECRET = "client_secret";
    process.env.AUTH_TENANT_ID = "tenant_id";

    (await createAzureAuthHandler())(app, {}, services);

    expect(passport.initialize).toHaveBeenCalled();
    expect(passport.session).toHaveBeenCalled();
    expect(passport.use).toHaveBeenCalled();
    expect(passport.serializeUser).toHaveBeenCalled();
    expect(passport.deserializeUser).toHaveBeenCalled();
  });
});
