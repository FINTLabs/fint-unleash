/**
 * Azure AD hook for securing an Unleash server
 *
 * This example assumes that all users authenticating via
 * azure should have access. You would probably limit access
 * to users you trust, for example users within a tenant.
 *
 * The implementation assumes the following environment variables:
 *
 *  - AUTH_HOST
 *  - AUTH_CLIENT_ID
 *  - AUTH_CLIENT_SECRET
 *  - AUTH_TENANT_ID
 */

import {
  AuthenticationRequired,
  IUnleashServices,
  IUnleashConfig,
  IUser,
  RoleName,
} from "unleash-server";
import { Express } from "express";
import { Strategy as OIDCStrategy, Issuer } from "openid-client";
import passport from "passport";

export default async function createAzureAuthHandler(): Promise<
  (
    app: Express,
    config: Partial<IUnleashConfig>,
    services?: IUnleashServices,
  ) => void
> {
  const host = process.env.AUTH_HOST;
  if (host === undefined) {
    throw new Error("Missing required environment variable: AUTH_HOST");
  }
  const clientID = process.env.AUTH_CLIENT_ID;
  if (clientID === undefined) {
    throw new Error("Missing required environment variable: AUTH_CLIENT_ID");
  }

  const clientSecret = process.env.AUTH_CLIENT_SECRET;
  if (clientSecret === undefined) {
    throw new Error(
      "Missing required environment variable: AUTH_CLIENT_SECRET",
    );
  }

  const tenantID = process.env.AUTH_TENANT_ID;
  if (tenantID == undefined) {
    throw new Error("Missing required environment variable: AUTH_TENANT_ID");
  }

  const azureIssuer = await Issuer.discover(
    `https://login.microsoftonline.com/${tenantID}/v2.0`,
  );
  const azureClient = new azureIssuer.Client({
    client_id: clientID as string,
    client_secret: clientSecret,
    redirect_uris: [`${host}/api/auth/callback`],
    response_types: ["code"],
  });

  return function azureAdminOauth(
    app: Express,
    config: Partial<IUnleashConfig>,
    services?: IUnleashServices,
  ) {
    const { userService } = services!;

    passport.use(
      "azure",
      new OIDCStrategy<IUser>(
        {
          client: azureClient,
          passReqToCallback: true,
        },
        async (message, tokenSet, userinfo, done) => {
          const user = await userService.loginUserSSO({
            email: userinfo.email as string,
            name: userinfo.name as string,
            rootRole: RoleName.ADMIN,
            autoCreate: true,
          });
          done(null, user);
        },
      ),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser<IUser>((user, done) => done(null, user));

    app.get(
      "/auth/azure/login",
      passport.authenticate("azure", { scope: ["openid"] }),
    );
    app.get(
      "/api/auth/callback",
      passport.authenticate("azure", {
        successRedirect: "/",
        failureRedirect: "/auth/azure/login",
      }),
    );

    app.use("/api", (req, res, next) => {
      if (req.user) {
        next();
      } else {
        return res
          .status(401)
          .json(
            new AuthenticationRequired({
              path: "/auth/azure/login",
              type: "custom",
              message: `You have to identify yourself in order to use Unleash. Click the button and follow the instructions.`,
            }),
          )
          .end();
      }
    });
  };
}
